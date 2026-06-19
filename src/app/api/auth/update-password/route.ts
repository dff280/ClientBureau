import { NextResponse } from "next/server"

import { formDataToObject } from "@/lib/actions/result"
import { getDataMode } from "@/lib/env"
import { withNoStore } from "@/lib/http"
import { passwordUpdateSchema } from "@/lib/schemas/client-bureau"
import { createClient } from "@/lib/supabase/server"
import { getInternalRedirectUrl } from "@/lib/urls"

function redirectTo(request: Request, path: string) {
  return withNoStore(NextResponse.redirect(getInternalRedirectUrl(path, request), { status: 303 }))
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const parsed = passwordUpdateSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    const message = encodeURIComponent(parsed.error.issues[0]?.message ?? "Enter and confirm a valid new password.")

    return redirectTo(request, `/reset-password?error=${message}`)
  }

  if (getDataMode() === "supabase") {
    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password })

    if (error) {
      return redirectTo(
        request,
        `/forgot-password?error=${encodeURIComponent("The reset link expired or could not be verified. Request a new reset link.")}`,
      )
    }

    await supabase.auth.signOut()
  }

  return redirectTo(request, "/login?reset=1")
}
