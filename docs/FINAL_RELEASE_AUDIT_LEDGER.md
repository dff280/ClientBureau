# Client Bureau Final Release Audit Ledger

This ledger is the source of truth for the final public-release hardening passes. A category is not complete unless it has command evidence, browser evidence, privacy/security evidence, and any remaining owner actions recorded here.

## Baseline

| Item | Evidence |
| --- | --- |
| Baseline date | 2026-06-18 |
| Prompt | 00 - Release truth, environment identity, and audit baseline |
| Branch | `codex/release-truth-baseline` |
| Starting commit | `196a519c407fd4a9109b90fcc2a8bf505b9b4214` (`196a519 Align live verifier privacy wording`) |
| Package version | `0.4.2` |
| Node / npm | `v22.17.1` / `11.13.0` |
| Local state before branch | Clean `main`, synced to `origin/main` |
| Prompt pack | `C:\Users\MikeM\.codex\attachments\35f11181-8170-4b97-a2d3-f5cb8be3d7f6\pasted-text.txt` |

## Release Identity

| Surface | Version | Commit | Branch | Result |
| --- | --- | --- | --- | --- |
| Local HEAD | `0.4.2` | `196a519c407fd4a9109b90fcc2a8bf505b9b4214` | `codex/release-truth-baseline` from `main` | Exact baseline |
| `origin/main` | `0.4.2` | `196a519c407fd4a9109b90fcc2a8bf505b9b4214` | `main` | Exact match |
| Live `/api/version` | `0.4.2` | `196a519c407fd4a9109b90fcc2a8bf505b9b4214` | `main` | Exact match |

Live `/api/version` returned `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0`. Result category: exact match.

## Health And Readiness

| Check | Evidence | Result |
| --- | --- | --- |
| Live `/api/health` status | `status: ok` | Pass |
| Core Supabase readiness | `coreLiveReady: true`, 10/10 core tables | Pass |
| Platform Supabase readiness | `platformCanUseSupabase: true`, 39/39 platform tables, 78/78 required columns | Pass |
| Optional saved-search/search analytics columns | 4/4 ready | Pass |
| Data modes | `DATA_MODE=supabase`, `PLATFORM_FEATURE_DATA_MODE=supabase` as reported by health | Pass |
| Stripe | `stripeConfigured: false`, `stripeWebhookConfigured: false` | Expected deferred owner action |
| Health cache headers | `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0` | Pass |

No secrets or full environment dumps were recorded.

## Route And Crawl Inventory

| Inventory | Evidence |
| --- | --- |
| App Router page routes | 65 `page.tsx` files found under `src/app` |
| Route handlers | 25 `route.ts` files found under `src/app` |
| Inventory verifier | `npm run route:check` passed inside `npm run verify:local` |
| Private workspace verifier | `npm run workspace:check` passed inside `npm run verify:local` |
| Public indexable routes | Enforced by `scripts/verify-route-inventory.mjs`, `src/app/sitemap.ts`, `src/app/robots.ts`, and `src/lib/seo-indexability.ts` |
| Crawlable noindex utility routes | `/login`, `/search`, `/signup`, `/submit-report` checked by `route:check` |
| Protected noindex private routes | `/dashboard`, `/dashboard/[tool]`, `/dashboard/jobs`, `/dashboard/jobs/[jobId]`, `/admin/*`, and `/contract/[token]` checked by `route:check` |
| API and token surfaces | `/api/*`, `/auth/*`, and `/contract/*` blocked or protected by robots/live verification |

`npm run verify:live` also confirmed sitemap, robots, `llms.txt`, `ai-index.json`, security headers, mobile API bearer-token protection, logged-out dashboard/admin redirects, and private-route no-store headers.

## Prompt Checklist

| Prompt | Category | Status | Evidence rule |
| --- | --- | --- | --- |
| 01 | Public IA, homepage, header, footer | Completed | Command and browser evidence recorded below |
| 02 | Contact, support, enterprise | Completed | Command and browser evidence recorded below; owner must apply inquiry-intake migration before production deploy |
| 03 | Pricing, capabilities, deferred billing truth | Completed | Command and browser evidence recorded below |
| 04 | Search | Completed | Command and browser evidence recorded below |
| 05 | Client Database and rating semantics | Completed | Command and browser evidence recorded below |
| 06 | Contractor/Business Database | Completed | PR #8 merged, deployed, and live release identity verified at commit `671db36f823acf268708daf00841456e3943c160` |
| 07 | Subcontractor/Trade Database | PR-ready | Local command, SEO, and browser evidence recorded on `codex/subcontractor-database-launch-final`; deploy after PR review |
| 08 | Auth, onboarding, sessions, capabilities | Not started | Needs command and browser evidence |
| 09 | Jobs and participants | Not started | Needs command and browser evidence |
| 10 | Contractor dashboard | Not started | Needs command and browser evidence |
| 11 | Reports, response, disputes, claims | Not started | Needs command and browser evidence |
| 12 | Contracts and Evidence Vault | Not started | Needs command and browser evidence |
| 13 | Recovery, lien services, billing safety | Not started | Needs command and browser evidence |
| 14 | Admin CRM | Not started | Needs command and browser evidence |
| 15 | Data, RLS, security, privacy | Not started | Needs command and browser evidence |
| 16 | SEO, crawl, schema, copy safety | Not started | Needs command and browser evidence |
| 17 | Accessibility, mobile web, performance, resilience | Not started | Needs command and browser evidence |
| 18 | Final release candidate and scope freeze | Not started | Needs all prior prompt evidence |
| 19 | Stripe test-mode validation | Deferred | Optional and owner-approved only |

## Prompt 06 / 07 Continuation Evidence

