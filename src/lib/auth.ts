import type { User as SupabaseAuthUser } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

import type { Database } from "@/lib/database.types"
import { getAdminEmails, getDataMode } from "@/lib/env"
import { users } from "@/lib/mock-data"
import { hasSupabaseServiceConfig } from "@/lib/supabase/config"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import type { User, UserRole } from "@/lib/types"

type UserRow = Database["public"]["Tables"]["users"]["Row"]
type SupabaseAuthUserLike = Pick<SupabaseAuthUser, "id" | "email" | "user_metadata" | "created_at">

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

export function isConfiguredAdminEmail(email?: string | null) {
  if (!email) return false

  return getAdminEmails().includes(email.trim().toLowerCase())
}

function fallbackUserFromAuth(user: SupabaseAuthUserLike): User {
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

async function getUserProfile(userId: string, requestClient?: Awaited<ReturnType<typeof createClient>>) {
  if (hasSupabaseServiceConfig()) {
    const service = createServiceClient()
    const { data, error } = await service.from("users").select("*").eq("id", userId).maybeSingle()

    if (error) throw new Error(error.message)

    return data
  }

  if (!requestClient) return null

  const { data, error } = await requestClient.from("users").select("*").eq("id", userId).maybeSingle()

  if (error) throw new Error(error.message)

  return data
}

async function upsertFallbackUserProfile(user: User) {
  if (!hasSupabaseServiceConfig()) return null

  const service = createServiceClient()
  const { data, error } = await service
    .from("users")
    .insert({
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      role: user.role,
    })
    .select("*")
    .single()

  if (!error) return data

  const duplicateKey = error.code === "23505"

  if (!duplicateKey) throw new Error(error.message)

  return getUserProfile(user.id)
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

export async function resolveAuthenticatedUserProfile(
  authUser: SupabaseAuthUserLike,
  requestClient?: Awaited<ReturnType<typeof createClient>>,
): Promise<User> {
  const fallbackUser = fallbackUserFromAuth(authUser)
  const configuredAdminProfile = await upsertConfiguredAdminProfile(fallbackUser)

  if (configuredAdminProfile) return mapUser(configuredAdminProfile)

  const profile = await getUserProfile(authUser.id, requestClient)

  if (profile) return mapUser(profile)

  const createdProfile = await upsertFallbackUserProfile(fallbackUser)

  return createdProfile ? mapUser(createdProfile) : fallbackUser
}

export function getSafeInternalPath(value?: unknown) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : undefined
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

  return resolveAuthenticatedUserProfile(user, supabase)
}

function loginRedirect(next?: string): never {
  const safeNext = getSafeInternalPath(next)
  const target = safeNext ? `?next=${encodeURIComponent(safeNext)}` : ""

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
