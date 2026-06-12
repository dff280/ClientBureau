import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, CheckCircle2, FileText, PhoneCall, ShieldCheck } from "lucide-react"

import {
  PremiumCtaBand,
  PremiumFeatureCard,
  PremiumHero,
  PremiumProofStrip,
  ProductMockupFrame,
  WorkflowTimeline,
} from "@/components/marketing/premium-page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { pageAssets } from "@/lib/page-assets"
import { JsonLd, getFaqSchema } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Payment Recovery Service for Contractors",
  description:
    "Open a private managed payment recovery case. Client Bureau reviews documents, contacts the client, logs responses, and tracks contractor-direct resolution.",
  alternates: {
    canonical: "/payment-recovery-service",
  },
}

const steps = [
  {
    icon: FileText,
    title: "Submit the case file",
    text: "Upload invoice, contract, project timeline, communication history, and evidence-on-file summary.",
  },
  {
    icon: ShieldCheck,
    title: "Review and service fee",
    text: "Pay the Client Bureau service fee so Resolution Desk can review the private case.",
  },
  {
    icon: PhoneCall,
    title: "Professional follow-up",
    text: "Client Bureau staff reviews records and contacts the client with factual, respectful language.",
  },
  {
    icon: CheckCircle2,
    title: "Track response and resolution",
    text: "Responses, payment-plan offers, disputes, and contractor-direct resolution status are privately logged.",
  },
]

const proof = [
  { label: "Case type", value: "Private", text: "Recovery records do not become public profile content." },
  { label: "Payment path", value: "Direct", text: "Client payments remain contractor-direct in this sprint." },
  { label: "Outreach", value: "Logged", text: "Calls, messages, responses, and next actions are organized." },
  { label: "Outcome", value: "Tracked", text: "Resolved, unresolved, paused, disputed, or closed." },
]

const faqs = [
  {
    question: "Does Client Bureau collect or hold recovered payment?",
    answer:
      "No. Recovery payments remain contractor-direct in this workflow. Client Bureau charges a service fee for review, outreach, and documentation support.",
  },
  {
    question: "Is payment recovery guaranteed?",
    answer:
      "No. Client Bureau does not guarantee collection, payment timing, legal outcome, or dispute resolution.",
  },
  {
    question: "Will recovery case details appear on public client profiles?",
    answer:
      "No. Private recovery records, client contact details, evidence, staff notes, and payment records are not displayed on public profiles.",
  },
]

const highlights = [
  {
    icon: FileText,
    title: "Document review",
    text: "Invoices, contracts, completion records, and communication history are reviewed privately.",
  },
  {
    icon: ShieldCheck,
    title: "Careful communication",
    text: "Outreach should be factual, respectful, and logged with outcome and follow-up details.",
  },
  {
    icon: CheckCircle2,
    title: "Resolution tracking",
    text: "Payment promises, disputes, payment plans, and unresolved status stay organized.",
  },
]

const caseFileSections = [
  {
    title: "What the case file should include",
    points: [
      "The signed agreement or accepted estimate, final invoice, deposit records, change orders, and completion notes.",
      "Photos, screenshots, delivery confirmations, message history, and a short timeline of what happened.",
      "Any client response, dispute reason, partial payment, payment-plan request, or resolution offer already received.",
    ],
  },
  {
    title: "How Client Bureau keeps it professional",
    points: [
      "Outreach should describe the reported facts, amount due, invoice history, and available resolution path without threats or public pressure.",
      "Staff notes, raw evidence, phone numbers, emails, documents, and payment discussions remain private workflow records.",
      "The case can support later internal review, attorney review, lien service evaluation, or a moderated public report if appropriate.",
    ],
  },
]

const resolutionDeskAsset = pageAssets.resolutionDesk

export default function PaymentRecoveryServicePage() {
  return (
    <>
      <JsonLd data={getFaqSchema(faqs)} />
      <PremiumHero
        eyebrow="Managed Resolution Desk"
        title="Get help recovering payment without turning the dispute public."
        description="Open a private payment recovery case when an invoice is overdue and you need a documented, professional follow-up process. Client Bureau reviews your records, contacts the client, logs responses, and tracks contractor-direct resolution options."
        primary={{ href: "/dashboard/recovery", label: "Open Payment Recovery Case", icon: PhoneCall }}
        secondary={{ href: "/pricing", label: "View service plans", icon: ArrowRight }}
        aside={
          <ProductMockupFrame
            dark
            eyebrow="Private case workflow"
            title="Resolution Desk record"
            description="Staff-assisted follow-up, payment-plan context, response notes, and case outcomes stay organized privately."
            imageSrc={resolutionDeskAsset.src}
            imageAlt={resolutionDeskAsset.alt}
            points={["Document review", "Respectful outreach", "Contractor-direct payment tracking"]}
          />
        }
      />
      <PremiumProofStrip items={proof} dark />

      <section className="bureau-section bg-slate-100">
      <div className="bureau-container grid gap-8 lg:grid-cols-[0.86fr_1.14fr]">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase text-amber-700">How It Works</p>
          <h2 className="text-3xl font-semibold tracking-normal text-slate-950">A managed workflow for overdue invoices.</h2>
          <p className="leading-7 text-slate-600">
            Recovery work should be factual, documented, and private. Client Bureau helps organize your
            records, conduct respectful outreach, and keep a clear timeline if the client responds,
            disputes, offers terms, or resolves the balance.
          </p>
          <Button asChild variant="outline">
            <Link href="/report-policy">Read report and moderation policy</Link>
          </Button>
        </div>
        <WorkflowTimeline items={steps} />
      </div>
      </section>

      <section className="bg-white pb-14">
      <div className="bureau-container grid gap-4 md:grid-cols-3">
        {highlights.map((item) => {
          return (
          <PremiumFeatureCard key={item.title} icon={item.icon} title={item.title} text={item.text} />
          )
        })}
      </div>
      </section>

      <section className="bg-slate-100 pb-14">
      <div className="bureau-container grid gap-4 lg:grid-cols-2">
        {caseFileSections.map((section) => (
          <Card key={section.title} className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-2xl font-semibold tracking-normal text-slate-950">{section.title}</h2>
              <ul className="grid gap-3">
                {section.points.map((point) => (
                  <li key={point} className="flex gap-3 text-sm leading-6 text-slate-600">
                    <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-700" aria-hidden="true" />
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
        eyebrow="Private resolution workflow"
        title="When the invoice is overdue, open a clear case file."
        description="Bring the contract, invoice, messages, evidence, and timeline into one private recovery workflow before the situation gets harder to manage."
        primary={{ href: "/dashboard/recovery", label: "Open Payment Recovery Case", icon: PhoneCall }}
        secondary={{ href: "/contact", label: "Talk to Client Bureau", icon: ArrowRight }}
      />
    </>
  )
}
