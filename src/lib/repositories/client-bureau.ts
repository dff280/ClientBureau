import {
  adminReviews,
  adminModerationCrm,
  auditLogs,
  clientProfiles,
  clientReports,
  clientResponses,
  communityDiscussions,
  contractorRiskOps,
  contractorProfiles,
  reportEvidence,
  savedSearches,
  subscriptions,
  users,
  watchlistAlerts,
} from "@/lib/mock-data"
import { isPositiveReportCategory } from "@/lib/types"
import {
  assignModerationCase,
  intakeAssessmentScore,
  intakeRiskRecommendation,
  paymentRecoveryPriority,
} from "@/lib/platform-features"
import {
  calculateClientBureauScore,
  disputeHistoryLabel,
  getReportedBalanceSummary,
  getScoreCategoryBreakdown,
  getScoreFactors,
  paymentReliabilityLabel,
} from "@/lib/scoring"
import { buildClientSlug, ensureUniqueSlug } from "@/lib/slug"
import type {
  AdminSavedViewInput,
  ClientPipelineItemInput,
  ClientRiskRoomInput,
  ClientReportInput,
  ContractWorkspaceItemInput,
  ContractPacketInput,
  ContractShareLinkInput,
  ContractSignatureInput,
  LienNoticeDraftInput,
  PaymentRecoveryCaseInput,
  PaymentRecoveryAttemptInput,
  PaymentPlanInput,
  RecoveryComplianceReviewInput,
  UpdateContractPacketStatusInput,
  UpdateEvidenceVaultStatusInput,
} from "@/lib/schemas/client-bureau"
import type {
  AdminSavedView,
  AdminReview,
  AdminWorkspaceData,
  AuditLogEntry,
  ClientPipelineItem,
  ClientProfile,
  ClientReport,
  ClientRiskRoom,
  ClientSearchResult,
  CommunityDiscussion,
  ContractPacket,
  ContractWorkspaceItem,
  ContractorRiskOpsData,
  DiscussionStatus,
  EvidenceVaultItem,
  LienNoticeDraft,
  ModerationCase,
  ModerationDecisionReason,
  ModerationPriority,
  ModerationCaseStatus,
  PaymentPlan,
  PaymentRecoveryCase,
  PaymentRecoveryAttempt,
  PublicationAudit,
  RecoveryComplianceReview,
  PublicClientProfile,
  ReportDraft,
  ReportDraftStatus,
  ReportTimelineEvent,
  ReviewChecklistItem,
  ReviewChecklistStatus,
  SearchFilters,
} from "@/lib/types"

function reviewableReportsForClient(clientId: string) {
  return clientReports.filter((report) =>
    report.clientId === clientId && ["approved", "disputed"].includes(report.status),
  )
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

export function getPublicClientProfiles() {
  return clientProfiles.filter((client) => client.isPublic)
}

export function getPublicClientProfile(slug: string): PublicClientProfile | undefined {
  const client = clientProfiles.find(
    (profile) => profile.publicSlug === slug && profile.isPublic,
  )

  if (!client) return undefined

  const reviewableReports = reviewableReportsForClient(client.id)
  const reports = reviewableReports
  const positiveReports = reports.filter((report) => isPositiveReportCategory(report.reportCategory))
  const evidence = reportEvidence.filter((item) =>
    reviewableReports.some((report) => report.id === item.reportId),
  ).map((item) => ({
    ...item,
    fileName: publicEvidenceLabel(item),
    storagePath: "private",
  }))
  const responses = clientResponses.filter(
    (response) => response.clientId === client.id && response.status === "published",
  )
  const discussions = communityDiscussions.filter(
    (discussion) => discussion.clientId === client.id && discussion.status === "approved",
  )

  return {
    ...client,
    reports,
    positiveReports,
    clientResponses: responses,
    communityDiscussions: discussions,
    evidence,
    timeline: reviewableReports.flatMap(reportTimeline).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    ),
    scoreFactors: getScoreFactors(reviewableReports),
    scoreBreakdown: getScoreCategoryBreakdown(reviewableReports),
    balanceSummary: getReportedBalanceSummary(reviewableReports),
    paymentReliability: paymentReliabilityLabel(client.clientBureauScore),
    disputeHistory: disputeHistoryLabel(
      clientReports.filter((report) => report.clientId === client.id),
    ),
  }
}

