import { getPublicContactInfo, getPublicSocialLinks, getSiteUrl } from "@/lib/env"
import { getClientCityDirectoryHref, getClientStateDirectoryHref } from "@/lib/client-directory"
import type { PublicClientProfile } from "@/lib/types"

const siteUrl = getSiteUrl()

export function getOrganizationSchema() {
  const sameAs = getPublicSocialLinks().map((link) => link.url)

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "Client Bureau",
    url: siteUrl,
    logo: `${siteUrl}/icon`,
    slogan: "Know who you're working with before the job starts.",
    description:
      "Client Bureau is a moderated business-protection platform for contractors and service businesses checking clients before accepting work.",
    ...(sameAs.length > 0 ? { sameAs } : {}),
  }
}

export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: "Client Bureau",
    url: siteUrl,
    publisher: {
      "@id": `${siteUrl}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  }
}

export function getSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${siteUrl}/#software`,
    name: "Client Bureau",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: siteUrl,
    description:
      "Business client search, moderated report submission, evidence-on-file summaries, and client response workflows.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      category: "Free and paid subscription plans",
    },
  }
}

export function getFaqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }
}

export function getLocalBusinessSchema() {
  const contact = getPublicContactInfo()

  if (!contact.phone || !contact.street || !contact.city || !contact.state) return null

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteUrl}/#local-business`,
    name: "Client Bureau",
    url: siteUrl,
    telephone: contact.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.street,
      addressLocality: contact.city,
      addressRegion: contact.state,
      postalCode: contact.zip,
      addressCountry: "US",
    },
  }
}

export function getClientProfileStructuredData(profile: PublicClientProfile) {
  const name = `${profile.firstName} ${profile.lastName}`
  const profileUrl = `${siteUrl}/client/${profile.publicSlug}`
  const stateUrl = `${siteUrl}${getClientStateDirectoryHref(profile)}`
  const cityUrl = `${siteUrl}${getClientCityDirectoryHref(profile)}`
  const subjectId = `${profileUrl}#subject`
  const reportListId = `${profileUrl}#approved-report-summaries`

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${profileUrl}#webpage`,
        url: profileUrl,
        name: `${name} Client Bureau public profile`,
        description:
          `Moderated contractor-submitted public profile for ${name} in ${profile.city}, ${profile.state}.`,
        datePublished: profile.createdAt,
        dateModified: profile.updatedAt,
        isPartOf: {
          "@id": `${siteUrl}/#website`,
        },
        about: {
          "@id": subjectId,
        },
        mainEntity: {
          "@id": subjectId,
        },
        breadcrumb: {
          "@id": `${profileUrl}#breadcrumb`,
        },
        hasPart: {
          "@id": reportListId,
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${profileUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          caption: `Client Bureau public profile card for ${name} in ${profile.city}, ${profile.state}`,
        },
      },
      {
        "@type": "ProfilePage",
        "@id": `${profileUrl}#profilepage`,
        url: profileUrl,
        name: `${name} in ${profile.city}, ${profile.state}: Client Bureau Public Profile`,
        description:
          `Public Client Bureau profile with moderated contractor-submitted summaries, response context, and private evidence-review indicators for ${name}.`,
        dateCreated: profile.createdAt,
        dateModified: profile.updatedAt,
        mainEntity: {
          "@id": subjectId,
        },
        hasPart: {
          "@id": reportListId,
        },
      },
      {
        "@type": "Person",
        "@id": subjectId,
        name,
        description:
          `Client Bureau public profile subject for ${name} in ${profile.city}, ${profile.state}. This page shows approved contractor-submitted report summaries and moderated response context only.`,
        ...(profile.businessName
          ? {
              affiliation: {
                "@type": "Organization",
                name: profile.businessName,
              },
            }
          : {}),
        address: {
          "@type": "PostalAddress",
          addressLocality: profile.city,
          addressRegion: profile.state,
          addressCountry: "US",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${profileUrl}#breadcrumb`,
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
            name: `${profile.state} client profiles`,
            item: stateUrl,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: `${profile.city}, ${profile.state} client profiles`,
            item: cityUrl,
          },
          {
            "@type": "ListItem",
            position: 5,
            name,
            item: profileUrl,
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": reportListId,
        name: "Approved contractor-submitted report summaries",
        numberOfItems: profile.reports.length,
        itemListElement: profile.reports.map((report, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Article",
            "@id": `${profileUrl}#approved-summary-${index + 1}`,
            headline: `${report.reportCategory} contractor-submitted report summary`,
            articleBody: report.publicSummary,
            datePublished: report.approvedAt ?? report.createdAt,
            dateModified: report.approvedAt ?? report.createdAt,
            isPartOf: {
              "@id": `${profileUrl}#webpage`,
            },
            about: {
              "@id": subjectId,
            },
            publisher: {
              "@id": `${siteUrl}/#organization`,
            },
          },
        })),
      },
    ],
  }
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  )
}
