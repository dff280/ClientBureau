import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ClientDirectoryCityView } from "@/components/landing/client-directory-view"
import { getClientDirectoryState } from "@/lib/client-directory"
import { getSiteUrl } from "@/lib/env"
import { getPublicClientProfilesService } from "@/lib/repositories/client-bureau-service"
import { JsonLd } from "@/lib/seo"

type ClientCityDirectoryPageProps = {
  params: Promise<{ market: string; city: string }>
}

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: ClientCityDirectoryPageProps): Promise<Metadata> {
  const { market, city: citySlug } = await params
  const siteUrl = getSiteUrl()
  const state = getClientDirectoryState(await getPublicClientProfilesService(), market)
  const city = state?.cities.find((item) => item.slug === citySlug)

  if (!state || !city) {
    return {
      title: "Client Database",
    }
  }

  const title = `${city.name} ${state.code} Public Client Profiles | Client Database`
  const description =
    `Browse the Client Bureau Client Database in ${city.name}, ${state.name} with approved profiles and moderated contractor-submitted report context.`
  const canonical = `${siteUrl}/clients/${state.slug}/${city.slug}`

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
      images: [{ url: `${siteUrl}/opengraph-image`, width: 1200, height: 630, alt: `${city.name} Client Bureau profiles` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/twitter-image`],
    },
  }
}

export default async function ClientCityDirectoryPage({ params }: ClientCityDirectoryPageProps) {
  const { market, city: citySlug } = await params
  const siteUrl = getSiteUrl()
  const state = getClientDirectoryState(await getPublicClientProfilesService(), market)
  const city = state?.cities.find((item) => item.slug === citySlug)

  if (!state || !city) notFound()

  const canonical = `${siteUrl}/clients/${state.slug}/${city.slug}`
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: `${city.name}, ${state.code} Client Database profiles`,
        description:
          `Approved public client profile database for ${city.name}, ${state.name}.`,
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
            name: state.name,
            item: `${siteUrl}/clients/${state.slug}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: city.name,
            item: canonical,
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${canonical}#approved-profiles`,
        name: `${city.name}, ${state.code} approved Client Bureau profiles`,
        numberOfItems: city.profiles.length,
        itemListElement: city.profiles.map((profile, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: `${profile.firstName} ${profile.lastName}`,
          url: `${siteUrl}/client/${profile.publicSlug}`,
        })),
      },
    ],
  }

  return (
    <>
      <JsonLd data={structuredData} />
      <ClientDirectoryCityView state={state} city={city} />
    </>
  )
}
