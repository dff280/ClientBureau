import { NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth"
import { noStoreHeaders } from "@/lib/http"

export const dynamic = "force-dynamic"

export async function GET() {
  const user = await getCurrentUser()

  return NextResponse.json(
    {
      authenticated: Boolean(user),
      role: user?.role ?? null,
      email: user?.email ?? null,
      fullName: user?.fullName ?? null,
    },
    { headers: noStoreHeaders },
  )
}
