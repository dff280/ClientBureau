import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CalendarX2,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FilePlus2,
  Hammer,
  LockKeyhole,
  PackageOpen,
  Receipt,
  Scale,
  Search,
  ShieldCheck,
} from "lucide-react"

import { LegalNotice } from "@/components/client/legal-notice"
import { RiskBadge } from "@/components/client/risk-badge"
import { BusinessProtectionWorkflow } from "@/components/marketing/business-protection-workflow"
import { PricingCard } from "@/components/pricing/pricing-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  getPublicClientProfileService,
  getPublicClientProfilesService,
} from "@/lib/repositories/client-bureau-service"
import { pricingTiers } from "@/lib/stripe/pricing"
import {
  getFaqSchema,
  getLocalBusinessSchema,
  getOrganizationSchema,
  getSoftwareApplicationSchema,
  getWebSiteSchema,
  JsonLd,
} from "@/lib/seo"
import { corePositioning } from "@/lib/product-positioning"

export const metadata: Metadata = {
  title: "Client Bureau | Check Clients Before You Take the Job",
  description:
    "Check clients before you take the job. Review moderated reports, private matching, contracts, evidence workflows, and response context.",
  alternates: {
    canonical: "/",
  },
}

export const dynamic = "force-dynamic"

type HomepageProfile = NonNullable<Awaited<ReturnType<typeof getPublicClientProfileService>>>

const trustSignals = [
  "Reports moderated before publication",
  "Private phone and email matching",
  "Evidence reviewed privately",
  "Client response and correction path",
]

const painPoints = [
  {
    icon: Receipt,
    title: "Finished the job and never got paid",
    text: "Check for reported payment issues before final labor, closeout work, or another large job is accepted.",
  },
  {
    icon: ClipboardCheck,
    title: "Scope changed without approved change orders",
    text: "Review documented scope-creep context and require written approvals before extra work starts.",
  },
  {
    icon: CreditCard,
    title: "Chargeback filed after completion",
    text: "Look for payment reversal history and keep completion evidence ready before accepting risk.",
  },
  {
    icon: PackageOpen,
    title: "Materials ordered, then client canceled",
    text: "Search before buying non-returnable materials or placing your crew on the calendar.",
  },
  {
    icon: CalendarX2,
    title: "Crew scheduled, then client disappeared",
    text: "Use client history, deposits, and intake assessments to avoid wasted schedule capacity.",
  },
  {
    icon: Building2,
    title: "Client delayed access to the property",
    text: "Spot reported access delays and document access windows before mobilizing a team.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Prior disputes with other businesses",
    text: "Client Bureau helps surface moderated patterns so the next business can make a better intake decision.",
  },
]

const beforeSteps = ["Accept job", "Buy materials", "Schedule crew", "Hope client pays"]
const afterSteps = ["Search client", "Review history", "Send contract link", "Document evidence", "Track payment timing"]

const businessTypes = [
  "Contractors",
  "Remodelers",
  "Roofers",
  "Painters",
  "Landscapers",
  "Pool companies",
  "HVAC companies",
  "Pressure washing companies",
  "Flooring companies",
  "Freelancers",
  "Agencies",
  "Photographers",
  "Event vendors",
  "Designers",
  "Developers",
  "Consultants",
]

const directoryLinks = [
  { href: "/clients/florida", label: "Florida client reports" },
  { href: "/clients/orlando-fl", label: "Orlando FL" },
  { href: "/clients/tampa-fl", label: "Tampa FL" },
  { href: "/clients/miami-fl", label: "Miami FL" },
  { href: "/reports/non-payment", label: "Non-payment reports" },
  { href: "/reports/high-risk", label: "High-risk profiles" },
  { href: "/industries/contractors", label: "Contractors" },
  { href: "/industries/service-businesses", label: "Service businesses" },
]

