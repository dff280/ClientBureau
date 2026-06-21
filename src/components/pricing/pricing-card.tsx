import { Check } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { billingInterestSignupHref } from "@/lib/billing-availability"
import type { PricingTier } from "@/lib/stripe/pricing"
import { cn } from "@/lib/utils"

export function PricingCard({ tier }: { tier: PricingTier }) {
  const isEnterprise = tier.id === "enterprise"
  const href = isEnterprise ? "/enterprise#enterprise-inquiry" : billingInterestSignupHref(tier.id)
  const cta =
    tier.id === "free"
      ? "Create free account"
      : tier.id === "pro"
        ? "Start Pro Check"
        : tier.id === "bureau_team"
          ? "Start Bureau Pro"
          : "Request enterprise review"

  return (
    <Card
      className={cn(
        "rounded-md border-slate-200 shadow-sm",
        tier.featured && "border-amber-300 bg-amber-50/50 shadow-md",
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-xl text-slate-950">{tier.name}</CardTitle>
          {tier.featured ? (
            <span className="rounded-md bg-slate-950 px-2 py-1 text-xs font-semibold text-white">
              Best value
            </span>
          ) : null}
        </div>
        <p className="text-sm leading-6 text-slate-600">{tier.description}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <span className="text-4xl font-semibold text-slate-950">{tier.price}</span>
          <span className="ml-2 text-sm font-medium text-slate-500">{tier.cadence}</span>
        </div>
        <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600">
          {tier.launchNote}
        </p>
        <ul className="space-y-3 text-sm text-slate-700">
          {tier.features.map((feature) => (
            <li key={feature} className="flex gap-2">
              <Check className="mt-0.5 size-4 text-emerald-600" aria-hidden="true" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          asChild
          className={cn("w-full", tier.featured ? "bg-slate-950 text-white hover:bg-slate-800" : "")}
          variant={tier.featured ? "default" : "outline"}
        >
          <Link href={href}>{cta}</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
