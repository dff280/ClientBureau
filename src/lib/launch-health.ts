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
  "entity_profiles",
  "profile_claims",
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
  "managed_recovery_cases",
  "recovery_communications",
  "recovery_resolution_offers",
  "florida_lien_cases",
  "lien_notice_deliveries",
  "lien_filing_records",
  "lien_release_records",
  "service_fee_orders",
  "case_staff_assignments",
  "case_audit_events",
  "case_document_links",
  "project_jobs",
  "project_job_profiles",
  "profile_relationships",
  "profile_merge_events",
  "report_reassignment_events",
  "profile_redaction_events",
  "profile_rating_events",
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

export const requiredRevenueWorkflowColumns = [
  { table: "managed_recovery_cases", name: "readiness_status" },
  { table: "managed_recovery_cases", name: "readiness_score" },
  { table: "managed_recovery_cases", name: "readiness_checked_at" },
  { table: "managed_recovery_cases", name: "fee_paid_at" },
  { table: "managed_recovery_cases", name: "submitted_for_review_at" },
  { table: "florida_lien_cases", name: "readiness_status" },
  { table: "florida_lien_cases", name: "readiness_score" },
  { table: "florida_lien_cases", name: "readiness_checked_at" },
  { table: "florida_lien_cases", name: "fee_paid_at" },
  { table: "florida_lien_cases", name: "submitted_for_review_at" },
] as const satisfies { table: RequiredTable; name: string }[]

export const requiredMultiProfileColumns = [
  { table: "client_reports", name: "reporter_profile_id" },
  { table: "client_reports", name: "subject_profile_id" },
  { table: "client_reports", name: "subject_profile_type" },
  { table: "client_reports", name: "relationship_type" },
  { table: "client_reports", name: "legacy_client_name" },
  { table: "client_reports", name: "project_job_id" },
  { table: "client_reports", name: "report_confidence_level" },
  { table: "client_reports", name: "redaction_note" },
  { table: "report_evidence", name: "project_job_id" },
  { table: "report_evidence", name: "public_summary_label" },
  { table: "entity_profiles", name: "profile_subtype" },
  { table: "entity_profiles", name: "verification_level" },
  { table: "entity_profiles", name: "verification_badges" },
  { table: "entity_profiles", name: "duplicate_group_key" },
  { table: "entity_profiles", name: "merged_into_profile_id" },
  { table: "entity_profiles", name: "public_field_redactions" },
  { table: "entity_profiles", name: "redaction_note" },
  { table: "client_responses", name: "entity_profile_id" },
  { table: "client_responses", name: "project_job_id" },
  { table: "client_responses", name: "request_type" },
  { table: "client_responses", name: "verification_method" },
  { table: "client_responses", name: "attachment_reference_private" },
] as const satisfies { table: RequiredTable; name: string }[]

export const requiredRatingTransparencyColumns = [
  { table: "entity_profiles", name: "rating_model" },
  { table: "entity_profiles", name: "rating_version" },
  { table: "entity_profiles", name: "rating_confidence" },
  { table: "entity_profiles", name: "rating_factors" },
  { table: "entity_profiles", name: "rating_public_note" },
  { table: "entity_profiles", name: "rating_last_calculated_at" },
  { table: "client_reports", name: "reported_business_role" },
  { table: "client_reports", name: "counterparty_business_role" },
  { table: "client_reports", name: "hiring_party_name_private" },
  { table: "client_reports", name: "scope_documentation_status" },
  { table: "client_reports", name: "work_authorization_status" },
  { table: "client_reports", name: "retainage_amount" },
  { table: "client_reports", name: "payment_application_reference" },
  { table: "client_reports", name: "license_insurance_context" },
  { table: "client_reports", name: "relationship_verification_summary" },
] as const satisfies { table: RequiredTable; name: string }[]

const requiredPlatformColumnTotal =
  requiredContractPacketColumns.length +
  requiredRevenueWorkflowColumns.length +
  requiredMultiProfileColumns.length +
  requiredRatingTransparencyColumns.length

type LaunchColumnStatus = {
  table: RequiredTable
  name: string
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
    const contractColumns: LaunchColumnStatus[] = requiredContractPacketColumns.map((name) => ({
      table: "contract_packets" as const,
      name,
      exists: false,
      message: "Supabase service role is not configured.",
    }))
    const revenueColumns: LaunchColumnStatus[] = requiredRevenueWorkflowColumns.map((column) => ({
      table: column.table,
      name: column.name,
      exists: false,
      message: "Supabase service role is not configured.",
    }))

    const multiProfileColumns: LaunchColumnStatus[] = requiredMultiProfileColumns.map((column) => ({
      table: column.table,
      name: column.name,
      exists: false,
      message: "Supabase service role is not configured.",
    }))

    const ratingTransparencyColumns: LaunchColumnStatus[] = requiredRatingTransparencyColumns.map((column) => ({
      table: column.table,
      name: column.name,
      exists: false,
      message: "Supabase service role is not configured.",
    }))

    return [...contractColumns, ...revenueColumns, ...multiProfileColumns, ...ratingTransparencyColumns]
  }

  const supabase = createServiceClient()

  const contractChecks = requiredContractPacketColumns.map((name) => ({
    table: "contract_packets" as const,
    name,
  }))
  const requiredColumns = [
    ...contractChecks,
    ...requiredRevenueWorkflowColumns,
    ...requiredMultiProfileColumns,
    ...requiredRatingTransparencyColumns,
  ]

  return Promise.all(
    requiredColumns.map(async ({ table, name }) => {
      const { error } = await supabase.from(table).select(name, { head: true }).limit(1)

      return {
        table,
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

  let readinessLabel = "Ready for live records"
  let readinessMessage = "All required core and platform tables responded. Advanced operations can use live account records."

  if (!input.supabaseConfigured || !input.serviceRoleConfigured) {
    readinessLabel = "Configuration missing"
    readinessMessage =
      "Keep advanced tools in guided mode until the project URL, publishable key, and service role key are configured."
  } else if (!coreTablesReady) {
    readinessLabel = "Core tables missing"
    readinessMessage =
      "Core record tables are not fully available. Keep the launch guarded and apply the base migrations before moving advanced tools to live account records."
  } else if (!platformTablesReady) {
    readinessLabel = "Guided ops required"
    readinessMessage =
      "Core records are reachable, but platform operations tables are missing. Apply migrations 0003 through 0019 before moving advanced tools to live account records."
  } else if (!platformSchemaReady) {
    readinessLabel = "Platform schema migration needed"
    readinessMessage =
      "Platform tables exist, but contract signing, revenue workflow, unified profile, project/job graph, response graph, or rating transparency columns are missing. Apply migrations through 0019 before using live advanced workflows."
  } else if (input.platformFeatureDataMode === "supabase") {
    readinessLabel = "Live ops active"
    readinessMessage = "Advanced dashboard and admin operations are saving to live account records."
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
      ready: requiredPlatformColumnTotal - missingPlatformColumns.length,
      total: requiredPlatformColumnTotal,
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
