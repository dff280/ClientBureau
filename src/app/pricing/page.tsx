import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Radar, ShieldCheck, Users } from "lucide-react"

import {
  NextBestStepCard,
  PremiumCtaBand,
  PremiumHero,
  PremiumProofStrip,
  PremiumSectionHeader,
  ProductMockupFrame,
  PublicDatabaseShowcase,
} from "@/components/marketing/premium-page-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getBillingAvailability, billingInterestSignupHref, planInterestLabel, isBillingPlanInterest } from "@/lib/billing-availability"
import { pageAssets } from "@/lib/page-assets"
import { pricingTiers } from "@/lib/stripe/pricing"

export const metadata: Metadata = {
  title: "Pricing for Contractors and Service Businesses",
  description:
    "Client Bureau pricing for client checks, profile monitoring, jobs, contracts, evidence records, payment recovery workflows, and Florida lien service.",
  alternates: {
    canonical: "/pricing",
  },
}

const proof = [
  { label: "Start", value: "$0", text: "Browse the databases and understand how Client Bureau protects job intake." },
  { label: "Check", value: "$29", text: "Client checks, saved searches, watchlists, profile alerts, and report context." },
  { label: "Protect", value: "$99", text: "Jobs, contracts, evidence, recovery, Florida lien service, and priority review." },
  { label: "Service fees", value: "Separate", text: "Recovery, vendor, attorney, e-recording, county, and pass-through costs stay separate." },
]

const comparisonRows = [
  ["Client Database search", "Limited", "Daily intake", "Daily intake plus project context"],
  ["Saved searches and watchlists", "Starter", "50 saved / 25 watched", "250 saved / 250 watched"],
  ["Client reports and response context", "First path", "Report and monitor", "Report, monitor, and tie to jobs"],
  ["Jobs project files", "Starter view", "Basic list", "Full project files and participant roles"],
  ["Contract signing links", "One starter packet", "Starter visibility", "Full contract packet workspace"],
  ["Evidence Vault", "Starter notes", "Basic summaries", "Full private evidence workflow"],
  ["Payment Recovery", "Not included", "Not included", "Recovery workspace and case intake"],
  ["Florida Lien Service", "Information pages", "Information pages", "Florida case workspace and readiness review"],
]

const faqs = [
  ["Can I start free?", "Yes. Free is designed to let you browse the three databases, understand public profiles, and create a starter account without a card."],
  ["Which paid plan should most contractors start with?", "Pro Check is the fastest entry point if your main need is checking clients, saving searches, watching profiles, and reviewing public report context."],
  ["When does Bureau Pro make sense?", "Bureau Pro is for businesses that want the complete workflow: Jobs, contracts, evidence, recovery, Florida lien service, and activity history around the same client-risk process."],
  ["Do recovery and lien services guarantee payment?", "No. Client Bureau does not guarantee collection, lien rights, recording results, legal outcomes, or payment timing."],
  ["Are private emails, phone numbers, addresses, or evidence public?", "No. Private identifiers and raw evidence stay private and are not displayed on public client profiles."],
]

const searchDossierAsset = pageAssets.searchDossier

