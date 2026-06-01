import { NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth"
import { getDataMode } from "@/lib/env"

export const dynamic = "force-dynamic"

export async function GET() {
  const user = await getCurrentUser("admin")

  return NextResponse.json({
    authenticated: Boolean(user),
    role: user?.role ?? null,
    email: user?.email ?? null,
    dataMode: getDataMode(),
    isAdmin: user?.role === "admin",
  })
}
