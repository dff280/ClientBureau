import type { Metadata } from "next"

import { PolicyPage } from "@/components/legal/policy-page"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Client Bureau MVP terms for contractor accounts, client reports, moderation, and subscriptions.",
}

export default function TermsPage() {
  return (
    <PolicyPage
      eyebrow="Terms"
      title="Terms of Service"
      description="These MVP terms describe the intended use of Client Bureau accounts, reports, public profiles, and subscription features."
      sections={[
        {
          title: "Permitted use",
          body: "Client Bureau is intended for contractors to search moderated public client profiles, submit documented client reports, and track report review status. Users may not submit content they know to be false, private, irrelevant, or harassing.",
        },
        {
          title: "Contractor-submitted reports",
          body: "Reports represent contractor-submitted experiences and are reviewed before public publication. Public summaries should focus on project facts, payment status, documented timeline, and reported experience.",
        },
        {
          title: "Subscriptions",
          body: "Pricing tiers are structured for future Stripe Billing. During test mode, checkout can be exercised safely without live charges. Live billing should remain disabled until subscription webhooks and cancellation flows are verified.",
        },
        {
          title: "No professional advice",
          body: "Client Bureau does not provide legal, credit, collection, or business advice. Contractors remain responsible for independent decision-making before accepting work.",
        },
      ]}
    />
  )
}
