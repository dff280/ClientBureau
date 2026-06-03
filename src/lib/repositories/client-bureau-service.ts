import { getDataMode, getPlatformFeatureDataMode } from "@/lib/env"
import {
  assignMockModerationCase,
  createContractWorkspaceItem,
  createClientPipelineItem,
  createClientRiskRoom,
  createIntakeAssessment,
  createLienNoticeDraft,
  createPaymentRecoveryCase,
  createContractPacket,
  createPaymentPlan,
  createWatchlistItem,
  deleteReportDraft,
  getContractorDashboard,
  getAdminWorkspaceData,
  getAdminModerationCrmData,
  getContractorRiskOpsData,
  getPendingAdminReviews,
  getPublicClientProfile,
  getPublicClientProfiles,
  deleteAdminRecord,
  logPaymentRecoveryAttempt,
  reviewRecoveryCompliance,
  reviewReport,
  reviewReportsBulk,
  reviewCommunityDiscussion,
  saveAdminQueueView,
  saveReportDraft,
  searchClients,
  setMockModerationDecisionReason,
  simulateSubmittedClientReport,
  submitCommunityDiscussion,
  submitClientResponse,
  updateAdminClientRecord,
  updateAdminContractorRecord,
  updateClientPipelineStage,
  updateContractPacketStatus,
  updateEvidenceVaultStatus,
  updateMockModerationCase,
  updateWatchlistItem,
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
import type {
  ClientReportInput,
  ClientResponseInput,
  AdminSavedViewInput,
  ClientPipelineItemInput,
  ClientRiskRoomInput,
  ContractPacketInput,
  ContractWorkspaceItemInput,
  IntakeAssessmentInput,
  LienNoticeDraftInput,
  PaymentRecoveryCaseInput,
  PaymentRecoveryAttemptInput,
  PaymentPlanInput,
  RecoveryComplianceReviewInput,
  ReportDraftInput,
  UpdateClientPipelineStageInput,
  UpdateContractPacketStatusInput,
  UpdateEvidenceVaultStatusInput,
  WatchlistItemInput,
} from "@/lib/schemas/client-bureau"
import type {
  ClientProfile,
  CommunityDiscussion,
  ContractorRiskOpsData,
  ContractorProfile,
  ModerationCaseStatus,
  ModerationDecisionReason,
  ModerationPriority,
  SearchFilters,
  User,
  WatchlistStatus,
} from "@/lib/types"
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

function shouldUsePlatformSupabase() {
  if (getPlatformFeatureDataMode() === "mock") return false

  throw new Error(
    "PLATFORM_FEATURE_DATA_MODE=supabase requires applying the platform expansion migration and wiring the Supabase feature adapter.",
  )
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

export async function getContractorRiskOpsDataService(userId: string) {
  if (shouldUsePlatformSupabase()) return undefined

  const seededRiskOps = getContractorRiskOpsData(userId)

  if (seededRiskOps) return seededRiskOps

  const dashboard = await getContractorDashboardForPlatformFeatures(userId)

  if (!dashboard) return undefined

  return createDefaultRiskOpsData(dashboard.contractor.id)
}

export async function getAdminModerationCrmDataService() {
  if (shouldUsePlatformSupabase()) return undefined

  return getAdminModerationCrmData()
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

export async function createWatchlistItemService(userId: string, input: WatchlistItemInput) {
  if (shouldUsePlatformSupabase()) return undefined

  const dashboard = await getContractorDashboardForPlatformFeatures(userId)
  if (!dashboard) throw new Error("Contractor workspace was not found.")

  return createWatchlistItem({
    contractorId: dashboard.contractor.id,
    clientId: input.clientId,
    watchReason: input.watchReason,
    alertLevel: input.alertLevel,
  })
}

export async function updateWatchlistItemService(itemId: string, status: WatchlistStatus) {
  if (shouldUsePlatformSupabase()) return undefined

  return updateWatchlistItem(itemId, status)
}

export async function saveReportDraftService(userId: string, input: ReportDraftInput) {
  if (shouldUsePlatformSupabase()) return undefined

  const dashboard = await getContractorDashboardForPlatformFeatures(userId)
  if (!dashboard) throw new Error("Contractor workspace was not found.")

  return saveReportDraft({
    contractorId: dashboard.contractor.id,
    draftId: input.draftId,
    clientId: input.clientId,
    clientName: input.clientName,
    projectType: input.projectType,
    estimatedValue: input.estimatedValue,
    amountAtRisk: input.amountAtRisk,
    summary: input.summary,
    nextStep: input.nextStep,
    status: input.status,
  })
}

export async function deleteReportDraftService(draftId: string) {
  if (shouldUsePlatformSupabase()) return undefined

  return deleteReportDraft(draftId)
}

export async function createIntakeAssessmentService(userId: string, input: IntakeAssessmentInput) {
  if (shouldUsePlatformSupabase()) return undefined

  const dashboard = await getContractorDashboardForPlatformFeatures(userId)
  if (!dashboard) throw new Error("Contractor workspace was not found.")

  return createIntakeAssessment({
    contractorId: dashboard.contractor.id,
    clientName: input.clientName,
    city: input.city,
    state: input.state,
    projectValue: input.projectValue,
    depositReceived: Boolean(input.depositReceived),
    contractSigned: Boolean(input.contractSigned),
    privateMatchConfirmed: Boolean(input.privateMatchConfirmed),
    notes: input.notes,
  })
}

export async function createPaymentRecoveryCaseService(userId: string, input: PaymentRecoveryCaseInput) {
  if (shouldUsePlatformSupabase()) return undefined

  const dashboard = await getContractorDashboardForPlatformFeatures(userId)
  if (!dashboard) throw new Error("Contractor workspace was not found.")

  return createPaymentRecoveryCase(dashboard.contractor.id, input)
}

export async function createLienNoticeDraftService(userId: string, input: LienNoticeDraftInput) {
  if (shouldUsePlatformSupabase()) return undefined

  const dashboard = await getContractorDashboardForPlatformFeatures(userId)
  if (!dashboard) throw new Error("Contractor workspace was not found.")

  return createLienNoticeDraft(dashboard.contractor.id, input)
}

export async function createContractWorkspaceItemService(userId: string, input: ContractWorkspaceItemInput) {
  if (shouldUsePlatformSupabase()) return undefined

  const dashboard = await getContractorDashboardForPlatformFeatures(userId)
  if (!dashboard) throw new Error("Contractor workspace was not found.")

  return createContractWorkspaceItem(dashboard.contractor.id, input)
}

export async function createClientPipelineItemService(userId: string, input: ClientPipelineItemInput) {
  if (shouldUsePlatformSupabase()) return undefined

  const dashboard = await getContractorDashboardForPlatformFeatures(userId)
  if (!dashboard) throw new Error("Contractor workspace was not found.")

  return createClientPipelineItem(dashboard.contractor.id, input)
}

export async function updateClientPipelineStageService(input: UpdateClientPipelineStageInput) {
  if (shouldUsePlatformSupabase()) return undefined

  return updateClientPipelineStage(input.itemId, input.stage)
}

export async function createClientRiskRoomService(userId: string, input: ClientRiskRoomInput) {
  if (shouldUsePlatformSupabase()) return undefined

  const dashboard = await getContractorDashboardForPlatformFeatures(userId)
  if (!dashboard) throw new Error("Contractor workspace was not found.")

  return createClientRiskRoom(dashboard.contractor.id, input)
}

export async function logPaymentRecoveryAttemptService(userId: string, input: PaymentRecoveryAttemptInput) {
  if (shouldUsePlatformSupabase()) return undefined

  const dashboard = await getContractorDashboardForPlatformFeatures(userId)
  if (!dashboard) throw new Error("Contractor workspace was not found.")

  return logPaymentRecoveryAttempt(dashboard.contractor.id, input)
}

export async function createPaymentPlanService(userId: string, input: PaymentPlanInput) {
  if (shouldUsePlatformSupabase()) return undefined

  const dashboard = await getContractorDashboardForPlatformFeatures(userId)
  if (!dashboard) throw new Error("Contractor workspace was not found.")

  return createPaymentPlan(dashboard.contractor.id, input)
}

export async function createContractPacketService(userId: string, input: ContractPacketInput) {
  if (shouldUsePlatformSupabase()) return undefined

  const dashboard = await getContractorDashboardForPlatformFeatures(userId)
  if (!dashboard) throw new Error("Contractor workspace was not found.")

  return createContractPacket(dashboard.contractor.id, input)
}

export async function updateContractPacketStatusService(input: UpdateContractPacketStatusInput) {
  if (shouldUsePlatformSupabase()) return undefined

  return updateContractPacketStatus(input)
}

export async function updateEvidenceVaultStatusService(input: UpdateEvidenceVaultStatusInput) {
  if (shouldUsePlatformSupabase()) return undefined

  return updateEvidenceVaultStatus(input)
}

export async function saveAdminQueueViewService(admin: User, input: AdminSavedViewInput) {
  if (shouldUsePlatformSupabase()) return undefined

  return saveAdminQueueView(admin.id, input)
}

export async function reviewRecoveryComplianceService(admin: User, input: RecoveryComplianceReviewInput) {
  if (shouldUsePlatformSupabase()) return undefined

  return reviewRecoveryCompliance(admin.id, input)
}

export async function assignModerationCaseService(caseId: string, admin: User, assignedTo: string) {
  if (shouldUsePlatformSupabase()) return undefined

  return assignMockModerationCase(caseId, assignedTo, admin.fullName)
}

export async function updateModerationCaseService(
  caseId: string,
  priority: ModerationPriority,
  status: ModerationCaseStatus,
  escalationNote?: string,
) {
  if (shouldUsePlatformSupabase()) return undefined

  return updateMockModerationCase(caseId, priority, status, escalationNote)
}

export async function setModerationDecisionReasonService(
  caseId: string,
  decisionReason: ModerationDecisionReason,
  moderatorNote?: string,
) {
  if (shouldUsePlatformSupabase()) return undefined

  return setMockModerationDecisionReason(caseId, decisionReason, moderatorNote)
}

function createDefaultRiskOpsData(contractorId: string): ContractorRiskOpsData {
  const now = new Date().toISOString()

  return {
    clientPipeline: [],
    riskRooms: [],
    watchlist: [],
    watchlistAlerts: [],
    reportDrafts: [],
    intakeAssessments: [],
    evidenceSummaries: [],
    evidenceVault: [],
    paymentRecoveryCases: [],
    paymentRecoveryAttempts: [],
    paymentPlans: [],
    lienNoticeDrafts: [],
    contractDocuments: [],
    contractPackets: [],
    activity: [
      {
        id: `activity_${contractorId}_workspace_created`,
        contractorId,
        title: "Workspace ready",
        description: "Start by searching a client, saving an intake assessment, or submitting a documented report.",
        createdAt: now,
        tone: "neutral",
      },
    ],
    recommendedActions: [
      "Search a client before accepting the next job.",
      "Create an intake assessment for any client that requires materials, deposits, or scheduling.",
      "Submit documented reports with evidence so moderation has the right context.",
    ],
  }
}

async function getContractorDashboardForPlatformFeatures(userId: string) {
  return shouldUseSupabase()
    ? getContractorDashboardSupabase(userId)
    : getContractorDashboard(userId)
}