| Item | Evidence | Result |
| --- | --- | --- |
| Prompt 06 PR | PR #8 `codex/contractor-database-final` merged into `main` | Pass |
| Prompt 06 deploy | VPS `/api/version` reports `0.4.2` at `671db36f823acf268708daf00841456e3943c160` | Pass |
| Prompt 06 live health | `/api/health` reports `coreLiveReady: true`, `platformCanUseSupabase: true`, and 78/78 platform columns | Pass |
| Prompt 06 live SEO | `SEO_BASE_URL=https://clientbureau.com npm run seo:check` | Pass |
| Prompt 07 branch | `codex/subcontractor-database-launch-final` from updated `main` | In review |
| Prompt 07 tests | `npm test` | Pass, 135 tests |
| Prompt 07 lint | `npm run lint` | Pass |
| Prompt 07 build | `npm run build` | Pass |
| Prompt 07 route inventory | `npm run route:check` | Pass |
| Prompt 07 SEO local | `npm run seo:check:local` | Pass; subcontractor launch-context check passes when verified trade signals exist |
| Prompt 07 mobile readiness | `npm run mobile:check` | Pass |
| Prompt 07 browser sample | Local production preview at `http://127.0.0.1:4300` checked `/profiles/subcontractor`, `/profiles/subcontractor/bright-line-electric-orlando-fl`, `/search?profileType=subcontractor&tradeCategory=Electrical`, and `/admin/profiles?type=subcontractor` at mobile width | Pass; no public overflow or private-data leak found |

## Command Evidence

| Command | Result | Notes |
| --- | --- | --- |
| `git status --short` | Pass | Clean before branch creation |
| `git branch --show-current` | Pass | Started from `main` |
| `git log -1 --oneline` | Pass | `196a519 Align live verifier privacy wording` |
| `git fetch origin` | Pass | Origin fetched cleanly |
| `npm ci` | Failed | Windows `EPERM` unlink on locked native `lightningcss` binary. No source changes intended. |
| `npm install` | Pass | Repaired local dependency tree after `npm ci` lock failure. Reported 5 audit advisories, matching npm audit posture to review separately. |
| `npm run verify:local` | Pass | Route inventory, workspace quality, lint, tests, build, local SEO, and mobile readiness passed in 70s. |
| `LIVE_BASE_URL=https://clientbureau.com npm run verify:live` | Pass with expected warning | Stripe not configured warning only. |
| `SEO_BASE_URL=https://clientbureau.com npm run seo:check` | Pass | Live SEO, metadata, sitemap, schema, and public privacy checks passed. |

## Browser Evidence

Browser sample artifact: `C:\Users\MikeM\.codex\browser-evidence\prompt-00-browser-sample-1781756905186.json`.

Routes sampled on local `http://127.0.0.1:4200` and live `https://clientbureau.com` at 375px, 768px, and 1440px widths:

- `/`
- `/search`
- `/pricing`
- `/contact`
- `/login`
- `/client/kyle-hoofnagle-geneva-fl`
- `/profiles/subcontractor`
- `/dashboard`
- `/admin`

Summary:

- 54 route/viewport combinations sampled.
- 0 navigation errors.
- 0 console error samples captured by the browser tooling.
- Live logged-out `/dashboard` and `/admin` redirected to `/login?next=...` at all sampled widths.
- Local development rendered mock-auth private pages for `/dashboard` and `/admin`; this is expected when local mock auth is active and is not proof of logged-out local production behavior.
- Potential horizontal overflow was detected on live phone `/client/kyle-hoofnagle-geneva-fl` and local phone `/admin`.

## Findings

### P0 release blocker

- None found in Prompt 00. Local, origin, and production identity match; live health is green; local and live verification passed.

### P1 launch-quality

- Phone-width browser sampling detected horizontal overflow on live `/client/kyle-hoofnagle-geneva-fl`. This belongs in the public client/profile mobile-web pass.
- Phone-width browser sampling detected horizontal overflow on local `/admin` when mock auth allowed the admin command center to render. Live logged-out admin redirects correctly, but authenticated mobile admin should be checked in the admin/accessibility pass.
- `npm ci` failed on Windows due a locked native `lightningcss` binary. `npm install` repaired the local dependency tree and `verify:local` passed. For fully reproducible CI-style local installs, stop local dev/build processes before running `npm ci`.

### P2 post-launch enhancement

- `npm install` reported 5 audit advisories. The README already notes bundled framework dependency advisories should be reviewed before forced dependency changes.
- Strict authenticated release-candidate QA still requires disposable contractor/admin credentials in `.env.qa.local`.

## Owner-only Actions

- Keep Stripe deferred unless Prompt 19 is intentionally approved with test-mode credentials and billing policy review.
- Provide disposable contractor/admin QA credentials before running `npm run verify:live:release-candidate` as a final release-candidate gate.
- Publish only real verified subcontractor/trade profiles; do not create fake public inventory for SEO.
- If `npm ci` is required locally, close running Next/dev/build processes first to release locked native binaries.

## Privacy, Security, And Legal Checks

- Live verification passed public privacy scans for public pages, profiles, search, sitemap, robots, `llms.txt`, and `ai-index.json`.
- Live verification passed private mobile API unauthenticated bearer-token checks and no-store cache checks.
- Live verification passed logged-out dashboard/admin protection and return-path checks.
- SEO verification passed safe schema checks and avoided risky `AggregateRating`/fake review rich-result markup.
- No raw secrets, environment dumps, credentials, VPS passwords, service-role keys, or private production data were added to this ledger.

## Prompt 00 Verdict

`PASS WITH OWNER ACTION`

Prompt 00 established reliable release truth. Production is current with `origin/main` and local baseline, health/readiness is green, and automated local/live gates passed. Remaining owner actions are not release-truth blockers: Stripe is intentionally deferred, disposable QA credentials are still needed for strict authenticated release-candidate verification, and P1 mobile overflow findings should be handled in the appropriate later prompts.

## Prompt 01 - Public IA, Homepage, Header, Footer

| Item | Evidence |
| --- | --- |
| Branch | `codex/public-ia-homepage-final` |
| Starting commit | `3fce077` (`Add final release audit baseline`) |
| Scope | Homepage, public IA guardrails, copy-safety checks, SEO verifier homepage rules |
| Status | `PASS` locally; pending PR/release review |

