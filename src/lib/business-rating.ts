import type {
  BusinessRatingConfidence,
  BusinessRatingFactor,
  BusinessRatingGrade,
  ClientReport,
  ContractorProfile,
  ProfileRatingModel,
  ProfileType,
  ReportEvidence,
  Subscription,
} from "@/lib/types"
import { isPositiveReportCategory } from "@/lib/types"
import { slugify } from "@/lib/slug"

export const BUSINESS_RATING_VERSION = "business-rating-v3"
export const CONTRACTOR_BUSINESS_RATING_MODEL = "contractor_business_reliability_v3"
export const SUBCONTRACTOR_TRADE_RATING_MODEL = "subcontractor_trade_partner_reliability_v3"

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

function factorWithScore(item: BusinessRatingFactor, score: number): BusinessRatingFactor {
  return factor(item.label, score, item.maxScore, item.description)
}

function factorTotal(factors: BusinessRatingFactor[]) {
  return factors.reduce((sum, item) => sum + item.score, 0)
}

function isSubcontractorProfile(contractor: ContractorProfile) {
  const text = [contractor.trade, contractor.businessType, contractor.companySize, contractor.primaryGoal]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  return /\b(subcontract|sub contractor|sub-contractor|installer|crew|labor provider|trade professional)\b/.test(text)
}

function isBusinessSubjectReport(report: ClientReport, contractor: ContractorProfile) {
  if (report.contractorId === contractor.id && !report.subjectProfileId) return false

  return (
    report.subjectProfileType === "contractor" ||
    report.subjectProfileType === "subcontractor" ||
    report.relationshipType === "subcontractor_to_contractor" ||
    report.relationshipType === "contractor_to_subcontractor" ||
    report.relationshipType === "business_to_business" ||
    Boolean(report.reportedBusinessRole)
  )
}

function isApprovedConcernReport(report: ClientReport) {
  return report.status === "approved" && !isPositiveReportCategory(report.reportCategory)
}

export function businessHasApprovedNegativeSubjectHistory(contractor: ContractorProfile, reports: ClientReport[]) {
  return reports.some((report) => isApprovedConcernReport(report) && isBusinessSubjectReport(report, contractor))
}

export function businessInformationCompletenessScore(contractor: ContractorProfile) {
  const score =
    (contractor.businessName ? 10 : 0) +
    (contractor.trade ? 15 : 0) +
    (contractor.city && contractor.state ? 10 : 0) +
    (contractor.businessType ? 10 : 0) +
    (contractor.serviceArea ? 10 : 0) +
    (contractor.businessPhone ? 8 : 0) +
    (contractor.websiteUrl ? 8 : 0) +
    (contractor.licenseNumber ? 10 : 0) +
    (contractor.yearsInBusiness ? 8 : 0) +
    (contractor.companySize ? 6 : 0) +
    (contractor.primaryGoal ? 5 : 0)

  return clampScore(score, 100)
}

export function businessStarterFloor(contractor: ContractorProfile, profileKind: "contractor" | "subcontractor" = "contractor") {
  const completeness = businessInformationCompletenessScore(contractor)
  const hasBasicBusinessIdentity = Boolean(contractor.businessName && contractor.trade && contractor.city && contractor.state)
  let floor = hasBasicBusinessIdentity ? 78 : 68

  if (completeness >= 55) floor = 82
  if (completeness >= 75) floor = 86
  if (contractor.verificationStatus === "pending" && completeness >= 55) floor = Math.max(floor, 82)
  if (contractor.verificationStatus === "verified") floor = Math.max(floor, completeness >= 75 ? 92 : 88)
  if (profileKind === "subcontractor" && completeness >= 75) floor = Math.max(floor, 86)

  return Math.min(floor, 92)
}

export function businessRatingModelForProfileType(
  profileType: ProfileType,
  profileKind: "contractor" | "subcontractor" = "contractor",
): ProfileRatingModel {
  if (profileType === "client") return "client_risk"
  if (profileType === "subcontractor" || profileKind === "subcontractor") return SUBCONTRACTOR_TRADE_RATING_MODEL
  return CONTRACTOR_BUSINESS_RATING_MODEL
}

