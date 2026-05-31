import type { Metadata } from "next"

import { PolicyPage } from "@/components/legal/policy-page"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Client Bureau privacy policy for contractor accounts, private matching identifiers, evidence, and client responses.",
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
          body: "Report evidence is intended for admin-only review in a private Supabase Storage bucket. Public profiles should show moderated summaries, not raw evidence files, unless a future policy explicitly allows publication.",
        },
        {
          title: "Account data",
          body: "Contractor account data is used to provide authentication, report ownership, dashboard status, subscriptions, moderation communications, and operational support.",
        },
        {
          title: "Retention and deletion",
          body: "Production launch should define retention windows for rejected reports, evidence, responses, and subscription records before real customer onboarding begins.",
        },
      ]}
    />
  )
}
