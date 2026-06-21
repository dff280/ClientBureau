# Signed-In Launch QA - 2026-06-21

## Result

`npm run verify:live:auth:strict` passed against live production on 2026-06-21.

## Live Target

- Site: `https://clientbureau.com`
- App version: `0.4.3`
- Verified live commit before this QA note: `de02f73e0f706b4722647a18943cf1c8aa3b6846`
- Data mode: `supabase`
- Platform feature data mode: `supabase`

## Coverage

- `/api/health` returned `status: ok`, `coreLiveReady: true`, and `platformCanUseSupabase: true`.
- Contractor account login succeeded and stayed authenticated across Dashboard, Jobs, Reports, Watchlist, Alerts, Growth, Contracts, Payment Recovery, Florida Lien Service, Evidence Vault, Billing, and Activity.
- Contractor account was denied access to `/admin` and redirected back to the dashboard.
- Admin account login succeeded and stayed authenticated across Admin Command Center, Reports, Profiles, Clients, Contractors, Discussions, Uploads, Contracts, Recovery, Audit Log, Error Log, Reviews redirect, and Settings.
- `/api/session` and `/api/admin/session` returned no-store authenticated session responses with expected roles.

## Notes

- Credentials were injected through process environment variables only and were not written to `.env.qa.local`.
- Earlier password combinations failed as expected; the final credential combination passed.
- Production record-creation QA was not performed in this run because the available accounts are real business/admin accounts, not disposable QA accounts. Mutation QA should be run with disposable records before enabling billing or declaring a final release candidate.
- Stripe remains intentionally deferred; `BILLING_CHECKOUT_ENABLED` should stay `false` until the Stripe test-mode readiness gate passes.
