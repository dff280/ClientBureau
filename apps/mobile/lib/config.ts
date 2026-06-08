export const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "https://clientbureau.com"

export const siteUrl =
  process.env.EXPO_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://clientbureau.com"

export const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
export const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export function hasNativeSupabaseConfig() {
  return Boolean(supabaseUrl && supabasePublishableKey)
}
