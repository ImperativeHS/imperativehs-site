# Notes for AI assistants

Read `README.md` first. It covers the structure, content editing, forms, and deployment.

## Conventions

- Business facts (phone, address, hours, insurance) live only in `src/config/`. Never hard-code them in pages.
- New page sections go in `src/components/sections/`. Primitives (buttons, icons) go in `src/components/ui/`.
- Use the `@/` import alias for anything under `src/`.
- Style with Tailwind utilities and the tokens in `src/styles/global.css` (`brand-*`, `ink`, `muted`, `line`, `surface`, `sand`).
  Don't introduce new colors ad hoc.
- In `.astro` templates, Astro drops whitespace that is only a line break next to an inline element. When a link
  follows or precedes text on another line, add `{' '}` explicitly.
- Every page passes `title` and `description` to `BaseLayout`, plus breadcrumbs/JSON-LD where relevant
  (`src/lib/seo/structured-data.ts`).
- Forms: add fields in `src/lib/forms/definitions.ts` (schema + email rows) and in the page. Keep them free of
  clinical details.
- Don't add third-party trackers, ad pixels, or chat widgets. This is a healthcare site, and anything that sees
  form or page data needs a BAA.
- Respect `prefers-reduced-motion`; keep animation subtle.

## Before opening a PR

```sh
npm run format && npm run check && npm run build
```

Branch names: `feat/…`, `fix/…`, `content/…`, `chore/…`. Don't push to `main` directly.
