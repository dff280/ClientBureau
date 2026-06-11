import type { Metadata } from "next"

import { PolicyPage } from "@/components/legal/policy-page"
import { JsonLd, getFaqSchema } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Client Bureau terms for contractor accounts, moderated client reports, public profiles, subscriptions, response rights, and private workflow tools.",
  alternates: {
    canonical: "/terms",
  },
}

const faqs = [
  {
    question: "What is Client Bureau for?",
    answer:
      "Client Bureau helps contractors and service businesses check client context, submit documented reports, manage private job records, and review moderated public profile information.",
  },
  {
    question: "Are public reports automatically published?",
    answer:
      "No. Contractor-submitted reports are reviewed before public publication, and public summaries should use factual, reported-experience language.",
  },
  {
    question: "Does Client Bureau provide legal or collection advice?",
    answer:
      "No. Client Bureau is an information and workflow platform, not a law firm, credit bureau, debt collector, or payment enforcement service.",
  },
]

export default function TermsPage() {
  return (
    <>
      <JsonLd data={getFaqSchema(faqs)} />
      <PolicyPage
        eyebrow="Terms"
        title="Terms of Service"
        description="These terms explain how Client Bureau accounts, client searches, contractor-submitted reports, public profiles, private workflow tools, subscriptions, and moderation features are intended to be used."
        sections={[
          {
            title: "Permitted platform use",
            body: "Client Bureau is built for business owners, contractors, service companies, and authorized team members who need to evaluate client context before accepting work and document project experiences after the fact.",
            bullets: [
              "Search public client profiles and private-match context for business intake decisions.",
              "Submit documented contractor experiences that are specific, relevant, and written in good faith.",
              "Use dashboards, watchlists, contract packets, recovery notes, Florida lien service records, and evidence vault records as private business workflow tools.",
              "Do not submit content that you know is false, misleading, harassing, irrelevant, discriminatory, or designed to reveal private information.",
            ],
          },
          {
            title: "Contractor-submitted reports",
            body: "Reports reflect contractor-submitted experiences and supporting context. A submission does not become a public client profile entry simply because it was submitted. Client Bureau may review, reject, edit, summarize, or request more information before any public summary appears.",
            bullets: [
              "Public report summaries should focus on project facts, timeline, payment status, documented communication, and reported experience.",
              "Users are responsible for submitting accurate information and maintaining records that support the report.",
              "Positive reports, resolution updates, and would-work-with-again experiences are permitted and encouraged when accurate.",
            ],
          },
          {
            title: "Public profiles and moderation",
            body: "Public client profiles are designed to show limited, moderated business context. They are not public accusation pages, legal findings, consumer credit reports, or guarantees of future conduct.",
            bullets: [
              "Pending, rejected, private, and internal records are not intended for public display.",
              "Client Bureau may adjust public summaries for clarity, privacy, neutrality, category fit, or policy compliance.",
              "Clients may submit responses, disputes, correction requests, and resolution updates for moderation.",
            ],
          },
          {
            title: "Private workflow tools",
            body: "Contract packets, signing links, managed recovery cases, call logs, Florida lien service records, evidence vault items, and client work files are private workspace tools unless a separate approved public report process applies.",
            bullets: [
              "Client Bureau does not automatically contact clients, place calls, send notices, file liens, or enforce payment without the applicable paid service workflow, contractor authorization, and review gate.",
              "Contractors are responsible for reviewing applicable contracts, deadlines, notices, laws, and professional requirements before taking action.",
              "Private notes, uploaded files, raw evidence, phone numbers, email addresses, and street addresses should not appear on public profiles.",
            ],
          },
          {
            title: "Subscriptions and account access",
            body: "Paid plans may provide expanded search, watchlists, evidence workflow, contracts, team controls, moderation priority, and operational history. Access can change when a subscription is canceled, expired, past due, or unavailable.",
            bullets: [
              "Plan limits, features, prices, and availability may change as the product evolves.",
              "Users are responsible for keeping account credentials secure and limiting team access to authorized personnel.",
              "Admin and moderator access is restricted to authorized roles and audited where appropriate.",
            ],
          },
          {
            title: "No professional advice",
            body: "Client Bureau provides information organization, moderation, and business workflow software. It does not provide legal advice, credit reporting services, debt collection services, tax advice, insurance advice, payment enforcement, or a substitute for professional judgment.",
            bullets: [
              "Contractors should independently decide whether to accept a job, require a deposit, change contract terms, pause work, or seek professional advice.",
              "Public profile context should be treated as one input in a broader business decision, not as a definitive conclusion.",
            ],
          },
        ]}
      />
    </>
  )
}
