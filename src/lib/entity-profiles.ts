import {
  buildBusinessSlug,
  businessRatingModelForProfileType,
} from "@/lib/business-rating"
import { normalizeStateCode } from "@/lib/locations"
import { buildClientProfileSlug } from "@/lib/slug"
import { normalizeTradeCategory, tradeCategoryMatches, tradeSearchAliases } from "@/lib/trade-taxonomy"
import {
  isPositiveReportCategory,
  type ClientProfile,
  type ClientReport,
  type ClaimedStatus,
  type ContractorProfile,
  type EntityProfile,
  type EntityProfileSearchResult,
  type ProfileRelationship,
  type ProfileSubtype,
  type ProfileType,
  type ProjectJob,
  type PublicBusinessProfile,
  type PublicEntityProfile,
  type PublicProjectJobSummary,
  type ReportConfidenceLevel,
  type ReportRelationshipType,
  type SearchFilters,
  type VerificationStatus,
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

export function profileSubtypeLabel(profile: Pick<EntityProfile, "profileType" | "profileSubtype">) {
  if (profile.profileSubtype) return profile.profileSubtype
  return defaultProfileSubtype(profile.profileType)
}

export function claimedStatusLabel(status: ClaimedStatus) {
  const labels: Record<ClaimedStatus, string> = {
    unclaimed: "Unclaimed profile",
    claim_pending: "Claim pending",
    claimed: "Claimed profile",
    disputed: "Disputed claim",
    verified: "Verified profile",
  }

  return labels[status]
}

export type PublicBusinessFieldClassification =
  | "safe_public"
  | "verified_opt_in_public"
  | "private_admin_only"
  | "never_public"

export type PublicBusinessFieldPolicy = {
  field: string
  label: string
  classification: PublicBusinessFieldClassification
  explanation: string
}

export const businessProfilePublicFieldPolicy: PublicBusinessFieldPolicy[] = [
  {
    field: "businessName",
    label: "Business display name",
    classification: "safe_public",
    explanation: "Shown on public contractor and subcontractor profiles when the record is approved for public display.",
  },
  {
    field: "tradeCategory",
    label: "Trade or service category",
    classification: "safe_public",
    explanation: "Used for directory filters, profile cards, and role-specific contractor or subcontractor context.",
  },
  {
    field: "cityState",
    label: "City and state",
    classification: "safe_public",
    explanation: "Market-level location is public; street addresses, job addresses, and site access details are not.",
  },
  {
    field: "serviceArea",
    label: "Service area",
    classification: "verified_opt_in_public",
    explanation: "Can be summarized publicly after business review; exact private job or home addresses remain private.",
  },
  {
    field: "websiteUrl",
    label: "Website",
    classification: "verified_opt_in_public",
    explanation: "Can be shown only when the profile owner or moderator has approved it as a public business link.",
  },
  {
    field: "licenseNumber",
    label: "License indicator",
    classification: "verified_opt_in_public",
    explanation: "Public pages may say license information is on file, but should not present Client Bureau as a licensing authority.",
  },
  {
    field: "businessPhone",
    label: "Verification phone",
    classification: "private_admin_only",
    explanation: "Used for verification and admin review only; raw phone numbers should never appear in public profile HTML.",
  },
  {
    field: "email",
    label: "Account or claimant email",
    classification: "private_admin_only",
    explanation: "Used for login, claim review, and moderation contact only; raw email addresses stay out of public pages.",
  },
  {
    field: "ownerIdentity",
    label: "Owner identity",
    classification: "private_admin_only",
    explanation: "Owner names are not public unless intentionally approved as a business display field or authorized representative label.",
  },
  {
    field: "internalNotes",
    label: "Internal notes",
    classification: "never_public",
    explanation: "Moderator notes, account health, billing context, staff notes, private evidence paths, and hashes are never public.",
  },
]

export function businessProfileFieldPolicyByClassification(classification: PublicBusinessFieldClassification) {
  return businessProfilePublicFieldPolicy.filter((item) => item.classification === classification)
}

export function businessProfileClaimHref(input: Pick<EntityProfile, "profileType" | "slug" | "accountCapabilities">, requestedType?: ProfileType) {
  const profileType = profileTypeForView(input, requestedType)
  const params = new URLSearchParams({
    profileType,
    profileSlug: input.slug,
  })

  return `/claim-profile?${params.toString()}`
}

export function businessVerificationContext(input: {
  claimedStatus?: ClaimedStatus
  verificationLevel?: EntityProfile["verificationLevel"]
  verificationBadges?: string[]
  verificationStatus?: VerificationStatus
  profileType?: ProfileType
}) {
  const profileLabel = input.profileType === "subcontractor" ? "trade profile" : "business profile"
  const verified =
    input.claimedStatus === "verified" ||
    input.verificationLevel === "business_verified" ||
    input.verificationStatus === "verified"
  const claimed = input.claimedStatus === "claimed" || input.claimedStatus === "verified" || verified
  const pending = input.claimedStatus === "claim_pending" || input.verificationStatus === "pending"
  const disputed = input.claimedStatus === "disputed"
  const label = verified
    ? "Verification context reviewed"
    : disputed
      ? "Claim disputed"
      : pending
        ? "Verification in review"
        : claimed
          ? "Claimed profile"
          : "Unclaimed profile"
  const summary = verified
    ? `Client Bureau has reviewed public profile context for this ${profileLabel}. This is not a license, insurance, bond, quality, payment, or legal-outcome guarantee.`
    : disputed
      ? `A claim or correction issue is in dispute. Public changes should wait for moderation review and supporting context.`
      : pending
        ? `A claim or verification request is being reviewed before ownership, verification labels, or public profile status changes.`
        : claimed
          ? `An authorized profile relationship is on file, but public details still require moderation before changes are shown.`
          : `This ${profileLabel} can be claimed or corrected through moderation. Limited public context should not be treated as an endorsement or warning.`

  return {
    label,
    summary,
    isVerified: verified,
    isClaimed: claimed,
    isPending: pending,
    publicBadges: input.verificationBadges?.filter((badge) =>
      !/@|phone|email|internal|private|hash|note|billing/i.test(badge),
    ) ?? [],
    disclaimer:
      "Verification labels are profile-context signals only. They are not an endorsement or guarantee, recommendation, background check, license confirmation, insurance confirmation, or credit score.",
  }
}

export function defaultProfileSubtype(profileType: ProfileType): ProfileSubtype {
  if (profileType === "client") return "Homeowner"
  if (profileType === "subcontractor") return "Individual trade professional"
  return "Service business"
}

export function duplicateGroupKey(input: { displayName: string; businessName?: string; city: string; state: string }) {
  return [input.businessName || input.displayName, input.city, normalizeStateCode(input.state)]
    .filter(Boolean)
    .join("|")
    .toLowerCase()
    .replace(/[^a-z0-9|]+/g, "-")
    .replace(/-{2,}/g, "-")
}

export function reportConfidenceLevel(report: ClientReport): ReportConfidenceLevel {
  if (["Resolved", "Paid in full", "Settled", "Admin verified"].includes(report.resolutionStatus ?? "")) {
    return "resolved_report"
  }

  if (report.responseStatus === "Response published" || report.responseStatus === "Disputed" || report.responseStatus === "Resolved") {
    return "response_available"
  }

  if (report.evidenceConfidence === "Strong" || report.evidenceAttached) return "evidence_reviewed"
  if (report.signedContract || Boolean(report.detailedTimelinePrivate)) return "documented_report"

  return "basic_report"
}

export function reportConfidenceLabel(level: ReportConfidenceLevel) {
  const labels: Record<ReportConfidenceLevel, string> = {
    basic_report: "Basic report",
    documented_report: "Documented report",
    evidence_reviewed: "Evidence reviewed",
    response_available: "Response available",
    resolved_report: "Resolved report",
  }

  return labels[level]
}

export function profileSupportsType(
  profile: Pick<EntityProfile, "profileType" | "accountCapabilities">,
  profileType: ProfileType,
) {
  return profile.profileType === profileType || Boolean(profile.accountCapabilities?.includes(profileType))
}

export function profileTypeForView(
  profile: Pick<EntityProfile, "profileType" | "accountCapabilities">,
  requestedType?: ProfileType,
) {
  return requestedType && profileSupportsType(profile, requestedType) ? requestedType : profile.profileType
}

export function entityProfileHref(
  profile: Pick<EntityProfile, "profileType" | "slug" | "accountCapabilities">,
  requestedType?: ProfileType,
) {
  return `/profiles/${profileTypeForView(profile, requestedType)}/${profile.slug}`
}

export function entityProfileHrefs(profile: Pick<EntityProfile, "profileType" | "slug" | "accountCapabilities">) {
  const profileTypes = [profile.profileType, ...(profile.accountCapabilities ?? [])]
    .filter((type, index, list): type is ProfileType => Boolean(type) && list.indexOf(type) === index)

  return profileTypes.map((profileType) => entityProfileHref(profile, profileType))
}

export function entityProfileForView<T extends EntityProfile>(profile: T, requestedType?: ProfileType): T {
  const profileType = profileTypeForView(profile, requestedType)

  if (profileType === profile.profileType) return profile

  return {
    ...profile,
    profileType,
    profileSubtype: profile.profileSubtype ?? defaultProfileSubtype(profileType),
    ratingModel:
      profileType === "subcontractor"
        ? businessRatingModelForProfileType("subcontractor")
        : profileType === "contractor"
          ? businessRatingModelForProfileType("contractor")
          : profile.ratingModel,
  }
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

function projectStatusForReport(report: ClientReport): ProjectJob["status"] {
  if (["Resolved", "Paid in full", "Settled", "Admin verified"].includes(report.resolutionStatus ?? "")) return "resolved"
  if (report.status === "disputed" || report.responseStatus === "Disputed") return "disputed"
  if (report.amountUnpaid > 0 || report.reportCategory === "Non-payment" || report.reportCategory === "Late payment") {
    return "payment_issue"
  }
  if (report.jobStatus?.toLowerCase().includes("complete")) return "completed"

  return "active"
}

function reportProjectTitle(report: ClientReport) {
  return report.jobType || report.projectType || report.tradeCategory || "Project record"
}

export function projectJobFromReport(report: ClientReport, profile?: EntityProfile): ProjectJob {
  const confidence = report.reportConfidenceLevel ?? reportConfidenceLevel(report)

  return {
    id: report.projectJobId ?? `project_${report.id}`,
    title: reportProjectTitle(report),
    projectType: report.projectType,
    status: projectStatusForReport(report),
    city: report.projectCity,
    state: normalizeStateCode(report.projectState),
    startDate: report.jobStartDate,
    completionDate: report.jobCompletionDate,
    contractAmount: report.contractAmount,
    amountDue: report.amountUnpaid,
    primaryClientProfileId: report.subjectProfileType === "client" ? report.subjectProfileId : profile?.profileType === "client" ? profile.id : undefined,
    primaryContractorProfileId:
      report.subjectProfileType === "contractor" || report.subjectProfileType === "subcontractor"
        ? report.subjectProfileId
        : profile?.profileType === "contractor" || profile?.profileType === "subcontractor"
          ? profile.id
          : undefined,
    publicSummary: `${reportConfidenceLabel(confidence)} connected to a moderated ${report.projectType} experience in ${report.projectCity}, ${normalizeStateCode(report.projectState)}.`,
    isPublicSummaryAllowed: report.status === "approved",
    createdAt: report.createdAt,
    updatedAt: report.approvedAt ?? report.createdAt,
  }
}

export function publicProjectSummaryFromReport(report: ClientReport): PublicProjectJobSummary {
  const project = projectJobFromReport(report)
  const confidenceLevel = report.reportConfidenceLevel ?? reportConfidenceLevel(report)

  return {
    id: project.id,
    title: project.title,
    projectType: project.projectType,
    status: project.status,
    city: project.city,
    state: project.state,
    contractAmount: project.contractAmount,
    amountDue: project.amountDue,
    publicSummary: project.publicSummary,
    reportCount: 1,
    confidenceLevel,
    updatedAt: project.updatedAt,
  }
}

export function relationshipFromReport(report: ClientReport): ProfileRelationship | undefined {
  if (!report.reporterProfileId || !report.subjectProfileId) return undefined

  return {
    id: `relationship_${report.id}`,
    sourceProfileId: report.reporterProfileId,
    targetProfileId: report.subjectProfileId,
    projectJobId: report.projectJobId,
    relationshipType: report.relationshipType ?? "contractor_to_client",
    status: report.status === "disputed" ? "disputed" : "active",
    createdAt: report.createdAt,
    updatedAt: report.approvedAt ?? report.createdAt,
  }
}

export function relationshipLabel(type: ReportRelationshipType) {
  const labels: Record<ReportRelationshipType, string> = {
    contractor_to_client: "Contractor to client",
    subcontractor_to_contractor: "Subcontractor to contractor",
    contractor_to_subcontractor: "Contractor to subcontractor",
    client_to_contractor: "Client to contractor",
    business_to_business: "Business to business",
  }

  return labels[type]
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
      profileSubtype: client.businessName ? "Business client" : "Homeowner",
      accountCapabilities: ["client"],
      displayName: [client.firstName, client.lastName].filter(Boolean).join(" "),
      businessName: client.businessName,
      city: client.city,
      state: normalizeStateCode(client.state),
      slug: client.publicSlug,
      legacyClientId: client.id,
      claimedStatus: "unclaimed" as const,
      duplicateGroupKey: duplicateGroupKey({
        displayName: [client.firstName, client.lastName].filter(Boolean).join(" "),
        businessName: client.businessName,
        city: client.city,
        state: client.state,
      }),
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
    const supportsSubcontractorWork =
      isSubcontractor ||
      contractor.primaryGoal?.toLowerCase().includes("subcontract") ||
      contractor.serviceArea?.toLowerCase().includes("subcontract")
    const tradeCategory = normalizeTradeCategory(contractor.trade)

    return {
      id: `entity_contractor_${contractor.id}`,
      profileType: isSubcontractor ? "subcontractor" : "contractor",
      profileSubtype: isSubcontractor ? contractor.businessType ?? "Individual trade professional" : contractor.businessType ?? "Service business",
      tradeCategory,
      accountCapabilities: supportsSubcontractorWork ? ["contractor", "subcontractor"] : ["contractor"],
      displayName: contractor.businessName,
      businessName: contractor.businessName,
      city: contractor.city,
      state: normalizeStateCode(contractor.state),
      slug: publicBusiness?.publicSlug ?? buildBusinessSlug(contractor),
      legacyContractorId: contractor.id,
      claimedStatus: "claimed",
      ownerUserId: contractor.userId,
      verificationLevel: contractor.verificationStatus === "verified" ? "business_verified" : "email_verified",
      verificationBadges: contractor.verificationBadges?.length
        ? contractor.verificationBadges
        : contractor.verificationStatus === "verified"
          ? ["Verified business", "Verified email"]
          : ["Verified email"],
      duplicateGroupKey: duplicateGroupKey({
        displayName: contractor.businessName,
        businessName: contractor.businessName,
        city: contractor.city,
        state: contractor.state,
      }),
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
      publicSummary: isSubcontractor
        ? `${tradeCategory} trade partner profile with verification context, documented scope signals, and moderated payment-chain activity.`
        : `${tradeCategory} business profile with verification context and moderated project activity.`,
      isPublic: true,
      createdAt: contractor.createdAt,
      updatedAt: publicBusiness?.lastUpdated ?? contractor.createdAt,
    } satisfies EntityProfile
  })

  return [...clientEntities, ...contractorEntities]
}

