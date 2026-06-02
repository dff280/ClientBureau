import type { MetadataRoute } from "next"

import { getSiteUrl } from "@/lib/env"

const siteUrl = getSiteUrl()

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/client/",
        "/pricing",
        "/about",
        "/contact",
        "/enterprise",
        "/how-it-works",
        "/terms",
        "/privacy",
        "/report-policy",
        "/dispute-policy",
        "/moderation-policy",
        "/score-methodology",
        "/llms.txt",
      ],
      disallow: [
        "/dashboard",
        "/submit-report",
        "/client-response",
        "/login",
        "/signup",
        "/admin/",
        "/search",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
