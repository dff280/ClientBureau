import {
  adminReviews,
  clientProfiles,
  clientReports,
  clientResponses,
  contractorProfiles,
  reportEvidence,
  savedSearches,
  subscriptions,
  users,
} from "@/lib/mock-data"
import {
  calculateClientBureauScore,
  disputeHistoryLabel,
  getScoreFactors,
  paymentReliabilityLabel,
} from "@/lib/scoring"
import { buildClientSlug, ensureUniqueSlug } from "@/lib/slug"
import type { ClientReportInput } from "@/lib/schemas/client-bureau"
import type {
  AdminReview,
  ClientProfile,
  ClientReport,
  ClientSearchResult,
  PublicationAudit,
  PublicClientProfile,
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
  const positiveReports = reports.filter((report) =>
    ["Positive experience", "Would work with again"].includes(report.reportCategory),
  )
  const evidence = reportEvidence.filter((item) =>
    clientReports.some((report) => report.clientId === client.id && report.id === item.reportId),
  )
  const responses = clientResponses.filter(
    (response) => response.clientId === client.id && response.status === "published",
  )

  return {
    ...client,
    reports,
    positiveReports,
    clientResponses: responses,
    evidence,
    timeline: reviewableReports.flatMap(reportTimeline).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    ),
    scoreFactors: getScoreFactors(reviewableReports),
    paymentReliability: paymentReliabilityLabel(client.clientBureauScore),
    disputeHistory: disputeHistoryLabel(
      clientReports.filter((report) => report.clientId === client.id),
    ),
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
    moderationNote: `Mock client ${clientId} would publish at /client/${publicSlug} after approval.`,
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
        ? `Mock approval publishes /client/${audit?.generatedSlug ?? "generated-slug"} and recalculates score to ${audit?.recalculatedScore ?? "N/A"}.`
        : "Mock rejection keeps this report private.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
