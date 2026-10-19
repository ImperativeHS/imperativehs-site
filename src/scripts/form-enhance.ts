/**
 * Progressive enhancement for forms rendered by FormShell.astro: submits with
 * fetch, shows server-side validation errors inline, then goes to the thank-you
 * page. Without JavaScript the forms post normally and the endpoint redirects.
 */

interface SubmitResult {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
}

declare global {
  interface Window {
    turnstile?: { reset: (widget?: string | HTMLElement) => void };
  }
}

const GENERIC_ERROR = 'Sorry, something went wrong. Please try again or call us.';

export function enhanceForms() {
  document.querySelectorAll<HTMLFormElement>('form[data-form]').forEach((form) => {
    if (form.dataset.enhanced) return;
    form.dataset.enhanced = 'true';

    const status = form.querySelector<HTMLElement>('[data-form-status]');
    const submit = form.querySelector<HTMLButtonElement>('[data-submit]');

    const showStatus = (message: string | null) => {
      if (!status) return;
      status.textContent = message ?? '';
      status.classList.toggle('hidden', !message);
    };

    // Plain (no-JS) submissions that failed come back with ?error=1.
    if (new URLSearchParams(location.search).has('error')) {
      showStatus(
        'Sorry, we couldn’t send your request. Please check your details and try again, or call us.',
      );
    }

    form.addEventListener('input', (e) => clearFieldError(form, e.target as HTMLElement));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAllErrors(form);
      showStatus(null);

      const originalLabel = submit?.textContent ?? '';
      if (submit) {
        submit.disabled = true;
        submit.textContent = 'Sending…';
      }

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });
        const result = (await response.json().catch(() => ({ ok: false }))) as SubmitResult;

        if (result.ok) {
          location.assign(`/thank-you/?form=${form.dataset.form}`);
          return;
        }
        if (result.errors) showFieldErrors(form, result.errors);
        showStatus(result.message ?? GENERIC_ERROR);
      } catch {
        showStatus(GENERIC_ERROR);
      }

      window.turnstile?.reset();
      if (submit) {
        submit.disabled = false;
        submit.textContent = originalLabel;
      }
    });
  });
}

function showFieldErrors(form: HTMLFormElement, errors: Record<string, string>) {
  let first: HTMLElement | null = null;
  for (const [name, message] of Object.entries(errors)) {
    const field = form.querySelector<HTMLElement>(`[data-field="${CSS.escape(name)}"]`);
    if (!field) continue;
    const error = field.querySelector<HTMLElement>('[data-error]');
    if (error) {
      error.textContent = message;
      error.hidden = false;
    }
    field
      .querySelectorAll('input, select, textarea')
      .forEach((input) => input.setAttribute('aria-invalid', 'true'));
    first ??= field.querySelector<HTMLElement>('input, select, textarea');
  }
  first?.focus();
}

function clearFieldError(form: HTMLFormElement, target: HTMLElement) {
  const field = target.closest<HTMLElement>('[data-field]');
  if (!field || !form.contains(field)) return;
  const error = field.querySelector<HTMLElement>('[data-error]');
  if (error) error.hidden = true;
  field.querySelectorAll('[aria-invalid]').forEach((input) => input.removeAttribute('aria-invalid'));
}

function clearAllErrors(form: HTMLFormElement) {
  form.querySelectorAll<HTMLElement>('[data-error]').forEach((error) => (error.hidden = true));
  form.querySelectorAll('[aria-invalid]').forEach((input) => input.removeAttribute('aria-invalid'));
}
