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

If Supabase SQL Editor reports an "unterminated dollar-quoted string" error, it means the editor ran only part of a `do $$ ... end $$;` block. Use the smaller chunk files instead and run each file separately, in order:

```text
supabase/migrations/manual-graph-repair-chunks/01-types.sql
supabase/migrations/manual-graph-repair-chunks/02-tables-policies.sql
supabase/migrations/manual-graph-repair-chunks/03-columns-indexes.sql
supabase/migrations/manual-graph-repair-chunks/04-backfill.sql
supabase/migrations/manual-graph-repair-chunks/05-comments.sql
```

Do not select only part of a chunk. Open one chunk, select all of that chunk, run it, wait for success, then continue to the next chunk.

Chunk `04-backfill.sql` only connects existing legacy records into the new graph. If it fails or Supabase SQL Editor has trouble with the larger paste, production can still run after chunks `01`, `02`, `03`, and `05` because the schema is complete. To backfill legacy data more carefully, run the smaller files in:

```text
supabase/migrations/manual-graph-repair-chunks/backfill-steps/
```

Run them in filename order from `04a-profile-defaults.sql` through `04k-profile-counts.sql`.

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
