import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { SeoLandingPageView } from "@/components/landing/seo-landing-page-view"
import { getSiteUrl } from "@/lib/env"
import { getProfilesForLanding } from "@/lib/public-profile-loaders"
import { getSeoLandingPage, getSeoLandingPages } from "@/lib/seo-landing-pages"

type IndustriesLandingPageProps = {
  params: Promise<{ industry: string }>
}

export function generateStaticParams() {
  return getSeoLandingPages("industries").map((page) => ({
    industry: page.slug,
  }))
}

export async function generateMetadata({ params }: IndustriesLandingPageProps): Promise<Metadata> {
  const { industry } = await params
  const page = getSeoLandingPage("industries", industry)
  const siteUrl = getSiteUrl()

  if (!page) return { title: "Client Reports by Industry" }

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: page.canonicalPath,
    },
    openGraph: {
      title: `${page.title} | Client Bureau`,
      description: page.description,
      url: `${siteUrl}${page.canonicalPath}`,
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

export default async function IndustriesLandingPage({ params }: IndustriesLandingPageProps) {
  const { industry } = await params
  const page = getSeoLandingPage("industries", industry)

  if (!page) notFound()

  const profiles = await getProfilesForLanding(page)

  return <SeoLandingPageView page={page} profiles={profiles} />
}
