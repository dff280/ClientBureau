import {
  clientRatingBand,
  evidenceConfidenceLabel,
  responseStatusLabel,
  resolutionStatusLabel,
} from "@/lib/client-rating"
import type {
  ClientProfile,
  ClientSearchResult,
  PublicClientProfile,
  ReportCategory,
  RiskLevel,
} from "@/lib/types"
import { isPositiveReportCategory } from "@/lib/types"

type ClientDatabaseSearchInput = {
  query?: string
  state?: string
  riskLevel?: RiskLevel
  category?: ReportCategory
}

type ClientProfileConfidenceInput = ClientProfile &
  Partial<Pick<PublicClientProfile, "balanceSummary" | "clientResponses" | "evidence" | "positiveReports" | "reports">>

type ClientRatingDisplayInput = Pick<ClientProfile, "clientBureauScore" | "reportCount" | "riskLevel"> &
  Partial<Pick<PublicClientProfile, "balanceSummary" | "clientResponses" | "evidence" | "positiveReports" | "reports">> & {
    evidenceOnFile?: boolean
    openDisputeCount?: number
    positiveSignalCount?: number
    resolvedReportCount?: number
  }

type ClientRatingDisplayTone = "amber" | "emerald" | "rose" | "slate" | "sky"

export function clientDatabaseSearchHref(input: ClientDatabaseSearchInput = {}) {
  const params = new URLSearchParams({ profileType: "client" })

  if (input.query?.trim()) params.set("q", input.query.trim())
  if (input.state?.trim()) params.set("state", input.state.trim().toUpperCase())
  if (input.riskLevel) params.set("risk", input.riskLevel)
  if (input.category) params.set("category", input.category)

  return `/search?${params.toString()}`
}

export function clientProfileConfidence(profile: ClientProfileConfidenceInput) {
  const reports = profile.reports ?? []
  const reportCount = reports.length || profile.reportCount
  const positiveCount =
    profile.positiveReports?.length ??
    reports.filter((report) => isPositiveReportCategory(report.reportCategory)).length
  const concernCount = reports.length
    ? reports.filter((report) => !isPositiveReportCategory(report.reportCategory)).length
    : Math.max(0, profile.reportCount - positiveCount)
  const evidenceCount = profile.evidence?.length ?? reports.filter((report) => report.evidenceAttached).length
  const hasResponse = Boolean(profile.clientResponses?.length)
  const hasResolvedContext = Boolean(profile.balanceSummary?.resolvedReportCount)
  const hasOpenDispute = Boolean(profile.balanceSummary?.openDisputeCount)

  let score = 38
  score += Math.min(24, reportCount * 8)
  score += Math.min(18, evidenceCount * 6)
  score += Math.min(10, positiveCount * 4)
  if (hasResponse) score += 8
  if (hasResolvedContext) score += 8
  if (hasOpenDispute) score += 4

  const normalizedScore = Math.max(20, Math.min(96, score))
  const level = normalizedScore >= 78 ? "Strong" : normalizedScore >= 56 ? "Moderate" : "Limited"
  const evidenceConfidence = evidenceConfidenceLabel({
    evidenceCount,
    reportCount,
    hasEvidenceOnFile: reports.some((report) => report.evidenceAttached),
  })

  return {
    level,
    score: normalizedScore,
    summary:
      level === "Strong"
        ? "Multiple public signals support this profile context."
        : level === "Moderate"
          ? "Some public signals are available, but review the details before deciding."
          : "Limited public history is available. Treat the rating as early context, not a clearance signal.",
    tone: level === "Strong" ? "emerald" : level === "Moderate" ? "amber" : "slate",
    factors: [
      `${reportCount} approved public ${reportCount === 1 ? "report" : "reports"}`,
      `${positiveCount} positive ${positiveCount === 1 ? "reference" : "references"}`,
      `${concernCount} concern ${concernCount === 1 ? "report" : "reports"}`,
      `${evidenceConfidence} evidence confidence`,
      hasResponse ? "Client response context published" : "Response path available",
    ],
  } as const
}

function clientPublicHistoryCounts(profile: ClientRatingDisplayInput) {
  const reports = "reports" in profile && profile.reports ? profile.reports : []
  const storedReportCount = profile.reportCount ?? reports.length
  const positiveCount =
    "positiveReports" in profile && profile.positiveReports
      ? profile.positiveReports.length
      : "positiveSignalCount" in profile
        ? profile.positiveSignalCount ?? 0
        : reports.filter((report) => isPositiveReportCategory(report.reportCategory)).length
  const reportCount = Math.max(storedReportCount, reports.length, positiveCount)
  const concernCount = reports.length
    ? reports.filter((report) => !isPositiveReportCategory(report.reportCategory)).length
    : Math.max(0, reportCount - positiveCount)
  const openDisputeCount =
    "balanceSummary" in profile && profile.balanceSummary
      ? profile.balanceSummary.openDisputeCount
      : "openDisputeCount" in profile
        ? profile.openDisputeCount ?? 0
        : 0
  const resolvedReportCount =
    "balanceSummary" in profile && profile.balanceSummary
      ? profile.balanceSummary.resolvedReportCount
      : "resolvedReportCount" in profile
        ? profile.resolvedReportCount ?? 0
        : 0
  const evidenceCount =
    "evidence" in profile && profile.evidence
      ? profile.evidence.length
      : reports.filter((report) => report.evidenceAttached).length
  const hasEvidenceOnFile =
    evidenceCount > 0 ||
    reports.some((report) => report.evidenceAttached) ||
    ("evidenceOnFile" in profile && Boolean(profile.evidenceOnFile))

  return {
    concernCount,
    evidenceCount,
    hasEvidenceOnFile,
    openDisputeCount,
    positiveCount,
    reportCount,
    resolvedReportCount,
  }
}

