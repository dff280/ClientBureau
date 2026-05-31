import type { Metadata } from "next"

import { PolicyPage } from "@/components/legal/policy-page"

export const metadata: Metadata = {
  title: "Content Moderation Policy",
  description: "Client Bureau moderation policy for approving, rejecting, editing, and publishing contractor-submitted report summaries.",
}

export default function ModerationPolicyPage() {
  return (
    <PolicyPage
      eyebrow="Moderation"
      title="Content Moderation Policy"
      description="Client Bureau moderation is designed to keep public profiles useful, restrained, and fair."
      sections={[
        {
          title: "Admin review",
          body: "Moderators review pending reports for evidence references, neutral wording, category fit, private identifier exposure, and public-summary clarity before approval.",
        },
        {
          title: "Edited summaries",
          body: "Moderators may edit public summaries to remove private information, soften unsupported claims, improve readability, and preserve factual reported-experience language.",
        },
        {
          title: "Approved public data",
          body: "Public pages should show only approved or dispute-labeled report summaries, positive reports, client responses, score factors, risk level, and non-sensitive identity fields.",
        },
        {
          title: "Audit trail",
          body: "Admin review records should track the report, reviewer, decision, edited public summary, publication status, and recalculated score or risk changes.",
        },
      ]}
    />
  )
}
