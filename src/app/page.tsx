import Link from "next/link"
import type { Metadata } from "next"
import {
  ArrowRight,
  FileCheck2,
  FilePlus2,
  MessageSquareText,
  ReceiptText,
  Scale,
  Search,
  ShieldCheck,
  Signature,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { LegalNotice } from "@/components/client/legal-notice"
import { RiskBadge } from "@/components/client/risk-badge"
import { PremiumCtaBand, PublicDatabaseShowcase } from "@/components/marketing/premium-page-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  getPublicClientProfileService,
  getPublicClientProfilesService,
} from "@/lib/repositories/client-bureau-service"
import { primaryHook, primarySearchCta, reportExperienceCta } from "@/lib/product-positioning"
import {
  cleanPublicReportText,
  clientRatingBand,
  clientRatingDisclaimer,
  evidenceConfidenceLabel,
  responseStatusLabel,
} from "@/lib/client-rating"
import { isPositiveReportCategory } from "@/lib/types"
import {
  getFaqSchema,
  getLocalBusinessSchema,
  getOrganizationSchema,
  getSoftwareApplicationSchema,
  getWebSiteSchema,
  JsonLd,
} from "@/lib/seo"

export const metadata: Metadata = {
  title: "Client Bureau | Check a Client Before You Take the Job",
  description:
    "Check clients before accepting work. Review moderated reports, payment-risk signals, private matching, evidence summaries, and response context.",
  alternates: {
    canonical: "/",
  },
}

export const dynamic = "force-dynamic"

type HomepageProfile = NonNullable<Awaited<ReturnType<typeof getPublicClientProfileService>>>

const heroHeadline = "Check a Client Before You Take the Job."

const workflowSteps = [
  {
    icon: Search,
    phase: "Before",
    title: "Check the client.",
    text: "Search names, businesses, locations, and private-match identifiers before you accept the job.",
    href: "/search",
    cta: "Check a Client",
  },
  {
    icon: Signature,
    phase: "During",
    title: "Set terms and document the work.",
    text: "Use jobs, contracts, change orders, evidence, photos, invoices, and status records while the project is active.",
    href: "/platform",
    cta: "See the Platform",
  },
  {
    icon: ReceiptText,
    phase: "After",
    title: "Protect payment and keep the record fair.",
    text: "Track recovery, Florida lien-service readiness, responses, disputes, corrections, and resolution history.",
    href: "/payment-recovery-service",
    cta: "Get Payment Help",
  },
]

const productPreview = [
  ["Client Database", "Check clients, homeowners, property owners, customers, and businesses before accepting work."],
  ["Contractor Database", "Review service-business and contractor profiles with public verification and project context."],
  ["Subcontractor Database", "Inspect trade partner profiles, scope context, and payment-chain signals."],
  ["Private tools", "Turn a public check into jobs, contracts, evidence, recovery, lien service, and watchlists."],
]

const trustGuardrails = [
  ["Moderated summaries", "Public records are reviewed before display and written as reported experiences."],
  ["Private evidence", "Raw evidence files, private addresses, phone numbers, and emails stay out of public profiles."],
  ["Client response rights", "Clients can respond, dispute, correct, or submit resolution context."],
  ["Balanced records", "Positive reports, resolved cases, and dispute context matter alongside payment issues."],
]

const faqs = [
  {
    question: "Who is Client Bureau for?",
    answer:
      "Client Bureau is for contractors, subcontractors, service businesses, trade professionals, and clients who need a fair response or correction path.",
  },
  {
    question: "Is this a complaint site?",
    answer:
      "No. Client Bureau is a moderated client-intelligence and documentation platform. Public pages show careful summaries, balanced context, and response rights.",
  },
  {
    question: "What should I do first?",
    answer:
      "Start by checking a client before taking the job. If you have a documented experience, submit it for moderation.",
  },
  {
    question: "What stays private?",
    answer:
      "Raw evidence, private contact identifiers, job notes, internal admin notes, and private workflow records are not shown publicly.",
  },
]

