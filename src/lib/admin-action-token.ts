import { createHmac, timingSafeEqual } from "node:crypto"

import { ADMIN_ACTION_TOKEN_FIELD } from "@/lib/admin-action-token-field"
import { getDataMode, getSupabaseServerKey } from "@/lib/env"
import { hasSupabaseServiceConfig } from "@/lib/supabase/config"
import { createServiceClient } from "@/lib/supabase/service"
import type { User } from "@/lib/types"

const TOKEN_TTL_SECONDS = 4 * 60 * 60

type AdminActionTokenPayload = {
  sub: string
  email: string
  fullName: string
  role: "admin"
  iat: number
  exp: number
}

type AdminTokenResult =
  | { ok: true; admin: User }
  | { ok: false; reason: string }

function base64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url")
}

function parseBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8")
}

function getAdminActionSecret() {
  const secret = process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY || getSupabaseServerKey()

  if (secret) return secret

  if (process.env.NODE_ENV !== "production" || getDataMode() === "mock") {
    return "client-bureau-local-admin-action-secret"
  }

  throw new Error("Admin action signing requires NEXT_SERVER_ACTIONS_ENCRYPTION_KEY or a Supabase service key.")
}

function signPayload(encodedPayload: string) {
  return createHmac("sha256", getAdminActionSecret()).update(encodedPayload).digest("base64url")
}

function signaturesMatch(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

function userFromPayload(payload: AdminActionTokenPayload): User {
  return {
    id: payload.sub,
    email: payload.email,
    fullName: payload.fullName,
    role: "admin",
    createdAt: new Date(payload.iat * 1000).toISOString(),
  }
}

async function confirmAdminRole(payload: AdminActionTokenPayload): Promise<AdminTokenResult> {
  if (!hasSupabaseServiceConfig()) {
    return { ok: true, admin: userFromPayload(payload) }
  }

  const service = createServiceClient()
  const { data, error } = await service.from("users").select("*").eq("id", payload.sub).maybeSingle()

  if (error) return { ok: false, reason: error.message }

  if (!data || data.role !== "admin") {
    return { ok: false, reason: "The signed admin token is valid, but the user is no longer marked admin." }
  }

  return {
    ok: true,
    admin: {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      role: data.role,
      createdAt: data.created_at,
    },
  }
}

export async function createAdminActionToken(admin: User) {
  if (admin.role !== "admin") {
    throw new Error("Only admin users can receive admin action tokens.")
  }

  const now = Math.floor(Date.now() / 1000)
  const payload: AdminActionTokenPayload = {
    sub: admin.id,
    email: admin.email,
    fullName: admin.fullName,
    role: "admin",
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  }
  const encodedPayload = base64Url(JSON.stringify(payload))

  return `${encodedPayload}.${signPayload(encodedPayload)}`
}

export async function verifyAdminActionToken(token: string | null | undefined): Promise<AdminTokenResult> {
  if (!token) return { ok: false, reason: "No admin action token was submitted." }

  const [encodedPayload, signature] = token.split(".")

  if (!encodedPayload || !signature) {
    return { ok: false, reason: "The admin action token is malformed." }
  }

  if (!signaturesMatch(signPayload(encodedPayload), signature)) {
    return { ok: false, reason: "The admin action token signature is invalid." }
  }

  let payload: AdminActionTokenPayload

  try {
    payload = JSON.parse(parseBase64Url(encodedPayload)) as AdminActionTokenPayload
  } catch {
    return { ok: false, reason: "The admin action token payload could not be read." }
  }

  if (payload.role !== "admin" || !payload.sub || !payload.email || !payload.exp) {
    return { ok: false, reason: "The admin action token does not identify an admin user." }
  }

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return { ok: false, reason: "The admin action token expired. Refresh the admin page and try again." }
  }

  return confirmAdminRole(payload)
}

export async function verifyAdminActionTokenFromForm(formData: FormData) {
  const token = formData.get(ADMIN_ACTION_TOKEN_FIELD)

  return verifyAdminActionToken(typeof token === "string" ? token : undefined)
}
