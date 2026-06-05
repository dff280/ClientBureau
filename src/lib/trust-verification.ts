import type {
  ClientResponse,
  CommunityDiscussion,
  PublicClientProfile,
  ReportEvidence,
  ClientReport,
} from "@/lib/types"

export type TrustTone = "emerald" | "amber" | "blue" | "slate"
export type ReviewConfidenceLevel = "Strong" | "Moderate" | "Basic"

export interface PublicTrustBadge {
  id: string
  label: string
  description: string
  tone: TrustTone
}

export interface EvidenceIndicator {
  id: string
  label: string
  count: number
  description: string
}

export interface ModerationTransparencyStep {
  id: string
  label: string
  description: string
  status: "complete" | "available" | "not_started"
}

export interface PublicTrustSummary {
  verificationBadges: PublicTrustBadge[]
  evidenceIndicators: EvidenceIndicator[]
  confidence: {
    score: number
    level: ReviewConfidenceLevel
    summary: string
    factors: string[]
  }
  moderationSteps: ModerationTransparencyStep[]
  responseWorkflow: ModerationTransparencyStep[]
}

export function reviewConfidenceLevel(score: number): ReviewConfidenceLevel {
  if (score >= 76) return "Strong"
  if (score >= 50) return "Moderate"
  return "Basic"
}

export function calculateReviewConfidence(input: {
  reports: ClientReport[]
  evidence: ReportEvidence[]
  responses: ClientResponse[]
  discussions: CommunityDiscussion[]
}) {
  const approvedReports = input.reports.filter((report) => report.status === "approved").length
  const disputedReports = input.reports.filter((report) => report.status === "disputed").length
  const evidenceBackedReports = input.reports.filter((report) => report.evidenceAttached).length
  const resolvedReports = input.reports.filter((report) =>
    ["Paid in full", "Settled", "Resolved", "Admin verified"].includes(report.resolutionStatus ?? ""),
  ).length
  const verifiedDiscussions = input.discussions.filter((discussion) => discussion.isVerified).length

  const reportScore = Math.min(30, approvedReports * 8 + disputedReports * 4)
  const evidenceScore = Math.min(25, input.evidence.length * 5 + evidenceBackedReports * 4)
  const moderationScore = input.reports.length > 0 ? 20 : 8
  const responseScore = input.responses.length > 0 ? 10 : 4
  const resolutionScore = Math.min(10, resolvedReports * 5)
  const discussionScore = Math.min(5, verifiedDiscussions * 3)
  const score = Math.min(100, reportScore + evidenceScore + moderationScore + responseScore + resolutionScore + discussionScore)
  const level = reviewConfidenceLevel(score)

  return {
    score,
    level,
    summary:
      level === "Strong"
        ? "Multiple trust signals support this public profile, including moderation and private evidence-review context."
        : level === "Moderate"
          ? "This profile has meaningful public moderation context, with additional trust signals still developing."
          : "This profile is public and moderated, but has a limited volume of supporting trust signals.",
    factors: [
      `${input.reports.length} public moderated report${input.reports.length === 1 ? "" : "s"}`,
      `${input.evidence.length} private evidence indicator${input.evidence.length === 1 ? "" : "s"}`,
      `${input.responses.length} published response or dispute update${input.responses.length === 1 ? "" : "s"}`,
      `${resolvedReports} resolved or admin-verified report${resolvedReports === 1 ? "" : "s"}`,
    ],
  }
}

export function reportConfidenceScore(report: ClientReport) {
  let score = 30
  if (report.status === "approved") score += 25
  if (report.status === "disputed") score += 15
  if (report.evidenceAttached) score += 25
  if (report.approvedAt) score += 10
  if (report.resolutionStatus && report.resolutionStatus !== "Unresolved") score += 10

  return Math.min(100, score)
}

export function reportConfidenceLabel(report: ClientReport) {
  return reviewConfidenceLevel(reportConfidenceScore(report))
}

