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
