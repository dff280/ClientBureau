import type {
  ClientReport,
  ReportedBalanceSummary,
  RiskLevel,
  ScoreCategoryBreakdown,
  ScoreFactor,
} from "@/lib/types"
import { isPositiveReportCategory } from "@/lib/types"

const categoryWeights: Record<ClientReport["reportCategory"], number> = {
  "Non-payment": -24,
  "Late payment": -12,
  "Scope creep": -9,
  Chargeback: -18,
  "False complaint": -12,
  "Abusive behavior": -14,
  "No-show / cancellation": -8,
  "Positive experience": 10,
  "Would work with again": 14,
  Other: -4,
}

export function scoreToRiskLevel(score: number): RiskLevel {
  if (score >= 80) return "Low"
  if (score >= 65) return "Moderate"
  if (score >= 45) return "Elevated"
  return "High"
}

export function calculateClientBureauScore(reports: ClientReport[]) {
  const approvedReports = reports.filter((report) => report.status === "approved")
  if (approvedReports.length === 0) {
    return {
      score: 78,
      riskLevel: "Moderate" as RiskLevel,
      reportCount: 0,
    }
  }

  const score = approvedReports.reduce((currentScore, report) => {
    const unpaidPenalty = Math.min(16, Math.round(report.amountUnpaid / 750))
    const disputePenalty = report.status === "disputed" ? 6 : 0

    return currentScore + categoryWeights[report.reportCategory] - unpaidPenalty - disputePenalty
  }, 84)

  const normalizedScore = Math.max(22, Math.min(96, score))

  return {
    score: normalizedScore,
    riskLevel: scoreToRiskLevel(normalizedScore),
    reportCount: approvedReports.length,
  }
}

export function getScoreFactors(reports: ClientReport[]): ScoreFactor[] {
  const approvedReports = reports.filter((report) =>
    ["approved", "disputed"].includes(report.status),
  )
  const unpaidTotal = approvedReports.reduce((total, report) => total + report.amountUnpaid, 0)
  const positiveCount = approvedReports.filter((report) => isPositiveReportCategory(report.reportCategory)).length
  const disputeCount = approvedReports.filter((report) => report.status === "disputed").length
  const concernCount = approvedReports.length - positiveCount

  return [
    {
      label: "Approved report volume",
      impact: concernCount > 1 ? -10 : concernCount === 1 ? -5 : 4,
      tone: concernCount > 0 ? "negative" : "positive",
      description:
        concernCount > 0
          ? `${concernCount} approved concern report${concernCount === 1 ? "" : "s"} affect this profile.`
          : "No approved concern reports are currently published.",
    },
    {
      label: "Unpaid amount reported",
      impact: unpaidTotal > 0 ? -Math.min(18, Math.round(unpaidTotal / 900)) : 6,
      tone: unpaidTotal > 0 ? "negative" : "positive",
      description:
        unpaidTotal > 0
          ? `$${unpaidTotal.toLocaleString()} total unpaid amount is represented in approved reports.`
          : "Approved reports do not show an unpaid balance.",
    },
    {
      label: "Positive contractor reports",
      impact: positiveCount * 6,
      tone: positiveCount > 0 ? "positive" : "neutral",
      description:
        positiveCount > 0
          ? `${positiveCount} positive report${positiveCount === 1 ? "" : "s"} support this profile.`
          : "No positive reports are published yet.",
    },
    {
      label: "Dispute context",
      impact: disputeCount > 0 ? -6 : 3,
      tone: disputeCount > 0 ? "negative" : "neutral",
      description:
        disputeCount > 0
          ? `${disputeCount} report${disputeCount === 1 ? " has" : "s have"} active dispute context.`
          : "No active published dispute context is attached.",
    },
  ]
}

export function getReportedBalanceSummary(reports: ClientReport[]): ReportedBalanceSummary {
  const reviewableReports = reports.filter((report) =>
    ["approved", "disputed"].includes(report.status),
  )
  const resolvedStatuses = ["Paid in full", "Settled", "Resolved", "Admin verified"]
  const resolvedReports = reviewableReports.filter((report) =>
    report.resolutionStatus
      ? resolvedStatuses.includes(report.resolutionStatus)
      : ["paid", "settled", "resolved"].some((term) => report.paymentStatus.toLowerCase().includes(term)),
  )
  const disputedReports = reviewableReports.filter((report) =>
    report.status === "disputed" || report.resolutionStatus === "Disputed",
  )
  const totalReportedUnpaid = reviewableReports.reduce((total, report) => total + report.amountUnpaid, 0)
  const resolvedAmount = resolvedReports.reduce((total, report) => total + report.amountUnpaid, 0)

  return {
    totalReportedUnpaid,
    resolvedAmount,
    unresolvedAmount: Math.max(0, totalReportedUnpaid - resolvedAmount),
    resolvedReportCount: resolvedReports.length,
    openDisputeCount: disputedReports.length,
  }
}

