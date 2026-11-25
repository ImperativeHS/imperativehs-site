/**
 * Form submission endpoint: POST /api/forms/{appointment|referral|contact}/
 *
 * Responds with JSON when called by the enhanced form script (Accept: application/json),
 * and with a redirect for plain HTML form posts so the forms work without JavaScript.
 * Cross-site posts are rejected by Astro's origin check (`security.checkOrigin`, on by default).
 */
import type { APIRoute } from 'astro';
import {
  HONEYPOT_FIELD,
  formDefinitions,
  isFormName,
  type FormDefinition,
  type FormName,
} from '@/lib/forms/definitions';
import { sendNotification } from '@/lib/forms/notify';
import { verifyTurnstile } from '@/lib/forms/turnstile';
import type { z } from 'astro/zod';

export const prerender = false;

const MAX_BODY_BYTES = 20_000;
const ALLOWED_TYPES = ['application/x-www-form-urlencoded', 'multipart/form-data'];

/** Where a no-JS submission returns to on error. Never derived from request headers. */
const FORM_PAGES: Record<FormName, string> = {
  appointment: '/request-appointment/',
  referral: '/referrals/',
  contact: '/contact/',
};

const NO_STORE = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };

type Body = { ok: boolean; message?: string; errors?: Record<string, string> };

export const POST: APIRoute = async ({ params, request }) => {
  const wantsJson = request.headers.get('accept')?.includes('application/json') ?? false;
  const formName = isFormName(params.form) ? params.form : undefined;

  const respond = (status: number, body: Body) => {
    if (wantsJson) return Response.json(body, { status, headers: NO_STORE });
    const location = body.ok
      ? `/thank-you/?form=${formName}`
      : `${formName ? FORM_PAGES[formName] : '/'}?error=1#form`;
    return new Response(null, { status: 303, headers: { ...NO_STORE, Location: location } });
  };

  if (!formName) return respond(404, { ok: false, message: 'Unknown form.' });

  const contentType = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() ?? '';
  if (!ALLOWED_TYPES.includes(contentType)) {
    return respond(415, { ok: false, message: 'Unsupported submission format.' });
  }

  // Enforce the size limit on the bytes actually received, not just the Content-Length header.
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
    return respond(413, { ok: false, message: 'Submission too large.' });
  }
  let formData: FormData;
  try {
    const body = await request.arrayBuffer();
    if (body.byteLength > MAX_BODY_BYTES)
      return respond(413, { ok: false, message: 'Submission too large.' });
    formData = await new Response(body, {
      headers: { 'content-type': request.headers.get('content-type')! },
    }).formData();
  } catch {
    return respond(400, { ok: false, message: 'Invalid submission.' });
  }

  // Bots that fill the hidden field get a fake success.
  if (String(formData.get(HONEYPOT_FIELD) ?? '').length > 0) return respond(200, { ok: true });

  const turnstileToken = formData.get('cf-turnstile-response');
  let human: boolean;
  try {
    human = await verifyTurnstile(
      typeof turnstileToken === 'string' ? turnstileToken : null,
      request.headers.get('cf-connecting-ip'),
    );
  } catch (error) {
    console.error('[forms] Spam check unavailable:', error instanceof Error ? error.message : error);
    return respond(503, {
      ok: false,
      message: 'Sorry, we couldn’t send your request right now. Please call us instead.',
    });
  }
  if (!human) {
    return respond(400, { ok: false, message: 'Please complete the spam check and try again.' });
  }

  const definition: FormDefinition<z.ZodType> = formDefinitions[formName];
  const fields = Object.fromEntries(
    [...formData.entries()].filter(([, value]) => typeof value === 'string') as [string, string][],
  );
  const parsed = definition.schema.safeParse(fields);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form');
      errors[key] ??= issue.message;
    }
    return respond(422, { ok: false, message: 'Please check the highlighted fields.', errors });
  }

  try {
    await sendNotification({
      subject: definition.subject,
      rows: definition.rows(parsed.data),
      replyTo: definition.replyTo?.(parsed.data),
    });
  } catch (error) {
    // Log the failure without the submitted values.
    console.error(
      `[forms] Failed to send ${formName} notification:`,
      error instanceof Error ? error.message : error,
    );
    return respond(500, {
      ok: false,
      message: 'Sorry, we couldn’t send your request. Please call us instead.',
    });
  }

  return respond(200, { ok: true });
};
