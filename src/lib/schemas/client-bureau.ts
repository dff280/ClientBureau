import { z } from "zod"

import { reportCategories, riskLevels } from "@/lib/types"

export const discussionCategories = [
  "Contractor Experience",
  "Client Response",
  "Resolution Update",
  "Supporting Context",
  "Dispute / Correction",
  "Reference / Verification",
] as const

const requiredText = (label: string, min = 2) =>
  z
    .string()
    .trim()
    .min(min, `${label} is required.`)

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))

const money = (label: string) =>
  z.coerce
    .number({ error: `${label} must be a number.` })
    .min(0, `${label} cannot be negative.`)
    .max(10_000_000, `${label} is above the current review limit.`)

export const clientReportSchema = z
  .object({
    firstName: requiredText("Client first name"),
    lastName: requiredText("Client last name"),
    businessName: optionalText,
    email: z.email("Enter a valid email for private matching.").optional().or(z.literal("")),
    phone: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value ? value : undefined)),
    city: requiredText("Client city"),
    state: requiredText("Client state", 2).max(2, "Use a two-letter state abbreviation."),
    projectType: requiredText("Project type"),
    projectCity: requiredText("Project city"),
    projectState: requiredText("Project state", 2).max(2, "Use a two-letter state abbreviation."),
    contractAmount: money("Contract amount"),
    amountUnpaid: money("Amount unpaid"),
    reportCategory: z.enum(reportCategories),
    paymentStatus: requiredText("Payment status"),
    reportSummary: requiredText("Public report summary", 20).max(
      600,
      "Keep the public summary under 600 characters.",
    ),
    detailedExperience: requiredText("Detailed experience", 40).max(
      3000,
      "Keep the detailed experience under 3,000 characters.",
    ),
    evidenceAttached: z.coerce.boolean().optional(),
    truthfulCertification: z.coerce.boolean().optional(),
    documentationCertification: z.coerce.boolean().optional(),
    publicSummaryCertification: z.coerce.boolean().optional(),
  })
  .refine((value) => value.amountUnpaid <= value.contractAmount, {
    path: ["amountUnpaid"],
    message: "Amount unpaid cannot exceed the contract amount.",
  })
  .refine((value) => value.truthfulCertification === true, {
    path: ["truthfulCertification"],
    message: "Confirm that the report is truthful to the best of your knowledge.",
  })
  .refine((value) => value.documentationCertification === true, {
    path: ["documentationCertification"],
    message: "Confirm that documentation is available or accurately described.",
  })
  .refine((value) => value.publicSummaryCertification === true, {
    path: ["publicSummaryCertification"],
    message: "Confirm that the public summary avoids private or inflammatory claims.",
  })

export const clientResponseSchema = z.object({
  name: requiredText("Your name"),
  email: z.email("Enter a valid email for review contact."),
  phone: optionalText,
  profileUrl: requiredText("Profile URL", 6),
  requestType: z.enum(["Publish a response", "Dispute a report", "Request correction", "Resolution update"]),
  verificationMethod: z.enum(["Email verification", "Phone verification", "Business documentation"]).optional(),
  attachmentUrl: optionalText,
  responseSummary: requiredText("Response summary", 30).max(
    1800,
    "Keep the response summary under 1,800 characters.",
  ),
  contactCertification: z.coerce.boolean().optional(),
  documentationCertification: z.coerce.boolean().optional(),
}).refine((value) => value.contactCertification === true, {
  path: ["contactCertification"],
  message: "Confirm that your contact information is accurate for moderation follow-up.",
}).refine((value) => value.documentationCertification === true, {
  path: ["documentationCertification"],
  message: "Confirm that any submitted documentation is accurate and relevant.",
})

export const signupSchema = z.object({
  fullName: requiredText("Full name"),
  email: z.email("Enter a valid email."),
  password: requiredText("Password", 8),
  businessName: requiredText("Business name"),
  trade: requiredText("Trade"),
  city: requiredText("City"),
  state: requiredText("State", 2).max(2, "Use a two-letter state abbreviation."),
})

export const loginSchema = z.object({
  email: z.email("Enter a valid email."),
  password: requiredText("Password", 6),
})

export const adminReviewSchema = z.object({
  reportId: requiredText("Report ID"),
  decision: z.enum(["approved", "rejected"]),
  editedPublicSummary: requiredText("Edited public summary", 20).max(
    700,
    "Keep the edited public summary under 700 characters.",
  ),
  checklistEvidence: z.coerce.boolean().optional(),
  checklistNeutral: z.coerce.boolean().optional(),
  checklistPrivate: z.coerce.boolean().optional(),
})

