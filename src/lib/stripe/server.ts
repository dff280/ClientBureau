import Stripe from "stripe"

import { getStripeSecretKey, getStripeWebhookSecret } from "@/lib/env"

export function hasStripeConfig() {
  return Boolean(getStripeSecretKey())
}

export function getStripe() {
  const secretKey = getStripeSecretKey()

  if (!secretKey) {
    throw new Error("Stripe is not configured. Add STRIPE_SECRET_KEY.")
  }

  return new Stripe(secretKey)
}

export function getRequiredStripeWebhookSecret() {
  const webhookSecret = getStripeWebhookSecret()

  if (!webhookSecret) {
    throw new Error("Stripe webhook secret is not configured. Add STRIPE_WEBHOOK_SECRET.")
  }

  return webhookSecret
}
