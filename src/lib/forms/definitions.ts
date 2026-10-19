/**
 * Form definitions shared by the form components (option lists, field names)
 * and the submission endpoint (validation, email layout).
 *
 * Forms intentionally collect only what staff need to call someone back.
 * Clinical details are discussed by phone, not sent through the website.
 */
import { z } from 'astro/zod';

export type Option = { value: string; label: string };

const toEnum = (options: readonly Option[]) =>
  z.enum(options.map((o) => o.value) as [string, ...string[]], { error: 'Please choose an option.' });
const labelFor = (options: readonly Option[], value: string) =>
  options.find((o) => o.value === value)?.label ?? value;

export const SERVICE_OPTIONS = [
  { value: 'mental-health', label: 'Outpatient mental health (therapy, psychiatry)' },
  { value: 'prp', label: 'Psychiatric rehabilitation program (PRP)' },
  { value: 'sud', label: 'Substance use treatment' },
  { value: 'rsa', label: 'In-home care (RSA)' },
  { value: 'not-sure', label: 'Not sure yet' },
] as const satisfies Option[];

export const CONTACT_METHOD_OPTIONS = [
  { value: 'phone', label: 'Phone call' },
  { value: 'text', label: 'Text message' },
  { value: 'email', label: 'Email' },
] as const satisfies Option[];

export const FOR_WHOM_OPTIONS = [
  { value: 'self', label: 'Myself' },
  { value: 'child', label: 'My child' },
  { value: 'other', label: 'Someone else' },
] as const satisfies Option[];

export const BEST_TIME_OPTIONS = [
  { value: 'any', label: 'Any time' },
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
] as const satisfies Option[];

const name = z.string().trim().min(2, 'Please enter a name.').max(120);
const phone = z
  .string()
  .trim()
  .min(7, 'Please enter a phone number.')
  .max(30)
  .regex(/^[0-9+().\-\s]+$/, 'Please enter a valid phone number.');
const email = z.string().trim().max(200).pipe(z.email('Please enter a valid email address.'));
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || undefined);
const optionalEmail = z
  .string()
  .trim()
  .max(200)
  .optional()
  .transform((v) => v || undefined)
  .pipe(z.email('Please enter a valid email address.').optional());
const consent = (message: string) => z.literal('on', { error: message });

export interface FormDefinition<S extends z.ZodType> {
  /** Email subject. Keep it generic: no names or health details. */
  subject: string;
  schema: S;
  /** Label/value pairs for the notification email, in display order. */
  rows(data: z.output<S>): [label: string, value: string][];
  replyTo?(data: z.output<S>): string | undefined;
}

const defineForm = <S extends z.ZodType>(definition: FormDefinition<S>) => definition;

export const formDefinitions = {
  appointment: defineForm({
    subject: 'New appointment request',
    schema: z
      .object({
        name,
        phone,
        email: optionalEmail,
        contactMethod: toEnum(CONTACT_METHOD_OPTIONS),
        forWhom: toEnum(FOR_WHOM_OPTIONS),
        service: toEnum(SERVICE_OPTIONS),
        bestTime: toEnum(BEST_TIME_OPTIONS).default('any'),
        consent: consent('Please confirm we can contact you.'),
      })
      .refine((d) => d.contactMethod !== 'email' || d.email, {
        path: ['email'],
        message: 'Please enter an email address, or choose another way to reach you.',
      }),
    rows: (d) => [
      ['Name', d.name],
      ['Phone', d.phone],
      ['Email', d.email ?? '—'],
      ['Preferred contact', labelFor(CONTACT_METHOD_OPTIONS, d.contactMethod)],
      ['Best time to reach', labelFor(BEST_TIME_OPTIONS, d.bestTime)],
      ['Appointment for', labelFor(FOR_WHOM_OPTIONS, d.forWhom)],
      ['Service', labelFor(SERVICE_OPTIONS, d.service)],
    ],
    replyTo: (d) => d.email,
  }),

  referral: defineForm({
    subject: 'New client referral',
    schema: z.object({
      referrerName: name,
      referrerOrganization: optionalText(160),
      referrerPhone: phone,
      referrerEmail: email,
      clientName: name,
      clientPhone: phone,
      service: toEnum(SERVICE_OPTIONS),
      consent: consent('Please confirm the client has agreed to be contacted.'),
    }),
    rows: (d) => [
      ['Referred by', d.referrerName],
      ['Organization', d.referrerOrganization ?? '—'],
      ['Referrer phone', d.referrerPhone],
      ['Referrer email', d.referrerEmail],
      ['Client name', d.clientName],
      ['Client phone', d.clientPhone],
      ['Service', labelFor(SERVICE_OPTIONS, d.service)],
      ['Client agreed to be contacted', 'Yes'],
    ],
    replyTo: (d) => d.referrerEmail,
  }),

  contact: defineForm({
    subject: 'New website message',
    schema: z.object({
      name,
      email,
      phone: optionalText(30),
      message: z.string().trim().min(5, 'Please enter a message.').max(2000),
    }),
    rows: (d) => [
      ['Name', d.name],
      ['Email', d.email],
      ['Phone', d.phone ?? '—'],
      ['Message', d.message],
    ],
    replyTo: (d) => d.email,
  }),
};

export type FormName = keyof typeof formDefinitions;
export const isFormName = (value: string | undefined): value is FormName =>
  !!value && Object.hasOwn(formDefinitions, value);

/** Hidden field that should stay empty; bots tend to fill it. */
export const HONEYPOT_FIELD = 'website';
