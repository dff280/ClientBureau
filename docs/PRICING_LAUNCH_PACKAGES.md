# Client Bureau Launch Packages

Last updated: 2026-06-20

## Current Pricing Direction

Client Bureau launches with one free plan and two paid packages:

| Public plan | Internal tier | Price | Purpose |
| --- | --- | --- | --- |
| Free | `free` | `$0` | Database browsing, starter account, first public workflow paths. |
| Pro Check | `pro` | `$29/mo` | Client checks, saved searches, watchlists, profile alerts, and report context. |
| Bureau Pro | `bureau_team` | `$99/mo` | Full protection workspace: Jobs, contracts, evidence, recovery, Florida lien service, and priority review. |

`bureau_team` remains the internal tier key for compatibility with existing Stripe env names, subscription rows, and route handling. Public copy should call this plan **Bureau Pro**.

## Package Boundaries

- Pro Check should feel irresistible, but it should not claim the full operating system.
- Bureau Pro should be the featured/best-value plan and own the strongest features.
- Enterprise remains a lower-page inquiry/review path, not a public package card.
- Recovery, lien, attorney/vendor, e-recording, county, and pass-through costs remain separate from subscriptions.
- Stripe checkout remains gated until test-mode checkout, webhook, subscription sync, failed-payment states, and service-fee flows are QA-proven.

## Continue-From-Here Checklist

1. Confirm `/pricing` shows Free, Pro Check, and Bureau Pro as the main plans.
2. Confirm Bureau Pro is visually featured as the best value.
3. Confirm dashboard billing labels display Bureau Pro instead of Bureau Team.
4. Confirm checkout remains in review mode while billing is deferred.
5. Before enabling billing, create Stripe monthly prices for Pro Check and Bureau Pro, then set:
   - `STRIPE_PRICE_PRO_MONTHLY`
   - `STRIPE_PRICE_TEAM_MONTHLY`

