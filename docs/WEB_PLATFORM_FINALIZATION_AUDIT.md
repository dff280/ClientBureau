# Client Bureau Web Platform Finalization Audit

Date: 2026-06-14  
Release baseline: `0.4.2` / `2b15c4f` before this settings-polish pass

Current platform expectation: core and advanced web workflows are Supabase-backed when `/api/health` reports `platformCanUseSupabase: true`. `PLATFORM_FEATURE_DATA_MODE=mock` remains a rollback switch, not the normal launch posture.

This audit tracks the final web polish pass across public pages, contractor tools, client-facing workflows, admin CRM, visuals, and SEO. It is intentionally web-only: Android builds, Stripe activation, and new database migrations are outside this pass unless a blocking bug is discovered.

## Route Inventory

### Public Acquisition And Company Pages

- `/`
- `/platform`
- `/pricing`
- `/how-it-works`
- `/resources`
- `/about`
- `/contact`
- `/enterprise`
- `/mobile-app`

Audit focus:

- Clear five-second product understanding.
- Primary action remains `Check a Client`.
- Copy targets contractors, subcontractors, service businesses, and business owners.
- No public demo, MVP, test, mock, or developer-facing copy.
- Header/footer routes are discoverable and mobile-friendly.

### Public Search, Profiles, And Directories

- `/search`
- `/clients`
- `/clients/[market]`
- `/clients/[market]/[city]`
- `/client/[slug]`
- `/businesses`
- `/business/[slug]`
- `/profiles`
- `/profiles/[profileType]`
- `/profiles/[profileType]/[slug]`
- `/reports/[type]`
- `/industries/[industry]`

Audit focus:

- Search is noindexed and profile/directories are indexable where appropriate.
- Client, contractor, and subcontractor profiles have distinct language and next actions.
- Subcontractor directory uses real-profile launch-safe states, not fake records.
- Schema remains safe: no fake stars, `AggregateRating`, or hidden/private evidence.
- Public pages expose no raw email, phone, street address, evidence path, private job data, pending content, rejected content, or admin notes.

### Service, Template, And Methodology Pages

- `/client-screening-for-contractors`
- `/contractor-contract-template`
- `/florida-contractor-agreement-template`
- `/change-order-template`
- `/payment-recovery-service`
- `/florida-lien-notice-service`
- `/florida-lien-filing-service`
- `/homeowner-wont-pay-contractor`
- `/score-methodology`
- `/business-rating-methodology`

Audit focus:

- Each page has a premium hero, proof strip, workflow, trust guardrails, related links, FAQ, and CTA.
- Legal/service language is careful: no guarantee of payment, collection, lien priority, enforceability, or legal outcome.
- Templates are framed as workflow starters, not legal advice.
- New shared guardrail section reinforces privacy, moderation, and no-guarantee expectations.

### Auth, Intake, Client Response, And Private Token Flows

- `/login`
- `/signup`
- `/submit-report`
- `/client-response`
- `/claim-profile`
- `/contract/[token]`

Audit focus:

- Forms are plain-English, mobile-friendly, and validation-aware.
- Signup/report/claim flows use state and trade category selects where appropriate.
- Private token contract pages remain noindexed.
- Client response and correction paths are neutral and fair.

### Contractor/User Dashboard

- `/dashboard`
- `/dashboard/[tool]`
- `/dashboard/jobs`
- `/dashboard/jobs/[jobId]`

Audit focus:

- Dashboard is a daily command center, not a long undifferentiated feature list.
- Jobs, Search, Reports, Contracts, Payment Recovery, Florida Lien Service, Evidence Vault, Watchlist, Billing, Activity, and Growth are discoverable.
- Sidebar/mobile tool nav avoids duplicate promoted links and remains usable on laptops and phones.
- Empty states and setup states point to the next useful action.
- Private job address, site access, participant notes, evidence, and contract snapshots never appear publicly.

### Admin CRM

- `/admin`
- `/admin/reports`
- `/admin/profiles`
- `/admin/clients`
- `/admin/contractors`
- `/admin/discussions`
- `/admin/uploads`
- `/admin/contracts`
- `/admin/recovery`
- `/admin/audit-log`
- `/admin/settings`
- `/admin/reviews`

