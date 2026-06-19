# Changelog

All notable Client Bureau product changes should be documented here before a release branch is pushed.

## Unreleased

### Improved

- Added a Subcontractor/Trade Database launch-readiness policy with shared admin/test guardrails for real verified trade profiles, duplicate identity review, correct Trade Partner rating models, and private-marker redaction.
- Improved the Subcontractor Database public directory with a compact verified-trade launch standard panel and no-fake-inventory messaging for low or zero inventory markets.
- Tightened SEO verification so subcontractor detail inventory warns when no real verified profile is available and only passes the launch-context check when verified trade/profile signals are present.
- Aligned live release verification with the current `/businesses` contractor database copy.
- Added a Contractor/Business Database trust-profile pass with a shared public field policy, non-endorsement verification context, role-specific contractor/subcontractor profile descriptions, canonical profile claim URLs, and admin preview links that preserve multi-capability identities.
- Added a Client Database rating-semantics pass so zero-history and one-report profiles display limited/early context, public client profiles/search/directory/share cards avoid over-certain score or risk framing, and client rating tests cover positive, adverse, disputed, resolved, evidence-backed, and response/correction states.
- Hardened the public search product pass with profile-specific no-result language, bounded result rendering, private identifier redaction, safe saved-search/search-analytics persistence, and release checks for private-match redirects.
- Added a pricing capability truth pass with a server-side billing availability gate, deferred-billing public copy, plan-interest signup preservation, service-fee checkout guards, and a documented pricing capability matrix.
- Added a privacy-safe public inquiry intake for Contact and Enterprise with server validation, duplicate-submit protection, admin retrieval in Settings, a Supabase migration, and release checks for placeholder contact language.
- Simplified the public homepage for the final release prompt pack: removed real profile snippets from the hero, replaced them with a privacy-safe database preview, kept the first action focused on client checking, and reinforced the three public database paths.
- Extended public copy safety and SEO verification so public pages fail on roadmap/internal-product phrasing and the homepage fails if decorative direct profile links return.
- Added the final release audit ledger with Prompt 00 release identity, health/readiness, route inventory, browser-sampling, command evidence, findings, and owner-action tracking.
- Simplified the contractor dashboard home and focused tool pages with compact account status, clearer start-here actions, one quick-start panel per tool, collapsed create panels, and plain-English private-record language.
- Added an admin command-center Release QA panel that links staff to release identity, admin session, dashboard persistence, and public privacy checks.
- Added focused dashboard confirmation guidance so contractors can quickly verify saved records, private evidence, contract status, recovery cases, lien service cases, alerts, and reports after using each tool.
- Added reusable admin action confidence panels across moderation, profiles, businesses/users, discussions, uploads, contracts, and recovery/lien workflows so staff can verify queue updates, public/private safety, and auditability after changes.
- Added a Search decision guide with auth-aware no-result actions so contractors know whether to review profile context, save/watch the search, submit a documented experience, or open dashboard protection tools.
- Added a public client profile decision guide that turns approved profile context into clear next actions for watchlists, reports, responses/disputes, contracts, recovery, and Florida lien service.
- Improved the client response/dispute workflow with clearer request-type guidance, submission readiness checks, and moderation-focused form copy.
- Replaced technical dashboard tool-status copy with customer-friendly live-record and guided-workspace language.
- Cleaned up admin readiness and settings language so operators see live-record, guided-workspace, and saved-record wording instead of raw feature-mode terminology.
- Updated the Android app landing page to use current mobile release metadata, remove developer-style release wording, and include the page in SEO verification.
- Made Android app download links release-safe so stale hard-coded APK/AAB artifact URLs are not shown when fresh public build URLs are not configured.
- Extended live release verification to protect the Android landing page against stale app version, build, and APK/AAB artifact copy.
- Added a shared public-copy safety gate so SEO and live release checks catch MVP/demo/mock wording, internal environment terms, implementation details, and inflammatory blacklist-style language on public surfaces.
- Expanded SEO verification across core public marketing pages and added private-marker checks for storage paths, evidence buckets, signed snapshots, raw hashes, and internal-note markers.
- Sanitized public profile community-discussion props so private author email hashes are not serialized into client-side page payloads.
- Added `npm run seo:check:local` to start the standalone Next.js build, run SEO verification, and shut down automatically.
- Added live release checks for logged-out dashboard, submit-report, and admin route protection so protected pages must redirect to safe internal login URLs with no-store cache headers and the expected return path.
- Preserved dashboard and submit-report return paths when logged-out users open protected tools, so login can return them to the exact workspace or form they requested.
- Added optional authenticated live QA verification for contractor/admin login, session endpoints, private page no-store headers, route stability, and contractor denial from admin routes.
- Polished login, signup, dashboard billing, and mobile app copy to remove technical phrasing and keep customer-facing screens clearer.
- Improved the web sign-in form with required browser-friendly email/password fields, current-password autocomplete, and a password visibility control.
- Preserved safe signup return paths so contractors can create an account from search/report/profile flows and continue where they started.
- Added test coverage for signup return-path safety, including product-path preservation and blocked admin/API/auth destinations.
- Extended live release verification to prove signup preserves safe product return paths and blocks privileged signup destinations.
- Refined signup page handling so blocked return paths are omitted until the chosen account type can determine the correct default workspace.
- Centralized login return-path sanitization and extended live release verification for login form and create-account handoff safety.
- Extended live release verification to prove login/logout auth transition redirects are explicit no-store responses.
- Aligned Caddy and app security headers and added live verification for CSP, HSTS, permissions policy, frame protection, referrer policy, and origin isolation headers.
- Updated the VPS deploy script to recreate Caddy after rebuilds so mounted edge header changes take effect during normal releases.
- Extended live release verification to prove `www.clientbureau.com` redirects to the apex host and that sensitive `Server`/`X-Powered-By` headers are not exposed.
- Added live release checks proving private mobile API endpoints require bearer-token access and return no-store responses when unauthenticated.
- Added live release checks proving private mobile mutation endpoints reject unauthenticated POST requests before accepting payloads.
- Added live release checks for `/.well-known/security.txt` contact, canonical, policy, expiry, content type, and cache metadata.
- Added live release checks for `robots.txt` crawl rules and `sitemap.xml` canonical/private-route safety.
- Added live release checks for `llms.txt` and `ai-index.json` AI/crawler readiness, canonical public URLs, privacy rules, and private-route safety.
- Added live release checks for the public search surface so `/search` stays noindexed, canonical, query-preserving, server-visible, and private-data safe.
- Added live release checks for indexable client directories, report directories, and business profile indexes so key SEO surfaces stay crawlable, canonical, privacy-safe, and present in the sitemap.
- Added live release checks for service and conversion pages including payment recovery, Florida lien services, contract templates, change orders, and the mobile app page.
- Added canonical metadata and release checks for auth, signup, and client response pages so noindex workflow surfaces stay explicit, safe, and query-aware.
- Cleaned up profile-claim privacy wording and added the indexable claim-profile page to the sitemap.
- Extended SEO verification to cover the indexable claim-profile page plus noindex workflow surfaces for login, signup, search, and client response.
- Improved the contractor Reports dashboard with mobile-first status cards, visible status counts, clearer empty states, and softer privacy-safe workflow copy.
- Improved the admin report moderation queue with filter counts, richer queue cards, checklist progress, review-age context, and a clearer review path before approval decisions.
- Fixed the admin app shell sidebar offset to prevent desktop horizontal overflow across admin pages.
- Improved admin client profile management with prioritized review signals, publication-readiness cards, report/evidence context, and a cleaner grouped editor drawer.
- Improved admin Businesses / Users with account-operations metrics, safer masked user cards, role/account filters, verification priority, and business profile completeness cues.
- Improved admin discussion moderation with queue health signals, filter counts, response-safety cues, private attachment guidance, and clearer approve/verify/reject decision panels.
- Improved admin CSV Intake with clearer batch health, private-import guardrails, validation and duplicate readiness summaries, and a more tolerant quoted-CSV preview parser.
- Improved admin Audit Log with inferred attention levels, filtered-result context, entity breadcrumbs, metadata chips, mobile cards, and clearer empty states.
- Improved admin Recovery Cases with a staff service queue board, recovery/lien readiness cards, fee and authorization gates, private case audit activity, and clearer no-case states.
- Improved admin Contracts with a daily contract desk, agreement-packet review queue, signature/payment readiness lanes, private-link health, and audit-gap signals.
- Improved admin Settings into a clearer platform control center with operating defaults, release gates, safety checklists, and compact policy rule groups.
- Improved admin Unified Profiles with a daily identity queue, claim verification preview, duplicate/visibility/redaction/evidence signals, and profile cleanup priorities.
- Improved unified search result cards with a premium dossier layout, clearer rating and match context, watch/profile/report/correction actions, and safer public-privacy copy.
- Improved public profile share cards with a native share action, clipboard fallback, clearer confirmation states, and stronger private-data safety copy.
- Improved public business profile claiming so business-profile CTAs preserve the exact profile type/slug, direct claims land in a clear verification workflow, and generic claims explain the account-first path.
- Improved shared public mobile navigation with grouped records, services, resources, dashboard tool groups, and admin access for admin users.
- Improved admin navigation active states for saved query views such as All Reports and Client Responses.
- Reduced mobile clutter on dashboard tool pages by collapsing detailed tool explanations behind a compact "How this tool works" panel.
- Added `npm run verify:live:release-candidate` to combine public live verification, live SEO, and strict authenticated contractor/admin QA into one final release-candidate gate.

