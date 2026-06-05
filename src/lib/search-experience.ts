import type { ClientSearchResult, ReportCategory, RiskLevel } from "@/lib/types"

export interface SearchPreviewProfile {
  id: string
  firstName: string
  lastName: string
  businessName?: string
  city: string
  state: string
  publicSlug: string
  clientBureauScore: number
  riskLevel: RiskLevel
  reportCount: number
  updatedAt: string
  matchedBy: string
  matchScore: number
  latestCategory?: ReportCategory
  latestSummary?: string
}

export interface SearchExperienceStats {
  publicProfiles: number
  approvedReportSignals: number
  highAttentionProfiles: number
  positiveSignalProfiles: number
  statesCovered: number
  averageScore: number
}

export function toSearchPreviewProfile(result: ClientSearchResult): SearchPreviewProfile {
  return {
    id: result.id,
    firstName: result.firstName,
    lastName: result.lastName,
    businessName: result.businessName,
    city: result.city,
    state: result.state,
    publicSlug: result.publicSlug,
    clientBureauScore: result.clientBureauScore,
    riskLevel: result.riskLevel,
    reportCount: result.reportCount,
    updatedAt: result.updatedAt,
    matchedBy: result.matchedBy,
    matchScore: result.matchScore,
    latestCategory: result.latestCategory,
    latestSummary: result.latestSummary,
  }
}

export function buildSearchExperienceStats(profiles: SearchPreviewProfile[]): SearchExperienceStats {
  const publicProfiles = profiles.length
  const approvedReportSignals = profiles.reduce((sum, profile) => sum + profile.reportCount, 0)
  const highAttentionProfiles = profiles.filter(
    (profile) => profile.riskLevel === "Elevated" || profile.riskLevel === "High",
  ).length
  const positiveSignalProfiles = profiles.filter((profile) =>
    profile.latestCategory === "Positive experience" || profile.latestCategory === "Would work with again",
  ).length
  const statesCovered = new Set(profiles.map((profile) => profile.state)).size
  const averageScore = publicProfiles
    ? Math.round(profiles.reduce((sum, profile) => sum + profile.clientBureauScore, 0) / publicProfiles)
    : 0

  return {
    publicProfiles,
    approvedReportSignals,
    highAttentionProfiles,
    positiveSignalProfiles,
    statesCovered,
    averageScore,
  }
}

export function formatClientName(profile: Pick<SearchPreviewProfile, "firstName" | "lastName">) {
  return `${profile.firstName} ${profile.lastName}`.trim()
}

export function getPreviewSearchText(profile: SearchPreviewProfile) {
  return [
    profile.firstName,
    profile.lastName,
    profile.businessName,
    profile.city,
    profile.state,
    profile.riskLevel,
    profile.latestCategory,
    profile.latestSummary,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
}
