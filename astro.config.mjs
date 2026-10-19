// @ts-check
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, envField } from 'astro/config';

// Pages excluded from the sitemap (utility pages that are also marked noindex).
const SITEMAP_EXCLUDE = ['/thank-you/'];

export default defineConfig({
  site: 'https://imperativehs.com',
  trailingSlash: 'always',
  // Everything is prerendered to static HTML except routes that opt out
  // with `export const prerender = false` (the form endpoint).
  output: 'static',
  adapter: cloudflare({ imageService: 'compile', prerenderEnvironment: 'node' }),
  integrations: [
    sitemap({
      filter: (page) => !SITEMAP_EXCLUDE.some((path) => page.endsWith(path)),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  env: {
    schema: {
      // Form notifications (see src/lib/forms/notify.ts).
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      FORM_TO_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      FORM_FROM_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Cloudflare Turnstile spam protection. Both must be set to enable it.
      TURNSTILE_SECRET_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      PUBLIC_TURNSTILE_SITE_KEY: envField.string({ context: 'client', access: 'public', optional: true }),
    },
  },
});
