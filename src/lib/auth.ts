import { redirect } from "next/navigation"

import type { Database } from "@/lib/database.types"
import { getDataMode } from "@/lib/env"
import { users } from "@/lib/mock-data"
import { createClient } from "@/lib/supabase/server"
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

export async function getCurrentUser(role: UserRole = "contractor"): Promise<User | null> {
  if (getDataMode() === "mock") {
    return getDemoUser(role)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile) {
    return {
      id: user.id,
      email: user.email ?? "",
      fullName:
        typeof user.user_metadata.full_name === "string"
          ? user.user_metadata.full_name
          : user.email ?? "Client Bureau user",
      role: "contractor",
      createdAt: user.created_at,
    }
  }

  return mapUser(profile)
}

export async function requireAuthenticatedUser(role: UserRole = "contractor") {
  const user = await getCurrentUser(role)

  if (!user) {
    redirect("/login")
  }

  return user
}

export async function requireRole(role: UserRole) {
  const user = await requireAuthenticatedUser(role)

  if (user.role !== role) {
    redirect(user.role === "admin" ? "/admin/reviews" : "/dashboard")
  }

  return user
}
