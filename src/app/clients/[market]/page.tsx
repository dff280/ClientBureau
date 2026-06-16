import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"

import { ClientDirectoryStateView } from "@/components/landing/client-directory-view"
import { SeoLandingPageView } from "@/components/landing/seo-landing-page-view"
import { getClientDirectory, getClientDirectoryState } from "@/lib/client-directory"
import { getSiteUrl } from "@/lib/env"
import { getProfilesForLanding } from "@/lib/public-profile-loaders"
import { getPublicClientProfilesService } from "@/lib/repositories/client-bureau-service"
import { getSeoLandingPage, getSeoLandingPages, seoLandingDirectoryCanonicalPath } from "@/lib/seo-landing-pages"
import { JsonLd } from "@/lib/seo"

type ClientsLandingPageProps = {
  params: Promise<{ market: string }>
}

export const dynamic = "force-dynamic"

export function generateStaticParams() {
  return getSeoLandingPages("clients").map((page) => ({
    market: page.slug,
  }))
}

export async function generateMetadata({ params }: ClientsLandingPageProps): Promise<Metadata> {
  const { market } = await params
  const page = getSeoLandingPage("clients", market)
  const siteUrl = getSiteUrl()

  if (!page) {
    const state = getClientDirectoryState(await getPublicClientProfilesService(), market)

    if (!state) return { title: "Client Reports" }

    return {
      title: `${state.name} Public Client Profiles | Client Database`,
      description: `Browse the Client Bureau Client Database in ${state.name} by city with approved profiles and moderated contractor-submitted report context.`,
      alternates: {
        canonical: `${siteUrl}/clients/${state.slug}`,
      },
      openGraph: {
        title: `${state.name} Client Database Profiles`,
        description: `Approved public Client Bureau client profiles and city markets in ${state.name}.`,
        url: `${siteUrl}/clients/${state.slug}`,
        type: "website",
        images: [{ url: `${siteUrl}/opengraph-image`, width: 1200, height: 630, alt: `${state.name} Client Bureau profiles` }],
      },
      twitter: {
        card: "summary_large_image",
        title: `${state.name} Client Bureau Profiles`,
        description: `Browse approved Client Bureau public client profiles in ${state.name}.`,
        images: [`${siteUrl}/twitter-image`],
      },
    }
  }

  const canonicalDirectoryHref = await clientLandingDirectoryHref(page)

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: canonicalDirectoryHref ? `${siteUrl}${canonicalDirectoryHref}` : page.canonicalPath,
    },
    openGraph: {
      title: `${page.title} | Client Bureau`,
      description: page.description,
      url: canonicalDirectoryHref ? `${siteUrl}${canonicalDirectoryHref}` : `${siteUrl}${page.canonicalPath}`,
      type: "website",
      images: [{ url: `${siteUrl}/opengraph-image`, width: 1200, height: 630, alt: page.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [`${siteUrl}/twitter-image`],
    },
  }
}

export default async function ClientsLandingPage({ params }: ClientsLandingPageProps) {
  const { market } = await params
  const page = getSeoLandingPage("clients", market)
  const siteUrl = getSiteUrl()

  if (!page) {
    const state = getClientDirectoryState(await getPublicClientProfilesService(), market)

    if (!state) notFound()

    const structuredData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${siteUrl}/clients/${state.slug}#webpage`,
          url: `${siteUrl}/clients/${state.slug}`,
          name: `${state.name} Client Database profiles`,
          description: `Approved public client profile database for ${state.name}.`,
          isPartOf: {
            "@id": `${siteUrl}/#website`,
          },
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${siteUrl}/clients/${state.slug}#breadcrumb`,
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
          ],
        },
        {
          "@type": "ItemList",
          "@id": `${siteUrl}/clients/${state.slug}#city-directories`,
          name: `${state.name} Client Database city pages`,
          numberOfItems: state.cities.length,
          itemListElement: state.cities.map((city, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: `${city.name}, ${state.code} client profiles`,
            url: `${siteUrl}/clients/${state.slug}/${city.slug}`,
          })),
        },
      ],
    }

    return (
      <>
        <JsonLd data={structuredData} />
        <ClientDirectoryStateView state={state} />
      </>
    )
  }

  const canonicalDirectoryHref = await clientLandingDirectoryHref(page)
  if (canonicalDirectoryHref) permanentRedirect(canonicalDirectoryHref)

  const profiles = await getProfilesForLanding(page)

  return <SeoLandingPageView page={page} profiles={profiles} />
}

async function clientLandingDirectoryHref(page: NonNullable<ReturnType<typeof getSeoLandingPage>>) {
  const directory = getClientDirectory(await getPublicClientProfilesService())

  return seoLandingDirectoryCanonicalPath(page, directory)
}
