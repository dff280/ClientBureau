import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, CheckCircle2, FileCheck2, Radar, ReceiptText, ShieldCheck, Signature, Users } from "lucide-react"

import {
  PremiumCtaBand,
  PremiumFeatureCard,
  PremiumHero,
  PremiumProofStrip,
  PremiumSectionHeader,
  ProductMockupFrame,
  WorkflowTimeline,
} from "@/components/marketing/premium-page-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { pageAssets } from "@/lib/page-assets"
import { pricingTiers } from "@/lib/stripe/pricing"

export const metadata: Metadata = {
  title: "Pricing for Contractors and Service Businesses",
  description:
    "Client Bureau pricing for client checks, documented reports, contracts, evidence records, payment recovery workflows, Florida lien service, and team controls.",
  alternates: {
    canonical: "/pricing",
  },
}

const proof = [
  { label: "Start", value: "$0", text: "Check clients and report a documented experience before you upgrade." },
  { label: "Best fit", value: "Pro", text: "Unlimited client checks, watchlists, contracts, evidence, and recovery tools." },
  { label: "Teams", value: "Shared", text: "Multiple users, shared records, CSV intake, and manager review controls." },
  { label: "Service work", value: "Add-on", text: "Recovery and Florida lien workflows use service-fee paths." },
]

const planOutcomes = [
  {
    icon: Radar,
    title: "Check before you schedule",
    text: "Run client checks before committing crew time, material orders, deposits, or final invoice risk.",
  },
  {
    icon: Signature,
    title: "Set terms before work starts",
    text: "Use agreement packets, signing links, deposit terms, milestones, and change-order tracking.",
  },
  {
    icon: FileCheck2,
    title: "Keep evidence organized",
    text: "Store invoices, contracts, screenshots, photos, approvals, and completion notes privately.",
  },
  {
    icon: ReceiptText,
    title: "Escalate professionally",
    text: "Open private recovery and Florida lien-service workflows when a payment issue becomes serious.",
  },
]

const workflowSteps = [
  {
    icon: Radar,
    title: "Check the client",
    text: "Run the intake search before accepting the job, ordering materials, or blocking the schedule.",
    href: "/search",
    cta: "Check a Client",
  },
  {
    icon: Signature,
    title: "Set terms",
    text: "Move into agreement packets, deposits, milestones, exclusions, and signature tracking.",
    href: "/dashboard/contracts",
    cta: "Contracts",
  },
  {
    icon: ReceiptText,
    title: "Protect payment",
    text: "Use evidence, recovery workflows, and Florida lien-service paths when payment risk appears.",
    href: "/payment-recovery-service",
    cta: "Recovery",
  },
]

const comparisonRows = [
  ["Client profile search", "Limited", "Unlimited", "Shared", "Custom"],
  ["Watchlists and saved searches", "Basic", "Included", "Shared", "Advanced"],
  ["Client experience reports", "One included", "Unlimited", "Team managed", "Custom"],
  ["Positive client reports", "Included", "Included", "Included", "Included"],
  ["Contract signing links", "-", "Included", "Shared controls", "Custom workflows"],
  ["Evidence Vault", "Basic", "Expanded", "Team vault", "Retention options"],
  ["Payment recovery workflow", "-", "Service fee per case", "Team workflow", "Specialist workflow"],
  ["Florida lien service", "-", "Notice and filing service fees", "Team review", "Specialist workflow"],
  ["Moderation priority", "Standard", "Priority", "Team priority", "Dedicated review"],
  ["Audit and exports", "-", "-", "Included", "Custom"],
]

const faqs = [
  ["Can I start free?", "Yes. Free is designed for basic client checks and an initial documented client experience report."],
  ["What plan should an active contractor choose?", "Pro Contractor is the clearest fit for businesses that want client checks, watchlists, contracts, evidence, recovery, and report workflows in daily use."],
  ["Do recovery and lien services guarantee payment?", "No. Client Bureau does not guarantee collection, lien rights, recording results, legal outcomes, or payment timing."],
  ["Are private emails, phone numbers, addresses, or evidence public?", "No. Private identifiers and raw evidence stay private and are not displayed on public client profiles."],
]

const searchDossierAsset = pageAssets.searchDossier
const agreementPacketAsset = pageAssets.floridaAgreementPacket

