import { z } from "zod"

const envSchema = z.object({
  DATA_MODE: z.enum(["mock", "supabase"]).default("mock"),
  NEXT_PUBLIC_SITE_URL: z.url().default("https://clientbureau.com"),
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  SUPABASE_SECRET_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_PRO_MONTHLY: z.string().optional(),
  STRIPE_PRICE_TEAM_MONTHLY: z.string().optional(),
  NEXT_SERVER_ACTIONS_ENCRYPTION_KEY: z.string().optional(),
  ADMIN_EMAILS: z.string().optional(),
})

export type DataMode = "mock" | "supabase"

function readEnv() {
  return envSchema.parse(process.env)
}

export function getDataMode(): DataMode {
  return readEnv().DATA_MODE
}

export function isSupabaseDataMode() {
  return getDataMode() === "supabase"
}

export function getSiteUrl() {
  return readEnv().NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
}

export function getSupabaseServerKey() {
  const env = readEnv()

  return env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY
}

export function getStripeSecretKey() {
  return readEnv().STRIPE_SECRET_KEY
}

export function getStripeWebhookSecret() {
  return readEnv().STRIPE_WEBHOOK_SECRET
}

export function getAdminEmails() {
  return (readEnv().ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function requireProductionEnv(keys: string[]) {
  const missing = keys.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required production environment variables: ${missing.join(", ")}`)
  }
}
