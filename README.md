# Client Bureau

Client Bureau is a contractor-first client-risk intelligence platform for documented experiences, moderated public summaries, private matching, and client response workflows. It is built with Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase-ready data boundaries, and Stripe-ready pricing structures.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Supabase-ready auth, Postgres, storage, and RLS schema
- Stripe-ready subscription checkout and webhook route
- Typed mock server actions with zod validation
- Focused Vitest coverage for scoring, slugs, search, schemas, and mock approval
- Docker + Caddy deployment files for a VPS launch

## Local Development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

Local development defaults to `DATA_MODE=mock` and `PLATFORM_FEATURE_DATA_MODE=mock`, so Supabase and Stripe secrets are not required.

## Environment

Copy `.env.example` to `.env.local` when connecting services.

```bash
DATA_MODE=mock
PLATFORM_FEATURE_DATA_MODE=mock
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

## Integration Notes

- Mock and Supabase repository adapters live under `src/lib/repositories/`.
- Supabase client helpers are in `src/lib/supabase/`.
- Database and RLS migrations live in `supabase/migrations/`, including the platform expansion migration for future live Risk Ops and Moderation CRM tables.
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
npm run seo:check
```

## Version History

Release notes are tracked in `CHANGELOG.md`.

Release workflow:

- `docs/RELEASE_PROCESS.md`

Current release audit:

- `docs/RELEASE_AUDIT_2026-06-07.md`
- `docs/KEYWORD_ACQUISITION_STRATEGY.md`

## Audit Note

`npm audit` may report advisories through bundled framework dependencies. Review available patches before forcing dependency changes that alter the Next.js runtime path.