### Section And CTA Inventory

| Surface | Decision |
| --- | --- |
| Hero | One headline, one search form, one primary `Run Client Check` action, one secondary report action. |
| Database choices | `Client Database`, `Contractor Database`, and `Subcontractor Database` remain the first major choice after the hero. |
| Workflow | Kept as a single before/during/after section with one CTA per card. |
| Trust/fairness | Kept as one guardrail section with private-evidence and response-rights copy. |
| Final CTA | Kept as a single search/report band. |
| Real profile snippets | Removed from homepage hero; replaced with a privacy-safe database preview that does not link to real public profiles. |
| Header/footer | Existing database-first header/footer already exposed the critical public paths and passed route inventory; no route changes were needed. |

### Prompt 01 Changes

- Removed homepage runtime fetching of public client profiles for decorative hero content.
- Replaced the real-record hero card with a privacy-safe `HeroDossierPreview` that explains approved public context, private evidence boundaries, and response paths without showing a real person, profile, report, or unpaid amount.
- Removed `force-dynamic` from the homepage by eliminating the live profile dependency; the homepage now prerenders as static content in `next build`.
- Tightened the homepage search placeholder from raw phone/email language to "private-match detail."
- Replaced public About page "Product doctrine" wording with customer-facing "Business workflow" wording.
- Extended `scripts/public-copy-safety.mjs` to catch aspirational roadmap/internal copy such as `the platform should`, `is becoming`, `we are building toward`, and `product doctrine`.
- Extended `scripts/verify-seo.mjs` so the homepage fails if it contains decorative direct links to real client, contractor, subcontractor, or business profile detail pages.

### Prompt 01 Command Evidence

| Command | Result | Notes |
| --- | --- | --- |
| `npm run lint` | Pass | ESLint passed. |
| `npm test` | Pass | 117 tests passed. |
| `npm run build` | Pass | Homepage now builds as a static route (`○ /`). |
| `npm run seo:check:local` | Pass | Includes new homepage decorative-profile-link guard and production-copy rules. |
| `npm run route:check` | Pass | Public/header/footer route inventory remains intact. |
| `npm run mobile:check` | Pass | Mobile readiness unaffected. |
| `npm run verify:local` | Pass | Full local release gate passed after stopping the temporary browser-QA standalone server that had locked `.next/standalone` on Windows. |

### Prompt 01 Browser Evidence

Browser checks were run against the temporary local production build at `http://127.0.0.1:4200`.

| Scenario | Result |
| --- | --- |
| Homepage at 375px | Pass: no horizontal overflow, H1 visible, one mobile menu button, desktop nav hidden, footer present, no direct profile links. |
| Homepage at 768px | Pass: no horizontal overflow, three database labels visible, footer present, no console errors. |
| Homepage at 1440px | Pass: no horizontal overflow, three database labels visible, footer present, no console errors. |
| Mobile menu open | Pass: drawer opened, `Check a Client` plus the three database paths were visible, no horizontal overflow. |
| Mobile menu close | Pass: visible close control closed the drawer with no overflow. |
| Local session nuance | The standalone local `/api/session` returned the mock contractor session (`morgan@ridgebuild.com`), so hydrated mobile menu account actions reflected mock-auth state. Public logged-out navigation remains covered by SSR route inventory and SEO checks. |

### Prompt 01 Findings

- No P0 or P1 blocker remains for the homepage/header/footer IA pass.
- The homepage no longer uses real adverse or positive profile context as decorative marketing content.
- Public copy-safety checks are stricter now and caught one legacy About page label during development; it was corrected before final checks passed.

## Prompt 02 - Contact, Support Routing, Enterprise Inquiry

| Item | Evidence |
| --- | --- |
| Branch | `codex/contact-support-enterprise-final` |
| Starting commit | `68d8d9d` (`Finalize public IA homepage pass`) |
| Scope | `/contact`, `/enterprise`, public inquiry validation, private inquiry storage, admin retrieval, privacy/terms copy, SEO/copy-safety checks |
| Status | `PASS WITH OWNER ACTION` locally; pending PR/release review and production migration |

### Prompt 02 Findings

| Severity | Finding | Evidence | Outcome |
| --- | --- | --- | --- |
| P1 launch-quality | `/contact` could render setup-style public contact language when optional phone/address config was missing. | Source audit of `src/app/contact/page.tsx`; release prompt observed equivalent wording. | Removed placeholder/internal contact wording and routed missing public contact config to the guided inquiry/workflow model. |
| P1 launch-quality | `/enterprise` routed prospects back into contact paths without a dedicated enterprise inquiry destination. | Source audit of `src/app/enterprise/page.tsx` and `/contact` enterprise card. | Added `/enterprise#enterprise-inquiry` with a privacy-safe form and updated contact enterprise CTA to the same destination. |
| P1 launch-quality | Public inquiry intake needed an auditable private retrieval path instead of open evidence/contact collection. | Audit of existing repositories/admin settings showed no public inquiry queue. | Added `public_inquiries` migration, repository/service/action flow, validation, duplicate-submit guard, and admin Settings queue. |
| P2 release protection | Existing checks did not fail on public setup phrases like `configured in production`. | Audit of `scripts/public-copy-safety.mjs` and `scripts/verify-seo.mjs`. | Extended public copy-safety and SEO verification to cover contact/enterprise inquiry surfaces and placeholder phrases. |

### Prompt 02 Changes