type PricingPageProps = {
  searchParams: Promise<{
    checkout?: string | string[]
    plan?: string | string[]
  }>
}

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const params = await searchParams
  const billing = getBillingAvailability()
  const selectedPlan = firstParam(params.plan)
  const selectedPlanLabel = isBillingPlanInterest(selectedPlan) ? planInterestLabel(selectedPlan) : undefined
  const checkoutUnavailable = firstParam(params.checkout) === "unavailable"

  return (
    <>
      <PremiumHero
        eyebrow="Pricing"
        title="Start free. Upgrade when one client check needs to become a system."
        description="Pro Check gives contractors the client-checking membership. Bureau Pro unlocks the full business-protection workspace for jobs, contracts, evidence, recovery, and Florida lien service."
        primary={{ href: "/signup?plan=free", label: "Create Free Account", icon: ArrowRight }}
        secondary={{ href: "/search", label: "Check a Client", icon: Radar }}
        aside={
          <ProductMockupFrame
            dark
            eyebrow="Bureau Pro workspace"
            title="The full protection stack."
            description="Search before the job. Document during the job. Protect payment after the job. Paid activation is reviewed before billing is collected."
            imageSrc={searchDossierAsset.src}
            imageAlt={searchDossierAsset.alt}
            points={["Client checks", "Jobs, contracts, and evidence", "Recovery and lien-service paths"]}
          />
        }
      />
      <PremiumProofStrip items={proof} dark />
      {!billing.subscriptionCheckoutAvailable || checkoutUnavailable ? (
        <section className="border-b border-amber-200 bg-amber-50">
          <div className="bureau-container py-5">
            <div className="flex flex-col justify-between gap-3 rounded-md border border-amber-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  {checkoutUnavailable && selectedPlanLabel
                    ? `${selectedPlanLabel} activation is reviewed first`
                    : billing.publicStatusLabel}
                </p>
                <p className="mt-1 text-sm leading-6 text-amber-950">
                  {billing.publicStatusDetail} Create a free account now, then use Billing review when you are ready to activate Pro Check or Bureau Pro.
                </p>
              </div>
              <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                <Link href={selectedPlanLabel ? `/signup?plan=${selectedPlan}` : "/signup?plan=free"}>
                  {selectedPlanLabel ? `Create account for ${selectedPlanLabel}` : "Create Free Account"}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      ) : null}
      <PublicDatabaseShowcase
        compact
        eyebrow="What every plan supports"
        title="Pricing starts with access to the three core databases."
        description="Client checks, contractor profiles, and subcontractor records are the front door. Bureau Pro adds the private operating workspace around what happens after the search."
      />

      <section className="bureau-section bg-slate-100">
        <div className="bureau-container space-y-10">
          <NextBestStepCard
            eyebrow="Best value"
            title="Bureau Pro is the complete business-protection workspace."
            description="Pro Check is built to attract every contractor into better client screening. Bureau Pro is where the serious tools live: Jobs, contracts, evidence, recovery, Florida lien service, and activity history."
            primary={{ href: "/signup?plan=bureau_team", label: "Start Bureau Pro", icon: ShieldCheck }}
            secondary={{ href: "/signup?plan=pro", label: "Start Pro Check", icon: Radar }}
            points={[
              "Client checks before estimates",
              "Contracts, Jobs, and evidence records",
              "Recovery and Florida lien-service workspace",
            ]}
          />

          <div className="grid gap-5 lg:grid-cols-3">
            {pricingTiers.map((tier) => (
              <PlanCard key={tier.id} tier={tier} />
            ))}
          </div>
        </div>
      </section>

      <section className="bureau-section bg-white">
        <div className="bureau-container space-y-8">
          <PremiumSectionHeader
            eyebrow="Feature comparison"
            title="Compare the check-first plan against the full protection workspace."
            description="The $29 plan should feel impossible to ignore for checking clients. The $99 plan is where Client Bureau becomes the operating system for protecting jobs and payment."
          />
          <Card className="overflow-hidden rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-slate-950 text-xs uppercase text-slate-300">
                    <tr>
                      <th className="p-4">Workflow</th>
                      <th className="p-4">Free</th>
                      <th className="p-4">Pro Check</th>
                      <th className="p-4">Bureau Pro</th>
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
        </div>
      </section>

      <section className="bureau-section bg-slate-100">
        <div className="bureau-container grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <PremiumSectionHeader
            eyebrow="FAQ"
            title="Clear pricing, careful expectations."
            description="Client Bureau is a business-protection platform. It helps organize decisions and workflows, but it does not guarantee payment, legal outcomes, or dispute resolution."
          />
          <div className="grid gap-3">
            {faqs.map(([question, answer]) => (
              <div key={question} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                <p className="font-semibold text-slate-950">{question}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PremiumCtaBand
        eyebrow="Make it part of intake"
        title="Before the next estimate, check the client."
        description="Start with client checks, then upgrade to the full workspace when you want jobs, contracts, evidence, recovery, and Florida lien service tied together."
        primary={{ href: "/signup?plan=bureau_team", label: "Start Bureau Pro", icon: ShieldCheck }}
        secondary={{ href: "/enterprise", label: "Need multi-location review?", icon: Users }}
      />
    </>
  )
}

function PlanCard({ tier }: { tier: (typeof pricingTiers)[number] }) {
  const href =
    tier.id === "enterprise"
      ? "/enterprise#enterprise-inquiry"
      : billingInterestSignupHref(tier.id)
  const cta =
    tier.id === "free"
      ? "Create free account"
      : tier.id === "pro"
        ? "Start Pro Check"
        : tier.id === "bureau_team"
          ? "Start Bureau Pro"
          : "Request enterprise review"

  return (
    <Card className={tier.featured ? "rounded-md border-2 border-amber-400 bg-slate-950 text-white shadow-xl" : "rounded-md border-slate-200 bg-white shadow-sm"}>
      <CardContent className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={tier.featured ? "text-xl font-semibold text-white" : "text-xl font-semibold text-slate-950"}>{tier.name}</p>
            <p className={tier.featured ? "mt-2 text-sm leading-6 text-slate-300" : "mt-2 text-sm leading-6 text-slate-600"}>{tier.description}</p>
          </div>
          {tier.featured ? <Badge className="rounded-md bg-amber-400 text-slate-950">Best value</Badge> : null}
        </div>
        <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
          <span className={tier.featured ? "text-4xl font-semibold text-white" : "text-4xl font-semibold text-slate-950"}>{tier.price}</span>
          <span className={tier.featured ? "pb-1 text-sm text-slate-300" : "pb-1 text-sm text-slate-500"}>{tier.cadence}</span>
        </div>
        <p className={tier.featured ? "rounded-md border border-white/10 bg-white/10 p-3 text-sm leading-6 text-slate-200" : "rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600"}>
          {tier.launchNote}
        </p>
        <div className="grid gap-2">
          {tier.features.slice(0, 6).map((feature) => (
            <div key={feature} className={tier.featured ? "flex gap-2 text-sm text-slate-200" : "flex gap-2 text-sm text-slate-600"}>
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden="true" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
        <Button asChild className={tier.featured ? "w-full bg-amber-500 text-slate-950 hover:bg-amber-400" : "w-full"} variant={tier.featured ? "default" : "outline"}>
          <Link href={href}>{cta}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
