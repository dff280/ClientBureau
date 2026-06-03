import { getPublicContactInfo, getPublicSocialLinks, getSiteUrl } from "@/lib/env"

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
      "Client Bureau is a moderated client-risk intelligence platform for business owners reviewing documented client reports before accepting work.",
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

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
