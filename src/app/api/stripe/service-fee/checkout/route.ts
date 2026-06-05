import { NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth"
import { getSiteUrl } from "@/lib/env"
import { getStripe, hasStripeConfig } from "@/lib/stripe/server"
import type { ServiceFeeKind } from "@/lib/types"

export const runtime = "nodejs"

function isServiceFeeKind(value: string | null): value is ServiceFeeKind {
  return value === "managed_recovery" || value === "florida_lien_notice" || value === "florida_lien_filing"
}

function feeConfig(kind: ServiceFeeKind) {
  if (kind === "florida_lien_filing") {
    return {
      name: "Client Bureau Florida lien filing service",
      clientBureauFeeCents: 29900,
      passThroughFeeCents: 6800,
      successPath: "/dashboard/lien-readiness?service_fee=success",
      cancelPath: "/dashboard/lien-readiness?service_fee=cancelled",
    }
  }

  if (kind === "florida_lien_notice") {
    return {
      name: "Client Bureau Florida lien notice service",
      clientBureauFeeCents: 19900,
      passThroughFeeCents: 2200,
      successPath: "/dashboard/lien-readiness?service_fee=success",
      cancelPath: "/dashboard/lien-readiness?service_fee=cancelled",
    }
  }

  return {
    name: "Client Bureau managed payment recovery service",
    clientBureauFeeCents: 14900,
    passThroughFeeCents: 0,
    successPath: "/dashboard/recovery?service_fee=success",
    cancelPath: "/dashboard/recovery?service_fee=cancelled",
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const siteUrl = getSiteUrl()
  const kind = url.searchParams.get("kind")
  const entityId = url.searchParams.get("entity")

  if (!isServiceFeeKind(kind) || !entityId) {
    return NextResponse.redirect(`${siteUrl}/dashboard?service_fee=invalid`, 303)
  }

  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.redirect(`${siteUrl}/login?next=${encodeURIComponent(`/api/stripe/service-fee/checkout?kind=${kind}&entity=${entityId}`)}`, 303)
  }

  const config = feeConfig(kind)
  const totalAmount = config.clientBureauFeeCents + config.passThroughFeeCents

  if (!hasStripeConfig()) {
    return NextResponse.redirect(`${siteUrl}${config.cancelPath}&reason=unavailable`, 303)
  }

  const stripe = getStripe()
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: config.name,
            description:
              config.passThroughFeeCents > 0
                ? "Includes Client Bureau service fee plus pass-through county/vendor costs."
                : "Client Bureau service fee. Client payments remain contractor-direct.",
          },
          unit_amount: totalAmount,
        },
        quantity: 1,
      },
    ],
    success_url: `${siteUrl}${config.successPath}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}${config.cancelPath}`,
    client_reference_id: entityId,
    metadata: {
      kind,
      entityId,
      userId: user.id,
      serviceFeeCents: String(config.clientBureauFeeCents),
      passThroughFeeCents: String(config.passThroughFeeCents),
    },
  })

  if (!session.url) {
    return NextResponse.redirect(`${siteUrl}${config.cancelPath}&reason=error`, 303)
  }

  return NextResponse.redirect(session.url, 303)
}
