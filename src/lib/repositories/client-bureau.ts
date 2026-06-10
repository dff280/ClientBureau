import {
  buildPublicEntityProfile,
  deriveEntityProfiles,
  reportConfidenceLevel,
  searchEntityProfiles,
} from "@/lib/entity-profiles"
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
  agreementDefaults,
  buildSignedContractSnapshot,
  type ContractSignatureAuditInput,
} from "@/lib/contract-packets"
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
import {
  buildBusinessSlug,
  calculateBusinessRating,
} from "@/lib/business-rating"
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
  FloridaLienCaseInput,
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
  SavedClientSearchInput,
  SearchAnalyticsEventInput,
  ServiceFeeCheckoutInput,
  ServicePrecheckInput,
  ProfileShareEventInput,
  UpdateContractPacketStatusInput,
  UpdateEvidenceVaultStatusInput,
} from "@/lib/schemas/client-bureau"
import type {
  AdminSavedView,
  AdminReview,
  AdminWorkspaceData,
  AuditLogEntry,
  CaseDocumentLink,
  ClientPipelineItem,
  ClientProfile,
  ClientReport,
  ClientRiskRoom,
  ClientSearchResult,
  CommunityDiscussion,
  ContractPacket,
  ContractWorkspaceItem,
  ContractorRiskOpsData,
  ContractorProfile,
  DiscussionStatus,
  EntityProfile,
  EntityProfileSearchResult,
  EvidenceVaultItem,
  FloridaLienCase,
  LienFilingRecord,
  LienReleaseRecord,
  LienNoticeDraft,
  ManagedRecoveryCase,
  ModerationCase,
  ModerationDecisionReason,
  ModerationPriority,
  ModerationCaseStatus,
  PaymentPlan,
  PaymentRecoveryCase,
  PaymentRecoveryAttempt,
  PublicationAudit,
  RecoveryComplianceReview,
  RecoveryCommunication,
  ServiceFeeOrder,
  ServiceReadinessSummary,
  PublicClientProfile,
  PublicBusinessProfile,
  ReportEvidence,
  ReportDraft,
  ReportDraftStatus,
  ReportTimelineEvent,
  ReviewChecklistItem,
  ReviewChecklistStatus,
  SearchFilters,
  SavedClientSearch,
  SearchAnalyticsEvent,
  ProfileShareEvent,
  ProfileClaim,
  ProfileMergeEvent,
  ProfileRedactionEvent,
  PublicEntityProfile,
  ReportReassignmentEvent,
  Subscription,
} from "@/lib/types"
import {
  buildFloridaLienReadinessSummary,
  buildRecoveryReadinessSummary,
} from "@/lib/service-readiness"

function reviewableReportsForClient(clientId: string) {
  return clientReports.filter((report) =>
    report.clientId === clientId && ["approved", "disputed"].includes(report.status),
  )
}

const savedClientSearchRecords: SavedClientSearch[] = []
const searchAnalyticsEvents: SearchAnalyticsEvent[] = []
const profileShareEvents: ProfileShareEvent[] = []
const profileClaims: ProfileClaim[] = []
const profileMergeEvents: ProfileMergeEvent[] = []
const reportReassignmentEvents: ReportReassignmentEvent[] = []
const profileRedactionEvents: ProfileRedactionEvent[] = []

type SimulatedClientReportInput = Partial<ClientReportInput> &
  Pick<
    ClientReportInput,
    | "firstName"
    | "lastName"
    | "city"
    | "state"
    | "projectType"
    | "projectCity"
    | "projectState"
    | "contractAmount"
    | "amountUnpaid"
    | "reportCategory"
    | "paymentStatus"
    | "reportSummary"
    | "detailedExperience"
  >

type SimulatedFloridaLienCaseInput = Partial<FloridaLienCaseInput> &
  Pick<
    FloridaLienCaseInput,
    | "workflowType"
    | "clientName"
    | "ownerName"
    | "propertyCounty"
    | "propertyCity"
    | "state"
    | "contractorRole"
    | "projectType"
    | "contractAmount"
    | "amountDue"
    | "firstWorkDate"
    | "lastWorkDate"
    | "noticeHistory"
    | "privateSummary"
  >

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

