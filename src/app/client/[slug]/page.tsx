import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import {
  Banknote,
  Bell,
  BriefcaseBusiness,
  CalendarClock,
  FilePlus2,
  HelpCircle,
  Landmark,
  MessageSquareText,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  Star,
} from "lucide-react"

import { LegalNotice } from "@/components/client/legal-notice"
import { ReportCard } from "@/components/client/report-card"
import { RiskBadge } from "@/components/client/risk-badge"
import { ScoreGauge } from "@/components/client/score-gauge"
import { ReportTimeline } from "@/components/profile/report-timeline"
import {
  CommunityDiscussionSection,
  type PublicCommunityDiscussionEntry,
} from "@/components/profile/community-discussion-section"
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
  const responseHref = `/client-response?profile=${encodeURIComponent(`/client/${profile.publicSlug}`)}`
  const reportHref = `/submit-report?${new URLSearchParams({
    firstName: profile.firstName,
    lastName: profile.lastName,
    city: profile.city,
    state: profile.state,
    businessName: profile.businessName ?? "",
  }).toString()}`
  const positiveReportHref = `/submit-report?${new URLSearchParams({
    firstName: profile.firstName,
    lastName: profile.lastName,
    city: profile.city,
    state: profile.state,
    businessName: profile.businessName ?? "",
    intent: "positive",
  }).toString()}`
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
  const publicCommunityDiscussions: PublicCommunityDiscussionEntry[] = profile.communityDiscussions.map((discussion) => ({
    id: discussion.id,
    relationshipCategory: discussion.relationshipCategory,
    isVerified: discussion.isVerified,
    authorName: discussion.authorName,
    commentBody: discussion.commentBody,
  }))

  return (
    <article className="bg-slate-100">
      <JsonLd data={structuredData} />
      <section className="premium-hero-surface relative isolate overflow-hidden border-b border-slate-900 bg-slate-950 text-white">
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
            <div className="grid gap-3 rounded-md border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-slate-100 sm:grid-cols-2 lg:grid-cols-5">
              <HeroFact label="Approved reports" value={String(profile.reports.length)} />
              <HeroFact label="Positive references" value={String(profile.positiveReports.length)} />
              <HeroFact label="Evidence review" value={evidenceSummary.includes("Evidence on file") ? "Evidence on file" : "Private only"} />
              <HeroFact label="Response status" value={responseStatus} />
              <HeroFact label="Resolution status" value={resolutionStatus} />
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.06] p-4">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase text-amber-300">Recommended next step</p>
                  <p className="mt-1 text-sm leading-6 text-slate-200">
                    Use this profile as decision context, then document your own experience only after a real client interaction.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild className="bg-amber-500 text-slate-950 hover:bg-amber-400">
                    <Link href="/search">Check another client</Link>
                  </Button>
                  <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-950">
                    <Link href={`/dashboard/watchlist?clientSlug=${encodeURIComponent(profile.publicSlug)}`}>Watch this client</Link>
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-amber-500 text-slate-950 hover:bg-amber-400">
                <Link href={reportHref}>
                  <FilePlus2 aria-hidden="true" />
                  Report a Client Experience
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-950">
                <Link href={positiveReportHref}>
                  <ShieldCheck aria-hidden="true" />
                  Add Positive Experience
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-950">
                <Link href={responseHref}>
                  <MessageSquareText aria-hidden="true" />
                  Respond or dispute
                </Link>
              </Button>
            </div>
          </div>
          <Card className="premium-card-glow rounded-md border-white/10 bg-white text-slate-950 shadow-2xl">
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

      <section className="bureau-section bureau-paper">
        <div className="bureau-container grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="grid gap-3 md:grid-cols-4">
              <TrustMetric label="Client experience reports" value={String(profile.reports.length)} />
              <TrustMetric label="Positive references" value={String(profile.positiveReports.length)} />
              <TrustMetric label="Open disputes" value={String(openDisputes)} />
              <TrustMetric label="Resolved reports" value={String(resolvedReports)} />
            </div>

            <TrustVerificationPanel profileName={name} summary={trustSummary} />

            <ProfileDecisionGuide
              clientName={name}
              location={location}
              profileSlug={profile.publicSlug}
              reportHref={reportHref}
              responseHref={responseHref}
              reportCount={profile.reports.length}
              openDisputes={openDisputes}
              evidenceSummary={evidenceSummary}
            />

            <Card className="bureau-hover-lift rounded-md border-slate-200 bg-white shadow-sm">
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

            <Card className="bureau-hover-lift overflow-hidden rounded-md border-slate-200 bg-white shadow-sm">
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

            <Card className="bureau-hover-lift rounded-md border-slate-200 bg-white shadow-sm">
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

            <Card className="bureau-hover-lift rounded-md border-slate-200 bg-white shadow-sm">
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

            <Card className="bureau-hover-lift rounded-md border-slate-200 bg-white shadow-sm">
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
                  <Link href={responseHref}>Submit response or correction</Link>
                </Button>
              </CardContent>
            </Card>

            <CommunityDiscussionSection
              profileSlug={profile.publicSlug}
              discussions={publicCommunityDiscussions}
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
                  <Link href={responseHref}>Are you this client?</Link>
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
    <div className="bureau-hover-lift rounded-md border border-slate-200 bg-white p-4 shadow-sm">
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