export default async function Home() {
  const localBusinessSchema = getLocalBusinessSchema()
  const profiles = await getHomepageProfiles()
  const recentReports = profiles
    .flatMap((profile) => profile.reports.map((report) => ({ profile, report })))
    .slice(0, 3)
  const totalReportedUnpaid = profiles.reduce(
    (total, profile) =>
      total + profile.reports.reduce((reportTotal, report) => reportTotal + Math.max(report.amountUnpaid, 0), 0),
    0,
  )
  const heroPreview = recentReports[0]

  return (
    <>
      <JsonLd data={getOrganizationSchema()} />
      <JsonLd data={getWebSiteSchema()} />
      <JsonLd data={getSoftwareApplicationSchema()} />
      <JsonLd data={getFaqSchema(faqs)} />
      {localBusinessSchema ? <JsonLd data={localBusinessSchema} /> : null}

      <section className="premium-hero-surface relative isolate overflow-hidden bg-slate-950 text-white">
        <div className="bureau-container relative z-20 py-10 sm:py-14 lg:py-16">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_410px] lg:items-center">
            <div className="max-w-4xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-md border border-amber-300/35 bg-slate-950/70 px-3 py-2 text-sm font-semibold text-amber-200 shadow-lg shadow-slate-950/30 backdrop-blur">
                <ShieldCheck className="size-4" aria-hidden="true" />
                Three public databases. One protection platform.
              </div>

              <div className="space-y-4">
                <h1 className="max-w-4xl text-4xl font-semibold leading-[1.04] tracking-normal text-balance text-white sm:text-5xl lg:text-6xl">
                  {heroHeadline}
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
                  Search the Client Database, Contractor Database, and Subcontractor Database before labor,
                  materials, scheduling, or payment terms are at risk.
                </p>
              </div>

              <form action="/search" method="get" className="grid max-w-4xl gap-3 rounded-md border border-amber-200/30 bg-white p-2 shadow-[0_26px_80px_rgba(0,0,0,0.38)] sm:grid-cols-[1fr_auto]">
                <label htmlFor="homepage-client-search" className="sr-only">
                  Check a client
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <Input
                    id="homepage-client-search"
                    name="q"
                    placeholder="Search by client, business, contractor, subcontractor, city, state, phone, or email"
                    className="h-14 border-0 pl-12 text-base text-slate-950 shadow-none focus-visible:ring-0"
                  />
                </div>
                <Button type="submit" className="h-14 bg-amber-500 px-7 text-base font-semibold text-slate-950 hover:bg-amber-400">
                  {primarySearchCta}
                </Button>
              </form>

              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-md bg-amber-400 px-3 py-1.5 text-sm font-bold text-slate-950">
                  {primaryHook}
                </span>
                <span className="text-sm font-semibold text-slate-300">
                  Moderated records. Private evidence. Response rights.
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline" className="h-11 border-white/25 bg-white/10 text-white hover:bg-white/15">
                  <Link href="/submit-report">
                    <FilePlus2 aria-hidden="true" />
                    {reportExperienceCta}
                  </Link>
                </Button>
              </div>
            </div>

            <HeroProfilePreview item={heroPreview} />
          </div>
        </div>
      </section>

      <PublicDatabaseShowcase />

      <section className="bureau-section bg-slate-50">
        <div className="bureau-container space-y-8">
          <SectionIntro
            eyebrow="The protection workflow"
            title="Search before the job. Document during the job. Resolve after the job."
            text="Client Bureau is easiest to use when it becomes part of the way a business owner runs every serious project."
          />
          <div className="grid gap-4 lg:grid-cols-3">
            {workflowSteps.map((step) => (
              <WorkflowStepCard key={step.phase} step={step} />
            ))}
          </div>
        </div>
      </section>

      <section className="bureau-section bg-slate-950 text-white">
        <div className="bureau-container grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="space-y-6">
            <SectionIntro
              eyebrow="Product preview"
              title="A client check should feel like a business decision file."
              text="The record should answer the practical questions: who matched, what was reported, what evidence is on file, whether there is a response, and what to do next."
              dark
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {productPreview.map(([label, text]) => (
                <div key={label} className="rounded-md border border-white/10 bg-white/[0.06] p-4">
                  <p className="font-semibold text-amber-200">{label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <ProductDossierPreview item={heroPreview} totalReportedUnpaid={totalReportedUnpaid} />
        </div>
      </section>

      <section className="bureau-section bg-white">
        <div className="bureau-container grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div className="space-y-6">
            <SectionIntro
              eyebrow="Trust and fairness"
              title="A serious trust platform has to be careful by design."
              text="Client Bureau is built around moderated records, private evidence, response rights, positive context, and audit-ready review. The goal is better business decisions, not public shaming."
            />
            <LegalNotice />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {trustGuardrails.map(([title, text]) => (
              <TrustGuardrailCard key={title} title={title} text={text} />
            ))}
          </div>
        </div>
      </section>

      <PremiumCtaBand
        eyebrow="Before the next estimate"
        title="Make client checking part of every serious intake."
        description="Check the record, choose clear terms, document the job, and keep public context fair when someone responds, disputes, corrects, or resolves an issue."
        primary={{ href: "/search", label: primarySearchCta, icon: Search }}
        secondary={{ href: "/submit-report", label: reportExperienceCta, icon: FilePlus2 }}
      />
    </>
  )
}

async function getHomepageProfiles(): Promise<HomepageProfile[]> {
  const publicProfiles = await getPublicClientProfilesService()
  const detailedProfiles = await Promise.all(
    publicProfiles.map((profile) => getPublicClientProfileService(profile.publicSlug)),
  )

  return detailedProfiles.filter((profile): profile is HomepageProfile => Boolean(profile))
}

function SectionIntro({
  eyebrow,
  title,
  text,
  dark = false,
}: {
  eyebrow: string
  title: string
  text: string
  dark?: boolean
}) {
  return (
    <div className="max-w-3xl space-y-3">
      <p className={dark ? "text-sm font-semibold uppercase tracking-[0.16em] text-amber-300" : "text-sm font-semibold uppercase tracking-[0.16em] text-amber-700"}>
        {eyebrow}
      </p>
      <h2 className={dark ? "text-3xl font-semibold tracking-normal text-white sm:text-4xl" : "text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl"}>
        {title}
      </h2>
      <p className={dark ? "text-sm leading-6 text-slate-300 sm:text-base sm:leading-7" : "text-sm leading-6 text-slate-600 sm:text-base sm:leading-7"}>
        {text}
      </p>
    </div>
  )
}

function WorkflowStepCard({
  step,
}: {
  step: {
    icon: LucideIcon
    phase: string
    title: string
    text: string
    href: string
    cta: string
  }
}) {
  const Icon = step.icon

  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <span className="rounded-md bg-slate-950 px-3 py-1.5 text-xs font-semibold uppercase text-white">
          {step.phase}
        </span>
        <Icon className="size-6 text-amber-700" aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-slate-950">{step.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p>
      <Button asChild variant="ghost" className="mt-4 px-0 text-slate-950 hover:bg-transparent hover:text-amber-700">
        <Link href={step.href}>
          {step.cta}
          <ArrowRight aria-hidden="true" />
        </Link>
      </Button>
    </div>
  )
}

function ProductDossierPreview({
  item,
  totalReportedUnpaid,
}: {
  item?: {
    profile: HomepageProfile
    report: HomepageProfile["reports"][number]
  }
  totalReportedUnpaid: number
}) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-slate-950/40">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-300">Official dossier preview</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Search result, public record, and next action</h3>
        </div>
        <Badge className="rounded-md bg-emerald-500/15 text-emerald-100">
          <ShieldCheck className="mr-1 size-3" aria-hidden="true" />
          Moderated
        </Badge>
      </div>
      <div className="mt-5">
        <HeroProfilePreview item={item} />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <DarkFact label="Aggregate context" value={formatCurrency(totalReportedUnpaid)} />
        <DarkFact label="Evidence" value="Private" />
        <DarkFact label="Response" value="Available" />
      </div>
    </div>
  )
}

