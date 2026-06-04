import { NextResponse } from "next/server"

import { noStoreHeaders } from "@/lib/http"
import { getLaunchHealth } from "@/lib/launch-health"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const health = await getLaunchHealth()

    return NextResponse.json(health, {
      headers: noStoreHeaders,
      status: health.status === "ok" ? 200 : 503,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "degraded",
        message: error instanceof Error ? error.message : "Launch health check failed.",
        timestamp: new Date().toISOString(),
      },
      { headers: noStoreHeaders, status: 503 },
    )
  }
}
