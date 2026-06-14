import type { Metadata } from "next"
import Link from "next/link"
import {
  BellRing,
  BriefcaseBusiness,
  Building2,
  CircleDollarSign,
  FileCheck2,
  Landmark,
  LockKeyhole,
  MessageSquareText,
  Search,
  ShieldCheck,
  Signature,
  UserCheck,
} from "lucide-react"

import {
  BureauPanel,
  ComparisonProofBlock,
  GuidedActionPanel,
  PageProofStrip,
  PremiumCtaBand,
  PremiumFeatureCard,
  PremiumHero,
  PremiumSectionHeader,
  ProductMockupFrame,
  PublicJourneyNav,
  WorkflowTimeline,
} from "@/components/marketing/premium-page-shell"
import { pageAssets } from "@/lib/page-assets"
import { getFaqSchema, JsonLd } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Platform for Contractor Business Protection",
  description:
    "Explore Client Bureau's client checks, public profiles, contracts, evidence vault, payment recovery, Florida lien service, and mobile tools.",
  alternates: {
    canonical: "/platform",
  },
}

const proof = [
  { label: "Primary action", value: "Check first", text: "Check before labor, materials, scheduling, deposits, or final terms." },
  { label: "Public records", value: "Moderated", text: "Profiles show approved summaries and response context, not private files." },
  { label: "Private tools", value: "End to end", text: "Contracts, evidence, recovery, lien service, and alerts stay in the business workspace." },
  { label: "Audience", value: "Contractors", text: "Built for trade businesses, service companies, subs, and professional operators." },
]

const modules = [
  {
    icon: Search,
    title: "Client risk intelligence",
    text: "Check clients, homeowners, businesses, project leads, city/state context, private-match signals, payment indicators, and approved report summaries.",
  },
  {
    icon: Building2,
    title: "Public profile network",
    text: "Approved client, contractor, service-business, subcontractor, and trade profiles create a safer record layer without exposing private identifiers.",
  },
  {
    icon: Signature,
    title: "Contracts and e-signatures",
    text: "Create private agreement packets with scope, exclusions, deposits, milestones, change orders, cancellation terms, and signing links.",
  },
  {
    icon: FileCheck2,
    title: "Evidence vault",
    text: "Keep invoices, photos, screenshots, contracts, approvals, and completion records organized privately for reports or service cases.",
  },
  {
    icon: CircleDollarSign,
    title: "Payment Recovery",
    text: "Open Resolution Desk cases, document invoice age, organize contact attempts, track offers, and keep contractor-direct payment resolution clear.",
  },
  {
    icon: Landmark,
    title: "Florida Lien Service",
    text: "Start Florida notice or filing workflows with document review, contractor authorization, deadline cues, vendor routing, and recording proof.",
  },
]

const workflow = [
  {
    phase: "01",
    icon: Search,
    title: "Check the client",
    text: "Check before you take the job. Review approved public context, private-match guidance, positive signals, disputes, and response status.",
    href: "/search",
    cta: "Check a Client",
  },
  {
    phase: "02",
    icon: Signature,
    title: "Set the terms",
    text: "Create a contract packet, define scope, document payment terms, and send a signing link before scheduling or buying materials.",
    href: "/contractor-contract-template",
    cta: "Explore contracts",
  },
  {
    phase: "03",
    icon: FileCheck2,
    title: "Document the job",
    text: "Store private evidence, reports, project context, change orders, and completion records while the work is still fresh.",
    href: "/dashboard/evidence",
    cta: "Open evidence vault",
  },
  {
    phase: "04",
    icon: BellRing,
    title: "Watch and monitor",
    text: "Save searches and watch profiles so changes, public updates, and response context do not get missed before the next job.",
    href: "/dashboard/watchlist",
    cta: "Watch clients",
  },
  {
    phase: "05",
    icon: CircleDollarSign,
    title: "Recover or escalate",
    text: "If payment stalls, open a private recovery case or Florida lien-service workflow with records, status, and audit-ready next actions.",
    href: "/payment-recovery-service",
    cta: "Recovery service",
  },
]

const trustControls = [
  "Public profiles only show admin-approved summaries and safe public fields.",
  "Raw phone numbers, emails, street addresses, storage paths, private files, and admin notes stay private.",
  "Positive reports, resolved outcomes, response rights, and dispute context are part of the record.",
  "Contracts, evidence, recovery cases, lien cases, and watchlist notes are private business workflows.",
]

const audiences = [
  {
    icon: BriefcaseBusiness,
    title: "Contractors and service businesses",
    text: "Use Client Bureau before accepting jobs, assigning crew time, ordering materials, or extending payment trust.",
  },
  {
    icon: UserCheck,
    title: "Subcontractors and trade partners",
    text: "Document experiences with contractors, project operators, payment chains, retainage context, and trade-specific records.",
  },
  {
    icon: MessageSquareText,
    title: "Clients with a response or correction",
    text: "Submit a response, dispute, correction request, or resolution update through moderated fairness workflows.",
  },
]

const comparisonRows = [
  {
    label: "Before accepting work",
    before: "Rely on instinct, a quick web search, or whatever the lead says during intake.",
    after: "Run a client check, save the search, review response context, and decide terms before scheduling.",
  },
  {
    label: "During the project",
    before: "Keep contracts, change orders, photos, texts, and invoices scattered across devices.",
    after: "Keep job records, agreement packets, evidence, and updates organized in one private workspace.",
  },
  {
    label: "When payment stalls",
    before: "Start from scratch under pressure, with missing proof and unclear next steps.",
    after: "Open recovery or Florida lien-service workflows with timeline, documentation, and private status records.",
  },
]

