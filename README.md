# Client Bureau

Client Bureau is a production-ready MVP scaffold for a contractor-first client reporting platform. It is built with Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase-ready data boundaries, and Stripe-ready pricing structures.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Supabase-ready auth, Postgres, storage, and RLS schema
- Stripe test-mode subscription checkout and webhook route
- Typed mock server actions with zod validation
- Focused Vitest coverage for scoring, slugs, search, schemas, and mock approval
- Docker + Caddy deployment files for a VPS launch

## Local Development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

Local development defaults to `DATA_MODE=mock`, so Supabase and Stripe secrets are not required.

## Environment

Copy `.env.example` to `.env.local` when connecting services.

```bash
DATA_MODE=mock
NEXT_PUBLIC_SITE_URL=https://clientbureau.com
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_PRICE_TEAM_MONTHLY=
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=
```

## Integration Notes

- Mock and Supabase repository adapters live under `src/lib/repositories/`.
- Supabase client helpers are in `src/lib/supabase/`.
- The database and RLS migration is in `supabase/migrations/0001_client_bureau_schema.sql`.
- Stripe tier data, checkout, and webhook helpers are in `src/lib/stripe/` and `src/app/api/stripe/`.
- Public client profile pages are generated from approved profiles and included in `sitemap.ts`.

## VPS Deployment

Deployment uses Docker Compose with Caddy as the public web server and HTTPS terminator.

```bash
cp .env.production.example .env.production
docker compose up -d --build
```

Full VPS, DNS, Supabase, Stripe, GitHub upload, and update instructions are in `docs/DEPLOYMENT.md`.

## Verification

```bash
npm run lint
npm test
npm run build
```

## Audit Note

`npm audit` currently reports two moderate advisories through Next.js' bundled PostCSS dependency. The available automated fix suggests a major downgrade path, so this MVP leaves the dependency tree intact and should revisit the advisory when an upstream Next.js patch is available.
