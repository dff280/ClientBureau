# Signed-In Launch QA - 2026-06-21

## Result

`npm run verify:live:auth:strict` passed against live production on 2026-06-21. A controlled
current-account mutation QA pass was also run after owner approval.

## Live Target

- Site: `https://clientbureau.com`
- App version: `0.4.3`
- Verified live commit before protected-route QA: `de02f73e0f706b4722647a18943cf1c8aa3b6846`
- Verified live commit before current-account mutation QA: `53d16c933ea4ff3291a1fb8085e3b25c708d5a8b`
- Verified live commit after lien-link fix deploy: `9bae8e3e0bafeaf76265d04d4dd0a462e2354109`
- Data mode: `supabase`
- Platform feature data mode: `supabase`

## Coverage

- `/api/health` returned `status: ok`, `coreLiveReady: true`, and `platformCanUseSupabase: true`.
- Contractor account login succeeded and stayed authenticated across Dashboard, Jobs, Reports, Watchlist, Alerts, Growth, Contracts, Payment Recovery, Florida Lien Service, Evidence Vault, Billing, and Activity.
- Contractor account was denied access to `/admin` and redirected back to the dashboard.
- Admin account login succeeded and stayed authenticated across Admin Command Center, Reports, Profiles, Clients, Contractors, Discussions, Uploads, Contracts, Recovery, Audit Log, Error Log, Reviews redirect, and Settings.
- `/api/session` and `/api/admin/session` returned no-store authenticated session responses with expected roles.

## Current-Account Mutation QA

These records were created in production with clearly labeled QA names. They were kept private and were
not submitted for public approval.

- Created private Job: `QA Current Account Workflow 2026-06-21`
  - Job ID: `be48504f-f321-4bc1-b482-56cb89a0aadc`
  - City/state/trade: Orlando, FL / Painting
- Attached three existing profiles as job-specific participants:
  - Kyle Hoofnagle as Property Owner
  - Classic Marcite as Contractor
  - Malara Installs INC as Subcontractor
- Created linked contract records from the Job context. The Job detail panel showed `Contracts2` after refresh.
- Created linked payment recovery record: `QA Recovery Client`. The Payment Recovery page and Job detail panel showed the record after refresh.
- Created lien readiness record: `QA Lien Readiness Client`. The Lien Service page showed the record after refresh.
- Saved authenticated search fallback for `John / FL`; UI reported browser-level fallback saved search behavior.
- After deploying the lien-link fix, created a fresh lien readiness record: `QA Lien Link Retest Client`.
  The Florida Lien Service page showed the record, and the Job detail linked-record panel showed `Lien service 1`
  with the retest record attached to Job ID `be48504f-f321-4bc1-b482-56cb89a0aadc`.

## Findings

- Lien readiness records created through `createLienNoticeDraftSupabase` did not write `project_job_id`, so
  they appeared on Florida Lien Service but not on the Job detail linked-record panel. Fixed in the Supabase
  adapter by persisting `project_job_id: input.projectJobId || null`; post-deploy retest passed with a fresh
  lien readiness record created from the Job context.
- The Contract Packet form can show generic validation text after a failed blank submission. The create path
  worked after required fields were provided, but validation copy should be improved before final RC polish.
- Saved searches gracefully fall back to browser-level storage, but account-backed saved search behavior should
  be checked before marketing saved searches as a paid-account guarantee.

## Notes

- Credentials were injected through process environment variables only and were not written to `.env.qa.local`.
- Earlier password combinations failed as expected; the final credential combination passed.
- Current-account production mutation QA was authorized and performed with QA-labeled private records only.
- Create disposable QA accounts before broad destructive admin QA, report approval/rejection testing, or any checkout/billing launch gate.
- Stripe remains intentionally deferred; `BILLING_CHECKOUT_ENABLED` should stay `false` until the Stripe test-mode readiness gate passes.
