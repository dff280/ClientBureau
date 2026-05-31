import type { Metadata } from "next"
import { CreditCard, Webhook } from "lucide-react"

import { PricingCard } from "@/components/pricing/pricing-card"
import { Card, CardContent } from "@/components/ui/card"
import { pricingTiers } from "@/lib/stripe/pricing"

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Client Bureau pricing for contractors and teams, with Stripe test checkout and subscription-ready tiers.",
}

export default function PricingPage() {
  return (
    <section className="bureau-section bg-slate-100">
      <div className="bureau-container space-y-10">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <p className="text-sm font-semibold uppercase text-amber-700">Pricing</p>
          <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
            Contractor-first plans, ready for Stripe Billing.
          </h1>
          <p className="leading-7 text-slate-600">
            Paid plans use Stripe Checkout when test keys and price IDs are configured. Without
            Stripe keys, buttons fall back to a safe mock checkout state for local demos.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {pricingTiers.map((tier) => (
            <PricingCard key={tier.id} tier={tier} />
          ))}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-3 p-6">
              <CreditCard className="size-8 text-slate-950" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-slate-950">Checkout integration point</h2>
              <p className="text-sm leading-6 text-slate-600">
                The checkout route creates Stripe subscription sessions with the selected tier&apos;s
                price ID and the authenticated contractor profile when Supabase mode is active.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-3 p-6">
              <Webhook className="size-8 text-slate-950" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-slate-950">Webhook integration point</h2>
              <p className="text-sm leading-6 text-slate-600">
                Stripe webhooks update the subscriptions table with customer, subscription, price,
                status, and billing period fields after checkout and invoice events.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
