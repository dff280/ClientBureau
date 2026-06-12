import type {
  BusinessRatingConfidence,
  BusinessRatingFactor,
  BusinessRatingGrade,
  ClientReport,
  ContractorProfile,
  ReportEvidence,
  Subscription,
} from "@/lib/types"
import { isPositiveReportCategory } from "@/lib/types"
import { slugify } from "@/lib/slug"

export function buildBusinessSlug(input: Pick<ContractorProfile, "businessName" | "city" | "state">) {
  return slugify(`${input.businessName} ${input.city} ${input.state}`)
}

export function businessRatingGrade(score: number): BusinessRatingGrade {
  if (score >= 92) return "A+"
  if (score >= 82) return "A"
  if (score >= 68) return "B"
  if (score >= 50) return "C"

  return "Review Pending"
}

export function businessRatingConfidence(input: {
  approvedReports: number
  evidenceCount: number
  verificationStatus: ContractorProfile["verificationStatus"]
}): BusinessRatingConfidence {
  if (input.verificationStatus === "verified" && input.approvedReports >= 3 && input.evidenceCount >= 3) {
    return "Strong"
  }

  if (input.verificationStatus !== "unverified" && input.approvedReports >= 1) return "Moderate"

  return "Basic"
}

function clampScore(value: number, max: number) {
  return Math.max(0, Math.min(max, Math.round(value)))
}

function factorStatus(score: number, maxScore: number): BusinessRatingFactor["status"] {
  const ratio = maxScore > 0 ? score / maxScore : 0

  if (ratio >= 0.74) return "strong"
  if (ratio >= 0.42) return "good"

  return "needs_attention"
}

function factor(label: string, score: number, maxScore: number, description: string): BusinessRatingFactor {
  const safeScore = clampScore(score, maxScore)

  return {
    label,
    score: safeScore,
    maxScore,
    status: factorStatus(safeScore, maxScore),
    description,
  }
}

function isSubcontractorProfile(contractor: ContractorProfile) {
  const text = [contractor.trade, contractor.businessType, contractor.companySize, contractor.primaryGoal]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  return /\b(subcontract|sub contractor|sub-contractor|installer|crew|labor provider|trade professional)\b/.test(text)
}

function approvedReportStats(reports: ClientReport[]) {
  const approvedReports = reports.filter((report) => report.status === "approved")
  const positiveReports = approvedReports.filter((report) => isPositiveReportCategory(report.reportCategory))
  const disputedReports = reports.filter((report) => report.status === "disputed")
  const resolvedReports = reports.filter((report) =>
    ["Resolved", "Paid in full", "Settled", "Admin verified"].includes(report.resolutionStatus ?? "") || report.issueResolved,
  )
  const evidenceAttachedReports = reports.filter((report) => report.evidenceAttached)
  const signedContractReports = reports.filter((report) => report.signedContract)
  const writtenChangeOrderReports = reports.filter((report) => report.writtenChangeOrder)
  const relationshipReports = reports.filter((report) =>
    report.relationshipType === "subcontractor_to_contractor" ||
    report.relationshipType === "contractor_to_subcontractor" ||
    report.relationshipType === "business_to_business",
  )
  const tradeScopedReports = reports.filter((report) => report.tradeCategory || report.jobType || report.projectJobId)
  const completedReports = reports.filter((report) => report.jobStatus?.toLowerCase().includes("complete"))
  const responseReports = reports.filter(
    (report) => report.clientResponded || report.responseStatus === "Response published" || report.responseStatus === "Resolved",
  )
  const totalUnpaid = approvedReports.reduce((sum, report) => sum + Math.max(0, report.amountUnpaid), 0)
  const totalContracted = approvedReports.reduce((sum, report) => sum + Math.max(0, report.contractAmount), 0)
  const unpaidRatio = totalContracted > 0 ? totalUnpaid / totalContracted : 0

  return {
    approvedReports,
    positiveReports,
    disputedReports,
    resolvedReports,
    evidenceAttachedReports,
    signedContractReports,
    writtenChangeOrderReports,
    relationshipReports,
    tradeScopedReports,
    completedReports,
    responseReports,
    unpaidRatio,
  }
}