function HeroProfilePreview({
  item,
}: {
  item?: {
    profile: HomepageProfile
    report: HomepageProfile["reports"][number]
  }
}) {
  if (!item) {
    return (
      <Card className="rounded-md border-white/15 bg-white/10 text-white shadow-2xl backdrop-blur">
        <CardContent className="space-y-5 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-amber-200">Client Bureau Rating preview</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">What a client check shows</h2>
            </div>
            <ShieldCheck className="size-7 text-amber-200" aria-hidden="true" />
          </div>
          <p className="text-sm leading-6 text-slate-200">
            Approved profiles show moderated summaries, rating context, evidence-on-file labels, positive reports,
            and a client response path. Private identifiers and raw evidence stay private.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <DarkFact label="Rating" value="0-100" />
            <DarkFact label="Evidence" value="Private" />
            <DarkFact label="Response" value="Available" />
          </div>
          <p className="text-xs leading-5 text-slate-300">{clientRatingDisclaimer()}</p>
        </CardContent>
      </Card>
    )
  }

  const { profile, report } = item
  const paymentFact = getReportPaymentFact(report)
  const ratingLabel = clientRatingBand(profile.clientBureauScore, profile.reports.length)
  const evidenceConfidence = evidenceConfidenceLabel({
    evidenceCount: profile.evidence.length,
    reportCount: profile.reports.length,
    hasEvidenceOnFile: profile.reports.some((reportItem) => reportItem.evidenceAttached),
  })

  return (
    <Card className="rounded-md border-white/15 bg-white/10 text-white shadow-2xl backdrop-blur">
      <CardContent className="space-y-5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase text-amber-200">Client Bureau Rating</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              {profile.city}, {profile.state}
            </p>
          </div>
          <RiskBadge riskLevel={profile.riskLevel} />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <DarkFact label="Rating" value={`${profile.clientBureauScore}/100`} />
          <DarkFact label="Band" value={ratingLabel} />
          <DarkFact label={paymentFact.label} value={paymentFact.value} />
        </div>

        <div className="rounded-md border border-white/10 bg-slate-950/35 p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">{report.reportCategory}</p>
          <p className="mt-2 text-sm leading-6 text-slate-200">{cleanPublicReportText(report.publicSummary)}</p>
        </div>

        <div className="grid gap-2 text-xs font-semibold text-slate-200 sm:grid-cols-2">
          <span className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2">
            <FileCheck2 className="size-4 text-amber-200" aria-hidden="true" />
            Evidence confidence: {evidenceConfidence}
          </span>
          <span className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2">
            <MessageSquareText className="size-4 text-amber-200" aria-hidden="true" />
            {responseStatusLabel(profile)}
          </span>
        </div>

        <Button asChild className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400">
          <Link href={`/client/${profile.publicSlug}`}>
            View public profile
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function TrustGuardrailCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <Scale className="size-5 text-amber-700" aria-hidden="true" />
      <p className="mt-3 font-semibold text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  )
}

function DarkFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/5 p-3">
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  )
}

function getReportPaymentFact(report: HomepageProfile["reports"][number]) {
  if (isPositiveReportCategory(report.reportCategory)) {
    return {
      label: "Client experience",
      value: "Positive",
    }
  }

  if (report.amountUnpaid <= 0) {
    return {
      label: "Payment issue",
      value: "None reported",
    }
  }

  return {
    label: "Reported unpaid balance",
    value: formatCurrency(report.amountUnpaid),
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}
