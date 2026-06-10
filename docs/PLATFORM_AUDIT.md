# Client Bureau Platform Audit

Date: June 10, 2026

Status note: production is live on Supabase with `DATA_MODE=supabase` and `PLATFORM_FEATURE_DATA_MODE=supabase`. The unified reputation graph schema is applied and `/api/health` reports live ops active.

## Core Positioning

Client Bureau should lead with:

**Check the client before you take the job.**

The long-term product should be a polished SaaS dashboard combining client risk intelligence, public client reports, contractor/business dashboards, contract templates, e-signatures, change orders, payment recovery tracking, lien-readiness tracking, evidence/document vaults, client response/dispute workflows, watchlists and monitoring, admin moderation, and SEO public profiles/city pages.

## Existing Pages

Public and SEO-visible pages:
- `/`
- `/about`
- `/contact`
- `/pricing`
- `/enterprise`
- `/how-it-works`
- `/search`
- `/client/[slug]`
- `/profiles/[profileType]/[slug]`
- `/clients/[market]`
- `/reports/[type]`
- `/industries/[industry]`
- `/score-methodology`
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

- Supabase-ready auth, users, contractor profiles, client profiles, reports, evidence, responses, subscriptions, admin reviews, discussions, audit logs, and RLS migrations.
- Mock-first repository plus Supabase adapter boundary.
- Admin report approval and publication flow that recalculates score/risk and creates or updates public profiles.
- Public SEO profiles with moderated summaries, score explanations, positive reports, dispute context, evidence summaries, and right-of-response.
- Search by name, business, city/state, private identifier intent, risk level, and category.
- Positive and concern report submission workflows with zod validation and server actions.
- Contractor dashboard with pipeline, watchlist, monitoring, drafts, intake assessments, evidence, recovery, lien readiness, contracts, signing links, account status, activity, and reports.
- Contract signing token route and client signature form.
- Admin command center, moderation CRM, report review panel, client/contractor editors, discussion moderation, bulk upload panel, audit log, and settings.
- Stripe-ready pricing and checkout/webhook endpoints.
- SEO support: metadata, sitemap, robots, `llms.txt`, structured data, SEO landing pages, and verification script.
- Deployment support: Docker, Caddy, VPS scripts, env examples, and deployment docs.

## Missing Features

- Deeper live QA coverage for authenticated contractor and admin workflows. Public release verification is automated, but logged-in workflows still require the live QA runbook.
- Real file upload flow for evidence vault and contract attachments in the new workflows.
- Production e-signature audit details such as IP, timestamp, signer verification, and immutable PDF copy generation.
- Payment middleman/escrow/payment collection logic. Current payment tooling is documentation and tracking only.
- State-specific lien rules engine. Current lien readiness is a private checklist workflow.
- Full billing plan enforcement and usage limits.
- Rich notification system for watchlists, contract views/signatures, admin decisions, and payment follow-ups.
- Dedicated public product pages for contracts, payment protection, evidence vault, and monitoring.

## Weak Pages

- `/dashboard`: strongest product surface but too dense. It relies on tabs and accordions inside one large page, making it powerful but hard for new users to understand quickly.
- `/admin`: broad command center with useful modules, but some sections repeat CRM widgets and cross-link to public/contractor areas.
- `/how-it-works`: accurate but narrower than the new platform direction; it should describe check, terms, document, payment, and resolution.
- `/pricing`: improved but should keep moving from feature lists toward use cases and business outcomes.
- `/submit-report`: strong form, but it is still report-first. Long term it should connect more naturally to Client Work Files and Evidence Vault.
- `/contract/[token]`: functional but needs a more polished client review experience, stronger agreement summary, and clearer status timeline.

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
- Some labels still say "Risk Ops" or "contractor command center" while the new positioning is broader business-owner protection.
- Public and footer navigation still expose old "Search Clients" and "Submit Report" language more strongly than contracts, evidence, and payment protection.

## Navigation Issues

