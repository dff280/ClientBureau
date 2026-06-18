import { createServerClient } from "@supabase/ssr"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import type { Database } from "@/lib/database.types"

function markNoStore(response: NextResponse) {
  response.headers.set("Cache-Control", "no-store, max-age=0")

  return response
}

function isPrivateIdentifierSearch(value: string) {
  const digits = value.replace(/\D/g, "")

  return value.includes("@") || digits.length >= 7
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/search") {
    const query = request.nextUrl.searchParams.get("q") ?? ""

    if (isPrivateIdentifierSearch(query)) {
      const safeUrl = request.nextUrl.clone()
      safeUrl.searchParams.delete("q")
      safeUrl.searchParams.set("privateMatch", "1")

      return markNoStore(NextResponse.redirect(safeUrl))
    }

    return markNoStore(NextResponse.next())
  }

  if ((process.env.DATA_MODE ?? "mock") === "mock") {
    return markNoStore(NextResponse.next())
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
  matcher: ["/search", "/dashboard/:path*", "/submit-report/:path*", "/admin/:path*"],
}
