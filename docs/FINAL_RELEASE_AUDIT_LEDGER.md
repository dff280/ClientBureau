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
| 01 | Public IA, homepage, header, footer | Not started | Needs command and browser evidence |
| 02 | Contact, support, enterprise | Not started | Needs command and browser evidence |
| 03 | Pricing, capabilities, deferred billing truth | Not started | Needs command and browser evidence |
| 04 | Search | Not started | Needs command and browser evidence |
| 05 | Client Database and rating semantics | Not started | Needs command and browser evidence |
| 06 | Contractor/Business Database | Not started | Needs command and browser evidence |
| 07 | Subcontractor/Trade Database | Not started | Needs command and browser evidence |
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