export const bulkAdminReviewSchema = z.object({
  reportIds: z
    .string()
    .trim()
    .min(1, "Select at least one report.")
    .transform((value) => value.split(",").map((item) => item.trim()).filter(Boolean)),
  decision: z.enum(["approved", "rejected", "deleted"]),
})

export const communityDiscussionSchema = z
  .object({
    profileSlug: requiredText("Profile", 3),
    reportId: optionalText,
    name: requiredText("Name"),
    email: z.email("Enter a valid email for moderation contact."),
    relationshipCategory: z.enum(discussionCategories),
    commentBody: requiredText("Comment", 30).max(
      1800,
      "Keep the public discussion comment under 1,800 characters.",
    ),
    attachmentUrl: optionalText,
    truthfulCertification: z.coerce.boolean().optional(),
  })
  .refine((value) => value.truthfulCertification === true, {
    path: ["truthfulCertification"],
    message: "Confirm that the submission is truthful to the best of your knowledge.",
  })

export const adminDiscussionReviewSchema = z.object({
  discussionId: requiredText("Discussion ID"),
  decision: z.enum(["approved", "rejected", "deleted", "verified"]),
  moderatorNote: z.string().trim().max(700).optional(),
})

export const adminClientUpdateSchema = z.object({
  clientId: requiredText("Client ID"),
  firstName: requiredText("First name"),
  lastName: requiredText("Last name"),
  businessName: optionalText,
  city: requiredText("City"),
  state: requiredText("State", 2).max(2, "Use a two-letter state abbreviation."),
  riskLevel: z.enum(riskLevels),
  clientBureauScore: z.coerce.number().min(0).max(100),
  isPublic: z.coerce.boolean().optional(),
  moderatorNote: z.string().trim().max(700).optional(),
})

export const adminContractorUpdateSchema = z.object({
  contractorId: requiredText("Contractor ID"),
  businessName: requiredText("Business name"),
  trade: requiredText("Trade"),
  city: requiredText("City"),
  state: requiredText("State", 2).max(2, "Use a two-letter state abbreviation."),
  verificationStatus: z.enum(["unverified", "pending", "verified"]),
  moderatorNote: z.string().trim().max(700).optional(),
})

export const adminDeleteRecordSchema = z.object({
  entityType: z.enum(["client", "contractor", "report", "discussion"]),
  entityId: requiredText("Record ID"),
})

export const bulkUploadImportSchema = z.object({
  rows: z.string().trim().min(2, "Upload preview rows before importing."),
})

export const searchSchema = z.object({
  query: z.string().trim().optional().default(""),
  state: z.string().trim().max(2).optional(),
  riskLevel: z.enum(riskLevels).optional(),
  category: z.enum(reportCategories).optional(),
})

export const watchlistItemSchema = z.object({
  clientId: requiredText("Client ID"),
  watchReason: requiredText("Watch reason", 12).max(240, "Keep the watch reason under 240 characters."),
  alertLevel: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
})

export const updateWatchlistItemSchema = z.object({
  itemId: requiredText("Watchlist item ID"),
  status: z.enum(["active", "cleared"]),
})

export const reportDraftSchema = z.object({
  draftId: optionalText,
  clientId: optionalText,
  clientName: requiredText("Client name"),
  projectType: requiredText("Project type"),
  estimatedValue: money("Estimated project value"),
  amountAtRisk: money("Amount at risk"),
  summary: requiredText("Draft summary", 20).max(700, "Keep the draft summary under 700 characters."),
  nextStep: requiredText("Next step", 8).max(240, "Keep the next step under 240 characters."),
  status: z.enum(["draft", "ready_to_submit", "submitted"]).default("draft"),
}).refine((value) => value.amountAtRisk <= value.estimatedValue, {
  path: ["amountAtRisk"],
  message: "Amount at risk cannot exceed the estimated project value.",
})

export const deleteReportDraftSchema = z.object({
  draftId: requiredText("Draft ID"),
})

export const intakeAssessmentSchema = z.object({
  clientName: requiredText("Client name"),
  city: requiredText("City"),
  state: requiredText("State", 2).max(2, "Use a two-letter state abbreviation."),
  projectValue: money("Project value"),
  depositReceived: z.coerce.boolean().optional(),
  contractSigned: z.coerce.boolean().optional(),
  privateMatchConfirmed: z.coerce.boolean().optional(),
  notes: z.string().trim().max(700).optional(),
})

