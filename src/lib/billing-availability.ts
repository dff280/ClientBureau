import {
  getStripeProPriceId,
  getStripeSecretKey,
  getStripeTeamPriceId,
  getStripeWebhookSecret,
  isBillingCheckoutEnabled,
} from "@/lib/env"
import type { SubscriptionTier } from "@/lib/types"

export type BillingAvailabilityStatus = "deferred" | "ready"

export type BillingPlanInterest = SubscriptionTier | "enterprise"

export interface BillingAvailabilityInput {
  checkoutEnabled?: boolean
  stripeSecretKey?: string
  stripeWebhookSecret?: string
  stripeProPriceId?: string
  stripeTeamPriceId?: string
}

export interface BillingAvailability {
  status: BillingAvailabilityStatus
  checkoutEnabled: boolean
  stripeSecretConfigured: boolean
  stripeWebhookConfigured: boolean
  proPriceConfigured: boolean
  teamPriceConfigured: boolean
  subscriptionCheckoutAvailable: boolean
  serviceFeeCheckoutAvailable: boolean
  publicStatusLabel: string
  publicStatusDetail: string
  dashboardStatusLabel: string
  dashboardStatusDetail: string
}

export function evaluateBillingAvailability(input: BillingAvailabilityInput = {}): BillingAvailability {
  const checkoutEnabled = Boolean(input.checkoutEnabled)
  const stripeSecretConfigured = Boolean(input.stripeSecretKey)
  const stripeWebhookConfigured = Boolean(input.stripeWebhookSecret)
  const proPriceConfigured = Boolean(input.stripeProPriceId)
  const teamPriceConfigured = Boolean(input.stripeTeamPriceId)
  const subscriptionCheckoutAvailable =
    checkoutEnabled &&
    stripeSecretConfigured &&
    stripeWebhookConfigured &&
    proPriceConfigured &&
    teamPriceConfigured
  const serviceFeeCheckoutAvailable = checkoutEnabled && stripeSecretConfigured && stripeWebhookConfigured
  const status: BillingAvailabilityStatus =
    subscriptionCheckoutAvailable && serviceFeeCheckoutAvailable ? "ready" : "deferred"

  return {
    status,
    checkoutEnabled,
    stripeSecretConfigured,
    stripeWebhookConfigured,
    proPriceConfigured,
    teamPriceConfigured,
    subscriptionCheckoutAvailable,
    serviceFeeCheckoutAvailable,
    publicStatusLabel: status === "ready" ? "Checkout available" : "Free account open",
    publicStatusDetail:
      status === "ready"
        ? "Paid activation can continue after account sign-in and checkout review."
        : "Paid plan activation is reviewed before any billing is collected. Free accounts remain open.",
    dashboardStatusLabel: status === "ready" ? "Billing active" : "Billing review mode",
    dashboardStatusDetail:
      status === "ready"
        ? "Checkout and webhook configuration are enabled for plan and service-fee payment flows."
        : "Plan and service-fee checkout are not open from the workspace yet. Account records and private tools remain available.",
  }
}

export function getBillingAvailability(): BillingAvailability {
  return evaluateBillingAvailability({
    checkoutEnabled: isBillingCheckoutEnabled(),
    stripeSecretKey: getStripeSecretKey(),
    stripeWebhookSecret: getStripeWebhookSecret(),
    stripeProPriceId: getStripeProPriceId(),
    stripeTeamPriceId: getStripeTeamPriceId(),
  })
}

export function isBillingPlanInterest(value?: string | null): value is BillingPlanInterest {
  return value === "free" || value === "pro" || value === "bureau_team" || value === "enterprise"
}

export function planInterestLabel(value?: string | null) {
  if (value === "pro") return "Pro Check"
  if (value === "bureau_team") return "Bureau Pro"
  if (value === "enterprise") return "Enterprise"

  return "Free"
}

export function billingInterestSignupHref(plan: BillingPlanInterest) {
  return plan === "free" ? "/signup?plan=free" : `/signup?plan=${plan}`
}
