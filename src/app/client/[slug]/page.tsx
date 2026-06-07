import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Banknote, CalendarClock, FilePlus2, HelpCircle, MessageSquareText, ShieldAlert, ShieldCheck, Star } from "lucide-react"

import { LegalNotice } from "@/components/client/legal-notice"
import { ReportCard } from "@/components/client/report-card"
import { RiskBadge } from "@/components/client/risk-badge"
import { ScoreGauge } from "@/components/client/score-gauge"
import { ReportTimeline } from "@/components/profile/report-timeline"
import { CommunityDiscussionSection } from "@/components/profile/community-discussion-section"
import { PublicProfileShareCard } from "@/components/profile/public-profile-share-card"
import { ScoreBreakdown } from "@/components/profile/score-breakdown"
import { TrustVerificationPanel } from "@/components/profile/trust-verification-panel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getPublicClientProfileService } from "@/lib/repositories/client-bureau-service"
import { getClientCityDirectoryHref, getClientStateDirectoryHref } from "@/lib/client-directory"
import { getSiteUrl } from "@/lib/env"
import { JsonLd, getClientProfileStructuredData } from "@/lib/seo"
import { getPublicTrustSummary } from "@/lib/trust-verification"
import {
  clientRatingBand,
  clientRatingDisclaimer,
  clientRatingIndicators,
  responseStatusLabel,
  resolutionStatusLabel,
} from "@/lib/client-rating"
import { isPositiveReportCategory } from "@/lib/types"

type ClientProfilePageProps = {
  params: Promise<{ slug: string }>
}

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: ClientProfilePageProps): Promise<Metadata> {
  const { slug } = await params
  const profile = await getPublicClientProfileService(slug)
  const siteUrl = getSiteUrl()

  if (!profile) {
    return {
      title: "Client Profile Not Found",
    }
  }

  const name = `${profile.firstName} ${profile.lastName}`
  const location = `${profile.city}, ${profile.state}`
  const title = `${name} ${profile.city} ${profile.state} Client Bureau Profile`
  const description = `${name} in ${location}: Client Bureau Rating, moderated contractor-submitted reports, response context, and evidence-on-file summaries.`
  const profileUrl = `${siteUrl}/client/${profile.publicSlug}`
  const imageUrl = `${profileUrl}/opengraph-image`

  return {
    title,
    description,
    alternates: {
      canonical: profileUrl,
    },
    openGraph: {
      title,
      description,
      url: profileUrl,
      type: "profile",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `Client Bureau public profile card for ${name} in ${location}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${profileUrl}/twitter-image`],
    },
    keywords: [
      name,
      location,
      "contractor-submitted client report",
      "unpaid invoice",
      "reported payment risk",
      "client report",
      "Client Bureau",
    ],
  }
}