- Logged-in primary navigation is too shallow: Dashboard, Search, Submit report. It does not expose Contracts, Evidence, Payment, Watchlists, or Client Work Files.
- Dashboard tabs are not URL-addressable, so users cannot land directly on Contracts, Evidence, Payment, or Reports from the header.
- Public navigation does not clearly introduce the full platform. It reads more like a report/search site.
- Admin navigation is isolated, which is good, but it lacks explicit recovery/contracts sections even though the admin dashboard references those workflows.
- Footer links are flat instead of grouped by product, company, and policies.

## Mobile And Responsive Problems

- Dashboard and admin use horizontal tabs, which work but can feel like a long rail on small screens.
- Dense dashboard metric grids can stack into a long scroll.
- Admin mobile navigation is horizontally scrollable and functional, but it could use grouped sections.
- Public pages generally use responsive grids well.
- Long tables in pricing/admin use horizontal overflow, which is acceptable but should be reviewed on real devices.

## SEO Problems

- Core SEO assets exist and pass the local SEO verification script.
- Homepage title and copy should move from "Search Client Reports Before You Sign" toward "Check Clients Before You Take the Job" to match the new positioning.
- Some public copy still emphasizes reports more than contracts, evidence, payment protection, and monitoring.
- Missing public product pages for contracts, evidence vault, payment protection, monitoring, and contractor dashboards limit internal linking and long-tail SEO.
- Search page is currently noindex, which is reasonable for private/user-specific search, but SEO landing pages should continue absorbing public discovery traffic.

## Admin Workflow Gaps

- Report moderation is the most complete admin workflow.
- Discussion moderation exists but is lighter than report moderation.
- Recovery, lien readiness, contract, and evidence oversight are Supabase-backed, but need more hands-on live QA around every create/update/refresh path.
- Admin action audit exists, but deeper entity-level timelines would help.
- Bulk upload exists, but imports remain staging-oriented; duplicate resolution could be stronger.
- Admin settings describe controls, but do not yet persist true rules configuration.

## Dashboard UX Gaps

- One-page dashboard is powerful but scroll-heavy.
- Key tools need URL-addressable entry points or separate subroutes.
- Users need clearer labels: Contracts, Evidence Vault, Payment Tracking, Client Work Files, Watchlist, Reports.
- Advanced platform tools are live-backed, so the next product risk is workflow clarity, empty states, and admin confidence rather than database readiness.
- Contract sharing is promising and should become a main workflow, not a lower-page feature.
- Payment recovery should stay compliance-safe and framed as private documentation/tracking.

## Public Conversion Gaps

- New visitors understand "search before you sign," but the newer product direction is bigger: check, terms, evidence, payment, resolution.
- Homepage should use "Check the client before you take the job" as the first-viewport promise.
- Pricing should sell saved jobs, fewer payment surprises, clearer agreements, and organized resolution.
- Public profiles should invite both concern reports and positive reports.
- Public pages need more internal links to contracts, evidence, monitoring, and payment protection once those product pages exist.

## Design System Cleanup Plan

1. Create shared navigation data and use it across header/footer/admin shells.
2. Make dashboard tabs URL-addressable so nav can deep-link into Contracts, Evidence, Payment, Reports, and Screening.
3. Extract shared SaaS primitives: metric card, module header, empty state, status badge, action panel.
4. Split `risk-ops-workspace.tsx` into feature modules.
5. Add product pages for contracts, evidence vault, payment protection, monitoring, and contractor dashboard.
6. Refine dashboard/admin mobile tabs into grouped drawers or segmented module navigation.
7. Keep public styling premium and restrained: bureau density, fewer decorative cards, stronger section rhythm.

## Immediate Implementation Recommendation

The safest high-impact change is navigation reorganization:
- Promote the new core positioning in homepage metadata and hero copy.
- Add shared navigation definitions.
- Add logged-in links for Dashboard, Search, Contracts, Evidence, Payment, and Reports.
- Make dashboard workspace tabs accept URL params.
- Group footer links by Platform, Company, and Policies.
- Adjust admin shell language away from "New report" toward moderation and platform operations.
