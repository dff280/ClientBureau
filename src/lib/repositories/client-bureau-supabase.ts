import { createHash } from "node:crypto"

import type { Database } from "@/lib/database.types"
import {
  agreementDefaults,
  buildSignedContractSnapshot,
  normalizeMilestoneSchedule,
  normalizeSignedSnapshot,
  type ContractSignatureAuditInput,
} from "@/lib/contract-packets"
import {
  calculateClientBureauScore,
  disputeHistoryLabel,
  getReportedBalanceSummary,
  getScoreCategoryBreakdown,
  getScoreFactors,
  paymentReliabilityLabel,
} from "@/lib/scoring"
import {
  buildBusinessSlug,
  calculateBusinessRating,
} from "@/lib/business-rating"
import {
  intakeAssessmentScore,
  intakeRiskRecommendation,
  paymentRecoveryPriority,
} from "@/lib/platform-features"
import {
  buildFloridaLienReadinessSummary,
  buildRecoveryReadinessSummary,
  buildServiceReadinessSummaries,
} from "@/lib/service-readiness"
import { buildClientSlug, ensureUniqueSlug } from "@/lib/slug"
import { createServiceClient } from "@/lib/supabase/service"
import type {
  AdminSavedViewInput,
  ClientPipelineItemInput,
  ClientReportInput,
  ClientResponseInput,
  ClientRiskRoomInput,
  ContractPacketInput,
  ContractShareLinkInput,
  ContractSignatureInput,
  ContractWorkspaceItemInput,
  FloridaLienCaseInput,
  IntakeAssessmentInput,
  LienFilingAuthorizationInput,
  LienNoticeDraftInput,
  LinkEvidenceToServiceCaseInput,
  MarkServiceFeePaidInput,
  AdminLienCaseActionInput,
  AdminRecordLienFiledInput,
  AdminRecordLienReleaseInput,
  AdminUploadRecordingProofInput,
  ManagedRecoveryCaseInput,
  MarkRecoveryResolvedInput,
  PaymentPlanInput,
  PaymentRecoveryAttemptInput,
  PaymentRecoveryCaseInput,
  RecoveryComplianceReviewInput,
  ResolutionDeskContactInput,
  ReportDraftInput,
  ServiceFeeCheckoutInput,
  ServicePrecheckInput,
  UpdateClientPipelineStageInput,
  UpdateContractPacketStatusInput,
  UpdateEvidenceVaultStatusInput,
  WatchlistItemInput,
} from "@/lib/schemas/client-bureau"
import { isPositiveReportCategory } from "@/lib/types"
import type {
  AdminModerationCrmData,
  AdminReview,
  AdminSavedView,
  BulkImportBatch,
  CaseAuditEvent,
  CaseDocumentLink,
  CaseStaffAssignment,
  AdminWorkspaceData,
  ClientIntakeAssessment,
  ClientPipelineItem,
  AuditLogEntry,
  AdminQueueAssignment,
  ClientProfile,
  ClientReport,
  ClientResponse,
  ClientSearchResult,
  ClientRiskRoom,
  CommunityDiscussion,
  ContractPacket,
  ContractWorkspaceItem,
  ContractorRiskOpsData,
  ContractorWatchlistItem,
  EvidenceReviewSummary,
  EvidenceVaultItem,
  FloridaLienCase,
  LienFilingRecord,
  LienNoticeDraft,
  LienNoticeDelivery,
  LienReleaseRecord,
  ManagedRecoveryCase,
  ModerationCase,
  ModerationCaseStatus,
  ModerationDecisionReason,
  ModerationPriority,
  PaymentPlan,
  PaymentRecoveryAttempt,
  PaymentRecoveryCase,
  RecoveryComplianceReview,
  RecoveryCommunication,
  RecoveryResolutionOffer,
  ContractorProfile,
  PublicClientProfile,
  PublicBusinessProfile,
  ReportEvidence,
  ReportDraft,
  ReportTimelineEvent,
  ReviewChecklistItem,
  ReviewChecklistStatus,
  SavedSearch,
  SearchFilters,
  Subscription,
  ServiceFeeOrder,
  User,
  WatchlistAlert,
  WatchlistStatus,
  ServiceReadinessSummary,
} from "@/lib/types"

type Tables = Database["public"]["Tables"]
type UserRow = Tables["users"]["Row"]
type ContractorProfileRow = Tables["contractor_profiles"]["Row"]
type ClientProfileRow = Tables["client_profiles"]["Row"]
type ClientReportRow = Tables["client_reports"]["Row"]
type ReportEvidenceRow = Tables["report_evidence"]["Row"]
type ClientResponseRow = Tables["client_responses"]["Row"]
type SubscriptionRow = Tables["subscriptions"]["Row"]
type AdminReviewRow = Tables["admin_reviews"]["Row"]
type CommunityDiscussionRow = Tables["community_discussions"]["Row"]
type AuditLogRow = Tables["audit_logs"]["Row"]
type ContractorWatchlistRow = Tables["contractor_watchlist_items"]["Row"]
type WatchlistAlertRow = Tables["watchlist_alerts"]["Row"]
type ReportDraftRow = Tables["report_drafts"]["Row"]
type ClientIntakeAssessmentRow = Tables["client_intake_assessments"]["Row"]
type EvidenceReviewSummaryRow = Tables["evidence_review_summaries"]["Row"]
type ModerationCaseRow = Tables["moderation_cases"]["Row"]
type BulkImportBatchRow = Tables["bulk_import_batches"]["Row"]
type PaymentRecoveryCaseRow = Tables["payment_recovery_cases"]["Row"]
type LienNoticeDraftRow = Tables["lien_notice_drafts"]["Row"]
type ContractWorkspaceItemRow = Tables["contract_workspace_items"]["Row"]
type ClientPipelineItemRow = Tables["client_pipeline_items"]["Row"]
type ClientRiskRoomRow = Tables["client_risk_rooms"]["Row"]
type PaymentRecoveryAttemptRow = Tables["payment_recovery_attempts"]["Row"]
type PaymentPlanRow = Tables["payment_plans"]["Row"]
type ContractPacketRow = Tables["contract_packets"]["Row"]
type EvidenceVaultItemRow = Tables["evidence_vault_items"]["Row"]
type AdminSavedViewRow = Tables["admin_saved_views"]["Row"]
type AdminQueueAssignmentRow = Tables["admin_queue_assignments"]["Row"]
type RecoveryComplianceReviewRow = Tables["recovery_compliance_reviews"]["Row"]
type ServiceFeeOrderRow = Tables["service_fee_orders"]["Row"]
type ManagedRecoveryCaseRow = Tables["managed_recovery_cases"]["Row"]
type RecoveryCommunicationRow = Tables["recovery_communications"]["Row"]
type RecoveryResolutionOfferRow = Tables["recovery_resolution_offers"]["Row"]
type FloridaLienCaseRow = Tables["florida_lien_cases"]["Row"]
type LienNoticeDeliveryRow = Tables["lien_notice_deliveries"]["Row"]
type LienFilingRecordRow = Tables["lien_filing_records"]["Row"]
type LienReleaseRecordRow = Tables["lien_release_records"]["Row"]
type CaseStaffAssignmentRow = Tables["case_staff_assignments"]["Row"]
type CaseAuditEventRow = Tables["case_audit_events"]["Row"]
type CaseDocumentLinkRow = Tables["case_document_links"]["Row"]

const emptyHash = "sha256:empty-private"

function isMissingRelationError(error: { message?: string; code?: string } | null | undefined) {
  return error?.code === "42P01" || error?.message?.toLowerCase().includes("does not exist")
}

function isMissingContractPacketColumnError(error: { message?: string; code?: string } | null | undefined) {
  const message = error?.message?.toLowerCase() ?? ""

  return (
    error?.code === "42703" ||
    message.includes("scope_summary") ||
    message.includes("milestone_schedule") ||
    message.includes("signed_snapshot")
  )
}

function mapUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    createdAt: row.created_at,
  }
}

function mapContractorProfile(row: ContractorProfileRow): ContractorProfile {
  return {
    id: row.id,
    userId: row.user_id,
    businessName: row.business_name,
    trade: row.trade,
    city: row.city,
    state: row.state,
    licenseNumber: row.license_number ?? undefined,
    verificationStatus: row.verification_status,
    verificationBadges:
      row.verification_status === "verified"
        ? ["Verified business", "Verified email"]
        : row.verification_status === "pending"
          ? ["Verified email"]
          : [],
    createdAt: row.created_at,
  }
}

function mapClientProfile(row: ClientProfileRow): ClientProfile {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    businessName: row.business_name ?? undefined,
    city: row.city,
    state: row.state,
    zip: row.zip ?? undefined,
    phoneHash: row.phone_hash,
    emailHash: row.email_hash,
    publicSlug: row.public_slug,
    clientBureauScore: row.client_bureau_score,
    riskLevel: row.risk_level,
    reportCount: row.report_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isPublic: row.is_public,
  }
}

function mapClientReport(row: ClientReportRow): ClientReport {
  return {
    id: row.id,
    contractorId: row.contractor_id,
    clientId: row.client_id,
    projectType: row.project_type,
    projectCity: row.project_city,
    projectState: row.project_state,
    contractAmount: row.contract_amount,
    amountUnpaid: row.amount_unpaid,
    reportCategory: row.report_category,
    paymentStatus: row.payment_status,
    reportSummary: row.report_summary,
    detailedExperience: row.detailed_experience,
    publicSummary: row.public_summary,
    evidenceAttached: row.evidence_attached,
    status: row.status,
    resolutionStatus: row.resolution_status ?? inferResolutionStatus(row.payment_status, row.status, row.amount_unpaid),
    moderationNote: row.moderation_note ?? undefined,
    createdAt: row.created_at,
    approvedAt: row.approved_at ?? undefined,
  }
}

function inferResolutionStatus(paymentStatus: string, reportStatus: ClientReport["status"], amountUnpaid: number) {
  const normalized = paymentStatus.toLowerCase()

  if (reportStatus === "disputed") return "Disputed" as const
  if (normalized.includes("settled")) return "Settled" as const
  if (normalized.includes("resolved")) return "Resolved" as const
  if (normalized.includes("paid in full") || (normalized.includes("paid") && amountUnpaid === 0)) {
    return "Paid in full" as const
  }
  if (normalized.includes("partially paid") || normalized.includes("partial")) return "Partially paid" as const

  return amountUnpaid > 0 ? "Unresolved" as const : "Admin verified" as const
}

function mapEvidence(row: ReportEvidenceRow): ReportEvidence {
  return {
    id: row.id,
    reportId: row.report_id,
    fileName: row.file_name,
    fileType: row.file_type,
    storagePath: row.storage_path,
    uploadedAt: row.uploaded_at,
  }
}

function mapPublicEvidence(row: ReportEvidenceRow): ReportEvidence {
  const value = `${row.file_type} ${row.file_name}`.toLowerCase()
  let fileName = "Evidence on file"

  if (value.includes("invoice")) fileName = "Invoice evidence on file"
  else if (value.includes("contract") || value.includes("pdf")) fileName = "Document evidence on file"
  else if (value.includes("screenshot")) fileName = "Screenshot evidence on file"
  else if (value.includes("png") || value.includes("jpg") || value.includes("image") || value.includes("photo")) {
    fileName = "Photo evidence on file"
  }

  return {
    id: row.id,
    reportId: row.report_id,
    fileName,
    fileType: row.file_type,
    storagePath: "private",
    uploadedAt: row.uploaded_at,
  }
}

function mapResponse(row: ClientResponseRow): ClientResponse {
  return {
    id: row.id,
    clientId: row.client_id,
    reportId: row.report_id ?? undefined,
    responseSummary: row.response_summary,
    status: row.status,
    createdAt: row.created_at,
    publishedAt: row.published_at ?? undefined,
  }
}

function mapCommunityDiscussion(row: CommunityDiscussionRow): CommunityDiscussion {
  return {
    id: row.id,
    clientId: row.client_id,
    reportId: row.report_id ?? undefined,
    authorName: row.author_name,
    authorEmailHash: row.author_email_hash,
    relationshipCategory: row.relationship_category,
    commentBody: row.comment_body,
    attachmentUrl: row.attachment_url ?? undefined,
    status: row.status,
    isVerified: row.is_verified,
    moderatorNote: row.moderator_note ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at ?? undefined,
  }
}

function mapAuditLog(row: AuditLogRow): AuditLogEntry {
  const metadata =
    row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
      ? (row.metadata as Record<string, string | number | boolean | null>)
      : undefined

  return {
    id: row.id,
    actorId: row.actor_id ?? undefined,
    actorName: row.actor_name ?? undefined,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    summary: row.summary,
    metadata,
    createdAt: row.created_at,
  }
}

