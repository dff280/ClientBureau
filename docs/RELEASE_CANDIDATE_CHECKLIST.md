# Client Bureau Release Candidate Checklist

Use this checklist before calling a production build launch-ready. It is intentionally stricter than a normal deploy check because Client Bureau now has live Supabase-backed public records, dashboard tools, admin workflows, and SEO surfaces.

## 1. Automated Gates

Run the local gate from the project root:

```powershell
npm run lint
npm test
npm run build
npm run route:check
npm run workspace:check
npm run seo:check:local
npm run mobile:check
```

Run the live public gate after deployment:

```powershell
$env:LIVE_BASE_URL="https://clientbureau.com"
npm run verify:live
Remove-Item Env:LIVE_BASE_URL

$env:SEO_BASE_URL="https://clientbureau.com"
npm run seo:check
Remove-Item Env:SEO_BASE_URL
```

Run the strict release-candidate gate with disposable QA accounts:

```powershell
Copy-Item .env.qa.example .env.qa.local
notepad .env.qa.local
npm run verify:live:release-candidate
```

The release-candidate command must fail if contractor/admin QA credentials are missing. Do not use personal accounts for this gate, and never commit `.env.qa.local`.

## 2. Contractor Workflow QA

Use a disposable contractor or service-business account.

- Sign up, log in, log out, and log back in.
- Open `/dashboard` and confirm it shows Check a Client, Today's Work, Jobs, recent records, and clear empty states.
- Create a private Job with property/site info, scope, and participant roles.
- Save or watch a client search.
- Create or continue a report draft, then submit one positive and one payment-issue test report with neutral language.
- Create a contract packet and private signing link.
- Open a Payment Recovery case and confirm the next step is clear.
- Open a Florida Lien Service case and confirm authorization/readiness language is careful.
- Review Evidence Vault, Watchlist, Billing, Activity, Alerts, and Growth pages.
- Refresh after each mutation and confirm records persist or show a clear success/error state.

## 3. Admin Workflow QA

Use a disposable admin account.

- Log in at `/login?next=/admin` and move between every admin page without being returned to login.
- Confirm `/api/admin/session` returns authenticated admin JSON with `Cache-Control: no-store`.
- Approve, reject, and delete only disposable report records; cards should update without stale queue state.
- Edit a client profile and a business/trade profile with required moderator notes.
- Verify account classification can represent client, contractor, subcontractor, or multiple capabilities.
- Review subcontractor launch readiness, public preview links, visibility state, verification state, rating model, and missing-field warnings.
- Review recovery/lien, contracts, uploads, discussions, audit log, and settings for clear queues and no blank states.

## 4. Public And SEO QA

- A new visitor should understand the three databases within five seconds: Client Database, Contractor Database, Subcontractor Database.
- `/search` remains crawlable `noindex, follow`; public database/profile/resource/service pages remain indexable when useful.
- Sitemap contains only canonical, useful, indexable URLs.
- Public profile pages are server-rendered, not loading shells.
- Public pages never expose raw emails, phone numbers, street addresses, private job data, raw evidence paths, pending/rejected content, private contract snapshots, or admin notes.
- Client, contractor, and subcontractor profile pages use cautious language and avoid fake stars, `AggregateRating`, guarantees, blacklist framing, legal-advice claims, or fake urgency.

## 5. Release Sign-Off

A release is launch-ready only when:

- all local gates pass,
- live public verification passes,
- live SEO verification passes,
- strict authenticated QA passes,
- manual contractor/admin smoke tests find no blocking workflow issue,
- `/api/health` reports `coreLiveReady: true` and `platformCanUseSupabase: true`,
- Stripe warnings are accepted only if billing remains intentionally deferred.