function accountReadinessScore(subscription?: Subscription) {
  if (!subscription || subscription.status === "canceled") return 5
  if (subscription.tier === "bureau_team") return 10
  if (subscription.tier === "pro") return 8

  return 6
}

function calculateContractorReliabilityRating(input: {
  contractor: ContractorProfile
  reports: ClientReport[]
  evidence: ReportEvidence[]
  subscription?: Subscription
}) {
  const { contractor, reports, evidence, subscription } = input
  const stats = approvedReportStats(reports)
  const identityScore =
    (contractor.verificationStatus === "verified" ? 16 : contractor.verificationStatus === "pending" ? 12 : 6) +
    (contractor.licenseNumber ? 2 : 0) +
    (contractor.serviceArea ? 2 : 0) +
    (contractor.yearsInBusiness ? 2 : 0)
  const projectHistoryScore =
    5 +
    Math.min(stats.approvedReports.length * 4, 8) +
    Math.min(stats.positiveReports.length * 3, 5) +
    Math.min(stats.resolvedReports.length * 2, 4)
  const documentationScore =
    Math.min(stats.evidenceAttachedReports.length * 4 + evidence.length * 2, 10) +
    Math.min(stats.signedContractReports.length * 3, 6) +
    Math.min(stats.writtenChangeOrderReports.length * 2, 4) +
    Math.min(stats.tradeScopedReports.length * 1.5, 2)
  const resolutionScore =
    12 +
    Math.min(stats.resolvedReports.length * 2, 5) -
    Math.min(stats.disputedReports.length * 4, 8) -
    Math.min(Math.round(stats.unpaidRatio * 10), 6)
  const responseScore =
    6 +
    Math.min(stats.positiveReports.length * 1.5, 2) +
    Math.min(stats.resolvedReports.length * 1.5, 2) -
    Math.min(stats.disputedReports.length * 2, 4)
  const factors = [
    factor(
      "Business identity and verification",
      identityScore,
      22,
      "Measures verified business identity, license information on file, service-area clarity, and operating history.",
    ),
    factor(
      "Client-facing project history",
      projectHistoryScore,
      22,
      "Rewards admin-approved project records, positive experiences, and resolved or paid-in-full outcomes.",
    ),
    factor(
      "Contracts and evidence discipline",
      documentationScore,
      22,
      "Looks for private evidence, signed agreements, written change orders, and documented project scope.",
    ),
    factor(
      "Payment and resolution posture",
      resolutionScore,
      18,
      "Considers unresolved payment context, dispute activity, and whether issues are resolved through documented records.",
    ),
    factor(
      "Account and response readiness",
      accountReadinessScore(subscription) + responseScore,
      16,
      "Reflects active account readiness plus the profile's response, correction, and resolution posture.",
    ),
  ]
  const score = clampScore(factors.reduce((sum, item) => sum + item.score, 0), 100)

  return {
    score,
    grade: businessRatingGrade(score),
    confidence: businessRatingConfidence({
      approvedReports: stats.approvedReports.length,
      evidenceCount: evidence.length,
      verificationStatus: contractor.verificationStatus,
    }),
    factors,
    profileKind: "contractor" as const,
    ratingName: "Business Reliability Rating",
    summary:
      "Client Bureau Business Reliability Rating reflects verified business identity, client-facing project history, contracts and evidence discipline, payment resolution posture, and account readiness. It is not a customer review score, legal finding, workmanship guarantee, or collection promise.",
  }
}

