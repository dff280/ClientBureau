import type { Metadata } from "next"
import { CalendarClock, FileCheck2, FilePlus2, Landmark, Radar, ReceiptText, Search, ShieldCheck, Signature } from "lucide-react"

import { LegalNotice } from "@/components/client/legal-notice"
import {
  PremiumCtaBand,
  PremiumFeatureCard,
  PremiumHero,
  PremiumProofStrip,
  PremiumSectionHeader,
  ProductMockupFrame,
  WorkflowTimeline,
} from "@/components/marketing/premium-page-shell"
import { Card, CardContent } from "@/components/ui/card"
import { pageAssets } from "@/lib/page-assets"

export const metadata: Metadata = {
  title: "How Client Bureau Works",
  description:
    "Learn how contractors and service businesses use Client Bureau to check clients, set terms, document jobs, protect payment, and publish moderated reports.",
  alternates: {
    canonical: "/how-it-works",
  },
}

const proof = [
  { label: "Before", value: "Check", text: "Search client profiles before committing labor, materials, or schedule." },
  { label: "During", value: "Document", text: "Keep contracts, invoices, photos, approvals, and change orders organized." },
  { label: "After", value: "Protect", text: "Track payment issues, recovery cases, lien-service readiness, and resolution." },
  { label: "Public", value: "Moderate", text: "Approved summaries and client responses build safer public context." },
]

const system = [
  {
    icon: Search,
    phase: "01",
    title: "Check the client before you take the job",
    text: "Search by name, business, city, state, phone, email, or job context. Sensitive identifiers are used for private matching and are not displayed publicly.",
    href: "/search",
    cta: "Check a Client",
  },
  {
    icon: Signature,
    phase: "02",
    title: "Set clear terms before scheduling",
    text: "Use agreement packets and signing links to document scope, exclusions, deposits, milestones, cancellation terms, and change-order rules.",
    href: "/dashboard/contracts",
    cta: "Open contracts",
  },
  {
    icon: FileCheck2,
    phase: "03",
    title: "Document the work while it is happening",
    text: "Store evidence privately: invoices, contracts, screenshots, photos, approvals, PDFs, completion records, and payment communications.",
    href: "/dashboard/evidence",
    cta: "Open evidence vault",
  },
  {
    icon: FilePlus2,
    phase: "04",
    title: "Submit a client experience if the record matters",
    text: "Submit positive experiences, payment issues, disputes, chargebacks, or resolution context for moderation. Public summaries must stay factual and careful.",
    href: "/submit-report",
    cta: "Report experience",
  },
  {
    icon: ReceiptText,
    phase: "05",
    title: "Open recovery when payment stalls",
    text: "Create a private Resolution Desk case with invoices, project timeline, communication history, payment-plan options, and staff-reviewed follow-up.",
    href: "/payment-recovery-service",
    cta: "Recovery service",
  },
  {
    icon: Landmark,
    phase: "06",
    title: "Use Florida lien service when eligible",
    text: "Prepare notice or filing workflows with document review, service-fee tracking, contractor authorization, attorney/vendor review, and recording proof.",
    href: "/florida-lien-filing-service",
    cta: "Lien service",
  },
]

const safeguards = [
  {
    icon: ShieldCheck,
    title: "Private identifiers stay private",
    text: "Raw phone numbers, emails, street addresses, internal notes, and evidence files are not published on client profiles.",
  },
  {
    icon: Radar,
    title: "Public records are moderated",
    text: "Profiles show approved summaries, rating context, evidence-on-file labels, positive reports, and response status.",
  },
  {
    icon: CalendarClock,
    title: "Resolution context matters",
    text: "Disputes, corrections, payment plans, resolved reports, and client responses should stay visible when approved.",
  },
]

const evidenceVaultAsset = pageAssets.evidenceVault

export default function HowItWorksPage() {
  return (
    <>
      <PremiumHero
        eyebrow="How it works"
        title="Search before the job. Document during the job. Protect payment after the job."
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
              description="Search context, contract terms, evidence, recovery notes, and lien-service readiness stay organized as the project moves forward."
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
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {safeguards.map((item) => (
              <PremiumFeatureCard key={item.title} icon={item.icon} title={item.title} text={item.text} />
            ))}
          </div>
        </div>
      </section>

      <section className="bureau-section bg-white">
        <div className="bureau-container grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <p className="text-sm font-semibold uppercase text-amber-700">When a report is approved</p>
              <h2 className="text-3xl font-semibold tracking-normal text-slate-950">
                Approval can create or update a public client profile.
              </h2>
              <p className="text-sm leading-6 text-slate-600">
                Public profiles can show moderated summaries, rating factors, risk level, evidence-on-file summaries, positive reports, response context, and city/state directory links. Pending, rejected, private, and raw evidence content stay hidden.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-md border-slate-200 bg-slate-950 text-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <p className="text-sm font-semibold uppercase text-amber-300">What contractors get</p>
              <p className="text-2xl font-semibold">A repeatable process before the job becomes expensive.</p>
              <p className="text-sm leading-6 text-slate-300">
                Search first, set terms, document everything, and escalate carefully when payment or dispute risk appears.
              </p>
            </CardContent>
          </Card>
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
