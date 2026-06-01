import { redirect } from "next/navigation"

import type { Database } from "@/lib/database.types"
import { getAdminEmails, getDataMode } from "@/lib/env"
import { users } from "@/lib/mock-data"
import { hasSupabaseServiceConfig } from "@/lib/supabase/config"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import type { User, UserRole } from "@/lib/types"

type UserRow = Database["public"]["Tables"]["users"]["Row"]

export function getDemoUser(role: UserRole = "contractor") {
  const user = users.find((candidate) => candidate.role === role)

  if (!user) {
    throw new Error(`No mock ${role} user is seeded.`)
  }

  return user
}

function mapUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    createdAt: row.created_at,
  }
}

function isConfiguredAdminEmail(email?: string | null) {
  if (!email) return false

  return getAdminEmails().includes(email.trim().toLowerCase())
}

function fallbackUserFromAuth(user: {
  id: string
  email?: string | null
  user_metadata: Record<string, unknown>
  created_at: string
}): User {
  const fullName =
    typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name
      : user.email ?? "Client Bureau user"

  return {
    id: user.id,
    email: user.email ?? "",
    fullName,
    role: isConfiguredAdminEmail(user.email) ? "admin" : "contractor",
    createdAt: user.created_at,
  }
}

async function getUserProfile(userId: string, requestClient: Awaited<ReturnType<typeof createClient>>) {
  if (hasSupabaseServiceConfig()) {
    const service = createServiceClient()
    const { data, error } = await service.from("users").select("*").eq("id", userId).maybeSingle()

    if (error) throw new Error(error.message)

    return data
  }

  const { data, error } = await requestClient.from("users").select("*").eq("id", userId).maybeSingle()

  if (error) throw new Error(error.message)

  return data
}

async function upsertConfiguredAdminProfile(user: ReturnType<typeof fallbackUserFromAuth>) {
  if (!hasSupabaseServiceConfig() || !isConfiguredAdminEmail(user.email)) return null

  const service = createServiceClient()
  const { data, error } = await service
    .from("users")
    .upsert(
      {
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        role: "admin",
      },
      { onConflict: "id" },
    )
    .select("*")
    .single()

  if (error) throw new Error(error.message)

  return data
}

export async function getCurrentUser(role: UserRole = "contractor"): Promise<User | null> {
  if (getDataMode() === "mock") {
    return getDemoUser(role)
  }

  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null

  const fallbackUser = fallbackUserFromAuth(user)
  const configuredAdminProfile = await upsertConfiguredAdminProfile(fallbackUser)

  if (configuredAdminProfile) return mapUser(configuredAdminProfile)

  const profile = await getUserProfile(user.id, supabase)

  if (!profile) {
    return fallbackUser
  }

  return mapUser(profile)
}

function loginRedirect(next?: string): never {
  const target = next && next.startsWith("/") && !next.startsWith("//") ? `?next=${encodeURIComponent(next)}` : ""

  redirect(`/login${target}`)
}

export async function requireAuthenticatedUser(role: UserRole = "contractor", next?: string) {
  const user = await getCurrentUser(role)

  if (!user) {
    loginRedirect(next)
  }

  return user
}

export async function requireContractorAccess(next?: string) {
  const user = await requireAuthenticatedUser("contractor", next)

  if (!["contractor", "admin"].includes(user.role)) {
    loginRedirect(next)
  }

  return user
}

export async function requireRole(role: UserRole, next?: string) {
  const user = await requireAuthenticatedUser(role, next)

  if (user.role !== role) {
    redirect(user.role === "admin" ? "/admin" : "/dashboard")
  }

  return user
}
