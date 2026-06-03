import type {
  AdminReview,
  AdminModerationCrmData,
  AuditLogEntry,
  ClientIntakeAssessment,
  ClientReport,
  ClientSearchResult,
  ContractWorkspaceItem,
  ContractorRiskOpsData,
  ContractorWatchlistItem,
  LienNoticeDraft,
  ModerationCase,
  ModerationCaseStatus,
  ModerationDecisionReason,
  ModerationPriority,
  PaymentRecoveryCase,
  PublicClientProfile,
  ReportDraft,
  SearchFilters,
  WatchlistStatus,
} from "@/lib/types"
import type {
  ClientReportInput,
  ContractWorkspaceItemInput,
  IntakeAssessmentInput,
  LienNoticeDraftInput,
  PaymentRecoveryCaseInput,
  ReportDraftInput,
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
