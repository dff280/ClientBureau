import { NextResponse } from "next/server"

import { getDataMode, getSiteUrl } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  if (getDataMode() === "supabase") {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }

  return NextResponse.redirect(`${getSiteUrl()}/login?loggedOut=true`)
}

export async function POST() {
  return GET()
}
