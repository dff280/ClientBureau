import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  FileCheck2,
  FilePlus2,
  Gauge,
  Landmark,
  ListChecks,
  LockKeyhole,
  MessageSquareText,
  RadioTower,
  ReceiptText,
  Scale,
  Search,
  ShieldCheck,
  Signature,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { LegalNotice } from "@/components/client/legal-notice"
import { RiskBadge } from "@/components/client/risk-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { pageAssets } from "@/lib/page-assets"
import {
  getPublicClientProfileService,
  getPublicClientProfilesService,
} from "@/lib/repositories/client-bureau-service"
import { pricingTiers } from "@/lib/stripe/pricing"
import { primaryHook, primarySearchCta, reportExperienceCta } from "@/lib/product-positioning"
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

const heroHeadline = "Check a Client Before You Take the Job."
const platformHeroAsset = pageAssets.platformHero

const heroTrustSignals = [
  {
    icon: Search,
    title: "Search-first intake",
    text: "Look up names, businesses, locations, and private-match identifiers before you schedule the job.",
  },
  {
    icon: ShieldCheck,
    title: "Moderated public records",
    text: "Approved summaries, response context, and evidence-on-file labels are separated from private files.",
  },
  {
    icon: Signature,
    title: "Contracts after screening",
    text: "Use agreement packets, signing links, deposits, milestones, and change-order controls once you proceed.",
  },
  {
    icon: ReceiptText,
    title: "Payment protection path",
    text: "Track payment issues, resolution attempts, recovery cases, and lien-service readiness privately.",
  },
]

const heroSearchExamples = [
  { label: "John Smith Orlando", href: "/search?q=John%20Smith%20Orlando" },
  { label: "ABC Property Group", href: "/search?q=ABC%20Property%20Group" },
  { label: "homeowner Tampa", href: "/search?q=homeowner%20Tampa" },
  { label: "client phone or email", href: "/search" },
]

const platformPillars = [
  {
    icon: Search,
    label: "Check",
    title: "Client risk intelligence",
    text: "Search client ratings, report history, private-match signals, and response context before taking the job.",
  },
  {
    icon: Signature,
    label: "Set terms",
    title: "Contracts and signatures",
    text: "Create agreement packets, share signing links, document deposits, milestones, exclusions, and changes.",
  },
  {
    icon: FileCheck2,
    label: "Document",
    title: "Evidence vault",
    text: "Keep invoices, screenshots, contracts, photos, approvals, and completion records organized privately.",
  },
  {
    icon: CircleDollarSign,
    label: "Recover",
    title: "Payment recovery workflow",
    text: "Open a private resolution case, document communications, track payment plans, and keep follow-up organized.",
  },
  {
    icon: Landmark,
    label: "File",
    title: "Florida lien service",
    text: "Prepare notice and lien-service cases with deadlines, document review, authorization, and filing status checkpoints.",
  },
]

const lossImpacts = [
  {
    icon: BriefcaseBusiness,
    label: "Labor",
    title: "Crew time is already spent.",
    text: "By the time an invoice is late, your team has already burned hours, fuel, scheduling capacity, and opportunity cost.",
  },
  {
    icon: ReceiptText,
    label: "Cash flow",
    title: "Materials do not wait for payment.",
    text: "Deposits, supplies, payroll, subcontractors, and replacement jobs can all get squeezed when a client relationship goes sideways.",
  },
  {
    icon: CalendarClock,
    label: "Schedule",
    title: "One bad job can block the next good one.",
    text: "A disputed project can eat the week you planned to use for a reliable client, a family obligation, or the next profitable job.",
  },
  {
    icon: Scale,
    label: "Documentation",
    title: "The record needs to be built before the dispute.",
    text: "Contracts, change orders, photos, invoices, messages, and completion notes matter most when they are organized before collection gets hard.",
  },
]

