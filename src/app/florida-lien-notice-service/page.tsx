import type { Metadata } from "next"
import { ArrowRight, FileCheck2, Landmark, Scale, ShieldCheck } from "lucide-react"

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
  title: "Florida Lien Notice Service for Contractors",
  description:
    "Create a private Florida lien notice workflow with document review, contractor authorization, delivery tracking, and attorney/vendor review.",
  alternates: {
    canonical: "/florida-lien-notice-service",
  },
}

const faqs = [
  {
    question: "Does Client Bureau send Florida lien notices automatically?",
    answer:
      "No. A contractor must submit the case, pay the service fee, provide documents, and sign authorization before any notice workflow moves forward.",
  },
  {
    question: "Is this legal advice?",
    answer:
      "No. Client Bureau provides a managed workflow and routes eligible filing work through attorney/vendor review. Contractors should consult qualified counsel for legal advice.",
  },
  {
    question: "Are notice packets public?",
    answer:
      "No. Notice records, property details, raw documents, staff notes, and delivery proof stay private.",
  },
]

const noticeSteps = [
  {
    icon: FileCheck2,
    title: "Submit case",
    text: "Enter owner, county, property city, role, project, amount due, and notice history.",
  },
  {
    icon: ShieldCheck,
    title: "Pay fee",
    text: "Client Bureau service fees and pass-through delivery/vendor costs are tracked separately.",
  },
  {
    icon: Scale,
    title: "Sign authorization",
    text: "Contractors certify accuracy and authorize attorney/vendor review before movement.",
  },
  {
    icon: Landmark,
    title: "Track delivery",
    text: "Delivery method, tracking number, proof summary, and delivery status stay private.",
  },
]

const proof = [
  { label: "Workflow", value: "Notice", text: "Florida notice packets use review, fee, and authorization gates." },
  { label: "Delivery", value: "Tracked", text: "Method, tracking, proof summary, and status stay private." },
  { label: "Privacy", value: "Default", text: "Property details, raw docs, and staff notes are not public." },
  { label: "Next step", value: "Filing review", text: "Eligible cases can move into claim-of-lien review." },
]

const noticeReadiness = [
  {
    title: "Information to gather before review",
    points: [
      "Property county, project city, owner/client name, role on the job, first furnishing date, and the work or materials provided.",
      "Contract, invoice, payment record, communications, delivery address context, and any prior notice or deadline history.",
      "A short explanation of why the notice workflow is needed and whether the balance is disputed, partially paid, or unresolved.",
    ],
  },
  {
    title: "What the dashboard tracks privately",
    points: [
      "Service fee status, pass-through delivery/vendor cost status, authorization status, vendor review, and delivery method.",
      "Tracking number, delivery proof summary, staff review notes, attorney/vendor comments, and next action deadlines.",
      "Whether a later claim-of-lien filing review, release, correction, or closure step may be needed.",
    ],
  },
]

export default function FloridaLienNoticeServicePage() {
  return (
    <>
      <JsonLd data={getFaqSchema(faqs)} />
      <PremiumHero
        eyebrow="Florida lien notice workflow"
        title="Prepare Florida lien notices with review, authorization, and delivery tracking."
        description="Client Bureau helps contractors organize Florida notice packets, review key project facts, collect required documents, route the case through attorney/vendor review, and track delivery proof in a private workflow."
        primary={{ href: "/dashboard/lien-readiness", label: "Start Florida Lien Service", icon: Landmark }}
        secondary={{ href: "/florida-lien-filing-service", label: "View filing service", icon: ArrowRight }}
        aside={
          <ProductMockupFrame
            dark
            eyebrow="Notice packet"
            title="Private notice workflow"
            description="Florida notice cases stay private and require contractor certification before staff or vendor action."
            imageSrc="/images/resolution-desk-console.webp"
            imageAlt="Client Bureau Florida notice workflow console."
            points={["Document review", "Authorization gate", "Delivery proof tracking"]}
          />
        }
      />
      <PremiumProofStrip items={proof} dark />

      <section className="bureau-section bg-slate-100">
      <div className="bureau-container grid gap-6 md:grid-cols-4">
        {noticeSteps.map((item) => {
          return (
          <PremiumFeatureCard key={item.title} icon={item.icon} title={item.title} text={item.text} />
          )
        })}
      </div>
      </section>

      <section className="bg-white pb-14">
      <div className="bureau-container">
        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardContent className="grid gap-6 p-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase text-amber-700">Compliance posture</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">Florida first, review-gated, private by default.</h2>
            </div>
            <p className="leading-7 text-slate-600">
              Florida construction lien and notice requirements can depend on project type, role,
              deadlines, owner information, and documents. Client Bureau does not provide legal
              advice and does not guarantee lien rights, priority, enforceability, delivery result,
              payment, or outcome.
            </p>
            <p className="leading-7 text-slate-600">
              The goal is to make deadline risk visible early, keep contractor authorization
              clear, and preserve a clean private record of what was prepared, reviewed, sent, and
              confirmed.
            </p>
          </CardContent>
        </Card>
      </div>
      </section>

      <section className="bg-slate-100 pb-14">
      <div className="bureau-container grid gap-4 lg:grid-cols-2">
        {noticeReadiness.map((section) => (
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
        eyebrow="Florida notice workflow"
        title="Start the notice packet before the case gets harder to organize."
        description="Bring deadlines, property context, contract records, invoices, and authorization into one private review-gated workflow."
        primary={{ href: "/dashboard/lien-readiness", label: "Start Florida Lien Service", icon: Landmark }}
        secondary={{ href: "/florida-lien-filing-service", label: "View filing service", icon: ArrowRight }}
      />
    </>
  )
}
