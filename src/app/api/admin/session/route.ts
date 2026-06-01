import { NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth"
import { getAdminEmails, getDataMode } from "@/lib/env"

export const dynamic = "force-dynamic"

export async function GET() {
  const user = await getCurrentUser("admin")
  const isAdmin = user?.role === "admin"
  const status = !user ? "signed_out" : isAdmin ? "admin" : "not_admin"

  return NextResponse.json({
    authenticated: Boolean(user),
    role: user?.role ?? null,
    email: user?.email ?? null,
    dataMode: getDataMode(),
    isAdmin,
    status,
    adminEmailAllowlistConfigured: getAdminEmails().length > 0,
    nextStep: !user
      ? "Log in again, then refresh this endpoint."
      : isAdmin
        ? "Admin session is valid."
        : "Promote this email in public.users or add it to ADMIN_EMAILS.",
  })
}
