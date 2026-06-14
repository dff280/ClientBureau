# Client Bureau Platform Audit

Date: June 14, 2026

Status note updated June 14, 2026: production is live on Supabase with `DATA_MODE=supabase` and `PLATFORM_FEATURE_DATA_MODE=supabase`. Migration `0019_contractor_subcontractor_rating_transparency.sql` and the job participant graph migration have been applied in production, and `/api/health` reports `platformCanUseSupabase: true` with all required platform tables and columns present. Use `mock` only as a temporary rollback if an advanced dashboard/admin workflow needs review.

## Core Positioning

Client Bureau should lead with:

**Check the client before you take the job.**

The long-term product should be a polished SaaS dashboard combining client risk intelligence, public client reports, contractor/business dashboards, contract templates, e-signatures, change orders, payment recovery tracking, lien-readiness tracking, evidence/document vaults, client response/dispute workflows, watchlists and monitoring, admin moderation, and SEO public profiles/city pages.

## Existing Pages

Public and SEO-visible pages:
- `/`
- `/platform`
- `/about`
- `/contact`
- `/pricing`
- `/enterprise`
- `/how-it-works`
- `/resources`
- `/mobile-app`
- `/search`
- `/client/[slug]`
- `/businesses`
- `/business/[slug]`
- `/profiles`
- `/profiles/[profileType]`
- `/profiles/[profileType]/[slug]`
- `/clients`
- `/clients/[market]`
- `/clients/[market]/[city]`
- `/reports/[type]`
- `/industries/[industry]`
- `/score-methodology`
- `/business-rating-methodology`
- `/client-screening-for-contractors`
- `/contractor-contract-template`
- `/florida-contractor-agreement-template`
- `/change-order-template`
- `/payment-recovery-service`
- `/florida-lien-notice-service`
- `/florida-lien-filing-service`
- `/homeowner-wont-pay-contractor`
- `/claim-profile`
- `/terms`
- `/privacy`
- `/report-policy`
- `/dispute-policy`
- `/moderation-policy`
- `/llms.txt`
- `/robots.txt`
- `/sitemap.xml`

Authenticated contractor/client-facing pages:
- `/dashboard`
- `/dashboard/jobs`
- `/dashboard/jobs/[jobId]`
- `/dashboard/[tool]`
- `/submit-report`
- `/client-response`
- `/contract/[token]`
- `/login`
- `/signup`

Admin pages:
- `/admin`
- `/admin/reports`
- `/admin/reviews`
- `/admin/profiles`
- `/admin/clients`
- `/admin/contractors`
- `/admin/discussions`
- `/admin/uploads`
- `/admin/recovery`
- `/admin/contracts`
- `/admin/audit-log`
- `/admin/settings`

API and system routes:
- `/api/session`
- `/api/admin/session`
- `/api/auth/login`
- `/api/auth/logout`
- `/api/stripe/checkout`
- `/api/stripe/webhook`
- `/auth/callback`
- dynamic icon, Apple icon, Open Graph image, and Twitter image routes.

## Existing Features

- Supabase-backed auth, users, contractor profiles, client profiles, unified entity profiles, reports, evidence, responses, subscriptions, admin reviews, discussions, audit logs, Jobs, job participants, contracts, recovery/lien workflows, and RLS migrations.
- Mock fallback plus Supabase adapter boundary for launch-safe rollback.
- Admin report approval and publication flow that recalculates score/risk and creates or updates public profiles.
- Public SEO profiles with moderated summaries, score explanations, positive reports, dispute context, evidence summaries, and right-of-response.
- Search by name, business, city/state, private identifier intent, risk level, and category.
- Profile-aware search and directory flows preserve contractor/subcontractor/client filters and canonical trade categories across suggestions, saved-search UI, claim/report CTAs, signup handoff, and report submission defaults.
- Positive and concern report submission workflows with zod validation and server actions.
- Contractor dashboard with Jobs, participant roles, pipeline, watchlist, monitoring, drafts, intake assessments, evidence, recovery, Florida lien service, contracts, signing links, account status, activity, and reports.
- Contract signing token route and client signature form.
- Admin command center, moderation CRM, report review panel, client/contractor editors, discussion moderation, bulk upload panel, audit log, and settings.
- Stripe-ready pricing and checkout/webhook endpoints.
- SEO support: metadata, sitemap, robots, `llms.txt`, structured data, SEO landing pages, and verification script.
- Deployment support: Docker, Caddy, VPS scripts, env examples, and deployment docs.