const faqs = [
  {
    question: "Is Client Bureau a complaint site?",
    answer:
      "No. Client Bureau is a moderated business-protection platform for documented experiences, public profile context, private matching, evidence summaries, positive reports, and response rights.",
  },
  {
    question: "What makes Client Bureau different from a review site?",
    answer:
      "Client Bureau is built around contractor risk operations: search before the job, contract before scheduling, document during work, and use private recovery or lien-service workflows when payment needs structure.",
  },
  {
    question: "Are private documents shown publicly?",
    answer:
      "No. Public profiles may show approved evidence-on-file summaries, but raw evidence files, private identifiers, internal notes, and service records stay private.",
  },
]

const mobileFieldAppAsset = pageAssets.mobileFieldApp

export default function PlatformPage() {
  return (
    <>
      <JsonLd data={getFaqSchema(faqs)} />
      <PremiumHero
        eyebrow="The contractor business protection platform"
        title="The missing client bureau for businesses that do the work first."
        description="Client Bureau brings client checks, moderated public profiles, contracts, evidence, payment recovery, lien-service workflow, and mobile tools into one serious operating system."
        primary={{ href: "/search", label: "Check a Client", icon: Search }}
        secondary={{ href: "/signup", label: "Create Account", icon: LockKeyhole }}
        aside={
          <ProductMockupFrame
            dark
            eyebrow="Platform doctrine"
            title="Search, document, protect."
            description="Every workflow helps a contractor or service business make a cleaner decision before risk becomes expensive."
            imageSrc={mobileFieldAppAsset.src}
            imageAlt={mobileFieldAppAsset.alt}
            points={mobileFieldAppAsset.points}
          />
        }
      />

      <PageProofStrip items={proof} />

      <PublicJourneyNav
        active="protect"
        eyebrow="Public map"
        title="The platform is organized around the job lifecycle."
        description="Contractors should not have to decode software modules. Start with a client check, then move into contracts, evidence, recovery, or public record review as the job changes."
      />

      <section className="bureau-section bg-white">
        <div className="bureau-container grid gap-8 lg:grid-cols-[0.9fr_1.3fr] lg:items-start">
          <PremiumSectionHeader
            eyebrow="What the platform does"
            title="A full protection system, not a complaint wall."
            description="Client Bureau is designed for the real way business owners get hurt: a lead looks fine, work begins, money is spent, and documentation only becomes urgent after payment breaks down."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {modules.map((module) => (
              <PremiumFeatureCard key={module.title} icon={module.icon} title={module.title} text={module.text} />
            ))}
          </div>
        </div>
      </section>

      <section className="bureau-section bg-slate-50">
        <div className="bureau-container space-y-8">
          <PremiumSectionHeader
            eyebrow="How business owners use it"
            title="One workflow from lead screening to payment protection."
            description="The platform is organized by the same order contractors live through: before the job, during the job, and after an issue."
          />
          <WorkflowTimeline items={workflow} />
          <ComparisonProofBlock
            title="The difference is structure before pressure."
            description="The platform is built to reduce the moment where a contractor realizes the paperwork, client context, and evidence are all scattered after money is already at risk."
            rows={comparisonRows}
          />
        </div>
      </section>

      <section className="bureau-section bg-slate-950 text-white">
        <div className="bureau-container grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div>
            <PremiumSectionHeader
              eyebrow="Trust and fairness"
              title="Serious enough for public records. Careful enough for real disputes."
              description="Client Bureau should feel authoritative without becoming inflammatory. Public pages use cautious language, right-of-response paths, and private-data rules."
              dark
            />
            <div className="mt-8 grid gap-3">
              {trustControls.map((control) => (
                <div key={control} className="flex gap-3 rounded-md border border-white/10 bg-white/[0.06] p-4 text-sm leading-6 text-slate-300">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-amber-300" aria-hidden="true" />
                  <span>{control}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            {audiences.map((audience) => {
              const Icon = audience.icon

              return (
                <BureauPanel key={audience.title} dark>
                  <Icon className="size-6 text-amber-300" aria-hidden="true" />
                  <h3 className="mt-4 text-xl font-semibold text-white">{audience.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{audience.text}</p>
                </BureauPanel>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bureau-section bg-white">
        <div className="bureau-container grid gap-6 lg:grid-cols-3">
          <GuidedActionPanel
            eyebrow="First move"
            title="Run the check."
            description="A new visitor should understand Client Bureau in one action: search the client before the job starts."
            primary={{ href: "/search", label: "Check a Client", icon: Search }}
            secondary={{ href: "/how-it-works", label: "How It Works", icon: ShieldCheck }}
          />
          <BureauPanel className="lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Launch-ready paths</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["Browse public records", "/clients"],
                ["Compare contractor profiles", "/profiles/contractor"],
                ["Review subcontractor profiles", "/profiles/subcontractor"],
                ["Open payment recovery", "/payment-recovery-service"],
                ["Start Florida lien service", "/florida-lien-filing-service"],
                ["Download Android app", "/mobile-app"],
              ].map(([label, href]) => (
                <Link key={href} href={href} className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-amber-300 hover:bg-white">
                  {label}
                </Link>
              ))}
            </div>
          </BureauPanel>
        </div>
      </section>

      <PremiumCtaBand
        eyebrow="Client Bureau"
        title="Check the client before the job gets expensive."
        description="Check public context, preserve private records, and use the right workflow before the next project creates avoidable risk."
        primary={{ href: "/search", label: "Check a Client", icon: Search }}
        secondary={{ href: "/signup", label: "Create Free Account", icon: LockKeyhole }}
      />
    </>
  )
}
