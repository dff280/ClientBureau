import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FilePlus2,
  Handshake,
  LockKeyhole,
  MessageSquareText,
  Scale,
  Search,
  ShieldCheck,
  Signature,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { LegalNotice } from "@/components/client/legal-notice"
import { RiskBadge } from "@/components/client/risk-badge"
import { BusinessProtectionWorkflow } from "@/components/marketing/business-protection-workflow"
import { PricingCard } from "@/components/pricing/pricing-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  getPublicClientProfileService,
  getPublicClientProfilesService,
} from "@/lib/repositories/client-bureau-service"
import { pricingTiers } from "@/lib/stripe/pricing"
import { corePositioning, primaryHook, primarySearchCta, reportExperienceCta } from "@/lib/product-positioning"
import { cleanPublicReportText, clientRatingBand, clientRatingDisclaimer, evidenceConfidenceLabel, responseStatusLabel } from "@/lib/client-rating"
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
  title: "Client Bureau | Check Client Ratings Before You Take the Job",
  description:
    "Search client ratings, payment-risk indicators, contractor-submitted reports, and response context before risking labor, materials, crew time, and profit.",
  alternates: {
    canonical: "/",
  },
}

export const dynamic = "force-dynamic"

type HomepageProfile = NonNullable<Awaited<ReturnType<typeof getPublicClientProfileService>>>

const heroHeadline = corePositioning

const heroTrustSignals = [
  "Contractor-powered client intelligence",
  "Moderated public client profiles",
  "Positive and concerning reports",
  "Private matching, public-safe summaries",
]

const decisionStats = [
  { label: "Cause", value: "Businesses lose money when they accept the wrong clients." },
  { label: "Effect", value: "Unpaid invoices, wasted labor, missed payroll, and stressed cash flow." },
  { label: "Prevention", value: "Search reports, payment-risk indicators, and response context before you commit." },
]

const painWorkflows = [
  {
    icon: Search,
    title: "Search the client before you risk labor, materials, or calendar space.",
    text: "Look up client history by name, business, phone, email, city, state, or job address before you quote, hold dates, order supplies, or rush scheduling.",
    href: "/search",
    cta: primarySearchCta,
  },
  {
    icon: ClipboardCheck,
    title: "Read contractor-submitted experiences with moderated public summaries.",
    text: "Client Bureau organizes documented payment issues, disputes, chargebacks, positive client experiences, resolved reports, and client response context.",
    href: "/reports/recent",
    cta: "View reports",
  },
  {
    icon: BadgeCheck,
    title: "Review payment-risk indicators before saying yes.",
    text: "Review rating context, report count, positive references, open disputes, resolved issues, and evidence-on-file summaries without exposing private data.",
    href: "/score-methodology",
    cta: "Rating method",
  },
  {
    icon: Building2,
    title: "Use public client profiles as a reputation record, not a rumor page.",
    text: "Profiles are built from approved report summaries, positive reports, public responses, timelines, risk indicators, and careful moderation language.",
    href: "/clients",
    cta: "Browse profiles",
  },
  {
    icon: Signature,
    title: "When you proceed, protect the job with contracts and documentation.",
    text: "Agreement packets, evidence records, and change-order controls support the core reputation workflow after the client search is complete.",
    href: "/dashboard/contracts",
    cta: "Create contract",
  },
  {
    icon: MessageSquareText,
    title: "When payment breaks down, preserve a fair response and resolution path.",
    text: "Client responses, disputes, corrections, managed recovery records, and resolution updates keep public context more credible and useful.",
    href: "/client-response",
    cta: "Response path",
  },
]

const intakeMoments = [
  {
    icon: BriefcaseBusiness,
    title: "You are about to give up a calendar slot.",
    text: "Search the client before blocking crew time, delaying another job, or committing to a narrow start window.",
  },
  {
    icon: Handshake,
    title: "You need the job, but not unclear terms.",
    text: "Send a clear agreement link, collect signatures, define deposits, and keep change orders tied to the client record.",
  },
  {
    icon: ClipboardCheck,
    title: "The work is finished, but the record is thin.",
    text: "Upload approvals, photos, invoices, messages, and completion notes before payment follow-up becomes harder to prove.",
  },
  {
    icon: Scale,
    title: "The dispute is real, but the public record must be careful.",
    text: "Keep summaries neutral, include response context, and document corrections or resolutions through moderation.",
  },
]

