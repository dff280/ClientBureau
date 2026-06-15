"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

import { ADMIN_ACTION_TOKEN_FIELD } from "@/lib/admin-action-token-field"

const AdminActionTokenContext = createContext("")

export function AdminActionTokenProvider({
  token,
  children,
}: {
  token: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [currentToken, setCurrentToken] = useState(token)
  const routeKey = useMemo(() => `${pathname}?${searchParams.toString()}`, [pathname, searchParams])

  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/action-token", {
        cache: "no-store",
        credentials: "include",
      })
      const data = (await response.json()) as { ok?: boolean; token?: string }

      if (response.ok && data.ok && data.token) {
        setCurrentToken(data.token)
      }
    } catch {
      // Keep the current token; server actions still verify it.
    }
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void refreshToken()
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [refreshToken, routeKey])

  useEffect(() => {
    const interval = window.setInterval(() => {
      void refreshToken()
    }, 5 * 60 * 1000)

    return () => window.clearInterval(interval)
  }, [refreshToken])

  useEffect(() => {
    const onFocus = () => {
      void refreshToken()
    }
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void refreshToken()
    }

    window.addEventListener("focus", onFocus)
    document.addEventListener("visibilitychange", onVisibilityChange)

    return () => {
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [refreshToken])

  return <AdminActionTokenContext.Provider value={currentToken}>{children}</AdminActionTokenContext.Provider>
}

export function AdminActionTokenInput() {
  const token = useContext(AdminActionTokenContext)

  if (!token) return null

  return <input type="hidden" name={ADMIN_ACTION_TOKEN_FIELD} value={token} />
}
