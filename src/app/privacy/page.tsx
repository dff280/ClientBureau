import type { Metadata } from "next"

import { PolicyPage } from "@/components/legal/policy-page"
import { JsonLd, getFaqSchema } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Client Bureau privacy policy for contractor accounts, private matching identifiers, evidence, client responses, dashboards, and public profiles.",
  alternates: {
    canonical: "/privacy",
  },
}

const faqs = [
  {
    question: "Does Client Bureau show phone numbers or emails on public profiles?",
    answer:
      "No. Phone numbers and emails are used for private matching and are not displayed as raw public identifiers on client profile pages.",
  },
  {
    question: "Are uploaded evidence files public?",
    answer:
      "No. Evidence files are private by default. Public pages may show reviewed evidence summaries, not raw invoices, photos, contracts, screenshots, or PDFs.",
  },
  {
    question: "Why does Client Bureau keep moderation history?",
    answer:
      "Moderation history helps support audit trails, dispute review, correction requests, policy enforcement, and public-profile integrity.",
  },
]

export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={getFaqSchema(faqs)} />
      <PolicyPage
        eyebrow="Privacy"
        title="Privacy Policy"
        description="Client Bureau is designed around limited public disclosure, private identifier matching, private evidence review, and controlled publication of moderated client profile information."
        sections={[
          {
            title: "Information contractors provide",
            body: "Contractors and service businesses may provide account details, business profile information, project details, client identity fields, payment timeline information, report summaries, evidence references, contract workflow data, and dashboard activity.",
            bullets: [
              "Report submissions may include client name, business name, city, state, project type, payment status, category, public summary, detailed experience, and supporting documentation.",
              "Operational tools may include saved searches, watchlists, report drafts, intake assessments, contract packets, managed recovery notes, Florida lien service records, evidence vault items, and audit history.",
              "Subscription and billing status may be used to determine plan access, usage limits, and account support needs.",
            ],
          },
          {
            title: "Private identifiers and matching",
            body: "Client Bureau uses phone numbers, email addresses, and similar identifiers for private matching and internal review. These identifiers are not intended to appear as raw public profile content.",
            bullets: [
              "Public pages should not display raw client phone numbers, raw email addresses, private addresses, or private contact notes.",
              "Matching fields may be stored as hashes, masked values, or protected identifiers depending on the workflow.",
              "Private matching helps identify possible profile matches while reducing unnecessary public disclosure.",
            ],
          },
          {
            title: "Evidence and uploaded files",
            body: "Evidence is private by default. Moderators and authorized users may review evidence to understand report context, but public profiles should show only controlled evidence summaries.",
            bullets: [
              "Supported evidence may include invoices, contracts, screenshots, PDFs, photos, change orders, completion records, and correspondence references.",
              "Public summaries may say evidence on file, invoices reviewed, documents reviewed, photos reviewed, or contracts reviewed.",
              "Raw uploaded files, private file paths, internal evidence notes, and unapproved attachments are not intended for public pages.",
            ],
          },
          {
            title: "Client responses and correction requests",
            body: "Clients may submit responses, disputes, correction requests, verification details, and resolution updates. These submissions are reviewed before any public display.",
            bullets: [
              "Contact information supplied for verification is used to review the request and should not be displayed publicly.",
              "Approved responses may be summarized or edited for privacy, relevance, neutrality, and clarity.",
              "Correction requests may lead to profile updates when reliable documentation supports the change.",
            ],
          },
          {
            title: "How information is used",
            body: "Client Bureau uses information to authenticate users, operate dashboards, process reports, support moderation, maintain public profiles, manage subscriptions, prevent abuse, review disputes, and preserve audit trails.",
            bullets: [
              "Admin review records may track reviewer, decision, status change, summary edits, publication state, and timestamps.",
              "Security and anti-abuse signals may be used to protect accounts, reduce spam, and prevent unauthorized access.",
              "Aggregated, non-sensitive information may be used to improve product reliability and public-page quality.",
            ],
          },
          {
            title: "Retention, deletion, and access",
            body: "Client Bureau may retain account records, reports, evidence references, responses, moderation decisions, audit logs, and subscription history as needed to operate the platform, resolve disputes, enforce policies, and meet legal obligations.",
            bullets: [
              "Deleting or changing an account does not automatically remove approved public profile context if the record remains relevant and policy-compliant.",
              "Users may contact Client Bureau through the appropriate account, response, or correction workflow for access or update requests.",
              "Some records may need to be retained for audit, security, billing, or dispute-resolution reasons.",
            ],
          },
        ]}
      />
    </>
  )
}
