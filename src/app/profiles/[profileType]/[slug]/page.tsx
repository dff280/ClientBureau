import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import type React from "react"
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  FileText,
  Handshake,
  MessageSquare,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react"

import { PremiumHero, PremiumProofStrip, ProductMockupFrame } from "@/components/marketing/premium-page-shell"
import { RiskBadge } from "@/components/client/risk-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { JsonLd } from "@/lib/seo"
import { getSiteUrl } from "@/lib/env"
import { claimedStatusLabel, profileTypeLabel, profileTypePluralLabel, reportConfidenceLabel, relationshipLabel } from "@/lib/entity-profiles"
import { getPublicEntityProfileService } from "@/lib/repositories/client-bureau-service"
import { profileTypes, type BusinessRatingFactor, type ProfileType } from "@/lib/types"

type EntityProfilePageProps = {
  params: Promise<{
    profileType: string
    slug: string
  }>
}

function toProfileType(value: string): ProfileType | undefined {
  return profileTypes.includes(value as ProfileType) ? (value as ProfileType) : undefined
}

type EntityProfilePresentation = {
  heroDescription: string
  dossierEyebrow: string
  scoreLabel: string
  scoreCaption: string
  proofTypeText: string
  proofSubtypeText: string
  proofReportsText: string
  proofEvidenceText: string
  profileVisibilityText: string
  verificationFallback: string
  claimCta: string
  insightEyebrow: string
  insightTitle: string
  insightDescription: string
  insightCards: Array<{
    icon: LucideIcon
    title: string
    text: string
  }>
  projectEyebrow: string
  projectTitle: string
  projectDescription: string
  relationshipEyebrow: string
  reportEyebrow: string
  reportTitle: string
  reportDescription: string
  responseTitle: string
  responseText: string
  accountTitle: string
  accountText: string
  accountCta: string
  methodologyTitle: string
  methodologyDescription: string
  accent: {
    icon: string
    panel: string
    badge: string
    text: string
  }
}

