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

export const accountTypes = ["contractor", "subcontractor", "client"] as const
export const profileTypes = ["client", "contractor", "subcontractor"] as const
export const clientProfileSubtypes = [
  "Homeowner",
  "Business client",
  "Property manager",
  "Landlord",
  "Real estate investor",
  "HOA / condo association",
  "Commercial property owner",
  "Tenant",
  "Other",
] as const
export const contractorProfileSubtypes = [
  "General contractor",
  "Specialty contractor",
  "Service business",
  "Freelancer",
  "Agency",
  "Property service company",
  "Mobile service provider",
  "Other",
] as const
export const subcontractorProfileSubtypes = [
  "Individual trade professional",
  "Licensed subcontractor",
  "Crew",
  "Installer",
  "Labor provider",
  "Specialty trade",
  "Other",
] as const
export const claimedStatuses = ["unclaimed", "claim_pending", "claimed", "disputed", "verified"] as const
export const profileClaimStatuses = ["pending", "approved", "rejected", "disputed"] as const
export const reportConfidenceLevels = [
  "basic_report",
  "documented_report",
  "evidence_reviewed",
  "response_available",
  "resolved_report",
] as const
export const verificationLevels = [
  "email_verified",
  "phone_verified",
  "business_verified",
  "license_verified",
  "insurance_verified",
  "admin_verified",
] as const
export const projectJobStatuses = [
  "lead",
  "estimate",
  "scheduled",
  "in_progress",
  "on_hold",
  "draft",
  "screening",
  "contract_pending",
  "active",
  "completed",
  "cancelled",
  "payment_issue",
  "disputed",
  "resolved",
  "archived",
] as const
export const projectProfileRoles = [
  "client",
  "property_owner",
  "primary_contact",
  "prime_contractor",
  "hiring_contractor",
  "contractor",
  "subcontractor",
  "sub_subcontractor",
  "vendor",
  "supplier",
  "project_manager",
  "estimator",
  "internal_crew",
  "owner",
  "property_manager",
  "reporter",
  "subject",
  "other",
] as const
export const projectJobTypes = [
  "direct_client_job",
  "contractor_managed_job",
  "subcontracted_work",
  "internal_project",
  "warranty_callback",
  "other",
] as const
export const projectJobPriorities = ["low", "normal", "high", "urgent"] as const
export const projectPropertyTypes = [
  "residential",
  "commercial",
  "multi_family",
  "hoa_community",
  "industrial",
  "other",
] as const
export const jobParticipantStatuses = ["active", "pending", "completed", "removed"] as const
export const jobBillingRelationships = [
  "client_pays_contractor",
  "contractor_pays_subcontractor",
  "contractor_pays_vendor",
  "direct_owner_payment",
  "internal",
  "other",
] as const
export const reportRelationshipTypes = [
  "contractor_to_client",
  "subcontractor_to_contractor",
  "contractor_to_subcontractor",
  "client_to_contractor",
  "business_to_business",
] as const
export const publicInquiryTypes = ["general_support", "enterprise"] as const
export const publicInquiryTopics = [
  "account_help",
  "report_or_moderation",
  "client_response_or_correction",
  "profile_claim_or_verification",
  "enterprise_or_team_review",
  "privacy_or_policy",
  "other",
] as const
export const publicInquiryStatuses = ["new", "reviewing", "resolved", "spam", "archived"] as const

