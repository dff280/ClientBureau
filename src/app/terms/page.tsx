import type { Metadata } from "next"

import { PolicyPage } from "@/components/legal/policy-page"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Client Bureau terms for contractor accounts, client reports, moderation, public profiles, and subscriptions.",
  alternates: {
    canonical: "/terms",
  },
}

export default function TermsPage() {
  return (
    <PolicyPage
      eyebrow="Terms"
      title="Terms of Service"
      description="These terms describe the intended use of Client Bureau accounts, reports, public profiles, moderation, and subscription features."
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
          body: "Paid plans provide expanded search, reporting, evidence, team, and moderation workflow capabilities. Subscription access may change if billing is canceled, past due, or otherwise unavailable.",
        },
        {
          title: "No professional advice",
          body: "Client Bureau does not provide legal, credit, collection, or business advice. Contractors remain responsible for independent decision-making before accepting work.",
        },
      ]}
    />
  )
}
