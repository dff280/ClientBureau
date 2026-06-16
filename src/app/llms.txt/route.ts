import { getSiteUrl } from "@/lib/env"
import { acquisitionPages } from "@/lib/acquisition-pages"
import {
  getPublicBusinessProfilesService,
  getPublicClientProfilesService,
  getPublicEntityProfilesService,
} from "@/lib/repositories/client-bureau-service"
import { getClientDirectory } from "@/lib/client-directory"
import { entityProfileHref, entityProfileHrefs, profileSupportsType, profileTypeForView, profileTypeLabel } from "@/lib/entity-profiles"
import { allSeoLandingPages, seoLandingCanonicalPath } from "@/lib/seo-landing-pages"

export const dynamic = "force-dynamic"

export async function GET() {
  const siteUrl = getSiteUrl()
  const [profiles, businesses, entityProfiles] = await Promise.all([
    getPublicClientProfilesService(),
    getPublicBusinessProfilesService(),
    getPublicEntityProfilesService(),
  ])
  const directory = getClientDirectory(profiles)
  const contractorProfileHrefBySlug = new Map(
    entityProfiles
      .filter((profile) => profileSupportsType(profile, "contractor"))
      .map((profile) => [profile.slug, entityProfileHref(profile, "contractor")]),
  )
  const profileLinks = profiles
    .filter((profile) => profile.isPublic)
    .slice(0, 5)
    .map((profile) => `- [${profile.firstName} ${profile.lastName} client profile](${siteUrl}/client/${profile.publicSlug})`)
    .join("\n")
  const businessLinks = businesses
    .slice(0, 5)
    .map((profile) => `- [${profile.businessName} business profile](${siteUrl}${contractorProfileHrefBySlug.get(profile.publicSlug) ?? `/business/${profile.publicSlug}`})`)
    .join("\n")
  const entityLinks = entityProfiles
    .flatMap((profile) =>
      entityProfileHrefs(profile).map((href) => {
        const profileType = profileTypeForView(profile, href.includes("/profiles/subcontractor/") ? "subcontractor" : href.includes("/profiles/client/") ? "client" : "contractor")
        return `- [${profile.displayName} ${profileTypeLabel(profileType)} profile](${siteUrl}${href})`
      }),
    )
    .slice(0, 10)
    .join("\n")
  const directoryLinks = directory
    .flatMap((state) => [
      `- [${state.name} client profiles](${siteUrl}/clients/${state.slug})`,
      ...state.cities
        .slice(0, 5)
        .map((city) => `- [${city.name}, ${state.code} client profiles](${siteUrl}/clients/${state.slug}/${city.slug})`),
    ])
    .slice(0, 20)
    .join("\n")
  const landingLinks = allSeoLandingPages
    .map((page) => `- [${page.title}](${siteUrl}${seoLandingCanonicalPath(page, directory)})`)
    .filter((line, index, lines) => lines.indexOf(line) === index)
    .join("\n")
  const acquisitionLinks = acquisitionPages
    .map((page) => `- [${page.title}](${siteUrl}${page.path}) - ${page.description}`)
    .join("\n")

  const body = `# Client Bureau

Client Bureau is a moderated business-owner protection platform organized around three public databases: the Client Database, Contractor Database, and Subcontractor Database. Contractors and service businesses use it to search client profiles, inspect contractor and trade-partner context, submit documented reports, and understand response or dispute context before accepting work.

Core positioning: Check the client before you take the job.

## Key Pages

- [Home](${siteUrl}/)
- [Platform Overview](${siteUrl}/platform)
- [Pricing](${siteUrl}/pricing)
- [How It Works](${siteUrl}/how-it-works)
- [Resources](${siteUrl}/resources)
- [Android Mobile App](${siteUrl}/mobile-app)
- [Client Database](${siteUrl}/clients)
- [All Public Databases](${siteUrl}/profiles)
- [Contractor Database](${siteUrl}/profiles/contractor)
- [Subcontractor Database](${siteUrl}/profiles/subcontractor)
- [Industries and Trades](${siteUrl}/industries)
- [About Client Bureau](${siteUrl}/about)
- [Contact Client Bureau](${siteUrl}/contact)
- [Enterprise](${siteUrl}/enterprise)
- [Rating Methodology](${siteUrl}/score-methodology)
- [Business Profiles](${siteUrl}/businesses)
- [Business & Trade Rating Methodology](${siteUrl}/business-rating-methodology)
- [Payment Recovery Service](${siteUrl}/payment-recovery-service)
- [Florida Lien Notice Service](${siteUrl}/florida-lien-notice-service)
- [Florida Lien Filing Service](${siteUrl}/florida-lien-filing-service)
- [AI Index](${siteUrl}/ai-index.json)
- [Report Policy](${siteUrl}/report-policy)
- [Dispute and Response Policy](${siteUrl}/dispute-policy)
- [Content Moderation Policy](${siteUrl}/moderation-policy)
- [Privacy Policy](${siteUrl}/privacy)
- [Terms of Service](${siteUrl}/terms)

## Public Landing Pages

${landingLinks}

## High-Intent Contractor Acquisition Pages

${acquisitionLinks}

## Client Database Pages

${directoryLinks || "- State and city client directories are listed after approved public profiles are available."}

## Public Client Profile Examples

${profileLinks || "- Public client profiles are listed in the sitemap after admin approval."}

## Public Business Profile Examples

${businessLinks || "- Public business profiles are listed in the sitemap when business profiles are available."}

## Unified Public Profile Examples

${entityLinks || "- Unified client, contractor, and subcontractor profiles are listed after profiles become public."}

## Content Standard

Public Client Bureau pages use careful language: documented contractor and business-owner experiences, moderated summaries, evidence reviewed privately, private matching, client response, dispute context, business verification, and reported payment risk. Public pages should not display private phone numbers, emails, street addresses, raw evidence files, internal admin notes, or unapproved submissions.
`

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  })
}
