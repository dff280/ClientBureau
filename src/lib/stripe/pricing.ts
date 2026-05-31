import type { SubscriptionTier } from "@/lib/types"

export interface PricingTier {
  id: SubscriptionTier
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
    description: "For contractors checking the system before a first job.",
    stripePriceId: "price_mock_free",
    features: [
      "Limited client search preview",
      "Create contractor profile",
      "Submit documented reports",
      "Client response visibility",
    ],
  },
  {
    id: "pro",
    name: "Pro Contractor",
    price: "$29",
    cadence: "per month",
    description: "For active contractors who want better intake protection.",
    stripePriceId: "price_mock_pro_monthly",
    featured: true,
    features: [
      "Unlimited client profile searches",
      "Saved client searches",
      "Evidence upload workflow",
      "Report status tracking",
      "Priority moderation queue",
    ],
  },
  {
    id: "bureau_team",
    name: "Bureau Team",
    price: "$99",
    cadence: "per month",
    description: "For contractor teams managing higher client volume.",
    stripePriceId: "price_mock_team_monthly",
    features: [
      "Multi-seat contractor workspace",
      "Shared search history",
      "Admin-ready reporting exports",
      "Team evidence library",
      "Subscription hooks for Stripe Billing",
    ],
  },
]

export function createMockCheckoutHref(tier: SubscriptionTier) {
  return `/pricing?checkout=mock&plan=${tier}`
}