## Missing Features

- Deeper live QA coverage for authenticated contractor and admin workflows. Public release verification is automated, but logged-in workflows still require the live QA runbook with disposable contractor/admin accounts.
- Real file upload flow for evidence vault and contract attachments in the new workflows.
- Production e-signature audit details such as IP, timestamp, signer verification, and immutable PDF copy generation.
- Payment middleman/escrow/payment collection logic. Current payment tooling is documentation and tracking only.
- State-specific lien rules engine beyond the current Florida-first service workflow.
- Full billing plan enforcement and usage limits.
- Rich notification system for watchlists, contract views/signatures, admin decisions, and payment follow-ups.
- First real verified public subcontractor/trade detail profile for production acquisition campaigns. The directory and admin launch workflow exist; production should not use fake records to clear this warning.
- More dedicated public product pages for evidence vault, monitoring, project/job files, and contractor dashboard education.

## Weak Pages

- `/dashboard`: strongest private product surface. It now has focused tool routes, but every release should continue checking that the first screen stays action-oriented instead of becoming a long feature index.
- `/admin`: broad command center with useful modules, but some sections repeat CRM widgets and cross-link to public/contractor areas.
- `/submit-report`: strong form, but it should keep guiding users into Jobs, Evidence Vault, and profile graph context when a project file already exists.
- `/contract/[token]`: functional and polished enough for launch, but signed-summary PDF generation and deeper signer verification remain future upgrades.

## Duplicate Components And Patterns

- Repeated card shells: `rounded-md border border-slate-200 bg-white p-* shadow-sm` appears across many pages.
- Repeated metric blocks across home, dashboard, admin, public profile, and landing pages.
- Repeated empty states in `risk-ops-workspace.tsx`.
- Repeated admin form/status patterns in `admin-review-panel.tsx`, `admin-moderation-crm.tsx`, and `admin-record-forms.tsx`.
- `risk-ops-workspace.tsx` contains many subcomponents in one file and should be split into pipeline, screening, reports, evidence, recovery, contracts, and shared dashboard UI modules.
- `client-bureau.ts`, `client-bureau-supabase.ts`, and `client-bureau-service.ts` are useful but large; future work should split report, profile, admin, contract, and ops repositories.

## Inconsistent Styling

- The overall palette is consistent: slate/navy, white, amber/gold, emerald/rose status colors.
- Main inconsistency is density: public pages are polished and spacious; dashboard/admin pages are dense and operational.
- Form heights vary because shadcn primitives use compact defaults while page-level forms sometimes force larger heights.
- Some older docs and support copy can still over-emphasize reports; public/product copy should keep balancing search, Jobs, contracts, evidence, recovery, lien service, and profile protection.

## Navigation Issues

- Logged-in header navigation now promotes Dashboard, Check a Client, Jobs, Report Experience, and Contracts. Deeper tools remain available through dashboard routes and footer groups.
- Dashboard tools are URL-addressable through `/dashboard/[tool]` plus dedicated Jobs routes.
- Admin navigation is isolated, grouped, and includes report moderation, profiles, contracts, recovery, uploads, audit, and settings.
- Footer links are grouped, but future passes should keep tightening labels around the broader business-owner protection platform.

## Mobile And Responsive Problems

