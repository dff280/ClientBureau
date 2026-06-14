# Client Bureau

Client Bureau is a contractor and service-business protection platform for checking clients before a job, documenting project records, managing contracts, organizing private evidence, tracking recovery/lien service workflows, publishing moderated public profiles, and supporting fair response/correction paths.

Production is designed around Supabase-backed auth, Postgres, storage-ready workflows, public SEO profiles, private dashboard tools, and an isolated admin operations CRM. Stripe routes are present but billing remains intentionally deferred until checkout and webhook QA are approved.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Supabase-backed auth, Postgres, storage-ready records, and RLS migrations
- Stripe-ready subscription checkout and webhook route
- Typed server actions with zod validation and Supabase/mock adapter boundaries
- Focused Vitest coverage for scoring, slugs, search, schemas, release health, mobile payloads, and moderation flows
- Docker + Caddy deployment files for a VPS launch

## Local Development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

Local development can run without secrets by using the mock adapters:

```bash
DATA_MODE=mock
PLATFORM_FEATURE_DATA_MODE=mock
```

Production should use:

```bash
DATA_MODE=supabase
PLATFORM_FEATURE_DATA_MODE=supabase
```

Keep `PLATFORM_FEATURE_DATA_MODE=mock` only as a rollback switch if `/api/health` reports missing advanced platform tables/columns or a live ops workflow needs review.

## Environment

Copy `.env.example` to `.env.local` when connecting services.

```bash
DATA_MODE=supabase
PLATFORM_FEATURE_DATA_MODE=supabase
NEXT_PUBLIC_SITE_URL=https://clientbureau.com
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_PRICE_TEAM_MONTHLY=
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=
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

## Product Surfaces

- Public conversion pages: homepage, platform, pricing, resources, service pages, contract templates, policy pages, and mobile app landing page.
- Search and public records: client profiles, client directories, recent reports, business profiles, contractor profiles, subcontractor/trade profiles, city/state pages, and safe structured data.
- Contractor dashboard: Jobs, Reports, Contracts, Payment Recovery, Florida Lien Service, Evidence Vault, Watchlist, Alerts, Billing, Growth, and Activity.
- Admin CRM: command center, report moderation, unified profiles, client/business records, discussions, CSV intake, recovery/lien oversight, contracts, audit log, and settings.
- Android app foundation: Expo Native contractor app scaffold and mobile API layer. APK/AAB builds are intentionally manual release checkpoints.

## Integration Notes

- Mock and Supabase repository adapters live under `src/lib/repositories/`.
- Supabase client helpers are in `src/lib/supabase/`.
- Database and RLS migrations live in `supabase/migrations/`, including graph/rating, Jobs, project participant, recovery/lien, contract, and admin operations tables.
- Stripe tier data, checkout, and webhook helpers are in `src/lib/stripe/` and `src/app/api/stripe/`.
- Public client/profile pages are generated from approved records only and included in `sitemap.ts`, `llms.txt`, and `ai-index.json`.

## VPS Deployment

Deployment uses Docker Compose with Caddy as the public web server and HTTPS terminator.

```bash
cp .env.production.example .env.production
bash scripts/vps-deploy.sh
```

Full VPS, DNS, Supabase, GitHub upload, and update instructions are in `docs/DEPLOYMENT.md`.

## Verification

Local release gate:

```bash
npm run verify:local
```

Live production gate after VPS deploy:

```powershell
$env:LIVE_BASE_URL="https://clientbureau.com"
npm run verify:live
Remove-Item Env:LIVE_BASE_URL

$env:SEO_BASE_URL="https://clientbureau.com"
npm run seo:check
Remove-Item Env:SEO_BASE_URL
```

Final release-candidate gate when disposable QA credentials are configured:

```powershell
Copy-Item .env.qa.example .env.qa.local
notepad .env.qa.local
npm run verify:live:release-candidate
```

## Version History

Release notes are tracked in `CHANGELOG.md`.

Release workflow:

- `docs/RELEASE_PROCESS.md`

Current release and QA references:

- `docs/WEB_PLATFORM_FINALIZATION_AUDIT.md`
- `docs/LIVE_WORKFLOW_QA_RUNBOOK.md`
- `docs/KEYWORD_ACQUISITION_STRATEGY.md`
- `docs/SUBCONTRACTOR_PROFILE_LAUNCH_RUNBOOK.md`

## Audit Note

`npm audit` may report advisories through bundled framework dependencies. Review available patches before forcing dependency changes that alter the Next.js runtime path.