function mapWatchlistItem(row: ContractorWatchlistRow): ContractorWatchlistItem {
  return {
    id: row.id,
    contractorId: row.contractor_id,
    clientId: row.client_id,
    status: row.status,
    watchReason: row.watch_reason,
    alertLevel: row.alert_level,
    lastSignal: row.last_signal,
    privateMatch: row.private_match,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapWatchlistAlert(row: WatchlistAlertRow): WatchlistAlert {
  return {
    id: row.id,
    contractorId: row.contractor_id,
    clientId: row.client_id ?? undefined,
    profileSlug: row.profile_slug ?? undefined,
    eventType: row.event_type,
    title: row.title,
    description: row.description,
    severity: row.severity,
    createdAt: row.created_at,
    readAt: row.read_at ?? undefined,
  }
}

function mapReportDraft(row: ReportDraftRow): ReportDraft {
  return {
    id: row.id,
    contractorId: row.contractor_id,
    clientId: row.client_id ?? undefined,
    clientName: row.client_name,
    projectType: row.project_type,
    estimatedValue: row.estimated_value,
    amountAtRisk: row.amount_at_risk,
    summary: row.summary,
    nextStep: row.next_step,
    status: row.status,
    updatedAt: row.updated_at,
  }
}

function mapIntakeAssessment(row: ClientIntakeAssessmentRow): ClientIntakeAssessment {
  return {
    id: row.id,
    contractorId: row.contractor_id,
    clientName: row.client_name,
    city: row.city,
    state: row.state,
    projectValue: row.project_value,
    depositReceived: row.deposit_received,
    contractSigned: row.contract_signed,
    privateMatchConfirmed: row.private_match_confirmed,
    recommendation: row.recommendation as ClientIntakeAssessment["recommendation"],
    score: row.score,
    notes: row.notes ?? "",
    createdAt: row.created_at,
  }
}

function mapEvidenceReviewSummary(row: EvidenceReviewSummaryRow): EvidenceReviewSummary {
  return {
    id: row.id,
    reportId: row.report_id,
    contractorId: row.contractor_id,
    status: row.status,
    label: row.label,
    fileCount: row.file_count,
    reviewedCount: row.reviewed_count,
    lastUpdatedAt: row.last_updated_at,
  }
}

function mapModerationCase(row: ModerationCaseRow, assignedToName?: string): ModerationCase {
  return {
    id: row.id,
    reportId: row.report_id ?? undefined,
    discussionId: row.discussion_id ?? undefined,
    clientId: row.client_id ?? undefined,
    title: row.title,
    summary: row.summary,
    priority: row.priority,
    status: row.status,
    queueStage: row.queue_stage as ModerationCase["queueStage"],
    assignedTo: row.assigned_to ?? undefined,
    assignedToName,
    dueAt: row.due_at,
    decisionReason: row.decision_reason ?? undefined,
    escalationNote: row.escalation_note ?? undefined,
    publicSummaryPreview: row.public_summary_preview ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapBulkImportBatch(row: BulkImportBatchRow): BulkImportBatch {
  return {
    id: row.id,
    fileName: row.file_name,
    createdBy: row.created_by ?? "system",
    totalRows: row.total_rows,
    readyRows: row.ready_rows,
    duplicateRows: row.duplicate_rows,
    importedRows: row.imported_rows,
    status: row.status as BulkImportBatch["status"],
    createdAt: row.created_at,
  }
}

function mapPaymentRecoveryCase(row: PaymentRecoveryCaseRow): PaymentRecoveryCase {
  return {
    id: row.id,
    contractorId: row.contractor_id,
    clientName: row.client_name,
    city: row.city,
    state: row.state,
    amountDue: row.amount_due,
    invoiceAgeDays: row.invoice_age_days,
    preferredChannel: row.preferred_channel,
    status: row.status,
    priority: row.priority,
    lastContactAt: row.last_contact_at ?? undefined,
    nextAction: row.next_action,
    summary: row.summary,
    complianceFlags: row.compliance_flags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapLienNoticeDraft(row: LienNoticeDraftRow): LienNoticeDraft {
  return {
    id: row.id,
    contractorId: row.contractor_id,
    clientName: row.client_name,
    projectType: row.project_type,
    propertyCity: row.property_city,
    state: row.state,
    amountDue: row.amount_due,
    lastWorkDate: row.last_work_date,
    targetSendDate: row.target_send_date ?? undefined,
    status: row.status,
    requiredReview: row.required_review,
    nextStep: row.next_step,
    jurisdictionNote: row.jurisdiction_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapServiceFeeOrder(row: ServiceFeeOrderRow): ServiceFeeOrder {
  return {
    id: row.id,
    contractorId: row.contractor_id,
    kind: row.kind,
    entityId: row.entity_id,
    status: row.status,
    clientBureauFeeCents: row.client_bureau_fee_cents,
    passThroughFeeCents: row.pass_through_fee_cents,
    currency: row.currency,
    stripeCheckoutUrl: row.stripe_checkout_url ?? undefined,
    stripeSessionId: row.stripe_session_id ?? undefined,
    paidAt: row.paid_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapManagedRecoveryCase(row: ManagedRecoveryCaseRow): ManagedRecoveryCase {
  return {
    id: row.id,
    contractorId: row.contractor_id,
    clientName: row.client_name,
    clientEmailMasked: row.client_email_masked ?? undefined,
    city: row.city,
    state: row.state,
    amountDue: row.amount_due,
    invoiceAgeDays: row.invoice_age_days,
    preferredChannel: row.preferred_channel,
    status: row.status,
    priority: row.priority,
    serviceFeeOrderId: row.service_fee_order_id ?? undefined,
    readinessStatus: row.readiness_status ?? undefined,
    readinessScore: row.readiness_score ?? undefined,
    readinessCheckedAt: row.readiness_checked_at ?? undefined,
    feePaidAt: row.fee_paid_at ?? undefined,
    submittedForReviewAt: row.submitted_for_review_at ?? undefined,
    evidenceVaultItemIds: row.evidence_vault_item_ids,
    assignedToName: row.assigned_to_name ?? undefined,
    nextAction: row.next_action,
    summary: row.summary,
    contractorDirectPayment: row.contractor_direct_payment,
    complianceFlags: row.compliance_flags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapRecoveryCommunication(row: RecoveryCommunicationRow): RecoveryCommunication {
  return {
    id: row.id,
    managedRecoveryCaseId: row.managed_recovery_case_id,
    contractorId: row.contractor_id,
    channel: row.channel,
    direction: row.direction,
    subject: row.subject,
    note: row.note,
    outcome: row.outcome,
    contactedAt: row.contacted_at,
    loggedByName: row.logged_by_name,
    createdAt: row.created_at,
  }
}

function mapRecoveryResolutionOffer(row: RecoveryResolutionOfferRow): RecoveryResolutionOffer {
  return {
    id: row.id,
    managedRecoveryCaseId: row.managed_recovery_case_id,
    contractorId: row.contractor_id,
    amountOffered: row.amount_offered,
    paymentDueDate: row.payment_due_date ?? undefined,
    termsSummary: row.terms_summary,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapFloridaLienCase(row: FloridaLienCaseRow): FloridaLienCase {
  return {
    id: row.id,
    contractorId: row.contractor_id,
    workflowType: row.workflow_type,
    clientName: row.client_name,
    ownerName: row.owner_name,
    propertyCounty: row.property_county,
    propertyCity: row.property_city,
    state: row.state,
    parcelNumber: row.parcel_number ?? undefined,
    legalDescription: row.legal_description ?? undefined,
    contractorRole: row.contractor_role,
    projectType: row.project_type,
    contractAmount: row.contract_amount,
    amountDue: row.amount_due,
    firstWorkDate: row.first_work_date ?? undefined,
    lastWorkDate: row.last_work_date,
    noticeHistory: row.notice_history,
    filingDeadline: row.filing_deadline ?? undefined,
    targetSendDate: row.target_send_date ?? undefined,
    status: row.status,
    deliveryMethod: row.delivery_method ?? undefined,
    filingMethod: row.filing_method ?? undefined,
    recordingVendor: row.recording_vendor ?? undefined,
    serviceFeeOrderId: row.service_fee_order_id ?? undefined,
    readinessStatus: row.readiness_status ?? undefined,
    readinessScore: row.readiness_score ?? undefined,
    readinessCheckedAt: row.readiness_checked_at ?? undefined,
    feePaidAt: row.fee_paid_at ?? undefined,
    submittedForReviewAt: row.submitted_for_review_at ?? undefined,
    contractorSignedAt: row.contractor_signed_at ?? undefined,
    contractorSignatureName: row.contractor_signature_name ?? undefined,
    attorneyVendorStatus: row.attorney_vendor_status,
    nextAction: row.next_action,
    privateSummary: row.private_summary,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapLienNoticeDelivery(row: LienNoticeDeliveryRow): LienNoticeDelivery {
  return {
    id: row.id,
    floridaLienCaseId: row.florida_lien_case_id,
    contractorId: row.contractor_id,
    deliveryMethod: row.delivery_method,
    recipientName: row.recipient_name,
    sentAt: row.sent_at ?? undefined,
    trackingNumber: row.tracking_number ?? undefined,
    deliveryStatus: row.delivery_status,
    proofSummary: row.proof_summary,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapLienFilingRecord(row: LienFilingRecordRow): LienFilingRecord {
  return {
    id: row.id,
    floridaLienCaseId: row.florida_lien_case_id,
    contractorId: row.contractor_id,
    filingMethod: row.filing_method,
    recordingVendor: row.recording_vendor ?? undefined,
    clerkCounty: row.clerk_county,
    clerkReference: row.clerk_reference ?? undefined,
    officialRecordBook: row.official_record_book ?? undefined,
    officialRecordPage: row.official_record_page ?? undefined,
    instrumentNumber: row.instrument_number ?? undefined,
    filedAt: row.filed_at ?? undefined,
    recordingConfirmedAt: row.recording_confirmed_at ?? undefined,
    filingReceiptPath: row.filing_receipt_path ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapLienReleaseRecord(row: LienReleaseRecordRow): LienReleaseRecord {
  return {
    id: row.id,
    floridaLienCaseId: row.florida_lien_case_id,
    contractorId: row.contractor_id,
    releaseReason: row.release_reason,
    releaseStatus: row.release_status,
    releaseRecordedAt: row.release_recorded_at ?? undefined,
    releaseInstrumentNumber: row.release_instrument_number ?? undefined,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapCaseStaffAssignment(row: CaseStaffAssignmentRow): CaseStaffAssignment {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    assignedToName: row.assigned_to_name,
    priority: row.priority,
    dueAt: row.due_at,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapCaseAuditEvent(row: CaseAuditEventRow): CaseAuditEvent {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    actorName: row.actor_name,
    action: row.action,
    summary: row.summary,
    createdAt: row.created_at,
  }
}

function mapCaseDocumentLink(row: CaseDocumentLinkRow): CaseDocumentLink {
  return {
    id: row.id,
    contractorId: row.contractor_id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    evidenceVaultItemId: row.evidence_vault_item_id,
    documentLabel: row.document_label,
    documentCategory: row.document_category,
    publicSummary: row.public_summary,
    createdAt: row.created_at,
  }
}

function mapContractWorkspaceItem(row: ContractWorkspaceItemRow): ContractWorkspaceItem {
  return {
    id: row.id,
    contractorId: row.contractor_id,
    clientName: row.client_name,
    projectType: row.project_type,
    templateType: row.template_type,
    contractValue: row.contract_value,
    depositRequired: row.deposit_required,
    milestoneBilling: row.milestone_billing,
    status: row.status,
    nextStep: row.next_step,
    summary: row.summary,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapClientPipelineItem(row: ClientPipelineItemRow): ClientPipelineItem {
  return {
    id: row.id,
    contractorId: row.contractor_id,
    clientId: row.client_profile_id ?? undefined,
    clientName: row.client_name,
    city: row.city,
    state: row.state,
    stage: row.stage,
    priority: row.priority,
    estimatedValue: row.estimated_value,
    nextAction: row.next_action,
    dueAt: row.due_at ?? undefined,
    privateMatch: row.private_match,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapClientRiskRoom(row: ClientRiskRoomRow): ClientRiskRoom {
  return {
    id: row.id,
    contractorId: row.contractor_id,
    clientId: row.client_profile_id ?? undefined,
    clientName: row.client_name,
    city: row.city,
    state: row.state,
    headline: row.headline,
    summary: row.summary,
    linkedSearchIds: row.linked_search_ids,
    linkedWatchlistIds: row.linked_watchlist_ids,
    linkedAssessmentIds: row.linked_assessment_ids,
    linkedContractIds: row.linked_contract_ids,
    linkedReportDraftIds: row.linked_report_draft_ids,
    linkedEvidenceIds: row.linked_evidence_ids,
    linkedRecoveryIds: row.linked_recovery_ids,
    linkedResolutionIds: row.linked_resolution_ids,
    lastActivityAt: row.last_activity_at,
    createdAt: row.created_at,
  }
}

function mapPaymentRecoveryAttempt(row: PaymentRecoveryAttemptRow): PaymentRecoveryAttempt {
  return {
    id: row.id,
    recoveryCaseId: row.recovery_case_id,
    contractorId: row.contractor_id,
    channel: row.channel,
    attemptedAt: row.attempted_at,
    outcome: row.outcome,
    note: row.note,
    nextFollowUpAt: row.next_follow_up_at ?? undefined,
    createdAt: row.created_at,
  }
}

function mapPaymentPlan(row: PaymentPlanRow): PaymentPlan {
  return {
    id: row.id,
    recoveryCaseId: row.recovery_case_id,
    contractorId: row.contractor_id,
    totalAmount: row.total_amount,
    installmentAmount: row.installment_amount,
    dueDay: row.due_day,
    status: row.status,
    nextDueDate: row.next_due_date ?? undefined,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapContractPacket(row: ContractPacketRow): ContractPacket {
  return {
    id: row.id,
    contractorId: row.contractor_id,
    clientName: row.client_name,
    clientLegalName: row.client_legal_name ?? undefined,
    contractorLegalName: row.contractor_legal_name ?? undefined,
    projectType: row.project_type,
    templateType: row.template_type,
    status: row.status,
    packetValue: row.packet_value,
    depositRequired: row.deposit_required,
    milestoneCount: row.milestone_count,
    requiredBeforeScheduling: row.required_before_scheduling,
    scopeSummary: row.scope_summary,
    includedWork: row.included_work,
    excludedWork: row.excluded_work,
    paymentTerms: row.payment_terms,
    milestoneSchedule: normalizeMilestoneSchedule(row.milestone_schedule),
    changeOrderPolicy: row.change_order_policy,
    cancellationPolicy: row.cancellation_policy,
    projectStartDate: row.project_start_date ?? undefined,
    projectEndDate: row.project_end_date ?? undefined,
    nextAction: row.next_action,
    shareToken: row.share_token ?? undefined,
    shareUrl: row.share_url ?? undefined,
    clientEmailMasked: row.client_email_masked ?? undefined,
    clientInviteStatus: row.client_invite_status,
    signatureStatus: row.signature_status,
    shareStatus: row.share_status,
    paymentMode: row.payment_mode,
    paymentSummary: row.payment_summary ?? undefined,
    clientSignedAt: row.client_signed_at ?? undefined,
    contractorSignedAt: row.contractor_signed_at ?? undefined,
    signerName: row.signer_name ?? undefined,
    signatureNameHash: row.signature_name_hash ?? undefined,
    signerEmailHash: row.signer_email_hash ?? undefined,
    signerIpHash: row.signer_ip_hash ?? undefined,
    signerUserAgentHash: row.signer_user_agent_hash ?? undefined,
    signedSnapshot: normalizeSignedSnapshot(row.signed_snapshot),
    signedDigest: row.signed_digest ?? undefined,
    signedRecordAt: row.signed_recorded_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapEvidenceVaultItem(row: EvidenceVaultItemRow): EvidenceVaultItem {
  return {
    id: row.id,
    contractorId: row.contractor_id,
    reportId: row.report_id ?? undefined,
    clientName: row.client_name,
    label: row.label,
    fileCategory: row.file_category as EvidenceVaultItem["fileCategory"],
    status: row.status,
    privateStoragePath: row.private_storage_path,
    publicSummary: row.public_summary,
    uploadedAt: row.uploaded_at,
    updatedAt: row.updated_at,
  }
}

function mapAdminSavedView(row: AdminSavedViewRow): AdminSavedView {
  const filters =
    row.filters && typeof row.filters === "object" && !Array.isArray(row.filters)
      ? Object.fromEntries(
          Object.entries(row.filters).map(([key, value]) => [key, String(value ?? "")]),
        )
      : {}

  return {
    id: row.id,
    scope: row.scope,
    name: row.name,
    filters,
    isDefault: row.is_default,
    createdBy: row.created_by ?? "system",
    createdAt: row.created_at,
  }
}

function mapAdminQueueAssignment(row: AdminQueueAssignmentRow): AdminQueueAssignment {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    assignedTo: row.assigned_to ?? "",
    assignedToName: row.assigned_to_name,
    priority: row.priority,
    dueAt: row.due_at,
    status: row.status,
  }
}

function mapRecoveryComplianceReview(row: RecoveryComplianceReviewRow): RecoveryComplianceReview {
  return {
    id: row.id,
    recoveryCaseId: row.recovery_case_id ?? undefined,
    lienNoticeDraftId: row.lien_notice_draft_id ?? undefined,
    contractPacketId: row.contract_packet_id ?? undefined,
    reviewerId: row.reviewer_id ?? undefined,
    status: row.status,
    decisionReason: row.decision_reason,
    requiredChanges: row.required_changes,
    publicVisibilityAllowed: row.public_visibility_allowed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapSubscriptionStatus(status: string): Subscription["status"] {
  if (["trialing", "active", "past_due", "canceled", "mock"].includes(status)) {
    return status as Subscription["status"]
  }

  if (["unpaid", "incomplete", "incomplete_expired"].includes(status)) return "past_due"

  return "active"
}

function mapSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    contractorId: row.contractor_id,
    tier: row.tier,
    status: mapSubscriptionStatus(row.status),
    stripeCustomerId: row.stripe_customer_id ?? undefined,
    stripeSubscriptionId: row.stripe_subscription_id ?? undefined,
    stripePriceId: row.stripe_price_id ?? undefined,
    currentPeriodEnd: row.current_period_end ?? undefined,
  }
}

function mapAdminReview(row: AdminReviewRow): AdminReview {
  return {
    id: row.id,
    reportId: row.report_id,
    reviewerId: row.reviewer_id ?? undefined,
    status: row.status,
    editedPublicSummary: row.edited_public_summary ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function hashIdentifier(value?: string, type: "email" | "phone" = "email") {
  const normalized =
    type === "phone"
      ? (value ?? "").replace(/\D/g, "")
      : (value ?? "").trim().toLowerCase()

  if (!normalized) return emptyHash

  return `sha256:${createHash("sha256").update(normalized).digest("hex")}`
}

function contractShareToken(item: Pick<ContractPacket, "id" | "clientName" | "projectType">) {
  const slug = [item.clientName, item.projectType, item.id]
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72)

  return slug || item.id
}

function contractSharePath(token: string) {
  return `/contract/${token}`
}

function maskEmail(email: string) {
  const [name = "", domain = ""] = email.toLowerCase().split("@")
  const visible = name.length <= 2 ? name[0] ?? "*" : `${name.slice(0, 2)}***`
  const domainParts = domain.split(".")
  const domainName = domainParts[0] ?? ""
  const suffix = domainParts.slice(1).join(".")

  return `${visible}@${domainName.slice(0, 1)}***${suffix ? `.${suffix}` : ""}`
}

function nextRecoveryAction(channel: PaymentRecoveryCaseInput["preferredChannel"]) {
  if (channel === "phone") {
    return "Prepare a documented call plan, call during normal business hours, and log the response."
  }

  if (channel === "letter") {
    return "Prepare a factual payment reminder letter with invoice, project, and response-window details."
  }

  if (channel === "client_portal") {
    return "Send a portal message with invoice context and a clear documented response path."
  }

  return "Send a factual payment reminder with invoice context, evidence-on-file reference, and response window."
}

function parseDelimitedIds(value?: string) {
  return (value ?? "")
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function serviceFeeForKind(kind: ServiceFeeCheckoutInput["kind"]) {
  if (kind === "florida_lien_filing") {
    return { clientBureauFeeCents: 29900, passThroughFeeCents: 6800 }
  }

  if (kind === "florida_lien_notice") {
    return { clientBureauFeeCents: 19900, passThroughFeeCents: 2200 }
  }

  return { clientBureauFeeCents: 14900, passThroughFeeCents: 0 }
}

function contractWorkspaceNextStep(input: Pick<ContractWorkspaceItemInput, "milestoneBilling">) {
  return input.milestoneBilling
    ? "Review scope, deposit, milestone billing, and change-order language before sending."
    : "Review scope, payment timing, completion, and change-order language before sending."
}

function contractPaymentSummary(packet: ContractPacket, input: ContractShareLinkInput) {
  const paymentMode = input.paymentMode ?? "none"

  if (input.paymentSummary) return input.paymentSummary
  if (paymentMode === "deposit_request") {
    return `Deposit request tracked for $${packet.depositRequired.toLocaleString()} before scheduling.`
  }
  if (paymentMode === "milestone_schedule") {
    return `${packet.milestoneCount || 1} milestone payment schedule attached to the agreement workflow.`
  }
  if (paymentMode === "platform_review") {
    return "Payment coordination is marked for platform review before any payment workflow is activated."
  }

  return "No payment request is active on this contract link."
}

async function logAdminAction(input: Omit<AuditLogEntry, "id" | "createdAt">) {
  const supabase = createServiceClient()
  const { error } = await supabase.from("audit_logs").insert({
    actor_id: input.actorId ?? null,
    actor_name: input.actorName ?? null,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId,
    summary: input.summary,
    metadata: input.metadata ?? {},
  })

  if (error) throw new Error(error.message)
}

async function logCaseAudit(input: {
  entityType: "managed_recovery" | "florida_lien" | "service_fee"
  entityId: string
  actorId?: string
  actorName: string
  action: string
  summary: string
}) {
  const supabase = createServiceClient()
  const { error } = await supabase.from("case_audit_events").insert({
    entity_type: input.entityType,
    entity_id: input.entityId,
    actor_id: input.actorId ?? null,
    actor_name: input.actorName,
    action: input.action,
    summary: input.summary,
  })

  platformTableError("case_audit_events", error)
}

async function getOrCreateContractorProfileForUser(userId: string) {
  const supabase = createServiceClient()
  const { data: existing, error: existingError } = await supabase
    .from("contractor_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()

  if (existingError) throw new Error(existingError.message)
  if (existing) return existing

  const { data: userRow, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single()

  if (userError) throw new Error(userError.message)

  const { data, error } = await supabase
    .from("contractor_profiles")
    .insert({
      user_id: userId,
      business_name: userRow.role === "admin" ? "Client Bureau Admin Intake" : userRow.full_name,
      trade: userRow.role === "admin" ? "Administrative report intake" : "Contractor",
      city: "Orlando",
      state: "FL",
      verification_status: userRow.role === "admin" ? "verified" : "pending",
    })
    .select("*")
    .single()

  if (error) throw new Error(error.message)

  return data
}

function reportTimeline(report: ClientReport): ReportTimelineEvent[] {
  const events: ReportTimelineEvent[] = [
    {
      id: `${report.id}_submitted`,
      reportId: report.id,
      type: "submitted",
      title: "Report submitted",
      description: "Contractor submitted project facts and payment context for moderation.",
      createdAt: report.createdAt,
    },
  ]

  if (report.evidenceAttached) {
    events.push({
      id: `${report.id}_evidence`,
      reportId: report.id,
      type: "evidence_uploaded",
      title: "Evidence attached",
      description: "Supporting files were attached for admin-only review.",
      createdAt: report.createdAt,
    })
  }

  if (report.approvedAt || report.status === "approved") {
    events.push({
      id: `${report.id}_approved`,
      reportId: report.id,
      type: "approved",
      title: "Summary approved",
      description: "Public summary passed moderation and became eligible for the client profile.",
      createdAt: report.approvedAt ?? report.createdAt,
    })

    events.push({
      id: `${report.id}_published`,
      reportId: report.id,
      type: "published",
      title: "Profile record updated",
      description: "Approved public profile details were refreshed with the moderated report summary.",
      createdAt: report.approvedAt ?? report.createdAt,
    })
  }

  if (report.status === "disputed") {
    events.push({
      id: `${report.id}_disputed`,
      reportId: report.id,
      type: "disputed",
      title: "Dispute context received",
      description: "A client response or dispute is attached and visible with the report context.",
      createdAt: report.createdAt,
    })
  }

  return events
}

async function getApprovedReportsForClient(clientId: string) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("client_reports")
    .select("*")
    .eq("client_id", clientId)
    .in("status", ["approved", "disputed"])
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map(mapClientReport)
}

async function getExistingSlugs(exceptClientId?: string) {
  const supabase = createServiceClient()
  const { data, error } = await supabase.from("client_profiles").select("id, public_slug")

  if (error) throw new Error(error.message)

  return (data ?? [])
    .filter((row) => row.id !== exceptClientId)
    .map((row) => row.public_slug)
}

async function findOrCreateClientProfile(input: ClientReportInput) {
  const supabase = createServiceClient()
  const phoneHash = hashIdentifier(input.phone, "phone")
  const emailHash = hashIdentifier(input.email, "email")
  const baseSlug = buildClientSlug({
    firstName: input.firstName,
    lastName: input.lastName,
    city: input.city,
    state: input.state.toUpperCase(),
  })

  const filters = [
    phoneHash !== emptyHash ? `phone_hash.eq.${phoneHash}` : undefined,
    emailHash !== emptyHash ? `email_hash.eq.${emailHash}` : undefined,
  ].filter(Boolean)

  if (filters.length > 0) {
    const { data, error } = await supabase
      .from("client_profiles")
      .select("*")
      .or(filters.join(","))
      .limit(1)
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (data) return data
  }

  const { data: existingBySlug, error: slugError } = await supabase
    .from("client_profiles")
    .select("*")
    .eq("public_slug", baseSlug)
    .maybeSingle()

  if (slugError) throw new Error(slugError.message)
  if (existingBySlug) return existingBySlug

  const publicSlug = ensureUniqueSlug(baseSlug, await getExistingSlugs())
  const { data, error } = await supabase
    .from("client_profiles")
    .insert({
      first_name: input.firstName,
      last_name: input.lastName,
      business_name: input.businessName ?? null,
      city: input.city,
      state: input.state.toUpperCase(),
      phone_hash: phoneHash,
      email_hash: emailHash,
      public_slug: publicSlug,
      is_public: false,
    })
    .select("*")
    .single()

  if (error) throw new Error(error.message)

  return data
}

export async function getPublicClientProfilesSupabase() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("client_profiles")
    .select("*")
    .eq("is_public", true)
    .order("updated_at", { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map(mapClientProfile)
}

export async function getPublicClientProfileSupabase(slug: string): Promise<PublicClientProfile | undefined> {
  const supabase = createServiceClient()
  const { data: profileRow, error: profileError } = await supabase
    .from("client_profiles")
    .select("*")
    .eq("public_slug", slug)
    .eq("is_public", true)
    .maybeSingle()

  if (profileError) throw new Error(profileError.message)
  if (!profileRow) return undefined

  const profile = mapClientProfile(profileRow)
  const reports = await getApprovedReportsForClient(profile.id)
  const reportIds = reports.map((report) => report.id)

  const [{ data: responseRows, error: responseError }, evidenceResult, discussionResult] = await Promise.all([
    supabase
      .from("client_responses")
      .select("*")
      .eq("client_id", profile.id)
      .eq("status", "published")
      .order("created_at", { ascending: false }),
    reportIds.length > 0
      ? supabase.from("report_evidence").select("*").in("report_id", reportIds)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("community_discussions")
      .select("*")
      .eq("client_id", profile.id)
      .eq("status", "approved")
      .order("created_at", { ascending: false }),
  ])

  if (responseError) throw new Error(responseError.message)
  if (evidenceResult.error) throw new Error(evidenceResult.error.message)
  if (discussionResult.error && !isMissingRelationError(discussionResult.error)) {
    throw new Error(discussionResult.error.message)
  }

  const positiveReports = reports.filter((report) => isPositiveReportCategory(report.reportCategory))

  return {
    ...profile,
    reports,
    positiveReports,
    clientResponses: (responseRows ?? []).map(mapResponse),
    communityDiscussions: discussionResult.error ? [] : (discussionResult.data ?? []).map(mapCommunityDiscussion),
    evidence: (evidenceResult.data ?? []).map(mapPublicEvidence),
    timeline: reports
      .flatMap(reportTimeline)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    scoreFactors: getScoreFactors(reports),
    scoreBreakdown: getScoreCategoryBreakdown(reports),
    balanceSummary: getReportedBalanceSummary(reports),
    paymentReliability: paymentReliabilityLabel(profile.clientBureauScore),
    disputeHistory: disputeHistoryLabel(reports),
  }
}

function buildPublicBusinessProfileFromRows(input: {
  contractor: ContractorProfile
  reports: ClientReport[]
  evidence: ReportEvidence[]
  clients: ClientProfile[]
  subscription?: Subscription
}): PublicBusinessProfile {
  const { contractor, reports, evidence, clients, subscription } = input
  const approvedReports = reports.filter((report) => report.status === "approved")
  const publicClientReports = approvedReports
    .map((report) => ({
      report,
      client: clients.find((client) => client.id === report.clientId && client.isPublic),
    }))
    .filter((item): item is { report: ClientReport; client: ClientProfile } => Boolean(item.client))
  const positiveReports = approvedReports.filter((report) => isPositiveReportCategory(report.reportCategory))
  const disputedReports = reports.filter((report) => report.status === "disputed")
  const rating = calculateBusinessRating({ contractor, reports, evidence, subscription })
  const serviceAreas = [
    `${contractor.city}, ${contractor.state}`,
    ...reports.map((report) => `${report.projectCity}, ${report.projectState}`),
  ].filter((value, index, values) => values.indexOf(value) === index)
  const publicProfileStatus =
    contractor.verificationStatus === "verified"
      ? "Verified"
      : contractor.verificationStatus === "pending"
        ? "Verification pending"
        : "Basic profile"

  return {
    ...contractor,
    licenseNumber: contractor.licenseNumber ? "Information on file" : undefined,
    publicSlug: buildBusinessSlug(contractor),
    ratingScore: rating.score,
    ratingGrade: rating.grade,
    ratingConfidence: rating.confidence,
    ratingSummary: rating.summary,
    ratingFactors: rating.factors,
    memberSince: contractor.createdAt,
    lastUpdated: [...reports.map((report) => report.approvedAt ?? report.createdAt), contractor.createdAt].sort().at(-1) ?? contractor.createdAt,
    serviceAreas,
    publicProfileStatus,
    reportStats: {
      submitted: reports.length,
      approved: approvedReports.length,
      published: publicClientReports.length,
      positive: positiveReports.length,
      disputed: disputedReports.length,
      evidenceAttached: reports.filter((report) => report.evidenceAttached).length,
    },
    publicClientReports,
    trustHighlights: [
      `${publicProfileStatus} business profile`,
      `${rating.confidence} rating confidence`,
      `${publicClientReports.length} public client report${publicClientReports.length === 1 ? "" : "s"} contributed`,
      evidence.length > 0 ? "Private evidence records on file" : "Evidence workflow available",
    ],
  }
}

export async function getPublicBusinessProfilesSupabase(): Promise<PublicBusinessProfile[]> {
  const supabase = createServiceClient()
  const [contractorsResult, reportsResult, evidenceResult, clientsResult, subscriptionsResult] = await Promise.all([
    supabase.from("contractor_profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("client_reports").select("*"),
    supabase.from("report_evidence").select("*"),
    supabase.from("client_profiles").select("*").eq("is_public", true),
    supabase.from("subscriptions").select("*"),
  ])

  for (const result of [contractorsResult, reportsResult, evidenceResult, clientsResult, subscriptionsResult]) {
    if (result.error) throw new Error(result.error.message)
  }

  const contractors = (contractorsResult.data ?? []).map(mapContractorProfile)
  const reports = (reportsResult.data ?? []).map(mapClientReport)
  const evidence = (evidenceResult.data ?? []).map(mapEvidence)
  const clients = (clientsResult.data ?? []).map(mapClientProfile)
  const subscriptions = (subscriptionsResult.data ?? []).map(mapSubscription)

  return contractors.map((contractor) => {
    const contractorReports = reports.filter((report) => report.contractorId === contractor.id)

    return buildPublicBusinessProfileFromRows({
      contractor,
      reports: contractorReports,
      evidence: evidence.filter((item) =>
        contractorReports.some((report) => report.id === item.reportId),
      ),
      clients,
      subscription: subscriptions.find((item) => item.contractorId === contractor.id),
    })
  })
}

export async function getPublicBusinessProfileSupabase(slug: string): Promise<PublicBusinessProfile | undefined> {
  const profiles = await getPublicBusinessProfilesSupabase()

  return profiles.find((profile) => profile.publicSlug === slug)
}

export async function searchClientsSupabase(
  query = "",
  filters: SearchFilters = {},
): Promise<ClientSearchResult[]> {
  const supabase = createServiceClient()
  const normalizedQuery = query.trim().toLowerCase()
  const normalizedDigits = query.replace(/\D/g, "")
  const privateIntent = normalizedQuery.includes("@") || normalizedDigits.length >= 7
  const privateSearchHashes = new Set(
    [
      normalizedQuery.includes("@") ? hashIdentifier(query, "email") : undefined,
      normalizedDigits.length >= 7 ? hashIdentifier(query, "phone") : undefined,
    ].filter((value): value is string => Boolean(value && value !== emptyHash)),
  )
  let builder = supabase.from("client_profiles").select("*").eq("is_public", true)

  if (filters.state) builder = builder.eq("state", filters.state)
  if (filters.riskLevel) builder = builder.eq("risk_level", filters.riskLevel)

  const { data, error } = await builder.order("updated_at", { ascending: false })

  if (error) throw new Error(error.message)

  const profiles = (data ?? []).map(mapClientProfile)
  const results = await Promise.all(
    profiles.map(async (client) => {
      const reports = await getApprovedReportsForClient(client.id)
      const latestReport = reports[0]
      const nameLocation = [
        client.firstName,
        client.lastName,
        client.businessName,
        client.city,
        client.state,
        client.zip,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      const privateIdentifiers = [client.phoneHash, client.emailHash].join(" ").toLowerCase()
      const searchable = `${nameLocation} ${privateIdentifiers}`
      const exactNameMatch = normalizedQuery.length > 0 && nameLocation.includes(normalizedQuery)
      const privateMatch =
        privateIntent &&
        (privateSearchHashes.has(client.phoneHash) || privateSearchHashes.has(client.emailHash))
      const reportMatch = reports.some((report) =>
        [report.reportCategory, report.paymentStatus, report.publicSummary]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      )
      const matchScore =
        (exactNameMatch ? 50 : 0) +
        (privateMatch ? 45 : 0) +
        (reportMatch ? 25 : 0) +
        (filters.state && client.state === filters.state ? 10 : 0) +
        (client.riskLevel === "High" ? 8 : client.riskLevel === "Elevated" ? 5 : 2)

      return {
        ...client,
        matchedBy: privateIntent
          ? "Private identifier checked"
          : reportMatch
            ? "Report context match"
            : "Name and location match",
        matchScore,
        latestCategory: latestReport?.reportCategory,
        latestSummary: latestReport?.publicSummary,
        privateMatch,
        searchable,
        reports,
      }
    }),
  )

  return results
    .filter((client) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        client.searchable.includes(normalizedQuery) ||
        client.privateMatch
      const matchesCategory =
        !filters.category ||
        client.reports.some((report) => report.reportCategory === filters.category)

      return matchesQuery && matchesCategory
    })
    .sort((a, b) => b.matchScore - a.matchScore || b.reportCount - a.reportCount)
    .map((client) => {
      const { privateMatch, searchable, reports, ...result } = client

      void privateMatch
      void searchable
      void reports

      return result
    })
}

export async function getContractorDashboardSupabase(userId: string) {
  const supabase = createServiceClient()
  const { data: userRow, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single()

  if (userError) throw new Error(userError.message)

  const contractorRow = await getOrCreateContractorProfileForUser(userId)

  const { data: reportRows, error: reportError } = await supabase
    .from("client_reports")
    .select("*")
    .eq("contractor_id", contractorRow.id)
    .order("created_at", { ascending: false })

  if (reportError) throw new Error(reportError.message)

  const reports = (reportRows ?? []).map(mapClientReport)
  const reportIds = reports.map((report) => report.id)
  const [{ data: evidenceRows, error: evidenceError }, { data: subscriptionRow, error: subscriptionError }] =
    await Promise.all([
      reportIds.length > 0
        ? supabase.from("report_evidence").select("*").in("report_id", reportIds)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("subscriptions")
        .select("*")
        .eq("contractor_id", contractorRow.id)
        .maybeSingle(),
    ])

  if (evidenceError) throw new Error(evidenceError.message)
  if (subscriptionError) throw new Error(subscriptionError.message)

  return {
    user: mapUser(userRow),
    contractor: mapContractorProfile(contractorRow),
    reports,
    evidence: (evidenceRows ?? []).map(mapEvidence),
    savedSearches: [] satisfies SavedSearch[],
    subscription: subscriptionRow ? mapSubscription(subscriptionRow) : undefined,
  }
}

export async function getPendingAdminReviewsSupabase() {
  const supabase = createServiceClient()
  const { data: reviewRows, error: reviewError } = await supabase
    .from("admin_reviews")
    .select("*")
    .order("created_at", { ascending: false })

  if (reviewError) throw new Error(reviewError.message)

  return Promise.all(
    (reviewRows ?? []).map(async (reviewRow) => {
      const review = mapAdminReview(reviewRow)
      const { data: reportRow, error: reportError } = await supabase
        .from("client_reports")
        .select("*")
        .eq("id", review.reportId)
        .maybeSingle()

      if (reportError) throw new Error(reportError.message)

      const report = reportRow ? mapClientReport(reportRow) : undefined
      const [{ data: clientRow, error: clientError }, { data: evidenceRows, error: evidenceError }] =
        await Promise.all([
          reportRow
            ? supabase.from("client_profiles").select("*").eq("id", reportRow.client_id).maybeSingle()
            : Promise.resolve({ data: null, error: null }),
          reportRow
            ? supabase.from("report_evidence").select("*").eq("report_id", reportRow.id)
            : Promise.resolve({ data: [], error: null }),
        ])

      if (clientError) throw new Error(clientError.message)
      if (evidenceError) throw new Error(evidenceError.message)

      const checklist: ReviewChecklistItem[] = report
        ? [
            {
              id: `${review.id}_evidence`,
              reportId: report.id,
              label: "Evidence reviewed",
              description: report.evidenceAttached
                ? "Evidence is attached and available for admin-only review."
                : "No evidence is attached; approve only if the summary is otherwise supportable.",
              status: (report.evidenceAttached ? "pass" : "warning") satisfies ReviewChecklistStatus,
            },
            {
              id: `${review.id}_neutral`,
              reportId: report.id,
              label: "Neutral public summary",
              description: "Summary uses reported-experience language and avoids motive claims.",
              status: "pending" satisfies ReviewChecklistStatus,
            },
            {
              id: `${review.id}_private`,
              reportId: report.id,
              label: "Private identifiers hidden",
              description: "Phone and email remain hashed/private and are not included publicly.",
              status: "pass" satisfies ReviewChecklistStatus,
            },
          ]
        : []

      return {
        review,
        report,
        client: clientRow ? mapClientProfile(clientRow) : undefined,
        evidence: (evidenceRows ?? []).map(mapEvidence),
        checklist,
      }
    }),
  )
}

export async function getAdminWorkspaceDataSupabase(): Promise<AdminWorkspaceData> {
  const supabase = createServiceClient()
  const [
    usersResult,
    contractorsResult,
    clientsResult,
    reportsResult,
    evidenceResult,
    responsesResult,
    discussionsResult,
    auditResult,
    reviews,
  ] = await Promise.all([
    supabase.from("users").select("*").order("created_at", { ascending: false }),
    supabase.from("contractor_profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("client_profiles").select("*").order("updated_at", { ascending: false }),
    supabase.from("client_reports").select("*").order("created_at", { ascending: false }),
    supabase.from("report_evidence").select("*").order("uploaded_at", { ascending: false }),
    supabase.from("client_responses").select("*").order("created_at", { ascending: false }),
    supabase.from("community_discussions").select("*").order("created_at", { ascending: false }),
    supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(200),
    getPendingAdminReviewsSupabase(),
  ])

  for (const result of [
    usersResult,
    contractorsResult,
    clientsResult,
    reportsResult,
    evidenceResult,
    responsesResult,
  ]) {
    if (result.error) throw new Error(result.error.message)
  }

  if (discussionsResult.error && !isMissingRelationError(discussionsResult.error)) {
    throw new Error(discussionsResult.error.message)
  }

  if (auditResult.error && !isMissingRelationError(auditResult.error)) {
    throw new Error(auditResult.error.message)
  }

  return {
    users: (usersResult.data ?? []).map(mapUser),
    contractors: (contractorsResult.data ?? []).map(mapContractorProfile),
    clients: (clientsResult.data ?? []).map(mapClientProfile),
    reports: (reportsResult.data ?? []).map(mapClientReport),
    evidence: (evidenceResult.data ?? []).map(mapEvidence),
    responses: (responsesResult.data ?? []).map(mapResponse),
    discussions: discussionsResult.error ? [] : (discussionsResult.data ?? []).map(mapCommunityDiscussion),
    reviews,
    auditLog: auditResult.error ? [] : (auditResult.data ?? []).map(mapAuditLog),
  }
}

export async function submitClientReportSupabase(
  input: ClientReportInput,
  userId: string,
  evidenceFiles: File[] = [],
) {
  const supabase = createServiceClient()
  const contractorRow = await getOrCreateContractorProfileForUser(userId)

  const clientRow = await findOrCreateClientProfile(input)
  const { data: reportRow, error: reportError } = await supabase
    .from("client_reports")
    .insert({
      contractor_id: contractorRow.id,
      client_id: clientRow.id,
      project_type: input.projectType,
      project_city: input.projectCity,
      project_state: input.projectState.toUpperCase(),
      contract_amount: input.contractAmount,
      amount_unpaid: input.amountUnpaid,
      report_category: input.reportCategory,
      payment_status: input.paymentStatus,
      report_summary: input.reportSummary,
      detailed_experience: input.detailedExperience,
      public_summary: input.reportSummary,
      evidence_attached: Boolean(input.evidenceAttached || evidenceFiles.length > 0),
      status: "pending",
      moderation_note: "Queued for Client Bureau moderation.",
    })
    .select("*")
    .single()

  if (reportError) throw new Error(reportError.message)

  const validFiles = evidenceFiles.filter((file) => file.size > 0)

  if (validFiles.length > 0) {
    await Promise.all(
      validFiles.map(async (file) => {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-")
        const storagePath = `report-evidence/${reportRow.id}/${Date.now()}-${safeName}`
        const { error: uploadError } = await supabase.storage
          .from("report-evidence")
          .upload(storagePath, file, {
            contentType: file.type || "application/octet-stream",
            upsert: false,
          })

        if (uploadError) throw new Error(uploadError.message)

        const { error: evidenceError } = await supabase.from("report_evidence").insert({
          report_id: reportRow.id,
          file_name: file.name,
          file_type: file.type || "application/octet-stream",
          storage_path: storagePath,
        })

        if (evidenceError) throw new Error(evidenceError.message)
      }),
    )
  }

  const { error: reviewError } = await supabase.from("admin_reviews").insert({
    report_id: reportRow.id,
    status: "queued",
    notes: "New contractor-submitted report queued for policy review.",
  })

  if (reviewError) throw new Error(reviewError.message)

  return mapClientReport(reportRow)
}

function extractSlugFromProfileUrl(profileUrl: string) {
  try {
    const parsed = new URL(profileUrl)
    const segments = parsed.pathname.split("/").filter(Boolean)
    const clientIndex = segments.indexOf("client")

    return clientIndex >= 0 ? segments[clientIndex + 1] : segments.at(-1)
  } catch {
    const segments = profileUrl.split("/").filter(Boolean)
    const clientIndex = segments.indexOf("client")

    return clientIndex >= 0 ? segments[clientIndex + 1] : segments.at(-1)
  }
}

export async function submitClientResponseSupabase(input: ClientResponseInput) {
  const supabase = createServiceClient()
  const slug = extractSlugFromProfileUrl(input.profileUrl)

  if (!slug) {
    throw new Error("A valid public profile URL is required.")
  }

  const { data: clientRow, error: clientError } = await supabase
    .from("client_profiles")
    .select("*")
    .eq("public_slug", slug)
    .maybeSingle()

  if (clientError) throw new Error(clientError.message)
  if (!clientRow) throw new Error("No Client Bureau profile was found for that URL.")

  const { data, error } = await supabase
    .from("client_responses")
    .insert({
      client_id: clientRow.id,
      response_summary: `${input.requestType}: ${input.responseSummary}`,
      status: "pending",
    })
    .select("*")
    .single()

  if (error) throw new Error(error.message)

  return mapResponse(data)
}

export async function submitCommunityDiscussionSupabase(input: {
  profileSlug: string
  name: string
  email: string
  relationshipCategory: CommunityDiscussion["relationshipCategory"]
  commentBody: string
  attachmentUrl?: string
  reportId?: string
}) {
  const supabase = createServiceClient()
  const { data: clientRow, error: clientError } = await supabase
    .from("client_profiles")
    .select("*")
    .eq("public_slug", input.profileSlug)
    .eq("is_public", true)
    .maybeSingle()

  if (clientError) throw new Error(clientError.message)
  if (!clientRow) throw new Error("No public profile was found for that discussion.")

  const { data, error } = await supabase
    .from("community_discussions")
    .insert({
      client_id: clientRow.id,
      report_id: input.reportId || null,
      author_name: input.name,
      author_email_hash: hashIdentifier(input.email),
      relationship_category: input.relationshipCategory,
      comment_body: input.commentBody,
      attachment_url: input.attachmentUrl ?? null,
      status: "pending",
    })
    .select("*")
    .single()

  if (error) throw new Error(error.message)

  return mapCommunityDiscussion(data)
}

export async function reviewCommunityDiscussionSupabase(
  discussionId: string,
  decision: "approved" | "rejected" | "deleted" | "verified",
  moderatorNote?: string,
  reviewer?: { id: string; fullName: string },
) {
  const supabase = createServiceClient()
  const now = new Date().toISOString()

  if (decision === "deleted") {
    const { error } = await supabase.from("community_discussions").delete().eq("id", discussionId)
    if (error) throw new Error(error.message)

    await logAdminAction({
      actorId: reviewer?.id,
      actorName: reviewer?.fullName,
      action: "deleted_discussion",
      entityType: "discussion",
      entityId: discussionId,
      summary: "Deleted discussion entry.",
    })

    return undefined
  }

  const nextStatus: CommunityDiscussion["status"] =
    decision === "approved" || decision === "verified" ? "approved" : "rejected"
  const discussionPayload = {
    status: nextStatus,
    moderator_note: moderatorNote || null,
    published_at: nextStatus === "approved" ? now : null,
    updated_at: now,
    ...(decision === "verified" ? { is_verified: true } : {}),
  }
  const { data, error } = await supabase
    .from("community_discussions")
    .update(discussionPayload)
    .eq("id", discussionId)
    .select("*")
    .single()

  if (error) throw new Error(error.message)

  await logAdminAction({
    actorId: reviewer?.id,
    actorName: reviewer?.fullName,
    action: `${decision}_discussion`,
    entityType: "discussion",
    entityId: discussionId,
    summary: `Discussion marked ${decision}.`,
  })

  return mapCommunityDiscussion(data)
}

export async function reviewReportSupabase(
  reportId: string,
  decision: "approved" | "rejected",
  editedPublicSummary?: string,
  reviewerId?: string,
) {
  const supabase = createServiceClient()
  const now = new Date().toISOString()
  const nextReportStatus = decision === "approved" ? "approved" : "rejected"
  const { data: reportRow, error: reportError } = await supabase
    .from("client_reports")
    .update({
      status: nextReportStatus,
      public_summary: editedPublicSummary ?? "",
      approved_at: decision === "approved" ? now : null,
      moderation_note:
        decision === "approved"
          ? "Approved public summary after admin review."
          : "Rejected during Client Bureau moderation.",
    })
    .eq("id", reportId)
    .select("*")
    .single()

  if (reportError) throw new Error(reportError.message)

  const { data: existingReview, error: existingReviewError } = await supabase
    .from("admin_reviews")
    .select("*")
    .eq("report_id", reportId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingReviewError) throw new Error(existingReviewError.message)

  let publishedProfile: ClientProfile | undefined

  if (decision === "approved") {
    const reports = await getApprovedReportsForClient(reportRow.client_id)
    const calculated = calculateClientBureauScore(reports)

    const { data: profileRow, error: profileUpdateError } = await supabase
      .from("client_profiles")
      .update({
        is_public: true,
        client_bureau_score: calculated.score,
        risk_level: calculated.riskLevel,
        report_count: calculated.reportCount,
        updated_at: now,
      })
      .eq("id", reportRow.client_id)
      .select("*")
      .single()

    if (profileUpdateError) throw new Error(profileUpdateError.message)

    publishedProfile = mapClientProfile(profileRow)
  }

  const reviewPayload = {
    reviewer_id: reviewerId ?? null,
    status: decision,
    edited_public_summary: editedPublicSummary ?? null,
    notes:
      decision === "approved" && publishedProfile
        ? `Approved report published at /client/${publishedProfile.publicSlug}.`
        : "Rejected report remains private.",
    updated_at: now,
  }

  const reviewMutation = existingReview
    ? supabase.from("admin_reviews").update(reviewPayload).eq("id", existingReview.id).select("*").single()
    : supabase
        .from("admin_reviews")
        .insert({ report_id: reportId, ...reviewPayload })
        .select("*")
        .single()

  const { data: reviewRow, error: reviewError } = await reviewMutation

  if (reviewError) throw new Error(reviewError.message)

  await logAdminAction({
    actorId: reviewerId,
    action: decision === "approved" ? "approved_report" : "rejected_report",
    entityType: "report",
    entityId: reportId,
    summary:
      decision === "approved" && publishedProfile
        ? `Approved report and published /client/${publishedProfile.publicSlug}.`
        : "Rejected report and kept it private.",
    metadata: {
      publishedSlug: publishedProfile?.publicSlug ?? null,
    },
  })

  return {
    ...mapAdminReview(reviewRow),
    publishedProfileSlug: publishedProfile?.publicSlug,
    publishedProfileUrl: publishedProfile ? `/client/${publishedProfile.publicSlug}` : undefined,
  }
}

export async function reviewReportsBulkSupabase(
  reportIds: string[],
  decision: "approved" | "rejected" | "deleted",
  reviewerId?: string,
) {
  const updated: AdminReview[] = []
  const deletedIds: string[] = []

  for (const reportId of reportIds) {
    if (decision === "deleted") {
      const supabase = createServiceClient()
      const { error } = await supabase.from("client_reports").delete().eq("id", reportId)
      if (error) throw new Error(error.message)
      deletedIds.push(reportId)
      await logAdminAction({
        actorId: reviewerId,
        action: "deleted_report",
        entityType: "report",
        entityId: reportId,
        summary: "Deleted report from admin bulk action.",
      })
    } else {
      updated.push(await reviewReportSupabase(reportId, decision, undefined, reviewerId))
    }
  }

  return { updated, deletedIds }
}

export async function updateAdminClientRecordSupabase(input: {
  clientId: string
  firstName: string
  lastName: string
  businessName?: string
  city: string
  state: string
  riskLevel: ClientProfile["riskLevel"]
  clientBureauScore: number
  isPublic?: boolean
  moderatorNote?: string
  reviewer?: { id: string; fullName: string }
}) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("client_profiles")
    .update({
      first_name: input.firstName,
      last_name: input.lastName,
      business_name: input.businessName ?? null,
      city: input.city,
      state: input.state.toUpperCase(),
      risk_level: input.riskLevel,
      client_bureau_score: input.clientBureauScore,
      is_public: Boolean(input.isPublic),
    })
    .eq("id", input.clientId)
    .select("*")
    .single()

  if (error) throw new Error(error.message)

  await logAdminAction({
    actorId: input.reviewer?.id,
    actorName: input.reviewer?.fullName,
    action: "edited_client",
    entityType: "client",
    entityId: input.clientId,
    summary: input.moderatorNote || "Updated client profile fields and public visibility.",
  })

  return mapClientProfile(data)
}

export async function updateAdminContractorRecordSupabase(input: {
  contractorId: string
  businessName: string
  trade: string
  city: string
  state: string
  verificationStatus: ContractorProfile["verificationStatus"]
  moderatorNote?: string
  reviewer?: { id: string; fullName: string }
}) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("contractor_profiles")
    .update({
      business_name: input.businessName,
      trade: input.trade,
      city: input.city,
      state: input.state.toUpperCase(),
      verification_status: input.verificationStatus,
    })
    .eq("id", input.contractorId)
    .select("*")
    .single()

  if (error) throw new Error(error.message)

  await logAdminAction({
    actorId: input.reviewer?.id,
    actorName: input.reviewer?.fullName,
    action: "edited_contractor",
    entityType: "contractor",
    entityId: input.contractorId,
    summary: input.moderatorNote || "Updated contractor profile and verification status.",
  })

  return mapContractorProfile(data)
}

export async function deleteAdminRecordSupabase(
  entityType: "client" | "contractor" | "report" | "discussion",
  entityId: string,
  reviewer?: { id: string; fullName: string },
) {
  const supabase = createServiceClient()
  const tableByEntity = {
    client: "client_profiles",
    contractor: "contractor_profiles",
    report: "client_reports",
    discussion: "community_discussions",
  } as const
  const { error } = await supabase.from(tableByEntity[entityType]).delete().eq("id", entityId)

  if (error) throw new Error(error.message)

  await logAdminAction({
    actorId: reviewer?.id,
    actorName: reviewer?.fullName,
    action: "deleted_record",
    entityType,
    entityId,
    summary: `Deleted ${entityType} record from admin.`,
  })

  return true
}

function platformTableError(table: string, error: { message?: string; code?: string } | null) {
  if (!error) return

  if (isMissingRelationError(error)) {
    throw new Error(`Missing platform table ${table}. Apply Supabase migrations 0003, 0004, 0005, 0006, 0007, and 0008 before enabling PLATFORM_FEATURE_DATA_MODE=supabase.`)
  }

  if (table === "contract_packets" && isMissingContractPacketColumnError(error)) {
    throw new Error("Missing contract signing packet columns. Apply Supabase migration 0007_contract_signing_packets.sql before enabling Supabase-backed contract workflows.")
  }

  throw new Error(error.message ?? `Platform table ${table} could not be read.`)
}

function requirePlatformRow<T>(table: string, data: T | null): T {
  if (!data) {
    throw new Error(`Platform table ${table} did not return an updated record.`)
  }

  return data
}

async function requireContractorIdForUser(userId: string) {
  return (await getOrCreateContractorProfileForUser(userId)).id
}

export async function getContractorRiskOpsDataSupabase(userId: string): Promise<ContractorRiskOpsData> {
  const supabase = createServiceClient()
  const contractorId = await requireContractorIdForUser(userId)
  const [
    pipeline,
    rooms,
    watchlist,
    alerts,
    drafts,
    assessments,
    evidenceSummaries,
    evidenceVault,
    recoveryCases,
    recoveryAttempts,
    paymentPlans,
    lienDrafts,
    managedRecoveryCases,
    recoveryCommunications,
    recoveryResolutionOffers,
    floridaLienCases,
    lienNoticeDeliveries,
    lienFilingRecords,
    lienReleaseRecords,
    serviceFeeOrders,
    caseStaffAssignments,
    caseAuditEvents,
    caseDocumentLinks,
    contractDocuments,
    contractPackets,
  ] = await Promise.all([
    supabase.from("client_pipeline_items").select("*").eq("contractor_id", contractorId).order("updated_at", { ascending: false }),
    supabase.from("client_risk_rooms").select("*").eq("contractor_id", contractorId).order("last_activity_at", { ascending: false }),
    supabase.from("contractor_watchlist_items").select("*").eq("contractor_id", contractorId).order("updated_at", { ascending: false }),
    supabase.from("watchlist_alerts").select("*").eq("contractor_id", contractorId).order("created_at", { ascending: false }),
    supabase.from("report_drafts").select("*").eq("contractor_id", contractorId).order("updated_at", { ascending: false }),
    supabase.from("client_intake_assessments").select("*").eq("contractor_id", contractorId).order("created_at", { ascending: false }),
    supabase.from("evidence_review_summaries").select("*").eq("contractor_id", contractorId).order("last_updated_at", { ascending: false }),
    supabase.from("evidence_vault_items").select("*").eq("contractor_id", contractorId).order("updated_at", { ascending: false }),
    supabase.from("payment_recovery_cases").select("*").eq("contractor_id", contractorId).order("updated_at", { ascending: false }),
    supabase.from("payment_recovery_attempts").select("*").eq("contractor_id", contractorId).order("attempted_at", { ascending: false }),
    supabase.from("payment_plans").select("*").eq("contractor_id", contractorId).order("updated_at", { ascending: false }),
    supabase.from("lien_notice_drafts").select("*").eq("contractor_id", contractorId).order("updated_at", { ascending: false }),
    supabase.from("managed_recovery_cases").select("*").eq("contractor_id", contractorId).order("updated_at", { ascending: false }),
    supabase.from("recovery_communications").select("*").eq("contractor_id", contractorId).order("contacted_at", { ascending: false }),
    supabase.from("recovery_resolution_offers").select("*").eq("contractor_id", contractorId).order("updated_at", { ascending: false }),
    supabase.from("florida_lien_cases").select("*").eq("contractor_id", contractorId).order("updated_at", { ascending: false }),
    supabase.from("lien_notice_deliveries").select("*").eq("contractor_id", contractorId).order("updated_at", { ascending: false }),
    supabase.from("lien_filing_records").select("*").eq("contractor_id", contractorId).order("updated_at", { ascending: false }),
    supabase.from("lien_release_records").select("*").eq("contractor_id", contractorId).order("updated_at", { ascending: false }),
    supabase.from("service_fee_orders").select("*").eq("contractor_id", contractorId).order("updated_at", { ascending: false }),
    supabase.from("case_staff_assignments").select("*").order("due_at", { ascending: true }),
    supabase.from("case_audit_events").select("*").order("created_at", { ascending: false }),
    supabase.from("case_document_links").select("*").eq("contractor_id", contractorId).order("created_at", { ascending: false }),
    supabase.from("contract_workspace_items").select("*").eq("contractor_id", contractorId).order("updated_at", { ascending: false }),
    supabase.from("contract_packets").select("*").eq("contractor_id", contractorId).order("updated_at", { ascending: false }),
  ])

  platformTableError("client_pipeline_items", pipeline.error)
  platformTableError("client_risk_rooms", rooms.error)
  platformTableError("contractor_watchlist_items", watchlist.error)
  platformTableError("watchlist_alerts", alerts.error)
  platformTableError("report_drafts", drafts.error)
  platformTableError("client_intake_assessments", assessments.error)
  platformTableError("evidence_review_summaries", evidenceSummaries.error)
  platformTableError("evidence_vault_items", evidenceVault.error)
  platformTableError("payment_recovery_cases", recoveryCases.error)
  platformTableError("payment_recovery_attempts", recoveryAttempts.error)
  platformTableError("payment_plans", paymentPlans.error)
  platformTableError("lien_notice_drafts", lienDrafts.error)
  platformTableError("managed_recovery_cases", managedRecoveryCases.error)
  platformTableError("recovery_communications", recoveryCommunications.error)
  platformTableError("recovery_resolution_offers", recoveryResolutionOffers.error)
  platformTableError("florida_lien_cases", floridaLienCases.error)
  platformTableError("lien_notice_deliveries", lienNoticeDeliveries.error)
  platformTableError("lien_filing_records", lienFilingRecords.error)
  platformTableError("lien_release_records", lienReleaseRecords.error)
  platformTableError("service_fee_orders", serviceFeeOrders.error)
  platformTableError("case_staff_assignments", caseStaffAssignments.error)
  platformTableError("case_audit_events", caseAuditEvents.error)
  platformTableError("case_document_links", caseDocumentLinks.error)
  platformTableError("contract_workspace_items", contractDocuments.error)
  platformTableError("contract_packets", contractPackets.error)

  const mappedManagedRecoveryCases = (managedRecoveryCases.data ?? []).map(mapManagedRecoveryCase)
  const mappedFloridaLienCases = (floridaLienCases.data ?? []).map(mapFloridaLienCase)
  const mappedServiceFeeOrders = (serviceFeeOrders.data ?? []).map(mapServiceFeeOrder)
  const mappedEvidenceVault = (evidenceVault.data ?? []).map(mapEvidenceVaultItem)
  const mappedCaseDocumentLinks = (caseDocumentLinks.data ?? []).map(mapCaseDocumentLink)
  const contractorCaseIds = new Set([
    ...mappedManagedRecoveryCases.map((item) => item.id),
    ...mappedFloridaLienCases.map((item) => item.id),
    ...mappedServiceFeeOrders.map((item) => item.id),
  ])

  return {
    clientPipeline: (pipeline.data ?? []).map(mapClientPipelineItem),
    riskRooms: (rooms.data ?? []).map(mapClientRiskRoom),
    watchlist: (watchlist.data ?? []).map(mapWatchlistItem),
    watchlistAlerts: (alerts.data ?? []).map(mapWatchlistAlert),
    reportDrafts: (drafts.data ?? []).map(mapReportDraft),
    intakeAssessments: (assessments.data ?? []).map(mapIntakeAssessment),
    evidenceSummaries: (evidenceSummaries.data ?? []).map(mapEvidenceReviewSummary),
    evidenceVault: mappedEvidenceVault,
    paymentRecoveryCases: (recoveryCases.data ?? []).map(mapPaymentRecoveryCase),
    paymentRecoveryAttempts: (recoveryAttempts.data ?? []).map(mapPaymentRecoveryAttempt),
    paymentPlans: (paymentPlans.data ?? []).map(mapPaymentPlan),
    lienNoticeDrafts: (lienDrafts.data ?? []).map(mapLienNoticeDraft),
    managedRecoveryCases: mappedManagedRecoveryCases,
    recoveryCommunications: (recoveryCommunications.data ?? []).map(mapRecoveryCommunication),
    recoveryResolutionOffers: (recoveryResolutionOffers.data ?? []).map(mapRecoveryResolutionOffer),
    floridaLienCases: mappedFloridaLienCases,
    lienNoticeDeliveries: (lienNoticeDeliveries.data ?? []).map(mapLienNoticeDelivery),
    lienFilingRecords: (lienFilingRecords.data ?? []).map(mapLienFilingRecord),
    lienReleaseRecords: (lienReleaseRecords.data ?? []).map(mapLienReleaseRecord),
    serviceFeeOrders: mappedServiceFeeOrders,
    serviceReadiness: buildServiceReadinessSummaries({
      managedRecoveryCases: mappedManagedRecoveryCases,
      floridaLienCases: mappedFloridaLienCases,
      evidenceVault: mappedEvidenceVault,
      serviceFeeOrders: mappedServiceFeeOrders,
      documentLinks: mappedCaseDocumentLinks,
    }),
    caseDocumentLinks: mappedCaseDocumentLinks,
    caseStaffAssignments: (caseStaffAssignments.data ?? [])
      .map(mapCaseStaffAssignment)
      .filter((item) => contractorCaseIds.has(item.entityId)),
    caseAuditEvents: (caseAuditEvents.data ?? [])
      .map(mapCaseAuditEvent)
      .filter((item) => contractorCaseIds.has(item.entityId)),
    contractDocuments: (contractDocuments.data ?? []).map(mapContractWorkspaceItem),
    contractPackets: (contractPackets.data ?? []).map(mapContractPacket),
    activity: [],
    recommendedActions: [
      "Check a client before scheduling new work.",
      "Use contracts before committing materials or crew time.",
      "Keep recovery, Florida lien service, and evidence records private unless reviewed.",
    ],
  }
}

export async function getAdminModerationCrmDataSupabase(): Promise<AdminModerationCrmData> {
  const supabase = createServiceClient()
  const [cases, usersResult, batches, views, assignments, compliance] = await Promise.all([
    supabase.from("moderation_cases").select("*").order("due_at", { ascending: true }),
    supabase.from("users").select("*"),
    supabase.from("bulk_import_batches").select("*").order("created_at", { ascending: false }),
    supabase.from("admin_saved_views").select("*").order("created_at", { ascending: false }),
    supabase.from("admin_queue_assignments").select("*").order("due_at", { ascending: true }),
    supabase.from("recovery_compliance_reviews").select("*").order("created_at", { ascending: false }),
  ])

  platformTableError("moderation_cases", cases.error)
  if (usersResult.error) throw new Error(usersResult.error.message)
  platformTableError("bulk_import_batches", batches.error)
  platformTableError("admin_saved_views", views.error)
  platformTableError("admin_queue_assignments", assignments.error)
  platformTableError("recovery_compliance_reviews", compliance.error)

  const usersById = new Map((usersResult.data ?? []).map((user) => [user.id, mapUser(user)]))
  const mappedCases = (cases.data ?? []).map((caseItem) =>
    mapModerationCase(caseItem, caseItem.assigned_to ? usersById.get(caseItem.assigned_to)?.fullName : undefined),
  )

  return {
    cases: mappedCases,
    importBatches: (batches.data ?? []).map(mapBulkImportBatch),
    savedViews: (views.data ?? []).map(mapAdminSavedView),
    queueAssignments: (assignments.data ?? []).map(mapAdminQueueAssignment),
    recoveryComplianceReviews: (compliance.data ?? []).map(mapRecoveryComplianceReview),
    workload: [
      {
        id: "unassigned",
        label: "Unassigned",
        value: mappedCases.filter((item) => item.status === "unassigned").length,
        helper: "Cases needing owner",
        tone: "amber",
      },
      {
        id: "escalated",
        label: "Escalated",
        value: mappedCases.filter((item) => item.status === "escalated").length,
        helper: "Needs senior review",
        tone: "rose",
      },
      {
        id: "assigned",
        label: "Assigned",
        value: mappedCases.filter((item) => item.status === "assigned").length,
        helper: "In reviewer queue",
        tone: "slate",
      },
      {
        id: "closed",
        label: "Closed",
        value: mappedCases.filter((item) => item.status === "closed").length,
        helper: "Completed cases",
        tone: "emerald",
      },
    ],
  }
}

export async function createWatchlistItemSupabase(userId: string, input: WatchlistItemInput) {
  const supabase = createServiceClient()
  const contractorId = await requireContractorIdForUser(userId)
  const { data: client } = await supabase.from("client_profiles").select("*").eq("id", input.clientId).maybeSingle()
  const { data, error } = await supabase
    .from("contractor_watchlist_items")
    .insert({
      contractor_id: contractorId,
      client_id: input.clientId,
      watch_reason: input.watchReason,
      alert_level: input.alertLevel,
      private_match: true,
      last_signal: client
        ? `${client.risk_level} reported risk profile with ${client.report_count} approved public reports.`
        : "Client added for private intake review.",
    })
    .select("*")
    .single()

  platformTableError("contractor_watchlist_items", error)
  return mapWatchlistItem(requirePlatformRow("contractor_watchlist_items", data))
}

export async function updateWatchlistItemSupabase(userId: string, itemId: string, status: WatchlistStatus) {
  const contractorId = await requireContractorIdForUser(userId)
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("contractor_watchlist_items")
    .update({ status })
    .eq("id", itemId)
    .eq("contractor_id", contractorId)
    .select("*")
    .single()

  platformTableError("contractor_watchlist_items", error)
  return mapWatchlistItem(requirePlatformRow("contractor_watchlist_items", data))
}

export async function saveReportDraftSupabase(userId: string, input: ReportDraftInput) {
  const contractorId = await requireContractorIdForUser(userId)
  const supabase = createServiceClient()
  const payload = {
    contractor_id: contractorId,
    client_id: input.clientId || null,
    client_name: input.clientName,
    project_type: input.projectType,
    estimated_value: input.estimatedValue,
    amount_at_risk: input.amountAtRisk,
    summary: input.summary,
    next_step: input.nextStep,
    status: input.status,
  }
  const query = input.draftId
    ? supabase.from("report_drafts").update(payload).eq("id", input.draftId).eq("contractor_id", contractorId)
    : supabase.from("report_drafts").insert(payload)
  const { data, error } = await query.select("*").single()

  platformTableError("report_drafts", error)
  return mapReportDraft(requirePlatformRow("report_drafts", data))
}

export async function deleteReportDraftSupabase(userId: string, draftId: string) {
  const contractorId = await requireContractorIdForUser(userId)
  const supabase = createServiceClient()
  const { error } = await supabase.from("report_drafts").delete().eq("id", draftId).eq("contractor_id", contractorId)

  platformTableError("report_drafts", error)

  const audit: Omit<AuditLogEntry, "id" | "createdAt"> = {
    actorId: userId,
    actorName: "Contractor workspace",
    action: "deleted_report_draft",
    entityType: "report",
    entityId: draftId,
    summary: "Report draft removed from contractor workspace.",
  }
  await logAdminAction(audit)

  return {
    ...audit,
    id: `audit_delete_draft_${draftId}`,
    createdAt: new Date().toISOString(),
  }
}

export async function createIntakeAssessmentSupabase(userId: string, input: IntakeAssessmentInput) {
  const contractorId = await requireContractorIdForUser(userId)
  const scoreInput = {
    projectValue: input.projectValue,
    depositReceived: Boolean(input.depositReceived),
    contractSigned: Boolean(input.contractSigned),
    privateMatchConfirmed: Boolean(input.privateMatchConfirmed),
  }
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("client_intake_assessments")
    .insert({
      contractor_id: contractorId,
      client_name: input.clientName,
      city: input.city,
      state: input.state.toUpperCase(),
      project_value: input.projectValue,
      deposit_received: Boolean(input.depositReceived),
      contract_signed: Boolean(input.contractSigned),
      private_match_confirmed: Boolean(input.privateMatchConfirmed),
      recommendation: intakeRiskRecommendation(scoreInput),
      score: intakeAssessmentScore(scoreInput),
      notes: input.notes ?? "Assessment created from contractor intake workflow.",
    })
    .select("*")
    .single()

  platformTableError("client_intake_assessments", error)
  return mapIntakeAssessment(requirePlatformRow("client_intake_assessments", data))
}

export async function createPaymentRecoveryCaseSupabase(userId: string, input: PaymentRecoveryCaseInput) {
  const contractorId = await requireContractorIdForUser(userId)
  const priority = paymentRecoveryPriority({ amountDue: input.amountDue, invoiceAgeDays: input.invoiceAgeDays })
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("payment_recovery_cases")
    .insert({
      contractor_id: contractorId,
      client_name: input.clientName,
      city: input.city,
      state: input.state.toUpperCase(),
      amount_due: input.amountDue,
      invoice_age_days: input.invoiceAgeDays,
      preferred_channel: input.preferredChannel,
      status: input.invoiceAgeDays >= 21 ? "ready_to_contact" : "draft",
      priority,
      next_action: nextRecoveryAction(input.preferredChannel),
      summary: input.summary,
      compliance_flags: [
        "Keep outreach factual and tied to invoice/project records.",
        "Avoid threats, public pressure language, or unsupported claims.",
        "Log each contact attempt, response, and resolution update.",
      ],
    })
    .select("*")
    .single()

  platformTableError("payment_recovery_cases", error)
  return mapPaymentRecoveryCase(requirePlatformRow("payment_recovery_cases", data))
}

export async function submitManagedRecoveryCaseSupabase(userId: string, input: ManagedRecoveryCaseInput) {
  const contractorId = await requireContractorIdForUser(userId)
  const priority = paymentRecoveryPriority({ amountDue: input.amountDue, invoiceAgeDays: input.invoiceAgeDays })
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("managed_recovery_cases")
    .insert({
      contractor_id: contractorId,
      client_name: input.clientName,
      client_email_hash: input.clientEmail ? hashIdentifier(input.clientEmail) : null,
      client_email_masked: input.clientEmail ? maskEmail(input.clientEmail) : null,
      city: input.city,
      state: input.state.toUpperCase(),
      amount_due: input.amountDue,
      invoice_age_days: input.invoiceAgeDays,
      preferred_channel: input.preferredChannel,
      status: "fee_due",
      priority,
      evidence_vault_item_ids: parseDelimitedIds(input.evidenceVaultItemIds),
      next_action: "Pay the service fee, upload supporting documents, and watch for Resolution Desk review.",
      summary: input.summary,
      contractor_direct_payment: true,
      compliance_flags: [
        "Client Bureau seeks a documented contractor-direct resolution.",
        "Recovery communications must stay factual, respectful, and privately logged.",
        "Client payments are not held by Client Bureau in this workflow.",
      ],
    })
    .select("*")
    .single()

  platformTableError("managed_recovery_cases", error)
  const recoveryCase = mapManagedRecoveryCase(requirePlatformRow("managed_recovery_cases", data))
  await logCaseAudit({
    entityType: "managed_recovery",
    entityId: recoveryCase.id,
    actorId: userId,
    actorName: "Contractor workspace",
    action: "submitted",
    summary: "Managed recovery case submitted for Resolution Desk review.",
  })

  return recoveryCase
}

export async function createServiceFeeOrderSupabase(userId: string, input: ServiceFeeCheckoutInput) {
  const contractorId = await requireContractorIdForUser(userId)
  const fee = serviceFeeForKind(input.kind)
  const checkoutUrl = `/api/stripe/service-fee/checkout?kind=${input.kind}&entity=${encodeURIComponent(input.entityId)}`
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("service_fee_orders")
    .insert({
      contractor_id: contractorId,
      kind: input.kind,
      entity_id: input.entityId,
      status: "checkout_ready",
      client_bureau_fee_cents: fee.clientBureauFeeCents,
      pass_through_fee_cents: fee.passThroughFeeCents,
      currency: "usd",
      stripe_checkout_url: checkoutUrl,
    })
    .select("*")
    .single()

  platformTableError("service_fee_orders", error)
  const order = mapServiceFeeOrder(requirePlatformRow("service_fee_orders", data))
  await logCaseAudit({
    entityType: "service_fee",
    entityId: order.id,
    actorId: userId,
    actorName: "Contractor workspace",
    action: "checkout_created",
    summary: "Service fee checkout created with pass-through fees tracked separately.",
  })

  return order
}

async function getRevenueReadinessContext(contractorId: string) {
  const supabase = createServiceClient()
  const [evidenceVault, serviceFeeOrders, documentLinks] = await Promise.all([
    supabase.from("evidence_vault_items").select("*").eq("contractor_id", contractorId).order("updated_at", { ascending: false }),
    supabase.from("service_fee_orders").select("*").eq("contractor_id", contractorId).order("updated_at", { ascending: false }),
    supabase.from("case_document_links").select("*").eq("contractor_id", contractorId).order("created_at", { ascending: false }),
  ])

  platformTableError("evidence_vault_items", evidenceVault.error)
  platformTableError("service_fee_orders", serviceFeeOrders.error)
  platformTableError("case_document_links", documentLinks.error)

  return {
    evidenceVault: (evidenceVault.data ?? []).map(mapEvidenceVaultItem),
    serviceFeeOrders: (serviceFeeOrders.data ?? []).map(mapServiceFeeOrder),
    documentLinks: (documentLinks.data ?? []).map(mapCaseDocumentLink),
  }
}

export async function runRecoveryPrecheckSupabase(
  userId: string,
  input: ServicePrecheckInput,
): Promise<ServiceReadinessSummary> {
  const contractorId = await requireContractorIdForUser(userId)
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("managed_recovery_cases")
    .select("*")
    .eq("id", input.caseId)
    .eq("contractor_id", contractorId)
    .single()

  platformTableError("managed_recovery_cases", error)

  const recoveryCase = mapManagedRecoveryCase(requirePlatformRow("managed_recovery_cases", data))
  const context = await getRevenueReadinessContext(contractorId)
  const summary = buildRecoveryReadinessSummary({
    recoveryCase,
    evidenceVault: context.evidenceVault,
    serviceFeeOrders: context.serviceFeeOrders,
    documentLinks: context.documentLinks,
  })
  const checkedAt = new Date().toISOString()

  const { error: updateError } = await supabase
    .from("managed_recovery_cases")
    .update({
      readiness_status: summary.status,
      readiness_score: summary.score,
      readiness_checked_at: checkedAt,
      submitted_for_review_at: summary.feePaid ? checkedAt : data?.submitted_for_review_at ?? null,
    })
    .eq("id", recoveryCase.id)
    .eq("contractor_id", contractorId)

  platformTableError("managed_recovery_cases", updateError)

  await logCaseAudit({
    entityType: "managed_recovery",
    entityId: recoveryCase.id,
    actorId: userId,
    actorName: "Contractor workspace",
    action: "precheck_completed",
    summary: `Recovery precheck completed with readiness score ${summary.score}.`,
  })

  return { ...summary, status: summary.status }
}

export async function runFloridaLienPrecheckSupabase(
  userId: string,
  input: ServicePrecheckInput,
): Promise<ServiceReadinessSummary> {
  const contractorId = await requireContractorIdForUser(userId)
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("florida_lien_cases")
    .select("*")
    .eq("id", input.caseId)
    .eq("contractor_id", contractorId)
    .single()

  platformTableError("florida_lien_cases", error)

  const lienCase = mapFloridaLienCase(requirePlatformRow("florida_lien_cases", data))
  const context = await getRevenueReadinessContext(contractorId)
  const summary = buildFloridaLienReadinessSummary({
    lienCase,
    evidenceVault: context.evidenceVault,
    serviceFeeOrders: context.serviceFeeOrders,
    documentLinks: context.documentLinks,
  })
  const checkedAt = new Date().toISOString()

  const { error: updateError } = await supabase
    .from("florida_lien_cases")
    .update({
      readiness_status: summary.status,
      readiness_score: summary.score,
      readiness_checked_at: checkedAt,
      submitted_for_review_at: summary.feePaid ? checkedAt : data?.submitted_for_review_at ?? null,
    })
    .eq("id", lienCase.id)
    .eq("contractor_id", contractorId)

  platformTableError("florida_lien_cases", updateError)

  await logCaseAudit({
    entityType: "florida_lien",
    entityId: lienCase.id,
    actorId: userId,
    actorName: "Contractor workspace",
    action: "precheck_completed",
    summary: `Florida lien service precheck completed with readiness score ${summary.score}.`,
  })

  return summary
}

export async function linkEvidenceToServiceCaseSupabase(
  userId: string,
  input: LinkEvidenceToServiceCaseInput,
): Promise<CaseDocumentLink> {
  const contractorId = await requireContractorIdForUser(userId)
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("case_document_links")
    .insert({
      contractor_id: contractorId,
      entity_type: input.entityType,
      entity_id: input.entityId,
      evidence_vault_item_id: input.evidenceVaultItemId,
      document_label: input.documentLabel,
      document_category: input.documentCategory,
      public_summary: input.publicSummary || "Document reviewed privately.",
    })
    .select("*")
    .single()

  platformTableError("case_document_links", error)

  await logCaseAudit({
    entityType: input.entityType,
    entityId: input.entityId,
    actorId: userId,
    actorName: "Contractor workspace",
    action: "linked_private_document",
    summary: "Private evidence linked to service case.",
  })

  return mapCaseDocumentLink(requirePlatformRow("case_document_links", data))
}

export async function markServiceFeePaidSupabase(
  admin: User,
  input: MarkServiceFeePaidInput,
): Promise<ServiceFeeOrder> {
  const now = new Date().toISOString()
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("service_fee_orders")
    .update({
      status: "paid",
      paid_at: now,
    })
    .eq("id", input.orderId)
    .select("*")
    .single()

  platformTableError("service_fee_orders", error)
  const order = mapServiceFeeOrder(requirePlatformRow("service_fee_orders", data))

  if (order.kind === "managed_recovery") {
    const { error: caseError } = await supabase
      .from("managed_recovery_cases")
      .update({
        status: "submitted",
        service_fee_order_id: order.id,
        fee_paid_at: now,
        submitted_for_review_at: now,
        readiness_status: "submitted",
        next_action: "Service fee is paid. Resolution Desk can begin private document review and factual outreach.",
      })
      .eq("id", order.entityId)
      .eq("contractor_id", order.contractorId)

    platformTableError("managed_recovery_cases", caseError)
  } else {
    const { data: lienData } = await supabase
      .from("florida_lien_cases")
      .select("contractor_signed_at")
      .eq("id", order.entityId)
      .eq("contractor_id", order.contractorId)
      .maybeSingle()
    const { error: caseError } = await supabase
      .from("florida_lien_cases")
      .update({
        status: lienData?.contractor_signed_at ? "attorney_vendor_review" : "contractor_signature_required",
        service_fee_order_id: order.id,
        fee_paid_at: now,
        submitted_for_review_at: now,
        readiness_status: "submitted",
        next_action: lienData?.contractor_signed_at
          ? "Service fee is paid. Attorney/vendor review can verify documents, deadlines, and recording requirements."
          : "Service fee is paid. Contractor signature and authorization are required before attorney/vendor review.",
      })
      .eq("id", order.entityId)
      .eq("contractor_id", order.contractorId)

    platformTableError("florida_lien_cases", caseError)
  }

  await logCaseAudit({
    entityType: "service_fee",
    entityId: order.id,
    actorId: admin.id,
    actorName: admin.fullName,
    action: "fee_paid",
    summary: "Service fee marked paid and related service case moved forward.",
  })

  return order
}

export async function logResolutionDeskContactSupabase(admin: User, input: ResolutionDeskContactInput) {
  const supabase = createServiceClient()
  const { data: existing, error: existingError } = await supabase
    .from("managed_recovery_cases")
    .select("*")
    .eq("id", input.caseId)
    .single()

  platformTableError("managed_recovery_cases", existingError)
  const recoveryCase = requirePlatformRow("managed_recovery_cases", existing)
  const { data, error } = await supabase
    .from("recovery_communications")
    .insert({
      managed_recovery_case_id: input.caseId,
      contractor_id: recoveryCase.contractor_id,
      channel: input.channel,
      direction: input.direction,
      subject: input.subject,
      note: input.note,
      outcome: input.outcome,
      contacted_at: input.contactedAt,
      logged_by_name: admin.fullName,
    })
    .select("*")
    .single()

  platformTableError("recovery_communications", error)
  const { error: updateError } = await supabase
    .from("managed_recovery_cases")
    .update({
      status: input.outcome === "client_responded" || input.outcome === "dispute_raised" ? "client_responded" : "contact_in_progress",
      next_action: input.outcome === "payment_promised"
        ? "Track the contractor-direct payment promise and confirm payment records."
        : "Continue documented Resolution Desk follow-up and update the case timeline.",
      assigned_to_name: admin.fullName,
    })
    .eq("id", input.caseId)

  platformTableError("managed_recovery_cases", updateError)
  await logCaseAudit({
    entityType: "managed_recovery",
    entityId: input.caseId,
    actorId: admin.id,
    actorName: admin.fullName,
    action: "contact_logged",
    summary: `${input.channel} contact logged for Resolution Desk case.`,
  })

  return mapRecoveryCommunication(requirePlatformRow("recovery_communications", data))
}

export async function markRecoveryResolvedSupabase(admin: User, input: MarkRecoveryResolvedInput) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("managed_recovery_cases")
    .update({
      status: "resolved",
      summary: input.resolutionSummary,
      next_action: "Confirm contractor-direct payment records and close the case when documentation is complete.",
    })
    .eq("id", input.caseId)
    .select("*")
    .single()

  platformTableError("managed_recovery_cases", error)
  await logCaseAudit({
    entityType: "managed_recovery",
    entityId: input.caseId,
    actorId: admin.id,
    actorName: admin.fullName,
    action: "resolved",
    summary: `Managed recovery marked resolved for $${input.amountResolved.toLocaleString()}.`,
  })

  return mapManagedRecoveryCase(requirePlatformRow("managed_recovery_cases", data))
}

export async function createLienNoticeDraftSupabase(userId: string, input: LienNoticeDraftInput) {
  const contractorId = await requireContractorIdForUser(userId)
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("lien_notice_drafts")
    .insert({
      contractor_id: contractorId,
      client_name: input.clientName,
      project_type: input.projectType,
      property_city: input.propertyCity,
      state: input.state.toUpperCase(),
      amount_due: input.amountDue,
      last_work_date: input.lastWorkDate,
      target_send_date: input.targetSendDate || null,
      status: "deadline_review",
      required_review: true,
      next_step: "Review state-specific deadline, notice recipient, delivery method, and contract terms before sending.",
      jurisdiction_note:
        "Mechanics lien and notice requirements vary by state, role, project type, and deadline. This creates a readiness checklist only.",
    })
    .select("*")
    .single()

  platformTableError("lien_notice_drafts", error)
  return mapLienNoticeDraft(requirePlatformRow("lien_notice_drafts", data))
}

export async function submitFloridaLienCaseSupabase(userId: string, input: FloridaLienCaseInput) {
  const contractorId = await requireContractorIdForUser(userId)
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("florida_lien_cases")
    .insert({
      contractor_id: contractorId,
      workflow_type: input.workflowType,
      client_name: input.clientName,
      owner_name: input.ownerName,
      property_county: input.propertyCounty,
      property_city: input.propertyCity,
      state: "FL",
      parcel_number: input.parcelNumber || null,
      legal_description: input.legalDescription || null,
      contractor_role: input.contractorRole,
      project_type: input.projectType,
      contract_amount: input.contractAmount,
      amount_due: input.amountDue,
      first_work_date: input.firstWorkDate || null,
      last_work_date: input.lastWorkDate,
      notice_history: input.noticeHistory,
      filing_deadline: input.filingDeadline || null,
      target_send_date: input.targetSendDate || null,
      status: "fee_due",
      delivery_method: input.deliveryMethod,
      filing_method: input.filingMethod,
      recording_vendor: input.recordingVendor || null,
      attorney_vendor_status: "not_started",
      next_action: "Pay the service fee, attach required documents, and sign authorization before attorney/vendor review.",
      private_summary: input.privateSummary,
    })
    .select("*")
    .single()

  platformTableError("florida_lien_cases", error)
  const lienCase = mapFloridaLienCase(requirePlatformRow("florida_lien_cases", data))
  await logCaseAudit({
    entityType: "florida_lien",
    entityId: lienCase.id,
    actorId: userId,
    actorName: "Contractor workspace",
    action: "submitted",
    summary: "Florida lien service case submitted with private property and payment details.",
  })

  return lienCase
}

export async function signLienFilingAuthorizationSupabase(userId: string, input: LienFilingAuthorizationInput) {
  await requireContractorIdForUser(userId)
  const supabase = createServiceClient()
  const signedAt = new Date().toISOString()
  const { data, error } = await supabase
    .from("florida_lien_cases")
    .update({
      status: "attorney_vendor_review",
      contractor_signed_at: signedAt,
      contractor_signature_name: input.signerName,
      attorney_vendor_status: "queued",
      next_action: "Authorization received. Attorney/vendor review can verify eligibility, deadlines, recipients, and recording details.",
    })
    .eq("id", input.caseId)
    .select("*")
    .single()

  platformTableError("florida_lien_cases", error)
  await logCaseAudit({
    entityType: "florida_lien",
    entityId: input.caseId,
    actorId: userId,
    actorName: input.signerName,
    action: "contractor_authorized",
    summary: `Contractor authorized Florida lien workflow as ${input.authorityTitle}.`,
  })

  return mapFloridaLienCase(requirePlatformRow("florida_lien_cases", data))
}

async function updateFloridaLienCaseSupabase(admin: User, input: AdminLienCaseActionInput, updates: Partial<FloridaLienCaseRow>, action: string) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("florida_lien_cases")
    .update(updates)
    .eq("id", input.caseId)
    .select("*")
    .single()

  platformTableError("florida_lien_cases", error)
  await logCaseAudit({
    entityType: "florida_lien",
    entityId: input.caseId,
    actorId: admin.id,
    actorName: admin.fullName,
    action,
    summary: input.decisionNote,
  })

  return mapFloridaLienCase(requirePlatformRow("florida_lien_cases", data))
}

export async function adminRequestLienMoreInfoSupabase(admin: User, input: AdminLienCaseActionInput) {
  return updateFloridaLienCaseSupabase(admin, input, {
    status: "needs_more_info",
    attorney_vendor_status: "in_review",
    next_action: `More information requested: ${input.decisionNote}`,
  }, "more_info_requested")
}

export async function adminApproveLienNoticeSupabase(admin: User, input: AdminLienCaseActionInput) {
  return updateFloridaLienCaseSupabase(admin, input, {
    status: "approved_to_send",
    attorney_vendor_status: "approved",
    next_action: `Notice packet approved to send after review: ${input.decisionNote}`,
  }, "notice_approved")
}

export async function adminApproveLienFilingSupabase(admin: User, input: AdminLienCaseActionInput) {
  const supabase = createServiceClient()
  const { data: existing, error: existingError } = await supabase
    .from("florida_lien_cases")
    .select("*")
    .eq("id", input.caseId)
    .single()

  platformTableError("florida_lien_cases", existingError)
  if (!existing?.contractor_signed_at) {
    throw new Error("Contractor signature is required before approving a Florida lien filing.")
  }

  return updateFloridaLienCaseSupabase(admin, input, {
    status: "approved_to_file",
    attorney_vendor_status: "approved",
    next_action: `Claim of lien filing approved for attorney/vendor submission: ${input.decisionNote}`,
  }, "filing_approved")
}

export async function adminRecordLienFiledSupabase(admin: User, input: AdminRecordLienFiledInput) {
  const supabase = createServiceClient()
  const { data: existing, error: existingError } = await supabase
    .from("florida_lien_cases")
    .select("*")
    .eq("id", input.caseId)
    .single()

  platformTableError("florida_lien_cases", existingError)
  const lienCase = requirePlatformRow("florida_lien_cases", existing)
  const { data, error } = await supabase
    .from("lien_filing_records")
    .insert({
      florida_lien_case_id: input.caseId,
      contractor_id: lienCase.contractor_id,
      filing_method: input.filingMethod,
      recording_vendor: input.recordingVendor || null,
      clerk_county: input.clerkCounty,
      clerk_reference: input.clerkReference || null,
      official_record_book: input.officialRecordBook || null,
      official_record_page: input.officialRecordPage || null,
      instrument_number: input.instrumentNumber || null,
      filed_at: input.filedAt,
      filing_receipt_path: input.filingReceiptPath || null,
      status: "filed",
    })
    .select("*")
    .single()

  platformTableError("lien_filing_records", error)
  const { error: updateCaseError } = await supabase
    .from("florida_lien_cases")
    .update({
      status: "filed",
      next_action: "Upload recording confirmation when the county/vendor returns recording proof.",
    })
    .eq("id", input.caseId)

  platformTableError("florida_lien_cases", updateCaseError)
  await logCaseAudit({
    entityType: "florida_lien",
    entityId: input.caseId,
    actorId: admin.id,
    actorName: admin.fullName,
    action: "filed",
    summary: "Lien filing record captured with clerk/vendor reference details.",
  })

  return mapLienFilingRecord(requirePlatformRow("lien_filing_records", data))
}

export async function adminUploadRecordingProofSupabase(admin: User, input: AdminUploadRecordingProofInput) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("lien_filing_records")
    .update({
      recording_confirmed_at: input.recordingConfirmedAt,
      official_record_book: input.officialRecordBook || null,
      official_record_page: input.officialRecordPage || null,
      instrument_number: input.instrumentNumber,
      status: "recording_confirmed",
    })
    .eq("id", input.filingRecordId)
    .select("*")
    .single()

  platformTableError("lien_filing_records", error)
  const filingRecord = requirePlatformRow("lien_filing_records", data)
  const { error: caseError } = await supabase
    .from("florida_lien_cases")
    .update({
      status: "recording_confirmed",
      next_action: "Monitor resolution and prepare release/satisfaction if payment or settlement requires it.",
    })
    .eq("id", filingRecord.florida_lien_case_id)

  platformTableError("florida_lien_cases", caseError)
  await logCaseAudit({
    entityType: "florida_lien",
    entityId: filingRecord.florida_lien_case_id,
    actorId: admin.id,
    actorName: admin.fullName,
    action: "recording_confirmed",
    summary: input.proofSummary,
  })

  return mapLienFilingRecord(filingRecord)
}

export async function adminRecordLienReleaseSupabase(admin: User, input: AdminRecordLienReleaseInput) {
  const supabase = createServiceClient()
  const { data: existing, error: existingError } = await supabase
    .from("florida_lien_cases")
    .select("*")
    .eq("id", input.caseId)
    .single()

  platformTableError("florida_lien_cases", existingError)
  const lienCase = requirePlatformRow("florida_lien_cases", existing)
  const { data, error } = await supabase
    .from("lien_release_records")
    .insert({
      florida_lien_case_id: input.caseId,
      contractor_id: lienCase.contractor_id,
      release_reason: input.releaseReason,
      release_status: input.releaseStatus,
      release_recorded_at: input.releaseRecordedAt || null,
      release_instrument_number: input.releaseInstrumentNumber || null,
      notes: input.notes,
    })
    .select("*")
    .single()

  platformTableError("lien_release_records", error)
  const { error: caseError } = await supabase
    .from("florida_lien_cases")
    .update({
      status: input.releaseStatus === "recorded" ? "released" : "release_pending",
      next_action: input.releaseStatus === "recorded"
        ? "Release recorded. Close the case after final audit review."
        : "Release workflow is pending signature, recording, or review.",
    })
    .eq("id", input.caseId)

  platformTableError("florida_lien_cases", caseError)
  await logCaseAudit({
    entityType: "florida_lien",
    entityId: input.caseId,
    actorId: admin.id,
    actorName: admin.fullName,
    action: "release_recorded",
    summary: input.notes,
  })

  return mapLienReleaseRecord(requirePlatformRow("lien_release_records", data))
}

export async function createContractWorkspaceItemSupabase(userId: string, input: ContractWorkspaceItemInput) {
  const contractorId = await requireContractorIdForUser(userId)
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("contract_workspace_items")
    .insert({
      contractor_id: contractorId,
      client_name: input.clientName,
      project_type: input.projectType,
      template_type: input.templateType,
      contract_value: input.contractValue,
      deposit_required: input.depositRequired,
      milestone_billing: Boolean(input.milestoneBilling),
      status: "draft",
      next_step: contractWorkspaceNextStep(input),
      summary: input.summary,
    })
    .select("*")
    .single()

  platformTableError("contract_workspace_items", error)
  return mapContractWorkspaceItem(requirePlatformRow("contract_workspace_items", data))
}

export async function createClientPipelineItemSupabase(userId: string, input: ClientPipelineItemInput) {
  const contractorId = await requireContractorIdForUser(userId)
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("client_pipeline_items")
    .insert({
      contractor_id: contractorId,
      client_profile_id: input.clientId || null,
      client_name: input.clientName,
      city: input.city,
      state: input.state.toUpperCase(),
      stage: input.stage,
      priority: input.priority,
      estimated_value: input.estimatedValue,
      next_action: input.nextAction,
      due_at: input.dueAt || null,
      private_match: Boolean(input.privateMatch),
    })
    .select("*")
    .single()

  platformTableError("client_pipeline_items", error)
  return mapClientPipelineItem(requirePlatformRow("client_pipeline_items", data))
}

export async function updateClientPipelineStageSupabase(userId: string, input: UpdateClientPipelineStageInput) {
  const contractorId = await requireContractorIdForUser(userId)
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("client_pipeline_items")
    .update({
      stage: input.stage,
      next_action:
        input.stage === "closed"
          ? "Archive final project records and any resolution context."
          : "Review the next client intake step.",
    })
    .eq("id", input.itemId)
    .eq("contractor_id", contractorId)
    .select("*")
    .single()

  platformTableError("client_pipeline_items", error)
  return mapClientPipelineItem(requirePlatformRow("client_pipeline_items", data))
}

export async function createClientRiskRoomSupabase(userId: string, input: ClientRiskRoomInput) {
  const contractorId = await requireContractorIdForUser(userId)
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("client_risk_rooms")
    .insert({
      contractor_id: contractorId,
      client_profile_id: input.clientId || null,
      client_name: input.clientName,
      city: input.city,
      state: input.state.toUpperCase(),
      headline: input.headline,
      summary: input.summary,
    })
    .select("*")
    .single()

  platformTableError("client_risk_rooms", error)
  return mapClientRiskRoom(requirePlatformRow("client_risk_rooms", data))
}

export async function logPaymentRecoveryAttemptSupabase(userId: string, input: PaymentRecoveryAttemptInput) {
  const contractorId = await requireContractorIdForUser(userId)
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("payment_recovery_attempts")
    .insert({
      contractor_id: contractorId,
      recovery_case_id: input.recoveryCaseId,
      channel: input.channel,
      attempted_at: input.attemptedAt,
      outcome: input.outcome,
      note: input.note,
      next_follow_up_at: input.nextFollowUpAt || null,
    })
    .select("*")
    .single()

  platformTableError("payment_recovery_attempts", error)
  return mapPaymentRecoveryAttempt(requirePlatformRow("payment_recovery_attempts", data))
}

export async function createPaymentPlanSupabase(userId: string, input: PaymentPlanInput) {
  const contractorId = await requireContractorIdForUser(userId)
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("payment_plans")
    .insert({
      contractor_id: contractorId,
      recovery_case_id: input.recoveryCaseId,
      total_amount: input.totalAmount,
      installment_amount: input.installmentAmount,
      due_day: input.dueDay,
      status: input.status,
      next_due_date: input.nextDueDate || null,
      notes: input.notes,
    })
    .select("*")
    .single()

  platformTableError("payment_plans", error)
  return mapPaymentPlan(requirePlatformRow("payment_plans", data))
}

export async function createContractPacketSupabase(userId: string, input: ContractPacketInput) {
  const contractorId = await requireContractorIdForUser(userId)
  const agreement = agreementDefaults(input)
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("contract_packets")
    .insert({
      contractor_id: contractorId,
      client_name: input.clientName,
      client_legal_name: input.clientLegalName || null,
      contractor_legal_name: input.contractorLegalName || null,
      project_type: input.projectType,
      template_type: input.templateType,
      status: input.requiredBeforeScheduling ? "review_ready" : "draft",
      packet_value: input.packetValue,
      deposit_required: input.depositRequired,
      milestone_count: input.milestoneCount,
      required_before_scheduling: Boolean(input.requiredBeforeScheduling),
      scope_summary: agreement.scopeSummary,
      included_work: agreement.includedWork,
      excluded_work: agreement.excludedWork,
      payment_terms: agreement.paymentTerms,
      milestone_schedule: agreement.milestoneSchedule as unknown as Tables["contract_packets"]["Insert"]["milestone_schedule"],
      change_order_policy: agreement.changeOrderPolicy,
      cancellation_policy: agreement.cancellationPolicy,
      project_start_date: input.projectStartDate || null,
      project_end_date: input.projectEndDate || null,
      next_action: input.nextAction,
    })
    .select("*")
    .single()

  platformTableError("contract_packets", error)
  return mapContractPacket(requirePlatformRow("contract_packets", data))
}

export async function updateContractPacketStatusSupabase(userId: string, input: UpdateContractPacketStatusInput) {
  const contractorId = await requireContractorIdForUser(userId)
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("contract_packets")
    .update({ status: input.status })
    .eq("id", input.packetId)
    .eq("contractor_id", contractorId)
    .select("*")
    .single()

  platformTableError("contract_packets", error)
  return mapContractPacket(requirePlatformRow("contract_packets", data))
}

export async function createContractShareLinkSupabase(userId: string, input: ContractShareLinkInput) {
  const contractorId = await requireContractorIdForUser(userId)
  const supabase = createServiceClient()
  const { data: existing, error: existingError } = await supabase
    .from("contract_packets")
    .select("*")
    .eq("id", input.packetId)
    .eq("contractor_id", contractorId)
    .single()

  platformTableError("contract_packets", existingError)

  const existingRow = requirePlatformRow("contract_packets", existing)
  const base = mapContractPacket(existingRow)
  const token = base.shareToken ?? contractShareToken(base)
  const paymentMode = input.paymentMode ?? "none"
  const { data, error } = await supabase
    .from("contract_packets")
    .update({
      status: "sent",
      share_token: token,
      share_url: contractSharePath(token),
      client_email_hash: hashIdentifier(input.clientEmail),
      client_email_masked: maskEmail(input.clientEmail),
      client_invite_status: input.inviteClient ? "invited" : "not_invited",
      signature_status: "awaiting_client",
      share_status: "sent",
      payment_mode: paymentMode,
      payment_summary: contractPaymentSummary(base, input),
      next_action:
        "Private signing link prepared. Send it to the client, then track view, signature, and payment coordination status.",
    })
    .eq("id", input.packetId)
    .eq("contractor_id", contractorId)
    .select("*")
    .single()

  platformTableError("contract_packets", error)
  const row = requirePlatformRow("contract_packets", data)

  await logAdminAction({
    actorId: userId,
    actorName: "Contractor workspace",
    action: "created_contract_share_link",
    entityType: "contract_packet",
    entityId: row.id,
    summary: "Private contract signing link prepared for client review.",
  })

  return mapContractPacket(row)
}

export async function getContractPacketByShareTokenSupabase(token: string) {
  const supabase = createServiceClient()
  const { data, error } = await supabase.from("contract_packets").select("*").eq("share_token", token).maybeSingle()

  platformTableError("contract_packets", error)
  if (!data) return undefined

  if (data.share_status === "sent") {
    await supabase.from("contract_packets").update({ share_status: "viewed" }).eq("id", data.id)
    return mapContractPacket({ ...data, share_status: "viewed" })
  }

  return mapContractPacket(data)
}

export async function signContractShareSupabase(
  input: ContractSignatureInput,
  audit?: ContractSignatureAuditInput,
) {
  const supabase = createServiceClient()
  const existing = await getContractPacketByShareTokenSupabase(input.shareToken)

  if (!existing) {
    throw new Error("Contract signing link was not found.")
  }

  const signed = buildSignedContractSnapshot(existing, input, audit)
  const shareStatus = existing.paymentMode && existing.paymentMode !== "none" ? "payment_pending" : "signed"
  const { data, error } = await supabase
    .from("contract_packets")
    .update({
      status: "signed",
      client_email_hash: hashIdentifier(input.signerEmail),
      client_email_masked: existing.clientEmailMasked ?? maskEmail(input.signerEmail),
      client_invite_status: "joined",
      signature_status: "client_signed",
      share_status: shareStatus,
      client_signed_at: signed.signedRecordAt,
      signer_name: signed.signerName,
      signature_name_hash: signed.signatureNameHash,
      signer_email_hash: signed.signerEmailHash,
      signer_ip_hash: signed.signerIpHash ?? null,
      signer_user_agent_hash: signed.signerUserAgentHash ?? null,
      signed_snapshot: signed.signedSnapshot as unknown as Tables["contract_packets"]["Update"]["signed_snapshot"],
      signed_digest: signed.signedDigest,
      signed_recorded_at: signed.signedRecordAt,
      next_action:
        "Client signature recorded. Contractor should countersign, store the final agreement, and confirm payment timing before work starts.",
    })
    .eq("id", existing.id)
    .select("*")
    .single()

  platformTableError("contract_packets", error)
  const row = requirePlatformRow("contract_packets", data)

  await logAdminAction({
    actorName: input.signerName,
    action: "client_signed_contract",
    entityType: "contract_packet",
    entityId: existing.id,
    summary: "Client signature recorded on private contract signing link.",
    metadata: {
      signer_email_hash: hashIdentifier(input.signerEmail),
      signed_digest: signed.signedDigest,
      share_token: input.shareToken,
    },
  })

  return mapContractPacket(row)
}

export async function updateEvidenceVaultStatusSupabase(userId: string, input: UpdateEvidenceVaultStatusInput) {
  const contractorId = await requireContractorIdForUser(userId)
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("evidence_vault_items")
    .update({ status: input.status })
    .eq("id", input.evidenceId)
    .eq("contractor_id", contractorId)
    .select("*")
    .single()

  platformTableError("evidence_vault_items", error)
  return mapEvidenceVaultItem(requirePlatformRow("evidence_vault_items", data))
}

export async function saveAdminQueueViewSupabase(admin: User, input: AdminSavedViewInput) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("admin_saved_views")
    .insert({
      scope: input.scope,
      name: input.name,
      filters: { summary: input.filterSummary },
      is_default: Boolean(input.isDefault),
      created_by: admin.id,
    })
    .select("*")
    .single()

  platformTableError("admin_saved_views", error)
  const row = requirePlatformRow("admin_saved_views", data)

  await logAdminAction({
    actorId: admin.id,
    actorName: admin.fullName,
    action: "saved_admin_queue_view",
    entityType: "saved_view",
    entityId: row.id,
    summary: `Saved admin queue view ${input.name}.`,
  })

  return mapAdminSavedView(row)
}

export async function reviewRecoveryComplianceSupabase(admin: User, input: RecoveryComplianceReviewInput) {
  const supabase = createServiceClient()
  const requiredChanges = (input.requiredChanges ?? "")
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
  const { data, error } = await supabase
    .from("recovery_compliance_reviews")
    .insert({
      recovery_case_id: input.recoveryCaseId || null,
      lien_notice_draft_id: input.lienNoticeDraftId || null,
      contract_packet_id: input.contractPacketId || null,
      reviewer_id: admin.id,
      status: input.status,
      decision_reason: input.decisionReason,
      required_changes: requiredChanges,
      public_visibility_allowed: Boolean(input.publicVisibilityAllowed),
    })
    .select("*")
    .single()

  platformTableError("recovery_compliance_reviews", error)
  const row = requirePlatformRow("recovery_compliance_reviews", data)

  await logAdminAction({
    actorId: admin.id,
    actorName: admin.fullName,
    action: "reviewed_recovery_compliance",
    entityType: "compliance_review",
    entityId: row.id,
    summary: `Compliance review marked ${input.status.replaceAll("_", " ")}.`,
  })

  return mapRecoveryComplianceReview(row)
}

export async function assignModerationCaseSupabase(caseId: string, admin: User, assignedTo: string) {
  const supabase = createServiceClient()
  const { data: assignedUser } = await supabase.from("users").select("*").eq("id", assignedTo).maybeSingle()
  const assignedToName = assignedUser?.full_name ?? "Review Team"
  const dueAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from("moderation_cases")
    .update({ assigned_to: assignedTo, status: "assigned" })
    .eq("id", caseId)
    .select("*")
    .single()

  platformTableError("moderation_cases", error)
  const row = requirePlatformRow("moderation_cases", data)

  await supabase.from("admin_queue_assignments").insert({
    entity_type: "reports",
    entity_id: caseId,
    assigned_to: assignedTo,
    assigned_to_name: assignedToName,
    priority: row.priority,
    due_at: dueAt,
    status: "open",
  })

  await logAdminAction({
    actorId: admin.id,
    actorName: admin.fullName,
    action: "assigned_moderation_case",
    entityType: "assignment",
    entityId: caseId,
    summary: `Moderation case assigned to ${assignedToName}.`,
  })

  return mapModerationCase(row, assignedToName)
}

export async function updateModerationCaseSupabase(
  caseId: string,
  admin: User,
  priority: ModerationPriority,
  status: ModerationCaseStatus,
  escalationNote?: string,
) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("moderation_cases")
    .update({ priority, status, escalation_note: escalationNote ?? null })
    .eq("id", caseId)
    .select("*")
    .single()

  platformTableError("moderation_cases", error)
  const row = requirePlatformRow("moderation_cases", data)

  await logAdminAction({
    actorId: admin.id,
    actorName: admin.fullName,
    action: "updated_moderation_case",
    entityType: "report",
    entityId: caseId,
    summary: `Moderation case updated to ${status}.`,
  })

  return mapModerationCase(row)
}

export async function setModerationDecisionReasonSupabase(
  caseId: string,
  admin: User,
  decisionReason: ModerationDecisionReason,
  moderatorNote?: string,
) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("moderation_cases")
    .update({ decision_reason: decisionReason, escalation_note: moderatorNote ?? null })
    .eq("id", caseId)
    .select("*")
    .single()

  platformTableError("moderation_cases", error)
  const row = requirePlatformRow("moderation_cases", data)

  await logAdminAction({
    actorId: admin.id,
    actorName: admin.fullName,
    action: "set_moderation_decision_reason",
    entityType: "report",
    entityId: caseId,
    summary: `Decision reason set to ${decisionReason.replaceAll("_", " ")}.`,
  })

  return mapModerationCase(row)
}
