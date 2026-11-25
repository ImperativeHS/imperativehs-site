# Notes for AI assistants

Read `README.md` first. It covers the structure, content editing, forms, and deployment.

## Conventions

- Business facts (phone, address, hours, insurance) live only in `src/config/`. Never hard-code them in pages.
- New page sections go in `src/components/sections/`. Primitives (buttons, icons) go in `src/components/ui/`.
- Use the `@/` import alias for anything under `src/`.
- The design follows the original imperativehs.com (Divi) site: Oswald headings/buttons in caps, Raleway body text,
  purple/magenta color blocks, orange accent rules. Keep new sections in that style.
- Style with Tailwind utilities and the tokens in `src/styles/global.css` (`purple`, `magenta`, `sky`, `blush`,
  `orange`, `mist`, `cloud`, `plum`, `field`, `ink`, `muted`, `line`). Don't introduce new colors ad hoc.
- In `.astro` templates, Astro drops whitespace that is only a line break next to an inline element. When a link
  follows or precedes text on another line, add `{' '}` explicitly.
- Every page passes `title` and `description` to `BaseLayout`, plus breadcrumbs/JSON-LD where relevant
  (`src/lib/seo/structured-data.ts`).
- Forms: add fields in `src/lib/forms/definitions.ts` (schema + email rows) and in the page. Keep them free of
  clinical details.
- Don't add third-party trackers, ad pixels, or chat widgets. This is a healthcare site, and anything that sees
  form or page data needs a BAA.
- Respect `prefers-reduced-motion`; keep animation subtle.
- A Content Security Policy is enforced in production: no inline `style="…"` attributes or unprocessed inline
  scripts. New third-party origins must be added to `security.csp` in `astro.config.mjs`. Test with
  `npm run preview`, since the policy is off in `npm run dev`.

## Before opening a PR

```sh
npm run format && npm run check && npm run build
```

Branch names: `feat/…`, `fix/…`, `content/…`, `chore/…`. Don't push to `main` directly.