function publicEvidenceLabel(item: { fileName: string; fileType: string }) {
  const value = `${item.fileType} ${item.fileName}`.toLowerCase()

  if (value.includes("invoice")) return "Invoice evidence on file"
  if (value.includes("contract") || value.includes("pdf")) return "Document evidence on file"
  if (value.includes("screenshot")) return "Screenshot evidence on file"
  if (value.includes("png") || value.includes("jpg") || value.includes("image") || value.includes("photo")) {
    return "Photo evidence on file"
  }

  return "Evidence on file"
}

export function getAdminWorkspaceData(): AdminWorkspaceData {
  return {
    users,
    contractors: contractorProfiles,
    clients: clientProfiles,
    reports: clientReports,
    evidence: reportEvidence,
    responses: clientResponses,
    discussions: communityDiscussions,
    reviews: getPendingAdminReviews(),
    auditLog: auditLogs,
  }
}

export function searchClients(query = "", filters: SearchFilters = {}): ClientSearchResult[] {
  const normalizedQuery = query.trim().toLowerCase()

  return getPublicClientProfiles()
    .map((client) => {
      const reports = reviewableReportsForClient(client.id)
      const latestReport = reports.at(-1)
      const nameLocation = [client.firstName, client.lastName, client.businessName, client.city, client.state, client.zip]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      const privateIdentifiers = [client.phoneHash, client.emailHash].join(" ").toLowerCase()
      const searchable = `${nameLocation} ${privateIdentifiers}`
      const privateIntent = normalizedQuery.includes("@") || /\d{7,}/.test(normalizedQuery)
      const exactNameMatch = normalizedQuery.length > 0 && nameLocation.includes(normalizedQuery)
      const privateMatch = privateIntent && privateIdentifiers.includes(normalizedQuery)
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
        searchable,
        reports,
      }
    })
    .filter((client) => {
      const matchesQuery = normalizedQuery.length === 0 || client.searchable.includes(normalizedQuery)
      const matchesState = !filters.state || client.state === filters.state
      const matchesRisk = !filters.riskLevel || client.riskLevel === filters.riskLevel
      const matchesCategory =
        !filters.category ||
        client.reports.some((report) => report.reportCategory === filters.category)

      return matchesQuery && matchesState && matchesRisk && matchesCategory
    })
    .sort((a, b) => b.matchScore - a.matchScore || b.reportCount - a.reportCount)
    .map((client) => {
      const { searchable, reports, ...result } = client

      void searchable
      void reports

      return result
    })
}

export function simulateSubmittedClientReport(input: ClientReportInput): ClientReport {
  const publicSlug = ensureUniqueSlug(
    buildClientSlug({
      firstName: input.firstName,
      lastName: input.lastName,
      city: input.city,
      state: input.state.toUpperCase(),
    }),
    clientProfiles.map((profile) => profile.publicSlug),
  )
  const clientId = `client_mock_${publicSlug}`

  return {
    id: `report_mock_${Date.now()}`,
    contractorId: contractorProfiles[0]?.id ?? "contractor_mock",
    clientId,
    projectType: input.projectType,
    projectCity: input.projectCity,
    projectState: input.projectState.toUpperCase(),
    contractAmount: input.contractAmount,
    amountUnpaid: input.amountUnpaid,
    reportCategory: input.reportCategory,
    paymentStatus: input.paymentStatus,
    reportSummary: input.reportSummary,
    detailedExperience: input.detailedExperience,
    publicSummary: input.reportSummary,
    evidenceAttached: Boolean(input.evidenceAttached),
    status: "pending",
    moderationNote: `After approval, the public profile can publish at /client/${publicSlug}.`,
    createdAt: new Date().toISOString(),
  }
}

