import type { Metadata } from "next"
import Link from "next/link"
import { ClipboardCheck, FilePlus2, Search, ShieldCheck } from "lucide-react"

import { LegalNotice } from "@/components/client/legal-notice"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "How contractors use Client Bureau to search client profiles, review contractor-submitted reports, submit documented experiences, and protect future jobs.",
  alternates: {
    canonical: "/how-it-works",
  },
}

const workflow = [
  {
    icon: Search,
    title: "Search",
    text: "Look up a client using name, business, city, state, phone, or email. Sensitive identifiers are matched privately.",
  },
  {
    icon: ClipboardCheck,
    title: "Review",
    text: "Evaluate Client Bureau Score, risk level, report count, payment reliability, dispute history, and approved summaries.",
  },
  {
    icon: FilePlus2,
    title: "Report",
    text: "Submit project facts, payment status, category, public summary, detailed experience, and supporting evidence.",
  },
  {
    icon: ShieldCheck,
    title: "Protect",
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
            A review workflow built around documentation and fairness.
          </h1>
          <p className="leading-7 text-slate-600">
            Client Bureau is designed for contractors who need a clear pre-job intake check and
            a responsible way to report documented client experiences.
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
              <Link href="/submit-report">Submit a report</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
