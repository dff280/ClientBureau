import type { ClientReport, RiskLevel, ScoreFactor } from "@/lib/types"

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
  const positiveCount = approvedReports.filter((report) =>
    ["Positive experience", "Would work with again"].includes(report.reportCategory),
  ).length
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