const protectionSystem = [
  {
    phase: "01",
    icon: Search,
    title: "Check the client",
    text: "Search public profiles, private-match signals, report counts, positive history, payment context, and response/dispute status before you commit.",
    href: "/search",
    cta: primarySearchCta,
  },
  {
    phase: "02",
    icon: Signature,
    title: "Set the terms",
    text: "Create agreement packets with scope, exclusions, deposits, milestones, change-order policy, cancellation language, and signing links.",
    href: "/dashboard/contracts",
    cta: "Create contract",
  },
  {
    phase: "03",
    icon: FileCheck2,
    title: "Document the job",
    text: "Store invoices, screenshots, contracts, photos, approvals, completion records, and evidence summaries privately in one project record.",
    href: "/dashboard/evidence",
    cta: "Open vault",
  },
  {
    phase: "04",
    icon: RadioTower,
    title: "Watch and monitor",
    text: "Save searches, watch clients, track alerts, and keep profile activity tied to your business intake workflow.",
    href: "/dashboard/watchlist",
    cta: "Watch clients",
  },
  {
    phase: "05",
    icon: CircleDollarSign,
    title: "Open recovery",
    text: "When payment stalls, create a private recovery case with invoices, communication logs, payment-plan options, and staff review workflow.",
    href: "/dashboard/recovery",
    cta: "Recovery center",
  },
  {
    phase: "06",
    icon: Landmark,
    title: "Prepare lien service",
    text: "For Florida cases, track notice and filing readiness, document review, authorization, deadline risk, and recording proof privately.",
    href: "/dashboard/lien-readiness",
    cta: "Lien service",
  },
]

const searchPreviewDetails = [
  {
    label: "Match quality",
    value: "Name + city + private identifier",
    text: "Private identifiers help matching, but raw contact information stays hidden.",
  },
  {
    label: "Payment context",
    value: "Reported issues + positive history",
    text: "Search results can show both concerning and positive contractor-submitted experiences.",
  },
  {
    label: "Evidence status",
    value: "Evidence reviewed privately",
    text: "Public pages summarize evidence status without exposing files, messages, or private documents.",
  },
  {
    label: "Next action",
    value: "Search, watch, contract, report",
    text: "Every result should guide the business owner toward a practical next step.",
  },
]

const managedServiceCards = [
  {
    icon: CircleDollarSign,
    title: "Payment Recovery Service",
    text: "Open a managed resolution case, upload invoices and project records, and let Client Bureau staff help document contact attempts, response status, payment-plan options, and case outcome.",
    href: "/payment-recovery-service",
    cta: "Explore recovery",
  },
  {
    icon: FileCheck2,
    title: "Florida Lien Notice Service",
    text: "Prepare a private notice packet with document review, contractor authorization, deadline tracking, delivery status, and proof records.",
    href: "/florida-lien-notice-service",
    cta: "Explore notices",
  },
  {
    icon: Landmark,
    title: "Florida Lien Filing Service",
    text: "For eligible cases, route authorized filing records through attorney/vendor review, recording workflow, receipt tracking, and release/satisfaction records.",
    href: "/florida-lien-filing-service",
    cta: "Explore filing",
  },
]

const trustControls = [
  ["Moderated before public display", "Reports become public only after review, summary editing, and publication checks."],
  ["Private evidence by default", "Invoices, screenshots, contracts, photos, messages, and file paths stay out of public profiles."],
  ["Positive reports belong here too", "Reliable clients, resolved projects, and would-work-again experiences help keep records balanced."],
  ["Client response and correction path", "Clients can submit a response, dispute, correction request, or resolution update for review."],
  ["No raw private identifiers", "Phone numbers, emails, street addresses, and private matching signals are not exposed publicly."],
  ["Audit-ready decisions", "Admin actions, decision reasons, profile visibility, and moderation notes are designed for traceability."],
]

