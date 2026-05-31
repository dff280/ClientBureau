import { NextResponse } from "next/server"
import type Stripe from "stripe"

import { getStripe, getRequiredStripeWebhookSecret } from "@/lib/stripe/server"
import {
  syncCheckoutSessionSubscription,
  syncStripeSubscription,
} from "@/lib/stripe/subscriptions"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const stripe = getStripe()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      getRequiredStripeWebhookSecret(),
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid Stripe webhook."

    return NextResponse.json({ error: message }, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed":
      await syncCheckoutSessionSubscription(event.data.object as Stripe.Checkout.Session)
      break
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "invoice.paid":
    case "invoice.payment_failed": {
      type InvoiceWithSubscription = Stripe.Invoice & {
        subscription?: Stripe.Subscription | string | null
      }
      const invoice = event.type.startsWith("invoice.")
        ? (event.data.object as InvoiceWithSubscription)
        : undefined
      const subscription = invoice
        ? invoice.parent?.subscription_details?.subscription ?? invoice.subscription
        : (event.data.object as Stripe.Subscription)

      if (typeof subscription === "object" && subscription) {
        await syncStripeSubscription(subscription)
      } else if (typeof subscription === "string") {
        await syncStripeSubscription(await stripe.subscriptions.retrieve(subscription))
      }

      break
    }
    default:
      break
  }

  return NextResponse.json({ received: true })
}
