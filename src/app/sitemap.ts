import type { MetadataRoute } from "next"

import { getSiteUrl } from "@/lib/env"
import { getPublicClientProfilesService } from "@/lib/repositories/client-bureau-service"
import { allSeoLandingPages } from "@/lib/seo-landing-pages"

const siteUrl = getSiteUrl()

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const publicRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/pricing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/enterprise`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/how-it-works`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/report-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/dispute-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/moderation-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/score-methodology`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]

  const profiles = await getPublicClientProfilesService()
  const clientRoutes = profiles.map((profile) => ({
    url: `${siteUrl}/client/${profile.publicSlug}`,
    lastModified: new Date(profile.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }))
  const landingRoutes = allSeoLandingPages.map((page) => ({
    url: `${siteUrl}${page.canonicalPath}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: page.kind === "clients" ? 0.75 : 0.7,
  }))

  return [...publicRoutes, ...landingRoutes, ...clientRoutes]
}
