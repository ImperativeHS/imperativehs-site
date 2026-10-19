/**
 * Cloudflare Turnstile verification. Disabled (always passes) until both
 * TURNSTILE_SECRET_KEY and PUBLIC_TURNSTILE_SITE_KEY are set.
 */
import { PUBLIC_TURNSTILE_SITE_KEY } from 'astro:env/client';
import { TURNSTILE_SECRET_KEY } from 'astro:env/server';

export const turnstileEnabled = Boolean(TURNSTILE_SECRET_KEY && PUBLIC_TURNSTILE_SITE_KEY);

export async function verifyTurnstile(token: string | null, remoteIp: string | null): Promise<boolean> {
  if (!turnstileEnabled) return true;
  if (!token) return false;

  const body = new FormData();
  body.append('secret', TURNSTILE_SECRET_KEY!);
  body.append('response', token);
  if (remoteIp) body.append('remoteip', remoteIp);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });
  const result = (await response.json()) as { success?: boolean };
  return result.success === true;
}
