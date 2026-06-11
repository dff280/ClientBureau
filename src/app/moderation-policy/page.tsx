import type { Metadata } from "next"

import { PolicyPage } from "@/components/legal/policy-page"
import { JsonLd, getFaqSchema } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Content Moderation Policy",
  description:
    "Client Bureau moderation policy for approving, rejecting, editing, auditing, and publishing contractor-submitted reports and client responses.",
  alternates: {
    canonical: "/moderation-policy",
  },
}

const faqs = [
  {
    question: "What does Client Bureau review before publication?",
    answer:
      "Moderators review report specificity, category fit, evidence context, private information exposure, public-summary wording, dispute status, and policy compliance.",
  },
  {
    question: "Can moderators edit public summaries?",
    answer:
      "Yes. Moderators may edit summaries for clarity, neutrality, privacy, readability, relevance, and safer public presentation.",
  },
  {
    question: "Do pending or rejected records appear publicly?",
    answer:
      "No. Public pages should show only approved summaries, approved responses, approved discussion entries, and approved profile context.",
  },
]

export default function ModerationPolicyPage() {
  return (
    <>
      <JsonLd data={getFaqSchema(faqs)} />
      <PolicyPage
        eyebrow="Moderation"
        title="Content Moderation Policy"
        description="Client Bureau moderation is designed to keep public client profiles useful, restrained, privacy-aware, documented, and fair to contractors and clients."
        sections={[
          {
            title: "Admin review standard",
            body: "Moderators review submissions before public publication. The review focuses on whether the submission is relevant, specific, supportable, privacy-safe, and written in a way that belongs on a serious business-intelligence platform.",
            bullets: [
              "Review project facts, category fit, payment status, reported amount, timeline, response context, and evidence references.",
              "Check for raw emails, phone numbers, private addresses, unrelated personal details, internal notes, and raw evidence links.",
              "Identify duplicate reports, identity mismatch risk, unsupported claims, inflammatory wording, and missing public-summary context.",
              "Confirm whether the report is negative, positive, resolved, disputed, or needs more information.",
            ],
          },
          {
            title: "Moderation decisions",
            body: "A moderator may approve, approve with edits, reject, mark disputed, request more information, merge duplicate profile context, or hold a record for escalation.",
            bullets: [
              "Approve when the report is specific, relevant, adequately supported, and safe for public-summary publication.",
              "Approve with edits when the underlying context is publishable but the public wording needs privacy, neutrality, or clarity changes.",
              "Reject when the submission is unsupported, irrelevant, abusive, duplicate, private-information heavy, or inconsistent with policy.",
              "Escalate when legal sensitivity, identity confusion, evidence concerns, or repeated dispute activity requires closer review.",
            ],
          },
          {
            title: "Edited public summaries",
            body: "Moderators may edit public summaries so the final profile content reads as documented reported experience rather than accusation or pressure.",
            bullets: [
              "Replace inflammatory wording with neutral language such as reported, contractor-submitted, evidence reviewed privately, response pending, or resolved.",
              "Remove private identifiers, street addresses, raw links, file details, personal attacks, and unsupported motive claims.",
              "Keep enough context for contractors to understand project type, payment status, dispute status, and resolution status.",
            ],
          },
          {
            title: "Approved public data",
            body: "Public pages should show only approved or approved dispute-labeled information. Client Bureau is designed to publish limited public context, not raw case files.",
            bullets: [
              "Approved public data may include name, business name when relevant, city, state, risk level, score, report count, approved summaries, positive reports, response context, and evidence-on-file labels.",
              "Public pages should not include pending reports, rejected reports, private evidence, private identifiers, private addresses, staff-only moderation notes, or unreviewed comments.",
              "Community discussion entries and client responses default to pending until approved.",
            ],
          },
          {
            title: "Score and publication updates",
            body: "When a report is approved, rejected, disputed, resolved, or edited, moderators should ensure the related public client profile stays accurate and current.",
            bullets: [
              "Approved reports may create or update a public SEO-friendly client profile page.",
              "Report count, risk level, rating factors, dispute count, resolution count, and last-updated date should reflect approved public context.",
              "Rejected or pending content should not influence public profile wording or sitemap-visible profile content.",
            ],
          },
          {
            title: "Audit trail",
            body: "Moderation actions should be traceable. Audit history supports internal accountability, dispute review, and operational reliability.",
            bullets: [
              "Track who approved, rejected, edited, deleted, assigned, escalated, imported, or changed public visibility.",
              "Record decision reasons, edited public summaries, status changes, evidence review state, and publication results.",
              "Admin notes and audit records are internal and should not appear on public client profile pages.",
            ],
          },
        ]}
      />
    </>
  )
}
