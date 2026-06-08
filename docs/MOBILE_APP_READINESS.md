# Client Bureau Mobile App Readiness

Client Bureau is preparing for eventual iOS and Android apps while keeping the current Next.js web platform as the public, SEO, admin, and desktop operations surface.

The native app should not call Next.js server actions directly. It should use stable, authenticated JSON endpoints built as a mobile backend-for-frontend layer. The current web app can continue using server components, server actions, Supabase Auth cookies, and SEO-focused public pages.

## Current Audit Summary

The platform already has the right product shape for mobile:

- Search is the primary action and can become the app home screen.
- The dashboard has focused tool pages instead of one long all-in-one workspace.
- Public profiles are server-rendered, SEO-safe, and private-data guarded.
- Contracts, recovery, lien service, evidence, watchlist, and reports have clear product boundaries.
- Admin remains best as a web-first moderation CRM.

Current mobile readiness status:

- Components: dashboard shell and search are ready; dense operations modules need native adapters.
- APIs: mobile BFF endpoints now exist for account, dashboard, search, saved searches, reports, contracts, evidence, watchlist, managed recovery, and Florida lien service; client response, upload handoff, and native checkout handoff remain in the backlog.
- Responsive layout: public profile, search, and dashboard entry are ready; submission and contract signing should become native step flows.
- Workflows: all core customer workflows are mapped, but most need mobile-specific JSON contracts before native build.

## Recommended Mobile Architecture

Use this split:

- Web app: SEO pages, logged-in dashboard, admin CRM, public client profiles, contract share pages, pricing, policies, legal pages.
- Supabase: Auth, Postgres, storage, RLS, private evidence, public profile publication state.
- Mobile BFF routes: stable JSON endpoints under `/api/mobile/*` for app workflows.
- Native apps: iOS/Android screens that consume the BFF, use Supabase Auth SDKs, and upload evidence through signed storage flows.

Do not expose raw Supabase table shapes directly to mobile apps. The app should receive product-level payloads, such as dashboard summaries, report status cards, contract packet summaries, evidence status records, and payment recovery case progress.

## Mobile API Backlog And Foundation

Implemented first:

- `/api/mobile/me`: current account, role, and identity payload.
- `/api/mobile/dashboard`: contractor profile, verification, report/search counts, subscription, and private ops summaries.
- `/api/mobile/recovery`: managed recovery cases, fee state, Resolution Desk progress, and service readiness.
- `/api/mobile/lien-service`: Florida lien cases, authorization state, vendor/attorney review status, and service readiness.
- `/api/mobile/search`: predictive search, saved searches, result previews, private-match messaging.
- `/api/mobile/saved-searches`: save and list mobile-safe saved searches.
- `/api/mobile/reports`: draft, submit, status tracking, positive reports, evidence attachment mapping.
- `/api/mobile/contracts`: agreement packets, signing links, share status, signature status.
- `/api/mobile/evidence`: private evidence vault summaries and signed upload handoff.
- `/api/mobile/watchlist`: watched clients and private alert counts.

Remaining backlog after the first APK foundation:

- `/api/mobile/client-response`: public response, dispute, correction, resolution update submissions.
- `/api/mobile/uploads`: signed evidence upload handoff for camera, screenshots, contracts, invoices, PDFs, and photos.
- `/api/mobile/checkout`: hosted checkout handoff for subscriptions and service fees when billing is enabled.

Each endpoint should:

- Require auth unless the workflow is intentionally public.
- Return no raw emails, phone numbers, street addresses, raw storage paths, private evidence files, internal notes, or hidden moderation fields.
- Use stable camelCase JSON payloads.
- Include `Cache-Control: no-store` for private data.
- Validate inputs with the existing `zod` schemas or mobile-specific derivatives.
- Return the shared `ActionResult<T>` shape for mutations.

## Mobile-First Workflow Map

1. Search a client
   - App home search bar with predictive suggestions.
   - Result preview shows public profile status, confidence, report count, and private-match language.
   - Primary action: open public profile or save/watch client.

2. Daily dashboard
   - Shows today's work, alerts, open recovery cases, pending contracts, evidence needs, and billing state.
   - Avoid long scrolls; use task cards and one primary action per section.

3. Submit a report
   - Native stepper: client identity, project details, payment timeline, public summary, evidence, attestations.
   - Save drafts locally and server-side.
   - Use camera/file upload with signed storage handoff.

4. Contracts and e-signatures
   - Contractor creates agreement packet.
   - Client opens signing link on web or native deep link.
   - Signing creates immutable private snapshot and status update.

5. Managed payment recovery
   - Contractor opens a Resolution Desk case.
   - App tracks fee state, staff review, client contact progress, offers, and resolution.
   - Payments remain contractor-direct unless a later payment product is launched.

6. Florida lien service
   - Contractor submits case details, documents, and authorization.
   - App tracks fee, document review, vendor/attorney review, filing, recording proof, release state.
   - Keep legal and filing records private.

7. Client response and dispute
   - Public or invited client can submit response, correction, dispute, or resolution update.
   - All submissions go through moderation before public display.

## Responsive Audit

Immediate responsive priorities:

- Keep desktop sidebars off the first mobile screen.
- Put the current page task first, then navigation shortcuts.
- Use sticky bottom or top task actions only when there is one clear action.
- Convert dense tables to cards on small screens.
- Move multi-field forms into short step flows.
- Keep public pages text-first and server-rendered for SEO.
- Avoid exposing private identifiers in any mobile rendering path.

## Component Audit

The following components should guide the native build:

- `ClientDashboardShell`: source of dashboard navigation grouping and mobile tool rail.
- `SearchCommandCenter`: source of predictive search and result preview behavior.
- `EnterpriseDashboardOverview`: source of KPI vocabulary, but should become smaller native cards.
- `DashboardReports`: source of status tabs and report detail states.
- `RiskOpsWorkspace`: source of recovery, lien, evidence, watchlist, and contract concepts; split into native sections.
- `AdminShell`: web-first. Keep full admin moderation on desktop unless a limited staff app is intentionally scoped.

## Launch Checklist Before Native Development

- Add `/api/mobile/*` routes with tests.
- Decide Supabase Auth SDK strategy and deep-link redirect URLs.
- Add signed upload endpoints for evidence and contract attachments.
- Define push notification events for watchlist alerts, report status, contract viewed/signed, recovery updates, and lien case updates.
- Add app-safe feature flags and remote config.
- Add privacy regression tests against mobile payloads.
- Add rate limits for search, report submission, response/dispute submission, and uploads.

## Android APK And AAB Build Commands

The first native app lives in `apps/mobile` and uses Expo Native with EAS Build.

Local setup:

```bash
cd apps/mobile
cp .env.example .env.local
npm install
npx eas-cli login
```

Required mobile environment values:

```bash
EXPO_PUBLIC_API_BASE_URL=https://clientbureau.com
EXPO_PUBLIC_SITE_URL=https://clientbureau.com
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

Build from the repository root:

```bash
npm run mobile:typecheck
npm run mobile:doctor
npm run mobile:build:apk
npm run mobile:build:aab
```

Build profiles:

- `preview-apk`: internal Android APK for direct device testing.
- `production-aab`: Android App Bundle for Google Play Console.

EAS-managed Android signing credentials should be used unless a dedicated Client Bureau signing key is created later.
