# Client Bureau Live Workflow QA Runbook

Use this after every production deploy while `DATA_MODE=supabase` and `PLATFORM_FEATURE_DATA_MODE=supabase` are active.

## 1. Release And Health Gate

Run from the local project root after the VPS rebuild:

```powershell
$env:LIVE_BASE_URL="https://clientbureau.com"
npm run verify:live
Remove-Item Env:LIVE_BASE_URL

$env:SEO_BASE_URL="https://clientbureau.com"
npm run seo:check
Remove-Item Env:SEO_BASE_URL
```

Required result:

- `/api/version` shows the expected package version and Git commit.
- `/api/health` reports `coreLiveReady: true`, `platformCanUseSupabase: true`, and `recommendedPlatformFeatureDataMode: supabase`.
- `/api/version`, `/api/health`, `/api/session`, and `/api/admin/session` include `Cache-Control: no-store`.
- Logged-out dashboard, submit-report, and admin routes redirect to safe internal `/login` URLs, preserve the expected `next` return path, and include `Cache-Control: no-store`.
- Sitemap includes approved `/client/...` pages and unified `/profiles/...` graph pages.
- `/mobile-app` returns 200, shows the current native app version/build from `apps/mobile/app.json`, and does not show stale APK/AAB artifact links.
- Public pages pass production-copy safety checks: no MVP/demo/mock/test-checkout wording, internal environment names, API/auth implementation terms, or inflammatory blacklist-style language.
- SEO verification covers core marketing pages, policy pages, service pages, directories, report pages, industry pages, mobile app page, and sampled public profiles.
- Public profile checks do not expose raw emails, phone numbers, street addresses, raw evidence, private contract snapshots, pending/rejected content, or admin notes.

Stripe warnings are acceptable until billing is intentionally enabled.

## 2. Contractor Account QA

Use a real contractor/business-owner account.

1. Log in and open `/dashboard`.
2. Visit each dashboard route: Reports, Watchlist, Growth, Contracts, Payment Recovery, Florida Lien Service, Evidence Vault, Alerts, Billing, Activity.
3. Confirm each route loads content or a clear empty state, never a blank page.
4. Create or update one safe test record in each live-backed tool:
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
