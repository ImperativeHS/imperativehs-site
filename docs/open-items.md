# Open items

Decisions and facts to pin down. Check items off (or delete them) as they're resolved, and note where
the answer was applied. Search the code for `TODO(content)` to find the spots each item affects.

## Content to confirm

- [ ] **Insurance list:** confirm with billing (`src/config/insurance.ts`). It was transcribed from logos on
      the old site. Open questions: what the "DC Medicare" logo meant (possibly a DC Medicaid managed-care
      plan?), which Cigna/UHC Medicare products, and any plans missing from the old site.
- [ ] **Service areas:** are DC and Virginia served in person, by telehealth only, or not at all?
      (`src/config/site.ts` → `serviceAreas`)
- [ ] **Provider wording:** the old site said "our psychiatrists". The new copy says "psychiatric providers".
      Confirm which is accurate, and whether any psychiatrists or psychologists are on staff.
- [ ] **Team page:** only Dr. Eruanga is listed. Add other clinicians if wanted (name, credentials, photo).
- [ ] **Response time:** if staff can commit to one (e.g. "within 1 business day"), add it to the forms and
      the "What to expect" section. It converts better than "soon".
- [ ] **Telehealth:** is telehealth offered for outpatient mental health? The PRP and SUD pages mention
      virtual sessions; the mental health page doesn't.
- [ ] **New patients:** add an "Accepting new patients" line if true.
- [ ] **Social links:** Facebook/Instagram/YouTube icons on the old site didn't link anywhere. Provide URLs
      or leave them out.
- [ ] **Blog review:** 34 posts were migrated as-is (one off-topic seizure post dropped, all stock images
      removed). Several say "our psychiatrists". Prune or edit as needed (`src/content/blog/`).
- [ ] **Photos:** office, team, and any real photography (`src/assets/images/`).
- [ ] **Stock photo licenses:** the new site reuses the old site's stock photos (`src/assets/images/site/`).
      Confirm with whoever built the old site that they were licensed for IHS. Two old-site images were left
      out because their file names look like unlicensed previews (`gettyimages-919539204-612x612` and an Adobe
      Stock `1000_F_…` file).
- [ ] **Testimonials:** the old home page showed client reviews (e.g. "Kenneth Liu", "Jennifer White") with
      stock-looking headshots. They were not carried over. If they are real, with permission to publish,
      they can be added back; invented or paid-for-but-undisclosed reviews break FTC rules.

## Compliance / vendors

- [ ] **Resend BAA:** ask Resend whether it will sign a BAA. If not, switch `src/lib/forms/notify.ts` to a
      provider that will (e.g. Paubox).
- [ ] **Inbox BAA:** confirm the mailbox that receives form emails (`info@imperativehs.com`?) is on a plan
      with a BAA (Google Workspace and Microsoft 365 business plans offer one).
- [ ] **Notice of Privacy Practices:** publish or link it from `/privacy/` (`src/pages/privacy/index.astro`)
      and have the privacy page reviewed.
- [ ] **Lovable apps:** check whether the screening tool (`intake.imperativehs.com`) and its database are
      covered by a BAA, since people enter PHQ-9/GAD-7 answers there.

- [ ] **Spam protection (Turnstile):** create a free Turnstile widget in Cloudflare (Dashboard → Turnstile)
      for `imperativehs.com` and add `PUBLIC_TURNSTILE_SITE_KEY` (build variable) and
      `TURNSTILE_SECRET_KEY` (secret) to the Worker. The forms switch it on automatically.
- [ ] **Rate limiting:** once the domain is on Cloudflare, add a WAF rate-limiting rule for
      `/api/forms/*` (e.g. 5 requests per minute per IP). The free plan includes one rule.
- [ ] **GitHub branch protection:** require a pull request and passing CI before merging to `main`
      (Settings → Branches → Add rule). Also decide whether the repo should be private.
- [ ] **Known build-time advisory:** `npm audit` reports a moderate issue in `postcss-selector-parser`
      (via `@tailwindcss/typography`). It only runs during the build, not on the live site; Dependabot
      will pick up the fix when one is released.

