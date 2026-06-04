import type { SubscriptionTier } from "@/lib/types"

export interface PricingTier {
  id: SubscriptionTier | "enterprise"
  name: string
  price: string
  cadence: string
  description: string
  stripePriceId: string
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
    features: [
      "Limited client profile search",
      "Create business profile",
      "Submit concern or positive reports",
      "Basic status tracking",
    ],
  },
  {
    id: "pro",
    name: "Pro Contractor",
    price: "$29",
    cadence: "per month",
    description: "For active contractors who want stronger intake and payment-risk review.",
    stripePriceId: "price_pro_monthly",
    featured: true,
    features: [
      "Unlimited client profile searches",
      "Saved client searches",
      "Watchlists and monitoring alerts",
      "Client intake assessments",
      "Contract signing links",
      "Evidence upload workflow",
      "Payment follow-up tracking",
      "Report status tracking",
      "Priority moderation queue",
    ],
  },
  {
    id: "bureau_team",
    name: "Bureau Team",
    price: "$99",
    cadence: "per month",
    description: "For teams managing higher client volume and shared intake decisions.",
    stripePriceId: "price_team_monthly",
    features: [
      "Multi-seat contractor workspace",
      "Shared watchlists and searches",
      "CSV bulk import",
      "Team reporting exports",
      "Team evidence library",
      "Shared contract packets",
      "Recovery case workspace",
      "Manager review controls",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    cadence: "annual options",
    description: "For regional groups, franchises, and larger business-owner networks.",
    stripePriceId: "price_enterprise",
    features: [
      "Custom seats and search volume",
      "Priority moderation workflows",
      "Custom contract and intake workflows",
      "Policy review and onboarding support",
      "Advanced audit and reporting needs",
    ],
  },
]