- Added `PublicInquiry` types, server-side schema validation, email masking/hash helpers, and the `submitPublicInquiryAction` server action.
- Added `supabase/migrations/0023_public_inquiry_intake.sql` for private public-support and enterprise inquiries with admin-only RLS policies.
- Added mock and Supabase repository/service support for inquiry create/list/recent-duplicate checks.
- Added the reusable `PublicInquiryForm` with honeypot, privacy certification, validation/error/success states, and warnings against raw evidence or sensitive identifiers.
- Reworked `/contact` so account help, client responses, enterprise review, and moderation/policy questions route to clear workflows, with a general support inquiry when a workflow does not fit.
- Reworked `/enterprise` so enterprise prospects get a scoped, private inquiry path and qualified claims around team workflow, review, and onboarding.
- Added admin Settings visibility for recent public support/enterprise inquiries with masked list context and private admin-only reply contact.
- Updated Privacy and Terms copy to describe support/enterprise inquiry records and to prohibit evidence/private identifiers through general forms.
- Added SEO/copy-safety checks for contact/enterprise inquiry form presence, placeholder contact language, and setup/coming-soon copy.
- Added `docs/PUBLIC_INQUIRY_INTAKE_RUNBOOK.md` documenting the migration, privacy rules, admin retrieval, and release owner action.

### Prompt 02 Command Evidence

| Command | Result | Notes |
| --- | --- | --- |
| `npm test` | Pass | 118 tests passed, including public inquiry validation and privacy-helper coverage. |
| `npm run lint` | Pass | ESLint passed. |
| `npm run build` | Pass | Next.js production build passed with 67 static pages. |
| `npm run seo:check:local` | Pass | Includes new contact/enterprise inquiry checks and public placeholder-language guard. |
| `npm run mobile:check` | Pass | Mobile readiness unaffected. |

### Prompt 02 Browser Evidence

Browser checks were run against the temporary local production build at `http://127.0.0.1:4200`.

| Scenario | Result |
| --- | --- |
| `/contact` desktop | Pass: form fields present, "General inquiry only" and "Do not paste raw evidence" warnings visible, no placeholder contact copy, no horizontal overflow. |
| `/enterprise` desktop | Pass: enterprise inquiry form present, evidence warning visible, no placeholder contact copy, no horizontal overflow. |
| `/contact` at 375px | Pass: support inquiry remained visible, no horizontal overflow. |
| `/enterprise` at 375px | Pass: enterprise inquiry remained visible, no horizontal overflow. |
| Invalid email on `/contact` | Pass: browser email validation blocked submit before server action and showed the native invalid-email validation message. |
| Valid production inquiry submit | Deferred: not submitted against the local environment to avoid writing real production/staging inquiry data. Covered by schema/action/repository tests and requires owner-applied migration before production QA. |

No screenshot artifact was generated for Prompt 02; browser evidence was recorded through DOM, viewport, and validation checks.

### Prompt 02 Privacy, Security, And Legal Evidence

- Public inquiry copy tells users not to submit raw evidence, private identifiers, contracts, documents, or sensitive case details through general contact/enterprise forms.
- Server validation rejects sensitive-looking message content such as raw email addresses, phone numbers, private identifier language, and evidence-upload references.
- Stored inquiries keep masked and hashed email values for list/search context while retaining the raw reply email only in the private admin-only table/view.
- Public pages do not expose inquiry submissions, raw reply contacts, private evidence, pending/rejected report content, admin notes, or enterprise commitments.
- Enterprise copy is qualified as scoped review/team workflow discussion and does not promise integrations, SLAs, custom data partnerships, legal outcomes, collection, or payment processing.
- Public copy-safety checks now fail on setup-style phrases including `configured in production`, `contact details appear here`, and `coming later`.

### Prompt 02 Owner Actions

- Apply `supabase/migrations/0023_public_inquiry_intake.sql` before deploying this branch to production with Supabase-backed inquiry intake.
- After migration, submit one disposable general support inquiry and one disposable enterprise inquiry, then confirm both appear in `/admin/settings#public-inquiries`.
- Keep using dedicated workflows for evidence, report disputes, client responses, and moderated records; the public inquiry form is for routing only.

### Prompt 02 Verdict

`PASS WITH OWNER ACTION`

The public contact and enterprise surfaces now have real, privacy-safe inquiry paths with admin retrieval and release checks. Production deployment should wait until the `0023` inquiry-intake migration is applied, then one disposable inquiry should be verified end to end.

## Prompt 03 - Pricing, Capabilities, Deferred Billing Truth

| Item | Evidence |
| --- | --- |
| Branch | `codex/pricing-capability-truth` |
| Starting commit | `ef8c194` (`Add public inquiry intake for contact and enterprise`) |
| Scope | `/pricing`, plan CTAs, signup plan-interest handoff, dashboard billing copy, subscription/service-fee checkout gates, billing readiness checks, capability documentation |
| Status | `PASS` locally; pending PR/release review |

### Prompt 03 Findings

| Severity | Finding | Evidence | Outcome |
| --- | --- | --- | --- |
| P1 launch-quality | Pricing and shared pricing cards could route paid plans directly to `/api/stripe/checkout` while billing is intentionally deferred. | Source audit of `/pricing`, `PricingCard`, and Stripe checkout routes. | Added a server-side billing availability gate and routed paid-plan interest through signup/review until checkout is explicitly enabled and QA-proven. |
| P1 launch-quality | Paid plan copy over-promised team/shared/export/manager controls that are not launch-proven self-serve features. | Audit of `pricingTiers`, comparison rows, and dashboard billing copy. | Replaced unsupported promises with review/scoping language and documented the feature classification matrix. |
| P1 launch-quality | New account signup did not preserve paid plan interest. | Audit of `/signup?plan=...`, signup schema, web action, and mobile signup route. | Added `planInterest` validation, hidden form preservation, auth metadata, and post-signup billing-review routing for non-free plan interest. |
| P1 release protection | Service-fee case actions and readiness text implied checkout could begin even while service-fee billing is not open. | Audit of recovery/lien actions and readiness summaries. | Gated recovery/lien service-fee checkout actions and changed precheck/case messages to "review before billing" when checkout is deferred. |

### Prompt 03 Changes