export type ReportCategory = (typeof reportCategories)[number]
export type RiskLevel = (typeof riskLevels)[number]
export type AccountType = (typeof accountTypes)[number]
export type ProfileType = (typeof profileTypes)[number]
export type ClientProfileSubtype = (typeof clientProfileSubtypes)[number]
export type ContractorProfileSubtype = (typeof contractorProfileSubtypes)[number]
export type SubcontractorProfileSubtype = (typeof subcontractorProfileSubtypes)[number]
export type ProfileSubtype = ClientProfileSubtype | ContractorProfileSubtype | SubcontractorProfileSubtype
export type ClaimedStatus = (typeof claimedStatuses)[number]
export type ProfileClaimStatus = (typeof profileClaimStatuses)[number]
export type ReportRelationshipType = (typeof reportRelationshipTypes)[number]
export type PublicInquiryType = (typeof publicInquiryTypes)[number]
export type PublicInquiryTopic = (typeof publicInquiryTopics)[number]
export type PublicInquiryStatus = (typeof publicInquiryStatuses)[number]
export type ReportConfidenceLevel = (typeof reportConfidenceLevels)[number]
export type VerificationLevel = (typeof verificationLevels)[number]
export type ProjectJobStatus = (typeof projectJobStatuses)[number]
export type ProjectProfileRole = (typeof projectProfileRoles)[number]
export type ProjectJobType = (typeof projectJobTypes)[number]
export type ProjectJobPriority = (typeof projectJobPriorities)[number]
export type ProjectPropertyType = (typeof projectPropertyTypes)[number]
export type JobParticipantStatus = (typeof jobParticipantStatuses)[number]
export type JobBillingRelationship = (typeof jobBillingRelationships)[number]
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
export type BusinessRatingGrade = "A+" | "A" | "B" | "C" | "Review Pending"
export type BusinessRatingConfidence = "Basic" | "Moderate" | "Strong"
export type ProfileRatingModel =
  | "client_risk"
  | "contractor_business_reliability"
  | "subcontractor_trade_partner_reliability"
  | "contractor_business_reliability_v3"
  | "subcontractor_trade_partner_reliability_v3"
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
export type ManagedRecoveryStatus =
  | "draft"
  | "fee_due"
  | "submitted"
  | "under_review"
  | "needs_more_info"
  | "contact_in_progress"
  | "client_responded"
  | "payment_plan_offered"
  | "resolved"
  | "unresolved"
  | "paused"
  | "closed"
export type RecoveryChannel = "email" | "phone" | "letter" | "client_portal"
export type LienNoticeStatus =
  | "deadline_review"
  | "draft"
  | "ready_for_review"
  | "sent"
  | "released"
  | "not_eligible"
export type FloridaLienWorkflowType = "notice_packet" | "claim_of_lien_filing"
export type FloridaLienCaseStatus =
  | "draft"
  | "fee_due"
  | "document_review"
  | "needs_more_info"
  | "contractor_signature_required"
  | "attorney_vendor_review"
  | "approved_to_send"
  | "notice_sent"
  | "approved_to_file"
  | "filed"
  | "recording_confirmed"
  | "release_pending"
  | "released"
  | "blocked"
  | "closed"
export type LienDeliveryMethod = "certified_mail" | "process_server" | "e_recording_vendor" | "attorney_vendor" | "manual_admin"
export type LienFilingMethod = "attorney_vendor" | "e_recording_vendor" | "county_clerk_manual"
export type ServiceFeeKind = "managed_recovery" | "florida_lien_notice" | "florida_lien_filing"
export type ServiceFeeStatus = "draft" | "checkout_ready" | "paid" | "failed" | "refunded" | "waived"
export type ServiceReadinessStatus =
  | "incomplete"
  | "ready_for_checkout"
  | "fee_due"
  | "submitted"
  | "under_review"
  | "needs_more_info"
  | "blocked"
  | "closed"
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
  | "entity_profile"
  | "profile_claim"
  | "project_job"
  | "profile_relationship"
  | "profile_merge"
  | "report_reassignment"
  | "profile_redaction"
  | "report"
  | "discussion"
  | "evidence"
  | "bulk_upload"
  | "recovery"
  | "lien_readiness"
  | "contract"
  | "contract_packet"
  | "managed_recovery"
  | "florida_lien"
  | "service_fee"
  | "risk_room"
  | "pipeline"
  | "evidence_vault"
  | "saved_view"
  | "assignment"
  | "compliance_review"
  | "setting"
export const siteErrorSeverities = ["info", "low", "medium", "high", "critical"] as const
export const siteErrorStatuses = ["new", "triaged", "in_progress", "resolved", "ignored"] as const
export type SiteErrorSeverity = (typeof siteErrorSeverities)[number]
export type SiteErrorStatus = (typeof siteErrorStatuses)[number]
export type SiteErrorSource = "manual" | "browser" | "server" | "qa"
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
  accountType?: AccountType
  createdAt: string
}

