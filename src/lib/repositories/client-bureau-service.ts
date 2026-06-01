import { getDataMode } from "@/lib/env"
import {
  getContractorDashboard,
  getAdminWorkspaceData,
  getPendingAdminReviews,
  getPublicClientProfile,
  getPublicClientProfiles,
  deleteAdminRecord,
  reviewReport,
  reviewReportsBulk,
  reviewCommunityDiscussion,
  searchClients,
  simulateSubmittedClientReport,
  submitCommunityDiscussion,
  submitClientResponse,
  updateAdminClientRecord,
  updateAdminContractorRecord,
} from "@/lib/repositories/client-bureau"
import {
  deleteAdminRecordSupabase,
  getAdminWorkspaceDataSupabase,
  getContractorDashboardSupabase,
  getPendingAdminReviewsSupabase,
  getPublicClientProfileSupabase,
  getPublicClientProfilesSupabase,
  reviewCommunityDiscussionSupabase,
  reviewReportSupabase,
  reviewReportsBulkSupabase,
  searchClientsSupabase,
  submitCommunityDiscussionSupabase,
  submitClientReportSupabase,
  submitClientResponseSupabase,
  updateAdminClientRecordSupabase,
  updateAdminContractorRecordSupabase,
} from "@/lib/repositories/client-bureau-supabase"
import type { ClientReportInput, ClientResponseInput } from "@/lib/schemas/client-bureau"
import type { ClientProfile, CommunityDiscussion, ContractorProfile, SearchFilters, User } from "@/lib/types"
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

export async function getAdminWorkspaceDataService() {
  if (shouldUseSupabase()) return getAdminWorkspaceDataSupabase()

  return getAdminWorkspaceData()
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

export async function submitCommunityDiscussionService(input: {
  profileSlug: string
  name: string
  email: string
  relationshipCategory: CommunityDiscussion["relationshipCategory"]
  commentBody: string
  attachmentUrl?: string
  reportId?: string
}) {
  if (shouldUseSupabase()) return submitCommunityDiscussionSupabase(input)

  return submitCommunityDiscussion(input.profileSlug, input)
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

export async function reviewReportsBulkService(
  reportIds: string[],
  decision: "approved" | "rejected" | "deleted",
  reviewerId?: string,
) {
  if (shouldUseSupabase()) return reviewReportsBulkSupabase(reportIds, decision, reviewerId)

  return reviewReportsBulk(reportIds, decision)
}

export async function reviewCommunityDiscussionService(
  discussionId: string,
  decision: "approved" | "rejected" | "deleted" | "verified",
  moderatorNote?: string,
  reviewer?: User,
) {
  if (shouldUseSupabase()) return reviewCommunityDiscussionSupabase(discussionId, decision, moderatorNote, reviewer)

  return reviewCommunityDiscussion(discussionId, decision, moderatorNote)
}

export async function updateAdminClientRecordService(
  input: Parameters<typeof updateAdminClientRecordSupabase>[0],
) {
  if (shouldUseSupabase()) return updateAdminClientRecordSupabase(input)

  return updateAdminClientRecord({
    id: input.clientId,
    firstName: input.firstName,
    lastName: input.lastName,
    businessName: input.businessName,
    city: input.city,
    state: input.state.toUpperCase(),
    riskLevel: input.riskLevel,
    clientBureauScore: input.clientBureauScore,
    isPublic: Boolean(input.isPublic),
  } satisfies Partial<ClientProfile> & { id: string })
}

export async function updateAdminContractorRecordService(
  input: Parameters<typeof updateAdminContractorRecordSupabase>[0],
) {
  if (shouldUseSupabase()) return updateAdminContractorRecordSupabase(input)

  return updateAdminContractorRecord({
    id: input.contractorId,
    businessName: input.businessName,
    trade: input.trade,
    city: input.city,
    state: input.state.toUpperCase(),
    verificationStatus: input.verificationStatus,
  } satisfies Partial<ContractorProfile> & { id: string })
}

export async function deleteAdminRecordService(
  entityType: "client" | "contractor" | "report" | "discussion",
  entityId: string,
  reviewer?: User,
) {
  if (shouldUseSupabase()) return deleteAdminRecordSupabase(entityType, entityId, reviewer)

  return deleteAdminRecord(entityType, entityId)
}