- Added `src/lib/billing-availability.ts` as the single server-safe billing availability policy for subscription and service-fee checkout.
- Added `BILLING_CHECKOUT_ENABLED=false` to `.env.example` and deployment docs; Stripe keys alone do not open checkout.
- Exposed billing availability through `/api/health` so live verification can detect readiness drift without exposing secrets.
- Updated subscription and service-fee checkout routes to redirect/fail safely when billing is not intentionally enabled.
- Reworked `/pricing` CTAs and plan language around Free account creation, Pro plan interest, Bureau Team review, Enterprise review, and deferred paid activation.
- Removed direct checkout forms from shared pricing cards.
- Preserved paid plan interest through web signup, mobile signup metadata, and post-signup redirects.
- Updated dashboard Billing copy to show billing review mode without developer-facing Stripe/webhook wording.
- Updated recovery and Florida lien service actions/readiness summaries so service-fee payment is reviewed before billing is collected unless checkout is explicitly active.
- Added `docs/PRICING_CAPABILITY_MATRIX.md` documenting implemented, implemented-not-gated, partial/planned, and deferred capabilities.
- Extended `scripts/verify-live-release.mjs` and `scripts/verify-seo.mjs` to fail if pricing exposes direct checkout forms, technical billing markers, or missing deferred-billing copy.

### Prompt 03 Command Evidence

| Command | Result | Notes |
| --- | --- | --- |
| `npm test -- --run src/lib/__tests__/client-bureau.test.ts` | Pass | 121 focused tests passed after adding billing availability and service-readiness assertions. |
| `npm run lint` | Pass | ESLint passed with no warnings after cleanup. |
| `npm test` | Pass | 121 tests passed. |
| `npm run build` | Pass | Next.js production build passed with 67 static pages. |
| `npm run seo:check:local` | Pass | Includes new pricing deferred-billing, signup-route, no-direct-checkout, and technical-marker checks. |
| `npm run mobile:check` | Pass | Mobile readiness unaffected. |
| `npm run route:check` | Pass | Route/indexability inventory remains intact. |
| `git diff --check` | Pass | No whitespace errors; only normal Windows LF-to-CRLF warnings appeared. |

### Prompt 03 Browser Evidence

Browser checks were run against a fresh local production build at `http://127.0.0.1:4201`.

| Scenario | Result |
| --- | --- |
| `/pricing` desktop | Pass: deferred paid-plan copy visible, Free CTA visible, Pro routes to `/signup?plan=pro`, Team uses review language, no direct `/api/stripe/checkout` form, no technical billing markers, no horizontal overflow. |
| `/signup?plan=pro` desktop | Pass: Pro plan-interest notice visible, hidden `planInterest=pro` input present, no horizontal overflow. |
| `/dashboard/billing` desktop | Pass: billing review mode visible after dashboard content loaded, request-billing-review action visible, no technical billing markers, no horizontal overflow. |
| Stale local server note | Port 4200 was serving an older preview during QA; the browser checks were repeated successfully on a fresh port 4201 preview built from this branch. |

### Prompt 03 Privacy, Security, And Legal Evidence

- Public pricing copy no longer exposes setup details such as missing Stripe keys, test mode, or webhook status.
- Paid activation and service fees are described as reviewed before billing is collected while checkout is deferred.
- Public copy avoids guarantees, collection promises, legal outcome claims, and unsupported team/export/manager-control promises.
- Recovery and lien service checkout actions fail safely when billing is not open, leaving saved cases in private review.
- Plan interest is stored as non-sensitive account metadata; no raw payment details are collected.
- SEO and live verification now guard against direct checkout forms or technical billing markers on public pricing.

### Prompt 03 Owner Actions

- Keep `BILLING_CHECKOUT_ENABLED=false` until subscription checkout, service-fee checkout, webhooks, failed-payment states, and dashboard subscription updates are tested end to end in Stripe test mode.
- Before enabling checkout, verify Pro and Team price IDs, webhook signature validation, idempotent webhook processing, checkout cancel/return states, service-fee orders, and customer-support copy.
- Do not market Bureau Team seats, shared team controls, manager controls, CSV exports, or enterprise data partnerships as self-serve until those paths are implementation- and QA-proven.

### Prompt 03 Verdict

`PASS`

Pricing, plan-interest, dashboard billing, and service-fee language now match the current product truth. Free signup remains open, paid interest is preserved for review, and public paid checkout stays closed until the explicit billing launch gate is enabled and QA-proven.

## Prompt 04 - Search Product, Filters, Private Matching, No-Result Decisions

| Item | Evidence |
| --- | --- |
| Branch | `codex/search-final-product-pass` |
| Starting commit | `6a6e822` (`Clarify deferred billing and pricing capability truth`) |
| Scope | `/search`, search command center, result cards, saved-search/search-analytics handoffs, private identifier handling, noindex/canonical verification |
| Status | `PASS` locally; pending PR/release review |

### Prompt 04 Findings

| Severity | Finding | Evidence | Outcome |
| --- | --- | --- | --- |
| P1 launch-quality | Search no-result copy could say `No public reports found yet` even when users filtered for contractor or subcontractor profiles. | Source audit of `src/app/search/page.tsx` and browser/SEO checks for subcontractor trade no-result URLs. | Added profile-specific no-result copy for clients, contractors, subcontractors, all profiles, and private identifier checks. |
| P1 privacy | Phone/email-like public search queries could be rendered in visible filter chips and passed through signup/report/saved-search/search-analytics handoffs. | Source audit of `/search`, `SearchCommandCenter`, `saveClientSearchAction`, `recordSearchEventAction`, mock repository, and Supabase repository. | Added safe query display/storage helpers, request-level `/search` private identifier redirects, client-side private-match submit routing, and repository/action redaction before persistence. |
| P1 decision safety | No-result states needed stronger language that no visible public profile means limited public information, not a clearance or safety signal. | Audit of `SearchActivationGuide` and no-result card copy. | Added no-clearance wording to all no-result/private-match states and tests guarding against misleading safety language. |
| P2 resilience | Large result sets could render too many cards without a clear bound. | Audit of `/search` result limit and render loop. | Bounded search rendering to the first 24 profiles with a narrowing prompt when more results are available. |

