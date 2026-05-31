import type { Metadata } from "next"

import { PolicyPage } from "@/components/legal/policy-page"

export const metadata: Metadata = {
  title: "Report Policy",
  description: "Client Bureau report policy for contractor-submitted reports, evidence, private identifiers, and publication rules.",
}

export default function ReportPolicyPage() {
  return (
    <PolicyPage
      eyebrow="Report policy"
      title="Contractor Report Policy"
      description="Reports should be documented, specific, and written for fair moderation rather than accusation."
      sections={[
        {
          title: "Required report standard",
          body: "Reports should include project type, project location, contract amount, amount unpaid when applicable, payment status, category, and a factual public summary written in reported-experience language.",
        },
        {
          title: "Prohibited content",
          body: "Reports should not include threats, insults, irrelevant personal details, full contact information, unsupported motive claims, or content unrelated to the contractor-client transaction.",
        },
        {
          title: "Publication",
          body: "A public client profile is created or updated only after admin approval. Rejected reports remain private and pending reports are not included in public profiles or sitemaps.",
        },
        {
          title: "Positive reports",
          body: "Positive experiences and would-work-with-again reports are supported so public profiles can reflect both favorable and concerning contractor experiences.",
        },
      ]}
    />
  )
}