- Dashboard and admin use grouped mobile rails/drawers, which work but should still be checked on real phones because the tool inventory is large.
- Dense dashboard metric grids can stack into a long scroll.
- Admin mobile navigation is horizontally scrollable and functional; future passes could add grouped section disclosure if the queue inventory grows further.
- Public pages generally use responsive grids well.
- Long tables in pricing/admin use horizontal overflow, which is acceptable but should be reviewed on real devices.

## SEO Problems

- Core SEO assets exist and pass the local SEO verification script.
- Homepage title and copy now use "Check a Client Before You Take the Job" positioning.
- Public product pages exist for contracts, change orders, Florida agreement starter, payment recovery, Florida lien notice, Florida lien filing, mobile app, client screening, and unpaid-invoice education.
- Remaining SEO expansion should focus on high-quality industry/trade pages, evidence vault education, Jobs/project-file education, monitoring/watchlist education, and real public subcontractor inventory.
- Search page is currently noindex, which is reasonable for private/user-specific search, but SEO landing pages should continue absorbing public discovery traffic.

## Admin Workflow Gaps

- Report moderation is the most complete admin workflow.
- Discussion moderation exists but is lighter than report moderation.
- Recovery, lien readiness, contract, and evidence oversight are Supabase-backed, but need more hands-on live QA around every create/update/refresh path.
- Admin action audit exists, but deeper entity-level timelines would help.
- Bulk upload exists, but imports remain staging-oriented; duplicate resolution could be stronger.
- Admin settings describe controls, but do not yet persist true rules configuration.

## Dashboard UX Gaps

- Dashboard is now split into a command center, focused `/dashboard/[tool]` routes, and dedicated Jobs pages, but it should continue being tested for first-screen clarity.
- Key tools are URL-addressable through `/dashboard/[tool]`; Jobs also has list/detail routes.
- Users need clearer labels: Contracts, Evidence Vault, Payment Tracking, Job Files, Watchlist, Reports.
- Advanced platform tools are live-backed when `/api/health` confirms `platformCanUseSupabase: true`, so the next product risk is workflow clarity, empty states, and admin confidence rather than database readiness.
- Contract sharing is promising and should become a main workflow, not a lower-page feature.
- Payment recovery should stay compliance-safe and framed as private documentation/tracking.

## Public Conversion Gaps

- New visitors understand "Check the client before you take the job," but the broader product direction is bigger: check, Jobs, terms, evidence, payment, resolution, and public profile protection.
- Pricing should sell saved jobs, fewer payment surprises, clearer agreements, and organized resolution.
- Public profiles should invite both concern reports and positive reports.
- Public pages should keep strengthening internal links to contracts, evidence, monitoring, Jobs, payment protection, and profile claiming as new educational pages ship.

## Design System Cleanup Plan

1. Create shared navigation data and use it across header/footer/admin shells.
2. Keep dashboard tools URL-addressable so nav can deep-link into Jobs, Contracts, Evidence, Payment Recovery, Reports, Watchlist, Billing, Activity, Alerts, and Growth.
3. Continue extracting shared SaaS primitives: metric card, module header, empty state, status badge, action panel, drawer, and queue row.
4. Split `risk-ops-workspace.tsx` into feature modules.
5. Add product pages for evidence vault, monitoring/watchlists, Jobs/project files, contractor dashboard, and subcontractor profile education.
6. Continue refining dashboard/admin mobile navigation with grouped drawers or segmented module navigation where it reduces scrolling.
7. Keep public styling premium and restrained: bureau density, fewer decorative cards, stronger section rhythm.

## Immediate Implementation Recommendation

The safest high-impact next changes are:
- Publish the first real verified public subcontractor/trade profile through the admin launch workflow.
- Create disposable QA accounts and run `npm run verify:live:release-candidate` so logged-in contractor/admin workflows are covered by the same release gate as public SEO.
- Split the largest dashboard workspace file into smaller feature modules without changing server-action behavior.
- Add evidence vault, Jobs/project-file, monitoring/watchlist, and contractor dashboard public education pages for long-tail SEO.
