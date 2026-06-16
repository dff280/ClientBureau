import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ClientDirectoryCountyIndexView } from "@/components/landing/client-directory-view"
import { getFloridaCountyDirectory } from "@/lib/client-directory"
import { getSiteUrl } from "@/lib/env"
import { getPublicClientProfilesService } from "@/lib/repositories/client-bureau-service"
import { JsonLd } from "@/lib/seo"

type FloridaCountyIndexPageProps = {
  params: Promise<{ market: string }>
}

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: FloridaCountyIndexPageProps): Promise<Metadata> {
  const { market } = await params
  const siteUrl = getSiteUrl()

  if (market !== "florida") return { title: "Client Database" }

  const title = "Florida County Client Database"
  const description =
    "Browse Florida Client Database coverage by county with official county, city, town, village, and Census place structure."
  const canonical = `${siteUrl}/clients/florida/counties`

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [{ url: `${siteUrl}/opengraph-image`, width: 1200, height: 630, alt: "Florida Client Bureau county database" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/twitter-image`],
    },
  }
}

export default async function FloridaCountyIndexPage({ params }: FloridaCountyIndexPageProps) {
  const { market } = await params
  if (market !== "florida") notFound()

  const siteUrl = getSiteUrl()
  const counties = getFloridaCountyDirectory(await getPublicClientProfilesService())
  const canonical = `${siteUrl}/clients/florida/counties`
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: "Florida County Client Database",
        description: "Official Florida county browsing paths for Client Bureau public client profiles.",
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
            item: canonical,
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${canonical}#counties`,
        name: "Florida Client Database county pages",
        numberOfItems: counties.length,
        itemListElement: counties.map((county, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: `${county.name} County Client Database`,
          url: `${siteUrl}/clients/florida/counties/${county.slug}`,
        })),
      },
    ],
  }

  return (
    <>
      <JsonLd data={structuredData} />
      <ClientDirectoryCountyIndexView counties={counties} />
    </>
  )
}
