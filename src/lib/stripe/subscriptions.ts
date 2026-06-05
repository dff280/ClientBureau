import type Stripe from "stripe"

import { createServiceClient } from "@/lib/supabase/service"
import type { ServiceFeeKind, SubscriptionTier } from "@/lib/types"

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

function isServiceFeeKind(value?: string | null): value is ServiceFeeKind {
  return value === "managed_recovery" || value === "florida_lien_notice" || value === "florida_lien_filing"
}

function isMissingServiceFeeTable(error: { code?: string; message?: string } | null) {
  return error?.code === "42P01" || error?.message?.toLowerCase().includes("service_fee_orders")
}

function isMissingRevenueWorkflowColumn(error: { code?: string; message?: string } | null) {
  const message = error?.message?.toLowerCase() ?? ""

  return error?.code === "42703" || message.includes("readiness_status") || message.includes("fee_paid_at")
}

async function syncPaidServiceCase({
  contractorId,
  entityId,
  kind,
  paidAt,
}: {
  contractorId: string
  entityId: string
  kind: ServiceFeeKind
  paidAt: string
}) {
  const supabase = createServiceClient()

  if (kind === "managed_recovery") {
    const { error } = await supabase
      .from("managed_recovery_cases")
      .update({
        status: "submitted",
        fee_paid_at: paidAt,
        submitted_for_review_at: paidAt,
        readiness_status: "submitted",
        next_action: "Service fee is paid. Resolution Desk can begin private document review and factual outreach.",
      })
      .eq("id", entityId)
      .eq("contractor_id", contractorId)

    if (!isMissingRevenueWorkflowColumn(error) && error) throw new Error(error.message)
    return
  }

  const { data: lienCase } = await supabase
    .from("florida_lien_cases")
    .select("contractor_signed_at")
    .eq("id", entityId)
    .eq("contractor_id", contractorId)
    .maybeSingle()
  const { error } = await supabase
    .from("florida_lien_cases")
    .update({
      status: lienCase?.contractor_signed_at ? "attorney_vendor_review" : "contractor_signature_required",
      fee_paid_at: paidAt,
      submitted_for_review_at: paidAt,
      readiness_status: "submitted",
      next_action: lienCase?.contractor_signed_at
        ? "Service fee is paid. Attorney/vendor review can verify documents, deadlines, and recording requirements."
        : "Service fee is paid. Contractor signature and authorization are required before attorney/vendor review.",
    })
    .eq("id", entityId)
    .eq("contractor_id", contractorId)

  if (!isMissingRevenueWorkflowColumn(error) && error) throw new Error(error.message)
}

export async function syncCheckoutSessionSubscription(session: Stripe.Checkout.Session) {
  if (isServiceFeeKind(session.metadata?.kind)) {
    await syncCheckoutSessionServiceFee(session)
    return
  }

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

export async function syncCheckoutSessionServiceFee(session: Stripe.Checkout.Session) {
  const kind = session.metadata?.kind
  const entityId = session.metadata?.entityId ?? session.client_reference_id

  if (!isServiceFeeKind(kind) || !entityId) return

  const supabase = createServiceClient()
  const paidAt = session.payment_status === "paid" ? new Date().toISOString() : null
  const { data: updated, error: updateError } = await supabase
    .from("service_fee_orders")
    .update({
      status: session.payment_status === "paid" ? "paid" : "checkout_ready",
      stripe_checkout_url: session.url ?? null,
      stripe_session_id: session.id,
      paid_at: paidAt,
    })
    .eq("kind", kind)
    .eq("entity_id", entityId)
    .select("id, contractor_id")

  if (isMissingServiceFeeTable(updateError)) return
  if (updateError) throw new Error(updateError.message)
  if (updated?.length) {
    if (paidAt) {
      await syncPaidServiceCase({
        contractorId: updated[0].contractor_id,
        entityId,
        kind,
        paidAt,
      })
    }
    return
  }

  const userId = session.metadata?.userId
  if (!userId) return

  const { data: contractor, error: contractorError } = await supabase
    .from("contractor_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle()

  if (contractorError || !contractor) return

  const { error: insertError } = await supabase.from("service_fee_orders").insert({
    contractor_id: contractor.id,
    kind,
    entity_id: entityId,
    status: session.payment_status === "paid" ? "paid" : "checkout_ready",
    client_bureau_fee_cents: Number(session.metadata?.serviceFeeCents ?? 0),
    pass_through_fee_cents: Number(session.metadata?.passThroughFeeCents ?? 0),
    currency: "usd",
    stripe_checkout_url: session.url ?? null,
    stripe_session_id: session.id,
    paid_at: paidAt,
  })

  if (isMissingServiceFeeTable(insertError)) return
  if (insertError) throw new Error(insertError.message)

  if (paidAt) {
    await syncPaidServiceCase({
      contractorId: contractor.id,
      entityId,
      kind,
      paidAt,
    })
  }
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
