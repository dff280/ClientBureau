import { getDataMode } from "@/lib/env"
import {
  getContractorDashboard,
  getPendingAdminReviews,
  getPublicClientProfile,
  getPublicClientProfiles,
  reviewReport,
  searchClients,
  simulateSubmittedClientReport,
  submitClientResponse,
} from "@/lib/repositories/client-bureau"
import {
  getContractorDashboardSupabase,
  getPendingAdminReviewsSupabase,
  getPublicClientProfileSupabase,
  getPublicClientProfilesSupabase,
  reviewReportSupabase,
  searchClientsSupabase,
  submitClientReportSupabase,
  submitClientResponseSupabase,
} from "@/lib/repositories/client-bureau-supabase"
import type { ClientReportInput, ClientResponseInput } from "@/lib/schemas/client-bureau"
import type { SearchFilters } from "@/lib/types"
import { hasSupabaseServiceConfig } from "@/lib/supabase/config"

function shouldUseSupabase() {
  if (getDataMode() === "mock") return false

  if (!hasSupabaseServiceConfig()) {
    throw new Error(
      "DATA_MODE=supabase requires NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, and a Supabase service key.",
    )
  }

  return true
}

export async function getPublicClientProfilesService() {
  if (shouldUseSupabase()) return getPublicClientProfilesSupabase()

  return getPublicClientProfiles()
}

export async function getPublicClientProfileService(slug: string) {
  if (shouldUseSupabase()) return getPublicClientProfileSupabase(slug)

  return getPublicClientProfile(slug)
}

export async function searchClientsService(query?: string, filters?: SearchFilters) {
  if (shouldUseSupabase()) return searchClientsSupabase(query, filters)

  return searchClients(query, filters)
}

export async function getContractorDashboardService(userId: string) {
  if (shouldUseSupabase()) return getContractorDashboardSupabase(userId)

  return getContractorDashboard(userId)
}

export async function getPendingAdminReviewsService() {
  if (shouldUseSupabase()) return getPendingAdminReviewsSupabase()

  return getPendingAdminReviews()
}

export async function submitClientReportService(
  input: ClientReportInput,
  userId: string,
  evidenceFiles: File[] = [],
) {
  if (shouldUseSupabase()) return submitClientReportSupabase(input, userId, evidenceFiles)

  return simulateSubmittedClientReport(input)
}

export async function submitClientResponseService(input: ClientResponseInput) {
  if (shouldUseSupabase()) return submitClientResponseSupabase(input)

  return submitClientResponse("client_response_lookup", {
    responseSummary: input.responseSummary,
  })
}

export async function reviewReportService(
  reportId: string,
  decision: "approved" | "rejected",
  editedPublicSummary: string,
  reviewerId?: string,
) {
  if (shouldUseSupabase()) return reviewReportSupabase(reportId, decision, editedPublicSummary, reviewerId)

  return reviewReport(reportId, decision, editedPublicSummary)
}
