# Client Bureau Jobs Project File Runbook

Use this when releasing the private Jobs cross-tool workflow. Jobs are private contractor workspace records that connect site/scope details, participants, reports, contracts, evidence, recovery, lien service, and activity without exposing project details publicly.

## Database Prerequisite

Apply:

```sql
supabase/migrations/0024_job_cross_tool_links.sql
```

This migration adds nullable `project_job_id` links to:

- `report_drafts`
- `payment_recovery_cases`
- `managed_recovery_cases`
- `lien_notice_drafts`
- `florida_lien_cases`
- `contract_workspace_items`
- `contract_packets`
- `evidence_vault_items`

The columns are nullable so existing records continue working. They reference `project_jobs(id)` with `on delete set null`, so retiring a private job never deletes reports, contracts, evidence, or service records.

## Health Gate

After applying the migration and rebuilding production:

```powershell
$env:LIVE_BASE_URL="https://clientbureau.com"
npm run verify:live
Remove-Item Env:LIVE_BASE_URL
```

Expected:

- `/api/health` reports `coreLiveReady: true`.
- `/api/health` reports `platformCanUseSupabase: true`.
- Platform column count includes the Jobs cross-tool link columns.
- `recommendedPlatformFeatureDataMode` remains `supabase`.

If the columns are missing, keep advanced platform mode rolled back or apply the migration before releasing linked Jobs workflows.

## Contractor QA

Use a disposable contractor account.

1. Open `/dashboard/jobs`.
2. Create a private Job with job name, city/state, job type, trade category, scope, and property/site context.
3. Open `/dashboard/jobs/[jobId]`.
4. Add participants: property owner/client, hiring contractor, subcontractor, vendor/supplier.
5. Confirm copy explains account/profile type versus role on this job.
6. Remove one disposable participant role and confirm the underlying profile/account still exists.
7. Create one linked record from the Job context in each available tool: report draft, contract, recovery, lien service, and evidence.
8. Refresh the Job detail page and confirm linked records remain attached.

## Privacy Rules

Never expose these private Job fields publicly:

- street address
- access instructions
- parking instructions
- gate, lockbox, or private access notes
- site safety notes
- private job notes
- participant private notes
- raw evidence paths
- private contract snapshots
- admin notes

Public pages may show only approved, moderated, public-safe summaries.
