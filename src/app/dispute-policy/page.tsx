import type { Metadata } from "next"

import { PolicyPage } from "@/components/legal/policy-page"

export const metadata: Metadata = {
  title: "Dispute and Response Policy",
  description: "Client Bureau policy for client right-of-response, disputes, corrections, and moderated profile context.",
}

export default function DisputePolicyPage() {
  return (
    <PolicyPage
      eyebrow="Disputes"
      title="Dispute and Response Policy"
      description="Public reporting works better when clients have a visible, moderated way to add context."
      sections={[
        {
          title: "Right of response",
          body: "Clients may submit a response, dispute, or correction request for a public profile. Responses are reviewed before publication and may be edited for clarity, relevance, privacy, and safer public presentation.",
        },
        {
          title: "Dispute labeling",
          body: "When a report has active dispute context, the public profile should clearly show that a response or dispute exists without declaring either side correct.",
        },
        {
          title: "Corrections",
          body: "Client Bureau may correct profile identity fields, location, public summaries, or moderation labels when reliable documentation supports the change.",
        },
        {
          title: "No removal guarantee",
          body: "A dispute request does not automatically remove an approved report. The moderation team reviews documentation, privacy issues, and policy compliance before deciding what should remain public.",
        },
      ]}
    />
  )
}