## 0.4.2 - Live Workflow QA and Graph Readiness Polish

Date: June 10, 2026

### Improved

- Added a live workflow QA runbook for contractor, admin, public profile, privacy, and release verification checks.
- Extended live release verification to check diagnostic no-store headers and unified profile graph routes.
- Updated Admin Settings launch-health copy so it reflects Supabase-backed platform mode when live ops readiness is green.
- Refreshed release and platform documentation now that the reputation graph schema and advanced platform mode are live.

### Verification

- `npm test`
- `npm run lint`
- `npm run build`
- `SEO_BASE_URL=https://clientbureau.com npm run seo:check`
- `SKIP_RELEASE_IDENTITY_CHECK=1 LIVE_BASE_URL=https://clientbureau.com npm run verify:live`
- `npm run mobile:check`

## 0.4.1 - Android Login Fix and Viral Search

Date: June 9, 2026

### Fixed

- Reworked mobile input refs and password-field press handling so Android login no longer jumps from password back to email while typing.
- Kept password visibility toggles focused on the password field.

### Improved

- Added native app/profile sharing actions for Client Bureau, contractor invites, and public profile links.
- Strengthened mobile Search as the core product surface with clearer share, save, watch, and no-result actions.
- Bumped Android app metadata to `0.4.1` / versionCode `9`.

