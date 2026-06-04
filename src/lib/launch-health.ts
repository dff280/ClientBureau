import { getDataMode, getPlatformFeatureDataMode, getStripeWebhookSecret } from "@/lib/env"
import type { Database } from "@/lib/database.types"
import { hasStripeConfig } from "@/lib/stripe/server"
import { hasSupabaseConfig, hasSupabaseServiceConfig } from "@/lib/supabase/config"
import { createServiceClient } from "@/lib/supabase/service"

type RequiredTable = keyof Database["public"]["Tables"]

export const requiredLaunchTables = [
  "users",
  "contractor_profiles",
  "client_profiles",
  "client_reports",
  "report_evidence",
  "client_responses",
  "subscriptions",
  "admin_reviews",
  "community_discussions",
  "audit_logs",
  "contractor_watchlist_items",
  "watchlist_alerts",
  "report_drafts",
  "client_intake_assessments",
  "evidence_review_summaries",
  "moderation_cases",
  "bulk_import_batches",
  "payment_recovery_cases",
  "lien_notice_drafts",
  "contract_workspace_items",
  "client_pipeline_items",
  "client_risk_rooms",
  "payment_recovery_attempts",
  "payment_plans",
  "contract_packets",
  "evidence_vault_items",
  "admin_saved_views",
  "admin_queue_assignments",
  "recovery_compliance_reviews",
] as const satisfies RequiredTable[]

export type LaunchHealth = {
  status: "ok" | "degraded"
  dataMode: ReturnType<typeof getDataMode>
  platformFeatureDataMode: ReturnType<typeof getPlatformFeatureDataMode>
  supabaseConfigured: boolean
  serviceRoleConfigured: boolean
  stripeConfigured: boolean
  stripeWebhookConfigured: boolean
  requiredTables: Array<{
    name: RequiredTable
    exists: boolean
    message?: string
  }>
  timestamp: string
}

async function checkRequiredTables() {
  if (!hasSupabaseServiceConfig()) {
    return requiredLaunchTables.map((name) => ({
      name,
      exists: false,
      message: "Supabase service role is not configured.",
    }))
  }

  const supabase = createServiceClient()

  return Promise.all(
    requiredLaunchTables.map(async (name) => {
      const { error } = await supabase.from(name).select("id", { head: true, count: "exact" }).limit(1)

      return {
        name,
        exists: !error,
        message: error?.message,
      }
    }),
  )
}

export async function getLaunchHealth(): Promise<LaunchHealth> {
  const requiredTables = await checkRequiredTables()
  const missingRequiredTables = requiredTables.filter((table) => !table.exists)
  const supabaseConfigured = hasSupabaseConfig()
  const serviceRoleConfigured = hasSupabaseServiceConfig()
  const platformFeatureDataMode = getPlatformFeatureDataMode()
  const degraded =
    !supabaseConfigured ||
    !serviceRoleConfigured ||
    (platformFeatureDataMode === "supabase" && missingRequiredTables.length > 0)

  return {
    status: degraded ? "degraded" : "ok",
    dataMode: getDataMode(),
    platformFeatureDataMode,
    supabaseConfigured,
    serviceRoleConfigured,
    stripeConfigured: hasStripeConfig(),
    stripeWebhookConfigured: Boolean(getStripeWebhookSecret()),
    requiredTables,
    timestamp: new Date().toISOString(),
  }
}
