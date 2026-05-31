import type Stripe from "stripe"

import { createServiceClient } from "@/lib/supabase/service"
import type { SubscriptionTier } from "@/lib/types"

function tierFromPrice(priceId?: string | null, metadataTier?: string | null): SubscriptionTier {
  if (metadataTier === "pro" || metadataTier === "bureau_team" || metadataTier === "free") {
    return metadataTier
  }

  if (priceId && priceId === process.env.STRIPE_PRICE_TEAM_MONTHLY) return "bureau_team"
  if (priceId && priceId === process.env.STRIPE_PRICE_PRO_MONTHLY) return "pro"

  return "free"
}

function periodEndFromSubscription(subscription: Stripe.Subscription) {
  const subscriptionWithPeriod = subscription as Stripe.Subscription & {
    current_period_end?: number
  }

  return subscriptionWithPeriod.current_period_end
    ? new Date(subscriptionWithPeriod.current_period_end * 1000).toISOString()
    : null
}

export async function syncCheckoutSessionSubscription(session: Stripe.Checkout.Session) {
  const contractorId = session.client_reference_id ?? session.metadata?.contractorId

  if (!contractorId) return

  const supabase = createServiceClient()
  await supabase.from("subscriptions").upsert(
    {
      contractor_id: contractorId,
      tier: tierFromPrice(null, session.metadata?.tier),
      status: "active",
      stripe_customer_id: typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
      stripe_subscription_id:
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id ?? null,
    },
    { onConflict: "contractor_id" },
  )
}

export async function syncStripeSubscription(subscription: Stripe.Subscription) {
  const contractorId = subscription.metadata?.contractorId

  if (!contractorId) return

  const priceId = subscription.items.data[0]?.price.id ?? null
  const supabase = createServiceClient()

  await supabase.from("subscriptions").upsert(
    {
      contractor_id: contractorId,
      tier: tierFromPrice(priceId, subscription.metadata?.tier),
      status: subscription.status,
      stripe_customer_id:
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?.id ?? null,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      current_period_end: periodEndFromSubscription(subscription),
    },
    { onConflict: "contractor_id" },
  )
}
