import type { MetadataRoute } from "next"

import { getSiteUrl } from "@/lib/env"
import {
  getPublicBusinessProfilesService,
  getPublicClientProfilesService,
  getPublicEntityProfilesService,
} from "@/lib/repositories/client-bureau-service"
import { entityProfileHref } from "@/lib/entity-profiles"
import { getClientDirectory } from "@/lib/client-directory"
import { acquisitionPages } from "@/lib/acquisition-pages"
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
      url: `${siteUrl}/resources`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${siteUrl}/mobile-app`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.62,
    },
    {
      url: `${siteUrl}/clients`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${siteUrl}/businesses`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/claim-profile`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.56,
    },
    {
      url: `${siteUrl}/business-rating-methodology`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.55,
    },
    {
      url: `${siteUrl}/payment-recovery-service`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${siteUrl}/florida-lien-notice-service`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/florida-lien-filing-service`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    ...acquisitionPages.map((page) => ({
      url: `${siteUrl}${page.path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: page.kind === "guide" ? 0.66 : 0.72,
    })),
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

  const [profiles, businesses, entityProfiles] = await Promise.all([
    getPublicClientProfilesService(),
    getPublicBusinessProfilesService(),
    getPublicEntityProfilesService(),
  ])
  const clientRoutes = profiles.map((profile) => ({
    url: `${siteUrl}/client/${profile.publicSlug}`,
    lastModified: new Date(profile.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }))
  const businessRoutes = businesses.map((profile) => ({
    url: `${siteUrl}/business/${profile.publicSlug}`,
    lastModified: new Date(profile.lastUpdated),
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }))
  const entityRoutes = entityProfiles.map((profile) => ({
    url: `${siteUrl}${entityProfileHref(profile)}`,
    lastModified: new Date(profile.updatedAt),
    changeFrequency: "weekly" as const,
    priority: profile.profileType === "client" ? 0.9 : 0.76,
  }))
  const landingRoutes = allSeoLandingPages.map((page) => ({
    url: `${siteUrl}${page.canonicalPath}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: page.kind === "clients" ? 0.75 : 0.7,
  }))
  const directory = getClientDirectory(profiles)
  const directoryRoutes = directory.flatMap((state) => [
    {
      url: `${siteUrl}/clients/${state.slug}`,
      lastModified: new Date(state.lastUpdated),
      changeFrequency: "weekly" as const,
      priority: 0.78,
    },
    ...state.cities.map((city) => ({
      url: `${siteUrl}/clients/${state.slug}/${city.slug}`,
      lastModified: new Date(city.lastUpdated),
      changeFrequency: "weekly" as const,
      priority: 0.76,
    })),
  ])

  return dedupeSitemapEntries([
    ...publicRoutes,
    ...landingRoutes,
    ...directoryRoutes,
    ...clientRoutes,
    ...businessRoutes,
    ...entityRoutes,
  ])
}

function dedupeSitemapEntries(entries: MetadataRoute.Sitemap) {
  const seen = new Set<string>()

  return entries.filter((entry) => {
    if (seen.has(entry.url)) return false
    seen.add(entry.url)

    return true
  })
}