const audienceTiles = [
  { label: "Contractors", text: "General contractors, roofers, remodelers, painters, landscapers, HVAC, pool, flooring, and specialty trades." },
  { label: "Service businesses", text: "Any business that risks time, material, project capacity, or final invoice payment before the work is complete." },
  { label: "Professional firms", text: "Agencies, consultants, vendors, creative teams, and appointment-based businesses that need client intake controls." },
]

const discoveryLinks = [
  { href: "/platform", label: "Platform overview" },
  { href: "/clients", label: "Client directory" },
  { href: "/clients/florida", label: "Florida profiles" },
  { href: "/clients/orlando-fl", label: "Orlando reports" },
  { href: "/reports/recent", label: "Recent reports" },
  { href: "/reports/non-payment", label: "Payment issue reports" },
  { href: "/industries/contractors", label: "Contractors" },
  { href: "/industries/service-businesses", label: "Service businesses" },
  { href: "/client-screening-for-contractors", label: "Client screening guide" },
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
          src={platformHeroAsset.src}
          alt={platformHeroAsset.alt}
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 z-0 object-cover object-[68%_center] opacity-80"
        />
        <div className="absolute inset-0 z-10 bg-[linear-gradient(90deg,#020617_0%,rgba(2,6,23,0.94)_34%,rgba(2,6,23,0.74)_60%,rgba(2,6,23,0.28)_100%)]" />
        <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(2,6,23,0.58)_0%,rgba(2,6,23,0.08)_42%,#020617_100%)]" />
        <div className="absolute inset-x-0 bottom-0 z-10 h-24 border-t border-white/10 bg-slate-950/65 backdrop-blur" />

        <div className="bureau-container relative z-20 py-12 sm:py-16 lg:py-20">
          <div className="grid gap-10 lg:min-h-[600px] lg:grid-cols-[minmax(0,1fr)_470px] lg:items-start">
            <div className="max-w-4xl space-y-7">
              <div className="inline-flex items-center gap-2 rounded-md border border-amber-300/35 bg-slate-950/70 px-3 py-2 text-sm font-semibold text-amber-200 shadow-lg shadow-slate-950/30 backdrop-blur">
                <ShieldCheck className="size-4" aria-hidden="true" />
                Contractor-powered client intelligence
              </div>

              <div className="space-y-5">
                <h1 className="max-w-4xl text-4xl font-semibold leading-[1.04] tracking-normal text-white sm:text-5xl lg:text-6xl">
                  {heroHeadline}
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-slate-100 sm:text-xl">
                  Search reported payment issues, disputes, chargebacks, and documented client experiences before
                  you commit labor, materials, scheduling, deposits, or profit.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-md bg-amber-400 px-3 py-1.5 text-sm font-bold text-slate-950">
                    {primaryHook}
                  </span>
                  <span className="text-sm font-semibold text-slate-300">
                    Private matching. Moderated summaries. Client response rights.
                  </span>
                </div>
              </div>

              <form action="/search" className="grid max-w-4xl gap-3 rounded-md border border-amber-200/30 bg-white p-2 shadow-[0_26px_80px_rgba(0,0,0,0.38)] sm:grid-cols-[1fr_auto]">
                <label htmlFor="homepage-client-search" className="sr-only">
                  Search for a client
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <Input
                    id="homepage-client-search"
                    name="q"
                    placeholder="Search by client name, business, phone, email, city, or state"
                    className="h-14 border-0 pl-12 text-base text-slate-950 shadow-none focus-visible:ring-0"
                  />
                </div>
                <Button className="h-14 bg-amber-500 px-7 text-base font-semibold text-slate-950 hover:bg-amber-400">
                  {primarySearchCta}
                </Button>
              </form>

              <div className="flex max-w-4xl flex-wrap gap-2 text-xs font-semibold text-slate-300">
                <span className="rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-amber-200">
                  Try a search:
                </span>
                {heroSearchExamples.map((example) => (
                  <Link
                    key={example.label}
                    href={example.href}
                    className="rounded-md border border-white/10 bg-white/[0.07] px-3 py-1.5 text-slate-200 backdrop-blur transition hover:border-amber-300/50 hover:bg-amber-300/10 hover:text-amber-100"
                  >
                    {example.label}
                  </Link>
                ))}
              </div>

              <div className="flex max-w-4xl items-start gap-2 rounded-md border border-white/10 bg-slate-950/55 px-3 py-2 text-sm leading-6 text-slate-300 backdrop-blur">
                <LockKeyhole className="mt-0.5 size-4 shrink-0 text-amber-200" aria-hidden="true" />
                <p>
                  Searches are private. Raw phone numbers, emails, street addresses, and evidence files are never shown on public profiles.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild className="h-11 bg-white text-slate-950 hover:bg-slate-100">
                  <Link href="/signup">
                    <LockKeyhole aria-hidden="true" />
                    Create Free Account
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-11 border-white/25 bg-white/10 text-white hover:bg-white/15">
                  <Link href="/submit-report">
                    <FilePlus2 aria-hidden="true" />
                    {reportExperienceCta}
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="h-11 text-slate-100 hover:bg-white/10 hover:text-white">
                  <Link href="/platform">
                    Explore the platform
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>

            <HeroCommandPanel item={heroPreview} />
          </div>

        </div>
      </section>

      <section className="border-y border-white/10 bg-slate-950 text-white">
        <div className="bureau-container grid gap-3 py-4 sm:grid-cols-2 lg:grid-cols-4">
          {heroTrustSignals.map((signal) => {
            const Icon = signal.icon

            return (
              <div key={signal.title} className="border-l border-amber-300/60 bg-white/[0.03] px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-md bg-amber-300 text-slate-950">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <p className="font-semibold text-white">{signal.title}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{signal.text}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="bureau-container grid gap-6 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">A new category for business owners</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
              The first bureau built from the contractor side of the job.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Review platforms have served customers for years. Client Bureau gives contractors, subcontractors, and service businesses a serious way to check clients, document work, and protect payment before a job becomes expensive.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Before", "Search client context before you take the job."],
              ["During", "Keep contracts, changes, and evidence organized."],
              ["After", "Use recovery and lien-service workflows when payment needs structure."],
            ].map(([label, text]) => (
              <div key={label} className="rounded-md border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase text-amber-700">{label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bureau-section bg-white">
        <div className="bureau-container grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-6">
            <SectionIntro
              eyebrow="The reason this needs to exist"
              title="One unpaid job can hurt more than the invoice."
              text="Contractors and service business owners put real labor, materials, scheduling, and reputation into every job. When a client does not pay, delays, disputes, or chargebacks after the work is delivered, the impact reaches payroll, family cash flow, supplier relationships, and the next job on the calendar."
            />
            <div className="rounded-md border border-amber-200 bg-amber-50 p-5">
              <p className="text-2xl font-semibold leading-tight text-slate-950">
                Client Bureau turns &quot;I hope this client pays&quot; into a repeatable intake, contract, evidence,
                recovery, and response workflow.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {lossImpacts.map((impact) => (
              <LossImpactCard key={impact.title} impact={impact} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-100">
        <div className="bureau-container grid gap-4 py-7 lg:grid-cols-5">
          {platformPillars.map((pillar) => (
            <PlatformPillarCard key={pillar.title} pillar={pillar} />
          ))}
        </div>
      </section>

      <section className="bureau-section bg-white">
        <div className="bureau-container space-y-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <SectionIntro
              eyebrow="The Client Protection System"
              title="Search before the job. Document during the job. Protect payment after the job."
              text="This is the product doctrine. Client Bureau is not just a place to publish client reports. It is becoming the operating system for business owners who need better client decisions before, during, and after work is performed."
            />
            <Button asChild variant="outline">
              <Link href="/how-it-works">
                See the workflow
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
            {protectionSystem.map((step, index) => (
              <ProtectionTimelineItem key={step.title} step={step} isLast={index === protectionSystem.length - 1} />
            ))}
          </div>
        </div>
      </section>

      <section className="bureau-section bg-slate-950 text-white">
        <div className="bureau-container grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="space-y-6">
            <SectionIntro
              eyebrow="What search should show"
              title="A client search should feel like a business decision file, not a gossip result."
              text="Search results should help a contractor understand the record quickly: who matched, what was reported, what evidence is on file, whether the client responded, and what the safest next action is."
              dark
            />
            <div className="grid gap-3">
              {searchPreviewDetails.map((detail) => (
                <div key={detail.label} className="rounded-md border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-xs font-semibold uppercase text-slate-400">{detail.label}</p>
                  <p className="mt-1 font-semibold text-amber-200">{detail.value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{detail.text}</p>
                </div>
              ))}
            </div>
          </div>
          <SearchIntelligencePreview item={heroPreview} />
        </div>
      </section>

      <section className="bureau-section bg-white">
        <div className="bureau-container space-y-8">
          <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-end">
            <SectionIntro
              eyebrow="When payment breaks down"
              title="The platform should not stop at a report. It should help the business owner pursue a resolution."
              text="Client Bureau recovery and lien-service workflows are private, documented, review-driven service paths. They help organize the records, status, authorization, fees, staff/vendor review, and outcome tracking that business owners need when payment becomes a serious problem."
            />
            <div className="rounded-md border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
              <p className="text-sm font-semibold uppercase text-amber-300">Important guardrail</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Recovery payments remain contractor-direct. Lien workflows are Florida-first and require document review, contractor authorization, and attorney/vendor review before real filing is enabled.
              </p>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {managedServiceCards.map((service) => (
              <ManagedServiceCard key={service.title} service={service} />
            ))}
          </div>
        </div>
      </section>

      <section className="bureau-section bg-slate-100">
        <div className="bureau-container grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <PublicRecordsShowcase reports={recentReports} />
          <div className="space-y-6">
            <SectionIntro
              eyebrow="Public records that stay credible"
              title="Approved profiles should make the next contractor smarter, not make the internet louder."
              text="Public client profiles show moderated summaries, report count, rating context, evidence-on-file labels, positive reports, dispute state, client responses, and right-of-response pathways. Pending content, rejected content, raw evidence, private identifiers, and internal notes stay private."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <TrustMetric label="Reported unpaid balances" value={formatCurrency(totalReportedUnpaid)} text="Aggregated only from approved public profile context." />
              <TrustMetric label="Client responses" value={openResponses.toLocaleString()} text="Responses, disputes, corrections, and resolution updates can be reviewed before display." />
              <TrustMetric label="Evidence privacy" value="Private" text="Public pages use summaries such as invoices reviewed or documents reviewed." />
              <TrustMetric label="Positive reports" value={positiveReports.toLocaleString()} text="Good client experiences help keep records balanced." />
            </div>
          </div>
        </div>
      </section>

      <section className="bureau-section bg-white">
        <div className="bureau-container grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div className="space-y-6">
            <SectionIntro
              eyebrow="Fairness and trust controls"
              title="A serious trust platform must be careful, moderated, and response-aware."
              text="The product should never feel like a complaint wall. Client Bureau is built around documented experiences, moderated public summaries, private evidence, positive reports, dispute context, correction pathways, and audit-ready admin review."
            />
            <LegalNotice />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {trustControls.map(([title, text]) => (
              <TrustControlCard key={title} title={title} text={text} />
            ))}
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
              eyebrow="Built for the people taking the risk"
              title="Contractors, service businesses, and professional teams finally get a client-check layer."
              text="Customers have had review platforms for years. Client Bureau gives business owners a professional way to search clients, document projects, protect payment, publish moderated records, and create a fair response path."
            />
            <Button asChild variant="outline">
              <Link href="/resources">
                Browse resources
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {audienceTiles.map((audience) => (
              <AudienceTile key={audience.label} audience={audience} />
            ))}
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase text-amber-700">High-intent pages and directories</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {discoveryLinks.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:text-slate-950">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bureau-section bg-white">
        <div className="bureau-container grid gap-8 lg:grid-cols-[0.76fr_1.24fr] lg:items-start">
          <SectionIntro
            eyebrow="Plans"
            title="One avoided payment problem can justify the system."
            text="Start free with client checks and report submission. Upgrade when client screening, watchlists, contracts, evidence records, recovery workflows, and team operations become part of your daily business intake."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {pricingTiers.map((tier) => (
              <CompactPricingPlan key={tier.id} tier={tier} />
            ))}
          </div>
        </div>
      </section>

      <section className="bureau-section bg-slate-950 text-white">
        <div className="bureau-container grid gap-8 lg:grid-cols-[1fr_0.82fr] lg:items-center">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase text-amber-300">Before the next estimate</p>
            <h2 className="text-4xl font-semibold tracking-normal sm:text-5xl">
              Check the client before your time, materials, and reputation are already on the line.
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-300">
              Make Client Bureau part of every serious intake: search the client, set clear terms, document the work,
              protect payment, and keep the public record fair when a client responds or resolves the issue.
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
            <Button asChild variant="ghost" className="h-12 text-slate-200 hover:bg-white/10 hover:text-white">
              <Link href="/signup">
                Create Free Account
                <ArrowRight aria-hidden="true" />
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

function PlatformPillarCard({
  pillar,
}: {
  pillar: {
    icon: LucideIcon
    label: string
    title: string
    text: string
  }
}) {
  const Icon = pillar.icon

  return (
    <div className="group rounded-md border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-md bg-slate-950 text-white">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="rounded-md bg-amber-100 px-2 py-1 text-[0.68rem] font-semibold uppercase text-amber-800">
          {pillar.label}
        </span>
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-950">{pillar.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{pillar.text}</p>
    </div>
  )
}

function LossImpactCard({
  impact,
}: {
  impact: {
    icon: LucideIcon
    label: string
    title: string
    text: string
  }
}) {
  const Icon = impact.icon

  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <span className="rounded-md bg-slate-950 px-2.5 py-1 text-xs font-semibold uppercase text-white">
          {impact.label}
        </span>
        <Icon className="size-6 text-amber-700" aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-slate-950">{impact.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{impact.text}</p>
    </div>
  )
}

function ProtectionTimelineItem({
  step,
  isLast,
}: {
  step: {
    phase: string
    icon: LucideIcon
    title: string
    text: string
    href: string
    cta: string
  }
  isLast: boolean
}) {
  const Icon = step.icon

  return (
    <div className="grid gap-4 border-b border-slate-200 p-5 last:border-b-0 lg:grid-cols-[92px_56px_1fr_auto] lg:items-center">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-semibold text-slate-950">{step.phase}</span>
        {!isLast ? <span className="hidden h-px flex-1 bg-slate-200 lg:block" aria-hidden="true" /> : null}
      </div>
      <span className="flex size-12 items-center justify-center rounded-md bg-slate-950 text-white">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div>
        <h3 className="text-xl font-semibold text-slate-950">{step.title}</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{step.text}</p>
      </div>
      <Button asChild variant="outline" className="lg:justify-self-end">
        <Link href={step.href}>
          {step.cta}
          <ArrowRight aria-hidden="true" />
        </Link>
      </Button>
    </div>
  )
}

function SearchIntelligencePreview({
  item,
}: {
  item?: {
    profile: HomepageProfile
    report: HomepageProfile["reports"][number]
  }
}) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-slate-950/40">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase text-amber-300">Search result preview</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            What a business owner should understand in seconds
          </h3>
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
        {["Save search", "Watch client", "Create contract"].map((action) => (
          <div key={action} className="rounded-md border border-white/10 bg-slate-950/40 p-3 text-sm font-semibold text-slate-200">
            {action}
          </div>
        ))}
      </div>
    </div>
  )
}

function ManagedServiceCard({
  service,
}: {
  service: {
    icon: LucideIcon
    title: string
    text: string
    href: string
    cta: string
  }
}) {
  const Icon = service.icon

  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <span className="flex size-11 items-center justify-center rounded-md bg-slate-950 text-white">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <Badge variant="outline" className="rounded-md">Private workflow</Badge>
      </div>
      <h3 className="mt-5 text-xl font-semibold text-slate-950">{service.title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{service.text}</p>
      <Button asChild variant="outline" className="mt-5">
        <Link href={service.href}>
          {service.cta}
          <ArrowRight aria-hidden="true" />
        </Link>
      </Button>
    </div>
  )
}

function PublicRecordsShowcase({
  reports,
}: {
  reports: Array<{
    profile: HomepageProfile
    report: HomepageProfile["reports"][number]
  }>
}) {
  const [featured, ...supporting] = reports

  if (!featured) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <p className="font-semibold text-slate-950">Public records appear after approval.</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          The homepage only displays approved public profile context.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <FeaturedPublicRecord profile={featured.profile} report={featured.report} />
      <div className="grid gap-4 md:grid-cols-2">
        {supporting.slice(0, 2).map(({ profile, report }) => (
          <CompactPublicRecord key={report.id} profile={profile} report={report} />
        ))}
      </div>
    </div>
  )
}

function FeaturedPublicRecord({
  profile,
  report,
}: {
  profile: HomepageProfile
  report: HomepageProfile["reports"][number]
}) {
  const paymentFact = getReportPaymentFact(report)

  return (
    <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-amber-700">Featured public profile</p>
          <h3 className="mt-2 text-3xl font-semibold text-slate-950">
            {profile.firstName} {profile.lastName}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {profile.city}, {profile.state}
          </p>
        </div>
        <RiskBadge riskLevel={profile.riskLevel} />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <LightFact label="Client Bureau Rating" value={`${profile.clientBureauScore}/100`} />
        <LightFact label={paymentFact.label} value={paymentFact.value} />
        <LightFact label="Reports" value={profile.reports.length.toLocaleString()} />
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-600">{cleanPublicReportText(report.publicSummary)}</p>
      <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
        <span className="rounded-md border border-slate-200 px-2.5 py-1">Evidence-on-file summary</span>
        <span className="rounded-md border border-slate-200 px-2.5 py-1">{responseStatusLabel(profile)}</span>
        <span className="rounded-md border border-slate-200 px-2.5 py-1">Right of response available</span>
      </div>
      <Button asChild className="mt-5 bg-slate-950 text-white hover:bg-slate-800">
        <Link href={`/client/${profile.publicSlug}`}>
          View public profile
          <ArrowRight aria-hidden="true" />
        </Link>
      </Button>
    </div>
  )
}

function CompactPublicRecord({
  profile,
  report,
}: {
  profile: HomepageProfile
  report: HomepageProfile["reports"][number]
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-950">
            {profile.firstName} {profile.lastName}
          </p>
          <p className="text-sm text-slate-600">{profile.city}, {profile.state}</p>
        </div>
        <Badge variant="outline" className="rounded-md">{profile.clientBureauScore}/100</Badge>
      </div>
      <p className="mt-3 text-xs font-semibold uppercase text-amber-700">{report.reportCategory}</p>
      <p className="mt-2 max-h-[4.5rem] overflow-hidden text-sm leading-6 text-slate-600">{cleanPublicReportText(report.publicSummary)}</p>
    </div>
  )
}

function TrustControlCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <Scale className="size-5 text-amber-700" aria-hidden="true" />
      <p className="mt-3 font-semibold text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  )
}

function AudienceTile({
  audience,
}: {
  audience: {
    label: string
    text: string
  }
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <Building2 className="size-6 text-amber-700" aria-hidden="true" />
      <h3 className="mt-4 text-lg font-semibold text-slate-950">{audience.label}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{audience.text}</p>
    </div>
  )
}

function CompactPricingPlan({ tier }: { tier: (typeof pricingTiers)[number] }) {
  const href = tier.id === "enterprise" ? "/enterprise" : `/signup?plan=${tier.id}`

  return (
    <div className={tier.featured ? "rounded-md border-2 border-amber-400 bg-slate-950 p-5 text-white shadow-xl" : "rounded-md border border-slate-200 bg-white p-5 shadow-sm"}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={tier.featured ? "font-semibold text-white" : "font-semibold text-slate-950"}>{tier.name}</p>
          <p className={tier.featured ? "mt-1 text-sm text-slate-300" : "mt-1 text-sm text-slate-600"}>{tier.description}</p>
        </div>
        {tier.featured ? <Badge className="rounded-md bg-amber-400 text-slate-950">Best fit</Badge> : null}
      </div>
      <div className="mt-5 flex flex-wrap items-end gap-x-2 gap-y-1">
        <span className={tier.featured ? "text-4xl font-semibold text-white" : "text-4xl font-semibold text-slate-950"}>{tier.price}</span>
        <span className={tier.featured ? "pb-1 text-sm text-slate-300" : "pb-1 text-sm text-slate-500"}>{tier.cadence}</span>
      </div>
      <div className="mt-5 grid gap-2">
        {tier.features.slice(0, 4).map((feature) => (
          <div key={feature} className={tier.featured ? "flex gap-2 text-sm text-slate-200" : "flex gap-2 text-sm text-slate-600"}>
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden="true" />
            <span>{feature}</span>
          </div>
        ))}
      </div>
      <Button asChild className={tier.featured ? "mt-5 w-full bg-amber-500 text-slate-950 hover:bg-amber-400" : "mt-5 w-full"} variant={tier.featured ? "default" : "outline"}>
        <Link href={href}>{tier.id === "enterprise" ? "View enterprise" : "Start plan"}</Link>
      </Button>
    </div>
  )
}

function HeroCommandPanel({
  item,
}: {
  item?: {
    profile: HomepageProfile
    report: HomepageProfile["reports"][number]
  }
}) {
  return (
    <div className="hidden space-y-3 lg:block lg:justify-self-end">
      <div className="rounded-md border border-white/[0.12] bg-slate-950/80 p-4 shadow-2xl shadow-slate-950/45 backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md bg-emerald-400/12 px-2.5 py-1 text-xs font-semibold uppercase text-emerald-200">
              <RadioTower className="size-3.5" aria-hidden="true" />
              Live intake console
            </div>
            <p className="mt-3 text-xl font-semibold text-white">Client decision record</p>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              Search context, payment indicators, evidence status, and next actions in one place.
            </p>
          </div>
          <div className="hidden rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-right sm:block">
            <p className="text-xs font-semibold uppercase text-amber-200">Confidence</p>
            <p className="text-2xl font-semibold text-white">Verified</p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <MiniConsoleFact icon={Gauge} label="Rating" value="Contextual" />
          <MiniConsoleFact icon={ListChecks} label="Reports" value="Moderated" />
          <MiniConsoleFact icon={CalendarClock} label="Timing" value="Before work" />
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
          {["Search", "Save", "Report", "Contract", "Resolve"].map((step) => (
            <span key={step} className="rounded-md border border-white/10 px-2.5 py-1">
              {step}
            </span>
          ))}
        </div>
      </div>

      <HeroProfilePreview item={item} />
    </div>
  )
}

function MiniConsoleFact({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.06] p-3">
      <Icon className="size-4 text-amber-200" aria-hidden="true" />
      <p className="mt-2 text-[0.68rem] font-semibold uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
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

function LightFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
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