export interface ContractorProfile {
  id: string
  userId: string
  accountType?: AccountType
  accountCapabilities?: ProfileType[]
  businessName: string
  trade: string
  businessType?: string
  businessPhone?: string
  websiteUrl?: string
  serviceArea?: string
  companySize?: string
  yearsInBusiness?: string
  primaryGoal?: string
  city: string
  state: string
  licenseNumber?: string
  verificationStatus: VerificationStatus
  verificationBadges?: VerificationBadge[]
  profileSubtype?: ProfileSubtype | string
  tradeCategory?: string
  publicSummary?: string
  isPublic?: boolean
  publicSlug?: string
  createdAt: string
}

export interface BusinessRatingFactor {
  label: string
  score: number
  maxScore: number
  status: "strong" | "good" | "needs_attention"
  description: string
}

export interface PublicBusinessProfile extends ContractorProfile {
  publicSlug: string
  ratingScore: number
  ratingGrade: BusinessRatingGrade
  ratingConfidence: BusinessRatingConfidence
  ratingSummary: string
  ratingFactors: BusinessRatingFactor[]
  memberSince: string
  lastUpdated: string
  serviceAreas: string[]
  publicProfileStatus: "Verified" | "Verification pending" | "Basic profile"
  reportStats: {
    submitted: number
    approved: number
    published: number
    positive: number
    disputed: number
    evidenceAttached: number
  }
  publicClientReports: Array<{
    report: ClientReport
    client: ClientProfile
  }>
  trustHighlights: string[]
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

export interface EntityProfile {
  id: string
  profileType: ProfileType
  profileSubtype?: ProfileSubtype | string
  tradeCategory?: string
  accountCapabilities?: ProfileType[]
  displayName: string
  legalNamePrivate?: string
  businessName?: string
  city: string
  state: string
  slug: string
  legacyClientId?: string
  legacyContractorId?: string
  claimedStatus: ClaimedStatus
  ownerUserId?: string
  verificationLevel?: VerificationLevel
  verificationBadges?: string[]
  duplicateGroupKey?: string
  mergedIntoProfileId?: string
  publicFieldRedactions?: Record<string, unknown>
  redactionNote?: string
  ratingScore: number
  ratingBand: RiskLevel | BusinessRatingGrade | "Review Pending"
  ratingModel?: ProfileRatingModel
  ratingVersion?: string
  ratingConfidence?: BusinessRatingConfidence | string
  ratingFactors?: BusinessRatingFactor[]
  ratingPublicNote?: string
  ratingLastCalculatedAt?: string
  reportCount: number
  positiveReportCount: number
  disputedReportCount: number
  resolvedReportCount: number
  evidenceOnFileCount: number
  responseCount: number
  publicSummary?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface PublicEntityProfile extends EntityProfile {
  reports: ClientReport[]
  projects: PublicProjectJobSummary[]
  relationships: ProfileRelationship[]
  relatedClient?: ClientProfile
  relatedContractor?: PublicBusinessProfile
  safeDescription: string
  responseStatusLabel: string
  evidenceSummaryLabel: string
  profileHref: string
}

export interface EntityProfileSearchResult extends EntityProfile {
  matchedBy: string
  matchScore: number
  profileHref: string
  profileTypeLabel: string
  latestSummary?: string
  latestCategory?: ReportCategory
  evidenceOnFile?: boolean
  responseContext?: string
  nextAction: string
}

export interface ProfileClaim {
  id: string
  profileId: string
  claimantUserId?: string
  claimantEmailHash: string
  claimantName: string
  relationshipToProfile: string
  verificationSummary: string
  status: ProfileClaimStatus
  moderatorNote?: string
  createdAt: string
  updatedAt: string
}

export interface PublicInquiry {
  id: string
  inquiryType: PublicInquiryType
  topic: PublicInquiryTopic
  fullName: string
  businessName?: string
  contactEmail: string
  contactEmailHash: string
  contactEmailMasked: string
  message: string
  sourcePath?: string
  status: PublicInquiryStatus
  adminNote?: string
  createdAt: string
  updatedAt: string
}

export interface SiteErrorReport {
  id: string
  reporterUserId?: string
  reporterRole?: string
  severity: SiteErrorSeverity
  status: SiteErrorStatus
  source: SiteErrorSource
  route: string
  pageTitle?: string
  message: string
  notes?: string
  userAgent?: string
  browserLanguage?: string
  viewportWidth?: number
  viewportHeight?: number
  metadata: Record<string, string | number | boolean | null>
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}

export interface ProjectJob {
  id: string
  ownerUserId?: string
  jobNumber?: string
  title: string
  projectType: string
  jobType?: ProjectJobType
  priority?: ProjectJobPriority
  status: ProjectJobStatus
  shortDescription?: string
  detailedScopeOfWork?: string
  tradeCategory?: string
  city: string
  state: string
  projectAddressPrivate?: string
  addressLine1?: string
  addressLine2?: string
  postalCode?: string
  county?: string
  propertyType?: ProjectPropertyType
  accessInstructions?: string
  privateAccessCode?: string
  parkingInstructions?: string
  siteWarnings?: string
  startDate?: string
  targetCompletionDate?: string
  completionDate?: string
  contractAmount: number
  amountDue: number
  primaryClientProfileId?: string
  primaryContractorProfileId?: string
  publicSummary?: string
  customerFacingNotes?: string
  privateNotes?: string
  isPublicSummaryAllowed: boolean
  createdAt: string
  updatedAt: string
}

export interface PublicProjectJobSummary {
  id: string
  title: string
  projectType: string
  status: ProjectJobStatus
  city: string
  state: string
  contractAmount: number
  amountDue: number
  publicSummary?: string
  reportCount: number
  confidenceLevel: ReportConfidenceLevel
  updatedAt: string
}

export interface ProjectJobProfile {
  id: string
  projectJobId: string
  profileId: string
  profile?: EntityProfile
  role: ProjectProfileRole
  relationshipLabel?: string
  hiredByProfileId?: string
  reportsToParticipantId?: string
  billingRelationship?: JobBillingRelationship
  participantStatus: JobParticipantStatus
  scopeAssigned?: string
  contractAmount?: number
  isPrimary: boolean
  notes?: string
  privateNotes?: string
  createdAt: string
  updatedAt?: string
}

export type ProjectJobParticipant = ProjectJobProfile

export interface ProjectJobDetail extends ProjectJob {
  participants: ProjectJobParticipant[]
}

export interface ProfileRelationship {
  id: string
  sourceProfileId: string
  targetProfileId: string
  projectJobId?: string
  relationshipType: ReportRelationshipType
  status: "active" | "ended" | "disputed" | "merged"
  privateNotes?: string
  createdAt: string
  updatedAt: string
}

export interface ProfileMergeEvent {
  id: string
  sourceProfileId: string
  targetProfileId: string
  mergedBy?: string
  reason: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface ReportReassignmentEvent {
  id: string
  reportId: string
  previousSubjectProfileId?: string
  nextSubjectProfileId?: string
  previousProjectJobId?: string
  nextProjectJobId?: string
  reassignedBy?: string
  reason: string
  createdAt: string
}

export interface ProfileRedactionEvent {
  id: string
  profileId: string
  fieldName: string
  previousPublicValueHash?: string
  redactedBy?: string
  reason: string
  createdAt: string
}

export interface ProfileRatingEvent {
  id: string
  profileId: string
  profileType: ProfileType
  ratingModel: ProfileRatingModel
  ratingVersion: string
  previousScore?: number
  nextScore: number
  previousBand?: string
  nextBand: string
  confidence: BusinessRatingConfidence | string
  factorSnapshot: BusinessRatingFactor[]
  sourceReportId?: string
  recalculatedBy?: string
  reason: string
  createdAt: string
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
  projectJobId?: string
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
  projectJobId?: string
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

export interface ManagedRecoveryCase {
  id: string
  contractorId: string
  projectJobId?: string
  clientName: string
  clientEmailMasked?: string
  city: string
  state: string
  amountDue: number
  invoiceAgeDays: number
  preferredChannel: RecoveryChannel
  status: ManagedRecoveryStatus
  priority: ModerationPriority
  serviceFeeOrderId?: string
  readinessStatus?: ServiceReadinessStatus
  readinessScore?: number
  readinessCheckedAt?: string
  feePaidAt?: string
  submittedForReviewAt?: string
  evidenceVaultItemIds: string[]
  assignedToName?: string
  nextAction: string
  summary: string
  contractorDirectPayment: boolean
  complianceFlags: string[]
  createdAt: string
  updatedAt: string
}

export interface RecoveryCommunication {
  id: string
  managedRecoveryCaseId: string
  contractorId: string
  channel: RecoveryChannel
  direction: "outbound" | "inbound" | "internal"
  subject: string
  note: string
  outcome: PaymentRecoveryAttemptOutcome
  contactedAt: string
  loggedByName: string
  createdAt: string
}

export interface RecoveryResolutionOffer {
  id: string
  managedRecoveryCaseId: string
  contractorId: string
  amountOffered: number
  paymentDueDate?: string
  termsSummary: string
  status: "draft" | "offered" | "accepted" | "rejected" | "expired" | "paid"
  createdAt: string
  updatedAt: string
}

export interface LienNoticeDraft {
  id: string
  contractorId: string
  projectJobId?: string
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

export interface FloridaLienCase {
  id: string
  contractorId: string
  projectJobId?: string
  workflowType: FloridaLienWorkflowType
  clientName: string
  ownerName: string
  propertyCounty: string
  propertyCity: string
  state: "FL"
  parcelNumber?: string
  legalDescription?: string
  contractorRole: "direct_contractor" | "subcontractor" | "supplier" | "laborer" | "other"
  projectType: string
  contractAmount: number
  amountDue: number
  firstWorkDate?: string
  lastWorkDate: string
  noticeHistory: string
  filingDeadline?: string
  targetSendDate?: string
  status: FloridaLienCaseStatus
  deliveryMethod?: LienDeliveryMethod
  filingMethod?: LienFilingMethod
  recordingVendor?: string
  serviceFeeOrderId?: string
  readinessStatus?: ServiceReadinessStatus
  readinessScore?: number
  readinessCheckedAt?: string
  feePaidAt?: string
  submittedForReviewAt?: string
  contractorSignedAt?: string
  contractorSignatureName?: string
  attorneyVendorStatus: "not_started" | "queued" | "in_review" | "approved" | "rejected"
  nextAction: string
  privateSummary: string
  createdAt: string
  updatedAt: string
}

export interface LienNoticeDelivery {
  id: string
  floridaLienCaseId: string
  contractorId: string
  deliveryMethod: LienDeliveryMethod
  recipientName: string
  sentAt?: string
  trackingNumber?: string
  deliveryStatus: "queued" | "sent" | "delivered" | "failed" | "returned"
  proofSummary: string
  createdAt: string
  updatedAt: string
}

export interface LienFilingRecord {
  id: string
  floridaLienCaseId: string
  contractorId: string
  filingMethod: LienFilingMethod
  recordingVendor?: string
  clerkCounty: string
  clerkReference?: string
  officialRecordBook?: string
  officialRecordPage?: string
  instrumentNumber?: string
  filedAt?: string
  recordingConfirmedAt?: string
  filingReceiptPath?: string
  status: "queued" | "submitted" | "filed" | "recording_confirmed" | "rejected"
  createdAt: string
  updatedAt: string
}

export interface LienReleaseRecord {
  id: string
  floridaLienCaseId: string
  contractorId: string
  releaseReason: "paid" | "settled" | "expired" | "withdrawn" | "error_correction"
  releaseStatus: "draft" | "sent_for_signature" | "recorded" | "blocked"
  releaseRecordedAt?: string
  releaseInstrumentNumber?: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface ServiceFeeOrder {
  id: string
  contractorId: string
  kind: ServiceFeeKind
  entityId: string
  status: ServiceFeeStatus
  clientBureauFeeCents: number
  passThroughFeeCents: number
  currency: "usd"
  stripeCheckoutUrl?: string
  stripeSessionId?: string
  paidAt?: string
  createdAt: string
  updatedAt: string
}

export interface ServiceReadinessCheck {
  id: string
  label: string
  complete: boolean
  detail: string
}

export interface ServiceReadinessSummary {
  entityType: "managed_recovery" | "florida_lien"
  entityId: string
  status: ServiceReadinessStatus
  score: number
  readyForCheckout: boolean
  feePaid: boolean
  feeOrderId?: string
  nextAction: string
  checks: ServiceReadinessCheck[]
  publicSafeSummary: string
}

export interface CaseDocumentLink {
  id: string
  contractorId: string
  entityType: "managed_recovery" | "florida_lien"
  entityId: string
  evidenceVaultItemId: string
  documentLabel: string
  documentCategory: EvidenceVaultItem["fileCategory"]
  publicSummary: string
  createdAt: string
}

export interface CaseStaffAssignment {
  id: string
  entityType: "managed_recovery" | "florida_lien"
  entityId: string
  assignedToName: string
  priority: ModerationPriority
  dueAt: string
  status: "open" | "in_review" | "closed"
  createdAt: string
  updatedAt: string
}

export interface CaseAuditEvent {
  id: string
  entityType: "managed_recovery" | "florida_lien" | "service_fee"
  entityId: string
  actorName: string
  action: string
  summary: string
  createdAt: string
}

export interface ContractWorkspaceItem {
  id: string
  contractorId: string
  projectJobId?: string
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

export interface ContractMilestone {
  id: string
  label: string
  amount: number
  due?: string
}

export interface SignedContractSnapshot {
  packetId: string
  clientName: string
  clientLegalName?: string
  contractorLegalName?: string
  projectType: string
  templateType: ContractTemplateType
  packetValue: number
  depositRequired: number
  paymentMode: ContractPaymentMode
  paymentSummary?: string
  scopeSummary: string
  includedWork: string
  excludedWork: string
  paymentTerms: string
  milestoneSchedule: ContractMilestone[]
  changeOrderPolicy: string
  cancellationPolicy: string
  projectStartDate?: string
  projectEndDate?: string
  signerName: string
  signatureNameHash?: string
  signerEmailHash?: string
  signerIpHash?: string
  signerUserAgentHash?: string
  signedAt: string
  attestations: string[]
}

export interface ContractPacket {
  id: string
  contractorId: string
  projectJobId?: string
  clientName: string
  projectType: string
  templateType: ContractTemplateType
  status: ContractPacketStatus
  packetValue: number
  depositRequired: number
  milestoneCount: number
  requiredBeforeScheduling: boolean
  clientLegalName?: string
  contractorLegalName?: string
  scopeSummary: string
  includedWork: string
  excludedWork: string
  paymentTerms: string
  milestoneSchedule: ContractMilestone[]
  changeOrderPolicy: string
  cancellationPolicy: string
  projectStartDate?: string
  projectEndDate?: string
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
  signerName?: string
  signatureNameHash?: string
  signerEmailHash?: string
  signerIpHash?: string
  signerUserAgentHash?: string
  signedSnapshot?: SignedContractSnapshot
  signedDigest?: string
  signedRecordAt?: string
  createdAt: string
  updatedAt: string
}

export interface EvidenceVaultItem {
  id: string
  contractorId: string
  reportId?: string
  projectJobId?: string
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
  managedRecoveryCases: ManagedRecoveryCase[]
  recoveryCommunications: RecoveryCommunication[]
  recoveryResolutionOffers: RecoveryResolutionOffer[]
  floridaLienCases: FloridaLienCase[]
  lienNoticeDeliveries: LienNoticeDelivery[]
  lienFilingRecords: LienFilingRecord[]
  lienReleaseRecords: LienReleaseRecord[]
  serviceFeeOrders: ServiceFeeOrder[]
  serviceReadiness: ServiceReadinessSummary[]
  caseDocumentLinks: CaseDocumentLink[]
  caseStaffAssignments: CaseStaffAssignment[]
  caseAuditEvents: CaseAuditEvent[]
  contractDocuments: ContractWorkspaceItem[]
  contractPackets: ContractPacket[]
  activity: ContractorActivityItem[]
  recommendedActions: string[]
}

export interface ClientReport {
  id: string
  contractorId: string
  clientId: string
  projectJobId?: string
  reporterProfileId?: string
  subjectProfileId?: string
  subjectProfileType?: ProfileType
  relationshipType?: ReportRelationshipType
  legacyClientName?: string
  reportConfidenceLevel?: ReportConfidenceLevel
  redactionNote?: string
  clientType?: string
  clientJobAddressPrivate?: string
  reportedBusinessRole?: string
  counterpartyBusinessRole?: string
  hiringPartyNamePrivate?: string
  scopeDocumentationStatus?: string
  workAuthorizationStatus?: string
  retainageAmount?: number
  paymentApplicationReference?: string
  licenseInsuranceContext?: string
  relationshipVerificationSummary?: string
  tradeCategory?: string
  jobType?: string
  jobStartDate?: string
  jobCompletionDate?: string
  jobStatus?: string
  depositRequested?: number
  depositPaid?: number
  finalInvoiceAmount?: number
  materialsPurchasedAmount?: number
  signedContract?: boolean
  writtenChangeOrder?: boolean
  secondaryCategory?: ReportCategory
  disputeStatus?: string
  amountDisputed?: number
  daysOverdue?: number
  clientResponded?: boolean
  issueResolved?: boolean
  resolutionSummary?: string
  paymentReminderSent?: boolean
  demandLetterSent?: boolean
  lienNoticeStarted?: boolean
  factualSummaryPublic?: string
  detailedTimelinePrivate?: string
  evidenceConfidence?: "Limited" | "Medium" | "Strong"
  responseStatus?: "No response yet" | "Pending response" | "Response published" | "Disputed" | "Resolved"
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
  projectJobId?: string
  fileName: string
  fileType: string
  storagePath: string
  publicSummaryLabel?: string
  uploadedAt: string
}

export interface ClientResponse {
  id: string
  clientId?: string
  entityProfileId?: string
  projectJobId?: string
  reportId?: string
  requestType?: string
  verificationMethod?: string
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
  siteErrors: SiteErrorReport[]
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
  riskLevel?: RiskLevel
  category?: ReportCategory
  profileType?: ProfileType
  tradeCategory?: string
  resultCount?: number
  source?: "local" | "mock" | "supabase"
  createdAt: string
  lastRunAt?: string
}

export type SearchSuggestionKind =
  | "client"
  | "business"
  | "market"
  | "category"
  | "private_identifier"
  | "report_context"
  | "no_result"

export interface SearchSuggestion {
  id: string
  kind: SearchSuggestionKind
  label: string
  description: string
  href: string
  query?: string
  state?: string
  riskLevel?: RiskLevel
  category?: ReportCategory
  score?: number
}

export interface SavedClientSearch {
  id: string
  contractorId?: string
  query: string
  city?: string
  state?: string
  riskLevel?: RiskLevel
  category?: ReportCategory
  profileType?: ProfileType
  tradeCategory?: string
  resultCount: number
  source: "local" | "mock" | "supabase"
  createdAt: string
  lastRunAt?: string
}

export type SearchAnalyticsEventType =
  | "search_submitted"
  | "suggestion_clicked"
  | "result_viewed"
  | "save_search"
  | "private_identifier_check"
  | "no_result"

export interface SearchAnalyticsEvent {
  id: string
  contractorId?: string
  query?: string
  state?: string
  riskLevel?: RiskLevel
  category?: ReportCategory
  profileType?: ProfileType
  tradeCategory?: string
  resultCount?: number
  eventType: SearchAnalyticsEventType
  source: "search_page" | "profile_page" | "directory" | "dashboard"
  createdAt: string
}

export type ProfileShareChannel = "copy_link" | "profile_card" | "referral_badge" | "social"

export interface ProfileShareEvent {
  id: string
  contractorId?: string
  profileSlug: string
  channel: ProfileShareChannel
  source: "profile_page" | "directory" | "dashboard"
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
  profileType?: ProfileType
  tradeCategory?: string
  limit?: number
}

export interface ClientSearchResult extends ClientProfile {
  matchedBy: string
  matchScore: number
  latestCategory?: ReportCategory
  latestSummary?: string
  positiveSignalCount?: number
  openDisputeCount?: number
  resolvedReportCount?: number
  evidenceOnFile?: boolean
  paymentContextLabel?: string
}

export type ActionResult<T> =
  | { ok: true; data: T; message: string }
  | {
      ok: false
      fieldErrors?: Record<string, string[]>
      message: string
    }
