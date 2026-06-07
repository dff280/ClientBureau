import type { Metadata } from "next"
import { ArrowRight, FileCheck2, Landmark, ReceiptText, Scale, ShieldCheck } from "lucide-react"

import {
  PremiumCtaBand,
  PremiumFeatureCard,
  PremiumHero,
  PremiumProofStrip,
  ProductMockupFrame,
} from "@/components/marketing/premium-page-shell"
import { Card, CardContent } from "@/components/ui/card"
import { JsonLd, getFaqSchema } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Florida Lien Filing Service for Contractors",
  description:
    "Start a private Florida claim of lien filing workflow with fee tracking, contractor authorization, attorney/vendor review, recording proof, and release tracking.",
  alternates: {
    canonical: "/florida-lien-filing-service",
  },
}

const requirements = [
  "Florida property county, city, owner/client details, and contractor role.",
  "Contract amount, unpaid amount, project type, first work date, and last work date.",
  "Notice history, deadline notes, contract/invoice documents, and evidence summaries.",
  "Contractor certification and authorization before attorney/vendor filing review.",
]

const proof = [
  { label: "Launch state", value: "Florida", text: "Notice and filing workflows start with Florida projects only." },
  { label: "Review gate", value: "Required", text: "Document review and contractor authorization happen before filing review." },
  { label: "Costs", value: "Separated", text: "Client Bureau service fees and pass-through costs are tracked separately." },
  { label: "Public exposure", value: "Private", text: "Filing drafts, receipts, evidence, and staff notes stay out of public profiles." },
]

const faqs = [
  {
    question: "Will Client Bureau file the lien for me?",
    answer:
      "Client Bureau provides a managed workflow and routes approved Florida claim-of-lien cases through attorney/vendor filing review after fee payment, documents, and contractor authorization are complete.",
  },
  {
    question: "Does Client Bureau guarantee lien rights or payment?",
    answer:
      "No. Client Bureau does not guarantee lien priority, enforceability, collection, payment, legal outcome, recording timing, or county clerk acceptance.",
  },
  {
    question: "What happens after recording?",
    answer:
      "Recording proof, official record details, and release or satisfaction needs are tracked privately in the case record.",
  },
]

const filingHighlights = [
  {
    icon: Scale,
    title: "Attorney/vendor review",
    text: "Eligible cases are routed through review before a notice or filing proceeds.",
  },
  {
    icon: Landmark,
    title: "County recording details",
    text: "Clerk references, book/page, instrument number, receipt, and confirmation are tracked privately.",
  },
  {
    icon: FileCheck2,
    title: "Release tracking",
    text: "Release or satisfaction workflows can be logged when payment, settlement, withdrawal, expiration, or correction requires it.",
  },
]

const filingReadiness = [
  {
    title: "Before a filing can move forward",
    points: [
      "The contractor should provide the agreement, invoice, payment history, work dates, property county, owner details, and notice history.",
      "The unpaid amount, contract amount, work performed, role on the project, and required property description should be reviewed before vendor action.",
      "The contractor must certify accuracy and authorize the workflow before attorney/vendor filing review proceeds.",
    ],
  },
  {
    title: "After recording or case closure",
    points: [
      "Recording confirmation, receipt details, official record references, instrument number, and clerk/county notes are stored privately.",
      "If the balance resolves, the case can track release or satisfaction needs without exposing private filing drafts on public profiles.",
      "If a case is blocked or disputed, Client Bureau keeps the reason, staff note, and next recommended review step in the private record.",
    ],
  },
]

export default function FloridaLienFilingServicePage() {
  return (
    <>
      <JsonLd data={getFaqSchema(faqs)} />
      <PremiumHero
        eyebrow="Florida claim of lien filing"
        title="File Florida lien cases through a managed, review-gated workflow."
        description="Create a private Florida claim-of-lien case, pay Client Bureau service fees and pass-through filing/vendor costs, certify accuracy, and route approved cases through attorney or e-recording vendor review. Recording proof and release tracking stay in your private dashboard."
        primary={{ href: "/dashboard/lien-readiness", label: "Start Florida Lien Service", icon: Landmark }}
        secondary={{ href: "/contact", label: "Talk to Client Bureau", icon: ArrowRight }}
        aside={
          <ProductMockupFrame
            dark
            eyebrow="Review-gated filing"
            title="Lien service case file"
            description="Deadline risk, authorization, fee status, vendor review, recording proof, and release tracking stay private."
            imageSrc="/images/resolution-desk-console.webp"
            imageAlt="Client Bureau lien service console showing deadline and case review status."
            points={["Contractor authorization", "Attorney/vendor review", "Recording proof tracking"]}
          />
        }
      />
      <PremiumProofStrip items={proof} dark />

      <section className="bureau-section bg-slate-100">
      <div className="bureau-container grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase text-amber-700">Case Requirements</p>
          <h2 className="text-3xl font-semibold tracking-normal text-slate-950">What contractors prepare before filing review.</h2>
          <p className="leading-7 text-slate-600">
            The filing workflow is designed to slow down risky escalation and make the case file
            complete before attorney/vendor review. Private documents, staff notes, filing drafts,
            receipts, and official record details never appear on public client profiles.
          </p>
        </div>
        <div className="grid gap-3">
          {requirements.map((item) => (
            <div key={item} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex gap-3">
                <ShieldCheck className="mt-1 size-5 shrink-0 text-amber-700" aria-hidden="true" />
                <p className="text-sm leading-6 text-slate-700">{item}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      </section>

      <section className="bg-white pb-14">
      <div className="bureau-container grid gap-4 md:grid-cols-3">
        {filingHighlights.map((item) => {
          return (
          <PremiumFeatureCard key={item.title} icon={item.icon} title={item.title} text={item.text} />
          )
        })}
      </div>
      </section>

      <section className="bg-slate-100 pb-14">
      <div className="bureau-container grid gap-4 lg:grid-cols-2">
        {filingReadiness.map((section) => (
          <Card key={section.title} className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-2xl font-semibold tracking-normal text-slate-950">{section.title}</h2>
              <ul className="grid gap-3">
                {section.points.map((point) => (
                  <li key={point} className="flex gap-3 text-sm leading-6 text-slate-600">
                    <ShieldCheck className="mt-1 size-4 shrink-0 text-emerald-700" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
      </section>

      <PremiumCtaBand
        eyebrow="Florida lien service"
        title="Prepare the case before the deadline pressure gets worse."
        description="Start with a private case file, required records, fee status, authorization, and review checkpoints before any filing workflow proceeds."
        primary={{ href: "/dashboard/lien-readiness", label: "Start Florida Lien Service", icon: Landmark }}
        secondary={{ href: "/florida-lien-notice-service", label: "Notice service", icon: ReceiptText }}
      />
    </>
  )
}
