import type { Metadata } from "next"

import { PolicyPage } from "@/components/legal/policy-page"
import { JsonLd, getFaqSchema } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Report Policy",
  description:
    "Client Bureau report policy for documented contractor reports, positive reports, evidence summaries, private identifiers, and public publication rules.",
  alternates: {
    canonical: "/report-policy",
  },
}

const faqs = [
  {
    question: "What makes a strong Client Bureau report?",
    answer:
      "A strong report includes project facts, payment timeline, category, location, amount context when relevant, a neutral public summary, and supporting evidence references.",
  },
  {
    question: "Can contractors submit positive client reports?",
    answer:
      "Yes. Positive experiences and would-work-with-again reports help public profiles include favorable context alongside concerning reports.",
  },
  {
    question: "When does a report become public?",
    answer:
      "A report becomes public only after admin review and approval. Pending and rejected reports are not shown on public profile pages.",
  },
]

export default function ReportPolicyPage() {
  return (
    <>
      <JsonLd data={getFaqSchema(faqs)} />
      <PolicyPage
        eyebrow="Report policy"
        title="Client Experience Report Policy"
        description="Client Bureau reports should be documented, specific, relevant, and written for fair moderation. The goal is useful client intelligence for contractors and service businesses, not unsupported pressure."
        sections={[
          {
            title: "Required report standard",
            body: "Reports should describe a real contractor-client or service-business relationship with a homeowner, customer, property owner, lead, or project client and include enough detail for moderation to understand what happened.",
            bullets: [
              "Include project type, project city and state, contract amount when relevant, amount unpaid when applicable, payment status, and report category.",
              "Use a clear timeline: estimate, deposit, work start, change order, completion, invoice, payment request, response, dispute, and resolution if any.",
              "Write the public summary in reported-experience language such as the contractor reported, payment was reported as late, or evidence was submitted for review.",
              "Separate facts from opinion and avoid statements about motive, intent, character, or criminal behavior unless supported by official documentation.",
            ],
          },
          {
            title: "Evidence and documentation",
            body: "Evidence helps moderators assess whether a report is specific, relevant, and supportable. Evidence is reviewed privately and should be attached only when the submitter has a good-faith basis to provide it.",
            bullets: [
              "Accepted evidence may include invoices, signed agreements, change orders, photos, screenshots, completion records, payment-plan notes, correspondence references, and PDFs.",
              "Public pages may show evidence-on-file summaries, but raw evidence files are private by default.",
              "Do not upload documents that you are not authorized to share, and do not include unnecessary private information when a summary is sufficient.",
            ],
          },
          {
            title: "Prohibited report content",
            body: "Client Bureau may reject, edit, or hold reports that create privacy risk, moderation risk, or poor public quality.",
            bullets: [
              "Do not include threats, insults, harassment, private addresses, full phone numbers, raw emails, family details, medical details, or unrelated personal information.",
              "Do not use inflammatory labels, criminal accusations, identity-based insults, or similar unsupported wording.",
              "Do not submit duplicate reports to inflate profile risk or reports that primarily pressure payment outside the moderated process.",
              "Do not publish staff-only review notes, settlement terms, confidential files, or evidence details that should stay private.",
            ],
          },
          {
            title: "Positive reports and resolved outcomes",
            body: "Client Bureau supports balanced reporting. Positive experiences, paid-as-agreed work, respectful communication, and would-work-with-again reports are valuable client intelligence.",
            bullets: [
              "Positive reports may improve profile context and help contractors and service businesses identify reliable clients.",
              "Resolution updates can show that a reported issue was paid, settled, corrected, withdrawn, or otherwise addressed.",
              "A profile with both favorable and concerning reports should present that mixed context clearly.",
            ],
          },
          {
            title: "Publication rules",
            body: "A public client profile is created or updated only after admin approval. Publication may include a moderated summary, score update, risk level, report count, evidence-on-file label, and response or dispute context.",
            bullets: [
              "Pending reports are not shown on public profile pages or included in public search landing pages.",
              "Rejected reports remain private and should not influence public profile content.",
              "Approved reports may be edited for public readability, privacy, neutrality, and policy compliance.",
              "Profiles should not display raw phone numbers, emails, private addresses, raw evidence, staff-only review notes, or unapproved client responses.",
            ],
          },
          {
            title: "Submitter responsibility",
            body: "Contractors are responsible for the accuracy and good-faith basis of what they submit. Client Bureau moderation improves public quality, but it does not make the platform the original source of the contractor's experience.",
            bullets: [
              "Keep copies of contracts, invoices, payment records, communications, and project notes.",
              "Update reports when payment, settlement, correction, dispute, or resolution status changes.",
              "Use the platform to inform business decisions, not to threaten, coerce, or embarrass a client.",
            ],
          },
        ]}
      />
    </>
  )
}
