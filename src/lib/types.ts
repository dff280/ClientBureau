export const reportCategories = [
  "Non-payment",
  "Late payment",
  "Scope creep",
  "Chargeback",
  "False complaint",
  "Abusive behavior",
  "No-show / cancellation",
  "Positive experience",
  "Would work with again",
  "Other",
] as const

export const positiveReportCategories = [
  "Positive experience",
  "Would work with again",
] as const

export const concernReportCategories = reportCategories.filter(
  (category) => !positiveReportCategories.includes(category as (typeof positiveReportCategories)[number]),
)

export const riskLevels = ["Low", "Moderate", "Elevated", "High"] as const

export type ReportCategory = (typeof reportCategories)[number]
export type RiskLevel = (typeof riskLevels)[number]
export type ReportStatus = "pending" | "approved" | "rejected" | "disputed"
export type ReportResolutionStatus =
  | "Unresolved"
  | "Partially paid"
  | "Paid in full"
  | "Settled"
  | "Disputed"
  | "Resolved"
  | "Removed"
  | "Admin verified"
export type SubscriptionTier = "free" | "pro" | "bureau_team"
export type UserRole = "contractor" | "admin"
export type VerificationStatus = "unverified" | "pending" | "verified"
export type VerificationBadge =
  | "Verified business"
  | "Verified identity"
  | "Verified license"
  | "Verified insurance"
  | "Verified email"
  | "Verified phone"
export type WatchlistStatus = "active" | "cleared"
export type WatchlistAlertEventType =
  | "new_report"
  | "new_discussion"
  | "client_response"
  | "dispute_opened"
  | "case_resolved"
  | "risk_score_changed"
  | "payment_status_changed"
export type ReportDraftStatus = "draft" | "ready_to_submit" | "submitted"
export type EvidenceReviewStatus = "missing" | "uploaded" | "review_pending" | "reviewed" | "needs_more_info"
export type ModerationPriority = "low" | "normal" | "high" | "urgent"
export type ModerationCaseStatus = "unassigned" | "assigned" | "escalated" | "closed"
export type ModerationDecisionReason =
  | "approved_with_edits"
  | "insufficient_evidence"
  | "private_information"
  | "neutrality_issue"
  | "duplicate_report"
  | "policy_rejection"
export type PaymentRecoveryStatus =
  | "draft"
  | "ready_to_contact"
  | "contacted"
  | "payment_plan"
  | "resolved"
  | "paused"
export type RecoveryChannel = "email" | "phone" | "letter" | "client_portal"
export type LienNoticeStatus =
  | "deadline_review"
  | "draft"
  | "ready_for_review"
  | "sent"
  | "released"
  | "not_eligible"
export type ContractTemplateType =
  | "service_agreement"
  | "change_order"
  | "payment_plan"
  | "completion_certificate"
  | "notice_of_nonpayment"
export type ContractDocumentStatus = "draft" | "sent" | "signed" | "expired" | "archived"
export type ClientPipelineStage =
  | "new_lead"
  | "screening"
  | "contract_pending"
  | "active_job"
  | "payment_follow_up"
  | "closed"
export type PaymentRecoveryAttemptOutcome =
  | "no_response"
  | "client_responded"
  | "payment_promised"
  | "payment_received"
  | "dispute_raised"
  | "needs_follow_up"
export type PaymentPlanStatus = "proposed" | "accepted" | "active" | "completed" | "missed" | "paused"
export type ContractPacketStatus = "draft" | "review_ready" | "sent" | "signed" | "expired" | "archived"
export type ContractShareStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "client_joined"
  | "signed"
  | "payment_pending"
  | "completed"
  | "expired"
export type ContractSignatureStatus =
  | "not_sent"
  | "awaiting_client"
  | "client_signed"
  | "contractor_signed"
  | "fully_signed"
  | "declined"
export type ClientInviteStatus = "not_invited" | "invited" | "joined"
export type ContractPaymentMode = "none" | "deposit_request" | "milestone_schedule" | "platform_review"
export type EvidenceVaultStatus = "uploaded" | "mapped" | "review_pending" | "reviewed" | "needs_more_info" | "archived"
export type AdminSavedViewScope =
  | "reports"
  | "clients"
  | "contractors"
  | "discussions"
  | "uploads"
  | "recovery"
  | "contracts"
  | "audit"
export type RecoveryComplianceStatus = "pending" | "approved" | "needs_changes" | "blocked"
export type DiscussionCategory =
  | "Contractor Experience"
  | "Client Response"
  | "Resolution Update"
  | "Supporting Context"
  | "Dispute / Correction"
  | "Reference / Verification"