const faqs = [
  {
    question: "What problem does Client Bureau solve?",
    answer:
      "Client Bureau helps business owners check documented client experiences, reported payment issues, disputes, and response context before committing labor, materials, appointments, or deliverables.",
  },
  {
    question: "Are reports published automatically?",
    answer:
      "No. Public profile content is moderated before publication and uses factual contractor-submitted report language.",
  },
  {
    question: "Are phone numbers and emails public?",
    answer:
      "No. Phone numbers and emails can support private matching, but raw private identifiers are not displayed on public client profile pages.",
  },
  {
    question: "Can clients respond or request corrections?",
    answer:
      "Yes. Public profiles include a right-of-response path for responses, disputes, corrections, and resolution updates that are reviewed before display.",
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
    .slice(0, 4)
  const allReports = profiles.flatMap((profile) => profile.reports)
  const stats = [
    { label: "Public client profiles", value: profiles.length.toLocaleString() },
    { label: "Published reports", value: allReports.length.toLocaleString() },
    {
      label: "Reported unpaid balances",
      value: formatCurrency(profiles.reduce((total, profile) => total + profile.balanceSummary.totalReportedUnpaid, 0)),
    },
    { label: "Reports moderated before publication", value: "100%" },
    {
      label: "Client responses available",
      value: profiles.reduce((total, profile) => total + profile.clientResponses.length, 0).toLocaleString(),
    },
    {
      label: "Evidence files reviewed privately",
      value: profiles.reduce((total, profile) => total + profile.evidence.length, 0).toLocaleString(),
    },
  ]

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
          alt="Client Bureau trust platform dashboard showing client search, reports, score context, and evidence review."
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 z-0 object-cover object-[68%_center] opacity-100"
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950/95 via-slate-950/65 to-slate-950/5" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />
        <div className="bureau-container relative z-20 grid min-h-[760px] items-end gap-10 py-12 lg:grid-cols-[1fr_380px] lg:py-16">
          <div className="max-w-4xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-md border border-amber-300/30 bg-white/5 px-3 py-2 text-sm font-medium text-amber-200">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Business-owner protection network
            </div>
            <div className="space-y-5">
              <h1 className="text-5xl font-semibold leading-tight tracking-normal sm:text-6xl lg:text-7xl">
                {corePositioning}
              </h1>
              <p className="max-w-3xl text-xl leading-8 text-slate-100">
                Check client history, set clear terms, send agreement links, document the job,
                track payment issues, and review moderated client context before you commit labor,
                materials, contracts, or scheduling.
              </p>
            </div>
            <form action="/search" className="grid max-w-3xl gap-3 rounded-md border border-white/15 bg-white p-2 shadow-2xl sm:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                <Input
                  name="q"
                  placeholder="Search by client name, business, city, phone, or email"
                  className="h-12 border-0 pl-10 text-slate-950 shadow-none focus-visible:ring-0"
                />
              </div>
              <Button className="h-12 bg-amber-500 px-6 text-slate-950 hover:bg-amber-400">
                Search a Client
              </Button>
            </form>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-amber-500 text-slate-950 hover:bg-amber-400">
                <Link href="/search">
                  <Search aria-hidden="true" />
                  Search a Client
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
                <Link href="/submit-report">
                  <FilePlus2 aria-hidden="true" />
                  Submit a Report
                </Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {trustSignals.map((signal) => (
                <div key={signal} className="flex items-center gap-3 rounded-md border border-white/15 bg-slate-950/55 p-3 text-sm text-slate-100 shadow-lg backdrop-blur">
                  <CheckCircle2 className="size-4 text-amber-300" aria-hidden="true" />
                  {signal}
                </div>
              ))}
            </div>
          </div>
          <Card className="hidden rounded-md border-white/10 bg-white/10 text-white shadow-2xl backdrop-blur lg:block">
            <CardContent className="space-y-5 p-6">
              <p className="text-sm font-semibold uppercase text-amber-200">Intake principle</p>
              <p className="text-3xl font-semibold leading-tight">
                Search. Review. Report. Protect.
              </p>
              <p className="text-sm leading-6 text-slate-200">
                Client Bureau is built for businesses that need better pre-client decisions, not
                after-the-fact arguments. Search first, send a clear agreement link, document the
                job, and keep recovery or lien-readiness work private until it is reviewed.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bureau-section bg-white">
        <div className="bureau-container space-y-8">
          <div className="max-w-3xl space-y-3">
            <p className="text-sm font-semibold uppercase text-amber-700">Sound familiar?</p>
            <h2 className="text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
              The expensive client problem usually starts before the first invoice.
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              Client Bureau gives business owners a practical intake checkpoint for common project
              risks: final payment delays, chargebacks, unclear changes, no-shows, access issues,
              and repeated dispute patterns.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {painPoints.map((item) => (
              <Card key={item.title} className="rounded-md border-slate-200 shadow-sm">
                <CardContent className="space-y-4 p-5">
                  <item.icon className="size-8 text-slate-950" aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                  <p className="text-sm leading-6 text-slate-600">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bureau-section bg-slate-100">
        <div className="bureau-container grid gap-6 lg:grid-cols-2">
          <WorkflowPanel title="Before Client Bureau" tone="light" steps={beforeSteps} />
          <WorkflowPanel title="After Client Bureau" tone="dark" steps={afterSteps} />
        </div>
      </section>

      <section className="bureau-section bg-white">
        <div className="bureau-container">
          <BusinessProtectionWorkflow />
        </div>
      </section>

      <section className="bureau-section bg-white">
        <div className="bureau-container space-y-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-3xl space-y-3">
              <p className="text-sm font-semibold uppercase text-amber-700">Recent public reports</p>
              <h2 className="text-3xl font-semibold text-slate-950">
                Public profiles show moderated, approved context only.
              </h2>
              <p className="text-sm leading-6 text-slate-600">
                Recent report cards emphasize reported balance, risk level, category, and a link to
                the approved public client profile. Private identifiers and raw evidence stay private.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/reports/recent">
                View recent reports
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {recentReports.map(({ profile, report }) => (
              <Card key={report.id} className="rounded-md border-slate-200 shadow-sm">
                <CardContent className="space-y-5 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xl font-semibold text-slate-950">
                        {profile.firstName} {profile.lastName}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {profile.city}, {profile.state}
                      </p>
                    </div>
                    <RiskBadge riskLevel={profile.riskLevel} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Fact label="Category" value={report.reportCategory} />
                    <Fact label="Reported unpaid" value={formatCurrency(report.amountUnpaid)} />
                    <Fact label="Status" value={report.resolutionStatus ?? report.paymentStatus} />
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{report.publicSummary}</p>
                  <Button asChild variant="outline">
                    <Link href={`/client/${profile.publicSlug}`}>
                      View public profile
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bureau-section bg-slate-950 text-white">
        <div className="bureau-container space-y-8">
          <div className="max-w-3xl space-y-3">
            <p className="text-sm font-semibold uppercase text-amber-300">Platform stats</p>
            <h2 className="text-3xl font-semibold tracking-normal">
              Built around moderation, privacy, and business-owner decisions.
            </h2>
            <p className="text-sm leading-6 text-slate-300">
              Client Bureau is designed to become the standard pre-client check for businesses that
              work with deposits, invoices, appointments, deliverables, or scheduled crews.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-md border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold uppercase text-slate-400">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bureau-section bg-white">
        <div className="bureau-container grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <LegalNotice />
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Moderated reports", "Reports are reviewed before public publication and may be edited for neutral, supportable public summary language."],
              ["Private matching", "Phone, email, and sensitive matching details are not shown publicly."],
              ["Evidence stays private", "Invoices, screenshots, contracts, photos, and PDFs can remain available only to moderators."],
              ["Right of response", "Clients can submit responses, disputes, corrections, and resolution updates for moderation."],
            ].map(([title, text]) => (
              <Card key={title} className="rounded-md border-slate-200 shadow-sm">
                <CardContent className="space-y-3 p-5">
                  <Scale className="size-6 text-amber-700" aria-hidden="true" />
                  <h3 className="font-semibold text-slate-950">{title}</h3>
                  <p className="text-sm leading-6 text-slate-600">{text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bureau-section bg-slate-100">
        <div className="bureau-container grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase text-amber-700">Contractor-first, business-owner ready</p>
            <h2 className="text-3xl font-semibold tracking-normal text-slate-950">
              A client reporting network for any business that accepts work before payment is complete.
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              Client Bureau starts with Florida contractors because the risk is immediate: crews,
              materials, schedules, deposits, and final invoices. The same protection layer can
              support service businesses, vendors, creative teams, and professional firms.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {businessTypes.map((type) => (
              <div key={type} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                {type}
              </div>
            ))}
          </div>
          <div className="lg:col-span-2">
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
        <div className="bureau-container grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase text-amber-700">Plans</p>
            <h2 className="text-3xl font-semibold tracking-normal text-slate-950">
              Upgrade when client checks become part of your operating process.
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              Free supports basic checks and report submission. Pro and Team add watchlists, saved
              searches, alerts, intake assessments, evidence workflow, contract signing links, and
              shared operations.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {pricingTiers.map((tier) => (
              <PricingCard key={tier.id} tier={tier} />
            ))}
          </div>
        </div>
      </section>

      <section className="bureau-section bg-slate-950 text-white">
        <div className="bureau-container grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase text-amber-300">Before you commit</p>
            <h2 className="text-4xl font-semibold tracking-normal">
              Before you schedule the crew, order materials, or sign the contract, check the client.
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-300">
              Make client review part of intake. Search public profiles, submit documented reports,
              and help build a fairer business-owner protection network.
            </p>
          </div>
          <div className="rounded-md border border-white/10 bg-white/5 p-6 shadow-sm">
            <BadgeCheck className="size-10 text-amber-300" aria-hidden="true" />
            <h3 className="mt-4 text-2xl font-semibold tracking-normal">
              Start with one client check.
            </h3>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild className="bg-amber-500 text-slate-950 hover:bg-amber-400">
                <Link href="/search">
                  Search a Client
                  <Search aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                <Link href="/signup">
                  Create Free Account
                  <LockKeyhole aria-hidden="true" />
                </Link>
              </Button>
            </div>
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

function WorkflowPanel({
  title,
  steps,
  tone,
}: {
  title: string
  steps: string[]
  tone: "light" | "dark"
}) {
  const dark = tone === "dark"

  return (
    <div className={dark ? "rounded-md bg-slate-950 p-6 text-white shadow-sm" : "rounded-md border border-slate-200 bg-white p-6 shadow-sm"}>
      <div className="flex items-center gap-3">
        {dark ? (
          <ShieldCheck className="size-6 text-amber-300" aria-hidden="true" />
        ) : (
          <Hammer className="size-6 text-slate-500" aria-hidden="true" />
        )}
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>
      <div className="mt-6 grid gap-3">
        {steps.map((step, index) => (
          <div
            key={step}
            className={dark ? "rounded-md border border-white/10 bg-white/5 p-4" : "rounded-md border border-slate-200 bg-slate-50 p-4"}
          >
            <p className={dark ? "text-xs font-semibold uppercase text-amber-200" : "text-xs font-semibold uppercase text-slate-500"}>
              Step {index + 1}
            </p>
            <p className="mt-1 font-semibold">{step}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
    </div>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}
