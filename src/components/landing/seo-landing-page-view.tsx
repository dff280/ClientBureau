import Link from "next/link"
import { ArrowRight, FilePlus2, LockKeyhole, Search, ShieldCheck } from "lucide-react"

import { RiskBadge } from "@/components/client/risk-badge"
import { PremiumCtaBand, PremiumHero, PremiumProofStrip } from "@/components/marketing/premium-page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getClientDirectory } from "@/lib/client-directory"
import { JsonLd, getFaqSchema } from "@/lib/seo"
import type { SeoLandingPage } from "@/lib/seo-landing-pages"
import { isPositiveReportCategory, type PublicClientProfile } from "@/lib/types"

export function SeoLandingPageView({
  page,
  profiles,
}: {
  page: SeoLandingPage
  profiles: PublicClientProfile[]
}) {
  const primaryHref = getLandingPrimaryHref(page)
  const reports = profiles
    .flatMap((profile) => profile.reports.map((report) => ({ profile, report })))
    .sort((a, b) =>
      new Date(b.report.approvedAt ?? b.report.createdAt).getTime() -
      new Date(a.report.approvedAt ?? a.report.createdAt).getTime(),
    )
  const totalUnpaid = profiles.reduce((total, profile) => total + profile.balanceSummary.totalReportedUnpaid, 0)
  const openDisputes = profiles.reduce((total, profile) => total + profile.balanceSummary.openDisputeCount, 0)
  const landingSections = getLandingSections(page)
  const faqs = getLandingFaqs(page)
  const cityDirectories = page.kind === "clients"
    ? getClientDirectory(profiles).flatMap((state) => state.cities.map((city) => ({ ...city, state })))
    : []

  return (
    <main className="bg-slate-100">
      <JsonLd data={getFaqSchema(faqs)} />
      <PremiumHero
        eyebrow="Moderated client-risk intelligence"
        title={page.h1}
        description={page.intro}
        primary={{ href: primaryHref, label: page.primaryCta, icon: Search }}
        secondary={{ href: "/submit-report", label: page.secondaryCta, icon: FilePlus2 }}
        aside={
          <div className="grid gap-4 text-white">
            <Metric label="Matched public profiles" value={profiles.length.toLocaleString()} />
            <Metric label="Published reports" value={reports.length.toLocaleString()} />
            <Metric label="Reported unpaid balances" value={formatCurrency(totalUnpaid)} />
            <Metric label="Open dispute context" value={openDisputes.toLocaleString()} />
          </div>
        }
      />

      <PremiumProofStrip
        items={[
          { label: "Public content", value: "Approved", text: "Only moderated profile and report context appears on these pages." },
          { label: "Client-check intent", value: "High signal", text: "Built for contractors checking specific client, city, and report context." },
          { label: "Fairness", value: "Response-aware", text: "Client responses and disputes are included only after review." },
          { label: "Privacy", value: "Protected", text: "Raw contact details, evidence files, and internal notes stay private." },
        ]}
        dark
      />

      <div className="bureau-container space-y-8 py-10">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <p className="text-sm font-semibold uppercase text-amber-700">Who this helps</p>
              <h2 className="text-2xl font-semibold text-slate-950">Built for pre-client decisions.</h2>
              <p className="text-sm leading-6 text-slate-600">{page.audience}</p>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Public pages show approved summaries, reported experience context, rating factors,
                client response information, and evidence-on-file labels. Private phone numbers,
                emails, street addresses, raw files, and pending content are not displayed.
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <p className="text-sm font-semibold uppercase text-amber-700">Check-first workflow</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {["Check public profile context", "Review rating factors and balances", "Check response or dispute context", "Document your own experience"].map((step, index) => (
                  <div key={step} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">Step {index + 1}</p>
                    <p className="mt-1 font-semibold text-slate-950">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {landingSections.map((section) => (
            <Card key={section.title} className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-4 p-5">
                <p className="text-xs font-semibold uppercase text-amber-700">{section.eyebrow}</p>
                <h2 className="text-xl font-semibold text-slate-950">{section.title}</h2>
                <p className="text-sm leading-6 text-slate-600">{section.body}</p>
                <ul className="grid gap-2">
                  {section.points.map((point) => (
                    <li key={point} className="flex gap-2 text-sm leading-6 text-slate-600">
                      <ShieldCheck className="mt-1 size-4 shrink-0 text-emerald-700" aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {cityDirectories.length > 0 ? (
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-5 p-6">
              <div className="grid gap-4 lg:grid-cols-[1fr_280px] lg:items-end">
                <div>
                  <p className="text-sm font-semibold uppercase text-amber-700">City directories</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    Browse approved profiles by city
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    These indexable city pages give search engines and contractors direct links to
                    approved public profiles in each market.
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link href="/clients">Open client directory</Link>
                </Button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {cityDirectories.map((city) => (
                  <Link
                    key={`${city.state.slug}-${city.slug}`}
                    href={`/clients/${city.state.slug}/${city.slug}`}
                    className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-amber-300 hover:bg-white hover:text-slate-950"
                  >
                    {city.name}, {city.state.code}
                    <span className="ml-2 text-xs text-slate-500">{city.profileCount} profiles</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="space-y-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-amber-700">Public profiles</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">Approved client profile matches</h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/signup">
                Create account
                <LockKeyhole aria-hidden="true" />
              </Link>
            </Button>
          </div>
          {profiles.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {profiles.map((profile) => (
                <Card key={profile.id} className="rounded-md border-slate-200 bg-white shadow-sm">
                  <CardContent className="space-y-5 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-950">
                          {profile.firstName} {profile.lastName}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {profile.city}, {profile.state}
                        </p>
                      </div>
                      <RiskBadge riskLevel={profile.riskLevel} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <ProfileFact label="Rating" value={`${profile.clientBureauScore}/100`} />
                      <ProfileFact label="Reports" value={String(profile.reports.length)} />
                      <ProfileFact label="Payment issue context" value={formatPaymentContext(profile.balanceSummary.totalReportedUnpaid)} />
                    </div>
                    <Button asChild variant="outline">
                      <Link href={`/client/${profile.publicSlug}`}>
                        View profile
                        <ArrowRight aria-hidden="true" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-semibold text-slate-950">No approved public profiles match this page yet.</h3>
                <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Client Bureau publishes profiles only after admin approval. Check privately or submit a documented report for moderation.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                    <Link href="/search">Check a Client</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/submit-report">Report a Client Experience</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase text-amber-700">Report context</p>
          {reports.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {reports.slice(0, 6).map(({ profile, report }) => (
                <Card key={report.id} className="rounded-md border-slate-200 bg-white shadow-sm">
                  <CardContent className="space-y-3 p-5">
                    <p className="text-xs font-semibold uppercase text-slate-500">{report.reportCategory}</p>
                    <h3 className="font-semibold text-slate-950">
                      {profile.firstName} {profile.lastName} / {profile.city}, {profile.state}
                    </h3>
                    <p className="text-sm leading-6 text-slate-600">{report.publicSummary}</p>
                    <p className="text-sm font-semibold text-slate-950">
                      {formatReportPaymentLine(report)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardContent className="grid gap-4 p-6 lg:grid-cols-[1fr_260px] lg:items-center">
                <div>
                  <h3 className="text-2xl font-semibold text-slate-950">No approved report summaries are listed yet.</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Client Bureau keeps this page available for public research while moderation builds the approved record set.
                    Contractors can still check privately, create a watchlist item, or report a documented client experience for review.
                  </p>
                </div>
                <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                  <Link href="/submit-report">
                    Report a Client Experience
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardContent className="space-y-5 p-6">
            <div>
              <p className="text-sm font-semibold uppercase text-amber-700">Frequently asked questions</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Using this Client Bureau page responsibly</h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-semibold text-slate-950">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <PremiumCtaBand
        eyebrow="Use this page as a starting point"
        title="Check the client, review the context, and decide the terms before the job starts."
        description="Client Bureau combines public research pages with private tools for contracts, evidence, reports, recovery, and response-aware records."
        primary={{ href: primaryHref, label: "Check a Client", icon: Search }}
        secondary={{ href: "/clients", label: "Browse directory", icon: ShieldCheck }}
      />
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  )
}

function ProfileFact({ label, value }: { label: string; value: string }) {
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

function formatPaymentContext(value: number) {
  return value > 0 ? formatCurrency(value) : "No issue reported"
}

function formatReportPaymentLine(report: PublicClientProfile["reports"][number]) {
  if (isPositiveReportCategory(report.reportCategory)) return "Client experience: Positive"
  if (report.amountUnpaid <= 0) return "Payment issue: None reported"

  return `Reported unpaid balance: ${formatCurrency(report.amountUnpaid)}`
}

function getLandingContext(page: SeoLandingPage) {
  if (page.tradeCategory) {
    return {
      place: `${page.tradeCategory.toLowerCase()} work`,
      noun: `${page.tradeCategory.toLowerCase()} client reports`,
      audience: page.audience,
      profileFocus:
        "Trade pages explain how contractors and service businesses can check client context, document scope, and preserve private project records for specific trades without exposing raw private details.",
    }
  }

  if (page.kind === "clients") {
    const place = page.city && page.state ? `${page.city}, ${page.state}` : page.state ? page.state : "this market"

    return {
      place,
      noun: `${place} client reports`,
      audience: page.audience,
      profileFocus:
        "Public market pages help contractors research approved profile context by city or state while keeping private identifiers and unapproved submissions out of search results.",
    }
  }

  if (page.kind === "reports") {
    return {
      place: "this report category",
      noun: page.reportCategory ? `${page.reportCategory.toLowerCase()} client reports` : "client report context",
      audience: page.audience,
      profileFocus:
        "Report-category pages organize approved summaries by the type of documented contractor experience, including payment issues, dispute context, positive reports, and resolution updates.",
    }
  }

  return {
    place: page.industry ?? "this industry",
    noun: `${page.industry ?? "industry"} client reports`,
    audience: page.audience,
    profileFocus:
      "Industry pages explain how Client Bureau supports business owners who commit time, labor, materials, deliverables, appointments, or invoice risk before final payment is complete.",
  }
}

function getLandingSections(page: SeoLandingPage) {
  const context = getLandingContext(page)

  return [
    {
      eyebrow: "Client-check intent",
      title: `What ${context.noun} help you evaluate`,
      body:
        "Client Bureau pages are designed for practical pre-job review. They help a business owner decide whether to proceed normally, ask for clearer terms, request a deposit, prepare a contract packet, or document the job more carefully.",
      points: [
        "Reported payment status, unpaid balance context, and approved summary language.",
        "Client response, dispute, correction, and resolution information when approved.",
        "Positive client reports and would-work-with-again context when available.",
      ],
    },
    {
      eyebrow: "Moderation",
      title: "How public profile context is controlled",
      body:
        "Client Bureau public pages are intentionally limited. They are built from moderated profile fields and approved summaries, not raw complaint files or private workspace notes.",
      points: [
        "Pending and rejected reports do not appear on public profiles.",
        "Evidence is reviewed privately and summarized as evidence-on-file context.",
        "Public wording should remain factual, neutral, and tied to documented contractor experiences.",
      ],
    },
    {
      eyebrow: "Responsible use",
      title: `How contractors should use ${context.place} context`,
      body:
        "A Client Bureau page is one intake signal. Contractors should combine it with contracts, deposits, change-order controls, communication records, and their own judgment before accepting work.",
      points: [
        "Check before scheduling labor, buying materials, extending terms, or starting custom work.",
        "Document your own project timeline and submit updates if a payment or dispute is resolved.",
        "Use private workflow tools for managed recovery, Florida lien service records, and contract tracking without exposing private files publicly.",
      ],
    },
  ]
}

function getLandingFaqs(page: SeoLandingPage) {
  const context = getLandingContext(page)

  return [
    {
      question: `What are ${context.noun}?`,
      answer:
        "They are Client Bureau public research pages built from approved client profile context, moderated contractor-submitted summaries, response information, and non-sensitive rating factors.",
    },
    {
      question: "Does Client Bureau show private phone numbers, emails, or evidence files?",
      answer:
        "No. Public pages should not show raw phone numbers, email addresses, private addresses, raw evidence files, internal notes, pending reports, or rejected reports.",
    },
    {
      question: "What should I do if no public profile appears?",
      answer:
        "Check privately using available client details, add the client to a watchlist, create an intake assessment, or submit a documented report for moderation if you have a real contractor-client experience to report.",
    },
  ]
}

function getLandingPrimaryHref(page: SeoLandingPage) {
  if (!page.tradeCategory && !page.searchProfileType) return "/search"

  const params = new URLSearchParams()
  if (page.searchProfileType) params.set("profileType", page.searchProfileType)
  if (page.tradeCategory) params.set("tradeCategory", page.tradeCategory)

  return `/search?${params.toString()}`
}