export type DiscussionStatus = "pending" | "approved" | "rejected"
export type AdminEntityType =
  | "user"
  | "contractor"
  | "client"
  | "report"
  | "discussion"
  | "evidence"
  | "bulk_upload"
  | "recovery"
  | "lien_readiness"
  | "contract"
  | "contract_packet"
  | "risk_room"
  | "pipeline"
  | "evidence_vault"
  | "saved_view"
  | "assignment"
  | "compliance_review"
  | "setting"
export type TimelineEventType =
  | "submitted"
  | "evidence_uploaded"
  | "moderation"
  | "approved"
  | "published"
  | "disputed"
  | "response_received"
export type ReviewChecklistStatus = "pass" | "warning" | "fail" | "pending"

export function isPositiveReportCategory(category: ReportCategory) {
  return positiveReportCategories.includes(category as (typeof positiveReportCategories)[number])
}

export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  createdAt: string
}

export interface ContractorProfile {
  id: string
  userId: string
  businessName: string
  trade: string
  city: string
  state: string
  licenseNumber?: string
  verificationStatus: VerificationStatus
  verificationBadges?: VerificationBadge[]
  createdAt: string
}

export interface ClientProfile {
  id: string
  firstName: string
  lastName: string
  businessName?: string
  city: string
  state: string
  zip?: string
  phoneHash: string
  emailHash: string
  publicSlug: string
  clientBureauScore: number
  riskLevel: RiskLevel
  reportCount: number
  createdAt: string
  updatedAt: string
  isPublic: boolean
}

export interface ContractorWatchlistItem {
  id: string
  contractorId: string
  clientId: string
  status: WatchlistStatus
  watchReason: string
  alertLevel: ModerationPriority
  lastSignal: string
  privateMatch: boolean
  createdAt: string
  updatedAt: string
}

export interface WatchlistAlert {
  id: string
  contractorId: string
  clientId?: string
  profileSlug?: string
  eventType: WatchlistAlertEventType
  title: string
  description: string
  severity: "low" | "normal" | "high" | "urgent"
  createdAt: string
  readAt?: string
}

export interface ReportDraft {
  id: string
  contractorId: string
  clientId?: string
  clientName: string
  projectType: string
  estimatedValue: number
  amountAtRisk: number
  summary: string
  nextStep: string
  status: ReportDraftStatus
  updatedAt: string
}

export interface ClientIntakeAssessment {
  id: string
  contractorId: string
  clientName: string
  city: string
  state: string
  projectValue: number
  depositReceived: boolean
  contractSigned: boolean
  privateMatchConfirmed: boolean
  recommendation: "Proceed" | "Request deposit" | "Use milestone billing" | "Review before scheduling"
  score: number
  notes: string
  createdAt: string
}

export interface EvidenceReviewSummary {
  id: string
  reportId: string
  contractorId: string
  status: EvidenceReviewStatus
  label: string
  fileCount: number
  reviewedCount: number
  lastUpdatedAt: string
}

export interface PaymentRecoveryCase {
  id: string
  contractorId: string
  clientName: string
  city: string
  state: string
  amountDue: number
  invoiceAgeDays: number
  preferredChannel: RecoveryChannel
  status: PaymentRecoveryStatus
  priority: ModerationPriority
  lastContactAt?: string
  nextAction: string
  summary: string
  complianceFlags: string[]
  createdAt: string
  updatedAt: string
}

export interface LienNoticeDraft {
  id: string
  contractorId: string
  clientName: string
  projectType: string
  propertyCity: string
  state: string
  amountDue: number
  lastWorkDate: string
  targetSendDate?: string
  status: LienNoticeStatus
  requiredReview: boolean
  nextStep: string
  jurisdictionNote: string
  createdAt: string
  updatedAt: string
}

export interface ContractWorkspaceItem {
  id: string
  contractorId: string
  clientName: string
  projectType: string
  templateType: ContractTemplateType
  contractValue: number
  depositRequired: number
  milestoneBilling: boolean
  status: ContractDocumentStatus
  nextStep: string
  summary: string
  createdAt: string
  updatedAt: string
}

export interface ClientPipelineItem {
  id: string
  contractorId: string
  clientId?: string
  clientName: string
  city: string
  state: string
  stage: ClientPipelineStage
  priority: ModerationPriority
  estimatedValue: number
  nextAction: string
  dueAt?: string
  privateMatch: boolean
  createdAt: string
  updatedAt: string
}

export interface ClientRiskRoom {
  id: string
  contractorId: string
  clientId?: string
  clientName: string
  city: string
  state: string
  headline: string
  summary: string
  linkedSearchIds: string[]
  linkedWatchlistIds: string[]
  linkedAssessmentIds: string[]
  linkedContractIds: string[]
  linkedReportDraftIds: string[]
  linkedEvidenceIds: string[]
  linkedRecoveryIds: string[]
  linkedResolutionIds: string[]
  lastActivityAt: string
  createdAt: string
}

