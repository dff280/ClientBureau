import type { Metadata } from "next"
import { BarChart3, CheckCircle2, FileSearch, HelpCircle, MessageSquareText, ShieldCheck } from "lucide-react"

import {
  PremiumCtaBand,
  PremiumHero,
  PremiumProofStrip,
  PremiumSectionHeader,
} from "@/components/marketing/premium-page-shell"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Rating Methodology for Client Reports",
  description:
    "How Client Bureau Ratings use moderated reports, evidence context, disputes, resolutions, positive reports, and confidence signals.",
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
    text: "Late payment, non-payment, chargeback, positive experience, and resolution categories carry different weights after moderation.",
  },
  {
    title: "Report volume and recency",
    text: "Multiple approved reports can increase confidence. Newer reports and resolved items are weighed with additional context.",
  },
  {
    title: "Positive reports",
    text: "Approved positive experiences and would-work-with-again reports help profiles avoid one-sided presentation.",
  },
  {
    title: "Public response context",
    text: "Client responses, disputes, corrections, and resolution updates can add important context after moderation.",
  },
]

const ratingBands = [
  ["90-100", "Strong client history"],
  ["75-89", "Good client history"],
  ["60-74", "Moderate caution"],
  ["40-59", "Elevated caution"],
  ["0-39", "High caution"],
  ["No reports", "Limited history"],
]

const proof = [
  { label: "Range", value: "0-100", text: "A profile context signal, not a legal finding or consumer credit score." },
  { label: "Inputs", value: "Moderated", text: "Approved reports, evidence context, responses, disputes, and resolutions." },
  { label: "Fairness", value: "Balanced", text: "Positive reports and resolution updates can improve public context." },
  { label: "Privacy", value: "Protected", text: "Raw evidence and private identifiers are not part of public scoring pages." },
]

export default function ScoreMethodologyPage() {
  return (
    <main className="bg-slate-100">
      <PremiumHero
        eyebrow="Rating methodology"
        title="How the Client Bureau Rating turns reports into cautious business context."
        description="The rating is a client-risk intelligence signal based on moderated contractor-submitted reports, evidence context, response history, balance status, positive reports, and resolution signals."
        primary={{ href: "/search", label: "Check a Client", icon: FileSearch }}
        secondary={{ href: "/report-policy", label: "Report standards", icon: ShieldCheck }}
        aside={
          <div className="space-y-4 text-white">
            <BarChart3 className="size-9 text-amber-300" aria-hidden="true" />
            <p className="text-xl font-semibold">A decision aid, not a verdict.</p>
            <p className="text-sm leading-6 text-slate-300">
              Scores help contractors understand reported payment and dispute context, but they do
              not replace contracts, deposits, communication records, or business judgment.
            </p>
          </div>
        }
      />

      <PremiumProofStrip items={proof} dark />

      <section className="bureau-section">
        <div className="bureau-container space-y-10">
          <PremiumSectionHeader
            eyebrow="Score range"
            title="Ratings are interpreted with report count, confidence, disputes, and resolution status."
            description="A profile with several approved reports, evidence summaries, response history, and resolution updates carries more context than a single new submission."
          />

          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="grid gap-3 p-5 md:grid-cols-3 lg:grid-cols-6">
              {ratingBands.map(([range, label]) => (
                <div key={range} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">{range}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">{label}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
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

          <div className="grid gap-5 lg:grid-cols-3">
            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-4 p-6">
                <ShieldCheck className="size-8 text-amber-700" aria-hidden="true" />
                <h2 className="text-2xl font-semibold text-slate-950">Confidence matters</h2>
                <p className="text-sm leading-6 text-slate-600">
                  Report count, evidence summaries, dispute status, response history, and last updated
                  date help contractors understand how much context supports the rating.
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-4 p-6">
                <MessageSquareText className="size-8 text-amber-700" aria-hidden="true" />
                <h2 className="text-2xl font-semibold text-slate-950">Responses can add context</h2>
                <p className="text-sm leading-6 text-slate-600">
                  Approved client responses, corrections, disputes, and resolution updates can appear
                  publicly to make the profile more complete and fair.
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-4 p-6">
                <HelpCircle className="size-8 text-slate-950" aria-hidden="true" />
                <h2 className="text-2xl font-semibold text-slate-950">What the score is not</h2>
                <p className="text-sm leading-6 text-slate-600">
                  The rating is not a legal finding, consumer credit score, payment enforcement
                  decision, accusation, or guarantee of future behavior.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <PremiumCtaBand
        eyebrow="Use the score responsibly"
        title="Search the profile, read the context, and decide the terms that protect your business."
        description="A rating is most useful when paired with contracts, deposits, change orders, communication records, and your own judgment."
        primary={{ href: "/search", label: "Check a Client", icon: FileSearch }}
        secondary={{ href: "/how-it-works", label: "How Client Bureau Works", icon: ShieldCheck }}
      />
    </main>
  )
}
