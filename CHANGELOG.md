# Changelog

All notable Client Bureau product changes should be documented here before a release branch is pushed.

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