export function clientRatingDisplay(profile: ClientRatingDisplayInput) {
  const counts = clientPublicHistoryCounts(profile)
  const ratingLabel = clientRatingBand(profile.clientBureauScore, counts.reportCount)
  const hasNoHistory = counts.reportCount === 0
  const isEarlyHistory = counts.reportCount === 1
  const onlyPositiveContext = counts.reportCount > 0 && counts.concernCount === 0 && counts.positiveCount > 0
  const hasConcernContext = counts.concernCount > 0
  let contextLabel = "Limited public history"
  let tone: ClientRatingDisplayTone = "slate"
  let summary = "No approved public report history is available yet. Treat this record as a starting point, not a clearance signal."

  if (hasNoHistory) {
    contextLabel = "Limited public history"
  } else if (onlyPositiveContext && isEarlyHistory) {
    contextLabel = "Early positive context"
    tone = "emerald"
    summary = "One approved positive experience is available. Review the detail, but do not treat one report as a complete history."
  } else if (onlyPositiveContext) {
    contextLabel = "Positive reported context"
    tone = "emerald"
    summary = "Approved positive experiences are present and no approved concern reports are currently shown on this public profile."
  } else if (hasConcernContext && isEarlyHistory) {
    contextLabel = "Early concern context"
    tone = "amber"
    summary = "One approved concern report is available. Review the report detail, evidence label, response path, and resolution status before deciding."
  } else if (counts.openDisputeCount > 0) {
    contextLabel = `${profile.riskLevel} context with open dispute`
    tone = "amber"
    summary = "Approved concern context is available with an open response or dispute signal. Read the report and response sections together."
  } else if (counts.resolvedReportCount > 0 && hasConcernContext) {
    contextLabel = `${profile.riskLevel} context with resolution history`
    tone = profile.riskLevel === "High" || profile.riskLevel === "Elevated" ? "amber" : "sky"
    summary = "Approved concern context is present, and at least one report includes resolved, paid, settled, or admin-verified status."
  } else if (hasConcernContext) {
    contextLabel = `${profile.riskLevel} caution context`
    tone = profile.riskLevel === "High" ? "rose" : profile.riskLevel === "Elevated" ? "amber" : "sky"
    summary = "Approved concern reports contribute to this context signal. It is not a legal finding, guarantee, or background check."
  }

  return {
    ...counts,
    contextLabel,
    ratingLabel,
    scoreDisplay: hasNoHistory ? "Limited history" : `${profile.clientBureauScore}/100`,
    scoreLabel: hasNoHistory
      ? "Insufficient public history"
      : isEarlyHistory
        ? "Early context rating"
        : "Client Bureau Context Rating",
    shouldShowNumericScore: !hasNoHistory,
    shouldShowRiskBadge: hasConcernContext && !isEarlyHistory,
    summary,
    tone,
  } as const
}

export function clientProfilePrimarySignals(profile: ClientProfileConfidenceInput | ClientSearchResult) {
  const reportCount = "reports" in profile && profile.reports ? profile.reports.length : profile.reportCount
  const positiveCount =
    "positiveReports" in profile && profile.positiveReports
      ? profile.positiveReports.length
      : "positiveSignalCount" in profile
        ? profile.positiveSignalCount ?? 0
        : 0
  const responseLabel =
    "clientResponses" in profile && profile.clientResponses && "balanceSummary" in profile && profile.balanceSummary
      ? responseStatusLabel(profile as Pick<PublicClientProfile, "clientResponses" | "balanceSummary">)
      : "Response available"
  const resolutionLabel =
    "balanceSummary" in profile && profile.balanceSummary
      ? resolutionStatusLabel(profile as Pick<PublicClientProfile, "balanceSummary">)
      : "paymentContextLabel" in profile
        ? profile.paymentContextLabel ?? "Payment context reviewed"
        : "Payment context reviewed"
  const evidenceLabel =
    "evidence" in profile && profile.evidence
      ? profile.evidence.length > 0 || Boolean(profile.reports?.some((report) => report.evidenceAttached))
        ? "Evidence on file"
        : "Evidence private"
      : "evidenceOnFile" in profile && profile.evidenceOnFile
        ? "Evidence on file"
        : "Evidence private"

  return {
    ratingLabel: clientRatingBand(profile.clientBureauScore, reportCount),
    reportMix: `${reportCount} public / ${positiveCount} positive`,
    evidenceLabel,
    responseLabel,
    resolutionLabel,
  }
}
