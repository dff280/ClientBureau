import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, FileCheck2, Landmark, ReceiptText, Scale, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
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

export default function FloridaLienFilingServicePage() {
  return (
    <section className="bg-slate-100">
      <JsonLd data={getFaqSchema(faqs)} />
      <div className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="bureau-container grid gap-8 py-14 lg:grid-cols-[1fr_380px] lg:items-end">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase text-amber-300">Florida claim of lien filing</p>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-normal sm:text-5xl">
              File Florida lien cases through a managed, review-gated workflow.
            </h1>
            <p className="max-w-3xl text-base leading-7 text-slate-300">
              Create a private Florida claim-of-lien case, pay Client Bureau service fees and pass-through
              filing/vendor costs, certify accuracy, and route approved cases through attorney or e-recording
              vendor review. Recording proof and release tracking stay in your private dashboard.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-amber-500 text-slate-950 hover:bg-amber-400">
                <Link href="/dashboard/lien-readiness">
                  Start Florida lien filing
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
                <Link href="/contact">Talk to Client Bureau</Link>
              </Button>
            </div>
          </div>
          <Card className="rounded-md border-white/10 bg-white/10 text-white shadow-none">
            <CardContent className="space-y-4 p-6">
              <ReceiptText className="size-8 text-amber-300" aria-hidden="true" />
              <p className="text-xl font-semibold">Fee-gated and authorization-gated.</p>
              <p className="text-sm leading-6 text-slate-300">
                Service fees and pass-through costs are tracked separately. Contractor authorization is required before filing review.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bureau-container grid gap-8 py-12 lg:grid-cols-[0.9fr_1.1fr]">
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

      <div className="bureau-container grid gap-4 pb-14 md:grid-cols-3">
        {filingHighlights.map((item) => {
          const Icon = item.icon

          return (
          <Card key={item.title} className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-3 p-5">
              <Icon className="size-7 text-amber-700" aria-hidden="true" />
              <h3 className="font-semibold text-slate-950">{item.title}</h3>
              <p className="text-sm leading-6 text-slate-600">{item.text}</p>
            </CardContent>
          </Card>
          )
        })}
      </div>
    </section>
  )
}
