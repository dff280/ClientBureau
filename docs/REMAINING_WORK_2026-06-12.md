# Client Bureau Remaining Work - June 12, 2026

## Current Live State

- Website is live at `https://clientbureau.com`.
- Deployed version is `0.4.2` at commit `f0a9a40`.
- Core production mode is `DATA_MODE=supabase`.
- Advanced platform mode is active with `PLATFORM_FEATURE_DATA_MODE=supabase`.
- `/api/health` is `ok` for core and advanced platform readiness.
- Stripe remains intentionally deferred.

## Immediate Launch Tasks

1. Publish at least one real, verified subcontractor/trade-professional profile. Do not create a fake public profile for SEO.
2. Use `docs/SUBCONTRACTOR_PROFILE_LAUNCH_RUNBOOK.md` before making the record public.
3. Run:

```bash
LIVE_BASE_URL=https://clientbureau.com npm run verify:live
SEO_BASE_URL=https://clientbureau.com npm run seo:check
```

## Authenticated QA Still Needed

Set temporary local QA credentials and run:

```powershell
$env:LIVE_BASE_URL="https://clientbureau.com"
$env:CONTRACTOR_QA_EMAIL="contractor-qa@example.com"
$env:CONTRACTOR_QA_PASSWORD="private-password"
$env:ADMIN_QA_EMAIL="admin-qa@example.com"
$env:ADMIN_QA_PASSWORD="private-password"
npm run verify:live:auth
```

Then manually verify contractor and admin workflows with disposable records:

- contractor dashboard, search save/watch, report submission, contracts, recovery, lien service, evidence, activity
- admin report approve/reject/delete, profile edits, claim review, graph tools, recovery/lien/contract oversight, audit notes
- public profile creation/update after report approval

## Near-Term Product Work

- Add more real contractor, subcontractor, and city/state profile inventory.
- Continue simplifying dashboard/admin screens based on signed-in QA findings.
- Add true evidence file upload flow and stronger attachment review states.
- Configure Stripe only when billing is ready to test end-to-end.
- Continue Android app polish without building APK/AAB until release-ready.
