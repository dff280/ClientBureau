import { createServerClient } from "@supabase/ssr"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import type { Database } from "@/lib/database.types"

function markNoStore(response: NextResponse) {
  response.headers.set("Cache-Control", "no-store, max-age=0")

  return response
}

function hasReadableSupabaseAuthCookie(request: NextRequest) {
  return request.cookies
    .getAll()
    .some(
      (cookie) =>
        cookie.name.startsWith("sb-") &&
        cookie.name.includes("auth-token") &&
        cookie.value.trim().length > 0,
    )
}

function safeNextPath(pathname: string, search: string) {
  const candidate = `${pathname}${search}`

  return candidate.startsWith("/") && !candidate.startsWith("//") ? candidate : "/dashboard"
}

export async function proxy(request: NextRequest) {
  if ((process.env.DATA_MODE ?? "mock") === "mock") {
    return markNoStore(NextResponse.next())
  }

  if (!hasReadableSupabaseAuthCookie(request)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    loginUrl.search = ""
    loginUrl.searchParams.set("next", safeNextPath(request.nextUrl.pathname, request.nextUrl.search))

    return markNoStore(NextResponse.redirect(loginUrl))
  }

  let response = NextResponse.next({ request })
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return markNoStore(response)
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  await supabase.auth.getUser()

  return markNoStore(response)
}

export const config = {
  matcher: ["/dashboard/:path*", "/submit-report/:path*", "/client-response/:path*", "/admin/:path*"],
}
