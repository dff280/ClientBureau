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
    description: "For business owners who want a basic client check before accepting work.",
    stripePriceId: "price_free",
    availability: "open",
    launchNote: "Free account setup is open now. No card is required.",
    features: [
      "Client Database search access",
      "Basic saved search and watchlist workflow",
      "One documented client experience report path",
      "Public profile and response context viewing",
      "Private dashboard setup",
    ],
  },
  {
    id: "pro",
    name: "Pro Contractor",
    price: "$29",
    cadence: "per month",
    description: "For active contractors and service businesses making client checks part of every job intake.",
    stripePriceId: "price_pro_monthly",
    availability: "activation_review",
    launchNote: "Create a free account first. Pro activation is reviewed before billing is collected.",
    featured: true,
    features: [
      "Daily client checks and saved searches",
      "Watchlists and monitoring alerts",
      "Client intake assessments",
      "Contract signing links",
      "Evidence Vault workflow",
      "Client response tracking",
      "Payment follow-up and recovery workspace",
      "Client experience report workflow",
      "Florida lien service case workspace",
    ],
  },
  {
    id: "bureau_team",
    name: "Bureau Team",
    price: "$99",
    cadence: "per month",
    description: "For teams managing higher client volume and shared intake decisions.",
    stripePriceId: "price_team_monthly",
    availability: "scoped_review",
    launchNote: "Team activation is scoped with Client Bureau before any billing or seat rollout.",
    features: [
      "Team workflow review",
      "Shared process planning for searches and watchlists",
      "CSV intake review path",
      "Evidence and contract operating process",
      "Recovery and lien-service coordination review",
      "Manager review expectations scoped before rollout",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    cadence: "annual options",
    description: "For regional groups, franchises, trade associations, and larger business-owner networks.",
    stripePriceId: "price_enterprise",
    availability: "scoped_review",
    launchNote: "Enterprise is a scoped review path, not instant self-serve checkout.",
    features: [
      "Seat and usage review",
      "Moderation workflow review",
      "Policy and onboarding support review",
      "Contract and intake workflow scoping",
      "Audit and reporting needs assessment",
      "Data partnership discussions only when separately approved",
    ],
  },
]