export const paymentRecoveryCaseSchema = z.object({
  clientName: requiredText("Client name"),
  city: requiredText("City"),
  state: requiredText("State", 2).max(2, "Use a two-letter state abbreviation."),
  amountDue: money("Amount due"),
  invoiceAgeDays: z.coerce
    .number({ error: "Invoice age must be a number." })
    .int("Invoice age must be a whole number.")
    .min(0, "Invoice age cannot be negative.")
    .max(3650, "Invoice age is above the current workflow limit."),
  preferredChannel: z.enum(["email", "phone", "letter", "client_portal"]),
  summary: requiredText("Recovery summary", 20).max(900, "Keep the recovery summary under 900 characters."),
  factualCertification: z.coerce.boolean().optional(),
}).refine((value) => value.factualCertification === true, {
  path: ["factualCertification"],
  message: "Confirm that the recovery record is based on accurate invoice and project documentation.",
})

export const lienNoticeDraftSchema = z.object({
  clientName: requiredText("Client name"),
  projectType: requiredText("Project type"),
  propertyCity: requiredText("Property city"),
  state: requiredText("State", 2).max(2, "Use a two-letter state abbreviation."),
  amountDue: money("Amount due"),
  lastWorkDate: requiredText("Last work date", 8),
  targetSendDate: optionalText,
  reviewCertification: z.coerce.boolean().optional(),
}).refine((value) => value.reviewCertification === true, {
  path: ["reviewCertification"],
  message: "Confirm that state-specific lien and notice requirements will be reviewed before sending.",
})

export const contractWorkspaceItemSchema = z.object({
  clientName: requiredText("Client name"),
  projectType: requiredText("Project type"),
  templateType: z.enum([
    "service_agreement",
    "change_order",
    "payment_plan",
    "completion_certificate",
    "notice_of_nonpayment",
  ]),
  contractValue: money("Contract value"),
  depositRequired: money("Deposit required"),
  milestoneBilling: z.coerce.boolean().optional(),
  summary: requiredText("Contract summary", 20).max(900, "Keep the contract summary under 900 characters."),
}).refine((value) => value.depositRequired <= value.contractValue, {
  path: ["depositRequired"],
  message: "Deposit required cannot exceed the contract value.",
})

export const clientPipelineItemSchema = z.object({
  clientId: optionalText,
  clientName: requiredText("Client name"),
  city: requiredText("City"),
  state: requiredText("State", 2).max(2, "Use a two-letter state abbreviation."),
  stage: z.enum(["new_lead", "screening", "contract_pending", "active_job", "payment_follow_up", "closed"]),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  estimatedValue: money("Estimated value"),
  nextAction: requiredText("Next action", 8).max(240, "Keep the next action under 240 characters."),
  dueAt: optionalText,
  privateMatch: z.coerce.boolean().optional(),
})

export const updateClientPipelineStageSchema = z.object({
  itemId: requiredText("Pipeline item ID"),
  stage: z.enum(["new_lead", "screening", "contract_pending", "active_job", "payment_follow_up", "closed"]),
})

export const clientRiskRoomSchema = z.object({
  clientId: optionalText,
  clientName: requiredText("Client name"),
  city: requiredText("City"),
  state: requiredText("State", 2).max(2, "Use a two-letter state abbreviation."),
  headline: requiredText("Risk room headline", 8).max(160, "Keep the headline under 160 characters."),
  summary: requiredText("Risk room summary", 20).max(900, "Keep the summary under 900 characters."),
})

export const paymentRecoveryAttemptSchema = z.object({
  recoveryCaseId: requiredText("Recovery case ID"),
  channel: z.enum(["email", "phone", "letter", "client_portal"]),
  attemptedAt: requiredText("Attempt date", 8),
  outcome: z.enum([
    "no_response",
    "client_responded",
    "payment_promised",
    "payment_received",
    "dispute_raised",
    "needs_follow_up",
  ]),
  note: requiredText("Attempt note", 12).max(700, "Keep the attempt note under 700 characters."),
  nextFollowUpAt: optionalText,
})

export const paymentPlanSchema = z.object({
  recoveryCaseId: requiredText("Recovery case ID"),
  totalAmount: money("Total amount"),
  installmentAmount: money("Installment amount"),
  dueDay: z.coerce
    .number({ error: "Due day must be a number." })
    .int("Due day must be a whole number.")
    .min(1, "Due day must be between 1 and 31.")
    .max(31, "Due day must be between 1 and 31."),
  status: z.enum(["proposed", "accepted", "active", "completed", "missed", "paused"]).default("proposed"),
  nextDueDate: optionalText,
  notes: requiredText("Payment plan notes", 12).max(700, "Keep the notes under 700 characters."),
}).refine((value) => value.installmentAmount <= value.totalAmount, {
  path: ["installmentAmount"],
  message: "Installment amount cannot exceed the total amount.",
})

