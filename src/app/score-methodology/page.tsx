import type { Metadata } from "next"
import Link from "next/link"
import { BarChart3, CheckCircle2, HelpCircle, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Client Bureau Score Methodology",
  description:
    "How the Client Bureau Score uses moderated contractor-submitted reports, evidence context, disputes, resolutions, and positive reports.",
  alternates: {
    canonical: "/score-methodology",
  },
}

const factors = [
  {
    title: "Payment reliability",
    text: "Reported unpaid balances, payment status, paid-in-full context, and unresolved amounts influence payment reliability.",
  },
  {
    title: "Dispute activity",
    text: "Active responses, disputes, correction requests, and moderation notes add context without declaring either party correct.",
  },
  {
    title: "Evidence confidence",
    text: "Evidence is reviewed privately. Public pages may summarize evidence types without exposing invoices, contracts, files, emails, or phone numbers.",
  },
  {
    title: "Resolution history",
    text: "Paid, settled, resolved, or admin-verified updates can improve context because outcomes matter alongside the original report.",
  },
  {
    title: "Approved report categories",
    text: "Categories such as late payment, non-payment, chargeback, and positive experience carry different weights after moderation.",
  },
  {
    title: "Payment and resolution context",
    text: "Reported unpaid amounts, paid-after-follow-up notes, documented resolutions, and active dispute context influence the score.",
  },
  {
    title: "Report volume and recency",
    text: "Multiple approved reports may increase confidence. Newer reports and resolved items are weighed with additional context.",
  },
  {
    title: "Positive reports",
    text: "Approved positive experiences and would-work-with-again reports can improve the score and help profiles avoid one-sided presentation.",
  },
]

export default function ScoreMethodologyPage() {
  return (
    <section className="bureau-section bg-slate-100">
      <div className="bureau-container space-y-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase text-amber-700">Score methodology</p>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
              How the Client Bureau Score is interpreted.
            </h1>
            <p className="max-w-3xl leading-7 text-slate-600">
              The score is a client-risk intelligence signal based on moderated,
              contractor-submitted reports, evidence context, response history, balance status,
              positive reports, and resolution signals. It is designed to support judgment, not replace it.
            </p>
          </div>
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <BarChart3 className="size-8 text-slate-950" aria-hidden="true" />
              <h2 className="text-2xl font-semibold text-slate-950">0-100 range</h2>
              <p className="text-sm leading-6 text-slate-600">
                Higher scores generally indicate stronger reported payment reliability and fewer
                unresolved concerns. Lower scores may indicate reported payment risk or unresolved
                dispute context.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {factors.map((factor) => (
            <Card key={factor.title} className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-3 p-5">
                <CheckCircle2 className="size-6 text-emerald-700" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-slate-950">{factor.title}</h2>
                <p className="text-sm leading-6 text-slate-600">{factor.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <ShieldCheck className="size-8 text-amber-700" aria-hidden="true" />
              <h2 className="text-2xl font-semibold text-slate-950">Confidence matters</h2>
              <p className="text-sm leading-6 text-slate-600">
                A score with several approved reports, evidence references, and response history
                carries more context than a score based on a single recent submission. Public
                profile cards show report count, disputes, resolved reports, and last updated date
                so contractors can weigh the signal responsibly.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <HelpCircle className="size-8 text-slate-950" aria-hidden="true" />
              <h2 className="text-2xl font-semibold text-slate-950">What the score is not</h2>
              <p className="text-sm leading-6 text-slate-600">
                The score is not a legal finding, consumer credit score, collection decision,
                accusation, or guarantee of future behavior. It summarizes moderated, documented
                contractor experiences and relevant profile context.
              </p>
              <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                <Link href="/search">Search a client</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
