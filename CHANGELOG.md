# Changelog

All notable Client Bureau product changes should be documented here before a release branch is pushed.

## Unreleased

## 0.2.3 - Launch Reliability + Revenue Readiness

Date: June 8, 2026

### Added

- Added `/api/version` so live deployments expose non-secret release identity, app version, data mode, platform feature mode, and optional commit metadata.
- Added `npm run verify:live` for production release checks against `https://clientbureau.com`.
- Added `supabase/migrations/0013_live_platform_schema_backfill.sql` as an idempotent repair migration for missing contract signing, managed recovery, and Florida lien readiness columns.

### Improved

- Deployment docs now list migrations through `0013`, include safer fast-forward VPS pull commands, and document the post-deploy live verification flow.
- Release process docs now require live version/health checks and the new live verifier after each VPS rebuild.

### Verification

- `npm run lint`
- `npm test`
- `npm run build`
- `npm run seo:check`
- `npm run mobile:check`
- `node --check scripts/verify-live-release.mjs`
- Live `npm run verify:live` is the post-VPS rebuild gate.

## 0.2.2 - Live SEO Profile Cleanup

Date: June 7, 2026

### Fixed

- Report-category pages and industry landing pages now render dynamically so production pages use live approved Supabase profiles instead of build-time mock profile links.
- Removed the public client profile route loading shell so indexable profile pages do not expose `Loading public client profile` as the initial H1.
- Strengthened `seo:check` so it selects a real public profile from `sitemap.xml` instead of a hard-coded sample profile.
- Added SEO verification for public landing pages that link to client profiles, preventing dead public profile links from shipping unnoticed.

### Verification

- `npm run lint`
- `npm test`
- `npm run build`
- `npm run seo:check`
- `npm run mobile:check`

## 0.2.1 - Premium UX Patch

Date: June 7, 2026

### Added

- Premium page loading states for search, public profiles, dashboard, and admin surfaces.
- Optimized WebP product visuals for search intelligence, contract packets, evidence vault, and resolution desk workflows.
- Release process documentation for feature branches, production `main`, version tags, VPS deploys, rollback, hotfixes, and release checks.

### Improved

- Homepage, pricing, search, public profile, directory, dashboard, admin, and service-page presentation were upgraded toward the credit-bureau-grade visual system.
- Shared checkbox controls now receive fallback accessible labels when a page does not provide a custom label.
- Public service pages for Payment Recovery, Florida Lien Notice, and Florida Lien Filing use stronger premium positioning and careful managed-service language.
- Admin and dashboard pages were checked for rendered overflow, blank states, missing image alt text, unlabeled buttons, and console errors at desktop and mobile widths.

### Verification

- `npm run lint`
- `npm test`
- `npm run build`
- `npm run seo:check`
- `npm run mobile:check`
- Browser QA for homepage, pricing, search, public profile, clients, reports, dashboard tools, admin pages, and Florida lien pages.

## 0.2.0 - Admin Ops CRM + SEO Growth Infrastructure

Date: June 7, 2026

### Added

- Unified Admin Ops CRM direction with cleaner command-center structure, reusable admin UI primitives, profile drawers, safer moderation notes, and improved report review context.
- High-intent SEO acquisition pages:
  - `/contractor-contract-template`
  - `/change-order-template`
  - `/homeowner-wont-pay-contractor`
  - `/client-screening-for-contractors`
- Shared acquisition page model and renderer for future landing pages.
- Keyword and acquisition strategy document for SEO, ads, lead magnets, and product-led growth.
- `/ai-index.json` for AI-readable public product context, safe language, privacy rules, and important public URLs.
- `/.well-known/security.txt` for security contact and policy discovery.
- App-level security headers in `next.config.ts`, including CSP, HSTS, frame protection, referrer policy, permissions policy, content-type sniffing protection, and cross-origin safeguards.
- SEO test coverage for acquisition page sitemap entries.

### Improved

- Payment Recovery, Florida Lien Notice, and Florida Lien Filing pages now include stronger case-prep, private workflow, and compliance-aware content.
- `llms.txt`, sitemap, robots, resources, and footer navigation now include the new acquisition and AI-discovery surfaces.
- Admin profile editing uses safer, more focused drawer-style workflows with state dropdowns and moderator note requirements.
- Admin report review UI includes richer intake fields, evidence context, safety checklist, decision notes, and "needs more information" workflow copy.
- CSV intake validates normalized state codes to reduce bad data.
- SEO verification script checks more public pages and machine-readable endpoints.

### Safety And Privacy

- No public page should expose raw emails, phone numbers, street addresses, raw evidence files, pending reports, rejected reports, private contract details, or internal admin notes.
- AI/discovery index explicitly documents safe language and prohibited public framing.
- Recovery, lien, contract, and evidence workflows remain private business records unless separately moderated for public display.

### Verification

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run mobile:check`
- `npm run seo:check`
- Browser QA on the four new acquisition pages, `/ai-index.json`, and `/.well-known/security.txt`

### Known Gaps

- GitHub CLI is not installed in the current shell, so PR creation must use the GitHub website or install `gh`.
- Advanced ops features still need production table rollout and service-mode verification before `PLATFORM_FEATURE_DATA_MODE=supabase` should be enabled.
- AI features are not implemented yet; when added, keys must stay in environment variables and never be committed.

