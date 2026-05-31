import { getSupabaseServerKey } from "@/lib/env"

export function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  )
}

export function hasSupabaseServiceConfig() {
  return hasSupabaseConfig() && Boolean(getSupabaseServerKey())
}

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !publishableKey) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    )
  }

  return { url, publishableKey }
}

export function getSupabaseServiceConfig() {
  const { url } = getSupabaseConfig()
  const serviceKey = getSupabaseServerKey()

  if (!serviceKey) {
    throw new Error(
      "Supabase service key is not configured. Add SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY.",
    )
  }

  return { url, serviceKey }
}
