import type { Metadata } from "next"
import { FilePlus2, ReceiptText, Search, ShieldCheck, Signature } from "lucide-react"

import { LegalNotice } from "@/components/client/legal-notice"
import {
  PremiumCtaBand,
  PremiumHero,
  PremiumProofStrip,
  PremiumSectionHeader,
  ProductMockupFrame,
  PublicDatabaseShowcase,
  WorkflowTimeline,
} from "@/components/marketing/premium-page-shell"
import { pageAssets } from "@/lib/page-assets"

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how contractors and service businesses use Client Bureau to check clients, set terms, document jobs, protect payment, and publish moderated reports.",
  alternates: {
    canonical: "/how-it-works",
  },
}

const proof = [
  { label: "Before", value: "Check", text: "Check client profiles before committing labor, materials, or schedule." },
  { label: "During", value: "Document", text: "Keep contracts, invoices, photos, approvals, and change orders organized." },
  { label: "After", value: "Protect", text: "Track payment issues, recovery cases, lien-service readiness, and resolution." },
  { label: "Public", value: "Moderate", text: "Approved summaries and client responses build safer public context." },
]

const system = [
  {
    icon: Search,
    phase: "01",
    title: "Check the client before you take the job",
    text: "Check by name, business, city, state, or private-match context. Sensitive identifiers are used for matching and are not displayed publicly.",
    href: "/search",
    cta: "Check a Client",
  },
  {
    icon: Signature,
    phase: "02",
    title: "Set terms and document the work",
    text: "Use agreement packets, signing links, evidence records, invoices, photos, approvals, and change orders while the job is active.",
    href: "/dashboard/contracts",
    cta: "Protect the job",
  },
  {
    icon: ReceiptText,
    phase: "03",
    title: "Respond, recover, or publish carefully",
    text: "Use reports, response paths, payment recovery, and Florida lien-service workflows when the record needs structure.",
    href: "/payment-recovery-service",
    cta: "Get payment help",
  },
]

const safeguards = [
  "Private identifiers, street addresses, raw evidence, and staff-only review notes stay out of public profiles.",
  "Public records are moderated and written as documented reported experiences.",
  "Responses, corrections, disputes, positive reports, and resolution context are part of the fairness model.",
]

const evidenceVaultAsset = pageAssets.evidenceVault

export default function HowItWorksPage() {
  return (
    <>
      <PremiumHero
        eyebrow="How it works"
        title="Check before the job. Document during the job. Protect payment after the job."
        description="Client Bureau is a business-owner protection workflow for contractors and service businesses: check clients, set terms, document work, recover payment professionally, and publish moderated public records only when appropriate."
        primary={{ href: "/search", label: "Check a Client", icon: Search }}
        secondary={{ href: "/submit-report", label: "Report a Client Experience", icon: FilePlus2 }}
        aside={
          <div className="space-y-4 text-white">
            <ShieldCheck className="size-8 text-amber-300" aria-hidden="true" />
            <p className="text-xl font-semibold">Built for real job risk.</p>
            <p className="text-sm leading-6 text-slate-300">
              Labor, materials, crew time, contract terms, invoices, and reputation all need protection before a dispute starts.
            </p>
          </div>
        }
      />
      <PremiumProofStrip items={proof} dark />
      <PublicDatabaseShowcase
        compact
        eyebrow="Start with the right record"
        title="The workflow begins with the Client, Contractor, or Subcontractor Database."
        description="A visitor should not need training. Pick the record type, review public context, then move into private tools only when action is needed."
      />

      <section className="bureau-section bg-white">
        <div className="bureau-container space-y-8">
          <PremiumSectionHeader
            eyebrow="Client Protection System"
            title="One workflow from first search to final resolution."
            description="The platform is designed so an everyday contractor knows what to do next: search, contract, document, report, recover, and preserve fairness."
          />
          <div className="grid gap-6 xl:grid-cols-[1fr_420px] xl:items-start">
            <WorkflowTimeline items={system} />
            <ProductMockupFrame
              eyebrow="Operating system"
              title="Every step creates a stronger private record."
              description="Client-check context, contract terms, evidence, recovery notes, and lien-service readiness stay organized as the project moves forward."
              imageSrc={evidenceVaultAsset.src}
              imageAlt={evidenceVaultAsset.alt}
              points={["Private evidence by default", "Moderated summaries only", "Response and correction path"]}
            />
          </div>
        </div>
      </section>

      <section className="bureau-section bg-slate-100">
        <div className="bureau-container grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div className="space-y-6">
            <PremiumSectionHeader
              eyebrow="Fairness by design"
              title="The product must help business owners without becoming a complaint wall."
              description="Client Bureau uses documented reported-experience language, moderation, private evidence, client response paths, corrections, positive reports, and resolution context."
            />
            <LegalNotice />
          </div>
          <div className="grid gap-3">
            {safeguards.map((item) => (
              <div key={item} className="flex gap-3 rounded-md border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600 shadow-sm">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-700" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PremiumCtaBand
        eyebrow="Start with the next client"
        title="Before you schedule the crew, check the client."
        description="Run a client search, save the result, and decide whether to proceed, watch, contract, or document the experience."
        primary={{ href: "/search", label: "Check a Client", icon: Search }}
        secondary={{ href: "/signup", label: "Create Free Account", icon: ShieldCheck }}
      />
    </>
  )
}
