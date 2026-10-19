/**
 * Form submission endpoint: POST /api/forms/{appointment|referral|contact}/
 *
 * Responds with JSON when called by the enhanced form script (Accept: application/json),
 * and with a redirect for plain HTML form posts so the forms work without JavaScript.
 */
import type { APIRoute } from 'astro';
import { HONEYPOT_FIELD, formDefinitions, isFormName, type FormDefinition } from '@/lib/forms/definitions';
import { sendNotification } from '@/lib/forms/notify';
import { verifyTurnstile } from '@/lib/forms/turnstile';
import type { z } from 'astro/zod';

export const prerender = false;

const MAX_BODY_BYTES = 20_000;

export const POST: APIRoute = async ({ params, request, redirect }) => {
  const wantsJson = request.headers.get('accept')?.includes('application/json') ?? false;
  const formName = params.form;

  const respond = (
    status: number,
    body: { ok: boolean; message?: string; errors?: Record<string, string> },
  ) => {
    if (wantsJson) return Response.json(body, { status });
    if (body.ok) return redirect(`/thank-you/?form=${formName}`, 303);
    const back = new URL(request.headers.get('referer') ?? '/', request.url);
    back.searchParams.set('error', '1');
    return redirect(`${back.pathname}${back.search}#form`, 303);
  };

  if (!isFormName(formName)) return respond(404, { ok: false, message: 'Unknown form.' });
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
    return respond(413, { ok: false, message: 'Submission too large.' });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return respond(400, { ok: false, message: 'Invalid submission.' });
  }

  // Bots that fill the hidden field get a fake success.
  if (String(formData.get(HONEYPOT_FIELD) ?? '').length > 0) return respond(200, { ok: true });

  const turnstileToken = formData.get('cf-turnstile-response');
  const human = await verifyTurnstile(
    typeof turnstileToken === 'string' ? turnstileToken : null,
    request.headers.get('cf-connecting-ip'),
  );
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