function getEntityProfilePresentation(profileType: ProfileType): EntityProfilePresentation {
  if (profileType === "contractor") {
    return {
      heroDescription:
        "This contractor and service-business profile shows approved public business context: verification signals, service-area records, public project history, response indicators, and claim/correction paths. Private identifiers and raw files stay sealed.",
      dossierEyebrow: "Business trust dossier",
      scoreLabel: "Business reliability rating",
      scoreCaption: "A public-safe business signal based on verification, project history, documentation, and moderation status.",
      proofTypeText: "Contractor records are grouped around customer-facing business activity and project responsibility.",
      proofSubtypeText: "Subtypes help distinguish general contractors, service businesses, specialty contractors, agencies, and property-service companies.",
      proofReportsText: "Approved public summaries show documented business/project context only.",
      proofEvidenceText: "Evidence indicators can support project context without publishing raw files.",
      profileVisibilityText: "Business trust profile",
      verificationFallback: "Business moderation signals only",
      claimCta: "Claim or Verify Business Profile",
      insightEyebrow: "Business readiness",
      insightTitle: "Contractor profiles focus on public business trust.",
      insightDescription:
        "A contractor profile should quickly answer whether this is a claimed, documented, customer-facing business with public project context and a path to correct the record.",
      insightCards: [
        {
          icon: Building2,
          title: "Business identity",
          text: "Shows business name, service area, subtype, claim status, and public verification signals when available.",
        },
        {
          icon: ClipboardCheck,
          title: "Project oversight",
          text: "Frames approved records around project history, client-facing documentation, and moderated summaries.",
        },
        {
          icon: ShieldCheck,
          title: "Correction rights",
          text: "Keeps profile claiming, correction, and response paths visible without exposing private contact data.",
        },
      ],
      projectEyebrow: "Business project graph",
      projectTitle: "Public project and service records",
      projectDescription:
        "Contractor project records connect approved summaries, evidence indicators, service locations, and resolution updates. Private files and internal notes are not shown.",
      relationshipEyebrow: "Business relationship context",
      reportEyebrow: "Business report context",
      reportTitle: "Approved contractor-profile summaries",
      reportDescription:
        "Published summaries are moderated for business-profile context, client-facing project history, and response/correction fairness.",
      responseTitle: "Response and correction path",
      responseText:
        "A contractor or service business can submit a response, dispute, correction request, or resolution update for moderation review.",
      accountTitle: "Protect your contractor record",
      accountText:
        "Claim your profile, monitor public context, document client experiences, organize evidence, and keep your business record accurate.",
      accountCta: "Create account",
      methodologyTitle: "Business Reliability Rating",
      methodologyDescription:
        "Contractor ratings weigh business identity, client-facing project history, contracts, private evidence, payment resolution posture, and account readiness.",
      accent: {
        icon: "bg-emerald-100 text-emerald-800",
        panel: "border-emerald-200 bg-emerald-50/70",
        badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
        text: "text-emerald-700",
      },
    }
  }

  if (profileType === "subcontractor") {
    return {
      heroDescription:
        "This subcontractor and trade-professional profile shows approved public trade context: specialty scope, GC/sub relationship signals, documentation readiness, payment-chain indicators, and claim/correction paths. Private identifiers and raw files stay sealed.",
      dossierEyebrow: "Trade partner dossier",
      scoreLabel: "Trade partner rating",
      scoreCaption: "A public-safe trade signal based on scope, GC/sub relationships, payment-chain context, and evidence readiness.",
      proofTypeText: "Subcontractor records are grouped around specialty work, crew roles, and contractor-to-subcontractor relationships.",
      proofSubtypeText: "Subtypes help distinguish installers, crews, labor providers, licensed subcontractors, and specialty trades.",
      proofReportsText: "Approved public summaries show documented trade and payment-chain context only.",
      proofEvidenceText: "Evidence indicators can support scope, completion, retainage, or payment-chain context without publishing raw files.",
      profileVisibilityText: "Trade partner profile",
      verificationFallback: "Trade moderation signals only",
      claimCta: "Claim or Verify Trade Profile",
      insightEyebrow: "Trade readiness",
      insightTitle: "Subcontractor profiles focus on scope, relationships, and payment-chain context.",
      insightDescription:
        "A subcontractor profile should quickly answer what trade role existed, whether the relationship was GC/sub or business-to-business, and what documentation is on file.",
      insightCards: [
        {
          icon: Wrench,
          title: "Trade specialization",
          text: "Shows specialty trade, crew, installer, labor-provider, or licensed-subcontractor context.",
        },
        {
          icon: Handshake,
          title: "GC/sub relationship",
          text: "Separates subcontractor-to-contractor and contractor-to-subcontractor records from direct client jobs.",
        },
        {
          icon: ClipboardCheck,
          title: "Payment-chain records",
          text: "Highlights scope documentation, retainage/payment indicators, evidence status, and resolution context.",
        },
      ],
      projectEyebrow: "Trade project graph",
      projectTitle: "Scope, crew, and payment-chain records",
      projectDescription:
        "Subcontractor project records connect trade scope, business-to-business relationships, evidence indicators, and payment/resolution context. Raw files stay private.",
      relationshipEyebrow: "GC/sub relationship context",
      reportEyebrow: "Trade report context",
      reportTitle: "Approved subcontractor-profile summaries",
      reportDescription:
        "Published summaries are moderated for trade scope, contractor/subcontractor relationship context, payment-chain issues, and response/correction fairness.",
      responseTitle: "Trade profile response path",
      responseText:
        "A subcontractor or trade professional can submit a response, dispute, correction request, or resolution update for moderation review.",
      accountTitle: "Protect your trade partner record",
      accountText:
        "Claim your profile, document GC/sub relationships, organize evidence, track payment-chain context, and keep your trade record accurate.",
      accountCta: "Create account",
      methodologyTitle: "Trade Partner Reliability Rating",
      methodologyDescription:
        "Subcontractor ratings weigh trade identity, scope documentation, GC/sub relationship history, payment-chain context, evidence readiness, and resolution posture.",
      accent: {
        icon: "bg-blue-100 text-blue-800",
        panel: "border-blue-200 bg-blue-50/70",
        badge: "border-blue-200 bg-blue-50 text-blue-800",
        text: "text-blue-700",
      },
    }
  }

  return {
    heroDescription:
      "This public profile shows approved Client Bureau context only: moderated summaries, response indicators, evidence-on-file labels, and public record status. Private identifiers and raw files stay sealed.",
    dossierEyebrow: "Official profile dossier",
    scoreLabel: "Profile indicator",
    scoreCaption: "A public-safe profile signal based on approved context and moderation status.",
    proofTypeText: "Records are grouped by the role in the business relationship.",
    proofSubtypeText: "Subtypes help organize homeowners, businesses, contractors, and trade professionals.",
    proofReportsText: "Only admin-approved summaries are shown on public pages.",
    proofEvidenceText: "Raw documents and uploads are private.",
    profileVisibilityText: "Approved public content only",
    verificationFallback: "Moderation signals only",
    claimCta: "Claim or Correct Profile",
    insightEyebrow: "Profile context",
    insightTitle: "Public profiles show approved context only.",
    insightDescription:
      "Client Bureau keeps public profile context focused on moderated summaries, response rights, and evidence indicators without publishing private identifiers.",
    insightCards: [
      {
        icon: ShieldCheck,
        title: "Moderated record",
        text: "Public pages display approved summaries and public-safe profile facts only.",
      },
      {
        icon: FileText,
        title: "Documented context",
        text: "Evidence indicators can support context without exposing raw uploads.",
      },
      {
        icon: MessageSquare,
        title: "Response rights",
        text: "Reported parties can respond, dispute, correct, or update profile context.",
      },
    ],
    projectEyebrow: "Project/job graph",
    projectTitle: "Connected project records",
    projectDescription:
      "Project records connect reports, evidence indicators, responses, and resolution updates. Public pages show only approved summary context.",
    relationshipEyebrow: "Relationship context",
    reportEyebrow: "Moderated report context",
    reportTitle: "Approved public summaries",
    reportDescription:
      "Reports are contractor-submitted or relationship-submitted experiences reviewed for public summary language before publication.",
    responseTitle: "Response and correction path",
    responseText:
      "Reported parties can submit a response, dispute, correction request, or resolution update for moderation review.",
    accountTitle: "Business-owner protection",
    accountText:
      "Contractors and service businesses can check public context, save searches, and document real project experiences.",
    accountCta: "Create account",
    methodologyTitle: "Profile Rating Context",
    methodologyDescription:
      "Public profile scores use approved, moderated context only. Private identifiers and raw evidence are not published.",
    accent: {
      icon: "bg-amber-100 text-amber-800",
      panel: "border-amber-200 bg-amber-50/70",
      badge: "border-amber-200 bg-amber-50 text-amber-800",
      text: "text-amber-700",
    },
  }
}

