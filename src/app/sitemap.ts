import type { MetadataRoute } from "next"

import { getSiteUrl } from "@/lib/env"
import {
  getPublicBusinessProfilesService,
  getPublicClientProfilesService,
  getPublicEntityProfilesService,
} from "@/lib/repositories/client-bureau-service"
import { entityProfileHrefs } from "@/lib/entity-profiles"
import { getClientDirectory } from "@/lib/client-directory"
import { acquisitionPages } from "@/lib/acquisition-pages"
import { allSeoLandingPages } from "@/lib/seo-landing-pages"
import { getReleaseLastModified } from "@/lib/release"
import { profileTypes } from "@/lib/types"

const siteUrl = getSiteUrl()

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const releaseLastModified = getReleaseLastModified()
  const publicRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: releaseLastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/platform`,
      lastModified: releaseLastModified,
      changeFrequency: "monthly",
      priority: 0.78,
    },
    {
      url: `${siteUrl}/pricing`,
      lastModified: releaseLastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/resources`,
      lastModified: releaseLastModified,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${siteUrl}/mobile-app`,
      lastModified: releaseLastModified,
      changeFrequency: "monthly",
      priority: 0.62,
    },
    {
      url: `${siteUrl}/clients`,
      lastModified: releaseLastModified,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${siteUrl}/businesses`,
      lastModified: releaseLastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/profiles`,
      lastModified: releaseLastModified,
      changeFrequency: "weekly",
      priority: 0.74,
    },
    ...profileTypes.map((profileType) => ({
      url: `${siteUrl}/profiles/${profileType}`,
      lastModified: releaseLastModified,
      changeFrequency: "weekly" as const,
      priority: profileType === "client" ? 0.72 : 0.7,
    })),
    {
      url: `${siteUrl}/claim-profile`,
      lastModified: releaseLastModified,
      changeFrequency: "monthly",
      priority: 0.56,
    },
    {
      url: `${siteUrl}/business-rating-methodology`,
      lastModified: releaseLastModified,
      changeFrequency: "monthly",
      priority: 0.55,
    },
    {
      url: `${siteUrl}/payment-recovery-service`,
      lastModified: releaseLastModified,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${siteUrl}/florida-lien-notice-service`,
      lastModified: releaseLastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/florida-lien-filing-service`,
      lastModified: releaseLastModified,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    ...acquisitionPages.map((page) => ({
      url: `${siteUrl}${page.path}`,
      lastModified: releaseLastModified,
      changeFrequency: "monthly" as const,
      priority: page.kind === "guide" ? 0.66 : 0.72,
    })),
    {
      url: `${siteUrl}/about`,
      lastModified: releaseLastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: releaseLastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/enterprise`,
      lastModified: releaseLastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/how-it-works`,
      lastModified: releaseLastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: releaseLastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: releaseLastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/report-policy`,
      lastModified: releaseLastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/dispute-policy`,
      lastModified: releaseLastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/moderation-policy`,
      lastModified: releaseLastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/score-methodology`,
      lastModified: releaseLastModified,
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
  const entityRoutes = entityProfiles.flatMap((profile) =>
    entityProfileHrefs(profile).map((href) => ({
      url: `${siteUrl}${href}`,
      lastModified: new Date(profile.updatedAt),
      changeFrequency: "weekly" as const,
      priority: href.startsWith("/profiles/client") ? 0.9 : 0.76,
    })),
  )
  const landingRoutes = allSeoLandingPages.map((page) => ({
    url: `${siteUrl}${page.canonicalPath}`,
    lastModified: releaseLastModified,
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