## Integrations (later)

- [ ] **Zocdoc "Book online" button:** Zocdoc offers one for practice websites. Could be added as a link or
      button on `/request-appointment/`.
- [ ] **ICANotes:** ask the ICANotes rep whether they offer an embeddable appointment-request or intake form.
- [ ] **Submissions dashboard:** revisit once form volume is known.
- [ ] **Review/comment widget:** a click-to-comment feedback tool for reviewers, loaded on preview links
      only (never production). Waiting on which tool to use.

## Launch checklist

- [ ] Close the earlier redesign PR (#1, `feat/visual-refresh`). It was replaced by the classic-design
      branch, which keeps the original site's look.

- [ ] Connect the repo to Cloudflare Workers (see README → Deployment) and add secrets.
- [ ] Verify the sending domain in Resend (DNS records), then submit each form on the preview URL.
- [ ] Copy all DNS records from GoDaddy (especially MX/TXT for email) into Cloudflare before switching
      nameservers.
- [ ] After go-live: spot-check old URLs redirect (see `public/_redirects`), submit the sitemap in Google
      Search Console, and update the Google Business Profile website link if needed.

## Old site (WordPress): unrelated pages, questions first

These pages are live on imperativehs.com but show other organizations' names, emails, or addresses. Don't
remove anything until the questions below are answered.

| Page                                                                             | What it shows                                                                            |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| https://imperativehs.com/schedule-an-appointment/                                | Appointment page listing `tdkintegratedhealth@gmail.com`, (301) 262-1637, (301) 615-3449 |
| https://imperativehs.com/resources/                                              | NIH resource links; `tdkintegratedhealth@gmail.com`                                      |
| https://imperativehs.com/schedule-appointment/                                   | "Become a Champion": We R Champions child placing agency (`werchampions2020@gmail.com`)  |
| https://imperativehs.com/donation/                                               | Donation page for We R Champions                                                         |
| https://imperativehs.com/careers/                                                | Careers page; `werchampions2020@gmail.com`                                               |
| https://imperativehs.com/sign-up/                                                | Sign-up with a Houston, TX address (7417 Navasota St); `werchampions2020@gmail.com`      |
| https://imperativehs.com/online-training/                                        | Texas DFPS caregiver medication training; `werchampions2020@gmail.com`                   |
| https://imperativehs.com/d2/                                                     | Online donation for King's Chapel Baltimore (`kingschapelmd@gmail.com`)                  |
| https://imperativehs.com/insurance/                                              | Insurance page for Manitowoc / Fond du Lac, WI; `shalommedinc@gmail.com`                 |
| https://imperativehs.com/our-team/                                               | Bio of Dr. Adetunji Adejumo; `shalommedinc@gmail.com`                                    |
| https://imperativehs.com/forms/                                                  | Downloadable patient forms; `shalommedinc@gmail.com`                                     |
| https://imperativehs.com/knowledge-center/                                       | Coronavirus / infection video gallery; `shalommedinc@gmail.com`                          |
| https://imperativehs.com/hmn/                                                    | NCLEX review program                                                                     |
| https://imperativehs.com/login-register/, https://imperativehs.com/registration/ | Public WordPress account sign-up forms                                                   |
| https://imperativehs.com/slider/, https://imperativehs.com/forms-2/              | Empty leftover pages                                                                     |

Questions:

- [ ] Are any of these organizations related to IHS (shared owners, partners, a sister practice)? Should any
      content be kept or moved to its own site?
- [ ] Who built or manages the WordPress site, and do they reuse it as a template for other clients?
- [ ] Do the other practices know these pages are public on imperativehs.com, and are any of their forms
      still receiving submissions (e.g. `/schedule-an-appointment/`)?
- [ ] Does anyone use the WordPress login/registration pages?
- [ ] Decide per page: unpublish, keep, or move elsewhere.

The new site currently 301-redirects all of these URLs to the home page (`public/_redirects`, "Retired pages").
Update those rules if any page should be kept or sent somewhere else.
