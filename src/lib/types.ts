export const reportCategories = [
  "Non-payment",
  "Late payment",
  "Scope creep",
  "Chargeback",
  "False complaint",
  "Abusive behavior",
  "No-show / cancellation",
  "Positive experience",
  "Would work with again",
  "Other",
] as const

export const riskLevels = ["Low", "Moderate", "Elevated", "High"] as const

export type ReportCategory = (typeof reportCategories)[number]
export type RiskLevel = (typeof riskLevels)[number]
export type ReportStatus = "pending" | "approved" | "rejected" | "disputed"
export type SubscriptionTier = "free" | "pro" | "bureau_team"
export type UserRole = "contractor" | "admin"
export type VerificationStatus = "unverified" | "pending" | "verified"
export type TimelineEventType =
  | "submitted"
  | "evidence_uploaded"
  | "moderation"
  | "approved"
  | "published"
  | "disputed"
  | "response_received"
export type ReviewChecklistStatus = "pass" | "warning" | "fail" | "pending"

export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  createdAt: string
}

export interface ContractorProfile {
  id: string
  userId: string
  businessName: string
  trade: string
  city: string
  state: string
  licenseNumber?: string
  verificationStatus: VerificationStatus
  createdAt: string
}

export interface ClientProfile {
  id: string
  firstName: string
  lastName: string
  businessName?: string
  city: string
  state: string
  zip?: string
  phoneHash: string
  emailHash: string
  publicSlug: string
  clientBureauScore: number
  riskLevel: RiskLevel
  reportCount: number
  createdAt: string
  updatedAt: string
  isPublic: boolean
}

export interface ClientReport {
  id: string
  contractorId: string
  clientId: string
  projectType: string
  projectCity: string
  projectState: string
  contractAmount: number
  amountUnpaid: number
  reportCategory: ReportCategory
  paymentStatus: string
  reportSummary: string
  detailedExperience: string
  publicSummary: string
  evidenceAttached: boolean
  status: ReportStatus
  moderationNote?: string
  createdAt: string
  approvedAt?: string
  timeline?: ReportTimelineEvent[]
}

export interface ReportTimelineEvent {
  id: string
  reportId: string
  type: TimelineEventType
  title: string
  description: string
  createdAt: string
}

export interface ReviewChecklistItem {
  id: string
  reportId: string
  label: string
  description: string
  status: ReviewChecklistStatus
}

export interface ScoreFactor {
  label: string
  impact: number
  tone: "positive" | "negative" | "neutral"
  description: string
}

export interface PublicationAudit {
  reportId: string
  previousIsPublic: boolean
  nextIsPublic: boolean
  generatedSlug: string
  recalculatedScore: number
  recalculatedRiskLevel: RiskLevel
  publicSummary: string
  publishedAt: string
}

export interface ReportEvidence {
  id: string
  reportId: string
  fileName: string
  fileType: string
  storagePath: string
  uploadedAt: string
}

export interface ClientResponse {
  id: string
  clientId: string
  reportId?: string
  responseSummary: string
  status: "pending" | "published" | "rejected"
  createdAt: string
  publishedAt?: string
}

export interface Subscription {
  id: string
  contractorId: string
  tier: SubscriptionTier
  status: "trialing" | "active" | "past_due" | "canceled" | "mock"
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  stripePriceId?: string
  currentPeriodEnd?: string
}

export interface AdminReview {
  id: string
  reportId: string
  reviewerId?: string
  status: "queued" | "approved" | "rejected" | "needs_dispute_review"
  editedPublicSummary?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface SavedSearch {
  id: string
  contractorId: string
  query: string
  city?: string
  state?: string
  createdAt: string
}

export interface PublicClientProfile extends ClientProfile {
  reports: ClientReport[]
  positiveReports: ClientReport[]
  clientResponses: ClientResponse[]
  evidence: ReportEvidence[]
  timeline: ReportTimelineEvent[]
  scoreFactors: ScoreFactor[]
  paymentReliability: string
  disputeHistory: string
}

export interface SearchFilters {
  state?: string
  riskLevel?: RiskLevel
  category?: ReportCategory
}

export interface ClientSearchResult extends ClientProfile {
  matchedBy: string
  matchScore: number
  latestCategory?: ReportCategory
  latestSummary?: string
}

export type ActionResult<T> =
  | { ok: true; data: T; message: string }
  | {
      ok: false
      fieldErrors?: Record<string, string[]>
      message: string
    }
