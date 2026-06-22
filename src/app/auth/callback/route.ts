import type { EmailOtpType } from "@supabase/supabase-js"
import type { User as SupabaseAuthUser } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

import { getSafeAuthCallbackReturnPath } from "@/lib/auth"
import { withNoStore } from "@/lib/http"
import { bootstrapSignupProfileFromAuthUser } from "@/lib/signup-profile-bootstrap"
import { createClient } from "@/lib/supabase/server"
import { getInternalRedirectUrl } from "@/lib/urls"

export const dynamic = "force-dynamic"

function loginRedirect(request: Request, message: string) {
  const url = getInternalRedirectUrl("/login", request)
  url.searchParams.set("error", message)

  return withNoStore(NextResponse.redirect(url, { status: 303 }))
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const tokenHash = requestUrl.searchParams.get("token_hash")
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null
  const next = getSafeAuthCallbackReturnPath(requestUrl.searchParams.get("next")) ?? "/dashboard"
  const supabase = await createClient()

  async function finishAuth(user?: SupabaseAuthUser | null) {
    const authUser = user ?? (await supabase.auth.getUser()).data.user

    if (authUser) {
      try {
        await bootstrapSignupProfileFromAuthUser(authUser)
      } catch (error) {
        console.warn("Client Bureau signup profile bootstrap failed after auth callback.", error)
      }
    }

    return withNoStore(NextResponse.redirect(getInternalRedirectUrl(next, request), { status: 303 }))
  }

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) return finishAuth(data.user)

    return loginRedirect(request, error.message)
  }

  if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })

    if (!error) return finishAuth(data.user)

    return loginRedirect(request, error.message)
  }

  return loginRedirect(request, "The auth confirmation link was missing a usable token.")
}
