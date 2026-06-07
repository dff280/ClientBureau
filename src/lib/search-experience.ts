import { reportCategories } from "@/lib/types"
import type { ClientSearchResult, ReportCategory, RiskLevel, SearchSuggestion } from "@/lib/types"

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
  positiveSignalCount?: number
  openDisputeCount?: number
  resolvedReportCount?: number
  evidenceOnFile?: boolean
  paymentContextLabel?: string
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
    positiveSignalCount: result.positiveSignalCount,
    openDisputeCount: result.openDisputeCount,
    resolvedReportCount: result.resolvedReportCount,
    evidenceOnFile: result.evidenceOnFile,
    paymentContextLabel: result.paymentContextLabel,
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
    profile.paymentContextLabel,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
}

export function isPrivateIdentifierSearch(value: string) {
  const digits = value.replace(/\D/g, "")

  return value.includes("@") || digits.length >= 7
}

export function buildSearchHref({
  query,
  state,
  riskLevel,
  category,
}: {
  query?: string
  state?: string
  riskLevel?: RiskLevel
  category?: ReportCategory
}) {
  const params = new URLSearchParams()

  if (query?.trim()) params.set("q", query.trim())
  if (state?.trim()) params.set("state", state.trim().toUpperCase())
  if (riskLevel) params.set("risk", riskLevel)
  if (category) params.set("category", category)

  return `/search${params.size ? `?${params.toString()}` : ""}`
}

export function profilePreviewScore(profile: SearchPreviewProfile, query: string) {
  const value = query.trim().toLowerCase()
  const fullName = formatClientName(profile).toLowerCase()
  const businessName = profile.businessName?.trim().toLowerCase() ?? ""
  const cityState = `${profile.city} ${profile.state}`.toLowerCase()
  const latestCategory = profile.latestCategory?.toLowerCase() ?? ""
  const text = getPreviewSearchText(profile)
  const tokens = value.split(/\s+/).filter(Boolean)
  const tokenMatches = tokens.filter((token) =>
    fullName.includes(token) ||
    businessName.includes(token) ||
    cityState.includes(token) ||
    latestCategory.includes(token) ||
    text.includes(token),
  ).length

  if (!value) {
    return (
      profile.reportCount * 5 +
      profile.clientBureauScore +
      (profile.evidenceOnFile ? 6 : 0) +
      (profile.openDisputeCount ? 4 : 0)
    )
  }

  return (
    (fullName === value ? 120 : 0) +
    (fullName.startsWith(value) ? 80 : 0) +
    (fullName.includes(value) ? 45 : 0) +
    (businessName.includes(value) ? 35 : 0) +
    (cityState.includes(value) ? 20 : 0) +
    (latestCategory.includes(value) ? 16 : 0) +
    (text.includes(value) ? 10 : 0) +
    tokenMatches * 22 +
    (tokens.length > 1 && tokenMatches === tokens.length ? 35 : 0) +
    profile.reportCount * 4 +
    (profile.positiveSignalCount ?? 0) * 3 +
    (profile.evidenceOnFile ? 6 : 0) +
    profile.matchScore
  )
}

export function rankSearchPreviewProfiles(profiles: SearchPreviewProfile[], query: string) {
  return [...profiles].sort((a, b) => profilePreviewScore(b, query) - profilePreviewScore(a, query))
}

export function buildSearchSuggestions(
  profiles: SearchPreviewProfile[],
  query: string,
  state?: string,
): SearchSuggestion[] {
  const value = query.trim().toLowerCase()
  const suggestions: SearchSuggestion[] = []
  const seen = new Set<string>()

  function add(suggestion: SearchSuggestion) {
    if (seen.has(suggestion.id)) return
    seen.add(suggestion.id)
    suggestions.push(suggestion)
  }

  if (isPrivateIdentifierSearch(query)) {
    add({
      id: "private-identifier-check",
      kind: "private_identifier",
      label: "Run a private identifier check",
      description: "Phone and email searches use private matching and never display raw identifiers publicly.",
      href: buildSearchHref({ query, state }),
      query,
      state,
      score: 100,
    })
  }

  for (const profile of rankSearchPreviewProfiles(profiles, query).slice(0, 5)) {
    const name = formatClientName(profile)
    const matchesProfile =
      !value ||
      getPreviewSearchText(profile).includes(value) ||
      name.toLowerCase().includes(value) ||
      profile.businessName?.toLowerCase().includes(value)

    if (!matchesProfile) continue

    add({
      id: `client-${profile.id}`,
      kind: profile.businessName ? "business" : "client",
      label: profile.businessName ? `${name} / ${profile.businessName}` : name,
      description: `${profile.city}, ${profile.state} / ${profile.reportCount} approved signals / score ${profile.clientBureauScore}`,
      href: `/client/${profile.publicSlug}`,
      query: name,
      state: profile.state,
      score: profilePreviewScore(profile, query),
    })
  }

  for (const profile of profiles) {
    const label = `${profile.city}, ${profile.state}`
    const id = `market-${label.toLowerCase()}`
    if (value && !label.toLowerCase().includes(value)) continue

    add({
      id,
      kind: "market",
      label: `Search ${label}`,
      description: "City and state client profile directory signal.",
      href: buildSearchHref({ query: query || profile.city, state: profile.state }),
      query: query || profile.city,
      state: profile.state,
      score: 40,
    })

    if (suggestions.filter((item) => item.kind === "market").length >= 4) break
  }

  for (const category of reportCategories) {
    if (value && !category.toLowerCase().includes(value)) continue
    add({
      id: `category-${category}`,
      kind: "category",
      label: category,
      description: "Filter by contractor-submitted report type.",
      href: buildSearchHref({ query, state, category }),
      query,
      state,
      category,
      score: 30,
    })

    if (suggestions.filter((item) => item.kind === "category").length >= 4) break
  }

  if (suggestions.length === 0) {
    add({
      id: "no-result-report",
      kind: "no_result",
      label: "No public preview found yet",
      description: "Save the search or submit a documented client experience for moderation.",
      href: "/submit-report",
      query,
      state,
      score: 1,
    })
  }

  return suggestions.slice(0, 10)
}
