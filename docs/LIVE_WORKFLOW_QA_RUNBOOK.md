# Client Bureau Live Workflow QA Runbook

Use this after every production deploy while `DATA_MODE=supabase` is active. Production should normally run `PLATFORM_FEATURE_DATA_MODE=supabase` after `/api/health` confirms all platform columns through the current migrations, including rating transparency and flexible Jobs participant roles.

## 1. Release And Health Gate

Run from the local project root after the VPS rebuild:

```powershell
npm run route:check

$env:LIVE_BASE_URL="https://clientbureau.com"
npm run verify:live
Remove-Item Env:LIVE_BASE_URL

$env:SEO_BASE_URL="https://clientbureau.com"
npm run seo:check
Remove-Item Env:SEO_BASE_URL
```

Optional authenticated smoke test, using disposable QA accounts only. The easiest setup is to copy the example file, fill it locally, and keep the real file uncommitted:

```powershell
Copy-Item .env.qa.example .env.qa.local
notepad .env.qa.local
npm run verify:live:auth:strict
```

The strict command fails if either QA account is missing. You can also set environment variables directly for a one-off run:

```powershell
$env:LIVE_BASE_URL="https://clientbureau.com"
$env:CONTRACTOR_QA_EMAIL="contractor-qa@example.com"
$env:CONTRACTOR_QA_PASSWORD="use-a-private-password-manager-value"
$env:ADMIN_QA_EMAIL="admin-qa@example.com"
$env:ADMIN_QA_PASSWORD="use-a-private-password-manager-value"
npm run verify:live:auth:strict
Remove-Item Env:LIVE_BASE_URL
Remove-Item Env:CONTRACTOR_QA_EMAIL
Remove-Item Env:CONTRACTOR_QA_PASSWORD
Remove-Item Env:ADMIN_QA_EMAIL
Remove-Item Env:ADMIN_QA_PASSWORD
```

Do not commit QA credentials. If no QA credentials are configured, `npm run verify:live:auth` still checks the live health gate and exits with skipped account-specific checks. Use `npm run verify:live:auth:strict` before a serious release candidate so missing QA accounts fail loudly.

For final release-candidate sign-off, run the combined gate after `.env.qa.local` is filled:

```powershell
npm run verify:live:release-candidate
```

This command runs `verify:live`, live `seo:check`, and strict authenticated workflow QA in order. It is the fastest way to confirm public pages, client dashboard routes, admin CRM routes, SEO, privacy, no-store behavior, and release identity before moving on to the next feature wave.

Required result:

- `/api/version` shows the expected package version and Git commit.
- `/api/health` reports `coreLiveReady: true`.
- If `PLATFORM_FEATURE_DATA_MODE=supabase`, `/api/health` must also report `platformCanUseSupabase: true` and `recommendedPlatformFeatureDataMode: supabase`.
- `/api/health` reports optional saved-search enhancement readiness through `optionalEnhancementColumns` and `readiness.enhancementColumnCount`. Missing `0021` saved-search filter columns may warn, but should be applied before marketing pushes that rely on saved subcontractor/trade searches.
- If `PLATFORM_FEATURE_DATA_MODE=mock`, `/api/health` may warn that a newer advanced-platform column is missing or that an ops workflow is in rollback mode; core auth, reports, admin approval, and public profiles should remain live.
- `/api/version`, `/api/health`, `/api/session`, and `/api/admin/session` include `Cache-Control: no-store`.
- Logged-out dashboard, submit-report, and admin routes redirect to safe internal `/login` URLs, preserve the expected `next` return path, and include `Cache-Control: no-store`.
- Sitemap includes approved `/client/...` pages and unified `/profiles/...` graph pages.
- `/mobile-app` returns 200, shows the current native app version/build from `apps/mobile/app.json`, and does not show stale APK/AAB artifact links.
- Public pages pass production-copy safety checks: no MVP/demo/mock/test-checkout wording, internal environment names, API/auth implementation terms, or inflammatory blacklist-style language.
- SEO verification covers core marketing pages, policy pages, service pages, directories, report pages, industry pages, mobile app page, and sampled public profiles.
- Public profile checks do not expose raw emails, phone numbers, street addresses, raw evidence, private contract snapshots, pending/rejected content, or admin notes.
- Optional authenticated QA confirms the live health gate, contractor/admin login, session endpoints, route-to-route stability, expected private workspace content, no-store private pages, and contractor denial from the admin area.
- `/profiles/subcontractor` should link to a real public subcontractor detail page before SEO/acquisition campaigns. If no verified subcontractor record exists yet, the SEO verifier may warn instead of failing; do not publish fake subcontractor records. Use `docs/SUBCONTRACTOR_PROFILE_LAUNCH_RUNBOOK.md` for the first public trade profile.

Stripe warnings are acceptable until billing is intentionally enabled.

## 2. Contractor Account QA

Use a real contractor/business-owner account.

1. Log in and open `/dashboard`.
2. Visit each dashboard route: Jobs, Reports, Watchlist, Growth, Contracts, Payment Recovery, Florida Lien Service, Evidence Vault, Alerts, Billing, Activity.
3. Confirm each route loads content or a clear empty state, never a blank page.
4. Create or update one safe test record in each live-backed tool:
   - create a private Job and add a participant role
   - save a search or watch a client
   - save a report draft
   - create an agreement packet
   - open a payment recovery case
   - open a Florida lien service case
   - update an evidence vault status
5. Refresh after each create/update and confirm the record persists.
6. Submit one positive report and one payment-issue report using neutral test data.
7. Confirm success/error states explain the next step.

## 3. Admin Account QA

Use a real admin account.

1. Log in at `/login?next=/admin`.
2. Move through every admin page without being redirected to login.
3. Open `/api/admin/session` in the same browser and confirm `authenticated: true`, `role: admin`, and `isAdmin: true`.
4. Review report queue behavior:
   - approve a test report
   - reject a test report
   - delete only safe disposable test records
   - confirm cards disappear or update without stale queue state
5. Open `/admin/profiles` and test graph operations with disposable records:
   - claim review
   - merge duplicate profiles
   - reassign a report
   - redact a public field
6. Confirm moderator/audit notes are required where expected.
7. Review `/admin/recovery`, `/admin/contracts`, `/admin/discussions`, `/admin/uploads`, `/admin/audit-log`, and `/admin/settings` for clear queues and no blank states.

## 4. Public Profile QA

After an admin approval:

1. Open the generated `/client/[slug]` page.
2. Open the generated `/profiles/[profileType]/[slug]` page when available.
3. Confirm the profile shows approved public summaries only.
4. Confirm directories and recent reports link to available profiles only.
5. Confirm public copy uses neutral language: contractor-submitted, moderated, reported experience, response context, evidence reviewed privately.
6. Confirm right-of-response and report-experience CTAs work.

## 5. Failure Handling

- If public profile pages fail, keep `DATA_MODE=supabase` and fix the report/profile publication path.
- If advanced dashboard/admin tools fail, temporarily set `PLATFORM_FEATURE_DATA_MODE=mock`, rebuild, and keep core auth/reports/public profiles live.
- If admin sessions fail, inspect `/api/admin/session` before changing code.
- If private data appears publicly, stop the release, remove the exposure, rerun verification, and add a regression test.
