import { NextResponse } from "next/server"

import { getSafeInternalPath, resolveAuthenticatedUserProfile } from "@/lib/auth"
import { formDataToObject } from "@/lib/actions/result"
import { getDataMode } from "@/lib/env"
import { withNoStore } from "@/lib/http"
import { loginSchema } from "@/lib/schemas/client-bureau"
import { createClient } from "@/lib/supabase/server"
import { getInternalRedirectUrl } from "@/lib/urls"

function redirectToLogin(request: Request, params: Record<string, string>) {
  const url = getInternalRedirectUrl("/login", request)

  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value)
  }

  return withNoStore(NextResponse.redirect(url, { status: 303 }))
}

function redirectToPath(request: Request, path: string) {
  return withNoStore(NextResponse.redirect(getInternalRedirectUrl(path, request), { status: 303 }))
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const next = getSafeInternalPath(formData.get("next"))
  const parsed = loginSchema.safeParse(formDataToObject(formData))

  if (getDataMode() === "mock") {
    return redirectToPath(request, next ?? "/dashboard")
  }

  if (!parsed.success) {
    return redirectToLogin(request, {
      error: "Enter a valid email and password.",
      next: next ?? "",
    })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error || !data.user) {
    return redirectToLogin(request, {
      error: error?.message ?? "Login did not create a session. Try again.",
      next: next ?? "",
    })
  }

  const user = await resolveAuthenticatedUserProfile(data.user, supabase)
  const wantsAdmin = next?.startsWith("/admin") ?? false

  if (wantsAdmin && user.role !== "admin") {
    return redirectToLogin(request, {
      error:
        "This account is signed in, but it is not marked as an admin. Add the exact email to ADMIN_EMAILS or promote it in Supabase.",
      next: next ?? "/admin",
    })
  }

  return redirectToPath(request, next ?? (user.role === "admin" ? "/admin" : "/dashboard"))
}
