import type { Metadata } from "next"

import { PolicyPage } from "@/components/legal/policy-page"
import { JsonLd, getFaqSchema } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Dispute and Response Policy",
  description:
    "Client Bureau dispute policy for client responses, correction requests, resolution updates, verification, documentation, and moderated profile context.",
  alternates: {
    canonical: "/dispute-policy",
  },
}

const faqs = [
  {
    question: "Can a client respond to a Client Bureau profile?",
    answer:
      "Yes. Clients can submit a response, dispute, correction request, or resolution update for moderation before public display.",
  },
  {
    question: "Does a dispute automatically remove a report?",
    answer:
      "No. A dispute starts a review process. Moderators consider documentation, privacy, policy compliance, and resolution context before making changes.",
  },
  {
    question: "What information should a client include?",
    answer:
      "Clients should include identifying details for verification, the profile or report they are responding to, a clear explanation, and supporting documentation when available.",
  },
]

export default function DisputePolicyPage() {
  return (
    <>
      <JsonLd data={getFaqSchema(faqs)} />
      <PolicyPage
        eyebrow="Disputes"
        title="Dispute and Response Policy"
        description="Public client-risk information is more useful when clients have a clear, moderated way to provide context, request corrections, document resolution, or dispute a report."
        sections={[
          {
            title: "Right of response",
            body: "A client named in a public profile may submit a response, dispute, correction request, or resolution update. Client Bureau reviews these submissions before public display.",
            bullets: [
              "Responses should identify the profile or report being addressed and explain the client's position in clear, factual language.",
              "Clients may attach supporting documentation such as proof of payment, contract terms, completion records, written communications, or settlement context.",
              "Client Bureau may edit public response text for privacy, relevance, readability, neutrality, and policy compliance.",
            ],
          },
          {
            title: "Verification and contact information",
            body: "Client Bureau may request verification details before reviewing a response or correction request. Verification information is used for moderation and is not intended to become public profile content.",
            bullets: [
              "Verification may include name, email, relationship to the profile, business connection, documentation, or other relevant context.",
              "Raw email addresses, phone numbers, private addresses, and verification notes should not appear on public pages.",
              "If a profile may involve an identity mismatch, the correction request should explain the mismatch and provide reliable supporting information.",
            ],
          },
          {
            title: "Dispute labeling",
            body: "When a report or profile has active dispute context, Client Bureau may show a neutral dispute or response label. The label should make clear that additional context exists without declaring either side correct.",
            bullets: [
              "A public profile may show open dispute, client response submitted, correction requested, resolution update, or resolved context when approved.",
              "Dispute labels should not imply wrongdoing, liability, fraud, guilt, or a legal finding.",
              "Moderators may add concise public context when it helps readers understand the status of the profile.",
            ],
          },
          {
            title: "Corrections and identity updates",
            body: "Client Bureau may correct profile identity fields, location, public summaries, business names, moderation labels, rating context, or report status when reliable documentation supports the change.",
            bullets: [
              "Corrections may address mistaken identity, outdated city or business information, duplicate profiles, inaccurate balance status, or resolved payment context.",
              "Some corrections may update public wording without removing the underlying report.",
              "If a correction affects rating factors or risk level, the profile can be recalculated after moderation.",
            ],
          },
          {
            title: "Resolution updates",
            body: "A resolved report should not read the same as an unresolved report. Contractors and clients can submit updates when payment, settlement, correction, or another outcome changes the context.",
            bullets: [
              "Resolution updates may include paid in full, payment plan active, partial settlement, corrected invoice, project completion, or mutual resolution.",
              "Approved resolution context may reduce public risk signals or change report status when supported.",
              "Client Bureau may keep a report public while adding resolution information when the original experience remains relevant.",
            ],
          },
          {
            title: "No automatic removal",
            body: "A dispute or response request does not automatically remove an approved report. The moderation team reviews documentation, policy compliance, privacy issues, relevance, and public-interest context before deciding what should change.",
            bullets: [
              "Client Bureau may approve a response, edit a summary, update rating context, mark a report resolved, request more information, or reject a request.",
              "Abusive, irrelevant, threatening, or unsupported response submissions may be rejected or held for review.",
              "The goal is a clearer, more accurate public record, not automatic removal or automatic publication.",
            ],
          },
        ]}
      />
    </>
  )
}