function applyProtectedFloor(factors: BusinessRatingFactor[], floor: number) {
  let adjusted = factors
  let needed = Math.max(0, floor - factorTotal(adjusted))

  if (needed <= 0) return adjusted

  for (const index of adjusted.map((_, itemIndex) => itemIndex)) {
    if (needed <= 0) break

    const item = adjusted[index]
    const capacity = item.maxScore - item.score
    if (capacity <= 0) continue

    const add = Math.min(capacity, needed)
    adjusted = adjusted.map((candidate, itemIndex) =>
      itemIndex === index ? factorWithScore(candidate, candidate.score + add) : candidate,
    )
    needed -= add
  }

  return adjusted
}

function approvedReportStats(contractor: ContractorProfile, reports: ClientReport[]) {
  const approvedReports = reports.filter((report) => report.status === "approved")
  const businessSubjectReports = approvedReports.filter((report) => isBusinessSubjectReport(report, contractor))
  const adverseSubjectReports = businessSubjectReports.filter((report) => !isPositiveReportCategory(report.reportCategory))
  const reporterContributedReports = approvedReports.filter((report) => report.contractorId === contractor.id && !isBusinessSubjectReport(report, contractor))
  const positiveReports = approvedReports.filter((report) => isPositiveReportCategory(report.reportCategory))
  const disputedReports = reports.filter((report) => report.status === "disputed" && isBusinessSubjectReport(report, contractor))
  const resolvedReports = businessSubjectReports.filter((report) =>
    ["Resolved", "Paid in full", "Settled", "Admin verified"].includes(report.resolutionStatus ?? "") || report.issueResolved,
  )
  const evidenceAttachedReports = reports.filter((report) => report.evidenceAttached)
  const signedContractReports = reports.filter((report) => report.signedContract)
  const writtenChangeOrderReports = reports.filter((report) => report.writtenChangeOrder)
  const scopeDocumentedReports = reports.filter((report) =>
    report.signedContract ||
    report.writtenChangeOrder ||
    ["Signed contract", "Written proposal accepted", "Text/email approval", "Purchase order/work order"].includes(report.scopeDocumentationStatus ?? ""),
  )
  const workAuthorizedReports = reports.filter((report) =>
    ["Authorized before work started", "Change order authorized", "Emergency work authorization"].includes(report.workAuthorizationStatus ?? ""),
  )
  const relationshipVerifiedReports = reports.filter((report) => Boolean(report.relationshipVerificationSummary))
  const relationshipReports = reports.filter((report) =>
    report.relationshipType === "subcontractor_to_contractor" ||
    report.relationshipType === "contractor_to_subcontractor" ||
    report.relationshipType === "business_to_business",
  )
  const tradeScopedReports = reports.filter((report) => report.tradeCategory || report.jobType || report.projectJobId)
  const paymentApplicationReports = reports.filter((report) => Boolean(report.paymentApplicationReference))
  const retainageReports = reports.filter((report) => (report.retainageAmount ?? 0) > 0)
  const licenseInsuranceReports = reports.filter((report) => Boolean(report.licenseInsuranceContext))
  const completedReports = reports.filter((report) => report.jobStatus?.toLowerCase().includes("complete"))
  const responseReports = businessSubjectReports.filter(
    (report) => report.clientResponded || report.responseStatus === "Response published" || report.responseStatus === "Resolved",
  )
  const totalUnpaid = adverseSubjectReports.reduce((sum, report) => sum + Math.max(0, report.amountUnpaid), 0)
  const totalContracted = adverseSubjectReports.reduce((sum, report) => sum + Math.max(0, report.contractAmount), 0)
  const unpaidRatio = totalContracted > 0 ? totalUnpaid / totalContracted : 0

  return {
    approvedReports,
    businessSubjectReports,
    adverseSubjectReports,
    reporterContributedReports,
    positiveReports,
    disputedReports,
    resolvedReports,
    evidenceAttachedReports,
    signedContractReports,
    writtenChangeOrderReports,
    scopeDocumentedReports,
    workAuthorizedReports,
    relationshipVerifiedReports,
    relationshipReports,
    tradeScopedReports,
    paymentApplicationReports,
    retainageReports,
    licenseInsuranceReports,
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
  const stats = approvedReportStats(contractor, reports)
  const completeness = businessInformationCompletenessScore(contractor)
  const hasNegativeSubjectHistory = businessHasApprovedNegativeSubjectHistory(contractor, reports)
  const identityScore =
    (contractor.verificationStatus === "verified" ? 18 : contractor.verificationStatus === "pending" ? 15 : 10) +
    (contractor.licenseNumber ? 2 : 0) +
    (contractor.serviceArea ? 2 : 0) +
    (contractor.yearsInBusiness ? 1 : 0) +
    (contractor.websiteUrl ? 1 : 0)
  const serviceReadinessScore =
    9 +
    (contractor.trade ? 3 : 0) +
    (contractor.businessType ? 2 : 0) +
    (contractor.businessPhone ? 1 : 0) +
    (contractor.companySize ? 1 : 0) +
    (contractor.primaryGoal ? 1 : 0) +
    (completeness >= 75 ? 1 : 0)
  const projectHistoryScore =
    12 +
    Math.min(stats.businessSubjectReports.length * 2, 4) +
    Math.min(stats.positiveReports.length * 3, 5) +
    Math.min(stats.resolvedReports.length * 2, 3)
  const documentationScore =
    9 +
    Math.min(stats.evidenceAttachedReports.length * 3 + evidence.length * 2, 5) +
    Math.min(stats.scopeDocumentedReports.length * 3, 6) +
    Math.min(stats.writtenChangeOrderReports.length * 2, 3) +
    Math.min(stats.relationshipVerifiedReports.length * 1.5, 2)
  const resolutionScore =
    15 +
    Math.min(stats.resolvedReports.length * 2, 5) -
    Math.min(stats.adverseSubjectReports.length * 4, 8) -
    Math.min(stats.disputedReports.length * 3, 6) -
    Math.min(Math.round(stats.unpaidRatio * 10), 8)
  const responseScore =
    5 +
    Math.min(stats.positiveReports.length * 1.5, 2) +
    Math.min(stats.resolvedReports.length * 1.5, 2) -
    Math.min(stats.disputedReports.length * 2, 4)
  let factors = [
    factor(
      "Business identity and verification",
      identityScore,
      22,
      "Measures verified business identity, license information on file, service-area clarity, and operating history.",
    ),
    factor(
      "Service readiness and profile completeness",
      serviceReadinessScore,
      18,
      "Rewards a complete operating profile: trade category, business type, public service area, contact readiness, company size, and platform intent.",
    ),
    factor(
      "Client-facing project history",
      projectHistoryScore,
      18,
      "Rewards approved subject history, positive experiences, resolved outcomes, and documented project context without penalizing businesses for submitting reports.",
    ),
    factor(
      "Contracts and evidence discipline",
      documentationScore,
      16,
      "Looks for private evidence, signed agreements, written change orders, documented project scope, and relationship verification.",
    ),
    factor(
      "Payment and resolution posture",
      resolutionScore,
      16,
      "Considers only approved adverse subject-history, dispute activity, unresolved payment context, and documented resolutions.",
    ),
    factor(
      "Account and response readiness",
      accountReadinessScore(subscription) + responseScore,
      8,
      "Reflects active account readiness plus the profile's response, correction, and resolution posture.",
    ),
  ]

  if (!hasNegativeSubjectHistory) {
    factors = applyProtectedFloor(factors, businessStarterFloor(contractor, "contractor"))
  }

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
      "Client Bureau Business Reliability Rating reflects verified business identity, service readiness, client-facing project history, contracts and evidence discipline, payment resolution posture, and account readiness. New businesses are not penalized for having limited public history. It is not a customer review score, legal finding, workmanship guarantee, or collection promise.",
  }
}

