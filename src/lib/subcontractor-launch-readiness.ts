import { profileSupportsType } from "@/lib/entity-profiles"
import type { EntityProfile } from "@/lib/types"

export type SubcontractorLaunchReadiness = {
  missing: string[]
  warnings: string[]
  ready: boolean
  score: number
  stage: "blocked" | "review" | "ready"
}

const tradePartnerRatingModels = new Set([
  "subcontractor_trade_partner_reliability",
  "subcontractor_trade_partner_reliability_v3",
])

const privateMarkerChecks: Array<{ label: string; pattern: RegExp }> = [
  { label: "raw email address", pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i },
  { label: "raw phone number", pattern: /(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}\b/ },
  { label: "street address", pattern: /\b\d{2,6}\s+[A-Z0-9][A-Z0-9\s.'-]+?\s+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd|court|ct|circle|cir|way|terrace|ter)\b/i },
  { label: "private evidence path", pattern: /\b(?:storage\/v1|supabase|s3:\/\/|evidence\/|uploads\/|private[_-]?evidence)\b/i },
  { label: "internal/admin note", pattern: /\b(?:admin note|internal note|staff note|moderator note)\b/i },
  { label: "private access detail", pattern: /\b(?:gate code|lockbox|private access code|garage code)\b/i },
]

export function subcontractorPublicTextFindings(value?: string) {
  const text = value ?? ""

  return privateMarkerChecks
    .filter((check) => check.pattern.test(text))
    .map((check) => check.label)
}

export function isTradePartnerRatingModel(value?: string) {
  return Boolean(value && tradePartnerRatingModels.has(value))
}

export function subcontractorLaunchReadiness(
  profile: EntityProfile,
  options: { duplicateCount?: number } = {},
): SubcontractorLaunchReadiness {
  const missing: string[] = []
  const warnings: string[] = []
  const publicSummary = profile.publicSummary?.trim() ?? ""
  const duplicateCount = options.duplicateCount ?? 0
  const hasVerification =
    ["claimed", "verified"].includes(profile.claimedStatus) ||
    Boolean(profile.verificationBadges?.length) ||
    ["business_verified", "license_verified", "insurance_verified", "admin_verified"].includes(
      String(profile.verificationLevel),
    )
  const publicSummaryFindings = subcontractorPublicTextFindings(publicSummary)

  if (!profileSupportsType(profile, "subcontractor")) missing.push("Profile type or account capabilities must include subcontractor")
  if (!profile.displayName && !profile.businessName) missing.push("Real business or trade display name")
  if (!profile.city || !profile.state) missing.push("City and state")
  if (!profile.profileSubtype) missing.push("Subcontractor subtype")
  if (!profile.tradeCategory && !profile.profileSubtype) missing.push("Canonical trade category or clear trade subtype")
  if (publicSummary.length < 40) missing.push("Neutral public-safe summary")
  if (publicSummaryFindings.length > 0) {
    missing.push(`Public summary must remove ${publicSummaryFindings.join(", ")}`)
  }
  if (!hasVerification) missing.push("Claim, verification, or documented moderator context")
  if (!profile.isPublic) missing.push("Public visibility enabled after review")
  if (!isTradePartnerRatingModel(profile.ratingModel)) missing.push("Rating model set to Trade Partner Reliability")
  if (profile.ratingScore <= 0) missing.push("Trade Partner Reliability Rating")
  if (profile.claimedStatus === "disputed") missing.push("Dispute resolved or clearly moderated before launch")
  if (duplicateCount > 1) missing.push("Duplicate identity group reviewed or resolved")

  if (!profile.tradeCategory && profile.profileSubtype) warnings.push("Use a canonical trade category when available")
  if (profile.reportCount === 0) warnings.push("No approved public report context yet; launch copy should use limited-history language")
  if (profile.evidenceOnFileCount === 0) warnings.push("No public evidence-on-file indicator yet")

  const score = Math.max(0, Math.min(100, 100 - missing.length * 11 - warnings.length * 3))
  const ready = missing.length === 0
  const stage = ready ? "ready" : score >= 70 ? "review" : "blocked"

  return {
    missing,
    warnings,
    ready,
    score,
    stage,
  }
}