Audit focus:

- Admin remains isolated from public/contractor dashboard state.
- Admin navigation remains stable between pages and avoids stale duplicate clutter.
- Queue pages answer what needs action today, what is safe to publish, and what audit note is needed.
- Report moderation supports approve/reject/delete without stale cards.
- Unified profiles support subcontractor launch readiness, visibility, claim status, verification, trade category, and public-safe preview.

### Legal And Policy Pages

- `/terms`
- `/privacy`
- `/report-policy`
- `/dispute-policy`
- `/moderation-policy`

Audit focus:

- Policy pages explain moderation, privacy, response, disputes, and evidence boundaries.
- Public reports are framed as moderated reported experiences.
- No policy page promises legal, payment, collection, filing, or ranking outcomes.

## Final Acceptance Gates

- `npm run lint`
- `npm test`
- `npm run build`
- `npm run seo:check:local`
- `npm run mobile:check`
- `LIVE_BASE_URL=https://clientbureau.com npm run verify:live`
- `SEO_BASE_URL=https://clientbureau.com npm run seo:check`

## Manual Browser QA Set

Desktop and mobile browser spot-check:

- `/`
- `/platform`
- `/pricing`
- `/search`
- `/profiles/subcontractor`
- `/client/john-smith-orlando-fl`
- `/submit-report`
- `/client-response`
- `/dashboard`
- `/dashboard/jobs`
- `/dashboard/contracts`
- `/dashboard/recovery`
- `/admin`
- `/admin/reports`
- `/admin/profiles`

## Current Pass Notes

- Authenticated public header navigation was tightened so promoted contractor tools do not duplicate in the Tools menu.
- Jobs is now promoted as a first-class contractor tool in the logged-in header and footer.
- Contractor dashboard sidebar offset was adjusted for the sticky public header.
- Admin side navigation now scrolls cleanly on shorter screens.
- Acquisition/template pages now share a stronger privacy, moderation, and no-guarantee guardrail section.
- Client, profile, state, and city directory metadata was cleaned up so browser titles do not duplicate the root `Client Bureau` title template.
- Subcontractor launch readiness was tightened in `/admin/profiles` so the first public trade profile requires meaningful summary copy, public visibility, verification/claim context, and the Trade Partner Reliability rating model before staff treats it as ready.
- The subcontractor launch runbook now includes a readiness-scored SQL query and guarded publication SQL for real verified records only.
- Admin candidate cards now route staff to the source client/business editor when available, with a separate readiness review link for the unified profile queue.
- Current public SEO infrastructure is sound; the remaining subcontractor warning should clear only after a legitimate real subcontractor profile is published, not through fake inventory.
- Admin Settings now surfaces subcontractor/trade-profile activation as a release gate, with direct routing to `/admin/profiles?type=subcontractor` when the first real public profile is still missing.
- Live release verification now covers the full protected contractor/admin route set, including Jobs, Billing, Activity, Growth, Evidence, Watchlist, every admin queue, admin settings, and admin audit pages.
- SEO verification now requires every audited public page to be present in `sitemap.xml`, so metadata, public copy, privacy checks, and crawl discovery are verified as one release gate.

## Remaining Launch Work

- Publish the first verified public subcontractor/trade profile from real production data.
- Run signed-in contractor QA for `/dashboard`, `/dashboard/jobs`, `/dashboard/contracts`, `/dashboard/recovery`, `/dashboard/lien-readiness`, `/dashboard/evidence`, and `/dashboard/watchlist`.
- Run signed-in admin QA for `/admin`, `/admin/reports`, `/admin/profiles`, `/admin/clients`, `/admin/contractors`, `/admin/recovery`, and `/admin/audit-log`.
- Configure Stripe only when billing is ready to launch; public billing copy should remain conservative until checkout and webhooks pass live test mode.
- Continue Android polish separately; do not trigger APK/AAB builds until an app release checkpoint is explicitly requested.
