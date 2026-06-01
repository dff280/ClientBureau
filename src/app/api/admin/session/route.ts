import { NextResponse } from "next/server"
import { cookies } from "next/headers"

import { getCurrentUser } from "@/lib/auth"
import { getAdminEmails, getDataMode } from "@/lib/env"
import { hasSupabaseServiceConfig } from "@/lib/supabase/config"

export const dynamic = "force-dynamic"

export async function GET() {
  const cookieStore = await cookies()
  const authCookieCount = cookieStore
    .getAll()
    .filter((cookie) => cookie.name.startsWith("sb-") || cookie.name.includes("auth-token")).length
  const user = await getCurrentUser("admin")
  const isAdmin = user?.role === "admin"
  const status = !user ? "signed_out" : isAdmin ? "admin" : "not_admin"
  const adminEmailAllowlistConfigured = getAdminEmails().length > 0
  const serviceRoleConfigured = hasSupabaseServiceConfig()

  return NextResponse.json({
    authenticated: Boolean(user),
    role: user?.role ?? null,
    email: user?.email ?? null,
    dataMode: getDataMode(),
    isAdmin,
    status,
    authCookiePresent: authCookieCount > 0,
    authCookieCount,
    adminEmailAllowlistConfigured,
    serviceRoleConfigured,
    loginUrl: "/login?next=/admin",
    nextStep: !user
      ? authCookieCount === 0
        ? adminEmailAllowlistConfigured
          ? "No Supabase auth cookie reached the server. Log in at /login?next=/admin in this same browser."
          : "Set ADMIN_EMAILS on the VPS, rebuild, then log in at /login?next=/admin in this same browser."
        : "An auth cookie reached the server, but Supabase did not accept it. Log in again to refresh the session."
      : isAdmin
        ? "Admin session is valid."
        : adminEmailAllowlistConfigured
          ? "This user is signed in but not admin. Confirm the email is in ADMIN_EMAILS and public.users has role=admin."
          : "This user is signed in but not admin. Set ADMIN_EMAILS or promote this email in public.users.",
  })
}