function buildPublicBusinessProfile(input: {
  contractor: ContractorProfile
  reports: ClientReport[]
  evidence: ReportEvidence[]
  subscription?: Subscription
}): PublicBusinessProfile {
  const { contractor, reports, evidence, subscription } = input
  const approvedReports = reports.filter((report) => report.status === "approved")
  const publicClientReports = approvedReports
    .map((report) => ({
      report,
      client: clientProfiles.find((client) => client.id === report.clientId && client.isPublic),
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

export function getPublicBusinessProfiles() {
  return contractorProfiles.map((contractor) => {
    const reports = clientReports.filter((report) => report.contractorId === contractor.id)
    const evidence = reportEvidence.filter((item) =>
      reports.some((report) => report.id === item.reportId),
    )
    const subscription = subscriptions.find((item) => item.contractorId === contractor.id)

    return buildPublicBusinessProfile({ contractor, reports, evidence, subscription })
  })
}

export function getPublicBusinessProfile(slug: string): PublicBusinessProfile | undefined {
  return getPublicBusinessProfiles().find((profile) => profile.publicSlug === slug)
}

export function getEntityProfiles(): EntityProfile[] {
  const profiles = deriveEntityProfiles({
    clients: clientProfiles,
    contractors: contractorProfiles,
    reports: clientReports,
    publicBusinesses: getPublicBusinessProfiles(),
  })

  return profiles.map((profile) => {
    const claim = profileClaims.find((item) => item.profileId === profile.id)
    if (!claim) return profile

    if (claim.status === "approved") {
      return {
        ...profile,
        claimedStatus: "verified",
        verificationLevel: "admin_verified",
        verificationBadges: [...(profile.verificationBadges ?? []), "Admin verified"].filter((value, index, list) => list.indexOf(value) === index),
      }
    }

    if (claim.status === "disputed") {
      return {
        ...profile,
        claimedStatus: "disputed",
        redactionNote: claim.moderatorNote ?? profile.redactionNote,
      }
    }

    if (claim.status === "pending" && profile.claimedStatus === "unclaimed") {
      return {
        ...profile,
        claimedStatus: "claim_pending",
      }
    }

    return profile
  })
}

export function getPublicEntityProfiles(): EntityProfile[] {
  return getEntityProfiles().filter((profile) => profile.isPublic)
}

export function getPublicEntityProfile(profileType: EntityProfile["profileType"], slug: string): PublicEntityProfile | undefined {
  const profile = getPublicEntityProfiles().find((item) => item.profileType === profileType && item.slug === slug)
  if (!profile) return undefined

  const reports =
    profile.profileType === "client" && profile.legacyClientId
      ? reviewableReportsForClient(profile.legacyClientId)
      : profile.legacyContractorId
        ? clientReports.filter((report) => report.contractorId === profile.legacyContractorId && ["approved", "disputed"].includes(report.status))
        : []
  const relatedClient = profile.legacyClientId
    ? clientProfiles.find((client) => client.id === profile.legacyClientId)
    : undefined
  const relatedContractor = profile.legacyContractorId
    ? getPublicBusinessProfiles().find((business) => business.id === profile.legacyContractorId)
    : undefined

  return buildPublicEntityProfile({
    profile,
    reports,
    relatedClient,
    relatedContractor,
  })
}

export function searchProfiles(query = "", filters: SearchFilters = {}): EntityProfileSearchResult[] {
  return searchEntityProfiles(getPublicEntityProfiles(), query, filters)
}

export function submitProfileClaim(input: {
  profileId: string
  claimantUserId?: string
  claimantEmailHash: string
  claimantName: string
  relationshipToProfile: string
  verificationSummary: string
}): ProfileClaim {
  const claim: ProfileClaim = {
    id: `claim_mock_${Date.now()}`,
    profileId: input.profileId,
    claimantUserId: input.claimantUserId,
    claimantEmailHash: input.claimantEmailHash,
    claimantName: input.claimantName,
    relationshipToProfile: input.relationshipToProfile,
    verificationSummary: input.verificationSummary,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  profileClaims.unshift(claim)

  return claim
}

export function getProfileClaims() {
  return profileClaims
}

export function reviewProfileClaim(input: {
  claimId: string
  decision: "approved" | "rejected" | "disputed"
  moderatorNote: string
}): ProfileClaim {
  const claim = profileClaims.find((item) => item.id === input.claimId) ?? {
    id: input.claimId,
    profileId: "mock_profile",
    claimantEmailHash: "sha256:mock-private",
    claimantName: "Mock claimant",
    relationshipToProfile: "Owner or authorized representative",
    verificationSummary: "Mock claim created for local admin workflow.",
    status: "pending" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  claim.status = input.decision
  claim.moderatorNote = input.moderatorNote
  claim.updatedAt = new Date().toISOString()

  if (!profileClaims.some((item) => item.id === claim.id)) profileClaims.unshift(claim)

  return claim
}

export function mergeEntityProfiles(input: {
  sourceProfileId: string
  targetProfileId: string
  adminId?: string
  reason: string
  moveReports?: boolean
}): ProfileMergeEvent {
  const event: ProfileMergeEvent = {
    id: `merge_mock_${Date.now()}`,
    sourceProfileId: input.sourceProfileId,
    targetProfileId: input.targetProfileId,
    mergedBy: input.adminId,
    reason: input.reason,
    metadata: {
      moveReports: Boolean(input.moveReports),
      mode: "local-preview",
    },
    createdAt: new Date().toISOString(),
  }

  profileMergeEvents.unshift(event)

  return event
}

export function reassignReportProfile(input: {
  reportId: string
  nextSubjectProfileId?: string
  nextProjectJobId?: string
  adminId?: string
  reason: string
}): ReportReassignmentEvent {
  const report = clientReports.find((item) => item.id === input.reportId)
  const event: ReportReassignmentEvent = {
    id: `reassign_mock_${Date.now()}`,
    reportId: input.reportId,
    previousSubjectProfileId: report?.subjectProfileId,
    nextSubjectProfileId: input.nextSubjectProfileId,
    previousProjectJobId: report?.projectJobId,
    nextProjectJobId: input.nextProjectJobId,
    reassignedBy: input.adminId,
    reason: input.reason,
    createdAt: new Date().toISOString(),
  }

  if (report) {
    report.subjectProfileId = input.nextSubjectProfileId ?? report.subjectProfileId
    report.projectJobId = input.nextProjectJobId ?? report.projectJobId
    report.moderationNote = `Reassigned by admin: ${input.reason}`
  }

  reportReassignmentEvents.unshift(event)

  return event
}

export function redactEntityProfileField(input: {
  profileId: string
  fieldName: string
  reason: string
  replacementValue?: string
  adminId?: string
}): ProfileRedactionEvent {
  const event: ProfileRedactionEvent = {
    id: `redaction_mock_${Date.now()}`,
    profileId: input.profileId,
    fieldName: input.fieldName,
    previousPublicValueHash: "sha256:local-preview-private",
    redactedBy: input.adminId,
    reason: input.reason,
    createdAt: new Date().toISOString(),
  }

  profileRedactionEvents.unshift(event)

  return event
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
      const balanceSummary = getReportedBalanceSummary(reports)
      const positiveSignalCount = reports.filter((report) => isPositiveReportCategory(report.reportCategory)).length
      const openDisputeCount = reports.filter((report) => report.status === "disputed").length
      const resolvedReportCount = reports.filter((report) =>
        ["Resolved", "Paid in full", "Settled", "Admin verified"].includes(report.resolutionStatus ?? ""),
      ).length
      const evidenceOnFile = reports.some((report) => report.evidenceAttached)
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
        positiveSignalCount,
        openDisputeCount,
        resolvedReportCount,
        evidenceOnFile,
        paymentContextLabel:
          balanceSummary.totalReportedUnpaid > 0
            ? `${formatRepositoryCurrency(balanceSummary.totalReportedUnpaid)} reported unpaid`
            : "No payment issue reported",
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

export function saveClientSearch(userId: string | undefined, input: SavedClientSearchInput): SavedClientSearch {
  const query = input.query?.trim() || "All public profiles"
  const now = new Date().toISOString()
  const existingIndex = savedClientSearchRecords.findIndex((search) =>
    search.contractorId === userId &&
    search.query.toLowerCase() === query.toLowerCase() &&
    search.state === input.state?.toUpperCase() &&
    search.riskLevel === input.riskLevel &&
    search.category === input.category,
  )
  const record: SavedClientSearch = {
    id: existingIndex >= 0 ? savedClientSearchRecords[existingIndex].id : `saved_client_search_${Date.now()}`,
    contractorId: userId,
    query,
    city: input.city,
    state: input.state?.toUpperCase(),
    riskLevel: input.riskLevel,
    category: input.category,
    resultCount: input.resultCount,
    source: "mock",
    createdAt: existingIndex >= 0 ? savedClientSearchRecords[existingIndex].createdAt : now,
    lastRunAt: now,
  }

  if (existingIndex >= 0) {
    savedClientSearchRecords.splice(existingIndex, 1, record)
  } else {
    savedClientSearchRecords.unshift(record)
  }

  return record
}

export function deleteSavedClientSearch(userId: string | undefined, searchId: string) {
  const index = savedClientSearchRecords.findIndex((search) =>
    search.id === searchId && (!userId || search.contractorId === userId),
  )

  if (index >= 0) savedClientSearchRecords.splice(index, 1)

  return true
}

export function recordSearchEvent(userId: string | undefined, input: SearchAnalyticsEventInput): SearchAnalyticsEvent {
  const event: SearchAnalyticsEvent = {
    id: `search_event_${Date.now()}_${searchAnalyticsEvents.length + 1}`,
    contractorId: userId,
    query: input.query,
    state: input.state?.toUpperCase(),
    riskLevel: input.riskLevel,
    category: input.category,
    resultCount: input.resultCount,
    eventType: input.eventType,
    source: input.source,
    createdAt: new Date().toISOString(),
  }

  searchAnalyticsEvents.unshift(event)

  return event
}

export function recordProfileShareEvent(userId: string | undefined, input: ProfileShareEventInput): ProfileShareEvent {
  const event: ProfileShareEvent = {
    id: `profile_share_${Date.now()}_${profileShareEvents.length + 1}`,
    contractorId: userId,
    profileSlug: input.profileSlug,
    channel: input.channel,
    source: input.source,
    createdAt: new Date().toISOString(),
  }

  profileShareEvents.unshift(event)

  return event
}

function formatRepositoryCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export function simulateSubmittedClientReport(input: SimulatedClientReportInput): ClientReport {
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
    projectJobId: input.projectJobId ?? `project_mock_${publicSlug}`,
    subjectProfileId: input.subjectProfileId,
    subjectProfileType: input.subjectProfileType ?? "client",
    relationshipType: input.relationshipType ?? "contractor_to_client",
    legacyClientName: [input.firstName, input.lastName].filter(Boolean).join(" "),
    reportConfidenceLevel: reportConfidenceLevel({
      id: "confidence_preview",
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
      signedContract: input.signedContract,
      detailedTimelinePrivate: input.detailedExperience,
      responseStatus: input.clientResponded ? "Response published" : "Pending response",
      resolutionStatus: input.issueResolved ? "Resolved" : undefined,
      createdAt: new Date().toISOString(),
    }),
    clientType: input.clientType,
    clientJobAddressPrivate: input.jobAddress,
    tradeCategory: input.tradeCategory,
    jobType: input.jobType,
    jobStartDate: input.jobStartDate,
    jobCompletionDate: input.jobCompletionDate,
    jobStatus: input.jobStatus,
    depositRequested: input.depositRequested,
    depositPaid: input.depositPaid,
    finalInvoiceAmount: input.finalInvoiceAmount,
    materialsPurchasedAmount: input.materialsPurchasedAmount,
    signedContract: input.signedContract,
    writtenChangeOrder: input.writtenChangeOrder,
    secondaryCategory: input.secondaryCategory,
    disputeStatus: input.disputeStatus,
    amountDisputed: input.amountDisputed,
    daysOverdue: input.daysOverdue,
    clientResponded: input.clientResponded,
    issueResolved: input.issueResolved,
    resolutionSummary: input.resolutionSummary,
    paymentReminderSent: input.paymentReminderSent,
    demandLetterSent: input.demandLetterSent,
    lienNoticeStarted: input.lienNoticeStarted,
    factualSummaryPublic: input.reportSummary,
    detailedTimelinePrivate: input.detailedExperience,
    evidenceConfidence: input.evidenceAttached ? "Medium" : "Limited",
    responseStatus: "Pending response",
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
    managedRecoveryCases: contractorRiskOps.managedRecoveryCases.filter((item) => item.contractorId === contractor.id),
    recoveryCommunications: contractorRiskOps.recoveryCommunications.filter((item) => item.contractorId === contractor.id),
    recoveryResolutionOffers: contractorRiskOps.recoveryResolutionOffers.filter((item) => item.contractorId === contractor.id),
    floridaLienCases: contractorRiskOps.floridaLienCases.filter((item) => item.contractorId === contractor.id),
    lienNoticeDeliveries: contractorRiskOps.lienNoticeDeliveries.filter((item) => item.contractorId === contractor.id),
    lienFilingRecords: contractorRiskOps.lienFilingRecords.filter((item) => item.contractorId === contractor.id),
    lienReleaseRecords: contractorRiskOps.lienReleaseRecords.filter((item) => item.contractorId === contractor.id),
    serviceFeeOrders: contractorRiskOps.serviceFeeOrders.filter((item) => item.contractorId === contractor.id),
    serviceReadiness: contractorRiskOps.serviceReadiness.filter((item) =>
      contractorRiskOps.managedRecoveryCases.some((caseItem) => caseItem.contractorId === contractor.id && caseItem.id === item.entityId) ||
      contractorRiskOps.floridaLienCases.some((caseItem) => caseItem.contractorId === contractor.id && caseItem.id === item.entityId),
    ),
    caseDocumentLinks: contractorRiskOps.caseDocumentLinks.filter((item) => item.contractorId === contractor.id),
    caseStaffAssignments: contractorRiskOps.caseStaffAssignments.filter((item) =>
      contractorRiskOps.managedRecoveryCases.some((caseItem) => caseItem.contractorId === contractor.id && caseItem.id === item.entityId) ||
      contractorRiskOps.floridaLienCases.some((caseItem) => caseItem.contractorId === contractor.id && caseItem.id === item.entityId),
    ),
    caseAuditEvents: contractorRiskOps.caseAuditEvents.filter((item) =>
      contractorRiskOps.managedRecoveryCases.some((caseItem) => caseItem.contractorId === contractor.id && caseItem.id === item.entityId) ||
      contractorRiskOps.floridaLienCases.some((caseItem) => caseItem.contractorId === contractor.id && caseItem.id === item.entityId) ||
      contractorRiskOps.serviceFeeOrders.some((fee) => fee.contractorId === contractor.id && fee.id === item.entityId),
    ),
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

export function submitManagedRecoveryCase(
  contractorId: string,
  input: ManagedRecoveryCaseInput,
): ManagedRecoveryCase {
  const now = new Date().toISOString()
  const priority = paymentRecoveryPriority({
    amountDue: input.amountDue,
    invoiceAgeDays: input.invoiceAgeDays,
  })

  return {
    id: `managed_recovery_${Date.now()}`,
    contractorId,
    clientName: input.clientName,
    clientEmailMasked: input.clientEmail ? maskEmail(input.clientEmail) : undefined,
    city: input.city,
    state: input.state.toUpperCase(),
    amountDue: input.amountDue,
    invoiceAgeDays: input.invoiceAgeDays,
    preferredChannel: input.preferredChannel,
    status: "fee_due",
    priority,
    evidenceVaultItemIds: parseDelimitedIds(input.evidenceVaultItemIds),
    nextAction: "Pay the service fee, upload supporting documents, and watch for Resolution Desk review.",
    summary: input.summary,
    contractorDirectPayment: true,
    complianceFlags: [
      "Client Bureau seeks a documented contractor-direct resolution.",
      "Recovery communications must stay factual, respectful, and privately logged.",
      "Client payments are not held by Client Bureau in this workflow.",
    ],
    createdAt: now,
    updatedAt: now,
  }
}

export function createServiceFeeOrder(
  contractorId: string,
  input: ServiceFeeCheckoutInput,
): ServiceFeeOrder {
  const now = new Date().toISOString()
  const fee = serviceFeeForKind(input.kind)

  return {
    id: `service_fee_${Date.now()}`,
    contractorId,
    kind: input.kind,
    entityId: input.entityId,
    status: "checkout_ready",
    clientBureauFeeCents: fee.clientBureauFeeCents,
    passThroughFeeCents: fee.passThroughFeeCents,
    currency: "usd",
    stripeCheckoutUrl: `/api/stripe/service-fee/checkout?kind=${input.kind}&entity=${encodeURIComponent(input.entityId)}`,
    createdAt: now,
    updatedAt: now,
  }
}

export function runRecoveryPrecheck(input: ServicePrecheckInput): ServiceReadinessSummary {
  const recoveryCase =
    contractorRiskOps.managedRecoveryCases.find((item) => item.id === input.caseId) ??
    contractorRiskOps.managedRecoveryCases[0]

  return buildRecoveryReadinessSummary({
    recoveryCase: {
      ...recoveryCase,
      readinessCheckedAt: new Date().toISOString(),
    },
    evidenceVault: contractorRiskOps.evidenceVault,
    serviceFeeOrders: contractorRiskOps.serviceFeeOrders,
    documentLinks: contractorRiskOps.caseDocumentLinks,
  })
}

export function runFloridaLienPrecheck(input: ServicePrecheckInput): ServiceReadinessSummary {
  const lienCase =
    contractorRiskOps.floridaLienCases.find((item) => item.id === input.caseId) ??
    contractorRiskOps.floridaLienCases[0]

  return buildFloridaLienReadinessSummary({
    lienCase: {
      ...lienCase,
      readinessCheckedAt: new Date().toISOString(),
    },
    evidenceVault: contractorRiskOps.evidenceVault,
    serviceFeeOrders: contractorRiskOps.serviceFeeOrders,
    documentLinks: contractorRiskOps.caseDocumentLinks,
  })
}

export function linkEvidenceToServiceCase(
  contractorId: string,
  input: LinkEvidenceToServiceCaseInput,
): CaseDocumentLink {
  const now = new Date().toISOString()

  return {
    id: `case_doc_${Date.now()}`,
    contractorId,
    entityType: input.entityType,
    entityId: input.entityId,
    evidenceVaultItemId: input.evidenceVaultItemId,
    documentLabel: input.documentLabel,
    documentCategory: input.documentCategory,
    publicSummary: input.publicSummary || "Document reviewed privately.",
    createdAt: now,
  }
}

export function markServiceFeePaid(input: MarkServiceFeePaidInput): ServiceFeeOrder {
  const now = new Date().toISOString()
  const existing = contractorRiskOps.serviceFeeOrders.find((item) => item.id === input.orderId)

  return {
    ...(existing ?? contractorRiskOps.serviceFeeOrders[0]),
    id: input.orderId,
    status: "paid",
    paidAt: now,
    updatedAt: now,
  }
}

export function logResolutionDeskContact(
  input: ResolutionDeskContactInput & { loggedByName: string },
): RecoveryCommunication {
  const now = new Date().toISOString()
  const existing = contractorRiskOps.managedRecoveryCases.find((item) => item.id === input.caseId)

  return {
    id: `recovery_comm_${Date.now()}`,
    managedRecoveryCaseId: input.caseId,
    contractorId: existing?.contractorId ?? "contractor_01",
    channel: input.channel,
    direction: input.direction,
    subject: input.subject,
    note: input.note,
    outcome: input.outcome,
    contactedAt: input.contactedAt,
    loggedByName: input.loggedByName,
    createdAt: now,
  }
}

export function markRecoveryResolved(input: MarkRecoveryResolvedInput): ManagedRecoveryCase {
  const now = new Date().toISOString()
  const existing = contractorRiskOps.managedRecoveryCases.find((item) => item.id === input.caseId)

  return {
    ...(existing ?? contractorRiskOps.managedRecoveryCases[0]),
    id: input.caseId,
    status: "resolved",
    nextAction: "Confirm contractor-direct payment records and close the case when documentation is complete.",
    summary: input.resolutionSummary,
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

export function submitFloridaLienCase(
  contractorId: string,
  input: SimulatedFloridaLienCaseInput,
): FloridaLienCase {
  const now = new Date().toISOString()

  return {
    id: `florida_lien_${Date.now()}`,
    contractorId,
    workflowType: input.workflowType,
    clientName: input.clientName,
    ownerName: input.ownerName,
    propertyCounty: input.propertyCounty,
    propertyCity: input.propertyCity,
    state: "FL",
    parcelNumber: input.parcelNumber,
    legalDescription: input.legalDescription,
    contractorRole: input.contractorRole,
    projectType: input.projectType,
    contractAmount: input.contractAmount,
    amountDue: input.amountDue,
    firstWorkDate: input.firstWorkDate,
    lastWorkDate: input.lastWorkDate,
    noticeHistory: input.noticeHistory,
    filingDeadline: input.filingDeadline,
    targetSendDate: input.targetSendDate,
    status: "fee_due",
    deliveryMethod: input.deliveryMethod,
    filingMethod: input.filingMethod,
    recordingVendor: input.recordingVendor,
    attorneyVendorStatus: "not_started",
    nextAction: "Pay the service fee, attach required documents, and sign authorization before attorney/vendor review.",
    privateSummary: input.privateSummary,
    createdAt: now,
    updatedAt: now,
  }
}

export function signLienFilingAuthorization(
  contractorId: string,
  input: LienFilingAuthorizationInput,
): FloridaLienCase {
  const now = new Date().toISOString()
  const existing = contractorRiskOps.floridaLienCases.find((item) => item.id === input.caseId)

  return {
    ...(existing ?? contractorRiskOps.floridaLienCases[0]),
    id: input.caseId,
    contractorId: existing?.contractorId ?? contractorId,
    status: "attorney_vendor_review",
    contractorSignedAt: now,
    contractorSignatureName: input.signerName,
    attorneyVendorStatus: "queued",
    nextAction: "Authorization received. Attorney/vendor review can verify eligibility, deadlines, recipients, and recording details.",
    updatedAt: now,
  }
}

function updateFloridaLienCase(caseId: string, updates: Partial<FloridaLienCase>): FloridaLienCase {
  const now = new Date().toISOString()
  const existing = contractorRiskOps.floridaLienCases.find((item) => item.id === caseId)

  return {
    ...(existing ?? contractorRiskOps.floridaLienCases[0]),
    id: caseId,
    ...updates,
    updatedAt: now,
  }
}

export function adminRequestLienMoreInfo(input: AdminLienCaseActionInput): FloridaLienCase {
  return updateFloridaLienCase(input.caseId, {
    status: "needs_more_info",
    attorneyVendorStatus: "in_review",
    nextAction: `More information requested: ${input.decisionNote}`,
  })
}

export function adminApproveLienNotice(input: AdminLienCaseActionInput): FloridaLienCase {
  return updateFloridaLienCase(input.caseId, {
    status: "approved_to_send",
    attorneyVendorStatus: "approved",
    nextAction: `Notice packet approved to send after review: ${input.decisionNote}`,
  })
}

export function adminApproveLienFiling(input: AdminLienCaseActionInput): FloridaLienCase {
  return updateFloridaLienCase(input.caseId, {
    status: "approved_to_file",
    attorneyVendorStatus: "approved",
    nextAction: `Claim of lien filing approved for attorney/vendor submission: ${input.decisionNote}`,
  })
}

export function adminRecordLienFiled(input: AdminRecordLienFiledInput): LienFilingRecord {
  const now = new Date().toISOString()
  const existing = contractorRiskOps.floridaLienCases.find((item) => item.id === input.caseId)

  return {
    id: `lien_filing_${Date.now()}`,
    floridaLienCaseId: input.caseId,
    contractorId: existing?.contractorId ?? "contractor_01",
    filingMethod: input.filingMethod,
    recordingVendor: input.recordingVendor,
    clerkCounty: input.clerkCounty,
    clerkReference: input.clerkReference,
    officialRecordBook: input.officialRecordBook,
    officialRecordPage: input.officialRecordPage,
    instrumentNumber: input.instrumentNumber,
    filedAt: input.filedAt,
    filingReceiptPath: input.filingReceiptPath,
    status: "filed",
    createdAt: now,
    updatedAt: now,
  }
}

export function adminUploadRecordingProof(input: AdminUploadRecordingProofInput): LienFilingRecord {
  const now = new Date().toISOString()
  const existing = contractorRiskOps.lienFilingRecords.find((item) => item.id === input.filingRecordId)

  return {
    ...(existing ?? contractorRiskOps.lienFilingRecords[0]),
    id: input.filingRecordId,
    officialRecordBook: input.officialRecordBook,
    officialRecordPage: input.officialRecordPage,
    instrumentNumber: input.instrumentNumber,
    recordingConfirmedAt: input.recordingConfirmedAt,
    status: "recording_confirmed",
    updatedAt: now,
  }
}

export function adminRecordLienRelease(input: AdminRecordLienReleaseInput): LienReleaseRecord {
  const now = new Date().toISOString()
  const existing = contractorRiskOps.floridaLienCases.find((item) => item.id === input.caseId)

  return {
    id: `lien_release_${Date.now()}`,
    floridaLienCaseId: input.caseId,
    contractorId: existing?.contractorId ?? "contractor_01",
    releaseReason: input.releaseReason,
    releaseStatus: input.releaseStatus,
    releaseRecordedAt: input.releaseRecordedAt,
    releaseInstrumentNumber: input.releaseInstrumentNumber,
    notes: input.notes,
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
  const agreement = agreementDefaults(input)

  return {
    id: `contract_packet_${Date.now()}`,
    contractorId,
    clientName: input.clientName,
    clientLegalName: input.clientLegalName,
    contractorLegalName: input.contractorLegalName,
    projectType: input.projectType,
    templateType: input.templateType,
    status: input.requiredBeforeScheduling ? "review_ready" : "draft",
    packetValue: input.packetValue,
    depositRequired: input.depositRequired,
    milestoneCount: input.milestoneCount,
    requiredBeforeScheduling: Boolean(input.requiredBeforeScheduling),
    scopeSummary: agreement.scopeSummary,
    includedWork: agreement.includedWork,
    excludedWork: agreement.excludedWork,
    paymentTerms: agreement.paymentTerms,
    milestoneSchedule: agreement.milestoneSchedule,
    changeOrderPolicy: agreement.changeOrderPolicy,
    cancellationPolicy: agreement.cancellationPolicy,
    projectStartDate: input.projectStartDate,
    projectEndDate: input.projectEndDate,
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

function withAgreementDefaults(item: ContractPacket): ContractPacket {
  const existingMilestones = item.milestoneSchedule ?? []
  const fallback = agreementDefaults({
    clientName: item.clientName,
    clientLegalName: item.clientLegalName,
    contractorLegalName: item.contractorLegalName,
    projectType: item.projectType,
    templateType: item.templateType,
    packetValue: item.packetValue,
    depositRequired: item.depositRequired,
    milestoneCount: item.milestoneCount,
    requiredBeforeScheduling: item.requiredBeforeScheduling,
    scopeSummary: item.scopeSummary,
    includedWork: item.includedWork,
    excludedWork: item.excludedWork,
    paymentTerms: item.paymentTerms,
    milestoneSchedule: existingMilestones
      .map((milestone) => [milestone.label, milestone.amount, milestone.due].filter(Boolean).join(" | "))
      .join("\n"),
    changeOrderPolicy: item.changeOrderPolicy,
    cancellationPolicy: item.cancellationPolicy,
    projectStartDate: item.projectStartDate,
    projectEndDate: item.projectEndDate,
    nextAction: item.nextAction,
  })

  return {
    ...item,
    scopeSummary: item.scopeSummary ?? fallback.scopeSummary,
    includedWork: item.includedWork ?? fallback.includedWork,
    excludedWork: item.excludedWork ?? fallback.excludedWork,
    paymentTerms: item.paymentTerms ?? fallback.paymentTerms,
    milestoneSchedule: existingMilestones.length ? existingMilestones : fallback.milestoneSchedule,
    changeOrderPolicy: item.changeOrderPolicy ?? fallback.changeOrderPolicy,
    cancellationPolicy: item.cancellationPolicy ?? fallback.cancellationPolicy,
  }
}

function withShareDefaults(item: ContractPacket): ContractPacket {
  const agreementItem = withAgreementDefaults(item)
  const token = item.shareToken ?? contractShareToken(item)

  return {
    ...agreementItem,
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

export function signContractShare(
  input: ContractSignatureInput,
  audit?: ContractSignatureAuditInput,
): ContractPacket {
  const existing = getContractPacketByShareToken(input.shareToken)

  if (!existing) {
    throw new Error("Contract signing link was not found.")
  }

  const signed = buildSignedContractSnapshot(existing, input, audit)

  return {
    ...existing,
    status: "signed",
    clientEmailMasked: existing.clientEmailMasked ?? maskEmail(input.signerEmail),
    clientInviteStatus: "joined",
    signatureStatus: "client_signed",
    shareStatus: existing.paymentMode && existing.paymentMode !== "none" ? "payment_pending" : "signed",
    clientSignedAt: signed.signedRecordAt,
    signerName: signed.signerName,
    signatureNameHash: signed.signatureNameHash,
    signerEmailHash: signed.signerEmailHash,
    signerIpHash: signed.signerIpHash,
    signerUserAgentHash: signed.signerUserAgentHash,
    signedSnapshot: signed.signedSnapshot,
    signedDigest: signed.signedDigest,
    signedRecordAt: signed.signedRecordAt,
    nextAction: "Client signature recorded. Contractor should countersign, store the final agreement, and confirm payment timing before work starts.",
    updatedAt: signed.signedRecordAt,
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
  moderatorNote?: string,
): AdminReview {
  const audit = decision === "approved" ? simulateApprovalPublication(reportId, editedPublicSummary) : undefined

  return {
    id: `review_mock_${reportId}`,
    reportId,
    reviewerId: "user_admin_01",
    status: decision,
    editedPublicSummary,
    notes:
      moderatorNote ||
      (decision === "approved"
        ? `Approval publishes /client/${audit?.generatedSlug ?? "generated-slug"} and recalculates score to ${audit?.recalculatedScore ?? "N/A"}.`
        : "Rejection keeps this report private."),
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