function calculateSubcontractorReliabilityRating(input: {
  contractor: ContractorProfile
  reports: ClientReport[]
  evidence: ReportEvidence[]
  subscription?: Subscription
}) {
  const { contractor, reports, evidence, subscription } = input
  const stats = approvedReportStats(contractor, reports)
  const completeness = businessInformationCompletenessScore(contractor)
  const hasNegativeSubjectHistory = businessHasApprovedNegativeSubjectHistory(contractor, reports)
  const tradeIdentityScore =
    (contractor.verificationStatus === "verified" ? 17 : contractor.verificationStatus === "pending" ? 14 : 10) +
    (contractor.licenseNumber ? 3 : 0) +
    (contractor.businessType ? 2 : 0) +
    (contractor.companySize ? 1 : 0) +
    (contractor.serviceArea ? 1 : 0) +
    Math.min(stats.licenseInsuranceReports.length, 1)
  const scopeDocumentationScore =
    11 +
    Math.min(stats.tradeScopedReports.length * 3, 5) +
    Math.min(stats.scopeDocumentedReports.length * 3, 6) +
    Math.min(stats.workAuthorizedReports.length * 2, 4) +
    (completeness >= 75 ? 1 : 0)
  const relationshipHistoryScore =
    10 +
    Math.min(stats.relationshipReports.length * 4, 7) +
    Math.min(stats.relationshipVerifiedReports.length * 3, 5) +
    Math.min(stats.positiveReports.length * 2, 2)
  const paymentChainScore =
    14 +
    Math.min(stats.evidenceAttachedReports.length * 2 + evidence.length * 2, 5) +
    Math.min(stats.paymentApplicationReports.length * 2, 3) +
    Math.min(stats.retainageReports.length * 1.5, 2) +
    Math.min(stats.resolvedReports.length * 2, 4) -
    Math.min(stats.adverseSubjectReports.length * 4, 8) -
    Math.min(stats.disputedReports.length * 3, 6) -
    Math.min(Math.round(stats.unpaidRatio * 12), 8)
  const evidenceCompletionScore =
    8 +
    Math.min(stats.evidenceAttachedReports.length * 2 + evidence.length * 2, 4) +
    Math.min(stats.completedReports.length * 2, 3) +
    Math.min(stats.positiveReports.length, 2)
  const communicationScore =
    5 +
    Math.min(stats.responseReports.length * 1.5, 2) +
    Math.min(stats.resolvedReports.length * 1.5, 2) -
    Math.min(stats.disputedReports.length * 1.5, 3)
  let factors = [
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
      "Rewards project scope detail, trade category, signed agreements, work authorization, and change-order documentation.",
    ),
    factor(
      "GC/sub relationship history",
      relationshipHistoryScore,
      18,
      "Looks at documented subcontractor-to-contractor or contractor-to-subcontractor project relationships and relationship verification.",
    ),
    factor(
      "Payment-chain reliability context",
      paymentChainScore,
      20,
      "Considers approved adverse subject-history, retainage, pay application context, unresolved payment context, evidence, and resolved payment-chain outcomes.",
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

  if (!hasNegativeSubjectHistory) {
    factors = applyProtectedFloor(factors, businessStarterFloor(contractor, "subcontractor"))
  }

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
      "Client Bureau Trade Partner Reliability Rating reflects trade credential readiness, scope documentation, GC/sub relationship history, payment-chain context, evidence, and resolution posture. New trade profiles are not penalized for limited public history. It is not a license verification service, legal finding, safety guarantee, or payment guarantee.",
  }
}

export function calculateBusinessRatingV3(input: {
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

export function calculateBusinessRating(input: {
  contractor: ContractorProfile
  reports: ClientReport[]
  evidence: ReportEvidence[]
  subscription?: Subscription
}) {
  return calculateBusinessRatingV3(input)
}