export function getScoreCategoryBreakdown(reports: ClientReport[]): ScoreCategoryBreakdown[] {
  const reviewableReports = reports.filter((report) =>
    ["approved", "disputed"].includes(report.status),
  )
  const balance = getReportedBalanceSummary(reviewableReports)
  const positiveReports = reviewableReports.filter((report) => isPositiveReportCategory(report.reportCategory))
  const evidenceCount = reviewableReports.filter((report) => report.evidenceAttached).length
  const recentConcernCount = reviewableReports.filter((report) => {
    const createdAt = new Date(report.approvedAt ?? report.createdAt).getTime()
    const daysOld = (Date.now() - createdAt) / (1000 * 60 * 60 * 24)

    return daysOld <= 180 && !isPositiveReportCategory(report.reportCategory)
  }).length
  const reportVolumeScore = Math.max(30, Math.min(96, 92 - reviewableReports.length * 8 + positiveReports.length * 7))
  const paymentScore = Math.max(24, Math.min(96, 92 - Math.round(balance.unresolvedAmount / 350)))
  const disputeScore = Math.max(30, Math.min(96, 90 - balance.openDisputeCount * 18 + balance.resolvedReportCount * 8))
  const evidenceScore = reviewableReports.length === 0
    ? 72
    : Math.max(45, Math.min(95, 60 + Math.round((evidenceCount / reviewableReports.length) * 35)))
  const resolutionScore = Math.max(35, Math.min(96, 72 + balance.resolvedReportCount * 9 - balance.openDisputeCount * 10))
  const recencyScore = Math.max(35, Math.min(96, 88 - recentConcernCount * 13 + positiveReports.length * 4))

  return [
    {
      label: "Payment reliability",
      score: paymentScore,
      tone: toneForScore(paymentScore),
      description:
        balance.unresolvedAmount > 0
          ? `$${balance.unresolvedAmount.toLocaleString()} remains represented as unresolved reported balance.`
          : "Approved reports do not currently show an unresolved unpaid balance.",
    },
    {
      label: "Dispute activity",
      score: disputeScore,
      tone: toneForScore(disputeScore),
      description:
        balance.openDisputeCount > 0
          ? `${balance.openDisputeCount} active dispute or response context item${balance.openDisputeCount === 1 ? "" : "s"} is attached.`
          : "No active published dispute context is attached.",
    },
    {
      label: "Report volume",
      score: reportVolumeScore,
      tone: toneForScore(reportVolumeScore),
      description: `${reviewableReports.length} approved or disputed public report${reviewableReports.length === 1 ? "" : "s"} contribute to this profile.`,
    },
    {
      label: "Evidence confidence",
      score: evidenceScore,
      tone: toneForScore(evidenceScore),
      description:
        evidenceCount > 0
          ? `${evidenceCount} report${evidenceCount === 1 ? " has" : "s have"} evidence reviewed privately.`
          : "No public evidence summary is currently attached.",
    },
    {
      label: "Resolution history",
      score: resolutionScore,
      tone: toneForScore(resolutionScore),
      description:
        balance.resolvedReportCount > 0
          ? `${balance.resolvedReportCount} report${balance.resolvedReportCount === 1 ? " includes" : "s include"} resolved or paid context.`
          : "No resolved report update is currently published.",
    },
    {
      label: "Positive reports",
      score: Math.max(45, Math.min(96, 70 + positiveReports.length * 10)),
      tone: positiveReports.length > 0 ? "positive" : "neutral",
      description:
        positiveReports.length > 0
          ? `${positiveReports.length} positive contractor report${positiveReports.length === 1 ? "" : "s"} support this profile.`
          : "No approved positive reports are currently published.",
    },
    {
      label: "Recency",
      score: recencyScore,
      tone: toneForScore(recencyScore),
      description:
        recentConcernCount > 0
          ? `${recentConcernCount} concern report${recentConcernCount === 1 ? " is" : "s are"} recent enough to affect intake decisions.`
          : "No recent concern reports are currently emphasized.",
    },
  ]
}

function toneForScore(score: number): ScoreCategoryBreakdown["tone"] {
  if (score >= 80) return "positive"
  if (score >= 65) return "neutral"
  if (score >= 45) return "warning"

  return "critical"
}

export function paymentReliabilityLabel(score: number) {
  if (score >= 82) return "Strong payment reliability reported"
  if (score >= 67) return "Mixed payment reliability reported"
  if (score >= 48) return "Payment concerns reported"
  return "Repeated payment risk reported"
}

export function disputeHistoryLabel(reports: ClientReport[]) {
  const disputedCount = reports.filter((report) => report.status === "disputed").length
  if (disputedCount === 0) return "No published disputes on approved reports"
  if (disputedCount === 1) return "One active response or dispute is recorded"
  return `${disputedCount} active responses or disputes are recorded`
}