export async function generateMetadata({ params }: EntityProfilePageProps): Promise<Metadata> {
  const { profileType: rawProfileType, slug } = await params
  const profileType = toProfileType(rawProfileType)
  if (!profileType) return {}

  const profile = await getPublicEntityProfileService(profileType, slug)
  if (!profile) return {}

  const title = `${profile.displayName} ${profile.city}, ${profile.state} | Client Bureau ${profileTypeLabel(profile.profileType)} Profile`
  const description =
    profile.profileType === "contractor"
      ? `Public contractor and service-business profile for ${profile.displayName} in ${profile.city}, ${profile.state}: verification, project context, and response paths.`
      : profile.profileType === "subcontractor"
        ? `Public subcontractor and trade-professional profile for ${profile.displayName} in ${profile.city}, ${profile.state}: trade scope, relationship context, and evidence indicators.`
        : `Moderated Client Bureau profile for ${profile.displayName} in ${profile.city}, ${profile.state}: documented experiences, response context, and private evidence indicators.`

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
  const presentation = getEntityProfilePresentation(profile.profileType)
  const ratingFactors = profile.relatedContractor?.ratingFactors ?? profile.ratingFactors ?? []
  const ratingSummary = profile.relatedContractor?.ratingSummary ?? profile.ratingPublicNote ?? presentation.methodologyDescription
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
          { "@type": "ListItem", position: 2, name: profileTypePluralLabel(profile.profileType), item: `${siteUrl}/profiles/${profile.profileType}` },
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
        description={presentation.heroDescription}
        primary={{ href: "/search", label: "Check Another Profile", icon: ShieldCheck }}
        secondary={{ href: reportHref, label: "Report an Experience", icon: FileText }}
        aside={
          <ProductMockupFrame
            dark
            eyebrow={presentation.dossierEyebrow}
            title={`${profile.ratingScore}/100 ${presentation.scoreLabel.toLowerCase()}`}
            description={`${profile.reportCount} approved public ${profile.reportCount === 1 ? "report" : "reports"} with ${profile.evidenceSummaryLabel.toLowerCase()}. ${presentation.scoreCaption}`}
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
          { label: "Profile type", value: profileTypeLabel(profile.profileType), text: presentation.proofTypeText },
          { label: "Subtype", value: String(profile.profileSubtype ?? "General profile"), text: presentation.proofSubtypeText },
          { label: "Public reports", value: String(profile.reportCount), text: presentation.proofReportsText },
          { label: "Evidence", value: profile.evidenceOnFileCount > 0 ? "On file" : "Available", text: presentation.proofEvidenceText },
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
                    <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${presentation.accent.text}`}>
                      {presentation.scoreLabel}
                    </p>
                    <p className="mt-2 text-4xl font-black text-slate-950">{profile.ratingScore}</p>
                  </div>
                  {profile.profileType === "client" && ["Low", "Moderate", "Elevated", "High"].includes(profile.ratingBand) ? (
                    <RiskBadge riskLevel={profile.ratingBand as "Low" | "Moderate" | "Elevated" | "High"} />
                  ) : (
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${presentation.accent.badge}`}>
                      {profile.ratingBand}
                    </span>
                  )}
                </div>
                <div className="grid gap-3 text-sm text-slate-700">
                  <ProfileFact label="City / state" value={`${profile.city}, ${profile.state}`} />
                  <ProfileFact label="Subtype" value={String(profile.profileSubtype ?? "General profile")} />
                  <ProfileFact label="Claim status" value={claimedStatusLabel(profile.claimedStatus)} />
                  <ProfileFact label="Verification" value={profile.verificationBadges?.length ? profile.verificationBadges.join(", ") : presentation.verificationFallback} />
                  <ProfileFact label="Evidence" value={profile.evidenceSummaryLabel} />
                  <ProfileFact label="Public visibility" value={presentation.profileVisibilityText} />
                </div>
                <Button asChild className="w-full bg-slate-950 text-white hover:bg-slate-800">
                  <Link href={claimHref}>
                    <BadgeCheck aria-hidden="true" />
                    {presentation.claimCta}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </aside>

          <div className="space-y-6">
            {profile.profileType === "contractor" || profile.profileType === "subcontractor" ? (
              <RatingMethodPanel
                accentText={presentation.accent.text}
                factors={ratingFactors}
                score={profile.ratingScore}
                summary={ratingSummary}
                title={presentation.methodologyTitle}
              />
            ) : null}

            <Card className={`rounded-md shadow-sm ${presentation.accent.panel}`}>
              <CardContent className="p-6">
                <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${presentation.accent.text}`}>
                  {presentation.insightEyebrow}
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">{presentation.insightTitle}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{presentation.insightDescription}</p>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {presentation.insightCards.map((item) => {
                    const Icon = item.icon

                    return (
                      <div key={item.title} className="rounded-md border border-white/70 bg-white/75 p-4 shadow-sm">
                        <span className={`flex size-10 items-center justify-center rounded-md ${presentation.accent.icon}`}>
                          <Icon className="size-5" aria-hidden="true" />
                        </span>
                        <h3 className="mt-3 font-semibold text-slate-950">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{presentation.projectEyebrow}</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-950">{presentation.projectTitle}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                      {presentation.projectDescription}
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
                            {project.projectType} - {project.city}, {project.state}
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
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{presentation.relationshipEyebrow}</p>
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
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{presentation.reportEyebrow}</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-950">{presentation.reportTitle}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                      {presentation.reportDescription}
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
                title={presentation.responseTitle}
                text={presentation.responseText}
                href={responseHref}
                cta="Submit response"
                iconClassName={presentation.accent.icon}
              />
              <ProfileModule
                icon={<BriefcaseBusiness className="size-5" aria-hidden="true" />}
                title={presentation.accountTitle}
                text={presentation.accountText}
                href="/signup"
                cta={presentation.accountCta}
                iconClassName={presentation.accent.icon}
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

function RatingMethodPanel({
  accentText,
  factors,
  score,
  summary,
  title,
}: {
  accentText: string
  factors: BusinessRatingFactor[]
  score: number
  summary: string
  title: string
}) {
  const visibleFactors = factors.length > 0
    ? factors
    : [
        {
          label: "Verification and identity",
          score: Math.min(score, 24),
          maxScore: 24,
          status: "good" as const,
          description: "Uses public-safe verification and profile completeness signals.",
        },
        {
          label: "Approved public context",
          score: Math.min(Math.max(score - 24, 0), 26),
          maxScore: 26,
          status: "good" as const,
          description: "Uses approved reports, project context, and public-safe summaries.",
        },
        {
          label: "Evidence and response posture",
          score: Math.min(Math.max(score - 50, 0), 25),
          maxScore: 25,
          status: "good" as const,
          description: "Uses evidence indicators, response paths, and correction rights.",
        },
        {
          label: "Resolution context",
          score: Math.min(Math.max(score - 75, 0), 25),
          maxScore: 25,
          status: "good" as const,
          description: "Uses dispute, resolution, and payment-context indicators when available.",
        },
      ]

  return (
    <Card className="rounded-md border-slate-200 bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${accentText}`}>Rating algorithm</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">{title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{summary}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Current score</p>
            <p className="mt-1 text-3xl font-black text-slate-950">{score}/100</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4">
          {visibleFactors.map((item) => (
            <div key={item.label} className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-950">{item.label}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase text-slate-600">
                  {item.score}/{item.maxScore}
                </span>
              </div>
              <Progress value={(item.score / item.maxScore) * 100} className="mt-4" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ProfileModule({
  cta,
  href,
  icon,
  iconClassName = "bg-amber-100 text-amber-800",
  text,
  title,
}: {
  cta: string
  href: string
  icon: React.ReactNode
  iconClassName?: string
  text: string
  title: string
}) {
  return (
    <Card className="rounded-md border-slate-200 bg-white shadow-sm">
      <CardContent className="p-6">
        <div className={`flex size-10 items-center justify-center rounded-md ${iconClassName}`}>
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
