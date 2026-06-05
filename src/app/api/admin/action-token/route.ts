import { NextResponse } from "next/server"

import { createAdminActionToken } from "@/lib/admin-action-token"
import { requireRole } from "@/lib/auth"
import { noStoreHeaders } from "@/lib/http"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  const admin = await requireRole("admin", "/admin")
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