export function buildPublicEntityProfile(input: {
  profile: EntityProfile
  requestedProfileType?: ProfileType
  reports: ClientReport[]
  projects?: PublicProjectJobSummary[]
  relationships?: ProfileRelationship[]
  relatedClient?: ClientProfile
  relatedContractor?: PublicBusinessProfile
}): PublicEntityProfile {
  const profile = entityProfileForView(input.profile, input.requestedProfileType)
  const approvedReports = input.reports.filter((report) => report.status === "approved")
  const projectSummaries =
    input.projects ??
    approvedReports
      .map(publicProjectSummaryFromReport)
      .filter((project, index, list) => list.findIndex((candidate) => candidate.id === project.id) === index)
  const relationships =
    input.relationships ??
    approvedReports
      .map(relationshipFromReport)
      .filter((item): item is ProfileRelationship => Boolean(item))
  const responseStatusLabel =
    profile.responseCount > 0
      ? "Public response on file"
      : profile.claimedStatus === "claim_pending"
        ? "Claim in review"
        : profile.claimedStatus === "claimed" || profile.claimedStatus === "verified"
          ? claimedStatusLabel(profile.claimedStatus)
          : profile.claimedStatus === "disputed"
            ? "Claim disputed"
        : "Right of response available"
  const evidenceSummaryLabel =
    profile.evidenceOnFileCount > 0
      ? `${profile.evidenceOnFileCount} private evidence ${profile.evidenceOnFileCount === 1 ? "item" : "items"} on file`
      : "Evidence can be reviewed privately"
  const safeDescription =
    profile.profileType === "contractor"
      ? "Contractor and service-business profile with public-safe verification context, service-area signals, approved project summaries, and claim or correction paths. It is not an endorsement or guarantee."
      : profile.profileType === "subcontractor"
        ? "Subcontractor and trade-professional profile with public-safe trade scope, GC/sub relationship context, payment-chain signals, and claim or correction paths. It is not an endorsement or guarantee."
        : `${profileTypeLabel(profile.profileType)} profile with moderated Client Bureau context. Public pages show approved summaries only.`

  return {
    ...profile,
    reports: approvedReports,
    projects: projectSummaries,
    relationships,
    relatedClient: input.relatedClient,
    relatedContractor: input.relatedContractor,
    safeDescription,
    responseStatusLabel,
    evidenceSummaryLabel,
    profileHref: entityProfileHref(profile, input.requestedProfileType),
  }
}

