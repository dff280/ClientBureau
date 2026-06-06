import type { Metadata } from "next"
import Link from "next/link"
import { ClipboardCheck, FilePlus2, Search, ShieldCheck } from "lucide-react"

import { LegalNotice } from "@/components/client/legal-notice"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "How contractors and service businesses use Client Bureau to check clients, review contractor-submitted reports, document jobs, and protect future work.",
  alternates: {
    canonical: "/how-it-works",
  },
}

const workflow = [
  {
    icon: Search,
    title: "Search before the job",
    text: "Look up a client using name, business, city, state, phone, or email. Sensitive identifiers are matched privately.",
  },
  {
    icon: ClipboardCheck,
    title: "Review report context",
    text: "Evaluate Client Bureau Score, risk level, report count, payment reliability, dispute history, and approved summaries.",
  },
  {
    icon: FilePlus2,
    title: "Report a client experience",
    text: "Submit project facts, payment status, category, public summary, detailed experience, and supporting evidence.",
  },
  {
    icon: ShieldCheck,
    title: "Protect payment",
    text: "Approved summaries can help other contractors make more informed decisions while preserving moderation and response rights.",
  },
]

export default function HowItWorksPage() {
  return (
    <section className="bureau-section bg-white">
      <div className="bureau-container space-y-10">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm font-semibold uppercase text-amber-700">How it works</p>
          <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
            Search before the job. Document during the job. Protect payment after the job.
          </h1>
          <p className="leading-7 text-slate-600">
            Client Bureau is designed for contractors and service businesses who need a clear pre-job
            intake check and a responsible way to report documented client experiences involving homeowners,
            customers, property owners, leads, or project clients.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-4">
          {workflow.map((step, index) => (
            <Card key={step.title} className="rounded-md border-slate-200 shadow-sm">
              <CardContent className="space-y-4 p-5">
                <span className="text-sm font-semibold text-amber-700">0{index + 1}</span>
                <step.icon className="size-8 text-slate-950" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-slate-950">{step.title}</h2>
                <p className="text-sm leading-6 text-slate-600">{step.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <LegalNotice />
          <div className="rounded-md border border-slate-200 bg-slate-100 p-6">
            <h2 className="text-2xl font-semibold text-slate-950">
              Approval creates the public page.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              When a report is approved, Client Bureau can create or update a public client profile
              with a moderated summary, updated score factors, risk level, evidence-on-file summary,
              and a neutral response path for the client.
            </p>
            <Button asChild className="mt-5 bg-slate-950 text-white hover:bg-slate-800">
              <Link href="/submit-report">Report a Client Experience</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
