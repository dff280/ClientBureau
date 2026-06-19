import { NextResponse } from "next/server"

import { formDataToObject } from "@/lib/actions/result"
import { getDataMode, getSiteUrl } from "@/lib/env"
import { withNoStore } from "@/lib/http"
import { passwordResetRequestSchema } from "@/lib/schemas/client-bureau"
import { createClient } from "@/lib/supabase/server"
import { getInternalRedirectUrl } from "@/lib/urls"

function redirectTo(request: Request, path: string) {
  return withNoStore(NextResponse.redirect(getInternalRedirectUrl(path, request), { status: 303 }))
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const parsed = passwordResetRequestSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return redirectTo(request, "/forgot-password?error=Enter%20a%20valid%20account%20email.")
  }

  if (getDataMode() === "supabase") {
    const supabase = await createClient()

    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
    })
  }

  return redirectTo(request, "/forgot-password?sent=1")
}
