# Client Bureau Release Audit - June 7, 2026

Version: `0.2.0`

## Audit Scope

This audit covers the current Client Bureau codebase before pushing the `codex/admin-ops-crm-upgrade` branch to GitHub.

Snapshot counts:

- App route files: 77
- Component files: 67
- Library/service/type files: 49
- Supabase migrations: 12
- Verification commands used: test, lint, build, mobile readiness, SEO check, local browser QA

## Current Product Positioning

Client Bureau is a professional business-owner protection platform for contractors and service businesses.

Core promise:

**Check the client before you take the job.**

The product now combines:

- Client search and client-risk context
- Public client profiles
- Contractor/business profiles
- Report submission and moderation
- Positive and concern reports
- Client response, dispute, and correction workflows
- Contractor dashboard
- Admin moderation CRM
- Contracts and e-signature workflow
- Change-order positioning
- Evidence vault direction
- Payment recovery service direction
- Florida lien notice and filing service direction
- Public SEO directory and acquisition pages
- AI-readable discovery surfaces

## Public Pages

Core public pages:

- `/`
- `/search`
- `/pricing`
- `/how-it-works`
- `/resources`
- `/about`
- `/contact`
- `/enterprise`
- `/clients`
- `/clients/[market]`
- `/clients/[market]/[city]`
- `/client/[slug]`
- `/businesses`
- `/business/[slug]`
- `/reports/[type]`
- `/industries/[industry]`

Policy and methodology pages:

- `/terms`
- `/privacy`
- `/report-policy`
- `/dispute-policy`
- `/moderation-policy`
- `/score-methodology`
- `/business-rating-methodology`

Service and acquisition pages:

- `/payment-recovery-service`
- `/florida-lien-notice-service`
- `/florida-lien-filing-service`
- `/contractor-contract-template`
- `/change-order-template`
- `/homeowner-wont-pay-contractor`
- `/client-screening-for-contractors`

Machine-readable/public trust files:

- `/robots.txt`
- `/sitemap.xml`
- `/llms.txt`
- `/ai-index.json`
- `/.well-known/security.txt`

## Authenticated Contractor/User Areas

- `/dashboard`
- `/dashboard/[tool]`
- `/submit-report`
- `/client-response`
- `/claim-profile`
- `/contract/[token]`
- `/login`
- `/signup`

Dashboard direction:

- Keep `/dashboard` as a clean home hub.
- Route focused tools through `/dashboard/[tool]`.
- Daily essentials: search, reports, contracts, evidence, payment recovery, watchlist, billing.

## Admin Areas

- `/admin`
- `/admin/reports`
- `/admin/reviews`
- `/admin/clients`
- `/admin/contractors`
- `/admin/discussions`
- `/admin/uploads`
- `/admin/audit-log`
- `/admin/settings`
- `/admin/contracts`
- `/admin/recovery`

Admin direction:

- Admin is an isolated internal Ops CRM.
- Report moderation remains the strongest live workflow.
- Client/business profile management now uses cleaner drawer-style editors.
- New admin UI primitives were added for queue headers, filters, decision panels, and profile health cards.

## API And System Routes

Auth/session:

- `/api/session`
- `/api/admin/session`
- `/api/auth/login`
- `/api/auth/logout`
- `/auth/callback`

Admin:

- `/api/admin/action-token`

Stripe:

- `/api/stripe/checkout`
- `/api/stripe/service-fee/checkout`
- `/api/stripe/webhook`

Mobile/API readiness:

- `/api/mobile/me`
- `/api/mobile/dashboard`
- `/api/mobile/recovery`
- `/api/mobile/lien-service`

Health:

- `/api/health`

## Database And Migrations

Current migrations:

1. `0001_client_bureau_schema.sql`
2. `0002_admin_discussions_audit.sql`
3. `0003_platform_expansion.sql`
4. `0004_recovery_contracts.sql`
5. `0005_ops_workspace.sql`
6. `0006_launch_ops_hardening.sql`
7. `0007_contract_signing_packets.sql`
8. `0008_managed_recovery_lien_filing.sql`
9. `0009_revenue_workflow_hardening.sql`
10. `0010_search_activation_events.sql`
11. `0011_contractor_onboarding_fields.sql`
12. `0012_ratings_signup_report_intake.sql`

