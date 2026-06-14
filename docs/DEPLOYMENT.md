# Client Bureau VPS Deployment

This guide deploys Client Bureau on an Ubuntu VPS with Docker Compose and Caddy. Caddy owns ports `80` and `443` and provisions HTTPS automatically.

Production target:

```text
Domain: clientbureau.com
VPS IP: 5.78.231.192
```

## 1. DNS

In your DNS provider, point the web records to the VPS public IP:

```text
A @   -> 5.78.231.192
A www -> 5.78.231.192
```

Keep existing `MX`, `TXT`, SPF, DKIM, and DMARC records if cPanel or another provider handles email.

## 2. Supabase

1. Create a fresh Supabase project.
2. Open SQL Editor and run the migrations in order:
   - `supabase/migrations/0001_client_bureau_schema.sql`
   - `supabase/migrations/0002_admin_discussions_audit.sql`
   - `supabase/migrations/0003_platform_expansion.sql`
   - `supabase/migrations/0004_recovery_contracts.sql`
   - `supabase/migrations/0005_ops_workspace.sql`
   - `supabase/migrations/0006_launch_ops_hardening.sql`
   - `supabase/migrations/0007_contract_signing_packets.sql`
   - `supabase/migrations/0008_managed_recovery_lien_filing.sql`
   - `supabase/migrations/0009_revenue_workflow_hardening.sql`
   - `supabase/migrations/0010_search_activation_events.sql`
   - `supabase/migrations/0011_contractor_onboarding_fields.sql`
   - `supabase/migrations/0012_ratings_signup_report_intake.sql`
   - `supabase/migrations/0013_live_platform_schema_backfill.sql`
   - `supabase/migrations/0014_multi_profile_schema.sql`
   - `supabase/migrations/0015_multi_profile_backfill.sql`
   - `supabase/migrations/0016_project_job_reputation_graph.sql`
   - `supabase/migrations/0017_project_job_graph_backfill.sql`
   - `supabase/migrations/0018_response_graph_links.sql`
   - `supabase/migrations/0019_contractor_subcontractor_rating_transparency.sql`
   - `supabase/migrations/0020_job_participants_flexible_roles.sql`
   - `supabase/migrations/0021_saved_search_filter_context.sql`
3. Confirm the private Storage bucket `report-evidence` exists.
4. Copy these values for `.env.production`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY` or service role key
5. Create the first admin by signing up normally, then update the `users.role` value to `admin` in Supabase.
6. Add your exact owner login email to `ADMIN_EMAILS` in `.env.production`. The app uses this as a repair guard: a matching signed-in user is restored to `role=admin` with the Supabase service key.
7. In Supabase Auth settings, set the site URL to `https://clientbureau.com` and add `https://clientbureau.com/auth/callback` as an allowed redirect URL.

Admin promotion SQL:

```sql
-- Prefer running supabase/admin-promote.sql.
-- It creates the public.users row from auth.users if needed and sets role=admin.
```

Then log out and log back in. The admin app is:

```text
https://clientbureau.com/admin
```

If admin access fails, open:

```text
https://clientbureau.com/api/admin/session
```

Expected healthy values are `authenticated: true`, `isAdmin: true`, `adminEmailAllowlistConfigured: true`, and `serviceRoleConfigured: true`.

Launch health is available at:

```text
https://clientbureau.com/api/health
```

It returns non-secret readiness information for data mode, platform feature mode, Supabase connectivity, service-role availability, Stripe configuration, webhook configuration, required table presence, and required platform column presence.

## 3. Stripe Billing

1. Create products for Pro Contractor and Bureau Team.
2. Create recurring monthly prices and copy them into:
   - `STRIPE_PRICE_PRO_MONTHLY`
   - `STRIPE_PRICE_TEAM_MONTHLY`
3. Copy the Stripe secret key into `STRIPE_SECRET_KEY`.
4. Add a webhook endpoint:

```text
https://clientbureau.com/api/stripe/webhook
```

Subscribe to:

```text
checkout.session.completed
customer.subscription.updated
customer.subscription.deleted
invoice.paid
invoice.payment_failed
```

Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

Managed payment recovery and Florida lien service fees use Stripe payment-mode Checkout with
dynamic price data. They do not require separate Stripe price IDs in this sprint. The webhook
marks `service_fee_orders` paid when migration `0008` is applied.

## 4. Upload Source Through GitHub

Install Git for Windows locally if needed, then from the project folder:

```bash
git init
git add .
git commit -m "Launch Client Bureau"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/client-bureau.git
git push -u origin main
```

Use a private GitHub repository until legal copy, moderation workflow, and billing are verified.

## 5. Prepare The VPS

SSH into the VPS as a sudo user:

```bash
ssh root@5.78.231.192
```

Install Docker and Compose on Ubuntu:

