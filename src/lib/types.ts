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

export interface ContractorActivityItem {
  id: string
  contractorId: string
  title: string
  description: string
  createdAt: string
  tone: "neutral" | "positive" | "warning"
}

export interface ContractorRiskOpsData {
  watchlist: ContractorWatchlistItem[]
  watchlistAlerts: WatchlistAlert[]
  reportDrafts: ReportDraft[]
  intakeAssessments: ClientIntakeAssessment[]
  evidenceSummaries: EvidenceReviewSummary[]
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
