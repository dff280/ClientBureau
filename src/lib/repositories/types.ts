import type {
  AdminReview,
  AdminModerationCrmData,
  AdminSavedView,
  AuditLogEntry,
  ClientIntakeAssessment,
  ClientPipelineItem,
  ClientReport,
  ClientRiskRoom,
  ClientSearchResult,
  ContractPacket,
  ContractWorkspaceItem,
  ContractorRiskOpsData,
  ContractorWatchlistItem,
  EvidenceVaultItem,
  LienNoticeDraft,
  ModerationCase,
  ModerationCaseStatus,
  ModerationDecisionReason,
  ModerationPriority,
  PaymentPlan,
  PaymentRecoveryCase,
  PaymentRecoveryAttempt,
  PublicClientProfile,
  RecoveryComplianceReview,
  ReportDraft,
  SearchFilters,
  WatchlistStatus,
} from "@/lib/types"
import type {
  AdminSavedViewInput,
  ClientPipelineItemInput,
  ClientReportInput,
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
  UpdateContractPacketStatusInput,
  UpdateEvidenceVaultStatusInput,
  WatchlistItemInput,
} from "@/lib/schemas/client-bureau"

export interface ClientBureauRepository {
  searchClients(query?: string, filters?: SearchFilters): ClientSearchResult[]
  getPublicClientProfile(slug: string): PublicClientProfile | undefined
  submitClientReport(input: ClientReportInput): ClientReport
  reviewReport(
    reportId: string,
    decision: "approved" | "rejected",
    editedPublicSummary?: string,
  ): AdminReview
  getContractorRiskOpsData(userId: string): ContractorRiskOpsData | undefined
  getAdminModerationCrmData(): AdminModerationCrmData
  createWatchlistItem(userId: string, input: WatchlistItemInput): ContractorWatchlistItem
  updateWatchlistItem(itemId: string, status: WatchlistStatus): ContractorWatchlistItem
  saveReportDraft(userId: string, input: ReportDraftInput): ReportDraft
  deleteReportDraft(draftId: string): AuditLogEntry
  createIntakeAssessment(userId: string, input: IntakeAssessmentInput): ClientIntakeAssessment
  createPaymentRecoveryCase(userId: string, input: PaymentRecoveryCaseInput): PaymentRecoveryCase
  createLienNoticeDraft(userId: string, input: LienNoticeDraftInput): LienNoticeDraft
  createContractWorkspaceItem(userId: string, input: ContractWorkspaceItemInput): ContractWorkspaceItem
  createClientPipelineItem(userId: string, input: ClientPipelineItemInput): ClientPipelineItem
  updateClientPipelineStage(itemId: string, stage: ClientPipelineItem["stage"]): ClientPipelineItem
  createClientRiskRoom(userId: string, input: ClientRiskRoomInput): ClientRiskRoom
  logPaymentRecoveryAttempt(userId: string, input: PaymentRecoveryAttemptInput): PaymentRecoveryAttempt
  createPaymentPlan(userId: string, input: PaymentPlanInput): PaymentPlan
  createContractPacket(userId: string, input: ContractPacketInput): ContractPacket
  updateContractPacketStatus(input: UpdateContractPacketStatusInput): ContractPacket
  updateEvidenceVaultStatus(input: UpdateEvidenceVaultStatusInput): EvidenceVaultItem
  saveAdminQueueView(userId: string, input: AdminSavedViewInput): AdminSavedView
  reviewRecoveryCompliance(userId: string, input: RecoveryComplianceReviewInput): RecoveryComplianceReview
  assignModerationCase(caseId: string, reviewerId: string, reviewerName: string): ModerationCase
  updateModerationCase(
    caseId: string,
    priority: ModerationPriority,
    status: ModerationCaseStatus,
    escalationNote?: string,
  ): ModerationCase
  setModerationDecisionReason(
    caseId: string,
    decisionReason: ModerationDecisionReason,
    moderatorNote?: string,
  ): ModerationCase
}