const moderationStandards = [
  ["No private identifiers", "Raw phone numbers, emails, street addresses, evidence files, and internal notes stay off public pages."],
  ["Approved summaries only", "Pending, rejected, and private content does not appear on public profiles or SEO pages."],
  ["Positive context supported", "Positive reports, resolved reports, and would-work-again feedback help avoid one-sided client records."],
  ["Right of response", "Clients can submit a response, dispute, correction request, or resolution update for review."],
]

const categoryComparison = [
  {
    title: "Before Client Bureau",
    items: ["Take the job", "Buy materials", "Schedule the crew", "Hope the client pays"],
  },
  {
    title: "After Client Bureau",
    items: ["Check the client", "Set clear terms", "Document the job", "Protect payment", "Resolve disputes fairly"],
  },
]

const businessTypes = [
  "General contractors",
  "Roofers",
  "Remodelers",
  "Painters",
  "Landscapers",
  "HVAC teams",
  "Pool companies",
  "Flooring crews",
  "Pressure washing",
  "Event vendors",
  "Creative agencies",
  "Consultants",
]

const directoryLinks = [
  { href: "/clients/florida", label: "Florida profiles" },
  { href: "/clients/orlando-fl", label: "Orlando FL" },
  { href: "/clients/tampa-fl", label: "Tampa FL" },
  { href: "/clients/miami-fl", label: "Miami FL" },
  { href: "/reports/recent", label: "Recent reports" },
  { href: "/reports/non-payment", label: "Payment reports" },
  { href: "/industries/contractors", label: "Contractors" },
  { href: "/industries/service-businesses", label: "Service businesses" },
]

const faqs = [
  {
    question: "What is Client Bureau?",
    answer:
      "Client Bureau is a contractor-powered client intelligence platform. Contractors and service business owners use it to search client reports, public profiles, payment-risk indicators, positive references, and response history before accepting work from a homeowner, customer, or project client.",
  },
  {
    question: "What is Client Bureau not?",
    answer:
      "Client Bureau is not a place for unsupported accusations. It is a moderated client intelligence platform for documented experiences, positive reports, evidence-on-file summaries, client responses, corrections, and resolution context.",
  },
  {
    question: "Are reports published automatically?",
    answer:
      "No. Public client profile content is reviewed before publication and uses careful, supportable summary language.",
  },
  {
    question: "Are phone numbers, emails, or evidence files public?",
    answer:
      "No. Private identifiers and raw evidence can support matching and moderation, but they are not displayed on public client profile pages.",
  },
]