function calculateSubcontractorReliabilityRating(input: {
  contractor: ContractorProfile
  reports: ClientReport[]
  evidence: ReportEvidence[]
  subscription?: Subscription
}) {
  const { contractor, reports, evidence, subscription } = input
  const stats = approvedReportStats(reports)
  const tradeIdentityScore =
    (contractor.verificationStatus === "verified" ? 15 : contractor.verificationStatus === "pending" ? 11 : 6) +
    (contractor.licenseNumber ? 3 : 0) +
    (contractor.businessType ? 2 : 0) +
    (contractor.companySize ? 1 : 0) +
    (contractor.serviceArea ? 1 : 0)
  const scopeDocumentationScore =
    5 +
    Math.min(stats.tradeScopedReports.length * 4, 7) +
    Math.min(stats.signedContractReports.length * 3, 5) +
    Math.min(stats.writtenChangeOrderReports.length * 2, 3)
  const relationshipHistoryScore =
    4 +
    Math.min(stats.relationshipReports.length * 5, 8) +
    Math.min(stats.approvedReports.length * 2, 4) +
    Math.min(stats.positiveReports.length * 2, 2)
  const paymentChainScore =
    10 +
    Math.min(stats.evidenceAttachedReports.length * 3 + evidence.length * 2, 6) +
    Math.min(stats.resolvedReports.length * 2, 4) -
    Math.min(stats.disputedReports.length * 3, 6) -
    Math.min(Math.round(stats.unpaidRatio * 12), 8)
  const evidenceCompletionScore =
    Math.min(stats.evidenceAttachedReports.length * 3 + evidence.length * 2, 7) +
    Math.min(stats.completedReports.length * 2, 3) +
    Math.min(stats.positiveReports.length, 2)
  const communicationScore =
    4 +
    Math.min(stats.responseReports.length * 1.5, 2) +
    Math.min(stats.resolvedReports.length * 1.5, 2) -
    Math.min(stats.disputedReports.length * 1.5, 3)
  const factors = [
    factor(
      "Trade identity and credential readiness",
      tradeIdentityScore,
      22,
      "Measures verified trade identity, license or insurance indicators, service area, and crew/business readiness.",
    ),
    factor(
      "Scope and documentation clarity",
      scopeDocumentationScore,
      20,
      "Rewards project scope detail, trade category, signed agreements, and written change-order documentation.",
    ),
    factor(
      "GC/sub relationship history",
      relationshipHistoryScore,
      18,
      "Looks at documented subcontractor-to-contractor or contractor-to-subcontractor project relationships.",
    ),
    factor(
      "Payment-chain reliability context",
      paymentChainScore,
      20,
      "Considers retainage, unresolved payment context, evidence, and resolved payment-chain outcomes.",
    ),
    factor(
      "Evidence and completion readiness",
      evidenceCompletionScore,
      12,
      "Looks for private evidence, completion context, photos, invoices, contracts, and delivery documentation.",
    ),
    factor(
      "Communication and resolution posture",
      accountReadinessScore(subscription) * 0.4 + communicationScore,
      8,
      "Reflects response readiness, correction paths, account setup, and resolution-minded conduct.",
    ),
  ]
  const score = clampScore(factors.reduce((sum, item) => sum + item.score, 0), 100)

  return {
    score,
    grade: businessRatingGrade(score),
    confidence: businessRatingConfidence({
      approvedReports: stats.relationshipReports.length || stats.approvedReports.length,
      evidenceCount: evidence.length,
      verificationStatus: contractor.verificationStatus,
    }),
    factors,
    profileKind: "subcontractor" as const,
    ratingName: "Trade Partner Reliability Rating",
    summary:
      "Client Bureau Trade Partner Reliability Rating reflects trade credential readiness, scope documentation, GC/sub relationship history, payment-chain context, evidence, and resolution posture. It is not a license verification service, legal finding, safety guarantee, or payment guarantee.",
  }
}

export function calculateBusinessRating(input: {
  contractor: ContractorProfile
  reports: ClientReport[]
  evidence: ReportEvidence[]
  subscription?: Subscription
}) {
  if (isSubcontractorProfile(input.contractor)) {
    return calculateSubcontractorReliabilityRating(input)
  }

  return calculateContractorReliabilityRating(input)
}