### Prompt 04 Changes

- Added `safeSearchQueryForStorage`, `safeSearchQueryForDisplay`, `searchNoResultCopy`, and search scope helpers in `src/lib/search-experience.ts`.
- Updated `/search` so phone/email-like direct URLs redirect to `/search?privateMatch=1...` before raw identifiers render in public HTML.
- Added `/search` handling in `src/proxy.ts` so direct raw private identifier query URLs are redirected at the request boundary.
- Updated `SearchCommandCenter` so private identifier form submits route to safe private-match URLs, do not show unrelated public previews, and use zero public result counts.
- Sanitized saved-search and search-analytics persistence in server actions, mock repositories, and Supabase repositories.
- Replaced generic no-result copy with client/contractor/subcontractor/private-match-specific language.
- Kept normal name/business search URLs and filter handoffs intact for signup, report intake, profile type switching, trade filters, and back/forward navigation.
- Extended unit tests, SEO verification, and live-release verification for private identifier redaction, no-result semantics, and filter preservation.

### Prompt 04 Command Evidence

| Command | Result | Notes |
| --- | --- | --- |
| `git status --short --branch` | Pass | On `codex/search-final-product-pass` before edits. |
| `git fetch origin` | Pass | Origin fetched cleanly. |
| `npm test -- --run src/lib/__tests__/client-bureau.test.ts` | Pass | 123 focused tests passed after adding search privacy/no-result tests. |
| `npm run lint` | Pass | ESLint passed after implementation and again after proxy redirect fix. |
| `npm test` | Pass | 123 tests passed. |
| `npm run build` | Pass | Next.js production build passed with 67 static pages. |
| `npm run seo:check:local` | Failed, then Pass | Initial failure proved server-component redirect was not enough for direct private-identifier URLs; after adding `/search` proxy redirect, SEO passed including private-match checks. |
| `npm run route:check` | Pass | Route/indexability inventory remains intact. |
| `npm run mobile:check` | Pass | Mobile readiness unaffected. |

### Prompt 04 Browser Evidence

Browser checks were run against a fresh local production preview at `http://127.0.0.1:4202`.

| Scenario | Viewport | Result | Artifact |
| --- | ---: | --- | --- |
| `/search?q=John&state=FL` | 1440px | Pass: server-verified results, Client check guide, View Client Profile CTA, no console errors, no horizontal overflow. | `C:\Users\MikeM\.codex\browser-evidence\prompt-04-client-results-1440-1781761108804.png` |
| `/search?q=NoSuchClientBureau987&profileType=contractor` | 768px | Pass: contractor-specific no-result copy, no generic `No public reports found yet`, no clearance language, no console errors, no overflow. | `C:\Users\MikeM\.codex\browser-evidence\prompt-04-contractor-no-result-768-1781761108804.png` |
| `/search?q=NoSuchClientBureau987&profileType=subcontractor&tradeCategory=Electrical` | 375px | Pass: subcontractor/trade no-result copy, trade filter preserved, no generic report language, no console errors, no overflow. | `C:\Users\MikeM\.codex\browser-evidence\prompt-04-subcontractor-trade-no-result-375-1781761108804.png` |
| Direct `/search?q=person%40example.com&state=FL&profileType=client` | 375px | Pass: redirected to `/search?state=FL&profileType=client&privateMatch=1`, raw email absent from HTML, private-match safety copy visible. | `C:\Users\MikeM\.codex\browser-evidence\prompt-04-private-identifier-direct-375-1781761108804.png` |
| Search form submit with `person@example.com` | 375px | Pass: client-side submit landed on `/search?privateMatch=1`, raw email absent from HTML, private-match copy visible, back/forward restored `/search` and `/search?privateMatch=1`. | `C:\Users\MikeM\.codex\browser-evidence\prompt-04-private-form-375-1781761108804.png` |

No browser console errors were captured in the sampled scenarios.

### Prompt 04 Privacy, Security, And Legal Evidence

- Raw phone/email-like search strings are converted to a `privateMatch=1` intent marker in generated search URLs.
- Direct `/search?q=<email-or-phone>` requests are redirected by `src/proxy.ts` before the public page renders.
- Server actions and both repository adapters sanitize saved-search and search-analytics `query` values before persistence.
- Public no-result states explicitly say limited public history is not a clearance signal.
- `/search` remains crawlable `noindex, follow` with canonical `/search`, and no search URLs enter the sitemap.
- Search result cards still expose only approved profile context; raw identifiers, raw evidence, pending/rejected records, and admin notes remain out of public HTML.

### Prompt 04 Owner Actions

- Authenticated save/watchlist QA should be repeated with disposable contractor credentials on production after this PR is merged and deployed.
- Repository timeout/failure states were not force-simulated in browser because the public service falls back between Supabase/mock adapters; keep an operational monitor on search repository errors.
- Live verification must be rerun after deployment so `LIVE_BASE_URL=https://clientbureau.com npm run verify:live` confirms the new private-match checks against production.

### Prompt 04 Verdict

`PASS`

Search now separates public database lookup from private identifier matching, gives entity-specific no-result guidance, preserves safe filter handoffs, and prevents raw phone/email-like identifiers from rendering or persisting through the public search surface.

## Prompt 05 - Client Database And Rating Semantics

| Item | Evidence |
| --- | --- |
| Branch | `codex/client-database-rating-final` |
| Starting commit | `9bc16dd` (`Harden search product and private matching`) |
| Scope | `/clients`, `/client/[slug]`, client search cards, directory cards, share cards, OpenGraph image, client rating helpers, unit tests |
| Status | `PASS` locally; pending PR/release review |

### Prompt 05 Findings

