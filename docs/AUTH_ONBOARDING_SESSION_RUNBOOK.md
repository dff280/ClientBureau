# Client Bureau Auth, Onboarding, And Session Runbook

This runbook documents the public-release auth posture for contractor, subcontractor, client-response, and admin access. It is intentionally operational: account type guides onboarding, public capabilities can expand later, and job-specific roles belong on Jobs participants rather than on the account itself.

## Account Model

| Concept | Purpose | Examples |
| --- | --- | --- |
| `users.role` | Authorization boundary | `contractor`, `admin` |
| `users.account_type` | First workspace and onboarding path | contractor/service business, subcontractor/trade professional, client/homeowner/customer |
| `entity_profiles.account_capabilities` | Public profile compatibility | contractor, subcontractor, client, or multiple public views |
| `project_job_profiles.role` | Role on one private job | property owner, hiring contractor, subcontractor, supplier |

Client-response accounts should not be sent into contractor dashboard tools by a signup `next` path. Admin access stays isolated through `users.role = admin`; public account capabilities do not grant admin privileges.

## Auth Lifecycle

```mermaid
flowchart TD
  A["Signup form"] --> B["Supabase signUp"]
  B --> C["Confirmation email"]
  C --> D["/auth/callback exchanges code or token"]
  D --> E["Safe destination"]
  E --> F["Dashboard, client response, search, claim, or profile path"]
  F --> G["Logout"]
  G --> H["/login?loggedOut=true"]
  H --> I["Login POST"]
  I --> J["Session cookies refreshed"]
  J --> K["Protected route access"]
  K --> L["Session expiry or lost cookie"]
  L --> H
  H --> M["Forgot password"]
  M --> N["Supabase reset email"]
  N --> D
  D --> O["/reset-password"]
  O --> P["Supabase updateUser password"]
  P --> H
```

## Supported Public Paths

- Contractor/service business: create account, confirm email, dashboard, Jobs, search, reports, contracts, recovery, lien service, evidence, watchlist, billing.
- Subcontractor/trade professional: create account, confirm email, dashboard, Jobs, trade-profile claim/correction, search, reports, evidence, payment-chain documentation.
- Client/homeowner/customer: create account, confirm email, client response, claim/correction, search/profile review, moderation contact.
- Admin: sign in through `/login?next=/admin`; admin routes remain role-protected.

## Safe Return Rules

- Login may preserve safe internal dashboard/admin/product paths.
- Signup may preserve safe product paths but blocks admin, API, auth, tokenized contract, login/signup, forgot-password, and reset-password destinations.
- Client-response signups only return to client-safe public/response paths. A client account cannot be sent to dashboard tools through a crafted signup link.
- Auth callbacks block external, protocol-relative, API, auth, contract, login/signup, forgot-password, and admin destinations. Password reset callbacks may continue to `/reset-password`.

## Password Recovery

- `/forgot-password` collects the account email and sends the request through Supabase Auth.
- The public message is non-enumerating: it does not reveal whether an email exists.
- Reset emails route through `/auth/callback?next=/reset-password`.
- `/reset-password` updates the password through Supabase `updateUser`, signs the user out, and returns them to `/login?reset=1`.
- No custom password token logic is implemented.

## Production Email Delivery

Client Bureau uses Supabase Auth for confirmation and password recovery emails. Production must use custom SMTP; the Supabase default sender is only for limited testing.

Recommended provider:

- Provider: Resend
- Sender email: `support@clientbureau.com`
- Sender name: `Client Bureau`
- SMTP host: `smtp.resend.com`
- SMTP port: `465`
- SMTP username: `resend`
- SMTP password: Resend API key stored in Supabase Auth SMTP settings only

DNS checklist:

- Verify `clientbureau.com` or a dedicated auth subdomain in Resend.
- Add the SPF, DKIM, and return-path records Resend provides.
- Add DMARC in monitor mode if missing: `_dmarc.clientbureau.com` with `v=DMARC1; p=none; rua=mailto:support@clientbureau.com`.
- Disable email link tracking for auth messages if it rewrites Supabase confirmation links.

Supabase Auth checklist:

- Site URL: `https://clientbureau.com`
- Redirect URLs:
  - `https://clientbureau.com/auth/callback`
  - `http://localhost:3000/auth/callback`
  - `http://127.0.0.1:4200/auth/callback`
- Keep email confirmation disabled until the Resend domain verifies and both confirmation and recovery emails are received.
- Re-enable required email confirmation after the disposable-account test passes.

Template copy should stay short and transactional. Use `{{ .ConfirmationURL }}` as the only primary link.

Confirmation subject: `Confirm your Client Bureau account`

```html
<h2>Confirm your email address</h2>
<p>Follow the secure link below to finish setting up your Client Bureau account.</p>
<p><a href="{{ .ConfirmationURL }}">Confirm email address</a></p>
<p>If you did not request this account, you can ignore this email.</p>
```

Recovery subject: `Reset your Client Bureau password`

```html
<h2>Reset your password</h2>
<p>We received a request to reset your Client Bureau password. Follow the secure link below to choose a new password.</p>
<p><a href="{{ .ConfirmationURL }}">Reset password</a></p>
<p>If you did not request this, you can ignore this email.</p>
```

## Cache And Privacy Rules

- `/api/session`, `/api/admin/session`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/password-reset`, and `/api/auth/update-password` use no-store auth-transition behavior.
- Public auth pages are crawlable `noindex, follow`.
- Public auth copy should not mention environment variables, Supabase internals, route-security jargon, Docker/VPS setup, or implementation terms.
- Auth pages must not expose raw evidence, private job data, admin notes, public profile hashes, or private contact identifiers.

## QA Checklist

- Create contractor, subcontractor, and client-response disposable accounts.
- Confirm email link lands on the intended safe destination.
- Attempt duplicate signup and confirm the user sees a useful error without private account details.
- Test `/login?next=/dashboard/reports`, `/login?next=/admin`, `/login?next=/api/health`, and an external `next`.
- Test `/signup?next=/search?q=John&state=FL`, `/signup?next=/dashboard/watchlist`, and `/signup?next=/admin/reports` with each account type.
- Request password reset, open latest email, update password, and log in again.
- Confirm contractor/subcontractor accounts cannot access admin.
- Confirm client-response accounts are not routed into contractor dashboard tools.
- Confirm `/api/session` and `/api/admin/session` return `Cache-Control: no-store`.

## Owner Actions

- Configure Resend, domain DNS, Supabase Auth custom SMTP, Site URL, and redirect URLs before requiring email confirmation.
- Use disposable QA accounts for strict release-candidate checks. Do not use personal or owner accounts.
- Keep Stripe and native app builds separate from this auth release unless explicitly approved.
