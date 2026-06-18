import type { ClientReport, PublicClientProfile } from "@/lib/types"
import { isPositiveReportCategory } from "@/lib/types"

export type ClientRatingBand =
  | "Strong client history"
  | "Good client history"
  | "Moderate caution"
  | "Elevated caution"
  | "High caution"
  | "Early positive context"
  | "Early mixed context"
  | "Early concern context"
  | "Limited history"

export function clientRatingBand(score: number, reportCount = 1): ClientRatingBand {
  if (reportCount <= 0) return "Limited history"
  if (reportCount === 1) {
    if (score >= 75) return "Early positive context"
    if (score >= 60) return "Early mixed context"
    return "Early concern context"
  }
  if (score >= 90) return "Strong client history"
  if (score >= 75) return "Good client history"
  if (score >= 60) return "Moderate caution"
  if (score >= 40) return "Elevated caution"

  return "High caution"
}

export function clientRatingDisclaimer() {
  return "Client Bureau Ratings are based on contractor-submitted reports, available response context, and platform indicators. They are not credit scores, background checks, legal conclusions, or guarantees."
}

export function cleanPublicReportText(value?: string | null) {
  return (value ?? "")
    .replace(/\bdevliered\b/gi, "delivered")
    .replace(/\s+/g, " ")
    .trim()
}

export function responseStatusLabel(profile: Pick<PublicClientProfile, "clientResponses" | "balanceSummary">) {
  if (profile.clientResponses.length > 0) return "Response published"
  if (profile.balanceSummary.openDisputeCount > 0) return "Dispute context open"

  return "Response available"
}

export function resolutionStatusLabel(profile: Pick<PublicClientProfile, "balanceSummary">) {
  if (profile.balanceSummary.resolvedReportCount > 0) return "Resolved history present"
  if (profile.balanceSummary.openDisputeCount > 0) return "Open dispute context"
  if (profile.balanceSummary.unresolvedAmount > 0) return "Unresolved payment context"

  return "No open issue reported"
}

export function evidenceConfidenceLabel(input: {
  evidenceCount: number
  reportCount: number
  hasEvidenceOnFile?: boolean
}) {
  if (input.evidenceCount >= Math.max(2, input.reportCount)) return "Strong"
  if (input.evidenceCount > 0 || input.hasEvidenceOnFile) return "Medium"

  return "Limited"
}

export function clientRatingIndicators(profile: PublicClientProfile) {
  const positiveReports = profile.positiveReports.length
  const concernReports = profile.reports.filter((report) => !isPositiveReportCategory(report.reportCategory)).length
  const evidenceConfidence = evidenceConfidenceLabel({
    evidenceCount: profile.evidence.length,
    reportCount: profile.reports.length,
    hasEvidenceOnFile: profile.reports.some((report) => report.evidenceAttached),
  })

  return [
    {
      label: "Payment history",
      value:
        profile.balanceSummary.totalReportedUnpaid > 0
          ? "Payment issue reported"
          : "No payment issue reported",
    },
    {
      label: "Communication",
      value: positiveReports > 0 ? "Positive context present" : "Limited public context",
    },
    {
      label: "Dispute context",
      value: profile.balanceSummary.openDisputeCount > 0 ? "Open dispute context" : "No open dispute shown",
    },
    {
      label: "Resolution status",
      value: resolutionStatusLabel(profile),
    },
    {
      label: "Evidence confidence",
      value: evidenceConfidence,
    },
    {
      label: "Response status",
      value: responseStatusLabel(profile),
    },
    {
      label: "Report mix",
      value: `${concernReports} concern / ${positiveReports} positive`,
    },
  ]
}

export function reportResponseStatus(report: ClientReport) {
  if (report.status === "disputed") return "Disputed"
  if (report.resolutionStatus === "Resolved" || report.resolutionStatus === "Paid in full") return "Resolved"

  return "Pending response"
}
