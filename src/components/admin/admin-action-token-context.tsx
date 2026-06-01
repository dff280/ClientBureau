"use client"

import { createContext, useContext } from "react"

import { ADMIN_ACTION_TOKEN_FIELD } from "@/lib/admin-action-token-field"

const AdminActionTokenContext = createContext("")

export function AdminActionTokenProvider({
  token,
  children,
}: {
  token: string
  children: React.ReactNode
}) {
  return <AdminActionTokenContext.Provider value={token}>{children}</AdminActionTokenContext.Provider>
}

export function AdminActionTokenInput() {
  const token = useContext(AdminActionTokenContext)

  if (!token) return null

  return <input type="hidden" name={ADMIN_ACTION_TOKEN_FIELD} value={token} />
}
