import { getSiteUrl } from "@/lib/env"
import { getPublicClientProfilesService } from "@/lib/repositories/client-bureau-service"

export const dynamic = "force-dynamic"

export async function GET() {
  const siteUrl = getSiteUrl()
  const profiles = (await getPublicClientProfilesService()).filter((profile) => profile.isPublic).slice(0, 5)
  const profileLinks = profiles
    .map((profile) => `- [${profile.firstName} ${profile.lastName} client profile](${siteUrl}/client/${profile.publicSlug})`)
    .join("\n")

  const body = `# Client Bureau

Client Bureau is a moderated client-risk intelligence platform for contractors. Contractors use it to search client profiles, review approved contractor-submitted report summaries, submit documented reports, and understand client response or dispute context before accepting work.

## Key Pages

- [Home](${siteUrl}/)
- [Pricing](${siteUrl}/pricing)
- [How It Works](${siteUrl}/how-it-works)
- [About Client Bureau](${siteUrl}/about)
- [Contact Client Bureau](${siteUrl}/contact)
- [Enterprise](${siteUrl}/enterprise)
- [Score Methodology](${siteUrl}/score-methodology)
- [Report Policy](${siteUrl}/report-policy)
- [Dispute and Response Policy](${siteUrl}/dispute-policy)
- [Content Moderation Policy](${siteUrl}/moderation-policy)
- [Privacy Policy](${siteUrl}/privacy)
- [Terms of Service](${siteUrl}/terms)

## Public Client Profile Examples

${profileLinks || "- Public client profiles are listed in the sitemap after admin approval."}

## Content Standard

Public Client Bureau pages use careful language: documented contractor experiences, moderated summaries, evidence reviewed privately, private matching, client response, dispute context, and reported payment risk. Public pages should not display private phone numbers, emails, street addresses, raw evidence files, internal admin notes, or unapproved submissions.
`

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  })
}
