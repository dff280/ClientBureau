import type { ClientDirectoryState } from "@/lib/client-directory"
import type { ClientReport, PublicClientProfile, RiskLevel } from "@/lib/types"
import type { ProfileType } from "@/lib/types"
import { getFloridaPlace } from "@/lib/florida-geography"
import { tradeCategoryMatches } from "@/lib/trade-taxonomy"

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
  tradeCategory?: string
  searchProfileType?: ProfileType
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
    primaryCta: "Check Florida clients",
    secondaryCta: "Report a Florida client experience",
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
    primaryCta: "Check Orlando clients",
    secondaryCta: "Report an Orlando client experience",
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
    primaryCta: "Check Tampa clients",
    secondaryCta: "Report a Tampa client experience",
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
    primaryCta: "Check Miami clients",
    secondaryCta: "Report a Miami client experience",
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
    primaryCta: "Check Jacksonville clients",
    secondaryCta: "Report a Jacksonville client experience",
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
    secondaryCta: "Report a documented client experience",
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
    secondaryCta: "Report a non-payment experience",
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
      "High-risk profile pages are not labels or accusations. They summarize approved contractor-submitted report context, rating factors, and response pathways.",
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
    secondaryCta: "Report a freelancer client experience",
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
    primaryCta: "Check agency clients",
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
    secondaryCta: "Report a service-business experience",
    industry: "service-businesses",
  },
  {
    kind: "industries",
    slug: "subcontractors",
    title: "Client and Contractor Reports for Subcontractors",
    h1: "Client Bureau for subcontractors and trade crews",
    description:
      "Subcontractors use Client Bureau to check contractors, document project scope, preserve payment-chain context, and review reports.",
    intro:
      "Subcontractors and trade crews often work through a hiring contractor, builder, property manager, or service business. Client Bureau helps them review public profile context, document scope, and preserve payment-chain records before an issue grows.",
    audience: "Specialty trade subcontractors, installers, labor crews, licensed subs, vendors, and trade professionals.",
    canonicalPath: "/industries/subcontractors",
    primaryCta: "Search contractor profiles",
    secondaryCta: "Report a trade relationship",
    industry: "subcontractors",
    searchProfileType: "contractor",
  },
  ...tradeIndustryLandingPages(),
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

export function seoLandingDirectoryCanonicalPath(
  page: SeoLandingPage,
  directory: ClientDirectoryState[],
) {
  if (page.kind !== "clients" || !page.city || !page.state) return undefined

  const state = directory.find((item) => item.code === page.state || item.name.toLowerCase() === page.state?.toLowerCase())
  const city = state?.cities.find((item) => item.name.toLowerCase() === page.city?.toLowerCase())

  if (state && city) return `/clients/${state.slug}/${city.slug}`

  if (page.state === "FL") {
    const floridaPlace = getFloridaPlace(page.city)
    if (floridaPlace) return `/clients/florida/${floridaPlace.slug}`
  }

  return undefined
}

export function seoLandingCanonicalPath(
  page: SeoLandingPage,
  directory: ClientDirectoryState[] = [],
) {
  return seoLandingDirectoryCanonicalPath(page, directory) ?? page.canonicalPath
}

export function filterProfilesForLanding(page: SeoLandingPage, profiles: PublicClientProfile[]) {
  return profiles.filter((profile) => {
    const matchesState = !page.state || profile.state === page.state
    const matchesCity = !page.city || profile.city.toLowerCase() === page.city.toLowerCase()
    const matchesRisk = !page.riskLevel || profile.riskLevel === page.riskLevel
    const matchesTrade =
      !page.tradeCategory ||
      profile.reports.some((report) =>
        tradeCategoryMatches(report.tradeCategory ?? report.projectType ?? report.jobType, page.tradeCategory),
      )
    const matchesCategory =
      !page.reportCategory ||
      profile.reports.some((report) => report.reportCategory === page.reportCategory)

    return matchesState && matchesCity && matchesRisk && matchesTrade && matchesCategory
  })
}

