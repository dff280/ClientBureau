# Client Bureau Reputation Graph Migration Runbook

Use this when production `/api/health` reports missing unified profile, project/job graph, or response graph columns.

## 1. Generate The SQL Bundle

From the project root:

```bash
npm run migrations:graph:file
```

This writes:

```text
supabase/migrations/manual-0014-0018-reputation-graph.sql
```

## 2. Run In Supabase

Open Supabase SQL Editor for the Client Bureau project and run the entire contents of:

```text
supabase/migrations/manual-0014-0018-reputation-graph.sql
```

The bundle contains migrations:

- `0014_multi_profile_schema.sql`
- `0015_multi_profile_backfill.sql`
- `0016_project_job_reputation_graph.sql`
- `0017_project_job_graph_backfill.sql`
- `0018_response_graph_links.sql`

If Supabase reports that the graph tables already exist but `/api/health` still shows missing graph columns, run this smaller repair file instead:

```text
supabase/migrations/manual-graph-column-repair.sql
```

That repair script avoids the table-creation section and only adds the missing columns, indexes, comments, and backfill links needed for the current production health warning.

## 3. Verify Health

After Supabase finishes the SQL:

```bash
curl https://clientbureau.com/api/health
```

Expected values:

```json
{
  "readiness": {
    "platformSchemaReady": true,
    "platformCanUseSupabase": true,
    "recommendedPlatformFeatureDataMode": "supabase"
  }
}
```

## 4. Flip Live Feature Mode

After health recommends Supabase mode, update the VPS `.env.production`:

```text
PLATFORM_FEATURE_DATA_MODE=supabase
```

Then rebuild:

```bash
cd /opt/ClientBureau
bash scripts/vps-deploy.sh
```

## 5. Rollback

If a workflow needs review, set:

```text
PLATFORM_FEATURE_DATA_MODE=mock
```

Then rebuild. Core Supabase auth, reports, admin approval, public profiles, and public SEO pages remain live.
