# imperativehs.com

Website for Imperative Healthcare Services, built with [Astro](https://astro.build) and
[Tailwind CSS](https://tailwindcss.com), deployed to Cloudflare Workers.

Pages are prerendered to static HTML. The only server code is the form endpoint
(`src/pages/api/forms/[form].ts`), which emails submissions to the office via Resend.

## Getting started

Requires Node 22+.

```sh
npm install
cp .env.example .dev.vars   # optional: form email settings for local testing
npm run dev                 # http://localhost:4321
```

Without `RESEND_API_KEY`, form submissions in dev are logged to the terminal instead of emailed.

| Script            | What it does                                                  |
| ----------------- | ------------------------------------------------------------- |
| `npm run dev`     | Local dev server                                              |
| `npm run build`   | Production build into `dist/`                                 |
| `npm run preview` | Build, then run it in the Cloudflare runtime (`wrangler dev`) |
| `npm run check`   | Type-check `.astro` and `.ts` files                           |
| `npm run format`  | Format everything with Prettier                               |
| `npm run deploy`  | Build and deploy with Wrangler (CI normally does this)        |

## Project structure

```
src/
  config/          Business details, navigation, insurance list — edit contact info here
  content/
    services/      One Markdown file per service page (/services/<file-name>/)
    blog/          Blog posts (/blog/<file-name>/)
  content.config.ts  Frontmatter schemas for the content above
  components/
    layout/        Header, footer, mobile call bar
    sections/      Reusable page sections (hero, CTA band, FAQ, service cards…)
    forms/         Form shell and field components
    ui/            Primitives: Button, Icon, Section, SectionHeading
    seo/           <head> tags and JSON-LD
  layouts/         BaseLayout wraps every page
  lib/
    content.ts     Collection helpers (sorting, URLs, dates)
    forms/         Form schemas, email sending, spam check
    seo/           schema.org structured-data builders
  pages/           Routes (file-based)
  scripts/         Client-side TypeScript
  styles/          Tailwind entry point and design tokens
public/
  _redirects       301s from old WordPress URLs
  _headers         Security and caching headers
```

## Editing content

- **Phone, email, address, hours:** `src/config/site.ts`.
- **Insurance plans:** `src/config/insurance.ts`.
- **Services:** edit the Markdown in `src/content/services/`. Frontmatter fields are documented in
  `src/content.config.ts`. Adding a file adds a page, a nav link, and a card automatically.
- **Blog posts:** add a Markdown file to `src/content/blog/`:

  ```md
  ---
  title: 'Post title'
  description: 'One or two sentences for search results (~155 characters).'
  pubDate: 2026-10-20
  category: 'Mental Health'
  draft: false
  ---

  Post body in Markdown. Start headings at `##` (the title is the H1).
  ```

- **Images:** put them in `src/assets/images/` and use Astro's `<Image />` so they're resized and
  converted to WebP at build time. Always write meaningful `alt` text.

## Forms

Three forms post to `/api/forms/{appointment|referral|contact}/`:

1. `src/lib/forms/definitions.ts` defines fields, validation (Zod), and the email layout.
2. The endpoint validates, checks the honeypot (and Turnstile, if configured), then calls
   `src/lib/forms/notify.ts` to send the email.
3. `src/scripts/form-enhance.ts` submits with `fetch` and shows inline errors. Without JavaScript,
   the forms still work through a normal POST and redirect.

The forms collect contact details only and ask people not to include medical information.

> **HIPAA note:** Confirm with Resend whether it will sign a Business Associate Agreement (BAA); a competitor says it does not. The
> destination mailbox also needs to be BAA-covered. Even contact details on an appointment request
> to a mental health practice count as protected health information. Before launch, either confirm
> BAAs are in place or switch `notify.ts` to a provider that signs one (e.g. Paubox). It's a
> single-file change.

### Environment variables

Set these as **secrets** on the Cloudflare Worker (Dashboard → Workers → imperativehs-site → Settings
→ Variables and Secrets) or with `npx wrangler secret put NAME`. For local dev, put them in `.dev.vars`.

| Name                        | Purpose                                                                                                   |
| --------------------------- | --------------------------------------------------------------------------------------------------------- |
| `RESEND_API_KEY`            | Resend API key                                                                                            |
| `FORM_TO_EMAIL`             | Where submissions go (comma-separate for several)                                                         |
| `FORM_FROM_EMAIL`           | Sender, e.g. `Imperative Healthcare Website <forms@imperativehs.com>` (domain must be verified in Resend) |
| `TURNSTILE_SECRET_KEY`      | Optional Cloudflare Turnstile secret                                                                      |
| `PUBLIC_TURNSTILE_SITE_KEY` | Optional Turnstile site key (build-time; set it as a build variable too)                                  |

## Deployment (Cloudflare Workers)

1. In Cloudflare, go to **Workers & Pages → Create → Import a repository** and pick this repo.
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
2. Add the secrets above.
3. Each pull request gets a preview URL. Merging to `main` deploys to production.
4. **Going live:** add `imperativehs.com` and `www.imperativehs.com` as custom domains on the Worker.
   This means moving the domain's DNS to Cloudflare (nameserver change at GoDaddy). **Copy every
   existing DNS record first, especially MX/TXT records for email**, and confirm they exist in
   Cloudflare before switching nameservers.
5. Enable **Web Analytics** for the site in Cloudflare (cookie-free, no ad tracking).

The Astro adapter also provisions a `SESSION` KV namespace on first deploy. The site doesn't use
sessions, so this is harmless and free.

## Git workflow

- `main` is production. Don't commit to it directly after launch.
- Branch per change: `feat/…`, `fix/…`, `content/…`, `chore/…`.
- Open a pull request. CI runs formatting, type checks, and the build. Check the Cloudflare
  preview link before merging.
- Squash-merge, and keep commit messages in the imperative mood ("Add insurance FAQ").

## Open items

Unresolved content, compliance, and launch decisions are tracked in
[`docs/open-items.md`](docs/open-items.md).
