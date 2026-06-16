import { acquisitionPages } from "@/lib/acquisition-pages"
import { getClientDirectory } from "@/lib/client-directory"
import { getSiteUrl } from "@/lib/env"
import {
  getPublicBusinessProfilesService,
  getPublicClientProfilesService,
  getPublicEntityProfilesService,
} from "@/lib/repositories/client-bureau-service"
import { allSeoLandingPages, seoLandingCanonicalPath } from "@/lib/seo-landing-pages"
import { entityProfileHref, entityProfileHrefs, profileSupportsType, profileTypeForView, profileTypeLabel } from "@/lib/entity-profiles"

export const dynamic = "force-dynamic"

export async function GET() {
  const siteUrl = getSiteUrl()
  const [clientProfiles, businessProfiles, entityProfiles] = await Promise.all([
    getPublicClientProfilesService(),
    getPublicBusinessProfilesService(),
    getPublicEntityProfilesService(),
  ])
  const clientDirectory = getClientDirectory(clientProfiles)
  const contractorProfileHrefBySlug = new Map(
    entityProfiles
      .filter((profile) => profileSupportsType(profile, "contractor"))
      .map((profile) => [profile.slug, entityProfileHref(profile, "contractor")]),
  )
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
      title: "Platform Overview",
      url: `${siteUrl}/platform`,
      intent: "Core product overview for Client Bureau's client checks, public profiles, contracts, evidence, recovery, lien service, and mobile workflows.",
    },
    {
      title: "Client Database",
      url: `${siteUrl}/clients`,
      intent: "Indexable state and city database for approved public client, homeowner, customer, property owner, and business profiles.",
    },
    {
      title: "All Public Databases",
      url: `${siteUrl}/profiles`,
      intent: "Indexable public profile graph across Client Database, Contractor Database, and Subcontractor Database records.",
    },
    {
      title: "Contractor Database",
      url: `${siteUrl}/profiles/contractor`,
      intent: "Indexable public database for contractor and service business profiles.",
    },
    {
      title: "Subcontractor Database",
      url: `${siteUrl}/profiles/subcontractor`,
      intent: "Indexable public database for subcontractor, installer, crew, vendor, and specialty trade professional profiles.",
    },
    {
      title: "Industries and Trades",
      url: `${siteUrl}/industries`,
      intent: "Indexable hub for contractors, subcontractors, service businesses, and high-demand trade pages.",
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
    ...dedupeByUrl(allSeoLandingPages.map((page) => ({
      title: page.title,
      url: `${siteUrl}${seoLandingCanonicalPath(page, clientDirectory)}`,
      intent: `${page.kind} landing page for ${page.description}`,
    }))),
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
      url: `${siteUrl}${contractorProfileHrefBySlug.get(profile.publicSlug) ?? `/business/${profile.publicSlug}`}`,
      location: `${profile.city}, ${profile.state}`,
      trade: profile.trade,
      lastUpdated: profile.lastUpdated,
      publicSignals: {
        ratingGrade: profile.ratingGrade,
        ratingConfidence: profile.ratingConfidence,
      },
    })),
    unifiedProfiles: entityProfiles
      .flatMap((profile) =>
        entityProfileHrefs(profile).map((href) => {
          const profileType = profileTypeForView(
            profile,
            href.includes("/profiles/subcontractor/") ? "subcontractor" : href.includes("/profiles/client/") ? "client" : "contractor",
          )

          return {
            title: `${profile.displayName} ${profileTypeLabel(profileType)} profile`,
            url: `${siteUrl}${href}`,
            profileType,
            location: `${profile.city}, ${profile.state}`,
            lastUpdated: profile.updatedAt,
            publicSignals: {
              ratingBand: profile.ratingBand,
              reportCount: profile.reportCount,
              evidenceOnFileCount: profile.evidenceOnFileCount,
            },
          }
        }),
      )
      .slice(0, 18),
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
      positioning: "Check the client before you take the job. Client Bureau is organized around Client, Contractor, and Subcontractor databases.",
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

function dedupeByUrl<T extends { url: string }>(items: T[]) {
  const seen = new Set<string>()

  return items.filter((item) => {
    if (seen.has(item.url)) return false
    seen.add(item.url)

    return true
  })
}
