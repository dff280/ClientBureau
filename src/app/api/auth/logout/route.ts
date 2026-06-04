import { NextResponse } from "next/server"

import { getDataMode } from "@/lib/env"
import { withNoStore } from "@/lib/http"
import { createClient } from "@/lib/supabase/server"
import { getInternalRedirectUrl } from "@/lib/urls"

export async function GET(request: Request) {
  if (getDataMode() === "supabase") {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }

  return withNoStore(
    NextResponse.redirect(getInternalRedirectUrl("/login?loggedOut=true", request), { status: 303 }),
  )
}

export async function POST(request: Request) {
  return GET(request)
}
