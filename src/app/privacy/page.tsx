import type { Metadata } from "next"

import { PolicyPage } from "@/components/legal/policy-page"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Client Bureau privacy policy for contractor accounts, private matching identifiers, evidence, and client responses.",
  alternates: {
    canonical: "/privacy",
  },
}

export default function PrivacyPage() {
  return (
    <PolicyPage
      eyebrow="Privacy"
      title="Privacy Policy"
      description="Client Bureau is designed around limited public disclosure and private identifier matching."
      sections={[
        {
          title: "Private identifiers",
          body: "Phone numbers and email addresses are used for private matching and should be stored as hashes or otherwise protected identifiers. Full phone numbers and email addresses are not displayed on public client profile pages.",
        },
        {
          title: "Evidence files",
          body: "Report evidence is reviewed privately by moderators. Public profiles show evidence summaries such as invoices reviewed, documents reviewed, or photos reviewed, not raw files.",
        },
        {
          title: "Account data",
          body: "Contractor account data is used to provide authentication, report ownership, dashboard status, subscriptions, moderation communications, and operational support.",
        },
        {
          title: "Retention and deletion",
          body: "Client Bureau may retain account records, submitted reports, evidence, responses, and moderation history as needed to operate the platform, resolve disputes, enforce policies, and meet legal obligations.",
        },
      ]}
    />
  )
}
