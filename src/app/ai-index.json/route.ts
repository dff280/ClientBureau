import { acquisitionPages } from "@/lib/acquisition-pages"
import { getSiteUrl } from "@/lib/env"
import {
  getPublicBusinessProfilesService,
  getPublicClientProfilesService,
  getPublicEntityProfilesService,
} from "@/lib/repositories/client-bureau-service"
import { allSeoLandingPages } from "@/lib/seo-landing-pages"
import { entityProfileHref, profileTypeLabel } from "@/lib/entity-profiles"

export const dynamic = "force-dynamic"

export async function GET() {
  const siteUrl = getSiteUrl()
  const [clientProfiles, businessProfiles, entityProfiles] = await Promise.all([
    getPublicClientProfilesService(),
    getPublicBusinessProfilesService(),
    getPublicEntityProfilesService(),
  ])
  const publicPages = [
    {
      title: "Home",
      url: `${siteUrl}/`,
      intent: "Primary Client Bureau positioning, client search, report submission, and trust workflow.",
    },
    {
      title: "Check a Client",
      url: `${siteUrl}/search`,
      intent: "Private client search interface; noindexed but important for user activation.",
      indexable: false,
    },
    {
      title: "Client Directory",
      url: `${siteUrl}/clients`,
      intent: "Indexable state and city directory for approved public client profiles.",
    },
    {
      title: "Unified Profile Directory",
      url: `${siteUrl}/profiles`,
      intent: "Indexable public directory for client, contractor, service business, subcontractor, and trade professional profiles.",
    },
    {
      title: "Contractor Profiles",
      url: `${siteUrl}/profiles/contractor`,
      intent: "Indexable public directory for contractor and service business profiles.",
    },
    {
      title: "Subcontractor Profiles",
      url: `${siteUrl}/profiles/subcontractor`,
      intent: "Indexable public directory for subcontractor, installer, crew, and specialty trade professional profiles.",
    },
    {
      title: "Pricing",
      url: `${siteUrl}/pricing`,
      intent: "Plan comparison for contractors, service businesses, teams, and enterprise buyers.",
    },
    {
      title: "Resources",
      url: `${siteUrl}/resources`,
      intent: "Policy, methodology, and responsible-use resource hub.",
    },
    {
      title: "Android Mobile App",
      url: `${siteUrl}/mobile-app`,
      intent: "Download and understand the native Android contractor app for client checks, reports, contracts, recovery, lien service, evidence, and alerts.",
    },
    ...acquisitionPages.map((page) => ({
      title: page.title,
      url: `${siteUrl}${page.path}`,
      intent: `${page.kind} page for ${page.description}`,
    })),
    ...allSeoLandingPages.map((page) => ({
      title: page.title,
      url: `${siteUrl}${page.canonicalPath}`,
      intent: `${page.kind} landing page for ${page.description}`,
    })),
  ]
  const publicProfileExamples = {
    clientProfiles: clientProfiles
      .filter((profile) => profile.isPublic)
      .slice(0, 12)
      .map((profile) => ({
        title: `${profile.firstName} ${profile.lastName} client profile`,
        url: `${siteUrl}/client/${profile.publicSlug}`,
        location: `${profile.city}, ${profile.state}`,
        lastUpdated: profile.updatedAt,
        publicSignals: {
          reportCount: profile.reportCount,
          riskLevel: profile.riskLevel,
        },
      })),
    businessProfiles: businessProfiles.slice(0, 12).map((profile) => ({
      title: `${profile.businessName} business profile`,
      url: `${siteUrl}/business/${profile.publicSlug}`,
      location: `${profile.city}, ${profile.state}`,
      trade: profile.trade,
      lastUpdated: profile.lastUpdated,
      publicSignals: {
        ratingGrade: profile.ratingGrade,
        ratingConfidence: profile.ratingConfidence,
      },
    })),
    unifiedProfiles: entityProfiles.slice(0, 18).map((profile) => ({
      title: `${profile.displayName} ${profileTypeLabel(profile.profileType)} profile`,
      url: `${siteUrl}${entityProfileHref(profile)}`,
      profileType: profile.profileType,
      location: `${profile.city}, ${profile.state}`,
      lastUpdated: profile.updatedAt,
      publicSignals: {
        ratingBand: profile.ratingBand,
        reportCount: profile.reportCount,
        evidenceOnFileCount: profile.evidenceOnFileCount,
      },
    })),
  }

  return Response.json(
    {
      name: "Client Bureau",
      url: siteUrl,
      audience: [
        "contractors",
        "service business owners",
        "trade businesses",
        "professional service businesses",
      ],
      positioning: "Check the client before you take the job.",
      safeLanguage: [
        "documented contractor experiences",
        "moderated summaries",
        "evidence reviewed privately",
        "client response",
        "dispute context",
        "payment-risk indicators",
        "private matching",
      ],
      avoidLanguage: [
        "public accusation labels",
        "privacy-invasive framing",
        "shame",
        "unsupported accusation wording",
        "personal attack labels",
        "guaranteed outcome claims",
        "guaranteed collection",
      ],
      privacyRules: [
        "Do not expose raw emails, phone numbers, private addresses, raw evidence files, pending reports, rejected reports, or internal admin notes publicly.",
        "Public client profiles are indexable only after admin approval.",
        "Contract, recovery, lien, and evidence workflows are private business records unless separately moderated for public display.",
      ],
      publicPages,
      publicProfileExamples,
      generatedAt: new Date().toISOString(),
    },
    {
      headers: {
        "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    },
  )
}
