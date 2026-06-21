import type { SubscriptionTier } from "@/lib/types"

export interface PricingTier {
  id: SubscriptionTier | "enterprise"
  name: string
  price: string
  cadence: string
  description: string
  stripePriceId: string
  availability: "open" | "activation_review" | "scoped_review"
  launchNote: string
  featured?: boolean
  features: string[]
}

export const pricingTiers: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    cadence: "forever",
    description: "For contractors, subcontractors, and clients who want to understand the databases before making Client Bureau part of the workflow.",
    stripePriceId: "price_free",
    availability: "open",
    launchNote: "Free account setup is open now. No card is required.",
    features: [
      "Limited Client Database search access",
      "Browse Client, Contractor, and Subcontractor databases",
      "Starter saved search and watchlist access",
      "One documented client experience path",
      "Public profile and response context viewing",
      "Starter private dashboard",
    ],
  },
  {
    id: "pro",
    name: "Pro Check",
    price: "$29",
    cadence: "per month",
    description: "For contractors who want client checking, profile monitoring, and report context before estimates, deposits, scheduling, or materials.",
    stripePriceId: "price_pro_monthly",
    availability: "activation_review",
    launchNote: "The client-checking membership. Paid activation is reviewed before billing is collected.",
    features: [
      "Client Database checks for daily intake",
      "Saved searches and watchlist monitoring",
      "Client profile alerts",
      "Claim and monitor contractor or subcontractor profiles",
      "Report or add a positive client experience",
      "Client response tracking",
      "Basic Jobs list and dashboard activity",
      "Starter evidence notes and private summaries",
    ],
  },
  {
    id: "bureau_team",
    name: "Bureau Pro",
    price: "$99",
    cadence: "per month",
    description: "The complete business-protection workspace for contractors and service businesses that want search, jobs, contracts, evidence, recovery, and Florida lien workflows in one system.",
    stripePriceId: "price_team_monthly",
    availability: "scoped_review",
    launchNote: "Complete workspace activation is reviewed before billing is collected.",
    featured: true,
    features: [
      "Full Jobs project files and participant roles",
      "Contract packets and private signing links",
      "Florida contractor agreement starter",
      "Full Evidence Vault workflow",
      "Payment Recovery workspace",
      "Florida Lien Service workspace",
      "Activity timeline across jobs, reports, contracts, evidence, recovery, and lien service",
      "Priority review and support path",
    ],
  },
]