| Severity | Finding | Evidence | Outcome |
| --- | --- | --- | --- |
| P1 fairness | Zero-history client profiles could inherit a stored numeric score/risk level that looked more certain than the approved public history supported. | Audit of `clientRatingBand`, `clientProfileConfidence`, public profile hero/sidebar, directory cards, search cards, share card, and OpenGraph image. | Added `clientRatingDisplay` and hid numeric score/risk-first presentation when no approved public history exists. |
| P1 launch-quality | One-report profiles could receive normal strong/moderate/high labels even though one report is early context. | Unit audit around one positive and one adverse report states. | Added early-history labels: `Early positive context`, `Early mixed context`, and `Early concern context`. |
| P1 conversion/trust | Public profile, search result, directory, share, and OG surfaces did not always use the same rating language. | Source audit of `/client/[slug]`, `SearchResultCard`, `SearchCommandCenter`, `ClientDirectoryView`, `PublicProfileShareCard`, and profile OG image. | Centralized display semantics so all public Client Database surfaces use the same context label, score label, and risk-badge rule. |
| P2 clarity | Score factors could appear for profiles with no public history, creating an explanation for a score that should not be treated as established. | Sidebar rating card audit. | Sidebar score factors now appear only after approved public report history exists; limited profiles get explanatory copy instead. |

### Prompt 05 Changes

- Added a shared client rating display policy in `src/lib/client-database.ts` with report counts, concern/positive counts, evidence flags, open dispute context, resolved context, score display, context label, and risk-badge eligibility.
- Extended `clientRatingBand` so one-report profiles use early-context labels instead of established-history labels.
- Updated `/client/[slug]` so the hero badge, rating card, sidebar, share card, and OpenGraph image use cautious context labels and limited-history display.
- Updated Client Database directory cards, search result cards, and predictive search preview cards to use the same rating semantics.
- Preserved report dossier improvements: positive reports do not show `$0 unpaid`, concern reports use reported payment context, and public pages continue to avoid private identifiers, raw evidence, pending/rejected content, and admin notes.
- Kept structured data safe: no `Review`, `AggregateRating`, fake stars, or hidden rating-value markup was added.

### Prompt 05 Command Evidence

| Command | Result | Notes |
| --- | --- | --- |
| `npm test -- --run src/lib/__tests__/client-bureau.test.ts` | Pass | 126 focused tests passed after adding rating display cases. |
| `npm run lint` | Pass | ESLint passed. |
| `npm test` | Pass | 126 tests passed. |
| `npm run build` | Failed, then Pass | Initial build caught compact search preview typing; helper input was widened to the minimal public-safe fields it needs. Final build passed with 67 static pages. |
| `npm run seo:check:local` | Pass | Public profile schema/privacy checks passed; no rating-rich-result markup. |
| `npm run route:check` | Pass | Route/indexability inventory remains intact. |
| `npm run mobile:check` | Pass | Mobile readiness unaffected. |

### Prompt 05 Browser Evidence

Browser checks were run against a local production preview at `http://127.0.0.1:4203`.

| Scenario | Viewport | Result |
| --- | ---: | --- |
| `/client/john-smith-orlando-fl` | 1440px | Pass: public report summary and published report history visible, safe context copy present, no console errors, no horizontal overflow, no `$0 unpaid`, no private markers, no `AggregateRating`/`ratingValue`. |
| `/client/maria-alvarez-tampa-fl` | 390px | Pass: positive-only profile shows safe positive/context language, public report sections visible, no console errors, no horizontal overflow, no `$0 unpaid`, no private markers, no rating-rich-result text. |
| `/clients` | 390px | Pass: Client Database hub renders cleanly, no console errors, no horizontal overflow, no private markers, no rating-rich-result text. |
| `/search?profileType=client&q=John` | 390px | Pass: client search results render, no console errors, no horizontal overflow, no `$0 unpaid`, no private markers, no rating-rich-result text. |

Evidence artifact: `C:\Users\MikeM\.codex\browser-evidence\prompt-05-client-database-rating-browser-qa.json`.

Note: the in-app browser screenshot command timed out during this run, so browser evidence was recorded as DOM/console/overflow/privacy metrics rather than screenshots. The browser checks still used the in-app browser runtime; no screenshot files were committed.

### Prompt 05 Privacy, Security, And Legal Evidence

- Limited/no-history profiles display `Limited public history` and no numeric score/risk badge as the primary public signal.
- One-report profiles display early-context labels and avoid definitive excellent/dangerous language.
- Risk badges only remain on public client surfaces when approved concern history exists beyond a single early report.
- Positive records are included in rating semantics and public report cards without misleading `$0 unpaid` framing.
- Mixed, disputed, resolved, evidence-backed, and response/correction states have unit coverage.
- Structured data remains compliant and avoids review-rich-result or aggregate-rating markup.

### Prompt 05 Owner Actions

- Repeat browser QA on production after the PR is merged and deployed.
- Continue to publish only approved, moderated, public-safe client history; do not manufacture records to influence score presentation.

### Prompt 05 Verdict

`PASS`

The Client Database now presents ratings as cautious public context. Zero-history and early-history profiles no longer look definitively safe or risky, positive/resolved/corrected context is represented, and public profile/search/directory/share surfaces use one consistent rating policy.

## Prompt 06 - Contractor/Business Database, Verification Context, Claims, And Public Trust Profiles

| Item | Evidence |
| --- | --- |
| Branch | `codex/contractor-database-final` |
| Starting commit | `f161f69` (`Finalize client database rating semantics`) |
| Scope | `/profiles/contractor`, `/profiles/subcontractor`, `/profiles/[profileType]/[slug]`, `/businesses`, `/business/[slug]`, contractor search result cards, admin contractor profile editor |
| Status | `PASS` locally; pending PR/release review |

### Prompt 06 Findings

