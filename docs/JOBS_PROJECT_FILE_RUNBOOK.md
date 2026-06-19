# Client Bureau Jobs Project File Runbook

Use this runbook for the private Jobs project-file workflow. Jobs are contractor workspace records that connect site/scope details, participants, reports, contracts, evidence, recovery, lien service, and activity without exposing private project details publicly.

## Database Status

Migration `supabase/migrations/0024_job_cross_tool_links.sql` is required and is applied in production as of the Web Launch RC completion pass.

It adds nullable `project_job_id` links to existing tool tables:

- `report_drafts`
- `payment_recovery_cases`
- `managed_recovery_cases`
- `lien_notice_drafts`
- `florida_lien_cases`
- `contract_workspace_items`
- `contract_packets`
- `evidence_vault_items`

The columns are nullable so existing live records keep working. They reference `project_jobs(id)` with `on delete set null`, so deleting or retiring a private job file never deletes reports, contracts, evidence, or service records.

## Health Gate

After every production rebuild, verify:

```powershell
$env:LIVE_BASE_URL="https://clientbureau.com"
npm run verify:live
Remove-Item Env:LIVE_BASE_URL
```

Expected result:

- `/api/health` reports `coreLiveReady: true`.
- `/api/health` reports `platformCanUseSupabase: true`.
- Required platform columns include all Jobs cross-tool link columns.
- `recommendedPlatformFeatureDataMode` remains `supabase`.

## Contractor QA

Use a disposable contractor account.

1. Open `/dashboard/jobs`.
2. Create a private Job with job name, city/state, job type, trade category, scope summary, and property/site context.
3. Open `/dashboard/jobs/[jobId]`.
4. Add participants: property owner/client, hiring contractor, subcontractor, and vendor/supplier when relevant.
5. Confirm the participant form explains that account/profile type is general identity, while role on this job, hired-by, and reports-to are job-specific.
6. Remove one disposable participant role and confirm the checkbox is required, the profile/account still exists, and only the job participant row changes.
7. From the Job file, create or start one linked record in each available tool: report draft, contract workspace item or packet, recovery case, Florida lien service or notice draft, and evidence vault item/status.
8. Refresh `/dashboard/jobs/[jobId]` and confirm linked records appear in the Job detail linked-record panels.

## Admin QA

Use a disposable admin account.

1. Confirm `/admin`, `/admin/audit-log`, and `/admin/error-log` remain accessible without session loss.
2. Confirm profile/report moderation pages do not expose private Job details in public-preview cards.
3. Approve or reject only safe disposable report records.
4. Confirm public profile pages still show approved public summaries only.
5. Confirm audit events and site error rows do not print private access notes, raw evidence paths, or secret values.

## Privacy Rules

The following Job fields are private workspace data and must not appear on public client, contractor, subcontractor, business, report, sitemap, schema, analytics, or SEO surfaces:

- street address
- unit or parcel detail unless deliberately public through a moderated report summary
- access instructions
- parking instructions
- gate, lockbox, or private access notes
- site safety notes
- private job notes
- participant private notes
- raw evidence paths
- private contract snapshots
- admin notes

Public pages may mention only approved, moderated, public-safe summaries and should never expose private Job context directly.

## Rollback Guidance

If production advanced tools fail after deployment:

1. Keep `DATA_MODE=supabase` for core auth, reports, admin approval, and public profiles.
2. Temporarily set `PLATFORM_FEATURE_DATA_MODE=mock`.
3. Rebuild production.
4. Fix the missing column or action path.
5. Re-enable `PLATFORM_FEATURE_DATA_MODE=supabase` only after `/api/health` is green.

Do not remove the nullable `project_job_id` columns during rollback; they are forward-compatible and preserve existing records.
