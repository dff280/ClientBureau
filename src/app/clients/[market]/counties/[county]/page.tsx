import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ClientDirectoryCountyView } from "@/components/landing/client-directory-view"
import { getFloridaCountyDirectoryEntry, isFloridaLocationPageIndexable } from "@/lib/client-directory"
import { getSiteUrl } from "@/lib/env"
import { getPublicClientProfilesService } from "@/lib/repositories/client-bureau-service"
import { JsonLd } from "@/lib/seo"

type FloridaCountyPageProps = {
  params: Promise<{ market: string; county: string }>
}

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: FloridaCountyPageProps): Promise<Metadata> {
  const { market, county: countySlug } = await params
  const siteUrl = getSiteUrl()

  if (market !== "florida") return { title: "Client Database" }

  const county = getFloridaCountyDirectoryEntry(await getPublicClientProfilesService(), countySlug)
  if (!county) return { title: "Client Database" }

  const canonical = `${siteUrl}/clients/florida/counties/${county.slug}`
  const shouldIndex = isFloridaLocationPageIndexable(county)
  const title = `${county.name} County FL Client Database`
  const description = county.profileCount > 0
    ? `Browse approved Client Bureau public client profiles and Florida local-market links in ${county.name} County.`
    : `Search ${county.name} County, Florida client profile context. Empty county pages stay out of the sitemap until approved public profiles exist.`

  return {
    title,
    description,
    robots: shouldIndex ? undefined : {
      index: false,
      follow: true,
    },
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [{ url: `${siteUrl}/opengraph-image`, width: 1200, height: 630, alt: `${county.name} County Client Bureau database` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/twitter-image`],
    },
  }
}

export default async function FloridaCountyPage({ params }: FloridaCountyPageProps) {
  const { market, county: countySlug } = await params
  if (market !== "florida") notFound()

  const siteUrl = getSiteUrl()
  const county = getFloridaCountyDirectoryEntry(await getPublicClientProfilesService(), countySlug)
  if (!county) notFound()

  const canonical = `${siteUrl}/clients/florida/counties/${county.slug}`
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: `${county.name} County, FL Client Database`,
        description: `Client Bureau county database page for ${county.name} County, Florida.`,
        isPartOf: {
          "@id": `${siteUrl}/#website`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Client Bureau",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Client Database",
            item: `${siteUrl}/clients`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Florida",
            item: `${siteUrl}/clients/florida`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: "Counties",
            item: `${siteUrl}/clients/florida/counties`,
          },
          {
            "@type": "ListItem",
            position: 5,
            name: `${county.name} County`,
            item: canonical,
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${canonical}#profile-backed-markets`,
        name: `${county.name} County profile-backed Client Database markets`,
        numberOfItems: county.profileCities.length,
        itemListElement: county.profileCities.map((city, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: `${city.name}, FL Client Database`,
          url: `${siteUrl}/clients/florida/${city.slug}`,
        })),
      },
    ],
  }

  return (
    <>
      <JsonLd data={structuredData} />
      <ClientDirectoryCountyView county={county} />
    </>
  )
}
