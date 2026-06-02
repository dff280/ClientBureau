import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CalendarClock, FilePlus2, HelpCircle, MessageSquareText, ShieldAlert, ShieldCheck } from "lucide-react"

import { LegalNotice } from "@/components/client/legal-notice"
import { ReportCard } from "@/components/client/report-card"
import { RiskBadge } from "@/components/client/risk-badge"
import { ScoreGauge } from "@/components/client/score-gauge"
import { ReportTimeline } from "@/components/profile/report-timeline"
import { CommunityDiscussionSection } from "@/components/profile/community-discussion-section"
import { ScoreBreakdown } from "@/components/profile/score-breakdown"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getPublicClientProfileService } from "@/lib/repositories/client-bureau-service"
import { getSiteUrl } from "@/lib/env"

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
  const title = `${name} ${location} Contractor Client Report`
  const description = `${name} in ${location}: Client Bureau profile with moderated contractor-submitted report summaries, reported payment risk context, risk level, and right-of-response information.`

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/client/${profile.publicSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/client/${profile.publicSlug}`,
      type: "profile",
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
  const siteUrl = getSiteUrl()
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${name} Client Bureau profile`,
    description: `Moderated contractor-submitted report profile for ${name} in ${profile.city}, ${profile.state}.`,
    url: `${siteUrl}/client/${profile.publicSlug}`,
    about: {
      "@type": "Person",
      name,
      address: {
        "@type": "PostalAddress",
        addressLocality: profile.city,
        addressRegion: profile.state,
      },
    },
  }

  const concernReports = profile.reports.filter(
    (report) => !["Positive experience", "Would work with again"].includes(report.reportCategory),
  )
  const openDisputes = profile.reports.filter((report) => report.status === "disputed").length
  const resolvedReports = profile.reports.filter((report) =>
    ["Paid", "resolved"].some((term) => report.paymentStatus.toLowerCase().includes(term.toLowerCase())),
  ).length
  const evidenceSummary = summarizeEvidence(profile.evidence)

  return (
    <article className="bg-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="border-b border-slate-200 bg-white">
        <div className="bureau-container grid gap-8 py-12 lg:grid-cols-[1fr_360px] lg:items-end">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <RiskBadge riskLevel={profile.riskLevel} />
              <Badge className="rounded-md bg-emerald-700 text-white">
                <ShieldCheck className="size-3" aria-hidden="true" />
                Verified public record
              </Badge>
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
                {name}
              </h1>
              <p className="mt-3 text-lg text-slate-600">
                {profile.businessName ? `${profile.businessName} | ` : ""}
                {profile.city}, {profile.state}
              </p>
            </div>
            <p className="max-w-3xl leading-7 text-slate-600">
              This Client Bureau page contains moderated, contractor-submitted reports and client
              response information. It is limited to approved summaries and does not display full
              phone numbers or email addresses.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                <Link href="/submit-report">
                  <FilePlus2 aria-hidden="true" />
                  Add a report
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/client-response">
                  <MessageSquareText aria-hidden="true" />
                  Respond or dispute
                </Link>
              </Button>
            </div>
          </div>
          <Card className="rounded-md border-slate-200 shadow-sm">
            <CardContent className="space-y-5 p-6">
              <ScoreGauge score={profile.clientBureauScore} />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                      <HelpCircle className="size-3.5" aria-hidden="true" />
                      Score context
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Based on moderated reports, payment context, evidence summaries, disputes, resolutions, and positive reports.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Link href="/score-methodology" className="inline-flex text-xs font-semibold text-amber-700 hover:text-amber-800">
                View score methodology
              </Link>
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Report count</span>
                  <span className="font-semibold text-slate-950">{profile.reportCount}</span>
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
                  <span className="text-slate-500">Last updated</span>
                  <span className="text-right font-semibold text-slate-950">
                    {new Date(profile.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Payment reliability</span>
                  <span className="text-right font-semibold text-slate-950">
                    {profile.paymentReliability}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Dispute history</span>
                  <span className="text-right font-semibold text-slate-950">
                    {profile.disputeHistory}
                  </span>
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
              <TrustMetric label="Approved reports" value={String(profile.reports.length)} />
              <TrustMetric label="Open disputes" value={String(openDisputes)} />
              <TrustMetric label="Resolved reports" value={String(resolvedReports)} />
              <TrustMetric label="Evidence" value={evidenceSummary.includes("Evidence on file") ? "On file" : "Private"} />
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-semibold text-slate-950">Approved report summaries</h2>
              <p className="max-w-3xl text-sm leading-6 text-slate-600">
                These summaries are published after admin review and are presented as reported
                experiences from contractors.
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
              <h2 className="text-2xl font-semibold text-slate-950">Positive reports</h2>
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

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-950">Report timeline</h2>
              <ReportTimeline events={profile.timeline} />
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
            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Score factors</CardTitle>
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