function ProfileDecisionGuide({
  clientName,
  evidenceSummary,
  location,
  openDisputes,
  profileSlug,
  reportCount,
  reportHref,
  responseHref,
}: {
  clientName: string
  evidenceSummary: string[]
  location: string
  openDisputes: number
  profileSlug: string
  reportCount: number
  reportHref: string
  responseHref: string
}) {
  const evidenceLabel = evidenceSummary.includes("Evidence on file")
    ? "Private evidence has been reviewed for at least one published context."
    : "No raw evidence is shown publicly; moderators may still keep private files sealed."

  const actions = [
    {
      detail: `Save ${clientName} to your watchlist before quotes, scheduling, deposits, material orders, or change orders.`,
      href: `/dashboard/watchlist?clientSlug=${encodeURIComponent(profileSlug)}`,
      icon: Bell,
      label: "Watch this client",
      title: "Considering this client?",
    },
    {
      detail: "Submit a factual payment issue, dispute, positive reference, or would-work-with-again experience for moderation.",
      href: reportHref,
      icon: FilePlus2,
      label: "Report an experience",
      title: "Worked with this client?",
    },
    {
      detail: "Clients can submit a response, dispute, correction request, or resolution update for moderator review.",
      href: responseHref,
      icon: MessageSquareText,
      label: "Respond or dispute",
      title: "Are you this client?",
    },
    {
      detail: "Use agreement packets and private evidence records before labor, materials, scope changes, or payment milestones stack up.",
      href: "/dashboard/contracts",
      icon: BriefcaseBusiness,
      label: "Open contract tools",
      title: "Taking the job?",
    },
    {
      detail: "If payment is already overdue, use private recovery and Florida lien service workflows for documentation and staff review.",
      href: "/dashboard/recovery",
      icon: PhoneCall,
      label: "Open recovery tools",
      title: "Payment already an issue?",
    },
    {
      detail: "Florida lien service records stay private and require review gates, authorization, and supporting documentation.",
      href: "/dashboard/lien-readiness",
      icon: Landmark,
      label: "Start Florida lien service",
      title: "Need lien help?",
    },
  ]

  return (
    <Card className="bureau-hover-lift rounded-md border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-slate-50">
        <CardTitle className="flex items-center gap-2 text-xl">
          <ShieldCheck className="size-5 text-amber-700" aria-hidden="true" />
          What to do with this profile
        </CardTitle>
        <p className="text-sm leading-6 text-slate-600">
          Use this public profile as decision context for {clientName} in {location}. It is not a
          legal finding, guarantee, or automated approval decision.
        </p>
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Approved public context</p>
            <p className="mt-1 font-semibold text-slate-950">
              {reportCount} {reportCount === 1 ? "report" : "reports"} shown
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Dispute context</p>
            <p className="mt-1 font-semibold text-slate-950">
              {openDisputes} open {openDisputes === 1 ? "dispute" : "disputes"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Evidence status</p>
            <p className="mt-1 font-semibold text-slate-950">{evidenceLabel}</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {actions.map((action) => (
            <ProfileDecisionAction key={action.title} {...action} />
          ))}
        </div>
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          Public profile pages show moderated summaries, response context, and private evidence labels only.
          Do not rely on this page as a substitute for your own contract, documentation, payment terms, or professional advice.
        </div>
      </CardContent>
    </Card>
  )
}

function ProfileDecisionAction({
  detail,
  href,
  icon: Icon,
  label,
  title,
}: {
  detail: string
  href: string
  icon: LucideIcon
  label: string
  title: string
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col justify-between rounded-md border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-white"
    >
      <div>
        <span className="flex size-10 items-center justify-center rounded-md bg-slate-950 text-amber-300">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <h3 className="mt-4 font-semibold text-slate-950">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
      </div>
      <span className="mt-4 text-sm font-semibold text-amber-700 group-hover:text-amber-800">{label}</span>
    </Link>
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
