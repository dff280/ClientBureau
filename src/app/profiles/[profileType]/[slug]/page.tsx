import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import type React from "react"
import { ArrowRight, BadgeCheck, BriefcaseBusiness, FileText, MessageSquare, ShieldCheck } from "lucide-react"

import { PremiumHero, PremiumProofStrip, ProductMockupFrame } from "@/components/marketing/premium-page-shell"
import { RiskBadge } from "@/components/client/risk-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { JsonLd } from "@/lib/seo"
import { getSiteUrl } from "@/lib/env"
import { claimedStatusLabel, profileTypeLabel, profileTypePluralLabel, reportConfidenceLabel, relationshipLabel } from "@/lib/entity-profiles"
import { getPublicEntityProfileService } from "@/lib/repositories/client-bureau-service"
import { profileTypes, type ProfileType } from "@/lib/types"

type EntityProfilePageProps = {
  params: Promise<{
    profileType: string
    slug: string
  }>
}

function toProfileType(value: string): ProfileType | undefined {
  return profileTypes.includes(value as ProfileType) ? (value as ProfileType) : undefined
}

export async function generateMetadata({ params }: EntityProfilePageProps): Promise<Metadata> {
  const { profileType: rawProfileType, slug } = await params
  const profileType = toProfileType(rawProfileType)
  if (!profileType) return {}

  const profile = await getPublicEntityProfileService(profileType, slug)
  if (!profile) return {}

  const title = `${profile.displayName} ${profile.city}, ${profile.state} | Client Bureau ${profileTypeLabel(profile.profileType)} Profile`
  const description =
    `Moderated Client Bureau profile for ${profile.displayName} in ${profile.city}, ${profile.state}: documented experiences, response context, and private evidence indicators.`

  return {
    title,
    description,
    alternates: {
      canonical: profile.profileHref,
    },
    openGraph: {
      title,
      description,
      url: profile.profileHref,
      type: "profile",
    },
  }
}

