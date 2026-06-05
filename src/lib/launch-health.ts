import { getDataMode, getPlatformFeatureDataMode, getStripeWebhookSecret } from "@/lib/env"
import type { Database } from "@/lib/database.types"
import { hasStripeConfig } from "@/lib/stripe/server"
import { hasSupabaseConfig, hasSupabaseServiceConfig } from "@/lib/supabase/config"
import { createServiceClient } from "@/lib/supabase/service"

type RequiredTable = keyof Database["public"]["Tables"]

export const coreLaunchTables = [
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
] as const satisfies RequiredTable[]

export const platformLaunchTables = [
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

export const requiredLaunchTables = [
  ...coreLaunchTables,
  ...platformLaunchTables,
] as const satisfies RequiredTable[]

type LaunchTableStatus = {
  name: RequiredTable
  exists: boolean
  message?: string
}

export const requiredContractPacketColumns = [
  "scope_summary",
  "included_work",
  "payment_terms",
  "milestone_schedule",
  "change_order_policy",
  "cancellation_policy",
  "signed_snapshot",
  "signed_digest",
  "signed_recorded_at",
] as const

type LaunchColumnStatus = {
  table: RequiredTable
  name: (typeof requiredContractPacketColumns)[number]
  exists: boolean
  message?: string
}

export type LaunchReadinessSummary = {
  coreTablesReady: boolean
  platformTablesReady: boolean
  platformSchemaReady: boolean
  coreLiveReady: boolean
  platformCanUseSupabase: boolean
  recommendedPlatformFeatureDataMode: "mock" | "supabase"
  readinessLabel: string
  readinessMessage: string
  missingCoreTables: RequiredTable[]
  missingPlatformTables: RequiredTable[]
  missingPlatformColumns: string[]
  coreTableCount: {
    ready: number
    total: number
  }
  platformTableCount: {
    ready: number
    total: number
  }
  platformColumnCount: {
    ready: number
    total: number
  }
}

export type LaunchHealth = {
  status: "ok" | "degraded"
  dataMode: ReturnType<typeof getDataMode>
  platformFeatureDataMode: ReturnType<typeof getPlatformFeatureDataMode>
  supabaseConfigured: boolean
  serviceRoleConfigured: boolean
  stripeConfigured: boolean
  stripeWebhookConfigured: boolean
  requiredTables: LaunchTableStatus[]
  requiredColumns: LaunchColumnStatus[]
  readiness: LaunchReadinessSummary
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

async function checkRequiredColumns() {
  if (!hasSupabaseServiceConfig()) {
    return requiredContractPacketColumns.map((name) => ({
      table: "contract_packets" as const,
      name,
      exists: false,
      message: "Supabase service role is not configured.",
    }))
  }

  const supabase = createServiceClient()

  return Promise.all(
    requiredContractPacketColumns.map(async (name) => {
      const { error } = await supabase.from("contract_packets").select(name, { head: true }).limit(1)

      return {
        table: "contract_packets" as const,
        name,
        exists: !error,
        message: error?.message,
      }
    }),
  )
}

export function summarizeLaunchHealth(input: {
  dataMode: ReturnType<typeof getDataMode>
  platformFeatureDataMode: ReturnType<typeof getPlatformFeatureDataMode>
  supabaseConfigured: boolean
  serviceRoleConfigured: boolean
  stripeConfigured: boolean
  stripeWebhookConfigured: boolean
  requiredTables: LaunchTableStatus[]
  requiredColumns?: LaunchColumnStatus[]
}): LaunchReadinessSummary {
  const missingCoreTables = coreLaunchTables.filter((name) =>
    !input.requiredTables.find((table) => table.name === name && table.exists),
  )
  const missingPlatformTables = platformLaunchTables.filter((name) =>
    !input.requiredTables.find((table) => table.name === name && table.exists),
  )
  const coreTablesReady = missingCoreTables.length === 0
  const platformTablesReady = missingPlatformTables.length === 0
  const missingPlatformColumns = (input.requiredColumns ?? [])
    .filter((column) => !column.exists)
    .map((column) => `${column.table}.${column.name}`)
  const platformSchemaReady = missingPlatformColumns.length === 0
  const coreLiveReady = input.supabaseConfigured && input.serviceRoleConfigured && coreTablesReady
  const platformCanUseSupabase = coreLiveReady && platformTablesReady && platformSchemaReady
  const recommendedPlatformFeatureDataMode = platformCanUseSupabase ? "supabase" : "mock"

  let readinessLabel = "Ready to flip"
  let readinessMessage = "All required core and platform tables responded. Advanced ops can be switched to Supabase-backed mode."

  if (!input.supabaseConfigured || !input.serviceRoleConfigured) {
    readinessLabel = "Configuration missing"
    readinessMessage =
      "Keep advanced tools in mock mode until Supabase URL, publishable key, and service role key are configured."
  } else if (!coreTablesReady) {
    readinessLabel = "Core tables missing"
    readinessMessage =
      "Core Supabase tables are not fully available. Keep the launch guarded and apply the base migrations before changing feature mode."
  } else if (!platformTablesReady) {
    readinessLabel = "Keep advanced tools mocked"
    readinessMessage =
      "Core Supabase is reachable, but platform ops tables are missing. Apply migrations 0003, 0004, 0005, 0006, and 0007 before flipping advanced tools."
  } else if (!platformSchemaReady) {
    readinessLabel = "Contract signing migration needed"
    readinessMessage =
      "Platform tables exist, but contract signing packet columns are missing. Apply migration 0007 before using Supabase-backed contract workflows."
  } else if (input.platformFeatureDataMode === "supabase") {
    readinessLabel = "Live ops active"
    readinessMessage = "Advanced dashboard and admin ops are configured for Supabase-backed persistence."
  }

  return {
    coreTablesReady,
    platformTablesReady,
    platformSchemaReady,
    coreLiveReady,
    platformCanUseSupabase,
    recommendedPlatformFeatureDataMode,
    readinessLabel,
    readinessMessage,
    missingCoreTables,
    missingPlatformTables,
    missingPlatformColumns,
    coreTableCount: {
      ready: coreLaunchTables.length - missingCoreTables.length,
      total: coreLaunchTables.length,
    },
    platformTableCount: {
      ready: platformLaunchTables.length - missingPlatformTables.length,
      total: platformLaunchTables.length,
    },
    platformColumnCount: {
      ready: requiredContractPacketColumns.length - missingPlatformColumns.length,
      total: requiredContractPacketColumns.length,
    },
  }
}

export async function getLaunchHealth(): Promise<LaunchHealth> {
  const [requiredTables, requiredColumns] = await Promise.all([
    checkRequiredTables(),
    checkRequiredColumns(),
  ])
  const supabaseConfigured = hasSupabaseConfig()
  const serviceRoleConfigured = hasSupabaseServiceConfig()
  const dataMode = getDataMode()
  const platformFeatureDataMode = getPlatformFeatureDataMode()
  const stripeConfigured = hasStripeConfig()
  const stripeWebhookConfigured = Boolean(getStripeWebhookSecret())
  const readiness = summarizeLaunchHealth({
    dataMode,
    platformFeatureDataMode,
    supabaseConfigured,
    serviceRoleConfigured,
    stripeConfigured,
    stripeWebhookConfigured,
    requiredTables,
    requiredColumns,
  })
  const degraded =
    !supabaseConfigured ||
    !serviceRoleConfigured ||
    (dataMode === "supabase" && !readiness.coreTablesReady) ||
    (platformFeatureDataMode === "supabase" && !readiness.platformCanUseSupabase)

  return {
    status: degraded ? "degraded" : "ok",
    dataMode,
    platformFeatureDataMode,
    supabaseConfigured,
    serviceRoleConfigured,
    stripeConfigured,
    stripeWebhookConfigured,
    requiredTables,
    requiredColumns,
    readiness,
    timestamp: new Date().toISOString(),
  }
}
