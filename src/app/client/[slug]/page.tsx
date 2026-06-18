import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import {
  Bell,
  BriefcaseBusiness,
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
import { ScoreGauge } from "@/components/client/score-gauge"
import {
  CommunityDiscussionSection,
  type PublicCommunityDiscussionEntry,
} from "@/components/profile/community-discussion-section"
import { PublicProfileShareCard } from "@/components/profile/public-profile-share-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { clientProfileConfidence, clientProfilePrimarySignals, clientRatingDisplay } from "@/lib/client-database"
import { getPublicClientProfileService } from "@/lib/repositories/client-bureau-service"
import { getClientCityDirectoryHref, getClientStateDirectoryHref } from "@/lib/client-directory"
import { getSiteUrl } from "@/lib/env"
import { JsonLd, getClientProfileStructuredData } from "@/lib/seo"
import { getPublicTrustSummary } from "@/lib/trust-verification"
import {
  clientRatingDisclaimer,
  clientRatingIndicators,
  responseStatusLabel,
  resolutionStatusLabel,
} from "@/lib/client-rating"
import { isPositiveReportCategory, type ClientReport } from "@/lib/types"

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
  const title = `${name} ${profile.city} ${profile.state} Public Client Profile`
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
  const allPublishedReports = [...concernReports, ...profile.positiveReports].sort(
    (a, b) => new Date(b.approvedAt ?? b.createdAt).getTime() - new Date(a.approvedAt ?? a.createdAt).getTime(),
  )
  const openDisputes = profile.balanceSummary.openDisputeCount
  const resolvedReports = profile.balanceSummary.resolvedReportCount
  const evidenceSummary = summarizeEvidence(profile.evidence)
  const trustSummary = getPublicTrustSummary(profile)
  const confidence = clientProfileConfidence(profile)
  const ratingDisplay = clientRatingDisplay(profile)
  const ratingBand = ratingDisplay.ratingLabel
  const primarySignals = clientProfilePrimarySignals(profile)
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
              <Link href="/clients" className="hover:text-white">Client Database</Link>
              <span aria-hidden="true">/</span>
              <Link href={stateHref} className="hover:text-white">{profile.state}</Link>
              <span aria-hidden="true">/</span>
              <Link href={cityHref} className="hover:text-white">{profile.city}</Link>
            </nav>
            <div className="flex flex-wrap items-center gap-3">
              <ContextBadge label={ratingDisplay.contextLabel} tone={ratingDisplay.tone} />
              <Badge className="rounded-md bg-emerald-600 text-white">
                <ShieldCheck className="size-3" aria-hidden="true" />
                Public client record
              </Badge>
              <Badge variant="outline" className="rounded-md border-white/20 bg-white/10 text-slate-100">
                Admin-approved summaries
              </Badge>
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-normal text-white sm:text-5xl">
                {name} in {profile.city}, {profile.state}
              </h1>
              <p className="mt-3 text-lg text-slate-300">
                {profile.businessName ? `${profile.businessName} | ` : ""}
                Client Bureau public profile with moderated report context, response paths, and private evidence labels.
              </p>
            </div>
            <p className="max-w-3xl leading-7 text-slate-300">
              Use this as one client-check signal before quotes, scheduling, materials, contract
              terms, deposits, or payment milestones. It is not a credit score, legal finding,
              background check, or guarantee.
            </p>
            <ClientProfileAtAGlance
              confidenceLevel={confidence.level}
              evidenceLabel={primarySignals.evidenceLabel}
              reportMix={primarySignals.reportMix}
              responseStatus={responseStatus}
              resolutionStatus={resolutionStatus}
              updatedAt={profile.updatedAt}
            />
            <div className="rounded-md border border-white/10 bg-white/[0.06] p-4">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase text-amber-300">Recommended next step</p>
                  <p className="mt-1 text-sm leading-6 text-slate-200">
                    Use this profile as one intake signal, then check another client or document a real experience after the job.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild className="bg-amber-500 text-slate-950 hover:bg-amber-400">
                    <Link href="/search?profileType=client">Check Another Client</Link>
                  </Button>
                  <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-950">
                    <Link href={reportHref}>Report a Client Experience</Link>
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-slate-200">
              <Link href={positiveReportHref} className="inline-flex items-center gap-2 hover:text-white">
                <ShieldCheck className="size-4" aria-hidden="true" />
                Add Positive Experience
              </Link>
              <Link href={responseHref} className="inline-flex items-center gap-2 hover:text-white">
                <MessageSquareText className="size-4" aria-hidden="true" />
                Respond or Correct
              </Link>
              <Link
                href={`/dashboard/watchlist?clientSlug=${encodeURIComponent(profile.publicSlug)}`}
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <Bell className="size-4" aria-hidden="true" />
                Watch this client
              </Link>
            </div>
          </div>
          <Card className="premium-card-glow rounded-md border-white/10 bg-white text-slate-950 shadow-2xl">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center justify-between gap-4">
                <Badge className="rounded-md bg-slate-950 text-white">
                  <Star className="size-3" aria-hidden="true" />
                  Client Bureau Context Rating
                </Badge>
                <span className="text-xs font-semibold uppercase text-slate-500">Client Bureau</span>
              </div>
              {ratingDisplay.shouldShowNumericScore ? (
                <ScoreGauge score={profile.clientBureauScore} label={ratingDisplay.scoreLabel} />
              ) : (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase text-slate-500">{ratingDisplay.scoreLabel}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950">{ratingDisplay.scoreDisplay}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{ratingDisplay.summary}</p>
                </div>
              )}
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm font-semibold text-amber-950">{ratingBand}</p>
                <p className="mt-1 text-xs leading-5 text-amber-900">{clientRatingDisclaimer()}</p>
              </div>
              <div className={`rounded-md border p-3 ${confidenceToneClass(confidence.tone)}`}>
                <p className="text-sm font-semibold">{confidence.level} confidence</p>
                <p className="mt-1 text-xs leading-5 opacity-80">{confidence.summary}</p>
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
                  <span className="text-slate-500">Public reports</span>
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
            <PublicReportSummary
              concernCount={concernReports.length}
              confidenceLevel={trustSummary.confidence.level}
              evidenceSummary={evidenceSummary}
              name={name}
              openDisputes={openDisputes}
              positiveCount={profile.positiveReports.length}
              reportCount={allPublishedReports.length}
              resolvedReports={resolvedReports}
              totalReportedUnpaid={profile.balanceSummary.totalReportedUnpaid}
            />

            <ProfileDecisionGuide
              clientName={name}
              location={location}
              profileSlug={profile.publicSlug}
              reportHref={reportHref}
              responseHref={responseHref}
              reportCount={allPublishedReports.length}
              openDisputes={openDisputes}
              evidenceSummary={evidenceSummary}
            />

            <PublishedReportHistory
              reports={allPublishedReports}
              concernCount={concernReports.length}
              positiveCount={profile.positiveReports.length}
            />

            <ResponseResolutionPanel
              clientResponses={profile.clientResponses.map((response) => response.responseSummary)}
              openDisputes={openDisputes}
              resolvedReports={resolvedReports}
              responseHref={responseHref}
            />

            <EvidenceModerationPanel
              confidenceScore={trustSummary.confidence.score}
              confidenceLevel={trustSummary.confidence.level}
              evidenceSummary={evidenceSummary}
              moderationFactors={trustSummary.confidence.factors}
              timelineCount={profile.timeline.length}
            />

            <CommunityDiscussionSection
              profileSlug={profile.publicSlug}
              discussions={publicCommunityDiscussions}
            />
          </div>

          <aside className="space-y-5">
            <LegalNotice />
            <ReportActionCard
              positiveReportHref={positiveReportHref}
              reportHref={reportHref}
              responseHref={responseHref}
              searchHref="/search?profileType=client"
            />
            <PublicProfileShareCard
              name={name}
              location={location}
              profileUrl={profileUrl}
              profileSlug={profile.publicSlug}
              imageUrl={profileImageUrl}
              score={profile.clientBureauScore}
              contextLabel={ratingDisplay.contextLabel}
              ratingLabel={ratingDisplay.ratingLabel}
              riskLevel={profile.riskLevel}
              reportCount={profile.reports.length}
              showNumericScore={ratingDisplay.shouldShowNumericScore}
              showRiskBadge={ratingDisplay.shouldShowRiskBadge}
            />
            <SidebarRatingCard
              ratingBand={ratingBand}
              ratingDisplay={ratingDisplay}
              ratingIndicators={ratingIndicators}
              scoreFactors={profile.scoreFactors}
              updatedAt={profile.updatedAt}
            />
            <SidebarModerationCard
              confidenceLevel={trustSummary.confidence.level}
              evidenceSummary={evidenceSummary}
            />
          </aside>
        </div>
      </section>
    </article>
  )
}