export interface PaymentRecoveryAttempt {
  id: string
  recoveryCaseId: string
  contractorId: string
  channel: RecoveryChannel
  attemptedAt: string
  outcome: PaymentRecoveryAttemptOutcome
  note: string
  nextFollowUpAt?: string
  createdAt: string
}

export interface PaymentPlan {
  id: string
  recoveryCaseId: string
  contractorId: string
  totalAmount: number
  installmentAmount: number
  dueDay: number
  status: PaymentPlanStatus
  nextDueDate?: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface ContractPacket {
  id: string
  contractorId: string
  clientName: string
  projectType: string
  templateType: ContractTemplateType
  status: ContractPacketStatus
  packetValue: number
  depositRequired: number
  milestoneCount: number
  requiredBeforeScheduling: boolean
  nextAction: string
  shareToken?: string
  shareUrl?: string
  clientEmailMasked?: string
  clientInviteStatus?: ClientInviteStatus
  signatureStatus?: ContractSignatureStatus
  shareStatus?: ContractShareStatus
  paymentMode?: ContractPaymentMode
  paymentSummary?: string
  clientSignedAt?: string
  contractorSignedAt?: string
  createdAt: string
  updatedAt: string
}

export interface EvidenceVaultItem {
  id: string
  contractorId: string
  reportId?: string
  clientName: string
  label: string
  fileCategory: "invoice" | "screenshot" | "contract" | "photo" | "pdf" | "other"
  status: EvidenceVaultStatus
  privateStoragePath: string
  publicSummary: string
  uploadedAt: string
  updatedAt: string
}

export interface ContractorActivityItem {
  id: string
  contractorId: string
  title: string
  description: string
  createdAt: string
  tone: "neutral" | "positive" | "warning"
}

export interface ContractorRiskOpsData {
  clientPipeline: ClientPipelineItem[]
  riskRooms: ClientRiskRoom[]
  watchlist: ContractorWatchlistItem[]
  watchlistAlerts: WatchlistAlert[]
  reportDrafts: ReportDraft[]
  intakeAssessments: ClientIntakeAssessment[]
  evidenceSummaries: EvidenceReviewSummary[]
  evidenceVault: EvidenceVaultItem[]
  paymentRecoveryCases: PaymentRecoveryCase[]
  paymentRecoveryAttempts: PaymentRecoveryAttempt[]
  paymentPlans: PaymentPlan[]
  lienNoticeDrafts: LienNoticeDraft[]
  contractDocuments: ContractWorkspaceItem[]
  contractPackets: ContractPacket[]
  activity: ContractorActivityItem[]
  recommendedActions: string[]
}

export interface ClientReport {
  id: string
  contractorId: string
  clientId: string
  projectType: string
  projectCity: string
  projectState: string
  contractAmount: number
  amountUnpaid: number
  reportCategory: ReportCategory
  paymentStatus: string
  reportSummary: string
  detailedExperience: string
  publicSummary: string
  evidenceAttached: boolean
  status: ReportStatus
  resolutionStatus?: ReportResolutionStatus
  moderationNote?: string
  createdAt: string
  approvedAt?: string
  timeline?: ReportTimelineEvent[]
}

export interface ReportTimelineEvent {
  id: string
  reportId: string
  type: TimelineEventType
  title: string
  description: string
  createdAt: string
}

export interface ReviewChecklistItem {
  id: string
  reportId: string
  label: string
  description: string
  status: ReviewChecklistStatus
}

export interface ScoreFactor {
  label: string
  impact: number
  tone: "positive" | "negative" | "neutral"
  description: string
}

export interface ScoreCategoryBreakdown {
  label: string
  score: number
  description: string
  tone: "positive" | "neutral" | "warning" | "critical"
}

export interface ReportedBalanceSummary {
  totalReportedUnpaid: number
  unresolvedAmount: number
  resolvedAmount: number
  resolvedReportCount: number
  openDisputeCount: number
}

export interface PublicationAudit {
  reportId: string
  previousIsPublic: boolean
  nextIsPublic: boolean
  generatedSlug: string
  recalculatedScore: number
  recalculatedRiskLevel: RiskLevel
  publicSummary: string
  publishedAt: string
}

export interface ReportEvidence {
  id: string
  reportId: string
  fileName: string
  fileType: string
  storagePath: string
  uploadedAt: string
}

export interface ClientResponse {
  id: string
  clientId: string
  reportId?: string
  responseSummary: string
  status: "pending" | "published" | "rejected"
  createdAt: string
  publishedAt?: string
}

export interface CommunityDiscussion {
  id: string
  clientId: string
  reportId?: string
  authorName: string
  authorEmailHash: string
  relationshipCategory: DiscussionCategory
  commentBody: string
  attachmentUrl?: string
  status: DiscussionStatus
  isVerified: boolean
  moderatorNote?: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export interface Subscription {
  id: string
  contractorId: string
  tier: SubscriptionTier
  status: "trialing" | "active" | "past_due" | "canceled" | "mock"
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  stripePriceId?: string
  currentPeriodEnd?: string
}

export interface AuditLogEntry {
  id: string
  actorId?: string
  actorName?: string
  action: string
  entityType: AdminEntityType
  entityId: string
  summary: string
  metadata?: Record<string, string | number | boolean | null>
  createdAt: string
}

export interface ModerationCase {
  id: string
  reportId?: string
  discussionId?: string
  clientId?: string
  title: string
  summary: string
  priority: ModerationPriority
  status: ModerationCaseStatus
  queueStage: "triage" | "evidence_review" | "summary_edit" | "decision" | "published"
  assignedTo?: string
  assignedToName?: string
  dueAt: string
  decisionReason?: ModerationDecisionReason
  escalationNote?: string
  publicSummaryPreview?: string
  createdAt: string
  updatedAt: string
}

export interface AdminWorkloadMetric {
  id: string
  label: string
  value: number
  helper: string
  tone: "slate" | "amber" | "emerald" | "rose"
}

export interface BulkImportBatch {
  id: string
  fileName: string
  createdBy: string
  createdAt: string
  totalRows: number
  readyRows: number
  duplicateRows: number
  importedRows: number
  status: "staged" | "imported" | "needs_review"
}

export interface AdminModerationCrmData {
  cases: ModerationCase[]
  workload: AdminWorkloadMetric[]
  importBatches: BulkImportBatch[]
  savedViews: AdminSavedView[]
  queueAssignments: AdminQueueAssignment[]
  recoveryComplianceReviews: RecoveryComplianceReview[]
}

export interface AdminSavedView {
  id: string
  scope: AdminSavedViewScope
  name: string
  filters: Record<string, string>
  isDefault: boolean
  createdBy: string
  createdAt: string
}

export interface AdminQueueAssignment {
  id: string
  entityType: AdminSavedViewScope
  entityId: string
  assignedTo: string
  assignedToName: string
  priority: ModerationPriority
  dueAt: string
  status: "open" | "in_review" | "closed"
}

export interface RecoveryComplianceReview {
  id: string
  recoveryCaseId?: string
  lienNoticeDraftId?: string
  contractPacketId?: string
  reviewerId?: string
  status: RecoveryComplianceStatus
  decisionReason: string
  requiredChanges: string[]
  publicVisibilityAllowed: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminWorkspaceData {
  users: User[]
  contractors: ContractorProfile[]
  clients: ClientProfile[]
  reports: ClientReport[]
  evidence: ReportEvidence[]
  responses: ClientResponse[]
  discussions: CommunityDiscussion[]
  reviews: {
    review: AdminReview
    report?: ClientReport
    client?: ClientProfile
    evidence: ReportEvidence[]
    checklist: ReviewChecklistItem[]
  }[]
  auditLog: AuditLogEntry[]
}

export interface BulkUploadPreviewRow {
  rowNumber: number
  clientName: string
  city: string
  state: string
  reportType: string
  amount: number
  date: string
  summary: string
  status: string
  notes?: string
  errors: string[]
  duplicate: boolean
}

export interface AdminReview {
  id: string
  reportId: string
  reviewerId?: string
  status: "queued" | "approved" | "rejected" | "needs_dispute_review"
  editedPublicSummary?: string
  notes?: string
  publishedProfileSlug?: string
  publishedProfileUrl?: string
  createdAt: string
  updatedAt: string
}

export interface SavedSearch {
  id: string
  contractorId: string
  query: string
  city?: string
  state?: string
  createdAt: string
}

export interface PublicClientProfile extends ClientProfile {
  reports: ClientReport[]
  positiveReports: ClientReport[]
  clientResponses: ClientResponse[]
  communityDiscussions: CommunityDiscussion[]
  evidence: ReportEvidence[]
  timeline: ReportTimelineEvent[]
  scoreFactors: ScoreFactor[]
  scoreBreakdown: ScoreCategoryBreakdown[]
  balanceSummary: ReportedBalanceSummary
  paymentReliability: string
  disputeHistory: string
}

export interface SearchFilters {
  state?: string
  riskLevel?: RiskLevel
  category?: ReportCategory
}

export interface ClientSearchResult extends ClientProfile {
  matchedBy: string
  matchScore: number
  latestCategory?: ReportCategory
  latestSummary?: string
}

export type ActionResult<T> =
  | { ok: true; data: T; message: string }
  | {
      ok: false
      fieldErrors?: Record<string, string[]>
      message: string
    }
