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

export function calculateBusinessRating(input: {
  contractor: ContractorProfile
  reports: ClientReport[]
  evidence: ReportEvidence[]
  subscription?: Subscription
}) {
  const approvedReports = input.reports.filter((report) => report.status === "approved")
  const publishedReports = approvedReports.length
  const positiveReports = approvedReports.filter((report) => isPositiveReportCategory(report.reportCategory))
  const disputedReports = input.reports.filter((report) => report.status === "disputed")
  const evidenceAttachedReports = input.reports.filter((report) => report.evidenceAttached).length

  const verificationScore =
    input.contractor.verificationStatus === "verified"
      ? 30
      : input.contractor.verificationStatus === "pending"
        ? 22
        : 10
  const documentationScore = Math.min(25, evidenceAttachedReports * 5 + input.evidence.length * 2)
  const contributionScore = Math.min(20, publishedReports * 4 + positiveReports.length * 2)
  const resolutionScore = Math.max(6, 15 - disputedReports.length * 3)
  const accountScore =
    input.subscription && input.subscription.status !== "canceled"
      ? input.subscription.tier === "bureau_team"
        ? 10
        : input.subscription.tier === "pro"
          ? 8
          : 6
      : 5
  const total = Math.max(
    0,
    Math.min(100, verificationScore + documentationScore + contributionScore + resolutionScore + accountScore),
  )
  const factors: BusinessRatingFactor[] = [
    {
      label: "Business verification",
      score: verificationScore,
      maxScore: 30,
      status: verificationScore >= 30 ? "strong" : verificationScore >= 20 ? "good" : "needs_attention",
      description:
        input.contractor.verificationStatus === "verified"
          ? "Business verification is complete."
          : "Business verification is not complete yet.",
    },
    {
      label: "Documentation discipline",
      score: documentationScore,
      maxScore: 25,
      status: documentationScore >= 18 ? "strong" : documentationScore >= 10 ? "good" : "needs_attention",
      description: "Looks at whether reports and workflows include private evidence records.",
    },
    {
      label: "Approved contribution history",
      score: contributionScore,
      maxScore: 20,
      status: contributionScore >= 14 ? "strong" : contributionScore >= 6 ? "good" : "needs_attention",
      description: "Reflects admin-approved contribution activity and positive client reports submitted.",
    },
    {
      label: "Resolution posture",
      score: resolutionScore,
      maxScore: 15,
      status: resolutionScore >= 12 ? "strong" : resolutionScore >= 8 ? "good" : "needs_attention",
      description: "Considers open dispute context and whether public records are handled through moderation.",
    },
    {
      label: "Account completeness",
      score: accountScore,
      maxScore: 10,
      status: accountScore >= 8 ? "strong" : accountScore >= 6 ? "good" : "needs_attention",
      description: "Rewards complete platform setup, plan status, and active account readiness.",
    },
  ]

  return {
    score: total,
    grade: businessRatingGrade(total),
    confidence: businessRatingConfidence({
      approvedReports: approvedReports.length,
      evidenceCount: input.evidence.length,
      verificationStatus: input.contractor.verificationStatus,
    }),
    factors,
    summary:
      "Client Bureau Business Rating reflects verification, documentation habits, approved contribution history, resolution posture, and account completeness. It is not a customer review score or a guarantee of workmanship.",
  }
}
