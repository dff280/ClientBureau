import { NextResponse } from "next/server"

import { createAdminActionToken } from "@/lib/admin-action-token"
import { getCurrentUser } from "@/lib/auth"
import { noStoreHeaders } from "@/lib/http"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  const admin = await getCurrentUser("admin")

  if (admin?.role !== "admin") {
    return NextResponse.json(
      {
        ok: false,
        message: "Admin session is not active. Refresh the page and sign in again if needed.",
      },
      {
        status: 401,
        headers: noStoreHeaders,
      },
    )
  }

  const token = await createAdminActionToken(admin)

  return NextResponse.json(
    {
      ok: true,
      token,
    },
    {
      headers: noStoreHeaders,
    },
  )
}