export default async function Home() {
  const localBusinessSchema = getLocalBusinessSchema()
  const profiles = await getHomepageProfiles()
  const recentReports = profiles
    .flatMap((profile) =>
      profile.reports.map((report) => ({
        profile,
        report,
      })),
    )
    .sort((a, b) =>
      new Date(b.report.approvedAt ?? b.report.createdAt).getTime() -
      new Date(a.report.approvedAt ?? a.report.createdAt).getTime(),
    )
    .slice(0, 3)
  const allReports = profiles.flatMap((profile) => profile.reports)
  const positiveReports = allReports.filter((report) => isPositiveReportCategory(report.reportCategory)).length
  const openResponses = profiles.reduce((total, profile) => total + profile.clientResponses.length, 0)
  const reviewedEvidence = profiles.reduce((total, profile) => total + profile.evidence.length, 0)
  const totalReportedUnpaid = profiles.reduce(
    (total, profile) => total + profile.balanceSummary.totalReportedUnpaid,
    0,
  )
  const stats = [
    { label: "Public profiles", value: profiles.length.toLocaleString(), text: "Approved client reputation pages indexed for careful public research." },
    { label: "Client experience reports", value: allReports.length.toLocaleString(), text: "Documented experiences reviewed before display." },
    { label: "Positive reports", value: positiveReports.toLocaleString(), text: "Good client history belongs in the record too." },
    { label: "Evidence files", value: reviewedEvidence.toLocaleString(), text: "Evidence reviewed privately, summarized publicly." },
  ]
  const heroPreview = recentReports[0]

  return (
    <>
      <JsonLd data={getOrganizationSchema()} />
      <JsonLd data={getWebSiteSchema()} />
      <JsonLd data={getSoftwareApplicationSchema()} />
      <JsonLd data={getFaqSchema(faqs)} />
      {localBusinessSchema ? <JsonLd data={localBusinessSchema} /> : null}

      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <Image
          src="/images/client-bureau-platform-hero-bright.webp"
          alt="Client Bureau dashboard interface for client search, contract packets, report review, and evidence workflow."
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 z-0 object-cover object-[68%_center] opacity-90"
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950 via-slate-950/82 to-slate-950/20" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-slate-950/10 to-slate-950/25" />

        <div className="bureau-container relative z-20 grid min-h-[620px] items-center gap-10 py-10 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="max-w-4xl space-y-7">
            <div className="inline-flex items-center gap-2 rounded-md border border-amber-300/30 bg-white/5 px-3 py-2 text-sm font-semibold text-amber-200">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Contractor-powered client ratings
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl lg:text-6xl">
                {heroHeadline}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-slate-100 sm:text-xl">
                Search client ratings, payment-risk indicators, contractor-submitted reports, and response context
                before risking labor, materials, deposits, crew time, and profit.
              </p>
              <p className="text-base font-semibold text-amber-200">{primaryHook}</p>
            </div>

            <form action="/search" className="grid max-w-4xl gap-3 rounded-md border border-white/15 bg-white p-2 shadow-2xl sm:grid-cols-[1fr_auto]">
              <label htmlFor="homepage-client-search" className="sr-only">
                Search for a client
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <Input
                  id="homepage-client-search"
                  name="q"
                  placeholder="Search by client name, business, phone, email, or city"
                  className="h-12 border-0 pl-10 text-slate-950 shadow-none focus-visible:ring-0"
                />
              </div>
              <Button className="h-12 bg-amber-500 px-6 font-semibold text-slate-950 hover:bg-amber-400">
                {primarySearchCta}
              </Button>
            </form>
            <div className="flex max-w-4xl flex-wrap gap-2 text-xs font-semibold uppercase text-slate-300">
              <span className="rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-amber-200">
                Try: Orlando homeowner, John Smith, ABC Property Group
              </span>
              {["Name", "Business", "Phone", "Email", "City", "Job address"].map((label) => (
                <span key={label} className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5">
                  {label}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/15">
                <Link href="/submit-report">
                  <FilePlus2 aria-hidden="true" />
                  {reportExperienceCta}
                </Link>
              </Button>
              <Button asChild className="bg-white text-slate-950 hover:bg-slate-100">
                <Link href="/signup">
                  <LockKeyhole aria-hidden="true" />
                  Create Free Account
                </Link>
              </Button>
            </div>

            <div className="grid max-w-4xl gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {heroTrustSignals.map((signal) => (
                <div key={signal} className="flex items-center gap-3 border-l border-amber-300/50 bg-slate-950/55 px-4 py-3 text-sm text-slate-100 backdrop-blur">
                  <CheckCircle2 className="size-4 text-amber-300" aria-hidden="true" />
                  <span>{signal}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:justify-self-end">
            <HeroProfilePreview item={heroPreview} />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="bureau-container grid gap-4 py-5 lg:grid-cols-3">
          {decisionStats.map((stat) => (
            <div key={stat.label} className="grid gap-1 border-l border-amber-300 pl-4">
              <p className="text-xs font-semibold uppercase text-slate-500">{stat.label}</p>
              <p className="text-sm font-semibold text-slate-950">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bureau-section bg-white">
        <div className="bureau-container grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <SectionIntro
            eyebrow="A category contractors were missing"
            title="Customers have had review platforms for years. Contractors finally have one too."
            text="Homeowners can check reviews, licensing, complaints, and contractor history before hiring. But contractors and service businesses are often expected to risk labor, materials, deposits, and crew time with no shared client history. Client Bureau gives business owners a safer way to check, document, and respond."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {categoryComparison.map((group) => (
              <div key={group.title} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase text-amber-700">{group.title}</p>
                <div className="mt-4 grid gap-3">
                  {group.items.map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
                      <CheckCircle2 className="size-4 text-amber-700" aria-hidden="true" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bureau-section bg-slate-100">
        <div className="bureau-container grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <SectionIntro
            eyebrow="Real business-owner pain"
            title="A job can look profitable on paper and still damage your cash flow."
            text="One risky client relationship can mean non-returnable materials, a lost week on the schedule, unpaid final invoices, disputed change orders, or hours spent chasing records instead of running the business."
          />
          <div className="grid gap-4 md:grid-cols-2">
            {intakeMoments.map((item) => (
              <ProcessTile key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="bureau-section bg-slate-100">
        <div className="bureau-container space-y-8">
          <SectionIntro
            eyebrow="Where the money leaks"
            title="Turn painful client moments into checkpoints before they become losses."
            text="Client Bureau turns client history into a practical intake checkpoint: search before the job, document during the job, protect payment after the job, then resolve disputes with fair response context."
          />
          <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
            {painWorkflows.map((workflow, index) => (
              <PainWorkflowRow key={workflow.title} workflow={workflow} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="bureau-section bg-white">
        <div className="bureau-container">
          <BusinessProtectionWorkflow
            compact
            ctaHref="/signup"
            ctaLabel="Create account"
          />
        </div>
      </section>

      <section className="bureau-section bg-slate-950 text-white">
        <div className="bureau-container grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
          <div className="space-y-5">
            <SectionIntro
              eyebrow="Moderated public intelligence"
              title="When a report becomes public, it should help the next business make a better decision."
              text="Profile pages show approved summaries, report counts, rating context, evidence-on-file summaries, positive reports, disputes, and client responses after moderation."
              dark
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {moderationStandards.map(([title, text]) => (
                <div key={title} className="rounded-md border border-white/10 bg-white/5 p-4">
                  <Scale className="size-5 text-amber-300" aria-hidden="true" />
                  <p className="mt-3 font-semibold text-white">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {recentReports.length > 0 ? (
              recentReports.map(({ profile, report }) => (
                <PublicReportPreview key={report.id} profile={profile} report={report} />
              ))
            ) : (
              <div className="rounded-md border border-white/10 bg-white/5 p-6">
                <p className="font-semibold text-white">Public report previews will appear after approval.</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  The homepage only displays approved public profile context.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bureau-section bg-white">
        <div className="bureau-container grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="space-y-6">
            <SectionIntro
              eyebrow="Trust signals"
              title="The goal is not to punish clients. The goal is better business decisions."
              text="Client Bureau separates public summaries from private evidence, supports client responses, and gives businesses a place to document positive experiences, resolved matters, and disputed context."
            />
            <LegalNotice />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TrustMetric label="Reported unpaid balances" value={formatCurrency(totalReportedUnpaid)} text="Shown only as aggregated report context from approved public profiles." />
            <TrustMetric label="Client responses" value={openResponses.toLocaleString()} text="Responses, disputes, corrections, and resolution updates are reviewable before display." />
            <TrustMetric label="Evidence privacy" value="Private" text="Public pages show summaries like invoices reviewed or documents reviewed." />
            <TrustMetric label="Positive reports" value={positiveReports.toLocaleString()} text="Good client experiences can be submitted and moderated too." />
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-950 text-white">
        <div className="bureau-container grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="border-l border-amber-300/60 pl-4">
              <p className="text-xs font-semibold uppercase text-slate-400">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold text-white">{stat.value}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{stat.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bureau-section bg-slate-100">
        <div className="bureau-container space-y-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <SectionIntro
              eyebrow="Markets and industries"
              title="Built for contractors first, useful for service businesses next."
              text="The first use case is contractor intake because a risky client relationship can affect crew time, materials, schedules, deposits, invoices, and property access. The same workflow fits any business that takes client risk before payment is complete."
            />
            <Button asChild variant="outline">
              <Link href="/resources">
                Browse resources
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_0.72fr]">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {businessTypes.map((type) => (
                <div key={type} className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm">
                  <Building2 className="size-4 text-amber-700" aria-hidden="true" />
                  {type}
                </div>
              ))}
            </div>
            <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold uppercase text-amber-700">Browse public directories</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {directoryLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:text-slate-950">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bureau-section bg-white">
        <div className="bureau-container grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <SectionIntro
            eyebrow="Plans"
            title="Start with one client check. Upgrade when the process saves real time and money."
            text="Free supports searching and report submission. Pro and Team plans support watchlists, saved searches, evidence workflows, contract packets, recovery tracking, and shared business operations."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {pricingTiers.map((tier) => (
              <PricingCard key={tier.id} tier={tier} />
            ))}
          </div>
        </div>
      </section>

      <section className="bureau-section bg-slate-950 text-white">
        <div className="bureau-container grid gap-8 lg:grid-cols-[1fr_0.82fr] lg:items-center">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase text-amber-300">Make it part of intake</p>
            <h2 className="text-4xl font-semibold tracking-normal sm:text-5xl">
              Before you schedule the crew, order materials, or accept the job, search the client.
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-300">
              Search public profiles, review payment-risk indicators, read contractor-submitted experiences, and build
              a fairer record for business owners and clients who resolve issues responsibly.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Button asChild className="h-12 bg-amber-500 text-slate-950 hover:bg-amber-400">
              <Link href="/search">
                <Search aria-hidden="true" />
                {primarySearchCta}
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12 border-white/20 bg-transparent text-white hover:bg-white/10">
              <Link href="/submit-report">
                <FilePlus2 aria-hidden="true" />
                {reportExperienceCta}
              </Link>
            </Button>
          </div>
        </div>
      </section>
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
      <p className={dark ? "text-sm font-semibold uppercase text-amber-300" : "text-sm font-semibold uppercase text-amber-700"}>
        {eyebrow}
      </p>
      <h2 className={dark ? "text-3xl font-semibold tracking-normal text-white sm:text-4xl" : "text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl"}>
        {title}
      </h2>
      <p className={dark ? "text-sm leading-6 text-slate-300" : "text-sm leading-6 text-slate-600"}>
        {text}
      </p>
    </div>
  )
}

function ProcessTile({
  item,
}: {
  item: {
    icon: LucideIcon
    title: string
    text: string
  }
}) {
  const Icon = item.icon

  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <Icon className="size-7 text-slate-950" aria-hidden="true" />
      <h3 className="mt-4 text-lg font-semibold text-slate-950">{item.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
    </div>
  )
}

function PainWorkflowRow({
  workflow,
  index,
}: {
  workflow: {
    icon: LucideIcon
    title: string
    text: string
    href: string
    cta: string
  }
  index: number
}) {
  const Icon = workflow.icon

  return (
    <div className="grid gap-4 border-b border-slate-200 p-5 last:border-b-0 md:grid-cols-[64px_1fr_auto] md:items-center">
      <div className="flex size-12 items-center justify-center rounded-md bg-slate-950 text-white">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-slate-500">
          {String(index + 1).padStart(2, "0")} / Real job pressure
        </p>
        <h3 className="mt-1 text-xl font-semibold text-slate-950">{workflow.title}</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{workflow.text}</p>
      </div>
      <Button asChild variant="outline" className="md:justify-self-end">
        <Link href={workflow.href}>
          {workflow.cta}
          <ArrowRight aria-hidden="true" />
        </Link>
      </Button>
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
              <h2 className="mt-2 text-2xl font-semibold text-white">What a search result shows</h2>
            </div>
            <ShieldCheck className="size-7 text-amber-200" aria-hidden="true" />
          </div>
          <p className="text-sm leading-6 text-slate-200">
            Approved profile pages show moderated summaries, rating context, evidence-on-file
            labels, positive reports, and a client response path. Raw phone numbers, emails,
            private addresses, and evidence files stay private.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <DarkFact label="Rating" value="0-100" />
            <DarkFact label="Evidence" value="Private" />
            <DarkFact label="Response" value="Available" />
          </div>
          <p className="text-xs leading-5 text-slate-300">{clientRatingDisclaimer()}</p>
          <Button asChild className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400">
            <Link href="/how-it-works">
              See how reports work
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
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
    hasEvidenceOnFile: profile.reports.some((item) => item.evidenceAttached),
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
        <p className="text-xs leading-5 text-slate-300">{clientRatingDisclaimer()}</p>

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

function PublicReportPreview({
  profile,
  report,
}: {
  profile: HomepageProfile
  report: HomepageProfile["reports"][number]
}) {
  const paymentFact = getReportPaymentFact(report)

  return (
    <Card className="rounded-md border-white/10 bg-white/[0.06] text-white shadow-sm">
      <CardContent className="space-y-5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xl font-semibold text-white">
                {profile.firstName} {profile.lastName}
              </p>
              <Badge className="rounded-md bg-emerald-500/15 text-emerald-100">
                <BadgeCheck className="mr-1 size-3" aria-hidden="true" />
                Approved
              </Badge>
            </div>
            <p className="mt-1 text-sm text-slate-300">
              {profile.city}, {profile.state}
            </p>
          </div>
          <RiskBadge riskLevel={profile.riskLevel} />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <DarkFact label="Category" value={report.reportCategory} />
          <DarkFact label={paymentFact.label} value={paymentFact.value} />
          <DarkFact label="Client rating" value={`${profile.clientBureauScore}/100`} />
        </div>

        <p className="text-sm leading-6 text-slate-300">{report.publicSummary}</p>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
          <span className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1">
            <FileCheck2 className="size-3" aria-hidden="true" />
            Evidence-on-file summary
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1">
            <MessageSquareText className="size-3" aria-hidden="true" />
            Response path available
          </span>
        </div>
        <Button asChild variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
          <Link href={`/client/${profile.publicSlug}`}>
            View public profile
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function TrustMetric({ label, value, text }: { label: string; value: string; text: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
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
