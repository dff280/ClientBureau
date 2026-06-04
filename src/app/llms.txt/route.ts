import { getSiteUrl } from "@/lib/env"
import {
  getPublicBusinessProfilesService,
  getPublicClientProfilesService,
} from "@/lib/repositories/client-bureau-service"
import { allSeoLandingPages } from "@/lib/seo-landing-pages"

export const dynamic = "force-dynamic"

export async function GET() {
  const siteUrl = getSiteUrl()
  const [profiles, businesses] = await Promise.all([
    getPublicClientProfilesService(),
    getPublicBusinessProfilesService(),
  ])
  const profileLinks = profiles
    .filter((profile) => profile.isPublic)
    .slice(0, 5)
    .map((profile) => `- [${profile.firstName} ${profile.lastName} client profile](${siteUrl}/client/${profile.publicSlug})`)
    .join("\n")
  const businessLinks = businesses
    .slice(0, 5)
    .map((profile) => `- [${profile.businessName} business profile](${siteUrl}/business/${profile.publicSlug})`)
    .join("\n")
  const landingLinks = allSeoLandingPages
    .map((page) => `- [${page.title}](${siteUrl}${page.canonicalPath})`)
    .join("\n")

  const body = `# Client Bureau

Client Bureau is a moderated client-risk intelligence platform for contractors. Contractors use it to search client profiles, review approved contractor-submitted report summaries, submit documented reports, and understand client response or dispute context before accepting work.

## Key Pages

- [Home](${siteUrl}/)
- [Pricing](${siteUrl}/pricing)
- [How It Works](${siteUrl}/how-it-works)
- [Resources](${siteUrl}/resources)
- [About Client Bureau](${siteUrl}/about)
- [Contact Client Bureau](${siteUrl}/contact)
- [Enterprise](${siteUrl}/enterprise)
- [Score Methodology](${siteUrl}/score-methodology)
- [Business Profiles](${siteUrl}/businesses)
- [Business Rating Methodology](${siteUrl}/business-rating-methodology)
- [Report Policy](${siteUrl}/report-policy)
- [Dispute and Response Policy](${siteUrl}/dispute-policy)
- [Content Moderation Policy](${siteUrl}/moderation-policy)
- [Privacy Policy](${siteUrl}/privacy)
- [Terms of Service](${siteUrl}/terms)

## Public Landing Pages

${landingLinks}

## Public Client Profile Examples

${profileLinks || "- Public client profiles are listed in the sitemap after admin approval."}

## Public Business Profile Examples

${businessLinks || "- Public business profiles are listed in the sitemap when business profiles are available."}

## Content Standard

Public Client Bureau pages use careful language: documented contractor experiences, moderated summaries, evidence reviewed privately, private matching, client response, dispute context, business verification, and reported payment risk. Public pages should not display private phone numbers, emails, street addresses, raw evidence files, internal admin notes, or unapproved submissions.
`

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  })
}
