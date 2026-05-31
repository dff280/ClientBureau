import { NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth"
import { getDataMode, getSiteUrl } from "@/lib/env"
import { pricingTiers } from "@/lib/stripe/pricing"
import { getStripe, hasStripeConfig } from "@/lib/stripe/server"
import { createServiceClient } from "@/lib/supabase/service"
import type { SubscriptionTier } from "@/lib/types"

export const runtime = "nodejs"

function isTier(value: string | null): value is SubscriptionTier {
  return value === "free" || value === "pro" || value === "bureau_team"
}

function priceIdForTier(tier: SubscriptionTier) {
  if (tier === "pro") return process.env.STRIPE_PRICE_PRO_MONTHLY
  if (tier === "bureau_team") return process.env.STRIPE_PRICE_TEAM_MONTHLY

  return undefined
}

async function contractorIdForCurrentUser() {
  if (getDataMode() !== "supabase") return undefined

  const user = await getCurrentUser()
  if (!user) return undefined

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("contractor_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  if (error) throw new Error(error.message)

  return (data as { id: string } | null)?.id
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const tierValue = formData.get("tier")
  const submittedTier = typeof tierValue === "string" ? tierValue : null
  const tier: SubscriptionTier = isTier(submittedTier) ? submittedTier : "free"
  const siteUrl = getSiteUrl()

  if (tier === "free") {
    return NextResponse.redirect(`${siteUrl}/signup?plan=free`, 303)
  }

  const tierConfig = pricingTiers.find((candidate) => candidate.id === tier)
  const priceId = priceIdForTier(tier)

  if (!hasStripeConfig() || !priceId) {
    return NextResponse.redirect(`${siteUrl}/pricing?checkout=mock&plan=${tier}`, 303)
  }

  const contractorId = await contractorIdForCurrentUser()

  if (getDataMode() === "supabase" && !contractorId) {
    return NextResponse.redirect(`${siteUrl}/login?next=/pricing`, 303)
  }

  const stripe = getStripe()
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${siteUrl}/dashboard?checkout=success&plan=${tier}`,
    cancel_url: `${siteUrl}/pricing?checkout=cancelled&plan=${tier}`,
    client_reference_id: contractorId,
    metadata: {
      tier,
      contractorId: contractorId ?? "",
    },
    subscription_data: {
      metadata: {
        tier,
        contractorId: contractorId ?? "",
      },
    },
    custom_text: {
      submit: {
        message: tierConfig
          ? `Start Client Bureau ${tierConfig.name} in Stripe test mode.`
          : "Start Client Bureau in Stripe test mode.",
      },
    },
  })

  if (!session.url) {
    return NextResponse.redirect(`${siteUrl}/pricing?checkout=error`, 303)
  }

  return NextResponse.redirect(session.url, 303)
}