export function getContractorDashboard(userId: string) {
  const user = users.find((candidate) => candidate.id === userId)
  const contractor = contractorProfiles.find((profile) => profile.userId === userId)

  if (!user || !contractor) return undefined

  const reports = clientReports.filter((report) => report.contractorId === contractor.id)
  const evidence = reportEvidence.filter((item) =>
    reports.some((report) => report.id === item.reportId),
  )
  const subscription = subscriptions.find((item) => item.contractorId === contractor.id)

  return {
    user,
    contractor,
    reports,
    evidence,
    savedSearches: savedSearches.filter((search) => search.contractorId === contractor.id),
    subscription,
  }
}

export function getContractorRiskOpsData(userId: string): ContractorRiskOpsData | undefined {
  const contractor = contractorProfiles.find((profile) => profile.userId === userId)

  if (!contractor) return undefined

  return {
    clientPipeline: contractorRiskOps.clientPipeline.filter((item) => item.contractorId === contractor.id),
    riskRooms: contractorRiskOps.riskRooms.filter((item) => item.contractorId === contractor.id),
    watchlist: contractorRiskOps.watchlist.filter((item) => item.contractorId === contractor.id),
    watchlistAlerts: watchlistAlerts.filter((item) => item.contractorId === contractor.id),
    reportDrafts: contractorRiskOps.reportDrafts.filter((item) => item.contractorId === contractor.id),
    intakeAssessments: contractorRiskOps.intakeAssessments.filter((item) => item.contractorId === contractor.id),
    evidenceSummaries: contractorRiskOps.evidenceSummaries.filter((item) => item.contractorId === contractor.id),
    evidenceVault: contractorRiskOps.evidenceVault.filter((item) => item.contractorId === contractor.id),
    paymentRecoveryCases: contractorRiskOps.paymentRecoveryCases.filter((item) => item.contractorId === contractor.id),
    paymentRecoveryAttempts: contractorRiskOps.paymentRecoveryAttempts.filter((item) => item.contractorId === contractor.id),
    paymentPlans: contractorRiskOps.paymentPlans.filter((item) => item.contractorId === contractor.id),
    lienNoticeDrafts: contractorRiskOps.lienNoticeDrafts.filter((item) => item.contractorId === contractor.id),
    contractDocuments: contractorRiskOps.contractDocuments.filter((item) => item.contractorId === contractor.id),
    contractPackets: contractorRiskOps.contractPackets.filter((item) => item.contractorId === contractor.id),
    activity: contractorRiskOps.activity.filter((item) => item.contractorId === contractor.id),
    recommendedActions: contractorRiskOps.recommendedActions,
  }
}

export function getAdminModerationCrmData() {
  return adminModerationCrm
}

export function createWatchlistItem(input: {
  contractorId: string
  clientId: string
  watchReason: string
  alertLevel: ModerationPriority
}) {
  const now = new Date().toISOString()
  const client = clientProfiles.find((candidate) => candidate.id === input.clientId)

  return {
    id: `watch_${Date.now()}`,
    contractorId: input.contractorId,
    clientId: input.clientId,
    status: "active" as const,
    watchReason: input.watchReason,
    alertLevel: input.alertLevel,
    lastSignal: client
      ? `${client.riskLevel} reported risk profile with ${client.reportCount} approved public reports.`
      : "Client added for private intake review.",
    privateMatch: true,
    createdAt: now,
    updatedAt: now,
  }
}

export function updateWatchlistItem(itemId: string, status: "active" | "cleared") {
  const now = new Date().toISOString()
  const existing = contractorRiskOps.watchlist.find((item) => item.id === itemId)

  return {
    ...(existing ?? contractorRiskOps.watchlist[0]),
    id: itemId,
    status,
    updatedAt: now,
  }
}

export function saveReportDraft(input: {
  contractorId: string
  draftId?: string
  clientId?: string
  clientName: string
  projectType: string
  estimatedValue: number
  amountAtRisk: number
  summary: string
  nextStep: string
  status: ReportDraftStatus
}): ReportDraft {
  const now = new Date().toISOString()

  return {
    id: input.draftId || `draft_${Date.now()}`,
    contractorId: input.contractorId,
    clientId: input.clientId,
    clientName: input.clientName,
    projectType: input.projectType,
    estimatedValue: input.estimatedValue,
    amountAtRisk: input.amountAtRisk,
    summary: input.summary,
    nextStep: input.nextStep,
    status: input.status,
    updatedAt: now,
  }
}