export default async function EntityProfilePage({ params }: EntityProfilePageProps) {
  const { profileType: rawProfileType, slug } = await params
  const profileType = toProfileType(rawProfileType)

  if (!profileType) notFound()

  const profile = await getPublicEntityProfileService(profileType, slug)

  if (!profile) notFound()

  const siteUrl = getSiteUrl()
  const profileUrl = `${siteUrl}${profile.profileHref}`
  const reportHref = `/submit-report?profileType=${profile.profileType}&profileSubtype=${encodeURIComponent(String(profile.profileSubtype ?? ""))}&profileSlug=${encodeURIComponent(profile.slug)}&city=${encodeURIComponent(profile.city)}&state=${encodeURIComponent(profile.state)}`
  const claimHref = `/claim-profile?profileType=${profile.profileType}&profileSlug=${encodeURIComponent(profile.slug)}`
  const responseHref = `/client-response?profile=${encodeURIComponent(profile.profileHref)}`
  const subjectType = profile.profileType === "client" ? "Person" : "Organization"
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${profileUrl}#profilepage`,
        url: profileUrl,
        name: `${profile.displayName} in ${profile.city}, ${profile.state}: Client Bureau profile`,
        description: profile.safeDescription,
        dateCreated: profile.createdAt,
        dateModified: profile.updatedAt,
        mainEntity: { "@id": `${profileUrl}#subject` },
      },
      {
        "@type": subjectType,
        "@id": `${profileUrl}#subject`,
        name: profile.displayName,
        address: {
          "@type": "PostalAddress",
          addressLocality: profile.city,
          addressRegion: profile.state,
          addressCountry: "US",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${profileUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Client Bureau", item: siteUrl },
          { "@type": "ListItem", position: 2, name: profileTypePluralLabel(profile.profileType), item: `${siteUrl}/search` },
          { "@type": "ListItem", position: 3, name: profile.displayName, item: profileUrl },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${profileUrl}#approved-report-summaries`,
        name: "Approved Client Bureau report summaries",
        itemListElement: profile.reports.slice(0, 10).map((report, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "CreativeWork",
            name: `${report.reportCategory} contractor-submitted summary`,
            text: report.publicSummary,
            dateCreated: report.createdAt,
          },
        })),
      },
    ],
  }

  return (
    <>
      <JsonLd data={structuredData} />
      <PremiumHero
        eyebrow={`${profileTypeLabel(profile.profileType)} public profile`}
        title={`${profile.displayName} in ${profile.city}, ${profile.state}`}
        description="This public profile shows approved Client Bureau context only: moderated summaries, response indicators, evidence-on-file labels, and public record status. Private identifiers and raw files stay sealed."
        primary={{ href: "/search", label: "Check Another Profile", icon: ShieldCheck }}
        secondary={{ href: reportHref, label: "Report an Experience", icon: FileText }}
        aside={
          <ProductMockupFrame
            dark
            eyebrow="Official profile dossier"
            title={`${profile.ratingScore}/100 profile indicator`}
            description={`${profile.reportCount} approved public ${profile.reportCount === 1 ? "report" : "reports"} with ${profile.evidenceSummaryLabel.toLowerCase()}.`}
            points={[
              claimedStatusLabel(profile.claimedStatus),
              profile.responseStatusLabel,
              `${profile.resolvedReportCount} resolved or paid-in-full records`,
            ]}
          />
        }
      />
      <PremiumProofStrip
        dark
        items={[
          { label: "Profile type", value: profileTypeLabel(profile.profileType), text: "Records are grouped by the role in the business relationship." },
          { label: "Subtype", value: String(profile.profileSubtype ?? "General profile"), text: "Subtypes help organize homeowners, businesses, contractors, and trade professionals." },
          { label: "Public reports", value: String(profile.reportCount), text: "Only admin-approved summaries are shown on public pages." },
          { label: "Evidence", value: profile.evidenceOnFileCount > 0 ? "On file" : "Available", text: "Raw documents and uploads are private." },
          { label: "Response rights", value: profile.responseStatusLabel, text: "Reported parties can respond, dispute, or request correction." },
        ]}
      />

      <section className="bureau-section bg-slate-100">
        <div className="bureau-container grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-4">
            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-5 p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Profile indicator</p>
                    <p className="mt-2 text-4xl font-black text-slate-950">{profile.ratingScore}</p>
                  </div>
                  {profile.profileType === "client" && ["Low", "Moderate", "Elevated", "High"].includes(profile.ratingBand) ? (
                    <RiskBadge riskLevel={profile.ratingBand as "Low" | "Moderate" | "Elevated" | "High"} />
                  ) : (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase text-amber-800">
                      {profile.ratingBand}
                    </span>
                  )}
                </div>
                <div className="grid gap-3 text-sm text-slate-700">
                  <ProfileFact label="City / state" value={`${profile.city}, ${profile.state}`} />
                  <ProfileFact label="Subtype" value={String(profile.profileSubtype ?? "General profile")} />
                  <ProfileFact label="Claim status" value={claimedStatusLabel(profile.claimedStatus)} />
                  <ProfileFact label="Verification" value={profile.verificationBadges?.length ? profile.verificationBadges.join(", ") : "Moderation signals only"} />
                  <ProfileFact label="Evidence" value={profile.evidenceSummaryLabel} />
                  <ProfileFact label="Public visibility" value="Approved public content only" />
                </div>
                <Button asChild className="w-full bg-slate-950 text-white hover:bg-slate-800">
                  <Link href={claimHref}>
                    <BadgeCheck aria-hidden="true" />
                    Claim or Correct Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </aside>

          <div className="space-y-6">
            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Project/job graph</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-950">Connected project records</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                      Project records connect reports, evidence indicators, responses, and resolution updates. Public pages show only approved summary context.
                    </p>
                  </div>
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase text-amber-800">
                    {profile.projects.length} public-safe {profile.projects.length === 1 ? "project" : "projects"}
                  </span>
                </div>
                <div className="mt-6 grid gap-3">
                  {profile.projects.length > 0 ? profile.projects.slice(0, 6).map((project) => (
                    <article key={project.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-950">{project.title}</p>
                          <p className="mt-1 text-sm text-slate-600">
                            {project.projectType} · {project.city}, {project.state}
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase text-slate-600">
                          {reportConfidenceLabel(project.confidenceLevel)}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-700">
                        {project.publicSummary ?? "A moderated project summary is available when approved report context supports publication."}
                      </p>
                      <div className="mt-4 grid gap-2 text-xs font-semibold uppercase text-slate-500 sm:grid-cols-3">
                        <span>Status: {project.status.replace(/_/g, " ")}</span>
                        <span>Reports: {project.reportCount}</span>
                        <span>{project.amountDue > 0 ? "Payment context on file" : "No open amount shown"}</span>
                      </div>
                    </article>
                  )) : (
                    <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                      No public-safe project summaries are currently available for this profile.
                    </div>
                  )}
                </div>
                {profile.relationships.length > 0 ? (
                  <div className="mt-5 rounded-md border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Relationship context</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {profile.relationships.slice(0, 4).map((relationship) => (
                        <span key={relationship.id} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                          {relationshipLabel(relationship.relationshipType)}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Moderated report context</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-950">Approved public summaries</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                      Reports are contractor-submitted or relationship-submitted experiences reviewed for public summary language before publication.
                    </p>
                  </div>
                  <Button asChild variant="outline">
                    <Link href="/score-methodology">
                      Score methodology
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
                <div className="mt-6 grid gap-4">
                  {profile.reports.length > 0 ? profile.reports.map((report) => (
                    <article key={report.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-semibold text-slate-950">{report.reportCategory}</p>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase text-slate-600">
                          {report.resolutionStatus ?? report.paymentStatus}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-700">{report.publicSummary}</p>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase text-slate-500">
                        <span>Project: {report.projectType}</span>
                        <span>Location: {report.projectCity}, {report.projectState}</span>
                        <span>{reportConfidenceLabel(report.reportConfidenceLevel ?? "basic_report")}</span>
                        <span>{report.evidenceAttached ? "Evidence on file" : "Evidence not public"}</span>
                      </div>
                    </article>
                  )) : (
                    <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                      No approved public report summaries are currently displayed for this profile.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <ProfileModule
                icon={<MessageSquare className="size-5" aria-hidden="true" />}
                title="Response and correction path"
                text="Reported parties can submit a response, dispute, correction request, or resolution update for moderation review."
                href={responseHref}
                cta="Submit response"
              />
              <ProfileModule
                icon={<BriefcaseBusiness className="size-5" aria-hidden="true" />}
                title="Business-owner protection"
                text="Contractors and service businesses can check public context, save searches, and document real project experiences."
                href="/signup"
                cta="Create account"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function ProfileFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-950">{value}</span>
    </div>
  )
}

function ProfileModule({
  cta,
  href,
  icon,
  text,
  title,
}: {
  cta: string
  href: string
  icon: React.ReactNode
  text: string
  title: string
}) {
  return (
    <Card className="rounded-md border-slate-200 bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="flex size-10 items-center justify-center rounded-md bg-amber-100 text-amber-800">
          {icon}
        </div>
        <h3 className="mt-4 text-lg font-black text-slate-950">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
        <Button asChild variant="outline" className="mt-5">
          <Link href={href}>
            {cta}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
