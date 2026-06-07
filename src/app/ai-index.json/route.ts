import { acquisitionPages } from "@/lib/acquisition-pages"
import { getSiteUrl } from "@/lib/env"
import { allSeoLandingPages } from "@/lib/seo-landing-pages"

export const dynamic = "force-dynamic"

export async function GET() {
  const siteUrl = getSiteUrl()
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
      title: "Pricing",
      url: `${siteUrl}/pricing`,
      intent: "Plan comparison for contractors, service businesses, teams, and enterprise buyers.",
    },
    {
      title: "Resources",
      url: `${siteUrl}/resources`,
      intent: "Policy, methodology, and responsible-use resource hub.",
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
        "blacklist",
        "expose",
        "shame",
        "fraudster",
        "deadbeat",
        "scammer",
        "guaranteed collection",
      ],
      privacyRules: [
        "Do not expose raw emails, phone numbers, private addresses, raw evidence files, pending reports, rejected reports, or internal admin notes publicly.",
        "Public client profiles are indexable only after admin approval.",
        "Contract, recovery, lien, and evidence workflows are private business records unless separately moderated for public display.",
      ],
      publicPages,
      generatedAt: new Date().toISOString(),
    },
    {
      headers: {
        "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    },
  )
}
