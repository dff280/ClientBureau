import { getDataMode, getPlatformFeatureDataMode } from "@/lib/env"
import type { ContractSignatureAuditInput } from "@/lib/contract-packets"
import {
  assignMockModerationCase,
  createContractWorkspaceItem,
  createClientPipelineItem,
  createClientRiskRoom,
  createIntakeAssessment,
  createLienNoticeDraft,
  createPaymentRecoveryCase,
  createContractPacket,
  createContractShareLink,
  createPaymentPlan,
  createServiceFeeOrder,
  createWatchlistItem,
  deleteSavedClientSearch,
  deleteReportDraft,
  linkEvidenceToServiceCase,
  getContractorDashboard,
  getAdminWorkspaceData,
  getAdminModerationCrmData,
  getContractorRiskOpsData,
  getPendingAdminReviews,
  getPublicClientProfile,
  getPublicClientProfiles,
  getPublicBusinessProfile,
  getPublicBusinessProfiles,
  getContractPacketByShareToken,
  deleteAdminRecord,
  logPaymentRecoveryAttempt,
  logResolutionDeskContact,
  markServiceFeePaid,
  markRecoveryResolved,
  reviewRecoveryCompliance,
  reviewReport,
  reviewReportsBulk,
  runFloridaLienPrecheck,
  runRecoveryPrecheck,
  recordProfileShareEvent,
  recordSearchEvent,
  reviewCommunityDiscussion,
  saveAdminQueueView,
  saveClientSearch,
  saveReportDraft,
  searchClients,
  setMockModerationDecisionReason,
  signContractShare,
  simulateSubmittedClientReport,
  signLienFilingAuthorization,
  submitFloridaLienCase,
  submitManagedRecoveryCase,
  submitCommunityDiscussion,
  submitClientResponse,
  adminApproveLienFiling,
  adminApproveLienNotice,
  adminRecordLienFiled,
  adminRecordLienRelease,
  adminRequestLienMoreInfo,
  adminUploadRecordingProof,
  updateAdminClientRecord,
  updateAdminContractorRecord,
  updateClientPipelineStage,
  updateContractPacketStatus,
  updateEvidenceVaultStatus,
  updateMockModerationCase,
  updateWatchlistItem,
} from "@/lib/repositories/client-bureau"
import {
  assignModerationCaseSupabase,
  createClientPipelineItemSupabase,
  createClientRiskRoomSupabase,
  createContractPacketSupabase,
  createContractShareLinkSupabase,
  createContractWorkspaceItemSupabase,
  createIntakeAssessmentSupabase,
  createLienNoticeDraftSupabase,
  createPaymentPlanSupabase,
  createPaymentRecoveryCaseSupabase,
  createServiceFeeOrderSupabase,
  createWatchlistItemSupabase,
  deleteSavedClientSearchSupabase,
  deleteAdminRecordSupabase,
  deleteReportDraftSupabase,
  getAdminModerationCrmDataSupabase,
  getAdminWorkspaceDataSupabase,
  getContractorRiskOpsDataSupabase,
  getContractorDashboardSupabase,
  getContractPacketByShareTokenSupabase,
  getPendingAdminReviewsSupabase,
  getPublicClientProfileSupabase,
  getPublicClientProfilesSupabase,
  getPublicBusinessProfileSupabase,
  getPublicBusinessProfilesSupabase,
  linkEvidenceToServiceCaseSupabase,
  logPaymentRecoveryAttemptSupabase,
  logResolutionDeskContactSupabase,
  markServiceFeePaidSupabase,
  markRecoveryResolvedSupabase,
  reviewCommunityDiscussionSupabase,
  reviewRecoveryComplianceSupabase,
  reviewReportSupabase,
  reviewReportsBulkSupabase,
  runFloridaLienPrecheckSupabase,
  runRecoveryPrecheckSupabase,
  recordProfileShareEventSupabase,
  recordSearchEventSupabase,
  saveAdminQueueViewSupabase,
  saveClientSearchSupabase,
  saveReportDraftSupabase,
  searchClientsSupabase,
  setModerationDecisionReasonSupabase,
  signLienFilingAuthorizationSupabase,
  signContractShareSupabase,
  submitFloridaLienCaseSupabase,
  submitManagedRecoveryCaseSupabase,
  submitCommunityDiscussionSupabase,
  submitClientReportSupabase,
  submitClientResponseSupabase,
  adminApproveLienFilingSupabase,
  adminApproveLienNoticeSupabase,
  adminRecordLienFiledSupabase,
  adminRecordLienReleaseSupabase,
  adminRequestLienMoreInfoSupabase,
  adminUploadRecordingProofSupabase,
  updateAdminClientRecordSupabase,
  updateAdminContractorRecordSupabase,
  updateClientPipelineStageSupabase,
  updateContractPacketStatusSupabase,
  updateEvidenceVaultStatusSupabase,
  updateModerationCaseSupabase,
  updateWatchlistItemSupabase,
} from "@/lib/repositories/client-bureau-supabase"
import type {
  ClientReportInput,
  ClientResponseInput,
  AdminSavedViewInput,
  ClientPipelineItemInput,
  ClientRiskRoomInput,
  ContractPacketInput,
  ContractShareLinkInput,
  ContractSignatureInput,
  ContractWorkspaceItemInput,
  FloridaLienCaseInput,
  IntakeAssessmentInput,
  LienFilingAuthorizationInput,
  LienNoticeDraftInput,
  AdminLienCaseActionInput,
  AdminRecordLienFiledInput,
  AdminRecordLienReleaseInput,
  AdminUploadRecordingProofInput,
  ManagedRecoveryCaseInput,
  LinkEvidenceToServiceCaseInput,
  MarkServiceFeePaidInput,
  MarkRecoveryResolvedInput,
  PaymentRecoveryCaseInput,
  PaymentRecoveryAttemptInput,
  PaymentPlanInput,
  RecoveryComplianceReviewInput,
  ResolutionDeskContactInput,
  ReportDraftInput,
  SavedClientSearchInput,
  SearchAnalyticsEventInput,
  ServiceFeeCheckoutInput,
  ServicePrecheckInput,
  ProfileShareEventInput,
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
  ProfileShareEvent,
  SavedClientSearch,
  SearchAnalyticsEvent,
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

  if (!hasSupabaseServiceConfig()) {
    throw new Error(
      "PLATFORM_FEATURE_DATA_MODE=supabase requires NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, and a Supabase service key.",
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

export async function getPublicBusinessProfilesService() {
  if (shouldUseSupabase()) return getPublicBusinessProfilesSupabase()

  return getPublicBusinessProfiles()
}

export async function getPublicBusinessProfileService(slug: string) {
  if (shouldUseSupabase()) return getPublicBusinessProfileSupabase(slug)

  return getPublicBusinessProfile(slug)
}

export async function searchClientsService(query?: string, filters?: SearchFilters) {
  if (shouldUseSupabase()) return searchClientsSupabase(query, filters)

  return searchClients(query, filters)
}

export async function saveClientSearchService(
  userId: string,
  input: SavedClientSearchInput,
): Promise<SavedClientSearch | undefined> {
  if (shouldUseSupabase()) return saveClientSearchSupabase(userId, input)

  return saveClientSearch(userId, input)
}

export async function deleteSavedClientSearchService(userId: string, searchId: string) {
  if (shouldUseSupabase()) return deleteSavedClientSearchSupabase(userId, searchId)

  return deleteSavedClientSearch(userId, searchId)
}

export async function recordSearchEventService(
  userId: string | undefined,
  input: SearchAnalyticsEventInput,
): Promise<SearchAnalyticsEvent | undefined> {
  if (shouldUseSupabase()) return recordSearchEventSupabase(userId, input)

  return recordSearchEvent(userId, input)
}

export async function recordProfileShareEventService(
  userId: string | undefined,
  input: ProfileShareEventInput,
): Promise<ProfileShareEvent | undefined> {
  if (shouldUseSupabase()) return recordProfileShareEventSupabase(userId, input)

  return recordProfileShareEvent(userId, input)
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
  if (shouldUsePlatformSupabase()) return getContractorRiskOpsDataSupabase(userId)

  const seededRiskOps = getContractorRiskOpsData(userId)

  if (seededRiskOps) return seededRiskOps

  const dashboard = await getContractorDashboardForPlatformFeatures(userId)

  if (!dashboard) return undefined

  return createDefaultRiskOpsData(dashboard.contractor.id)
}

export async function getAdminModerationCrmDataService() {
  if (shouldUsePlatformSupabase()) return getAdminModerationCrmDataSupabase()

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
  if (shouldUsePlatformSupabase()) return createWatchlistItemSupabase(userId, input)

  const dashboard = await getContractorDashboardForPlatformFeatures(userId)
  if (!dashboard) throw new Error("Contractor workspace was not found.")

  return createWatchlistItem({
    contractorId: dashboard.contractor.id,
    clientId: input.clientId,
    watchReason: input.watchReason,
    alertLevel: input.alertLevel,
  })
}

export async function updateWatchlistItemService(userId: string, itemId: string, status: WatchlistStatus) {
  if (shouldUsePlatformSupabase()) return updateWatchlistItemSupabase(userId, itemId, status)

  return updateWatchlistItem(itemId, status)
}

export async function saveReportDraftService(userId: string, input: ReportDraftInput) {
  if (shouldUsePlatformSupabase()) return saveReportDraftSupabase(userId, input)

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

export async function deleteReportDraftService(userId: string, draftId: string) {
  if (shouldUsePlatformSupabase()) return deleteReportDraftSupabase(userId, draftId)

  return deleteReportDraft(draftId)
}

export async function createIntakeAssessmentService(userId: string, input: IntakeAssessmentInput) {
  if (shouldUsePlatformSupabase()) return createIntakeAssessmentSupabase(userId, input)

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
  if (shouldUsePlatformSupabase()) return createPaymentRecoveryCaseSupabase(userId, input)

  const dashboard = await getContractorDashboardForPlatformFeatures(userId)
  if (!dashboard) throw new Error("Contractor workspace was not found.")

  return createPaymentRecoveryCase(dashboard.contractor.id, input)
}

export async function submitManagedRecoveryCaseService(userId: string, input: ManagedRecoveryCaseInput) {
  if (shouldUsePlatformSupabase()) return submitManagedRecoveryCaseSupabase(userId, input)

  const dashboard = await getContractorDashboardForPlatformFeatures(userId)
  if (!dashboard) throw new Error("Contractor workspace was not found.")

  return submitManagedRecoveryCase(dashboard.contractor.id, input)
}

export async function createServiceFeeOrderService(userId: string, input: ServiceFeeCheckoutInput) {
  if (shouldUsePlatformSupabase()) return createServiceFeeOrderSupabase(userId, input)

  const dashboard = await getContractorDashboardForPlatformFeatures(userId)
  if (!dashboard) throw new Error("Contractor workspace was not found.")

  return createServiceFeeOrder(dashboard.contractor.id, input)
}

export async function runRecoveryPrecheckService(userId: string, input: ServicePrecheckInput) {
  if (shouldUsePlatformSupabase()) return runRecoveryPrecheckSupabase(userId, input)

  return runRecoveryPrecheck(input)
}

export async function runFloridaLienPrecheckService(userId: string, input: ServicePrecheckInput) {
  if (shouldUsePlatformSupabase()) return runFloridaLienPrecheckSupabase(userId, input)

  return runFloridaLienPrecheck(input)
}

export async function linkEvidenceToServiceCaseService(userId: string, input: LinkEvidenceToServiceCaseInput) {
  if (shouldUsePlatformSupabase()) return linkEvidenceToServiceCaseSupabase(userId, input)

  const dashboard = await getContractorDashboardForPlatformFeatures(userId)
  if (!dashboard) throw new Error("Contractor workspace was not found.")

  return linkEvidenceToServiceCase(dashboard.contractor.id, input)
}

export async function markServiceFeePaidService(admin: User, input: MarkServiceFeePaidInput) {
  if (shouldUsePlatformSupabase()) return markServiceFeePaidSupabase(admin, input)

  return markServiceFeePaid(input)
}

export async function logResolutionDeskContactService(admin: User, input: ResolutionDeskContactInput) {
  if (shouldUsePlatformSupabase()) return logResolutionDeskContactSupabase(admin, input)

  return logResolutionDeskContact({ ...input, loggedByName: admin.fullName })
}

export async function markRecoveryResolvedService(admin: User, input: MarkRecoveryResolvedInput) {
  if (shouldUsePlatformSupabase()) return markRecoveryResolvedSupabase(admin, input)

  return markRecoveryResolved(input)
}

export async function createLienNoticeDraftService(userId: string, input: LienNoticeDraftInput) {
  if (shouldUsePlatformSupabase()) return createLienNoticeDraftSupabase(userId, input)

  const dashboard = await getContractorDashboardForPlatformFeatures(userId)
  if (!dashboard) throw new Error("Contractor workspace was not found.")

  return createLienNoticeDraft(dashboard.contractor.id, input)
}

export async function submitFloridaLienCaseService(userId: string, input: FloridaLienCaseInput) {
  if (shouldUsePlatformSupabase()) return submitFloridaLienCaseSupabase(userId, input)

  const dashboard = await getContractorDashboardForPlatformFeatures(userId)
  if (!dashboard) throw new Error("Contractor workspace was not found.")

  return submitFloridaLienCase(dashboard.contractor.id, input)
}

export async function signLienFilingAuthorizationService(userId: string, input: LienFilingAuthorizationInput) {
  if (shouldUsePlatformSupabase()) return signLienFilingAuthorizationSupabase(userId, input)

  const dashboard = await getContractorDashboardForPlatformFeatures(userId)
  if (!dashboard) throw new Error("Contractor workspace was not found.")

  return signLienFilingAuthorization(dashboard.contractor.id, input)
}

export async function adminRequestLienMoreInfoService(admin: User, input: AdminLienCaseActionInput) {
  if (shouldUsePlatformSupabase()) return adminRequestLienMoreInfoSupabase(admin, input)

  return adminRequestLienMoreInfo(input)
}

export async function adminApproveLienNoticeService(admin: User, input: AdminLienCaseActionInput) {
  if (shouldUsePlatformSupabase()) return adminApproveLienNoticeSupabase(admin, input)

  return adminApproveLienNotice(input)
}

export async function adminApproveLienFilingService(admin: User, input: AdminLienCaseActionInput) {
  if (shouldUsePlatformSupabase()) return adminApproveLienFilingSupabase(admin, input)

  return adminApproveLienFiling(input)
}

export async function adminRecordLienFiledService(admin: User, input: AdminRecordLienFiledInput) {
  if (shouldUsePlatformSupabase()) return adminRecordLienFiledSupabase(admin, input)

  return adminRecordLienFiled(input)
}

export async function adminUploadRecordingProofService(admin: User, input: AdminUploadRecordingProofInput) {
  if (shouldUsePlatformSupabase()) return adminUploadRecordingProofSupabase(admin, input)

  return adminUploadRecordingProof(input)
}

export async function adminRecordLienReleaseService(admin: User, input: AdminRecordLienReleaseInput) {
  if (shouldUsePlatformSupabase()) return adminRecordLienReleaseSupabase(admin, input)

  return adminRecordLienRelease(input)
}

export async function createContractWorkspaceItemService(userId: string, input: ContractWorkspaceItemInput) {
  if (shouldUsePlatformSupabase()) return createContractWorkspaceItemSupabase(userId, input)

  const dashboard = await getContractorDashboardForPlatformFeatures(userId)
  if (!dashboard) throw new Error("Contractor workspace was not found.")

  return createContractWorkspaceItem(dashboard.contractor.id, input)
}

export async function createClientPipelineItemService(userId: string, input: ClientPipelineItemInput) {
  if (shouldUsePlatformSupabase()) return createClientPipelineItemSupabase(userId, input)

  const dashboard = await getContractorDashboardForPlatformFeatures(userId)
  if (!dashboard) throw new Error("Contractor workspace was not found.")

  return createClientPipelineItem(dashboard.contractor.id, input)
}

export async function updateClientPipelineStageService(userId: string, input: UpdateClientPipelineStageInput) {
  if (shouldUsePlatformSupabase()) return updateClientPipelineStageSupabase(userId, input)

  return updateClientPipelineStage(input.itemId, input.stage)
}

export async function createClientRiskRoomService(userId: string, input: ClientRiskRoomInput) {
  if (shouldUsePlatformSupabase()) return createClientRiskRoomSupabase(userId, input)

  const dashboard = await getContractorDashboardForPlatformFeatures(userId)
  if (!dashboard) throw new Error("Contractor workspace was not found.")

  return createClientRiskRoom(dashboard.contractor.id, input)
}

export async function logPaymentRecoveryAttemptService(userId: string, input: PaymentRecoveryAttemptInput) {
  if (shouldUsePlatformSupabase()) return logPaymentRecoveryAttemptSupabase(userId, input)

  const dashboard = await getContractorDashboardForPlatformFeatures(userId)
  if (!dashboard) throw new Error("Contractor workspace was not found.")

  return logPaymentRecoveryAttempt(dashboard.contractor.id, input)
}

export async function createPaymentPlanService(userId: string, input: PaymentPlanInput) {
  if (shouldUsePlatformSupabase()) return createPaymentPlanSupabase(userId, input)

  const dashboard = await getContractorDashboardForPlatformFeatures(userId)
  if (!dashboard) throw new Error("Contractor workspace was not found.")

  return createPaymentPlan(dashboard.contractor.id, input)
}

export async function createContractPacketService(userId: string, input: ContractPacketInput) {
  if (shouldUsePlatformSupabase()) return createContractPacketSupabase(userId, input)

  const dashboard = await getContractorDashboardForPlatformFeatures(userId)
  if (!dashboard) throw new Error("Contractor workspace was not found.")

  return createContractPacket(dashboard.contractor.id, input)
}

export async function updateContractPacketStatusService(userId: string, input: UpdateContractPacketStatusInput) {
  if (shouldUsePlatformSupabase()) return updateContractPacketStatusSupabase(userId, input)

  return updateContractPacketStatus(input)
}

export async function createContractShareLinkService(userId: string, input: ContractShareLinkInput) {
  if (shouldUsePlatformSupabase()) return createContractShareLinkSupabase(userId, input)

  const dashboard = await getContractorDashboardForPlatformFeatures(userId)
  if (!dashboard) throw new Error("Contractor workspace was not found.")

  return createContractShareLink(dashboard.contractor.id, input)
}

export async function getContractShareByTokenService(token: string) {
  if (shouldUsePlatformSupabase()) return getContractPacketByShareTokenSupabase(token)

  return getContractPacketByShareToken(token)
}

export async function signContractShareService(
  input: ContractSignatureInput,
  audit?: ContractSignatureAuditInput,
) {
  if (shouldUsePlatformSupabase()) return signContractShareSupabase(input, audit)

  return signContractShare(input, audit)
}

export async function updateEvidenceVaultStatusService(userId: string, input: UpdateEvidenceVaultStatusInput) {
  if (shouldUsePlatformSupabase()) return updateEvidenceVaultStatusSupabase(userId, input)

  return updateEvidenceVaultStatus(input)
}

export async function saveAdminQueueViewService(admin: User, input: AdminSavedViewInput) {
  if (shouldUsePlatformSupabase()) return saveAdminQueueViewSupabase(admin, input)

  return saveAdminQueueView(admin.id, input)
}

export async function reviewRecoveryComplianceService(admin: User, input: RecoveryComplianceReviewInput) {
  if (shouldUsePlatformSupabase()) return reviewRecoveryComplianceSupabase(admin, input)

  return reviewRecoveryCompliance(admin.id, input)
}

export async function assignModerationCaseService(caseId: string, admin: User, assignedTo: string) {
  if (shouldUsePlatformSupabase()) return assignModerationCaseSupabase(caseId, admin, assignedTo)

  return assignMockModerationCase(caseId, assignedTo, admin.fullName)
}

export async function updateModerationCaseService(
  caseId: string,
  admin: User,
  priority: ModerationPriority,
  status: ModerationCaseStatus,
  escalationNote?: string,
) {
  if (shouldUsePlatformSupabase()) return updateModerationCaseSupabase(caseId, admin, priority, status, escalationNote)

  return updateMockModerationCase(caseId, priority, status, escalationNote)
}

export async function setModerationDecisionReasonService(
  caseId: string,
  admin: User,
  decisionReason: ModerationDecisionReason,
  moderatorNote?: string,
) {
  if (shouldUsePlatformSupabase()) return setModerationDecisionReasonSupabase(caseId, admin, decisionReason, moderatorNote)

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
    managedRecoveryCases: [],
    recoveryCommunications: [],
    recoveryResolutionOffers: [],
    floridaLienCases: [],
    lienNoticeDeliveries: [],
    lienFilingRecords: [],
    lienReleaseRecords: [],
    serviceFeeOrders: [],
    serviceReadiness: [],
    caseDocumentLinks: [],
    caseStaffAssignments: [],
    caseAuditEvents: [],
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
      "Check a client before accepting the next job.",
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
