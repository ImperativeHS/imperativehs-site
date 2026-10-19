/**
 * Sends form submissions to the office inbox via Resend (https://resend.com).
 *
 * This is the only module that knows about the email provider. To switch
 * providers (e.g. to one that signs a HIPAA BAA), replace `sendWithResend`.
 */
import { FORM_FROM_EMAIL, FORM_TO_EMAIL, RESEND_API_KEY } from 'astro:env/server';

export interface Notification {
  subject: string;
  rows: [label: string, value: string][];
  replyTo?: string;
}

export class NotifyConfigError extends Error {}

export async function sendNotification(notification: Notification): Promise<void> {
  if (!RESEND_API_KEY || !FORM_TO_EMAIL || !FORM_FROM_EMAIL) {
    if (import.meta.env.DEV) {
      console.info('[forms] Email not configured; submission logged instead:\n', renderText(notification));
      return;
    }
    throw new NotifyConfigError(
      'Form email is not configured (RESEND_API_KEY, FORM_TO_EMAIL, FORM_FROM_EMAIL).',
    );
  }
  await sendWithResend(notification, { apiKey: RESEND_API_KEY, to: FORM_TO_EMAIL, from: FORM_FROM_EMAIL });
}

async function sendWithResend(
  notification: Notification,
  config: { apiKey: string; to: string; from: string },
): Promise<void> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: config.from,
      to: config.to.split(',').map((address) => address.trim()),
      subject: notification.subject,
      text: renderText(notification),
      html: renderHtml(notification),
      ...(notification.replyTo && { reply_to: notification.replyTo }),
    }),
  });
  if (!response.ok) {
    throw new Error(`Resend responded ${response.status}: ${await response.text()}`);
  }
}

function renderText({ subject, rows }: Notification): string {
  return [
    subject,
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    'Sent from imperativehs.com',
  ].join('\n');
}

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );

function renderHtml({ subject, rows }: Notification): string {
  const body = rows
    .map(
      ([label, value]) =>
        `<tr><th align="left" valign="top" style="padding:6px 16px 6px 0;color:#5c5163;font-weight:600">${escapeHtml(label)}</th>` +
        `<td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
    )
    .join('');
  return (
    `<div style="font-family:system-ui,sans-serif;font-size:15px;color:#24182a">` +
    `<h2 style="margin:0 0 16px">${escapeHtml(subject)}</h2>` +
    `<table cellpadding="0" cellspacing="0">${body}</table>` +
    `<p style="margin-top:24px;color:#5c5163;font-size:13px">Sent from imperativehs.com</p></div>`
  );
}
