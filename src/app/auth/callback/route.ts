import type { EmailOtpType } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

import { getSafeInternalPath } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

function loginRedirect(request: Request, message: string) {
  const url = new URL("/login", request.url)
  url.searchParams.set("error", message)

  return NextResponse.redirect(url, { status: 303 })
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const tokenHash = requestUrl.searchParams.get("token_hash")
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null
  const next = getSafeInternalPath(requestUrl.searchParams.get("next")) ?? "/dashboard"
  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) return NextResponse.redirect(new URL(next, request.url), { status: 303 })

    return loginRedirect(request, error.message)
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })

    if (!error) return NextResponse.redirect(new URL(next, request.url), { status: 303 })

    return loginRedirect(request, error.message)
  }

  return loginRedirect(request, "The auth confirmation link was missing a usable token.")
}
