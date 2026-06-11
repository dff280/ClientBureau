import type { User as SupabaseAuthUser } from "@supabase/supabase-js"
import { cookies } from "next/headers"
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
type CookieLike = { name: string; value: string }

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
    accountType: row.account_type ?? (row.role === "contractor" ? "contractor" : undefined),
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
    accountType: user.user_metadata.account_type === "client" ? "client" : "contractor",
    createdAt: user.created_at,
  }
}

function authCookieBaseName(name: string) {
  return name.replace(/\.\d+$/, "")
}

function authCookieChunkIndex(name: string) {
  const match = /\.(\d+)$/.exec(name)

  return match ? Number(match[1]) : 0
}

function getSupabaseAuthCookiePayloads(cookieList: CookieLike[]) {
  const groups = new Map<string, CookieLike[]>()

  for (const cookie of cookieList) {
    if (!cookie.name.startsWith("sb-") || !cookie.name.includes("auth-token")) continue

    const baseName = authCookieBaseName(cookie.name)
    groups.set(baseName, [...(groups.get(baseName) ?? []), cookie])
  }

  return [...groups.values()].map((group) =>
    group
      .sort((left, right) => authCookieChunkIndex(left.name) - authCookieChunkIndex(right.name))
      .map((cookie) => cookie.value)
      .join(""),
  )
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/")
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4)

  return Buffer.from(`${normalized}${padding}`, "base64").toString("utf8")
}

function parseAuthCookiePayload(value: string): unknown {
  const candidates = [value]

  try {
    candidates.push(decodeURIComponent(value))
  } catch {
    // Cookie values are not always URI encoded.
  }

  for (const candidate of candidates) {
    const decoded = candidate.startsWith("base64-") ? decodeBase64Url(candidate.slice("base64-".length)) : candidate

    try {
      const parsed = JSON.parse(decoded) as unknown

      if (typeof parsed === "string") {
        return JSON.parse(parsed) as unknown
      }

      return parsed
    } catch {
      // Try the next representation.
    }
  }

  return null
}

function findAccessToken(value: unknown, depth = 0): string | null {
  if (depth > 4 || !value) return null

  if (typeof value === "object" && "access_token" in value) {
    const token = (value as { access_token?: unknown }).access_token

    if (typeof token === "string" && token.length > 0) return token
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const token = findAccessToken(item, depth + 1)

      if (token) return token
    }

    return null
  }

  if (typeof value === "object") {
    for (const item of Object.values(value)) {
      const token = findAccessToken(item, depth + 1)

      if (token) return token
    }
  }

  return null
}

async function getAccessTokenFromSupabaseCookie() {
  const cookieStore = await cookies()
  const payloads = getSupabaseAuthCookiePayloads(cookieStore.getAll())

  for (const payload of payloads) {
    const token = findAccessToken(parseAuthCookiePayload(payload))

    if (token) return token
  }

  return null
}

export async function getAuthCookieDiagnostics() {
  const cookieStore = await cookies()
  const payloads = getSupabaseAuthCookiePayloads(cookieStore.getAll())

  return {
    authCookieCount: cookieStore
      .getAll()
      .filter((cookie) => cookie.name.startsWith("sb-") || cookie.name.includes("auth-token")).length,
    supabaseAuthCookieGroups: payloads.length,
    supabaseAuthCookieHasAccessToken: payloads.some((payload) => Boolean(findAccessToken(parseAuthCookiePayload(payload)))),
  }
}

async function getAuthUserFromCookieFallback(requestClient?: Awaited<ReturnType<typeof createClient>>) {
  const accessToken = await getAccessTokenFromSupabaseCookie()

  if (!accessToken) return null

  const verifier = hasSupabaseServiceConfig() ? createServiceClient() : requestClient

  if (!verifier) return null

  const {
    data: { user },
    error,
  } = await verifier.auth.getUser(accessToken)

  if (error || !user) return null

  return user
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

export function getPostSignupRedirectPath(accountType: User["accountType"], requestedNext?: unknown) {
  const safeNext = getSafeInternalPath(requestedNext)
  const defaultPath = accountType === "client" ? "/client-response" : "/dashboard"

  if (
    !safeNext ||
    safeNext.startsWith("/admin") ||
    safeNext.startsWith("/api") ||
    safeNext.startsWith("/auth") ||
    safeNext === "/login" ||
    safeNext.startsWith("/login?") ||
    safeNext === "/signup" ||
    safeNext.startsWith("/signup?")
  ) {
    return defaultPath
  }

  return safeNext
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

  const authUser = error || !user ? await getAuthUserFromCookieFallback(supabase) : user

  if (!authUser) return null

  return resolveAuthenticatedUserProfile(authUser, supabase)
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
