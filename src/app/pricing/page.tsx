import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2, HelpCircle, Radar } from "lucide-react"

import { BusinessProtectionWorkflow } from "@/components/marketing/business-protection-workflow"
import { PricingCard } from "@/components/pricing/pricing-card"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { pricingTiers } from "@/lib/stripe/pricing"

export const metadata: Metadata = {
  title: "Pricing for Client Risk Intelligence",
  description:
    "Client Bureau pricing for business owners and teams that need moderated client-risk intelligence, watchlists, alerts, evidence workflows, and team controls.",
  alternates: {
    canonical: "/pricing",
  },
}

export default function PricingPage() {
  const comparisonRows = [
    ["Client profile search", "Limited", "Unlimited", "Team shared", "Custom"],
    ["Positive client reports", "Included", "Included", "Included", "Included"],
    ["Documented report submission", "Included", "Included", "Included", "Included"],
    ["Evidence Vault", "Basic", "Expanded", "Team library", "Custom retention"],
    ["Saved searches and watchlist", "-", "Included", "Shared", "Advanced"],
    ["Intake risk assessments", "-", "Included", "Team shared", "Custom"],
    ["Managed payment recovery", "-", "Service fee per case", "Team workflow", "Specialist workflow"],
    ["Contract signing links", "-", "Client review, e-signature, and change-order tracking", "Shared link controls", "Custom templates"],
    ["Client invite portal", "-", "Private agreement link", "Team-managed invites", "Custom onboarding"],
    ["Florida lien service", "-", "Notice and filing service fees", "Team review", "Specialist workflow"],
    ["Moderation priority", "Standard", "Priority", "Team priority", "Dedicated review"],
    ["Audit and exports", "-", "-", "Included", "Custom"],
  ]

  return (
    <section className="bureau-section bg-slate-100">
      <div className="bureau-container space-y-10">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <p className="text-sm font-semibold uppercase text-amber-700">Pricing</p>
          <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
            Choose the level of client-risk intelligence your business needs.
          </h1>
          <p className="leading-7 text-slate-600">
            Start with basic search and report submission. Upgrade when client checks become part
            of intake: watchlists, monitoring alerts, intake assessments, evidence workflows, team
            visibility, and faster moderation.
          </p>
          <div className="inline-flex rounded-md border border-slate-200 bg-white p-1 text-sm font-semibold text-slate-600">
            <span className="rounded-sm bg-slate-950 px-4 py-2 text-white">Monthly</span>
            <span className="px-4 py-2">Annual options available for teams</span>
          </div>
        </div>

        <BusinessProtectionWorkflow compact showGuardrails={false} />

        <div className="grid gap-5 lg:grid-cols-4">
          {pricingTiers.map((tier) => (
            <PricingCard key={tier.id} tier={tier} />
          ))}
        </div>

        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardContent className="p-0">
            <div className="border-b border-slate-200 p-6">
              <h2 className="text-2xl font-semibold text-slate-950">Feature comparison</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Plans are designed around search volume, monitoring, report workflow depth, and team controls.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="p-4">Feature</th>
                    <th className="p-4">Free</th>
                    <th className="p-4">Pro</th>
                    <th className="p-4">Team</th>
                    <th className="p-4">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row[0]} className="border-t border-slate-100">
                      {row.map((cell, index) => (
                        <td key={`${row[0]}-${index}`} className={index === 0 ? "p-4 font-semibold text-slate-950" : "p-4 text-slate-600"}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <CheckCircle2 className="size-8 text-emerald-700" aria-hidden="true" />
              <h2 className="text-2xl font-semibold text-slate-950">Fairness is included in every plan.</h2>
              <p className="text-sm leading-6 text-slate-600">
                Public profile summaries are moderated, private identifiers are not displayed,
                evidence is reviewed privately, and clients have a clear response and correction path.
              </p>
              <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                <Link href="/signup">Create contractor account</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/enterprise">Explore enterprise</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <Radar className="size-8 text-amber-700" aria-hidden="true" />
              <h2 className="text-2xl font-semibold text-slate-950">Client intake tools are built into Pro.</h2>
              <p className="text-sm leading-6 text-slate-600">
                Pro Contractor adds watchlists, draft reports, saved searches, intake assessments,
                managed recovery cases, Florida lien service workflows, contract signing links, evidence review, and client invite controls for repeat client review.
              </p>
              <HelpCircle className="size-8 text-amber-700" aria-hidden="true" />
              <h2 className="text-2xl font-semibold text-slate-950">FAQ</h2>
              {[
                ["Can I submit reports on Free?", "Yes. Reports still go through moderation before any public summary appears."],
                ["Are phone numbers or emails public?", "No. They are used for private matching and are not displayed on public profile pages."],
                ["Can a client respond?", "Yes. Every public profile includes a response, dispute, correction, or resolution-update path."],
              ].map(([question, answer]) => (
                <div key={question} className="border-t border-slate-100 pt-3">
                  <p className="font-semibold text-slate-950">{question}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{answer}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