export const contractPacketSchema = z.object({
  clientName: requiredText("Client name"),
  projectType: requiredText("Project type"),
  templateType: z.enum([
    "service_agreement",
    "change_order",
    "payment_plan",
    "completion_certificate",
    "notice_of_nonpayment",
  ]),
  packetValue: money("Packet value"),
  depositRequired: money("Deposit required"),
  milestoneCount: z.coerce
    .number({ error: "Milestone count must be a number." })
    .int("Milestone count must be a whole number.")
    .min(0, "Milestone count cannot be negative.")
    .max(24, "Milestone count is above the current workflow limit."),
  requiredBeforeScheduling: z.coerce.boolean().optional(),
  nextAction: requiredText("Next action", 8).max(240, "Keep the next action under 240 characters."),
}).refine((value) => value.depositRequired <= value.packetValue, {
  path: ["depositRequired"],
  message: "Deposit required cannot exceed the packet value.",
})

export const updateContractPacketStatusSchema = z.object({
  packetId: requiredText("Contract packet ID"),
  status: z.enum(["draft", "review_ready", "sent", "signed", "expired", "archived"]),
})

export const updateEvidenceVaultStatusSchema = z.object({
  evidenceId: requiredText("Evidence ID"),
  status: z.enum(["uploaded", "mapped", "review_pending", "reviewed", "needs_more_info", "archived"]),
})

export const adminSavedViewSchema = z.object({
  scope: z.enum(["reports", "clients", "contractors", "discussions", "uploads", "recovery", "contracts", "audit"]),
  name: requiredText("Saved view name", 3).max(80, "Keep the view name under 80 characters."),
  filterSummary: requiredText("Filter summary", 3).max(240, "Keep the filter summary under 240 characters."),
  isDefault: z.coerce.boolean().optional(),
})

export const recoveryComplianceReviewSchema = z.object({
  recoveryCaseId: optionalText,
  lienNoticeDraftId: optionalText,
  contractPacketId: optionalText,
  status: z.enum(["pending", "approved", "needs_changes", "blocked"]),
  decisionReason: requiredText("Decision reason", 8).max(240, "Keep the decision reason under 240 characters."),
  requiredChanges: z.string().trim().max(700).optional(),
  publicVisibilityAllowed: z.coerce.boolean().optional(),
}).refine(
  (value) => Boolean(value.recoveryCaseId || value.lienNoticeDraftId || value.contractPacketId),
  {
    path: ["recoveryCaseId"],
    message: "Select a recovery, lien, or contract record.",
  },
)

export const moderationCaseAssignmentSchema = z.object({
  caseId: requiredText("Case ID"),
  assignedTo: requiredText("Reviewer ID"),
})

export const moderationCaseUpdateSchema = z.object({
  caseId: requiredText("Case ID"),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  status: z.enum(["unassigned", "assigned", "escalated", "closed"]),
  escalationNote: z.string().trim().max(700).optional(),
})

export const moderationDecisionReasonSchema = z.object({
  caseId: requiredText("Case ID"),
  decisionReason: z.enum([
    "approved_with_edits",
    "insufficient_evidence",
    "private_information",
    "neutrality_issue",
    "duplicate_report",
    "policy_rejection",
  ]),
  moderatorNote: z.string().trim().max(700).optional(),
})

export type ClientReportInput = z.infer<typeof clientReportSchema>
export type ClientResponseInput = z.infer<typeof clientResponseSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type AdminReviewInput = z.infer<typeof adminReviewSchema>
export type CommunityDiscussionInput = z.infer<typeof communityDiscussionSchema>
export type WatchlistItemInput = z.infer<typeof watchlistItemSchema>
export type ReportDraftInput = z.infer<typeof reportDraftSchema>
export type IntakeAssessmentInput = z.infer<typeof intakeAssessmentSchema>
export type PaymentRecoveryCaseInput = z.infer<typeof paymentRecoveryCaseSchema>
export type LienNoticeDraftInput = z.infer<typeof lienNoticeDraftSchema>
export type ContractWorkspaceItemInput = z.infer<typeof contractWorkspaceItemSchema>
export type ClientPipelineItemInput = z.infer<typeof clientPipelineItemSchema>
export type UpdateClientPipelineStageInput = z.infer<typeof updateClientPipelineStageSchema>
export type ClientRiskRoomInput = z.infer<typeof clientRiskRoomSchema>
export type PaymentRecoveryAttemptInput = z.infer<typeof paymentRecoveryAttemptSchema>
export type PaymentPlanInput = z.infer<typeof paymentPlanSchema>
export type ContractPacketInput = z.infer<typeof contractPacketSchema>
export type UpdateContractPacketStatusInput = z.infer<typeof updateContractPacketStatusSchema>
export type UpdateEvidenceVaultStatusInput = z.infer<typeof updateEvidenceVaultStatusSchema>
export type AdminSavedViewInput = z.infer<typeof adminSavedViewSchema>
export type RecoveryComplianceReviewInput = z.infer<typeof recoveryComplianceReviewSchema>