```bash
apt update
apt install -y ca-certificates curl git
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Clone the repo:

```bash
mkdir -p /opt
cd /opt
git clone https://github.com/dff280/ClientBureau.git client-bureau
cd /opt/client-bureau
```

Create the production environment file:

```bash
cp .env.production.example .env.production
nano .env.production
```

Minimum production values:

```text
DATA_MODE=supabase
PLATFORM_FEATURE_DATA_MODE=supabase
NEXT_PUBLIC_SITE_URL=https://clientbureau.com
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_TEAM_MONTHLY=price_...
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=...
ADMIN_EMAILS=owner@example.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_CONTACT_PHONE=
NEXT_PUBLIC_CONTACT_STREET=
NEXT_PUBLIC_CONTACT_CITY=
NEXT_PUBLIC_CONTACT_STATE=
NEXT_PUBLIC_CONTACT_ZIP=
NEXT_PUBLIC_FACEBOOK_URL=
NEXT_PUBLIC_X_URL=
NEXT_PUBLIC_INSTAGRAM_URL=
NEXT_PUBLIC_YOUTUBE_URL=
NEXT_PUBLIC_LINKEDIN_URL=
```

Generate the server action encryption key:

```bash
openssl rand -base64 32
```

Use `PLATFORM_FEATURE_DATA_MODE=supabase` after migrations `0003` through `0020` are applied and `/api/health` confirms `readiness.platformCanUseSupabase: true`. Migration `0021_saved_search_filter_context.sql` is an enhancement migration for durable saved-search filter context; `/api/health` reports it under `optionalEnhancementColumns` and `readiness.enhancementColumnCount` without blocking live ops. Use `mock` as the safe mode while the newest profile-rating or Jobs participant columns are missing, or if an advanced ops workflow needs review.

If `/api/health` reports missing contract, managed recovery, Florida lien readiness, unified profile, project/job graph, response graph, rating transparency, or flexible Jobs participant columns, first confirm all migrations through `0020` have been applied. If only saved-search filter-context columns are missing, apply `0021` when convenient; the application falls back safely but saved searches will not durably retain profile/trade filters until it is applied. For older databases that received only part of the platform rollout, this repair migration remains safe to run:

```text
supabase/migrations/0013_live_platform_schema_backfill.sql
```

That migration is idempotent and exists as a production repair pass for databases that received only part of the platform schema rollout. It does not replace the multi-profile, reputation graph, and rating transparency migrations `0014` through `0019`.

For the unified reputation graph rollout, use [GRAPH_MIGRATION_RUNBOOK.md](GRAPH_MIGRATION_RUNBOOK.md). It generates one paste-ready SQL bundle for migrations `0014` through `0018`:

```bash
npm run migrations:graph:file
```

You can also confirm the same gate from `https://clientbureau.com/admin` or `https://clientbureau.com/admin/settings`. The Live Ops Readiness panel should show Supabase-backed platform mode before a normal production release.

After applying `0019` and `0020`, publish at least one real, verified subcontractor/trade-professional profile before running acquisition campaigns against `/profiles/subcontractor`. Do not create fake public profiles to satisfy SEO checks.

After the required tables are verified, enable live-backed platform operations:

```text
PLATFORM_FEATURE_DATA_MODE=supabase
```

Then rebuild:

```bash
docker compose up -d --build
```

Rollback is immediate if an ops table, RLS policy, or workflow needs more review:

```text
PLATFORM_FEATURE_DATA_MODE=mock
```

Rebuild again. Core Supabase flows for auth, report submission, admin approval, public profiles, responses, discussions, and billing remain unaffected.

## 6. Start The App

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f caddy
```

Caddy should request certificates for `clientbureau.com` and `www.clientbureau.com`.

## 7. Updates

After pushing code changes to GitHub:

```bash
ssh root@5.78.231.192
cd /opt/client-bureau
git fetch origin
git checkout main
git pull --ff-only origin main
bash scripts/vps-deploy.sh
```

If this is a fresh VPS or `/opt/client-bureau` is missing, run the latest deploy helper directly:

```bash
curl -fsSL https://raw.githubusercontent.com/dff280/ClientBureau/main/scripts/vps-deploy.sh | bash
```

The helper pulls `main`, writes `GIT_COMMIT_SHA`, `GIT_BRANCH`, and `RELEASE_DATE` into `.env.production`, stops any old legacy `clientbureau` Compose containers, rebuilds the canonical `client-bureau` Docker stack, prunes old images, and prints `/api/version` plus `/api/health`.

Production should use the lowercase path `/opt/client-bureau` and Compose project name `client-bureau`. If an older checkout exists at `/opt/ClientBureau`, do not deploy manually from both paths. The deploy helper automatically stops old legacy Compose containers before starting the canonical stack. After confirming the lowercase deployment is healthy, remove the old checkout with:

```bash
CLEANUP_LEGACY_COMPOSE=1 bash scripts/vps-deploy.sh
```

Confirm the deployed app is serving the expected release:

```bash
curl https://clientbureau.com/api/version
curl https://clientbureau.com/api/health
```

The `/api/version` endpoint returns non-secret release identity information such as the app version, optional commit environment variable, release date, data mode, and platform feature mode. `/sitemap.xml` uses the same release date for static public pages, while profile and directory URLs use their own record update dates.

## 8. Launch Checklist

Run locally before pushing:

```bash
npm run lint
npm test
npm run build
```

Verify on the VPS:

```bash
docker compose ps
curl -I https://clientbureau.com
curl https://clientbureau.com/api/version
curl https://clientbureau.com/api/health
curl https://clientbureau.com/robots.txt
curl https://clientbureau.com/sitemap.xml
```

From your local Windows machine, this repository also includes:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\verify-launch.ps1
```

