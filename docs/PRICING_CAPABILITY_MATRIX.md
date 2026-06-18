# Client Bureau Pricing Capability Matrix

Last updated: 2026-06-18

This matrix records what the pricing page may safely claim before public launch. Stripe and service-fee checkout remain intentionally deferred until the checkout flag, Stripe credentials, webhook, and end-to-end QA all pass.

## Billing Availability Gate

Client Bureau now uses one server-side billing gate:

- `BILLING_CHECKOUT_ENABLED=false` keeps all paid plan and service-fee checkout paths in review mode.
- `BILLING_CHECKOUT_ENABLED=true` is not enough by itself. Subscription checkout also requires `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO_MONTHLY`, and `STRIPE_PRICE_TEAM_MONTHLY`.
- Service-fee checkout requires `BILLING_CHECKOUT_ENABLED=true`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET`.
- Public pricing and dashboard billing copy must never expose technical setup details such as missing Stripe keys or pending webhooks.

## Plan Truth Table

| Plan | Public availability | Safe CTA | Implementation truth |
| --- | --- | --- | --- |
| Free | Open | `Create Free Account` | Signup, search handoff, dashboard entry, reports, profile claim/response paths, and core private tools are available subject to auth and moderation rules. |
| Pro Contractor | Activation review | `Create account for Pro` | The product workflows exist, but paid activation is not self-serve until billing checkout is explicitly enabled and QA-tested. Plan interest is saved during signup. |
| Bureau Team | Scoped review | `Request team review` | Team-facing workflows can be planned and reviewed, but seat management, manager controls, shared-team authorization, shared watchlist ownership, and export governance are not launch-proven self-serve features. |
| Enterprise | Scoped review | `Request enterprise review` | Enterprise inquiries are collected and reviewed privately. API/data partnerships, custom exports, SSO, procurement, and managed rollout terms require separate approval and implementation review. |

## Feature Classification

| Capability | Classification | Public copy rule |
| --- | --- | --- |
| Client checks and public profile viewing | Implemented | Can be described as the core product. |
| Report submission and moderation | Implemented | Emphasize moderated, contractor-submitted experiences. |
| Client response/correction | Implemented | Emphasize fairness and response rights. |
| Contractor and subcontractor public profiles | Implemented | Describe as public trust/profile database surfaces, not guarantees or star reviews. |
| Jobs and participant roles | Implemented private workflow | Describe as private job records and role context, not public job disclosure. |
| Contracts/signing packets | Implemented private workflow | Describe as private signing packets and agreement records. Avoid legal-advice language. |
| Evidence Vault | Implemented private workflow | Describe as private documentation summaries. Do not imply public evidence files are shown. |
| Payment Recovery | Implemented service workflow, billing deferred | Describe as managed review/resolution workflow. Do not imply automatic collection or open checkout while billing is deferred. |
| Florida Lien Service | Implemented service workflow, billing deferred | Describe as Florida-first, review-gated, contractor-authorized workflow. Do not imply legal outcome, priority, or enforceability. |
| Team seats and manager controls | Partial/planned | Use review/scoping language only. Do not promise active self-serve seat administration. |
| Shared team watchlists/jobs/contracts/evidence | Partial/planned | Use "team workflow review" until authorization, ownership, and audit behavior are QA-proven. |
| CSV exports/imports | Partial/planned | Use "review path" language, not live export promises. |
| Stripe subscriptions | Deferred | Paid plan activation is reviewed before billing is collected. |
| Service-fee checkout | Deferred | Case records can be saved; fee payment is reviewed before billing is collected. |

## Owner Action Before Turning Billing On

Do not set `BILLING_CHECKOUT_ENABLED=true` until these checks pass with disposable test accounts and Stripe test mode:

1. Pro and Team price IDs exist and match the intended pricing.
2. Checkout create, cancel, and return flows work.
3. Webhook signature validation works.
4. Subscription status updates in Supabase after webhook delivery.
5. Duplicate webhook delivery is idempotent.
6. Service-fee checkout works for Payment Recovery and Florida Lien Service.
7. Failed-payment, cancelled-subscription, and no-webhook states produce clear dashboard copy.
8. Public pricing, dashboard billing, recovery, and lien service copy is reviewed again for legal and customer-support accuracy.