Production posture:

- `DATA_MODE=supabase` can power core live flows.
- `PLATFORM_FEATURE_DATA_MODE=mock` remains safest until all ops tables and RLS are verified live.
- Advanced ops features should not be flipped to Supabase mode without migration checks.

## Security And Privacy Audit

Implemented:

- Caddy security headers
- App-level security headers in `next.config.ts`
- CSP with Supabase, Stripe, GA, and Meta allowances
- HSTS
- `X-Frame-Options: DENY`
- content-type sniffing protection
- referrer policy
- permissions policy
- no public raw evidence paths
- no public raw email/phone exposure in tested public profile
- admin route protection remains server-side

Secret scan result:

- No committed OpenAI API key found.
- No live Supabase or Stripe secret found in tracked files.
- Secret-like search hits were placeholders, docs, env names, schema fields, or package-lock strings.

Important:

- `C:\Users\MikeM\Downloads\openai-api-key.txt` must not be copied into the repo.
- Future AI work should use `OPENAI_API_KEY` in `.env.local` and `.env.production` only.

## SEO And AI Discoverability Audit

Implemented:

- Dynamic sitemap with public profiles, business profiles, directories, SEO landing pages, and acquisition pages.
- `robots.txt` allows indexable public pages and blocks auth/admin/search areas.
- `llms.txt` links public pages, directories, policy pages, service pages, and acquisition pages.
- `ai-index.json` gives AI systems structured product context, safe language, privacy rules, and URL inventory.
- JSON-LD is present on public profiles and acquisition pages.
- Public profiles avoid fake review/rating rich-result markup.
- New static acquisition pages are prerendered.

SEO check passed for:

- Homepage title/description/canonical/schema
- policy pages
- directory pages
- report/industry pages
- service pages
- new acquisition pages
- `llms.txt`
- `ai-index.json`
- `security.txt`
- sitemap and robots
- public profile privacy/schema checks

## Performance Audit

Positive signals:

- New acquisition pages are static.
- Next.js build completes successfully.
- `/_next/static` assets retain hashed immutable caching through Next.js.
- Public pages use server-rendered content and canonical metadata.
- Dynamic routes are reserved for auth, admin, dashboards, profiles, APIs, and live data.

Follow-up opportunities:

- Add Lighthouse/PageSpeed snapshots after deployment.
- Add image/font audit for largest contentful paint on the homepage.
- Consider CDN caching rules only after confirming Caddy/Next behavior in production.
- Keep avoiding global nonce-based CSP unless security requirements justify the performance tradeoff.

## Known Product Gaps

- AI assistant features are not yet implemented.
- Full live-backed advanced ops mode needs table/RLS verification before production flip.
- Evidence upload and document parsing should be hardened before AI summarization.
- Admin CRM can still be split into more focused entity pages over time.
- Public city/state/programmatic pages should expand only where approved profile data or useful local content exists.
- Contract packet PDFs, immutable snapshots, and stronger signature audit metadata are future hardening items.
- Lien filing must remain Florida-first and attorney/vendor review-gated.

## Release Value Estimate

This is not a formal valuation. As a build-value estimate, the current codebase represents a substantial SaaS MVP/prototype with live-auth architecture, admin tooling, SEO infrastructure, public profiles, contract workflows, recovery/lien direction, and deployment assets.

Estimated replacement build cost:

- Lean freelancer/team build: `$35k-$75k`
- Senior product engineering build with design, docs, SEO, auth, admin, and deployment: `$80k-$175k+`
- Commercial value depends on traction, indexed profiles, paying contractors, legal/compliance readiness, and repeatable acquisition economics.

The highest value drivers now are:

- Public client/profile data network
- Contractor search activation
- Managed recovery/lien services
- Contract/e-signature workflow
- Admin moderation workflow
- SEO acquisition pages and directory structure

## Verification Summary

Passed:

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run mobile:check`
- `npm run seo:check`
- Browser QA for new acquisition pages, `ai-index.json`, and `security.txt`

Build note:

- One earlier build failed because a local `next start` process had locked `.next` on Windows. After stopping the process, the build passed cleanly.