export function evidenceIndicators(evidence: ReportEvidence[]): EvidenceIndicator[] {
  const counts = new Map<string, number>()

  for (const item of evidence) {
    const value = `${item.fileType} ${item.fileName}`.toLowerCase()
    if (value.includes("invoice")) increment(counts, "Invoices reviewed")
    else if (value.includes("screenshot")) increment(counts, "Screenshots reviewed")
    else if (value.includes("photo") || value.includes("image") || value.includes("jpg") || value.includes("png")) {
      increment(counts, "Photos reviewed")
    } else if (value.includes("contract") || value.includes("pdf") || value.includes("document")) {
      increment(counts, "Documents reviewed")
    } else {
      increment(counts, "Files reviewed")
    }
  }

  if (counts.size === 0) {
    return [
      {
        id: "evidence-private",
        label: "Private review available",
        count: 0,
        description: "No public evidence indicators are attached to approved summaries yet.",
      },
    ]
  }

  return Array.from(counts.entries()).map(([label, count]) => ({
    id: label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
    label,
    count,
    description: "Reviewed privately by moderation. Raw files are not public.",
  }))
}

export function getPublicTrustSummary(profile: PublicClientProfile): PublicTrustSummary {
  const allReportsModerated = profile.reports.every((report) => ["approved", "disputed"].includes(report.status))
  const evidence = evidenceIndicators(profile.evidence)
  const confidence = calculateReviewConfidence({
    reports: profile.reports,
    evidence: profile.evidence,
    responses: profile.clientResponses,
    discussions: profile.communityDiscussions,
  })
  const hasVerifiedDiscussion = profile.communityDiscussions.some((discussion) => discussion.isVerified)

  return {
    verificationBadges: [
      {
        id: "public-profile",
        label: "Verified public profile",
        description: "Profile is public only after an approved report creates or updates the public record.",
        tone: "emerald",
      },
      {
        id: "moderated-summaries",
        label: allReportsModerated ? "Moderated summaries" : "Moderation pending",
        description: "Published report summaries are reviewed before appearing on public pages.",
        tone: allReportsModerated ? "blue" : "amber",
      },
      {
        id: "private-evidence",
        label: profile.evidence.length > 0 ? "Evidence reviewed privately" : "Evidence privacy protected",
        description: "Public profiles show evidence categories only, not raw files or storage paths.",
        tone: profile.evidence.length > 0 ? "emerald" : "slate",
      },
      {
        id: "response-path",
        label: "Right-of-response available",
        description: "Clients can submit a response, correction request, dispute, or resolution update.",
        tone: "amber",
      },
      ...(hasVerifiedDiscussion
        ? [
            {
              id: "verified-discussion",
              label: "Verified discussion context",
              description: "At least one approved discussion entry includes verification context.",
              tone: "emerald" as const,
            },
          ]
        : []),
    ],
    evidenceIndicators: evidence,
    confidence,
    moderationSteps: [
      {
        id: "submitted",
        label: "Contractor report submitted",
        description: "A contractor submitted project facts, category, payment context, and summary.",
        status: profile.reports.length > 0 ? "complete" : "not_started",
      },
      {
        id: "evidence",
        label: "Evidence reviewed privately",
        description: "Invoices, documents, screenshots, photos, and related files remain private.",
        status: profile.evidence.length > 0 ? "complete" : "available",
      },
      {
        id: "summary",
        label: "Public summary moderated",
        description: "Public wording is limited to approved reported-experience summaries.",
        status: allReportsModerated ? "complete" : "available",
      },
      {
        id: "response",
        label: "Response and correction path open",
        description: "Responses and disputes are reviewed before public display.",
        status: "available",
      },
    ],
    responseWorkflow: [
      {
        id: "identify",
        label: "Verify contact",
        description: "The submitter provides contact information so moderation can match the profile.",
        status: "available",
      },
      {
        id: "document",
        label: "Attach documentation",
        description: "Supporting documents are reviewed privately and are not published as raw files.",
        status: "available",
      },
      {
        id: "moderate",
        label: "Moderation review",
        description: "Moderators review privacy, relevance, tone, documentation, and profile match.",
        status: "available",
      },
      {
        id: "publish",
        label: "Publish approved context",
        description: "Approved response, correction, dispute, or resolution context can appear publicly.",
        status: "available",
      },
    ],
  }
}

function increment(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1)
}
