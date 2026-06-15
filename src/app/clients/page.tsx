import type { Metadata } from "next"

import { ClientDirectoryIndexView } from "@/components/landing/client-directory-view"
import { getClientDirectory } from "@/lib/client-directory"
import { getSiteUrl } from "@/lib/env"
import { getPublicClientProfilesService } from "@/lib/repositories/client-bureau-service"
import { JsonLd } from "@/lib/seo"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl()

  return {
    title: "Client Database | Public Client Profiles",
    description:
      "Browse the Client Bureau Client Database by state and city with approved client profiles, moderated report context, and response paths.",
    alternates: {
      canonical: `${siteUrl}/clients`,
    },
    openGraph: {
      title: "Client Database | Client Bureau",
      description:
        "State and city database pages for approved public Client Bureau client profiles and moderated contractor-submitted report context.",
      url: `${siteUrl}/clients`,
      type: "website",
      images: [{ url: `${siteUrl}/opengraph-image`, width: 1200, height: 630, alt: "Client Bureau Client Database" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Client Database | Client Bureau",
      description:
        "Browse approved Client Bureau public client profiles by state and city.",
      images: [`${siteUrl}/twitter-image`],
    },
  }
}

export default async function ClientsDirectoryPage() {
  const siteUrl = getSiteUrl()
  const profiles = await getPublicClientProfilesService()
  const states = getClientDirectory(profiles)
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/clients#webpage`,
        url: `${siteUrl}/clients`,
        name: "Client Bureau Client Database",
        description:
          "Approved public client profile database organized by state and city.",
        isPartOf: {
          "@id": `${siteUrl}/#website`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteUrl}/clients#breadcrumb`,
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
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl}/clients#state-directories`,
        name: "Client Bureau Client Database state pages",
        numberOfItems: states.length,
        itemListElement: states.map((state, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: `${state.name} client profiles`,
          url: `${siteUrl}/clients/${state.slug}`,
        })),
      },
    ],
  }

  return (
    <>
      <JsonLd data={structuredData} />
      <ClientDirectoryIndexView states={states} />
    </>
  )
}