function ContextBadge({ label, tone }: { label: string; tone: "amber" | "emerald" | "rose" | "slate" | "sky" }) {
  const className =
    tone === "emerald"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : tone === "rose"
        ? "border-rose-200 bg-rose-50 text-rose-800"
        : tone === "sky"
          ? "border-sky-200 bg-sky-50 text-sky-800"
          : tone === "amber"
            ? "border-amber-200 bg-amber-50 text-amber-900"
            : "border-slate-200 bg-slate-100 text-slate-700"

  return (
    <Badge variant="outline" className={`rounded-md px-2 py-1 ${className}`}>
      {label}
    </Badge>
  )
}

function ClientProfileAtAGlance({
  confidenceLevel,
  evidenceLabel,
  reportMix,
  responseStatus,
  resolutionStatus,
  updatedAt,
}: {
  confidenceLevel: string
  evidenceLabel: string
  reportMix: string
  responseStatus: string
  resolutionStatus: string
  updatedAt: string
}) {
  return (
    <div className="grid gap-3 rounded-md border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-slate-100 sm:grid-cols-2 lg:grid-cols-3">
      <HeroFact label="Report mix" value={reportMix} />
      <HeroFact label="Evidence" value={evidenceLabel} />
      <HeroFact label="Response" value={responseStatus} />
      <HeroFact label="Resolution" value={resolutionStatus} />
      <HeroFact label="Confidence" value={confidenceLevel} />
      <HeroFact label="Last updated" value={new Date(updatedAt).toLocaleDateString()} />
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

function PublicReportSummary({
  concernCount,
  confidenceLevel,
  evidenceSummary,
  name,
  openDisputes,
  positiveCount,
  reportCount,
  resolvedReports,
  totalReportedUnpaid,
}: {
  concernCount: number
  confidenceLevel: string
  evidenceSummary: string[]
  name: string
  openDisputes: number
  positiveCount: number
  reportCount: number
  resolvedReports: number
  totalReportedUnpaid: number
}) {
  return (
    <Card className="overflow-hidden rounded-md border-slate-200 bg-white shadow-sm">
      <CardContent className="grid gap-6 p-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase text-amber-700">Public report summary</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950">
            Report context for {name}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            This dossier groups approved contractor-submitted summaries, positive references,
            response and resolution context, and private evidence indicators. It is not a legal
            finding, credit score, collection action, or guarantee.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <ReportSummaryMetric label="Published reports" value={String(reportCount)} text={`${concernCount} concern / ${positiveCount} positive`} />
          <ReportSummaryMetric label="Reported payment context" value={formatPaymentContext(totalReportedUnpaid)} text="Shown as reported context only." />
          <ReportSummaryMetric label="Response and disputes" value={`${openDisputes} open`} text={`${resolvedReports} resolved or paid context`} />
          <ReportSummaryMetric label="Evidence" value={evidenceSummary.at(-1) ?? "Private"} text="Raw files are not public." />
          <ReportSummaryMetric label="Review confidence" value={confidenceLevel} text="Based on moderation and evidence signals." />
          <ReportSummaryMetric label="Fairness path" value="Available" text="Response, dispute, correction, or resolution update." />
        </div>
      </CardContent>
    </Card>
  )
}

function ReportSummaryMetric({ label, text, value }: { label: string; text: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-600">{text}</p>
    </div>
  )
}

function PublishedReportHistory({
  concernCount,
  positiveCount,
  reports,
}: {
  concernCount: number
  positiveCount: number
  reports: ClientReport[]
}) {
  return (
    <section className="space-y-4" aria-labelledby="published-report-history">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase text-amber-700">Published report history</p>
          <h2 id="published-report-history" className="mt-2 text-3xl font-semibold text-slate-950">
            Approved public reports
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Concern reports and positive references use the same moderated dossier format so the public record is easier to scan.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="rounded-md border-rose-200 bg-white text-rose-900">
            {concernCount} concern
          </Badge>
          <Badge variant="outline" className="rounded-md border-emerald-200 bg-white text-emerald-900">
            {positiveCount} positive
          </Badge>
        </div>
      </div>
      {reports.length > 0 ? (
        <div className="grid gap-5">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <Card className="rounded-md border-dashed border-slate-300 bg-white shadow-sm">
          <CardContent className="p-6 text-sm leading-6 text-slate-600">
            No approved public reports are currently published for this profile. Contractors can submit a factual experience for moderation after a real interaction.
          </CardContent>
        </Card>
      )}
    </section>
  )
}

function ResponseResolutionPanel({
  clientResponses,
  openDisputes,
  resolvedReports,
  responseHref,
}: {
  clientResponses: string[]
  openDisputes: number
  resolvedReports: number
  responseHref: string
}) {
  return (
    <Card className="rounded-md border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-slate-50">
        <CardTitle className="flex items-center gap-2 text-xl">
          <MessageSquareText className="size-5 text-amber-700" aria-hidden="true" />
          Response and resolution
        </CardTitle>
        <p className="text-sm leading-6 text-slate-600">
          Clients may submit response, dispute, correction, or resolution context. Approved updates appear publicly after moderation.
        </p>
      </CardHeader>
      <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_240px]">
        <div className="space-y-3">
          {clientResponses.length > 0 ? (
            clientResponses.map((summary) => (
              <div key={summary} className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                {summary}
              </div>
            ))
          ) : (
            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              No published client response is currently attached to this profile.
            </div>
          )}
        </div>
        <div className="grid gap-3 rounded-md border border-slate-200 bg-white p-4 text-sm">
          <ReportSummaryMetric label="Open disputes" value={String(openDisputes)} text="Reviewed before public display." />
          <ReportSummaryMetric label="Resolved reports" value={String(resolvedReports)} text="Paid, settled, resolved, or admin verified." />
          <Button asChild variant="outline" className="w-full">
            <Link href={responseHref}>Respond or Correct</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function EvidenceModerationPanel({
  confidenceLevel,
  confidenceScore,
  evidenceSummary,
  moderationFactors,
  timelineCount,
}: {
  confidenceLevel: string
  confidenceScore: number
  evidenceSummary: string[]
  moderationFactors: string[]
  timelineCount: number
}) {
  return (
    <Card className="rounded-md border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-slate-50">
        <CardTitle className="flex items-center gap-2 text-xl">
          <ShieldAlert className="size-5 text-amber-700" aria-hidden="true" />
          Evidence and moderation
        </CardTitle>
        <p className="text-sm leading-6 text-slate-600">
          Public profiles show moderated summaries and evidence labels only. Raw files, private identifiers, staff-only review notes, and pending or rejected content stay private.
        </p>
      </CardHeader>
      <CardContent className="grid gap-4 p-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Evidence labels</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {evidenceSummary.map((item) => (
              <Badge key={item} variant="outline" className="rounded-md bg-white">
                {item}
              </Badge>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-600">
            {timelineCount} public timeline {timelineCount === 1 ? "marker" : "markers"} available after moderation.
          </p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Review confidence</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{confidenceLevel}</p>
            </div>
            <Badge className="rounded-md bg-slate-950 text-white">{confidenceScore}/100</Badge>
          </div>
          <div className="mt-4 grid gap-2">
            {moderationFactors.map((factor) => (
              <p key={factor} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
                {factor}
              </p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ReportActionCard({
  positiveReportHref,
  reportHref,
  responseHref,
  searchHref,
}: {
  positiveReportHref: string
  reportHref: string
  responseHref: string
  searchHref: string
}) {
  return (
    <Card className="rounded-md border-amber-200 bg-amber-50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-amber-950">Next action</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        <Button asChild className="bg-amber-500 text-slate-950 hover:bg-amber-400">
          <Link href={searchHref}>Check Another Client</Link>
        </Button>
        <Button asChild variant="outline" className="bg-white">
          <Link href={reportHref}>Report a Client Experience</Link>
        </Button>
        <Button asChild variant="outline" className="bg-white">
          <Link href={positiveReportHref}>Add Positive Experience</Link>
        </Button>
        <Button asChild variant="outline" className="bg-white">
          <Link href={responseHref}>Respond or Correct</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function SidebarRatingCard({
  ratingBand,
  ratingDisplay,
  ratingIndicators,
  scoreFactors,
  updatedAt,
}: {
  ratingBand: string
  ratingDisplay: ReturnType<typeof clientRatingDisplay>
  ratingIndicators: { label: string; value: string }[]
  scoreFactors: { label: string; impact: number; tone: "positive" | "negative" | "neutral"; description: string }[]
  updatedAt: string
}) {
  return (
    <Card className="rounded-md border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <HelpCircle className="size-5 text-amber-700" aria-hidden="true" />
          Rating context
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">{ratingDisplay.scoreLabel}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{ratingDisplay.scoreDisplay}</p>
          <p className="mt-1 text-sm font-semibold text-amber-800">{ratingBand}</p>
          <p className="mt-2 text-xs leading-5 text-slate-600">{ratingDisplay.summary}</p>
          <p className="mt-2 text-xs leading-5 text-slate-600">Last updated {new Date(updatedAt).toLocaleDateString()}</p>
        </div>
        <div className="grid gap-2">
          {ratingIndicators.slice(0, 4).map((indicator) => (
            <div key={indicator.label} className="flex justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
              <span className="text-slate-500">{indicator.label}</span>
              <span className="text-right font-semibold text-slate-950">{indicator.value}</span>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {ratingDisplay.shouldShowNumericScore ? (
            scoreFactors.slice(0, 3).map((factor) => (
              <div key={factor.label} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{factor.label}</p>
                  <span className={factor.impact < 0 ? "text-sm font-semibold text-rose-700" : "text-sm font-semibold text-emerald-700"}>
                    {factor.impact > 0 ? "+" : ""}
                    {factor.impact}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-600">{factor.description}</p>
              </div>
            ))
          ) : (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
              Score factors appear after approved public report history exists. Until then, this profile should be read as limited public context.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function SidebarModerationCard({
  confidenceLevel,
  evidenceSummary,
}: {
  confidenceLevel: string
  evidenceSummary: string[]
}) {
  return (
    <Card className="rounded-md border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldAlert className="size-5 text-amber-700" aria-hidden="true" />
          Public safety
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm leading-6 text-slate-600">
        <p>Public profile is active and moderated.</p>
        <p>Published reports are approved or marked with dispute context.</p>
        <p>Private matching identifiers are stored as hashes.</p>
        <p>
          Review confidence: <span className="font-semibold text-slate-950">{confidenceLevel}</span>
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {evidenceSummary.map((item) => (
            <Badge key={item} variant="outline" className="rounded-md bg-slate-50">
              {item}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function confidenceToneClass(tone: "amber" | "emerald" | "slate") {
  if (tone === "emerald") return "border-emerald-200 bg-emerald-50 text-emerald-950"
  if (tone === "amber") return "border-amber-200 bg-amber-50 text-amber-950"

  return "border-slate-200 bg-slate-50 text-slate-700"
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