function tradeIndustryLandingPages(): SeoLandingPage[] {
  const topTrades = [
    {
      slug: "roofing",
      label: "Roofing",
      audience: "roofing contractors, roof repair businesses, exterior crews, and roof replacement teams",
      risk: "materials, tear-off scheduling, weather windows, supplements, and final-payment risk",
    },
    {
      slug: "painting",
      label: "Painting",
      audience: "interior painters, exterior painters, repaint crews, and coating contractors",
      risk: "color approvals, change requests, access windows, punch-list disputes, and final invoice risk",
    },
    {
      slug: "electrical",
      label: "Electrical",
      audience: "electricians, electrical contractors, low-voltage crews, and specialty installation teams",
      risk: "permit coordination, fixture changes, access limitations, inspection timing, and payment-chain context",
    },
    {
      slug: "plumbing",
      label: "Plumbing",
      audience: "plumbers, plumbing contractors, sewer repair teams, and service businesses",
      risk: "emergency work, hidden conditions, fixture changes, inspection issues, and payment documentation",
    },
    {
      slug: "hvac",
      label: "HVAC",
      audience: "HVAC contractors, AC repair teams, heating companies, and mechanical service businesses",
      risk: "equipment ordering, warranty expectations, change approvals, access, and final balance collection",
    },
    {
      slug: "landscaping",
      label: "Landscaping",
      audience: "landscapers, irrigation crews, lawn service companies, hardscape teams, and exterior service businesses",
      risk: "scope changes, seasonal timing, material selections, maintenance expectations, and overdue invoices",
    },
    {
      slug: "pool-and-spa-service",
      label: "Pool and spa service",
      audience: "pool builders, pool service companies, resurfacing teams, and spa repair contractors",
      risk: "progress draws, access, finish selections, weather delays, equipment changes, and payment milestones",
    },
    {
      slug: "flooring",
      label: "Flooring",
      audience: "flooring installers, hardwood crews, tile-adjacent trades, carpet teams, and finish contractors",
      risk: "material selections, subfloor conditions, access, change orders, punch-list items, and final payment",
    },
    {
      slug: "drywall",
      label: "Drywall",
      audience: "drywall contractors, hanging crews, finishing crews, texture teams, and remodeling subcontractors",
      risk: "scope boundaries, damage claims, change orders, schedule stacking, retainage, and payment-chain notes",
    },
    {
      slug: "concrete",
      label: "Concrete",
      audience: "concrete contractors, flatwork crews, driveway teams, pool deck crews, and site-work businesses",
      risk: "site readiness, weather timing, change approvals, finish expectations, and documented acceptance",
    },
    {
      slug: "handyman",
      label: "Handyman",
      audience: "handyman businesses, repair technicians, punch-list teams, and small-project service providers",
      risk: "unclear scope, repeated small changes, access windows, material reimbursement, and final invoice follow-up",
    },
    {
      slug: "residential-remodeler",
      label: "Residential remodeler",
      audience: "remodelers, renovation companies, kitchen and bath teams, and residential service businesses",
      risk: "deposits, scope creep, selections, change orders, progress payments, and homeowner response context",
    },
  ] as const

  return topTrades.map((trade) => ({
    kind: "industries",
    slug: trade.slug,
    title: `${trade.label} Client Reports and Contractor Protection`,
    h1: `Client checks for ${trade.label.toLowerCase()} contractors`,
    description:
      `Search Client Bureau before ${trade.label.toLowerCase()} work. Review moderated client reports, private matching, evidence labels, and response context.`,
    intro:
      `${trade.label} businesses commit labor, scheduling, materials, and documentation before every job is fully paid. Client Bureau helps teams check public client profile context, document projects, and keep private records around ${trade.risk}.`,
    audience: `Built for ${trade.audience}.`,
    canonicalPath: `/industries/${trade.slug}`,
    primaryCta: `Search ${trade.label.toLowerCase()} client context`,
    secondaryCta: `Report a ${trade.label.toLowerCase()} client experience`,
    industry: trade.slug,
    tradeCategory: trade.label,
    searchProfileType: "client",
  }))
}