### Verification

- Pending local mobile checks and APK build.

## 0.4.0 - Android Daily Command Center

Date: June 9, 2026

### Improved

- Upgraded the Android app Home screen into a tighter contractor command center with stronger `Check a Client` positioning, daily work cards, and next-best actions.
- Strengthened mobile Search with clearer private matching guidance, compact result metrics, match confidence, save-search/watch actions, and no-result guidance.
- Reorganized the mobile Tools screen by job stage: before the job, during the job, and after an issue.
- Improved Reports with positive-report support, clearer status filtering, compact counts, and positive-client language that avoids unpaid-amount framing.
- Added plain-English `Use when`, `Private`, and `Next action` guidance to Contracts, Payment Recovery, Florida Lien Service, Evidence Vault, and Watchlist screens.
- Masked account email display in the mobile Account screen and bumped the Android app to `0.4.0` / versionCode `8`.
- Added launch-readiness checklists across auth, Home, Search, Reports, Tools, Account, and the major tool workflows so everyday contractors know what to do next.
- Added safer mobile API timeout/offline messaging so slow or unreachable requests return useful app-level guidance.

### Verification

- `npm run mobile:typecheck`
- `npm run mobile:lint`
- `npm run mobile:doctor`
- `npm run mobile:check`
- `npm run lint`
- `npm test`
- `npm run build`
- `npm run seo:check`

## 0.3.11 - VPS Compose Project Deployment Fix

Date: June 9, 2026

### Fixed

- Updated the VPS deploy helper to reuse the live `clientbureau` Docker Compose project instead of creating a second `client-bureau` project.
- Prevented duplicate Caddy startup attempts that fail when ports 80 and 443 are already owned by the live compose stack.

### Verification

- Git Bash syntax check for `scripts/vps-deploy.sh`
- `npm run lint`
- `npm test`
- `npm run build`
- `npm run seo:check`
- `npm run mobile:check`

## 0.3.10 - VPS Active Directory Detection

Date: June 9, 2026

### Fixed

- Updated the VPS deploy helper to prefer the active `/opt/ClientBureau` repo before falling back to `/opt/client-bureau`.
- Prevented the deploy helper from accidentally targeting a fresh lowercase clone when the live Docker Compose project uses the existing uppercase directory.

### Verification

- Git Bash syntax check for `scripts/vps-deploy.sh`
- `npm run lint`
- `npm test`
- `npm run build`
- `npm run seo:check`
- `npm run mobile:check`

## 0.3.9 - One-Command Live Release Verification

Date: June 9, 2026

### Improved