export default function PricingPage() {
  return (
    <>
      <PremiumHero
        eyebrow="Pricing"
        title="Choose the client-protection workflow your business needs."
        description="Client Bureau pricing is built around one practical idea: one avoided payment problem, unclear contract, or risky client decision can matter more than the monthly cost."
        primary={{ href: "/signup?plan=pro", label: "Start Pro Contractor", icon: ArrowRight }}
        secondary={{ href: "/search", label: "Check a Client", icon: Radar }}
        aside={
          <ProductMockupFrame
            dark
            eyebrow="Pro workflow"
            title="One plan. One intake process."
            description="Search, contract, document, recover, and monitor from the same private workspace."
            imageSrc={searchDossierAsset.src}
            imageAlt={searchDossierAsset.alt}
            points={["Unlimited checks on Pro", "Private evidence records", "Recovery and lien-service paths"]}
          />
        }
      />
      <PremiumProofStrip items={proof} dark />

      <section className="bureau-section bg-slate-100">
        <div className="bureau-container space-y-10">
          <div className="grid gap-5 lg:grid-cols-4">
            {pricingTiers.map((tier) => (
              <PlanCard key={tier.id} tier={tier} />
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {planOutcomes.map((item) => (
              <PremiumFeatureCard key={item.title} icon={item.icon} title={item.title} text={item.text} />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <ProductMockupFrame
              eyebrow="Plan value"
              title="Pricing is tied to the work you already do."
              description="Client Bureau should sit at the front of intake, not after a job goes bad."
              imageSrc={agreementPacketAsset.src}
              imageAlt={agreementPacketAsset.alt}
              points={["Client checks before scheduling", "Agreement packets before work starts", "Evidence and recovery records after issues appear"]}
            />
            <WorkflowTimeline items={workflowSteps} />
          </div>
        </div>
      </section>

      <section className="bureau-section bg-white">
        <div className="bureau-container space-y-8">
          <PremiumSectionHeader
            eyebrow="Feature comparison"
            title="Compare plans by the workflow you want to protect."
            description="The biggest difference is how much client-risk work you want inside Client Bureau: search volume, saved monitoring, evidence depth, contracts, service workflows, and team controls."
          />
          <Card className="overflow-hidden rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left text-sm">
                  <thead className="bg-slate-950 text-xs uppercase text-slate-300">
                    <tr>
                      <th className="p-4">Workflow</th>
                      <th className="p-4">Free</th>
                      <th className="p-4">Pro Contractor</th>
                      <th className="p-4">Bureau Team</th>
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
        description="Start with a free account, then upgrade when search, contracts, evidence, recovery, and team workflows become part of your business process."
        primary={{ href: "/signup?plan=pro", label: "Start Pro Contractor", icon: ShieldCheck }}
        secondary={{ href: "/enterprise", label: "View Enterprise", icon: Users }}
      />
    </>
  )
}

function PlanCard({ tier }: { tier: (typeof pricingTiers)[number] }) {
  const href = tier.id === "enterprise" ? "/enterprise" : `/signup?plan=${tier.id}`

  return (
    <Card className={tier.featured ? "rounded-md border-2 border-amber-400 bg-slate-950 text-white shadow-xl" : "rounded-md border-slate-200 bg-white shadow-sm"}>
      <CardContent className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={tier.featured ? "text-xl font-semibold text-white" : "text-xl font-semibold text-slate-950"}>{tier.name}</p>
            <p className={tier.featured ? "mt-2 text-sm leading-6 text-slate-300" : "mt-2 text-sm leading-6 text-slate-600"}>{tier.description}</p>
          </div>
          {tier.featured ? <Badge className="rounded-md bg-amber-400 text-slate-950">Best fit</Badge> : null}
        </div>
        <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
          <span className={tier.featured ? "text-4xl font-semibold text-white" : "text-4xl font-semibold text-slate-950"}>{tier.price}</span>
          <span className={tier.featured ? "pb-1 text-sm text-slate-300" : "pb-1 text-sm text-slate-500"}>{tier.cadence}</span>
        </div>
        <div className="grid gap-2">
          {tier.features.slice(0, 6).map((feature) => (
            <div key={feature} className={tier.featured ? "flex gap-2 text-sm text-slate-200" : "flex gap-2 text-sm text-slate-600"}>
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden="true" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
        <Button asChild className={tier.featured ? "w-full bg-amber-500 text-slate-950 hover:bg-amber-400" : "w-full"} variant={tier.featured ? "default" : "outline"}>
          <Link href={href}>{tier.id === "enterprise" ? "View enterprise" : "Choose plan"}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
