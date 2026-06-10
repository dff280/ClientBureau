import { buildBusinessSlug } from "@/lib/business-rating"
import { normalizeStateCode } from "@/lib/locations"
import { buildClientProfileSlug } from "@/lib/slug"
import {
  isPositiveReportCategory,
  type ClientProfile,
  type ClientReport,
  type ContractorProfile,
  type EntityProfile,
  type EntityProfileSearchResult,
  type ProfileType,
  type PublicBusinessProfile,
  type PublicEntityProfile,
  type SearchFilters,
} from "@/lib/types"

export function profileTypeLabel(type: ProfileType) {
  if (type === "client") return "Client / customer"
  if (type === "subcontractor") return "Subcontractor / trade pro"
  return "Contractor / service business"
}

export function profileTypePluralLabel(type: ProfileType) {
  if (type === "client") return "Clients and customers"
  if (type === "subcontractor") return "Subcontractors and trade pros"
  return "Contractors and service businesses"
}

export function entityProfileHref(profile: Pick<EntityProfile, "profileType" | "slug">) {
  return `/profiles/${profile.profileType}/${profile.slug}`
}

export function buildEntityProfileSlug(input: {
  profileType: ProfileType
  displayName: string
  businessName?: string
  city: string
  state: string
}) {
  const state = normalizeStateCode(input.state)
  const displayName = input.businessName || input.displayName

  if (input.profileType === "client") {
    const parts = displayName.trim().split(/\s+/)
    return buildClientProfileSlug({
      firstName: parts[0] || "client",
      lastName: parts.slice(1).join(" ") || "profile",
      city: input.city,
      state,
    })
  }

  return buildBusinessSlug({
    businessName: displayName,
    city: input.city,
    state,
  })
}

export function deriveEntityProfiles(input: {
  clients: ClientProfile[]
  contractors: ContractorProfile[]
  reports: ClientReport[]
  publicBusinesses?: PublicBusinessProfile[]
}): EntityProfile[] {
  const clientEntities = input.clients.map((client) => {
    const reports = input.reports.filter((report) => report.clientId === client.id)
    const approvedReports = reports.filter((report) => report.status === "approved")

    return {
      id: `entity_client_${client.id}`,
      profileType: "client" as const,
      displayName: [client.firstName, client.lastName].filter(Boolean).join(" "),
      businessName: client.businessName,
      city: client.city,
      state: normalizeStateCode(client.state),
      slug: client.publicSlug,
      legacyClientId: client.id,
      claimedStatus: "unclaimed" as const,
      ratingScore: client.clientBureauScore,
      ratingBand: client.riskLevel,
      reportCount: client.reportCount,
      positiveReportCount: approvedReports.filter((report) => isPositiveReportCategory(report.reportCategory)).length,
      disputedReportCount: reports.filter((report) => report.status === "disputed").length,
      resolvedReportCount: reports.filter((report) =>
        ["Resolved", "Paid in full", "Settled", "Admin verified"].includes(report.resolutionStatus ?? ""),
      ).length,
      evidenceOnFileCount: approvedReports.filter((report) => report.evidenceAttached).length,
      responseCount: 0,
      publicSummary: "Client profile with contractor-submitted, moderated report context.",
      isPublic: client.isPublic,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    } satisfies EntityProfile
  })

  const contractorEntities = input.contractors.map((contractor) => {
    const reports = input.reports.filter((report) => report.contractorId === contractor.id)
    const publicBusiness = input.publicBusinesses?.find((business) => business.id === contractor.id)
    const isSubcontractor = contractor.trade.toLowerCase().includes("subcontract") || contractor.businessType?.toLowerCase().includes("subcontract")

    return {
      id: `entity_contractor_${contractor.id}`,
      profileType: isSubcontractor ? "subcontractor" : "contractor",
      displayName: contractor.businessName,
      businessName: contractor.businessName,
      city: contractor.city,
      state: normalizeStateCode(contractor.state),
      slug: publicBusiness?.publicSlug ?? buildBusinessSlug(contractor),
      legacyContractorId: contractor.id,
      claimedStatus: "claimed",
      ownerUserId: contractor.userId,
      ratingScore: publicBusiness?.ratingScore ?? (contractor.verificationStatus === "verified" ? 88 : 76),
      ratingBand: publicBusiness?.ratingGrade ?? "Review Pending",
      reportCount: reports.length,
      positiveReportCount: reports.filter((report) => isPositiveReportCategory(report.reportCategory)).length,
      disputedReportCount: reports.filter((report) => report.status === "disputed").length,
      resolvedReportCount: reports.filter((report) =>
        ["Resolved", "Paid in full", "Settled", "Admin verified"].includes(report.resolutionStatus ?? ""),
      ).length,
      evidenceOnFileCount: reports.filter((report) => report.evidenceAttached).length,
      responseCount: 0,
      publicSummary: "Business profile with verification context and moderated project activity.",
      isPublic: true,
      createdAt: contractor.createdAt,
      updatedAt: publicBusiness?.lastUpdated ?? contractor.createdAt,
    } satisfies EntityProfile
  })

  return [...clientEntities, ...contractorEntities]
}