| Severity | Finding | Evidence | Outcome |
| --- | --- | --- | --- |
| P1 trust/legal | Contractor/subcontractor verification wording was not centralized, which made it easier for public copy to imply stronger verification than Client Bureau should claim. | Audit of profile detail pages, business directory, legacy business fallback, search result cards, and admin profile copy. | Added one non-endorsement verification context helper used across public business/trade profile surfaces. |
| P1 privacy | Public pages needed an explicit field-classification policy for what can be public, review-gated, private/admin-only, or never public. | Audit of public profile detail presentation and business profile tests. | Added a shared business profile field policy and a “How to read this business/trade profile” guide with display-only labels. Internal field keys are stripped before rendering public page props. |
| P1 identity integrity | Multi-capability accounts needed claim/profile URLs that preserve the requested contractor or subcontractor view without creating duplicate identities. | Audit of entity profile href helpers, search cards, public detail CTAs, and admin preview links. | Added `businessProfileClaimHref` and updated public/search CTAs plus admin preview links to preserve profile type and slug. |
| P2 canonical cleanup | Legacy `/business/[slug]` should not compete with canonical contractor profile URLs. | Browser QA of `/business/ridgebuild-contracting-orlando-fl`. | Legacy business pages redirect to `/profiles/contractor/[slug]` when a unified public profile exists. |

### Prompt 06 Changes

- Added `businessProfilePublicFieldPolicy`, `businessProfileFieldPolicyByClassification`, `businessVerificationContext`, and `businessProfileClaimHref` in `src/lib/entity-profiles.ts`.
- Made contractor and subcontractor safe descriptions role-specific instead of generic profile labels.
- Added a public “How to read this business/trade profile” guide to profile detail pages with safe-public, review-gated, and private/admin-only field groups.
- Updated profile detail sidebars, product mockups, and CTAs to use non-endorsement verification context instead of raw badge lists.
- Updated contractor and subcontractor search result cards with claim/correction URLs that preserve `profileType` and `profileSlug`.
- Reworked `/businesses` and legacy `/business/[slug]` copy to frame business profiles as public-safe trust profiles, not endorsements.
- Updated the admin contractor editor so public preview links use canonical contractor/subcontractor profile routes and account classification copy explains capabilities without duplicating identity.
- Added tests covering field classification, private-key redaction, non-endorsement verification wording, claim URL preservation, and role-specific public descriptions.

### Prompt 06 Command Evidence

| Command | Result | Notes |
| --- | --- | --- |
| `npm test -- --run src/lib/__tests__/client-bureau.test.ts` | Pass | 130 focused tests passed after adding contractor/business field-policy and verification-context cases. |
| `npm run lint` | Pass | ESLint passed. |
| `npm test` | Pass | 130 tests passed. |
| `npm run build` | Pass | Next.js production build passed with 67 generated static pages. |
| `npm run seo:check:local` | Pass | Contractor and subcontractor profile schema/privacy checks passed; claim-link preservation check passed. |
| `npm run route:check` | Pass | Route/indexability inventory remains intact. |
| `npm run mobile:check` | Pass | Mobile readiness unaffected. |

### Prompt 06 Browser Evidence

Browser checks were run against local production previews at `http://127.0.0.1:4204` and refreshed at `http://127.0.0.1:4205`.

| Scenario | Viewport | Result |
| --- | ---: | --- |
| `/profiles/contractor` | 1440px | Pass: Contractor Database renders with canonical profile links, claim/correction links, no console errors, and no horizontal overflow. |
| `/profiles/contractor/ridgebuild-contracting-orlando-fl` | 1440px and 390px | Pass: business profile guide, claim CTA, non-endorsement verification wording, canonical database links, no console errors, and no horizontal overflow. |
| `/profiles/subcontractor/bright-line-electric-orlando-fl` | 390px | Pass: trade profile guide, subcontractor-specific language, payment-chain context, no console errors, and no horizontal overflow. |
| `/businesses` | 768px | Pass: Contractor Database handoff, public-safe business cards, canonical contractor profile links, no console errors, and no horizontal overflow. |
| `/search?profileType=contractor&q=RidgeBuild` | 390px | Pass: contractor result card links to canonical business profile and preserves claim target. |
| `/claim-profile?profileType=contractor&profileSlug=ridgebuild-contracting-orlando-fl` | 390px | Pass: direct claim URL preserves contractor profile type and slug. |
| `/business/ridgebuild-contracting-orlando-fl` | 1440px | Pass: redirected to `/profiles/contractor/ridgebuild-contracting-orlando-fl`. |

Evidence artifacts:

- `C:\Users\MikeM\.codex\browser-evidence\prompt-06-contractor-database-browser-qa.json`
- `C:\Users\MikeM\.codex\browser-evidence\prompt-06-contractor-database-browser-qa-final.json`
- `C:\Users\MikeM\.codex\browser-evidence\prompt-06-contractor-database-browser-qa-final-pass.json`

### Prompt 06 Privacy, Security, And Legal Evidence

- Public verification language now says labels are profile-context signals only and are not an endorsement or guarantee, recommendation, background check, license confirmation, insurance confirmation, or credit score.
- Public profile detail pages explain safe public fields, review-gated public fields, private/admin-only fields, and never-public fields.
- Public page props for the field guide use display labels only, so internal field keys such as `businessPhone`, `ownerIdentity`, and `internalNotes` are not needed in the public component payload.
- Public surfaces continue to avoid raw emails, phone numbers, street addresses, private job data, evidence paths, pending/rejected content, and admin notes.
- Contractor/subcontractor pages use safe schema only and do not add `Review`, `AggregateRating`, fake stars, or hidden rating-value markup.
- Admin classification still treats `users.role` as auth/admin authorization, while public account capabilities control contractor/subcontractor view compatibility.

### Prompt 06 Owner Actions

- Repeat authenticated admin classification QA on production after merge/deploy using a real disposable admin account.
- Confirm any real business that gains both contractor and subcontractor capabilities appears under both canonical profile views without duplicate records.
- Continue to publish only real verified contractor/subcontractor profiles; do not create fake inventory for SEO or visual polish.

### Prompt 06 Verdict

`PASS`

The Contractor/Business Database now has centralized non-endorsement verification language, a public field-policy guide, canonical claim/profile links, and tests for multi-capability identity safety. Contractor and subcontractor pages remain distinct while preserving privacy and schema safety.
