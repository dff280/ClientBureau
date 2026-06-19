import type { MetadataRoute } from "next"

import { getSiteUrl } from "@/lib/env"
import { robotsBlockedPathPrefixes } from "@/lib/seo-indexability"

const siteUrl = getSiteUrl()

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/client/",
        "/clients",
        "/clients/",
        "/reports/",
        "/industries/",
        "/business/",
        "/businesses",
        "/profiles",
        "/profiles/",
        "/pricing",
        "/about",
        "/contact",
        "/enterprise",
        "/how-it-works",
        "/claim-profile",
        "/client-response",
        "/forgot-password",
        "/search",
        "/login",
        "/reset-password",
        "/signup",
        "/submit-report",
        "/terms",
        "/privacy",
        "/report-policy",
        "/dispute-policy",
        "/moderation-policy",
        "/score-methodology",
        "/llms.txt",
        "/ai-index.json",
        "/.well-known/security.txt",
        "/payment-recovery-service",
        "/florida-lien-notice-service",
        "/florida-lien-filing-service",
        "/contractor-contract-template",
        "/florida-contractor-agreement-template",
        "/change-order-template",
        "/homeowner-wont-pay-contractor",
        "/client-screening-for-contractors",
      ],
      disallow: [...robotsBlockedPathPrefixes],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
