import type { ClientReport, PublicClientProfile, RiskLevel } from "@/lib/types"

export type SeoLandingKind = "clients" | "reports" | "industries"

export interface SeoLandingPage {
  kind: SeoLandingKind
  slug: string
  title: string
  h1: string
  description: string
  intro: string
  audience: string
  canonicalPath: string
  primaryCta: string
  secondaryCta: string
  city?: string
  state?: string
  reportCategory?: ClientReport["reportCategory"]
  riskLevel?: RiskLevel
  industry?: string
}

export const clientMarketLandingPages: SeoLandingPage[] = [
  {
    kind: "clients",
    slug: "florida",
    title: "Florida Client Reports for Contractors",
    h1: "Florida client reports for contractors and service businesses",
    description:
      "Search moderated Client Bureau profiles for Florida client payment, dispute, response, and evidence-on-file context before accepting work.",
    intro:
      "Florida contractors and service businesses often commit crews, materials, deposits, and calendar capacity before final payment is secure. Client Bureau helps business owners review moderated client report context before work starts.",
    audience: "Florida contractors, remodelers, roofers, painters, landscapers, pool companies, HVAC companies, and service businesses.",
    canonicalPath: "/clients/florida",
    primaryCta: "Search Florida clients",
    secondaryCta: "Submit a Florida report",
    state: "FL",
  },
  {
    kind: "clients",
    slug: "orlando-fl",
    title: "Orlando FL Client Reports",
    h1: "Orlando client reports before you take the job",
    description:
      "Review moderated Orlando client profiles, reported unpaid balances, dispute context, and right-of-response information on Client Bureau.",
    intro:
      "Before scheduling crews or ordering materials in Orlando, search Client Bureau for approved public client profiles and moderated contractor-submitted report summaries.",
    audience: "Orlando contractors, remodelers, trades, home-service companies, vendors, and project-based businesses.",
    canonicalPath: "/clients/orlando-fl",
    primaryCta: "Search Orlando clients",
    secondaryCta: "Submit an Orlando report",
    city: "Orlando",
    state: "FL",
  },
  {
    kind: "clients",
    slug: "tampa-fl",
    title: "Tampa FL Client Reports",
    h1: "Tampa client reports for pre-job review",
    description:
      "Search Tampa client profiles with moderated report summaries, payment reliability context, positive reports, and response information.",
    intro:
      "Client Bureau helps Tampa businesses review public client profile context before accepting appointments, projects, deposits, or final invoice risk.",
    audience: "Tampa contractors, rental-service vendors, painters, remodelers, landscapers, and service firms.",
    canonicalPath: "/clients/tampa-fl",
    primaryCta: "Search Tampa clients",
    secondaryCta: "Submit a Tampa report",
    city: "Tampa",
    state: "FL",
  },
  {
    kind: "clients",
    slug: "miami-fl",
    title: "Miami FL Client Reports",
    h1: "Miami client reports for business-owner intake",
    description:
      "Search Client Bureau for Miami client report context, private matching, moderated summaries, and response or correction pathways.",
    intro:
      "Miami businesses can use Client Bureau as a pre-client review layer before scheduling work, accepting deposits, or delivering services.",
    audience: "Miami contractors, event vendors, designers, developers, agencies, photographers, and service businesses.",
    canonicalPath: "/clients/miami-fl",
    primaryCta: "Search Miami clients",
    secondaryCta: "Submit a Miami report",
    city: "Miami",
    state: "FL",
  },
  {
    kind: "clients",
    slug: "jacksonville-fl",
    title: "Jacksonville FL Client Reports",
    h1: "Jacksonville client reports for contractors and service teams",
    description:
      "Review Jacksonville client risk intelligence with moderated report summaries, reported balances, dispute context, and evidence-on-file labels.",
    intro:
      "Client Bureau supports Jacksonville businesses that need a careful intake checkpoint before committing crews, labor, materials, or project capacity.",
    audience: "Jacksonville contractors, roofers, HVAC companies, remodelers, flooring companies, and local service providers.",
    canonicalPath: "/clients/jacksonville-fl",
    primaryCta: "Search Jacksonville clients",
    secondaryCta: "Submit a Jacksonville report",
    city: "Jacksonville",
    state: "FL",
  },
]