- `npm run verify:live` now automatically compares production against the local package version and Git commit.
- Stale production checks now print the exact VPS deploy helper command when release identity fails.
- Deployment docs now use the simplified verifier command and document the opt-out mode for release identity checks.

### Verification

- `node --check scripts/verify-live-release.mjs`
- `npm run lint`
- `npm test`
- `npm run seo:check`
- `npm run build`
- `npm run mobile:check`

## 0.3.8 - VPS Deploy Helper Hardening

Date: June 9, 2026

### Added

- Added `.gitattributes` so shell scripts keep LF endings for Ubuntu/VPS execution.

### Improved

- Hardened `scripts/vps-deploy.sh` so it fetches `main`, stamps release identity into `.env.production`, rebuilds Docker, prunes old images, and prints live version/health output.
- Simplified README, deployment docs, and release-process docs around the deploy helper.
- Updated live verification instructions to read the expected app version from `package.json`.

### Verification

- Git Bash syntax check for `scripts/vps-deploy.sh`
- `npm run lint`
- `npm test`
- `npm run seo:check`
- `npm run build`
- `npm run mobile:check`

## 0.3.7 - Release Identity + Deploy Verification Hardening

Date: June 9, 2026

### Improved

- Bumped the web app release metadata to `0.3.7` so `/api/version` can prove the deployed site is current.
- Added optional expected app version and expected commit gates to `npm run verify:live`.
- Updated VPS deployment docs to refresh `GIT_COMMIT_SHA` and `GIT_BRANCH` before each Docker rebuild.
- Added release identity environment placeholders to `.env.production.example`.

### Verification

- `node --check scripts/verify-live-release.mjs`
- `npm run lint`
- `npm test`
- `npm run seo:check`
- `npm run build`
- `npm run mobile:check`

## 0.3.6 - Android Login Fix + Mobile Release Hardening

Date: June 9, 2026

### Added

- Added a real Expo Native Android app foundation under `apps/mobile` for contractor/business-owner workflows.
- Added EAS build profiles for direct-test APKs and Google Play-ready AABs.
- Added mobile BFF endpoints for search, saved searches, reports, contracts, evidence, watchlist, signup, recovery, and Florida lien service.
- Added mobile-safe DTO helpers and tests to keep private evidence paths, raw identifiers, and signed contract snapshots out of app payloads.
- Added an Android app download page with direct-test APK and Play-ready AAB release links.

### Improved

- Mobile readiness checks now verify the native app scaffold, Android package identity, and APK/AAB build profiles.
- Mobile readiness documentation now includes setup, environment, and build commands for the Android app.
- Redesigned Android auth entry screens around a compact premium mobile login/signup experience.
- Fixed Android login and signup focus behavior so email can advance to password and password can submit without jumping focus.
- Improved shared mobile form fields with refs, keyboard return-key flow, autocomplete hints, password visibility stability, and Android autofill support.
- Polished mobile Home, Search, Reports, Tools, Account, and empty/no-result actions without changing backend APIs.

### Verification

- `npm run mobile:typecheck`
- `npm run mobile:lint`
- `npm run mobile:doctor`
- `npm run mobile:check`
- `npm run lint`
- `npm test`
- `npm run seo:check`
- `npm run build`

## 0.3.0 - Product Activation Guidance

Date: June 8, 2026

### Improved

- Focused dashboard tool pages now show live-backed/safe-mode status and plain-English next-best-action cards for reports, contracts, recovery, Florida lien service, evidence, watchlist, activity, billing, and growth.

### Verification

- `npm run lint`
- `npm test`
- `npm run build`
- `npm run seo:check`
- `npm run mobile:check`
- Live `npm run verify:live` is the post-VPS rebuild gate.

## 0.2.3 - Launch Reliability + Revenue Readiness

Date: June 8, 2026

### Added

- Added `/api/version` so live deployments expose non-secret release identity, app version, data mode, platform feature mode, and optional commit metadata.
- Added `npm run verify:live` for production release checks against `https://clientbureau.com`.
- Added `supabase/migrations/0013_live_platform_schema_backfill.sql` as an idempotent repair migration for missing contract signing, managed recovery, and Florida lien readiness columns.

### Improved

- Deployment docs now list migrations through `0013`, include safer fast-forward VPS pull commands, and document the post-deploy live verification flow.
- Release process docs now require live version/health checks and the new live verifier after each VPS rebuild.
- Admin settings now explain the safe-mode rollout path in plain English, including when to run the `0013` backfill and when to flip advanced tools to Supabase.
- The contractor dashboard snapshot now keeps deeper trends, report rollups, and activity history behind a focused details panel to reduce first-screen clutter.

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

