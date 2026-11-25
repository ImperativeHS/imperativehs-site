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
  // No server sessions are used; this also stops the adapter from requiring a KV namespace.
  session: false,
  // Load pages in the background when a link is hovered or scrolls into view, so clicks feel instant.
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
  security: {
    // Astro adds a CSP <meta> tag with hashes for its own scripts and styles. Anything loaded from
    // another origin must be listed here. frame-ancestors can't be set in a meta tag; see public/_headers.
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        'frame-src https://challenges.cloudflare.com',
        "form-action 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        'upgrade-insecure-requests',
      ],
      scriptDirective: { resources: ["'self'", 'https://challenges.cloudflare.com'] },
    },
  },
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