export function deleteReportDraft(draftId: string) {
  return {
    id: `audit_delete_draft_${Date.now()}`,
    actorId: "user_contractor_01",
    actorName: "Contractor workspace",
    action: "deleted_report_draft",
    entityType: "report" as const,
    entityId: draftId,
    summary: "Report draft removed from contractor workspace.",
    createdAt: new Date().toISOString(),
  }
}

export function createIntakeAssessment(input: {
  contractorId: string
  clientName: string
  city: string
  state: string
  projectValue: number
  depositReceived: boolean
  contractSigned: boolean
  privateMatchConfirmed: boolean
  notes?: string
}) {
  const score = intakeAssessmentScore(input)

  return {
    id: `intake_${Date.now()}`,
    contractorId: input.contractorId,
    clientName: input.clientName,
    city: input.city,
    state: input.state.toUpperCase(),
    projectValue: input.projectValue,
    depositReceived: input.depositReceived,
    contractSigned: input.contractSigned,
    privateMatchConfirmed: input.privateMatchConfirmed,
    recommendation: intakeRiskRecommendation(input),
    score,
    notes: input.notes || "Assessment created from contractor intake workflow.",
    createdAt: new Date().toISOString(),
  }
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

export function createPaymentRecoveryCase(
  contractorId: string,
  input: PaymentRecoveryCaseInput,
): PaymentRecoveryCase {
  const now = new Date().toISOString()
  const priority = paymentRecoveryPriority({
    amountDue: input.amountDue,
    invoiceAgeDays: input.invoiceAgeDays,
  })

  return {
    id: `recovery_${Date.now()}`,
    contractorId,
    clientName: input.clientName,
    city: input.city,
    state: input.state.toUpperCase(),
    amountDue: input.amountDue,
    invoiceAgeDays: input.invoiceAgeDays,
    preferredChannel: input.preferredChannel,
    status: input.invoiceAgeDays >= 21 ? "ready_to_contact" : "draft",
    priority,
    nextAction: nextRecoveryAction(input.preferredChannel),
    summary: input.summary,
    complianceFlags: [
      "Keep outreach factual and tied to invoice/project records.",
      "Avoid threats, public pressure language, or unsupported claims.",
      "Log each contact attempt, response, and resolution update.",
    ],
    createdAt: now,
    updatedAt: now,
  }
}

export function createLienNoticeDraft(
  contractorId: string,
  input: LienNoticeDraftInput,
): LienNoticeDraft {
  const now = new Date().toISOString()

  return {
    id: `lien_notice_${Date.now()}`,
    contractorId,
    clientName: input.clientName,
    projectType: input.projectType,
    propertyCity: input.propertyCity,
    state: input.state.toUpperCase(),
    amountDue: input.amountDue,
    lastWorkDate: input.lastWorkDate,
    targetSendDate: input.targetSendDate,
    status: "deadline_review",
    requiredReview: true,
    nextStep: "Review state-specific deadline, notice recipient, delivery method, and contract terms before sending.",
    jurisdictionNote:
      "Mechanics lien and notice requirements vary by state, role, project type, and deadline. This creates a readiness checklist only.",
    createdAt: now,
    updatedAt: now,
  }
}

export function createContractWorkspaceItem(
  contractorId: string,
  input: ContractWorkspaceItemInput,
): ContractWorkspaceItem {
  const now = new Date().toISOString()
  const nextStep = input.milestoneBilling
    ? "Review scope, deposit, milestone billing, and change-order language before sending."
    : "Review scope, payment timing, completion, and change-order language before sending."

  return {
    id: `contract_${Date.now()}`,
    contractorId,
    clientName: input.clientName,
    projectType: input.projectType,
    templateType: input.templateType,
    contractValue: input.contractValue,
    depositRequired: input.depositRequired,
    milestoneBilling: Boolean(input.milestoneBilling),
    status: "draft",
    nextStep,
    summary: input.summary,
    createdAt: now,
    updatedAt: now,
  }
}

export function createClientPipelineItem(
  contractorId: string,
  input: ClientPipelineItemInput,
): ClientPipelineItem {
  const now = new Date().toISOString()

  return {
    id: `pipeline_${Date.now()}`,
    contractorId,
    clientId: input.clientId,
    clientName: input.clientName,
    city: input.city,
    state: input.state.toUpperCase(),
    stage: input.stage,
    priority: input.priority,
    estimatedValue: input.estimatedValue,
    nextAction: input.nextAction,
    dueAt: input.dueAt,
    privateMatch: Boolean(input.privateMatch),
    createdAt: now,
    updatedAt: now,
  }
}

export function updateClientPipelineStage(itemId: string, stage: ClientPipelineItem["stage"]): ClientPipelineItem {
  const existing = contractorRiskOps.clientPipeline.find((item) => item.id === itemId)
  const now = new Date().toISOString()

  return {
    ...(existing ?? contractorRiskOps.clientPipeline[0]),
    id: itemId,
    stage,
    updatedAt: now,
    nextAction:
      stage === "closed"
        ? "Archive final project records and any resolution context."
        : existing?.nextAction ?? "Review the next client intake step.",
  }
}

export function createClientRiskRoom(contractorId: string, input: ClientRiskRoomInput): ClientRiskRoom {
  const now = new Date().toISOString()

  return {
    id: `risk_room_${Date.now()}`,
    contractorId,
    clientId: input.clientId,
    clientName: input.clientName,
    city: input.city,
    state: input.state.toUpperCase(),
    headline: input.headline,
    summary: input.summary,
    linkedSearchIds: [],
    linkedWatchlistIds: [],
    linkedAssessmentIds: [],
    linkedContractIds: [],
    linkedReportDraftIds: [],
    linkedEvidenceIds: [],
    linkedRecoveryIds: [],
    linkedResolutionIds: [],
    lastActivityAt: now,
    createdAt: now,
  }
}

export function logPaymentRecoveryAttempt(
  contractorId: string,
  input: PaymentRecoveryAttemptInput,
): PaymentRecoveryAttempt {
  const now = new Date().toISOString()

  return {
    id: `recovery_attempt_${Date.now()}`,
    recoveryCaseId: input.recoveryCaseId,
    contractorId,
    channel: input.channel,
    attemptedAt: input.attemptedAt,
    outcome: input.outcome,
    note: input.note,
    nextFollowUpAt: input.nextFollowUpAt,
    createdAt: now,
  }
}

export function createPaymentPlan(contractorId: string, input: PaymentPlanInput): PaymentPlan {
  const now = new Date().toISOString()

  return {
    id: `payment_plan_${Date.now()}`,
    recoveryCaseId: input.recoveryCaseId,
    contractorId,
    totalAmount: input.totalAmount,
    installmentAmount: input.installmentAmount,
    dueDay: input.dueDay,
    status: input.status,
    nextDueDate: input.nextDueDate,
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
  }
}

export function createContractPacket(contractorId: string, input: ContractPacketInput): ContractPacket {
  const now = new Date().toISOString()

  return {
    id: `contract_packet_${Date.now()}`,
    contractorId,
    clientName: input.clientName,
    projectType: input.projectType,
    templateType: input.templateType,
    status: input.requiredBeforeScheduling ? "review_ready" : "draft",
    packetValue: input.packetValue,
    depositRequired: input.depositRequired,
    milestoneCount: input.milestoneCount,
    requiredBeforeScheduling: Boolean(input.requiredBeforeScheduling),
    nextAction: input.nextAction,
    clientInviteStatus: "not_invited",
    signatureStatus: "not_sent",
    shareStatus: "draft",
    paymentMode: "none",
    createdAt: now,
    updatedAt: now,
  }
}

export function updateContractPacketStatus(input: UpdateContractPacketStatusInput): ContractPacket {
  const existing = contractorRiskOps.contractPackets.find((item) => item.id === input.packetId)

  return {
    ...(existing ?? contractorRiskOps.contractPackets[0]),
    id: input.packetId,
    status: input.status,
    updatedAt: new Date().toISOString(),
  }
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

export function contractSharePath(token: string) {
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

function withShareDefaults(item: ContractPacket): ContractPacket {
  const token = item.shareToken ?? contractShareToken(item)

  return {
    ...item,
    shareToken: token,
    shareUrl: item.shareUrl ?? contractSharePath(token),
    clientInviteStatus: item.clientInviteStatus ?? "not_invited",
    signatureStatus: item.signatureStatus ?? "not_sent",
    shareStatus: item.shareStatus ?? "draft",
    paymentMode: item.paymentMode ?? "none",
  }
}

export function getContractPacketByShareToken(token: string): ContractPacket | undefined {
  const existing = contractorRiskOps.contractPackets.find((item) => {
    const itemToken = item.shareToken ?? contractShareToken(item)

    return itemToken === token
  })

  return existing ? withShareDefaults(existing) : undefined
}

export function createContractShareLink(
  contractorId: string,
  input: ContractShareLinkInput,
): ContractPacket {
  const existing = contractorRiskOps.contractPackets.find(
    (item) => item.id === input.packetId && item.contractorId === contractorId,
  ) ?? contractorRiskOps.contractPackets.find((item) => item.id === input.packetId)

  const now = new Date().toISOString()
  const base = withShareDefaults(existing ?? contractorRiskOps.contractPackets[0])
  const token = base.shareToken ?? contractShareToken(base)
  const paymentMode = input.paymentMode ?? "none"

  return {
    ...base,
    id: input.packetId,
    contractorId,
    status: "sent",
    shareToken: token,
    shareUrl: contractSharePath(token),
    clientEmailMasked: maskEmail(input.clientEmail),
    clientInviteStatus: input.inviteClient ? "invited" : "not_invited",
    signatureStatus: "awaiting_client",
    shareStatus: "sent",
    paymentMode,
    paymentSummary:
      input.paymentSummary ||
      (paymentMode === "deposit_request"
        ? `Deposit request tracked for $${base.depositRequired.toLocaleString()} before scheduling.`
        : paymentMode === "milestone_schedule"
          ? `${base.milestoneCount || 1} milestone payment schedule attached to the agreement workflow.`
          : paymentMode === "platform_review"
            ? "Payment coordination is marked for platform review before any payment workflow is activated."
            : "No payment request is active on this contract link."),
    nextAction: "Private signing link prepared. Send it to the client, then track view, signature, and payment coordination status.",
    updatedAt: now,
  }
}

export function signContractShare(input: ContractSignatureInput): ContractPacket {
  const now = new Date().toISOString()
  const existing = getContractPacketByShareToken(input.shareToken)

  if (!existing) {
    throw new Error("Contract signing link was not found.")
  }

  return {
    ...existing,
    status: "signed",
    clientEmailMasked: existing.clientEmailMasked ?? maskEmail(input.signerEmail),
    clientInviteStatus: "joined",
    signatureStatus: "client_signed",
    shareStatus: existing.paymentMode && existing.paymentMode !== "none" ? "payment_pending" : "signed",
    clientSignedAt: now,
    nextAction: "Client signature recorded. Contractor should countersign, store the final agreement, and confirm payment timing before work starts.",
    updatedAt: now,
  }
}

export function updateEvidenceVaultStatus(input: UpdateEvidenceVaultStatusInput): EvidenceVaultItem {
  const existing = contractorRiskOps.evidenceVault.find((item) => item.id === input.evidenceId)

  return {
    ...(existing ?? contractorRiskOps.evidenceVault[0]),
    id: input.evidenceId,
    status: input.status,
    updatedAt: new Date().toISOString(),
  }
}

export function saveAdminQueueView(adminId: string, input: AdminSavedViewInput): AdminSavedView {
  return {
    id: `saved_view_${Date.now()}`,
    scope: input.scope,
    name: input.name,
    filters: { summary: input.filterSummary },
    isDefault: Boolean(input.isDefault),
    createdBy: adminId,
    createdAt: new Date().toISOString(),
  }
}

export function reviewRecoveryCompliance(
  adminId: string,
  input: RecoveryComplianceReviewInput,
): RecoveryComplianceReview {
  const now = new Date().toISOString()

  return {
    id: `compliance_${Date.now()}`,
    recoveryCaseId: input.recoveryCaseId,
    lienNoticeDraftId: input.lienNoticeDraftId,
    contractPacketId: input.contractPacketId,
    reviewerId: adminId,
    status: input.status,
    decisionReason: input.decisionReason,
    requiredChanges: (input.requiredChanges ?? "")
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean),
    publicVisibilityAllowed: Boolean(input.publicVisibilityAllowed),
    createdAt: now,
    updatedAt: now,
  }
}

export function assignMockModerationCase(caseId: string, reviewerId: string, reviewerName: string) {
  const existing = adminModerationCrm.cases.find((item) => item.id === caseId) ?? adminModerationCrm.cases[0]

  return assignModerationCase(existing, reviewerId, reviewerName)
}

export function updateMockModerationCase(
  caseId: string,
  priority: ModerationPriority,
  status: ModerationCaseStatus,
  escalationNote?: string,
): ModerationCase {
  const existing = adminModerationCrm.cases.find((item) => item.id === caseId) ?? adminModerationCrm.cases[0]

  return {
    ...existing,
    id: caseId,
    priority,
    status,
    escalationNote,
    updatedAt: new Date().toISOString(),
  }
}

export function setMockModerationDecisionReason(
  caseId: string,
  decisionReason: ModerationDecisionReason,
  moderatorNote?: string,
): ModerationCase {
  const existing = adminModerationCrm.cases.find((item) => item.id === caseId) ?? adminModerationCrm.cases[0]

  return {
    ...existing,
    id: caseId,
    decisionReason,
    escalationNote: moderatorNote ?? existing.escalationNote,
    updatedAt: new Date().toISOString(),
  }
}

export function getPendingAdminReviews() {
  return adminReviews.map((review) => {
    const report = clientReports.find((candidate) => candidate.id === review.reportId)
    const client = report
      ? clientProfiles.find((candidate) => candidate.id === report.clientId)
      : undefined
    const evidence = reportEvidence.filter((item) => item.reportId === review.reportId)
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
      client,
      evidence,
      checklist,
    }
  })
}

export function simulateApprovalPublication(
  reportId: string,
  editedPublicSummary?: string,
): PublicationAudit | undefined {
  const report = clientReports.find((candidate) => candidate.id === reportId)
  if (!report) return undefined

  const existingProfile = clientProfiles.find((profile) => profile.id === report.clientId)
  const fallbackProfile: ClientProfile = {
    id: report.clientId,
    firstName: "Pending",
    lastName: "Client",
    city: report.projectCity,
    state: report.projectState,
    phoneHash: "sha256:pending-private",
    emailHash: "sha256:pending-private",
    publicSlug: buildClientSlug({
      firstName: "Pending",
      lastName: "Client",
      city: report.projectCity,
      state: report.projectState,
    }),
    clientBureauScore: 78,
    riskLevel: "Moderate",
    reportCount: 0,
    createdAt: report.createdAt,
    updatedAt: new Date().toISOString(),
    isPublic: false,
  }
  const profile = existingProfile ?? fallbackProfile
  const approvedReports = [
    ...reviewableReportsForClient(profile.id).filter((candidate) => candidate.id !== report.id),
    { ...report, status: "approved" as const, publicSummary: editedPublicSummary ?? report.publicSummary },
  ]
  const score = calculateClientBureauScore(approvedReports)
  const generatedSlug = ensureUniqueSlug(
    profile.publicSlug || buildClientSlug(profile),
    clientProfiles
      .filter((candidate) => candidate.id !== profile.id)
      .map((candidate) => candidate.publicSlug),
  )

  return {
    reportId,
    previousIsPublic: profile.isPublic,
    nextIsPublic: true,
    generatedSlug,
    recalculatedScore: score.score,
    recalculatedRiskLevel: score.riskLevel,
    publicSummary: editedPublicSummary ?? report.publicSummary,
    publishedAt: new Date().toISOString(),
  }
}

export function submitClientReport(input: Partial<ClientReport>) {
  return {
    ...input,
    id: "report_mock_new",
    status: "pending" as const,
    createdAt: new Date().toISOString(),
  }
}

export function reviewReport(
  reportId: string,
  decision: "approved" | "rejected",
  editedPublicSummary?: string,
): AdminReview {
  const audit = decision === "approved" ? simulateApprovalPublication(reportId, editedPublicSummary) : undefined

  return {
    id: `review_mock_${reportId}`,
    reportId,
    reviewerId: "user_admin_01",
    status: decision,
    editedPublicSummary,
    notes:
      decision === "approved"
        ? `Approval publishes /client/${audit?.generatedSlug ?? "generated-slug"} and recalculates score to ${audit?.recalculatedScore ?? "N/A"}.`
        : "Rejection keeps this report private.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function reviewReportsBulk(
  reportIds: string[],
  decision: "approved" | "rejected" | "deleted",
): { updated: AdminReview[]; deletedIds: string[] } {
  if (decision === "deleted") {
    return {
      updated: [],
      deletedIds: reportIds,
    }
  }

  return {
    updated: reportIds.map((reportId) => reviewReport(reportId, decision)),
    deletedIds: [],
  }
}

export function submitCommunityDiscussion(
  profileSlug: string,
  input: {
    name: string
    relationshipCategory: CommunityDiscussion["relationshipCategory"]
    commentBody: string
    attachmentUrl?: string
    reportId?: string
  },
) {
  const profile = clientProfiles.find((client) => client.publicSlug === profileSlug)

  if (!profile) {
    throw new Error("No public profile was found for that discussion.")
  }

  return {
    id: `discussion_mock_${Date.now()}`,
    clientId: profile.id,
    reportId: input.reportId,
    authorName: input.name,
    authorEmailHash: "sha256:pending-discussion-private",
    relationshipCategory: input.relationshipCategory,
    commentBody: input.commentBody,
    attachmentUrl: input.attachmentUrl,
    status: "pending" as const,
    isVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function reviewCommunityDiscussion(
  discussionId: string,
  decision: "approved" | "rejected" | "deleted" | "verified",
  moderatorNote?: string,
): CommunityDiscussion {
  const discussion = communityDiscussions.find((candidate) => candidate.id === discussionId)
  const now = new Date().toISOString()
  const nextStatus: DiscussionStatus =
    decision === "approved" || decision === "verified"
      ? "approved"
      : decision === "deleted"
        ? "rejected"
        : "rejected"

  return {
    ...(discussion ?? {
      id: discussionId,
      clientId: "client_01",
      authorName: "Discussion contact",
      authorEmailHash: "sha256:private",
      relationshipCategory: "Supporting Context" as const,
      commentBody: "Discussion entry was moderated.",
      status: "pending" as const,
      isVerified: false,
      createdAt: now,
      updatedAt: now,
    }),
    status: nextStatus,
    isVerified: decision === "verified" ? true : (discussion?.isVerified ?? false),
    moderatorNote,
    updatedAt: now,
    publishedAt: nextStatus === "approved" ? now : discussion?.publishedAt,
  }
}

export function updateAdminClientRecord(input: Partial<ClientProfile> & { id: string }): ClientProfile {
  const existing = clientProfiles.find((candidate) => candidate.id === input.id)
  if (!existing) throw new Error("Client profile was not found.")

  return {
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  }
}

export function updateAdminContractorRecord(
  input: Partial<(typeof contractorProfiles)[number]> & { id: string },
) {
  const existing = contractorProfiles.find((candidate) => candidate.id === input.id)
  if (!existing) throw new Error("Contractor profile was not found.")

  return {
    ...existing,
    ...input,
  }
}

export function deleteAdminRecord(entityType: string, entityId: string): AuditLogEntry {
  return {
    id: `audit_mock_delete_${Date.now()}`,
    actorId: "user_admin_01",
    actorName: "Client Bureau Review Team",
    action: "deleted_record",
    entityType: entityType as AuditLogEntry["entityType"],
    entityId,
    summary: `Delete action recorded for ${entityType} ${entityId}.`,
    createdAt: new Date().toISOString(),
  }
}

export function submitClientResponse(profileId: string, responseInput: { reportId?: string; responseSummary: string }) {
  return {
    id: "response_mock_new",
    clientId: profileId,
    reportId: responseInput.reportId,
    responseSummary: responseInput.responseSummary,
    status: "pending" as const,
    createdAt: new Date().toISOString(),
  }
}