export const reportLandingPages: SeoLandingPage[] = [
  {
    kind: "reports",
    slug: "recent",
    title: "Recent Client Reports",
    h1: "Recent moderated client reports",
    description:
      "View recent public Client Bureau profiles with moderated contractor-submitted summaries, risk levels, reported balances, and response context.",
    intro:
      "Recent Client Bureau report pages surface approved public context only. Private identifiers, raw evidence files, and unapproved submissions are not displayed.",
    audience: "Business owners checking client history before accepting a project, appointment, invoice, or delivery.",
    canonicalPath: "/reports/recent",
    primaryCta: "Search recent reports",
    secondaryCta: "Submit a documented report",
  },
  {
    kind: "reports",
    slug: "non-payment",
    title: "Non-Payment Client Reports",
    h1: "Reported non-payment client reports",
    description:
      "Search moderated non-payment report context, reported unpaid balances, evidence-on-file summaries, and response information on Client Bureau.",
    intro:
      "Non-payment pages help business owners review approved public summaries where contractors reported unpaid invoice or final balance issues.",
    audience: "Contractors and service businesses reviewing final-payment risk before new work starts.",
    canonicalPath: "/reports/non-payment",
    primaryCta: "Search non-payment reports",
    secondaryCta: "Submit a non-payment report",
    reportCategory: "Non-payment",
  },
  {
    kind: "reports",
    slug: "high-risk",
    title: "High Risk Client Reports",
    h1: "High risk client profiles with moderated context",
    description:
      "Review high-risk Client Bureau profiles with approved public report summaries, dispute context, and reported payment-risk indicators.",
    intro:
      "High-risk profile pages are not labels or accusations. They summarize approved contractor-submitted report context, score factors, and response pathways.",
    audience: "Business owners who need additional intake controls before committing labor, materials, or delivery capacity.",
    canonicalPath: "/reports/high-risk",
    primaryCta: "Search high-risk profiles",
    secondaryCta: "Create an intake report",
    riskLevel: "High",
  },
]

export const industryLandingPages: SeoLandingPage[] = [
  {
    kind: "industries",
    slug: "contractors",
    title: "Client Reports for Contractors",
    h1: "Client Bureau for contractors",
    description:
      "Contractors use Client Bureau to search client reports, watch client profiles, submit documented experiences, and review payment-risk context.",
    intro:
      "Contractors face unique project risk before work starts: materials, crews, change orders, access windows, deposits, and final payment. Client Bureau creates a moderated client-check layer.",
    audience: "General contractors, remodelers, painters, roofers, HVAC companies, pool companies, flooring teams, and local trades.",
    canonicalPath: "/industries/contractors",
    primaryCta: "Search contractor client reports",
    secondaryCta: "Create contractor account",
    industry: "contractors",
  },
  {
    kind: "industries",
    slug: "freelancers",
    title: "Client Reports for Freelancers",
    h1: "Client risk intelligence for freelancers",
    description:
      "Freelancers can review moderated client report context before accepting deposits, revisions, appointments, or invoice risk.",
    intro:
      "Freelancers often begin work before full payment is complete. Client Bureau helps them check documented client experiences and preserve evidence if an issue needs review.",
    audience: "Freelancers, photographers, writers, editors, designers, developers, and independent consultants.",
    canonicalPath: "/industries/freelancers",
    primaryCta: "Search client reports",
    secondaryCta: "Submit a freelancer report",
    industry: "freelancers",
  },
  {
    kind: "industries",
    slug: "agencies",
    title: "Client Reports for Agencies",
    h1: "Client reporting network for agencies",
    description:
      "Agencies can use Client Bureau to check client history, document payment disputes, and track client-response context before new engagements.",
    intro:
      "Agencies need reliable intake before assigning teams, accepting timelines, or delivering project milestones. Client Bureau supports moderated, documented client intelligence.",
    audience: "Marketing agencies, web agencies, creative studios, development teams, and professional-service firms.",
    canonicalPath: "/industries/agencies",
    primaryCta: "Search agency clients",
    secondaryCta: "Create agency account",
    industry: "agencies",
  },
  {
    kind: "industries",
    slug: "service-businesses",
    title: "Client Reports for Service Businesses",
    h1: "Client checks for service businesses",
    description:
      "Service businesses can search moderated client reports, private matching context, payment history, disputes, and response updates.",
    intro:
      "Any business that works from appointments, invoices, deposits, projects, or deliverables can use Client Bureau as a pre-client protection layer.",
    audience: "Event vendors, repair businesses, home-service companies, consultants, designers, photographers, and local operators.",
    canonicalPath: "/industries/service-businesses",
    primaryCta: "Search client reports",
    secondaryCta: "Submit a service report",
    industry: "service-businesses",
  },
]

export const allSeoLandingPages = [
  ...clientMarketLandingPages,
  ...reportLandingPages,
  ...industryLandingPages,
]

export function getSeoLandingPage(kind: SeoLandingKind, slug: string) {
  return allSeoLandingPages.find((page) => page.kind === kind && page.slug === slug)
}

export function getSeoLandingPages(kind: SeoLandingKind) {
  return allSeoLandingPages.filter((page) => page.kind === kind)
}

export function filterProfilesForLanding(page: SeoLandingPage, profiles: PublicClientProfile[]) {
  return profiles.filter((profile) => {
    const matchesState = !page.state || profile.state === page.state
    const matchesCity = !page.city || profile.city.toLowerCase() === page.city.toLowerCase()
    const matchesRisk = !page.riskLevel || profile.riskLevel === page.riskLevel
    const matchesCategory =
      !page.reportCategory ||
      profile.reports.some((report) => report.reportCategory === page.reportCategory)

    return matchesState && matchesCity && matchesRisk && matchesCategory
  })
}
