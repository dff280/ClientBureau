import { z } from "zod"

const envSchema = z.object({
  DATA_MODE: z.enum(["mock", "supabase"]).default("mock"),
  PLATFORM_FEATURE_DATA_MODE: z.enum(["mock", "supabase"]).default("mock"),
  NEXT_PUBLIC_SITE_URL: z.url().default("https://clientbureau.com"),
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  SUPABASE_SECRET_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_PRO_MONTHLY: z.string().optional(),
  STRIPE_PRICE_TEAM_MONTHLY: z.string().optional(),
  BILLING_CHECKOUT_ENABLED: z.enum(["true", "false"]).default("false"),
  NEXT_SERVER_ACTIONS_ENCRYPTION_KEY: z.string().optional(),
  ADMIN_EMAILS: z.string().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_META_PIXEL_ID: z.string().optional(),
  NEXT_PUBLIC_CONTACT_PHONE: z.string().optional(),
  NEXT_PUBLIC_CONTACT_STREET: z.string().optional(),
  NEXT_PUBLIC_CONTACT_CITY: z.string().optional(),
  NEXT_PUBLIC_CONTACT_STATE: z.string().optional(),
  NEXT_PUBLIC_CONTACT_ZIP: z.string().optional(),
  NEXT_PUBLIC_FACEBOOK_URL: z.url().optional().or(z.literal("")),
  NEXT_PUBLIC_X_URL: z.url().optional().or(z.literal("")),
  NEXT_PUBLIC_INSTAGRAM_URL: z.url().optional().or(z.literal("")),
  NEXT_PUBLIC_YOUTUBE_URL: z.url().optional().or(z.literal("")),
  NEXT_PUBLIC_LINKEDIN_URL: z.url().optional().or(z.literal("")),
})

export type DataMode = "mock" | "supabase"
export type PlatformFeatureDataMode = "mock" | "supabase"

function readEnv() {
  return envSchema.parse(process.env)
}

export function getDataMode(): DataMode {
  return readEnv().DATA_MODE
}

export function getPlatformFeatureDataMode(): PlatformFeatureDataMode {
  return readEnv().PLATFORM_FEATURE_DATA_MODE
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

export function getStripeProPriceId() {
  return readEnv().STRIPE_PRICE_PRO_MONTHLY
}

export function getStripeTeamPriceId() {
  return readEnv().STRIPE_PRICE_TEAM_MONTHLY
}

export function isBillingCheckoutEnabled() {
  return readEnv().BILLING_CHECKOUT_ENABLED === "true"
}

export function getAdminEmails() {
  return (readEnv().ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function getAnalyticsConfig() {
  const env = readEnv()

  return {
    gaMeasurementId: env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    metaPixelId: env.NEXT_PUBLIC_META_PIXEL_ID,
  }
}

export function getPublicContactInfo() {
  const env = readEnv()

  return {
    phone: env.NEXT_PUBLIC_CONTACT_PHONE,
    street: env.NEXT_PUBLIC_CONTACT_STREET,
    city: env.NEXT_PUBLIC_CONTACT_CITY,
    state: env.NEXT_PUBLIC_CONTACT_STATE,
    zip: env.NEXT_PUBLIC_CONTACT_ZIP,
  }
}

export function getPublicSocialLinks() {
  const env = readEnv()
  const links = [
    { label: "Facebook", url: env.NEXT_PUBLIC_FACEBOOK_URL },
    { label: "X", url: env.NEXT_PUBLIC_X_URL },
    { label: "Instagram", url: env.NEXT_PUBLIC_INSTAGRAM_URL },
    { label: "YouTube", url: env.NEXT_PUBLIC_YOUTUBE_URL },
    { label: "LinkedIn", url: env.NEXT_PUBLIC_LINKEDIN_URL },
  ]

  return links.filter((link): link is { label: string; url: string } => Boolean(link.url))
}

export function requireProductionEnv(keys: string[]) {
  const missing = keys.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required production environment variables: ${missing.join(", ")}`)
  }
}