export function buildPublicEntityProfile(input: {
  profile: EntityProfile
  reports: ClientReport[]
  relatedClient?: ClientProfile
  relatedContractor?: PublicBusinessProfile
}): PublicEntityProfile {
  const approvedReports = input.reports.filter((report) => report.status === "approved")
  const responseStatusLabel =
    input.profile.responseCount > 0
      ? "Public response on file"
      : input.profile.claimedStatus === "claimed"
        ? "Profile claimed"
        : "Right of response available"
  const evidenceSummaryLabel =
    input.profile.evidenceOnFileCount > 0
      ? `${input.profile.evidenceOnFileCount} private evidence ${input.profile.evidenceOnFileCount === 1 ? "item" : "items"} on file`
      : "Evidence can be reviewed privately"

  return {
    ...input.profile,
    reports: approvedReports,
    relatedClient: input.relatedClient,
    relatedContractor: input.relatedContractor,
    safeDescription: `${profileTypeLabel(input.profile.profileType)} profile with moderated Client Bureau context. Public pages show approved summaries only.`,
    responseStatusLabel,
    evidenceSummaryLabel,
    profileHref: entityProfileHref(input.profile),
  }
}

export function searchEntityProfiles(
  profiles: EntityProfile[],
  query = "",
  filters: SearchFilters = {},
): EntityProfileSearchResult[] {
  const normalizedQuery = query.trim().toLowerCase()

  return profiles
    .map((profile) => {
      const searchable = [
        profile.displayName,
        profile.businessName,
        profile.city,
        profile.state,
        profile.slug,
        profile.profileType,
        profile.ratingBand,
        profile.publicSummary,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      const exactMatch = normalizedQuery.length > 0 && searchable.includes(normalizedQuery)
      const locationMatch = Boolean(filters.state && normalizeStateCode(profile.state) === normalizeStateCode(filters.state))
      const typeMatch = Boolean(filters.profileType && profile.profileType === filters.profileType)
      const profileTypeBoost = profile.profileType === "client" ? 8 : 4
      const matchScore =
        (exactMatch ? 60 : 0) +
        (locationMatch ? 12 : 0) +
        (typeMatch ? 10 : 0) +
        profileTypeBoost +
        Math.min(profile.reportCount * 3, 18) +
        Math.min(profile.positiveReportCount * 2, 8)

      return {
        ...profile,
        matchedBy: normalizedQuery
          ? exactMatch
            ? "Name, business, location, or profile context"
            : "Profile type and public record context"
          : "Public profile directory",
        matchScore,
        profileHref: entityProfileHref(profile),
        profileTypeLabel: profileTypeLabel(profile.profileType),
        latestSummary: profile.publicSummary,
        evidenceOnFile: profile.evidenceOnFileCount > 0,
        responseContext:
          profile.responseCount > 0
            ? "Response on file"
            : profile.claimedStatus === "claimed"
              ? "Claimed profile"
              : "Response available",
        nextAction:
          profile.profileType === "client"
            ? "Check reported client context before accepting work"
            : "Review business profile and documented project context",
      } satisfies EntityProfileSearchResult
    })
    .filter((profile) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [profile.displayName, profile.businessName, profile.city, profile.state, profile.slug, profile.publicSummary]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      const matchesState = !filters.state || normalizeStateCode(profile.state) === normalizeStateCode(filters.state)
      const matchesType = !filters.profileType || profile.profileType === filters.profileType
      const matchesRisk = !filters.riskLevel || profile.ratingBand === filters.riskLevel

      return profile.isPublic && matchesQuery && matchesState && matchesType && matchesRisk
    })
    .sort((a, b) => b.matchScore - a.matchScore || b.reportCount - a.reportCount)
}