export default async function ClientProfilePage({ params }: ClientProfilePageProps) {
  const { slug } = await params
  const profile = await getPublicClientProfileService(slug)

  if (!profile) notFound()

  const name = `${profile.firstName} ${profile.lastName}`
  const location = `${profile.city}, ${profile.state}`
  const profileUrl = `${getSiteUrl()}/client/${profile.publicSlug}`
  const profileImageUrl = `${profileUrl}/opengraph-image`
  const structuredData = getClientProfileStructuredData(profile)
  const stateHref = getClientStateDirectoryHref(profile)
  const cityHref = getClientCityDirectoryHref(profile)

  const concernReports = profile.reports.filter((report) => !isPositiveReportCategory(report.reportCategory))
  const openDisputes = profile.balanceSummary.openDisputeCount
  const resolvedReports = profile.balanceSummary.resolvedReportCount
  const evidenceSummary = summarizeEvidence(profile.evidence)
  const trustSummary = getPublicTrustSummary(profile)
  const ratingBand = clientRatingBand(profile.clientBureauScore, profile.reports.length)
  const responseStatus = responseStatusLabel(profile)
  const resolutionStatus = resolutionStatusLabel(profile)
  const ratingIndicators = clientRatingIndicators(profile)

  return (
    <article className="bg-slate-100">
      <JsonLd data={structuredData} />
      <section className="border-b border-slate-900 bg-slate-950 text-white">
        <div className="bureau-container grid gap-8 py-12 lg:grid-cols-[1fr_360px] lg:items-end">
          <div className="space-y-5">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase text-slate-400">
              <Link href="/clients" className="hover:text-white">Client Directory</Link>
              <span aria-hidden="true">/</span>
              <Link href={stateHref} className="hover:text-white">{profile.state}</Link>
              <span aria-hidden="true">/</span>
              <Link href={cityHref} className="hover:text-white">{profile.city}</Link>
            </nav>
            <div className="flex flex-wrap items-center gap-3">
              <RiskBadge riskLevel={profile.riskLevel} />
              <Badge className="rounded-md bg-emerald-600 text-white">
                <ShieldCheck className="size-3" aria-hidden="true" />
                Verified public profile
              </Badge>
              <Badge variant="outline" className="rounded-md border-white/20 bg-white/10 text-slate-100">
                Admin-approved summaries
              </Badge>
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-normal text-white sm:text-5xl">
                {name} in {profile.city}, {profile.state}: Client Bureau Public Profile
              </h1>
              <p className="mt-3 text-lg text-slate-300">
                {profile.businessName ? `${profile.businessName} | ` : ""}
                {profile.city}, {profile.state} / Contractor-submitted reports, Client Bureau Rating context, positive references, public responses, and moderated profile context.
              </p>
            </div>
            <p className="max-w-3xl leading-7 text-slate-300">
              This Client Bureau profile is built from contractor-submitted reports, approved
              public summaries, client response information, and reputation indicators. Private
              phone numbers, emails, addresses, raw evidence, and internal notes are not displayed.
            </p>
            <div className="grid gap-3 rounded-md border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200 md:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase text-amber-300">Search result intent</p>
                <p className="mt-1">{name} client profile in {location}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-amber-300">Public record type</p>
                <p className="mt-1">Moderated contractor-submitted reports</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-amber-300">Fairness layer</p>
                <p className="mt-1">Client response and dispute path included</p>
              </div>
            </div>
            <div className="grid gap-3 rounded-md border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-slate-100 md:grid-cols-4">
              <HeroFact label="Approved reports" value={String(profile.reports.length)} />
              <HeroFact label="Positive references" value={String(profile.positiveReports.length)} />
              <HeroFact label="Evidence review" value={evidenceSummary.includes("Evidence on file") ? "Evidence on file" : "Private only"} />
              <HeroFact label="Response status" value={responseStatus} />
              <HeroFact label="Resolution status" value={resolutionStatus} />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-950">
                <Link href="/search">Check another client</Link>
              </Button>
              <Button asChild className="bg-amber-500 text-slate-950 hover:bg-amber-400">
                <Link href="/submit-report">
                  <FilePlus2 aria-hidden="true" />
                  Report a Client Experience
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-950">
                <Link href={`/submit-report?${new URLSearchParams({
                  firstName: profile.firstName,
                  lastName: profile.lastName,
                  city: profile.city,
                  state: profile.state,
                  businessName: profile.businessName ?? "",
                  intent: "positive",
                }).toString()}`}>
                  <ShieldCheck aria-hidden="true" />
                  Add Positive Experience
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-950">
                <Link href="/client-response">
                  <MessageSquareText aria-hidden="true" />
                  Respond or dispute
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-950">
                <Link href={`/dashboard/watchlist?client=${profile.id}`}>Watch this client</Link>
              </Button>
            </div>
          </div>
          <Card className="rounded-md border-white/10 bg-white text-slate-950 shadow-2xl">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center justify-between gap-4">
                <Badge className="rounded-md bg-slate-950 text-white">
                  <Star className="size-3" aria-hidden="true" />
                  Client Bureau Rating
                </Badge>
                <span className="text-xs font-semibold uppercase text-slate-500">Client Bureau</span>
              </div>
              <ScoreGauge score={profile.clientBureauScore} label="Client Bureau Rating" />
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm font-semibold text-amber-950">{ratingBand}</p>
                <p className="mt-1 text-xs leading-5 text-amber-900">{clientRatingDisclaimer()}</p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                      <HelpCircle className="size-3.5" aria-hidden="true" />
                      Rating context
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Based on moderated reports, payment context, evidence summaries, disputes, resolutions, and positive reports.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Link href="/score-methodology" className="inline-flex text-xs font-semibold text-amber-700 hover:text-amber-800">
                View rating methodology
              </Link>
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Report count</span>
                  <span className="font-semibold text-slate-950">{profile.reportCount}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Rating label</span>
                  <span className="font-semibold text-slate-950">{ratingBand}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Payment issue context</span>
                  <span className="font-semibold text-slate-950">{formatPaymentContext(profile.balanceSummary.totalReportedUnpaid)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Open disputes</span>
                  <span className="font-semibold text-slate-950">{openDisputes}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Resolved reports</span>
                  <span className="font-semibold text-slate-950">{resolvedReports}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Public reports shown</span>
                  <span className="font-semibold text-slate-950">{profile.reports.length}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Positive references</span>
                  <span className="font-semibold text-slate-950">{profile.positiveReports.length}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Last updated</span>
                  <span className="text-right font-semibold text-slate-950">
                    {new Date(profile.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Response status</span>
                  <span className="text-right font-semibold text-slate-950">{responseStatus}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Resolution status</span>
                  <span className="text-right font-semibold text-slate-950">{resolutionStatus}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bureau-section">
        <div className="bureau-container grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="grid gap-3 md:grid-cols-4">
              <TrustMetric label="Client experience reports" value={String(profile.reports.length)} />
              <TrustMetric label="Positive references" value={String(profile.positiveReports.length)} />
              <TrustMetric label="Open disputes" value={String(openDisputes)} />
              <TrustMetric label="Resolved reports" value={String(resolvedReports)} />
            </div>

            <TrustVerificationPanel profileName={name} summary={trustSummary} />

            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ShieldCheck className="size-5 text-amber-700" aria-hidden="true" />
                  Rating indicators
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                <BalanceFact label="Client Bureau Rating" value={`${profile.clientBureauScore}/100`} />
                <BalanceFact label="Rating band" value={ratingBand} />
                {ratingIndicators.map((indicator) => (
                  <BalanceFact key={indicator.label} label={indicator.label} value={indicator.value} />
                ))}
                <BalanceFact label="Last updated" value={new Date(profile.updatedAt).toLocaleDateString()} />
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-md border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-200 bg-slate-50">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CalendarClock className="size-5 text-amber-700" aria-hidden="true" />
                  Contractor report timeline
                </CardTitle>
                <p className="text-sm leading-6 text-slate-600">
                  A public timeline of approved report activity, evidence-review markers, disputes, and publication updates.
                </p>
              </CardHeader>
              <CardContent className="p-5">
                <ReportTimeline events={profile.timeline} />
              </CardContent>
            </Card>

            <ProfileSearchSummary
              name={name}
              location={location}
              score={profile.clientBureauScore}
              riskLevel={profile.riskLevel}
              reportCount={profile.reports.length}
              evidenceSummary={evidenceSummary}
            />

            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Banknote className="size-5 text-amber-700" aria-hidden="true" />
                  Reported balance summary
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-4">
                <BalanceFact label="Total reported unpaid" value={formatCurrency(profile.balanceSummary.totalReportedUnpaid)} />
                <BalanceFact label="Currently unresolved" value={formatCurrency(profile.balanceSummary.unresolvedAmount)} />
                <BalanceFact label="Resolved or paid context" value={formatCurrency(profile.balanceSummary.resolvedAmount)} />
                <BalanceFact label="Resolution reports" value={String(resolvedReports)} />
              </CardContent>
            </Card>

            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <HelpCircle className="size-5 text-amber-700" aria-hidden="true" />
                  Why this score?
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                {profile.scoreBreakdown.map((factor) => (
                  <div key={factor.label} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-slate-950">{factor.label}</p>
                      <span className="text-sm font-semibold text-slate-600">{factor.score}/100</span>
                    </div>
                    <Progress value={factor.score} className="mt-3" />
                    <p className="mt-2 text-xs leading-5 text-slate-600">{factor.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h2 className="text-3xl font-semibold text-slate-950">Client experience reports</h2>
              <p className="max-w-3xl text-sm leading-6 text-slate-600">
                These contractor-submitted reports are published after moderation and are presented
                as reported experiences, not legal findings or unsupported accusations.
              </p>
            </div>
            {concernReports.length > 0 ? (
              <div className="grid gap-4">
                {concernReports.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            ) : (
              <Card className="rounded-md border-slate-200 bg-white shadow-sm">
                <CardContent className="p-6 text-sm text-slate-600">
                  No approved concern reports are currently published for this profile.
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">Positive references</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  Approved positive references help show paid-as-agreed, cooperative, or would-work-with-again client experiences.
                </p>
              </div>
              {profile.positiveReports.length > 0 ? (
                <div className="grid gap-4">
                  {profile.positiveReports.map((report) => (
                    <ReportCard key={report.id} report={report} />
                  ))}
                </div>
              ) : (
                <Card className="rounded-md border-slate-200 bg-white shadow-sm">
                  <CardContent className="p-6 text-sm text-slate-600">
                    No approved positive reports are currently published for this profile.
                  </CardContent>
                </Card>
              )}
            </div>

            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <MessageSquareText className="size-5 text-amber-700" aria-hidden="true" />
                  Dispute and resolution context
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-slate-600">
                <p>
                  Open disputes: <span className="font-semibold text-slate-950">{openDisputes}</span>
                </p>
                <p>
                  Resolved reports: <span className="font-semibold text-slate-950">{resolvedReports}</span>
                </p>
                <p>
                  Clients may submit a response, correction request, dispute, or resolution update.
                  Approved context appears publicly after moderation.
                </p>
                <Button asChild variant="outline">
                  <Link href="/client-response">Submit response or correction</Link>
                </Button>
              </CardContent>
            </Card>

            <CommunityDiscussionSection
              profileSlug={profile.publicSlug}
              discussions={profile.communityDiscussions}
            />
          </div>

          <aside className="space-y-5">
            <LegalNotice />
            <PublicProfileShareCard
              name={name}
              location={location}
              profileUrl={profileUrl}
              profileSlug={profile.publicSlug}
              imageUrl={profileImageUrl}
              score={profile.clientBureauScore}
              riskLevel={profile.riskLevel}
              reportCount={profile.reports.length}
            />
            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Rating factors</CardTitle>
              </CardHeader>
              <CardContent>
                <ScoreBreakdown score={profile.clientBureauScore} factors={profile.scoreFactors} />
              </CardContent>
            </Card>
            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShieldAlert className="size-5 text-amber-700" aria-hidden="true" />
                  Moderation status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-slate-600">
                <p>Public profile is active.</p>
                <p>All published reports are admin-approved or marked with dispute context.</p>
                <p>Private matching identifiers are stored as hashes.</p>
                <p>
                  Review confidence: <span className="font-semibold text-slate-950">{trustSummary.confidence.level}</span>
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarClock className="size-5 text-amber-700" aria-hidden="true" />
                  Evidence on file
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm leading-6 text-slate-600">
                {evidenceSummary.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </CardContent>
            </Card>
            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Client response</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.clientResponses.length > 0 ? (
                  profile.clientResponses.map((response) => (
                    <p key={response.id} className="text-sm leading-6 text-slate-700">
                      {response.responseSummary}
                    </p>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-slate-600">
                    No published client response is currently attached to this profile.
                  </p>
                )}
                <Button asChild variant="outline" className="w-full">
                  <Link href="/client-response">Are you this client?</Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </article>
  )
}

function TrustMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  )
}

function HeroFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-amber-200">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  )
}

function ProfileSearchSummary({
  name,
  location,
  score,
  riskLevel,
  reportCount,
  evidenceSummary,
}: {
  name: string
  location: string
  score: number
  riskLevel: string
  reportCount: number
  evidenceSummary: string[]
}) {
  return (
    <Card className="rounded-md border-amber-200 bg-amber-50 shadow-sm">
      <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_220px] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase text-amber-900">Profile summary for searchers</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            {name} in {location}: public client context for contractors
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            This public page summarizes moderated contractor-submitted experiences, approved report
            status, private evidence-review indicators, rating context, and client response options.
            It is not a legal finding and does not publish raw contact details or private files.
          </p>
        </div>
        <div className="grid gap-2 rounded-md border border-amber-200 bg-white p-4 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-slate-500">Rating</span>
            <span className="font-semibold text-slate-950">{score}/100</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-slate-500">Risk level</span>
            <span className="font-semibold text-slate-950">{riskLevel}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-slate-500">Approved reports</span>
            <span className="font-semibold text-slate-950">{reportCount}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-slate-500">Evidence</span>
            <span className="text-right font-semibold text-slate-950">{evidenceSummary.at(-1)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BalanceFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-950">{value}</p>
    </div>
  )
}

function summarizeEvidence(evidence: { fileType: string; fileName: string }[]) {
  if (evidence.length === 0) return ["No public evidence files are displayed.", "Private uploads remain available only to moderators."]

  const labels = new Set<string>()
  for (const item of evidence) {
    const value = `${item.fileType} ${item.fileName}`.toLowerCase()
    if (value.includes("invoice")) labels.add("Invoices reviewed")
    if (value.includes("pdf") || value.includes("contract")) labels.add("Documents reviewed")
    if (value.includes("image") || value.includes("png") || value.includes("jpg") || value.includes("photo")) labels.add("Photos reviewed")
    if (value.includes("screenshot")) labels.add("Screenshots reviewed")
  }

  labels.add("Evidence on file")
  return Array.from(labels)
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