export function searchEntityProfiles(
  profiles: EntityProfile[],
  query = "",
  filters: SearchFilters = {},
): EntityProfileSearchResult[] {
  const normalizedQuery = query.trim().toLowerCase()
  const resultLimit =
    typeof filters.limit === "number" && Number.isFinite(filters.limit)
      ? Math.max(1, Math.min(Math.floor(filters.limit), 200))
      : undefined

  const results = profiles
    .map((profile) => {
      const searchable = [
        profile.displayName,
        profile.businessName,
        profile.city,
        profile.state,
        profile.slug,
        profile.profileType,
        profile.profileSubtype,
        profile.tradeCategory,
        profile.verificationLevel,
        profile.verificationBadges?.join(" "),
        profile.ratingBand,
        profile.publicSummary,
        ...tradeSearchAliases(profile.profileSubtype),
        ...tradeSearchAliases(profile.tradeCategory),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      const exactMatch = normalizedQuery.length > 0 && searchable.includes(normalizedQuery)
      const locationMatch = Boolean(filters.state && normalizeStateCode(profile.state) === normalizeStateCode(filters.state))
      const requestedProfileType = filters.profileType && profileSupportsType(profile, filters.profileType)
        ? filters.profileType
        : undefined
      const displayProfile = entityProfileForView(profile, requestedProfileType)
      const typeMatch = Boolean(filters.profileType && profileSupportsType(profile, filters.profileType))
      const profileTypeBoost = profile.profileType === "client" ? 8 : 4
      const matchScore =
        (exactMatch ? 60 : 0) +
        (locationMatch ? 12 : 0) +
        (typeMatch ? 10 : 0) +
        profileTypeBoost +
        Math.min(profile.reportCount * 3, 18) +
        Math.min(profile.positiveReportCount * 2, 8)

      return {
        ...displayProfile,
        matchedBy: normalizedQuery
          ? exactMatch
            ? "Name, business, location, or profile context"
            : "Profile type and public record context"
          : "Public profile directory",
        matchScore,
        profileHref: entityProfileHref(profile, requestedProfileType),
        profileTypeLabel: profileTypeLabel(displayProfile.profileType),
        latestSummary: profile.publicSummary,
        evidenceOnFile: profile.evidenceOnFileCount > 0,
        responseContext:
          profile.responseCount > 0
            ? "Response on file"
            : profile.claimedStatus === "claim_pending"
              ? "Claim in review"
              : profile.claimedStatus === "claimed" || profile.claimedStatus === "verified" || profile.claimedStatus === "disputed"
                ? claimedStatusLabel(profile.claimedStatus)
              : "Response available",
        nextAction:
          displayProfile.profileType === "client"
            ? "Check reported client context before accepting work"
            : displayProfile.profileType === "subcontractor"
              ? "Review trade scope, GC/sub context, and payment-chain signals"
              : "Review business profile, verification, and public project context",
      } satisfies EntityProfileSearchResult
    })
    .filter((profile) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [profile.displayName, profile.businessName, profile.city, profile.state, profile.slug, profile.profileSubtype, profile.publicSummary]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      const matchesState = !filters.state || normalizeStateCode(profile.state) === normalizeStateCode(filters.state)
      const matchesType =
        !filters.profileType ||
        profileSupportsType(profile, filters.profileType)
      const matchesRisk = !filters.riskLevel || profile.ratingBand === filters.riskLevel
      const tradeText = [
        profile.displayName,
        profile.businessName,
        profile.profileSubtype,
        profile.tradeCategory,
        profile.publicSummary,
      ]
        .filter(Boolean)
        .join(" ")
      const matchesTrade = !filters.tradeCategory || tradeCategoryMatches(tradeText, filters.tradeCategory)

      return profile.isPublic && matchesQuery && matchesState && matchesType && matchesRisk && matchesTrade
    })
    .sort((a, b) => b.matchScore - a.matchScore || b.reportCount - a.reportCount)

  return resultLimit ? results.slice(0, resultLimit) : results
}