After the VPS rebuild, run a full live release verification from your local machine:

```powershell
npm run verify:live

$env:SEO_BASE_URL="https://clientbureau.com"
npm run seo:check
Remove-Item Env:SEO_BASE_URL
```

The live release verification automatically checks the deployed app version and Git commit against your local `main`. It is expected to warn, not fail, while Stripe is unconfigured. It should fail if production is stale, links to unavailable public client profiles, lacks unified profile graph routes, misses diagnostic no-store headers, serves profile loading shells, loses Supabase readiness, or exposes private identifiers on public profile pages.

Browser-check these routes on desktop and mobile:

```text
/
/pricing
/how-it-works
/search
/submit-report
/dashboard
/admin
/admin/reports
/admin/discussions
/admin/uploads
/client/john-smith-orlando-fl
/terms
/privacy
/report-policy
/dispute-policy
/moderation-policy
```

Confirm auth health in the same browser you use for admin work:

```text
https://clientbureau.com/api/admin/session
```

If it returns `authenticated:false` and `authCookiePresent:false`, that browser is not logged in on `clientbureau.com`; use `https://clientbureau.com/login?next=/admin`. If it returns `adminEmailAllowlistConfigured:false`, update `.env.production`, rebuild, and log in again.

If platform readiness ever degrades, verify ops table readiness from Supabase SQL Editor:

```sql
select table_name, exists
from public.client_bureau_required_tables
order by table_name;
```

Expected result: every row has `exists = true`.

Then verify the contract signing packet fields from Supabase SQL Editor:

```sql
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'contract_packets'
  and column_name in (
    'scope_summary',
    'included_work',
    'payment_terms',
    'milestone_schedule',
    'change_order_policy',
    'cancellation_policy',
    'signed_snapshot',
    'signed_digest',
    'signed_recorded_at'
  )
order by column_name;
```

Expected result: 9 rows.

Then verify the unified profile and project/job graph tables:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'entity_profiles',
    'profile_claims',
    'project_jobs',
    'project_job_profiles',
    'profile_relationships',
    'profile_merge_events',
    'report_reassignment_events',
    'profile_redaction_events'
  )
order by table_name;
```

Expected result: 8 rows.

Finally verify response graph links so client response/dispute workflows can attach to profiles and projects without exposing private identifiers:

```sql
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'client_responses'
  and column_name in (
    'entity_profile_id',
    'project_job_id',
    'request_type',
    'verification_method',
    'attachment_reference_private'
  )
order by column_name;
```

Expected result: 5 rows.

Expected healthy `/api/health` signal for live-backed platform operations:

```json
{
  "readiness": {
    "platformCanUseSupabase": true,
    "platformSchemaReady": true,
    "recommendedPlatformFeatureDataMode": "supabase",
    "readinessLabel": "Live ops active"
  }
}
```

Before allowing Google to index real client reports, confirm:

- Public pages never show raw phone numbers or email addresses.
- Pending and rejected reports do not appear on public profiles.
- Client response and dispute links are visible on public profiles.
- Admin approval publishes or updates the client profile.
- Stripe checkout completes and webhooks update subscription status.
- cPanel or any existing web server is not bound to ports `80` or `443` for this domain.

## 9. Admin Approval Smoke Test

After creating a contractor account and submitting a test report:

1. Promote your admin account in Supabase:

Run `supabase/admin-promote.sql` in Supabase SQL Editor after replacing `YOUR_ADMIN_EMAIL@example.com`.

2. Open `https://clientbureau.com/admin/reports`.
3. Edit the public summary so it uses reported-experience language.
4. Check:
   - Evidence reviewed
   - Public summary is neutral and fact-based
   - Phone and email are not visible publicly
5. Click `Approve and publish`.
6. Use the `Public profile` link shown in the admin panel.
7. Confirm the public profile loads at:

```text
https://clientbureau.com/client/generated-client-slug
```

8. Confirm the profile is listed in the sitemap:

```bash
curl https://clientbureau.com/sitemap.xml | grep /client/
```

Useful Supabase checks:

```sql
select
  cp.first_name,
  cp.last_name,
  cp.public_slug,
  cp.is_public,
  cp.client_bureau_score,
  cp.risk_level,
  cp.report_count,
  cr.status,
  cr.public_summary
from public.client_reports cr
join public.client_profiles cp on cp.id = cr.client_id
order by cr.created_at desc
limit 20;
```
