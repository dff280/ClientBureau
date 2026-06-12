import { describe, expect, it } from "vitest"

import { existsSync } from "node:fs"
import path from "node:path"

import { formDataToObject } from "@/lib/actions/result"
import sitemap from "@/app/sitemap"
import { generateMetadata as generateClientProfileMetadata } from "@/app/client/[slug]/page"
import { generateMetadata as generateBusinessProfileMetadata } from "@/app/business/[slug]/page"
import { getPostSignupRedirectPath, getSafeInternalPath, getSafePostSignupReturnPath } from "@/lib/auth"
import {
  buildBusinessSlug,
  businessRatingGrade,
  calculateBusinessRating,
} from "@/lib/business-rating"
import { getClientDirectory } from "@/lib/client-directory"
import { noStoreHeaders } from "@/lib/http"
import {
  coreLaunchTables,
  platformLaunchTables,
  requiredContractPacketColumns,
  requiredLaunchTables,
  requiredMultiProfileColumns,
  requiredRatingTransparencyColumns,
  requiredRevenueWorkflowColumns,
  summarizeLaunchHealth,
} from "@/lib/launch-health"
import type { Database } from "@/lib/database.types"
import {
  clientReportSchema,
  clientResponseSchema,
  adminProfileClaimReviewSchema,
  adminProfileMergeSchema,
  adminProfileRedactionSchema,
  adminReportReassignmentSchema,
  profileShareEventSchema,
  savedClientSearchSchema,
  searchAnalyticsEventSchema,
} from "@/lib/schemas/client-bureau"
import {
  calculateClientBureauScore,
  getReportedBalanceSummary,
  getScoreCategoryBreakdown,
  scoreToRiskLevel,
} from "@/lib/scoring"
import { cleanPublicReportText, clientRatingBand } from "@/lib/client-rating"
import { buildClientSlug, ensureUniqueSlug } from "@/lib/slug"
import { getInternalRedirectUrl } from "@/lib/urls"
import {
  buildSearchSuggestions,
  buildSearchExperienceStats,
  isPrivateIdentifierSearch,
  rankSearchPreviewProfiles,
  toSearchPreviewProfile,
} from "@/lib/search-experience"
import {
  buildEntityProfileSlug,
  defaultProfileSubtype,
  deriveEntityProfiles,
  entityProfileHref,
  publicProjectSummaryFromReport,
  reportConfidenceLevel as graphReportConfidenceLevel,
  searchEntityProfiles,
} from "@/lib/entity-profiles"
import {
  getMockGrowthEngineData,
  networkGrowthScore,
  profileClaimCompletion,
  rankReviewRequests,
  referralCreditSummary,
} from "@/lib/growth-engine"
import {
  getPublicTrustSummary,
  reportConfidenceLabel,
  reviewConfidenceLevel,
} from "@/lib/trust-verification"
import { buildEnterpriseDashboardSummary } from "@/lib/enterprise-dashboard"
import {
  getMobileAppApiBacklog,
  getMobileFirstWorkflows,
  getMobileReadinessSummary,
  mobileApiAudit,
  mobileComponentAudit,
  responsiveAudit,
} from "@/lib/mobile-readiness"
import {
  sanitizeContractPacketForMobile,
  sanitizeEvidenceVaultForMobile,
  sanitizeSearchResultForMobile,
} from "@/lib/mobile-api"
import {
  assignModerationCase,
  buildTodaysWorkItems,
  contractCompletionPercentage,
  contractPacketCompletionPercentage,
  countUnreadMonitoringAlerts,
  countOpenRecoveryCases,
  countWatchlistAlerts,
  filterModerationCases,
  filterAdminSavedViews,
  hasPrivatePublicLeak,
  intakeRiskRecommendation,
  isValidDecisionReason,
  lienNoticeReadinessLabel,
  nextRecoveryAttemptAction,
  paymentPlanCompletion,
  paymentRecoveryPriority,
  pipelineStageCounts,
  rankClientPipelineItems,
  rankMonitoringAlerts,
  rankWatchlistItems,
  reportDraftCompletionPercentage,
} from "@/lib/platform-features"
import {
  getPublicClientProfile,
  getPublicBusinessProfile,
  createContractShareLink,
  createServiceFeeOrder,
  getContractPacketByShareToken,
  getContractorDashboard,
  getContractorRiskOpsData,
  getEntityProfiles,
  signLienFilingAuthorization,
  searchClients,
  signContractShare,
  simulateApprovalPublication,
  simulateSubmittedClientReport,
  submitProfileClaim,
  submitFloridaLienCase,
  submitManagedRecoveryCase,
} from "@/lib/repositories/client-bureau"
import {
  businessProtectionPromise,
  corePositioning,
  protectionGuardrails,
  protectionWorkflowSteps,
} from "@/lib/product-positioning"
import {
  adminNavigationGroups,
  contractorDashboardGroups,
  contractorDashboardNav,
  contractorPrimaryNav,
  publicPrimaryNav,
  resourceNavigationGroups,
} from "@/lib/navigation"
import { getClientProfileStructuredData } from "@/lib/seo"
import {
  clientProfiles,
  clientReports,
  contractorProfiles,
  reportEvidence,
  subscriptions,
  adminSavedViews,
  clientPipelineItems,
  contractPackets,
  contractorWatchlist,
  contractWorkspaceItems,
  evidenceVaultItems,
  lienNoticeDrafts,
  managedRecoveryCases,
  floridaLienCases,
  caseDocumentLinks,
  serviceFeeOrders,
  moderationCases,
  paymentPlans,
  paymentRecoveryAttempts,
  paymentRecoveryCases,
  reportDrafts,
  watchlistAlerts,
} from "@/lib/mock-data"
import { acquisitionPages, getAcquisitionPage } from "@/lib/acquisition-pages"
import { floridaResidentialServiceAgreementTemplate } from "@/lib/contract-templates"
import { pageAssets } from "@/lib/page-assets"
import { allSeoLandingPages, getSeoLandingPage } from "@/lib/seo-landing-pages"
import {
  intakeAssessmentSchema,
  contractWorkspaceItemSchema,
  adminSavedViewSchema,
  clientPipelineItemSchema,
  clientRiskRoomSchema,
  contractPacketSchema,
  contractShareLinkSchema,
  contractSignatureSchema,
  floridaLienCaseSchema,
  lienFilingAuthorizationSchema,
  lienNoticeDraftSchema,
  managedRecoveryCaseSchema,
  paymentPlanSchema,
  paymentRecoveryAttemptSchema,
  moderationCaseAssignmentSchema,
  moderationDecisionReasonSchema,
  paymentRecoveryCaseSchema,
  recoveryComplianceReviewSchema,
  reportDraftSchema,
  serviceFeeCheckoutSchema,
  updateClientPipelineStageSchema,
  updateContractPacketStatusSchema,
  updateEvidenceVaultStatusSchema,
  watchlistItemSchema,
} from "@/lib/schemas/client-bureau"
import type { ClientReport } from "@/lib/types"
import {
  buildFloridaLienReadinessSummary,
  buildRecoveryReadinessSummary,
} from "@/lib/service-readiness"

const baseReport: ClientReport = {
  id: "report_test",
  contractorId: "contractor_test",
  clientId: "client_test",
  projectType: "Roof repair",
  projectCity: "Orlando",
  projectState: "FL",
  contractAmount: 10000,
  amountUnpaid: 0,
  reportCategory: "Positive experience",
  paymentStatus: "Paid on schedule",
  reportSummary: "Contractor-submitted report states payment was made on schedule.",
  detailedExperience: "Detailed test report.",
  publicSummary: "Contractor-submitted report states payment was made on schedule.",
  evidenceAttached: false,
  status: "approved",
  createdAt: "2026-01-01T00:00:00.000Z",
}

describe("Client Bureau unified profiles", () => {
  const entityProfiles = deriveEntityProfiles({
    clients: clientProfiles,
    contractors: contractorProfiles,
    reports: clientReports,
  })

  it("derives client and business profiles without exposing private identifiers", () => {
    expect(entityProfiles.some((profile) => profile.profileType === "client")).toBe(true)
    expect(entityProfiles.some((profile) => profile.profileType === "contractor")).toBe(true)

    const serialized = JSON.stringify(entityProfiles)
    expect(serialized).not.toContain("phoneHash")
    expect(serialized).not.toContain("emailHash")
    expect(serialized).not.toContain("businessPhone")
  })

  it("builds canonical unified profile hrefs", () => {
    const clientProfile = entityProfiles.find((profile) => profile.profileType === "client")
    expect(clientProfile).toBeTruthy()
    expect(entityProfileHref(clientProfile!)).toBe(`/profiles/client/${clientProfile!.slug}`)
  })

  it("filters unified search by profile type and state", () => {
    const results = searchEntityProfiles(entityProfiles, "Orlando", {
      state: "FL",
      profileType: "client",
    })

    expect(results.length).toBeGreaterThan(0)
    expect(results.every((profile) => profile.profileType === "client")).toBe(true)
    expect(results.every((profile) => profile.state === "FL")).toBe(true)
  })

  it("creates stable slugs for subcontractor profiles", () => {
    expect(
      buildEntityProfileSlug({
        profileType: "subcontractor",
        displayName: "Bright Line Electric",
        businessName: "Bright Line Electric",
        city: "Tampa",
        state: "fl",
      }),
    ).toBe("bright-line-electric-tampa-fl")
  })

  it("assigns profile subtypes and makes them searchable", () => {
    expect(defaultProfileSubtype("client")).toBe("Homeowner")
    expect(defaultProfileSubtype("contractor")).toBe("Service business")
    expect(defaultProfileSubtype("subcontractor")).toBe("Individual trade professional")

    const results = searchEntityProfiles(entityProfiles, "Homeowner")
    expect(results.some((profile) => profile.profileType === "client")).toBe(true)
  })

  it("marks unclaimed public profiles as claim pending after a profile claim", () => {
    const profile = getEntityProfiles().find((item) => item.profileType === "client" && item.claimedStatus === "unclaimed")
    expect(profile).toBeTruthy()

    submitProfileClaim({
      profileId: profile!.id,
      claimantEmailHash: "sha256:claimant-private",
      claimantName: "Verified claimant",
      relationshipToProfile: "Owner or authorized representative",
      verificationSummary: "The claimant can provide business records for moderation review.",
    })

    const updatedProfile = getEntityProfiles().find((item) => item.id === profile!.id)
    expect(updatedProfile?.claimedStatus).toBe("claim_pending")
  })

  it("derives public-safe project summaries from approved reports", () => {
    const report = {
      ...baseReport,
      projectJobId: "project_safe",
      evidenceAttached: true,
      reportConfidenceLevel: "evidence_reviewed" as const,
    }
    const summary = publicProjectSummaryFromReport(report)

    expect(summary.id).toBe("project_safe")
    expect(summary.confidenceLevel).toBe("evidence_reviewed")
    expect(JSON.stringify(summary)).not.toContain("projectAddressPrivate")
    expect(JSON.stringify(summary)).not.toContain("privateNotes")
  })

  it("maps graph confidence without exposing evidence files", () => {
    expect(graphReportConfidenceLevel({ ...baseReport, status: "approved", evidenceAttached: true })).toBe("evidence_reviewed")
    expect(
      graphReportConfidenceLevel({
        ...baseReport,
        status: "approved",
        responseStatus: "Response published",
      }),
    ).toBe("response_available")
    expect(
      graphReportConfidenceLevel({
        ...baseReport,
        status: "approved",
        resolutionStatus: "Resolved",
      }),
    ).toBe("resolved_report")
  })
})

describe("Client Bureau scoring", () => {
  it("maps scores to expected risk levels", () => {
    expect(scoreToRiskLevel(91)).toBe("Low")
    expect(scoreToRiskLevel(72)).toBe("Moderate")
    expect(scoreToRiskLevel(52)).toBe("Elevated")
    expect(scoreToRiskLevel(30)).toBe("High")
  })

  it("penalizes non-payment reports and rewards positive reports", () => {
    const positive = calculateClientBureauScore([baseReport])
    const nonPayment = calculateClientBureauScore([
      {
        ...baseReport,
        id: "report_nonpayment",
        amountUnpaid: 4500,
        reportCategory: "Non-payment",
      },
    ])

    expect(positive.score).toBeGreaterThan(nonPayment.score)
    expect(nonPayment.riskLevel).toBe("Elevated")
  })

  it("explains score categories and reported balances", () => {
    const reports = [
      {
        ...baseReport,
        id: "report_unresolved",
        amountUnpaid: 3000,
        reportCategory: "Non-payment" as const,
        resolutionStatus: "Unresolved" as const,
      },
      {
        ...baseReport,
        id: "report_resolved",
        amountUnpaid: 1200,
        reportCategory: "Late payment" as const,
        resolutionStatus: "Paid in full" as const,
      },
    ]
    const balance = getReportedBalanceSummary(reports)
    const categories = getScoreCategoryBreakdown(reports)

    expect(balance.totalReportedUnpaid).toBe(4200)
    expect(balance.unresolvedAmount).toBe(3000)
    expect(categories.map((category) => category.label)).toContain("Payment reliability")
    expect(categories).toHaveLength(7)
  })
})

describe("product positioning", () => {
  it("defines the broader business protection workflow without inflammatory language", () => {
    const copy = [
      businessProtectionPromise,
      ...protectionWorkflowSteps.flatMap((step) => [step.title, step.text, ...step.tools]),
      ...protectionGuardrails.flatMap((item) => [item.title, item.text]),
    ].join(" ")

    expect(protectionWorkflowSteps.map((step) => step.id)).toEqual([
      "check",
      "terms",
      "document",
      "payment",
      "resolve",
    ])
    expect(corePositioning).toBe("Check the client before you take the job.")
    expect(copy).toContain("Set the terms")
    expect(copy).toContain("Recovery cases are documentation-first")
    expect(copy.toLowerCase()).not.toMatch(/blacklist|shame|scammer|deadbeat|fraudster/)
  })

  it("exposes platform modules in public and contractor navigation", () => {
    expect(publicPrimaryNav.map((item) => item.label)).toEqual([
      "Platform",
      "Check a Client",
      "How It Works",
      "Pricing",
      "Resources",
      "About",
      "Contact",
    ])
    expect(contractorDashboardNav.map((item) => item.label)).toEqual([
      "Overview",
      "Check a Client",
      "Reports",
      "Watchlist",
      "Growth",
      "Contracts",
      "Payment Recovery",
      "Florida Lien Service",
      "Evidence Vault",
      "Alerts",
      "Billing",
      "Activity",
    ])
    expect(contractorPrimaryNav.find((item) => item.label === "Contracts")?.href).toBe(
      "/dashboard/contracts",
    )
    expect(contractorDashboardNav.find((item) => item.label === "Florida Lien Service")?.href).toBe(
      "/dashboard/lien-readiness",
    )
    expect(contractorDashboardNav.find((item) => item.label === "Billing")?.href).toBe(
      "/dashboard/billing",
    )
    expect(contractorDashboardGroups.map((group) => group.title)).toEqual([
      "Start",
      "Find Clients",
      "Reports",
      "Documents",
      "Services",
      "Account",
    ])
    expect(resourceNavigationGroups.flatMap((group) => group.links).map((item) => item.href)).toContain(
      "/score-methodology",
    )
    expect(resourceNavigationGroups.flatMap((group) => group.links).map((item) => item.href)).toContain(
      "/business-rating-methodology",
    )
    expect(adminNavigationGroups.map((group) => group.title)).toEqual([
      "Command Center",
      "Moderation",
      "Records",
      "Tools",
      "Platform",
    ])
    expect(adminNavigationGroups.flatMap((group) => group.links).map((item) => item.label)).toEqual([
      "Overview",
      "Review Reports",
      "Review Discussions",
      "Client Responses",
      "Unified Profiles",
      "Manage Client Profiles",
      "Businesses / Users",
      "All Reports",
      "CSV Intake",
      "Recovery Cases",
      "Contracts",
      "Audit Log",
      "Settings",
    ])
    expect(adminNavigationGroups.flatMap((group) => group.links).map((item) => item.href)).toContain(
      "/admin/recovery",
    )
  })
})

describe("slug generation", () => {
  it("creates canonical client profile slugs", () => {
    expect(
      buildClientSlug({
        firstName: "John",
        lastName: "Smith",
        city: "Orlando",
        state: "FL",
      }),
    ).toBe("john-smith-orlando-fl")
  })

  it("deduplicates slug collisions", () => {
    expect(ensureUniqueSlug("john-smith-orlando-fl", ["john-smith-orlando-fl"])).toBe(
      "john-smith-orlando-fl-2",
    )
  })

  it("creates canonical public business profile slugs", () => {
    expect(
      buildBusinessSlug({
        businessName: "RidgeBuild Contracting",
        city: "Orlando",
        state: "FL",
      }),
    ).toBe("ridgebuild-contracting-orlando-fl")
  })
})

describe("deployment URL helpers", () => {
  it("does not redirect users to the internal Docker listener", () => {
    const request = new Request("https://0.0.0.0:3000/api/auth/login")

    expect(getInternalRedirectUrl("/admin", request).toString()).toBe("https://clientbureau.com/admin")
  })

  it("prefers the forwarded public host when Caddy provides it", () => {
    const request = new Request("http://0.0.0.0:3000/api/auth/login", {
      headers: {
        "x-forwarded-host": "clientbureau.com",
        "x-forwarded-proto": "https",
      },
    })

    expect(getInternalRedirectUrl("/admin/reports", request).toString()).toBe(
      "https://clientbureau.com/admin/reports",
    )
  })

  it("preserves local request origins for same-browser logout redirects", () => {
    const request = new Request("http://localhost:4000/api/auth/logout")

    expect(getInternalRedirectUrl("/login?loggedOut=true", request).toString()).toBe(
      "http://localhost:4000/login?loggedOut=true",
    )
  })

  it("rejects unsafe external next redirects and defines no-store session headers", () => {
    expect(getSafeInternalPath("/admin/reports")).toBe("/admin/reports")
    expect(getSafeInternalPath("//evil.example/admin")).toBeUndefined()
    expect(getSafeInternalPath("https://evil.example/admin")).toBeUndefined()
    expect(noStoreHeaders["Cache-Control"]).toContain("no-store")
  })

  it("preserves safe post-signup product paths", () => {
    expect(getSafePostSignupReturnPath("/search?q=John&state=FL")).toBe("/search?q=John&state=FL")
    expect(getPostSignupRedirectPath("contractor", "/search?q=John&state=FL")).toBe(
      "/search?q=John&state=FL",
    )
    expect(getPostSignupRedirectPath("subcontractor", "/submit-report?firstName=John")).toBe(
      "/submit-report?firstName=John",
    )
  })

  it("blocks privileged or self-referential post-signup paths", () => {
    expect(getSafePostSignupReturnPath("/admin/reports")).toBeUndefined()
    expect(getSafePostSignupReturnPath("/api/health")).toBeUndefined()
    expect(getSafePostSignupReturnPath("/auth/callback?next=/admin")).toBeUndefined()
    expect(getSafePostSignupReturnPath("/login?next=/admin")).toBeUndefined()
    expect(getSafePostSignupReturnPath("/signup?next=/search")).toBeUndefined()
    expect(getSafePostSignupReturnPath("https://evil.example/search")).toBeUndefined()
    expect(getPostSignupRedirectPath("contractor", "/admin/reports")).toBe("/dashboard")
    expect(getPostSignupRedirectPath("contractor", "/api/health")).toBe("/dashboard")
    expect(getPostSignupRedirectPath("contractor", "/auth/callback?next=/admin")).toBe("/dashboard")
    expect(getPostSignupRedirectPath("contractor", "/login?next=/admin")).toBe("/dashboard")
    expect(getPostSignupRedirectPath("contractor", "/signup?next=/search")).toBe("/dashboard")
    expect(getPostSignupRedirectPath("contractor", "https://evil.example/search")).toBe("/dashboard")
  })

  it("uses client response as the default client-account signup destination", () => {
    expect(getPostSignupRedirectPath("client", undefined)).toBe("/client-response")
    expect(getPostSignupRedirectPath("client", "/admin")).toBe("/client-response")
  })
})

describe("launch health gates", () => {
  function tableStatuses(missing: string[] = []) {
    return requiredLaunchTables.map((name) => ({
      name,
      exists: !missing.includes(name),
    }))
  }

  function columnStatuses(missing: string[] = []) {
    const contractColumns = requiredContractPacketColumns.map((name) => ({
      table: "contract_packets" as const,
      name,
      exists: !missing.includes(`contract_packets.${name}`),
    }))
    const revenueColumns = requiredRevenueWorkflowColumns.map((column) => ({
      table: column.table,
      name: column.name,
      exists: !missing.includes(`${column.table}.${column.name}`),
    }))
    const multiProfileColumns = requiredMultiProfileColumns.map((column) => ({
      table: column.table,
      name: column.name,
      exists: !missing.includes(`${column.table}.${column.name}`),
    }))
    const ratingTransparencyColumns = requiredRatingTransparencyColumns.map((column) => ({
      table: column.table,
      name: column.name,
      exists: !missing.includes(`${column.table}.${column.name}`),
    }))

    return [...contractColumns, ...revenueColumns, ...multiProfileColumns, ...ratingTransparencyColumns]
  }

  it("keeps core and platform launch table groups distinct", () => {
    expect(new Set(requiredLaunchTables).size).toBe(requiredLaunchTables.length)
    expect(coreLaunchTables).toContain("client_reports")
    expect(platformLaunchTables).toContain("contract_packets")
    expect(platformLaunchTables).toContain("project_jobs")
    expect(platformLaunchTables).toContain("profile_relationships")
    expect(platformLaunchTables).not.toContain("client_reports")
  })

  it("recommends Supabase feature mode only when core and platform tables are ready", () => {
    const summary = summarizeLaunchHealth({
      dataMode: "supabase",
      platformFeatureDataMode: "mock",
      supabaseConfigured: true,
      serviceRoleConfigured: true,
      stripeConfigured: true,
      stripeWebhookConfigured: true,
      requiredTables: tableStatuses(),
      requiredColumns: columnStatuses(),
    })

    expect(summary.coreLiveReady).toBe(true)
    expect(summary.platformCanUseSupabase).toBe(true)
    expect(summary.recommendedPlatformFeatureDataMode).toBe("supabase")
    expect(summary.readinessLabel).toBe("Ready for live records")
    expect(summary.platformColumnCount).toEqual({
      ready:
        requiredContractPacketColumns.length +
        requiredRevenueWorkflowColumns.length +
        requiredMultiProfileColumns.length +
        requiredRatingTransparencyColumns.length,
      total:
        requiredContractPacketColumns.length +
        requiredRevenueWorkflowColumns.length +
        requiredMultiProfileColumns.length +
        requiredRatingTransparencyColumns.length,
    })
  })

  it("keeps advanced ops mocked when platform tables are missing", () => {
    const summary = summarizeLaunchHealth({
      dataMode: "supabase",
      platformFeatureDataMode: "mock",
      supabaseConfigured: true,
      serviceRoleConfigured: true,
      stripeConfigured: true,
      stripeWebhookConfigured: true,
      requiredTables: tableStatuses(["contract_packets"]),
      requiredColumns: columnStatuses(),
    })

    expect(summary.coreLiveReady).toBe(true)
    expect(summary.platformCanUseSupabase).toBe(false)
    expect(summary.recommendedPlatformFeatureDataMode).toBe("mock")
    expect(summary.missingPlatformTables).toContain("contract_packets")
  })

  it("blocks live ops activation when Supabase service config is missing", () => {
    const summary = summarizeLaunchHealth({
      dataMode: "supabase",
      platformFeatureDataMode: "supabase",
      supabaseConfigured: true,
      serviceRoleConfigured: false,
      stripeConfigured: true,
      stripeWebhookConfigured: true,
      requiredTables: tableStatuses(),
      requiredColumns: columnStatuses(),
    })

    expect(summary.coreLiveReady).toBe(false)
    expect(summary.platformCanUseSupabase).toBe(false)
    expect(summary.readinessLabel).toBe("Configuration missing")
  })

  it("keeps live contract workflows gated until signing packet columns exist", () => {
    const summary = summarizeLaunchHealth({
      dataMode: "supabase",
      platformFeatureDataMode: "mock",
      supabaseConfigured: true,
      serviceRoleConfigured: true,
      stripeConfigured: true,
      stripeWebhookConfigured: true,
      requiredTables: tableStatuses(),
      requiredColumns: columnStatuses(["contract_packets.signed_snapshot"]),
    })

    expect(summary.platformTablesReady).toBe(true)
    expect(summary.platformSchemaReady).toBe(false)
    expect(summary.platformCanUseSupabase).toBe(false)
    expect(summary.readinessLabel).toBe("Platform schema migration needed")
    expect(summary.missingPlatformColumns).toContain("contract_packets.signed_snapshot")
    expect(summary.recommendedPlatformFeatureDataMode).toBe("mock")
  })

  it("keeps live revenue workflows gated until readiness columns exist", () => {
    const summary = summarizeLaunchHealth({
      dataMode: "supabase",
      platformFeatureDataMode: "mock",
      supabaseConfigured: true,
      serviceRoleConfigured: true,
      stripeConfigured: true,
      stripeWebhookConfigured: true,
      requiredTables: tableStatuses(),
      requiredColumns: columnStatuses(["managed_recovery_cases.readiness_status"]),
    })

    expect(summary.platformTablesReady).toBe(true)
    expect(summary.platformSchemaReady).toBe(false)
    expect(summary.platformCanUseSupabase).toBe(false)
    expect(summary.readinessLabel).toBe("Platform schema migration needed")
    expect(summary.missingPlatformColumns).toContain("managed_recovery_cases.readiness_status")
    expect(summary.recommendedPlatformFeatureDataMode).toBe("mock")
  })

  it("keeps unified profile graph workflows gated until project columns exist", () => {
    const summary = summarizeLaunchHealth({
      dataMode: "supabase",
      platformFeatureDataMode: "mock",
      supabaseConfigured: true,
      serviceRoleConfigured: true,
      stripeConfigured: true,
      stripeWebhookConfigured: true,
      requiredTables: tableStatuses(),
      requiredColumns: columnStatuses(["client_reports.project_job_id", "entity_profiles.profile_subtype"]),
    })

    expect(summary.platformTablesReady).toBe(true)
    expect(summary.platformSchemaReady).toBe(false)
    expect(summary.platformCanUseSupabase).toBe(false)
    expect(summary.missingPlatformColumns).toContain("client_reports.project_job_id")
    expect(summary.missingPlatformColumns).toContain("entity_profiles.profile_subtype")
  })

  it("keeps response graph workflows gated until response link columns exist", () => {
    const summary = summarizeLaunchHealth({
      dataMode: "supabase",
      platformFeatureDataMode: "mock",
      supabaseConfigured: true,
      serviceRoleConfigured: true,
      stripeConfigured: true,
      stripeWebhookConfigured: true,
      requiredTables: tableStatuses(),
      requiredColumns: columnStatuses(["client_responses.entity_profile_id", "client_responses.project_job_id"]),
    })

    expect(summary.platformTablesReady).toBe(true)
    expect(summary.platformSchemaReady).toBe(false)
    expect(summary.platformCanUseSupabase).toBe(false)
    expect(summary.missingPlatformColumns).toContain("client_responses.entity_profile_id")
    expect(summary.missingPlatformColumns).toContain("client_responses.project_job_id")
    expect(summary.platformColumnCount.ready).toBe(summary.platformColumnCount.total - 2)
  })
})

describe("mobile app readiness", () => {
  it("covers components, APIs, responsive surfaces, and mobile workflows", () => {
    const summary = getMobileReadinessSummary()

    expect(summary.categoryCounts).toEqual({
      api: mobileApiAudit.length,
      component: mobileComponentAudit.length,
      responsive: responsiveAudit.length,
      workflow: getMobileFirstWorkflows().length,
    })
    expect(summary.total).toBeGreaterThan(20)
    expect(summary.readinessScore).toBeGreaterThanOrEqual(40)
  })

  it("keeps web-only and app-facing API boundaries explicit", () => {
    const webhook = mobileApiAudit.find((item) => item.route === "/api/stripe/webhook")
    const health = mobileApiAudit.find((item) => item.route === "/api/health")
    const mobileDashboard = mobileApiAudit.find((item) => item.route === "/api/mobile/dashboard")
    const mobileRecovery = mobileApiAudit.find((item) => item.route === "/api/mobile/recovery" && item.method === "GET")
    const backlog = getMobileAppApiBacklog()

    expect(webhook?.status).toBe("web-only")
    expect(webhook?.auth).toBe("webhook")
    expect(health?.status).toBe("ready")
    expect(mobileDashboard?.status).toBe("ready")
    expect(mobileDashboard?.auth).toBe("bearer")
    expect(mobileRecovery?.status).toBe("ready")
    expect(mobileApiAudit.find((item) => item.route === "/api/mobile/search")?.status).toBe("ready")
    expect(mobileApiAudit.find((item) => item.route === "/api/mobile/reports")?.status).toBe("ready")
    expect(mobileApiAudit.find((item) => item.route === "/api/mobile/contracts")?.status).toBe("ready")
    expect(mobileApiAudit.find((item) => item.route === "/api/mobile/evidence")?.status).toBe("ready")
    expect(backlog.map((item) => item.route)).toContain("/api/session")
    expect(backlog.every((item) => item.status === "needs-adapter")).toBe(true)
  })

  it("maps every authenticated mobile workflow to a future BFF endpoint", () => {
    const authenticatedWorkflows = getMobileFirstWorkflows().filter((workflow) => workflow.authRequired)

    expect(authenticatedWorkflows).toHaveLength(6)
    expect(
      authenticatedWorkflows.every((workflow) => workflow.apiStrategy.includes("/api/mobile/")),
    ).toBe(true)
    expect(
      authenticatedWorkflows.map((workflow) => workflow.entryRoute),
    ).toContain("/dashboard/lien-readiness")
  })

  it("keeps mobile DTOs free of private evidence paths and signed contract snapshots", () => {
    const riskOps = getContractorRiskOpsData("user_contractor_01")
    if (!riskOps) throw new Error("Expected seeded contractor risk ops data")

    const evidence = sanitizeEvidenceVaultForMobile(riskOps.evidenceVault[0])
    const contract = sanitizeContractPacketForMobile(riskOps.contractPackets[0])
    const searchResult = sanitizeSearchResultForMobile(searchClients("John", { state: "FL" })[0])
    const payload = JSON.stringify({ evidence, contract, searchResult })

    expect(payload).not.toContain("privateStoragePath")
    expect(payload).not.toContain("signedSnapshot")
    expect(payload).not.toContain("phoneHash")
    expect(payload).not.toContain("emailHash")
  })
})

describe("search and public profiles", () => {
  it("ranks matching search results and preserves private identifier language", () => {
    const results = searchClients("John", { state: "FL" })

    expect(results[0]?.publicSlug).toBe("john-smith-orlando-fl")
    expect(results[0]?.matchScore).toBeGreaterThan(0)
    expect(results[0]?.matchedBy).toContain("Name")
  })

  it("builds public-safe predictive search previews", () => {
    const result = searchClients("John", { state: "FL" })[0]
    if (!result) throw new Error("Expected John Smith search result")
    const preview = toSearchPreviewProfile(result)

    expect(preview.publicSlug).toBe("john-smith-orlando-fl")
    expect(preview.reportCount).toBeGreaterThan(0)
    expect("phoneHash" in preview).toBe(false)
    expect("emailHash" in preview).toBe(false)
    expect(JSON.stringify(preview)).not.toContain(result.phoneHash)
    expect(JSON.stringify(preview)).not.toContain(result.emailHash)
  })

  it("summarizes approved search signals for the search analytics panel", () => {
    const previews = searchClients("").map(toSearchPreviewProfile)
    const stats = buildSearchExperienceStats(previews)

    expect(stats.publicProfiles).toBeGreaterThan(0)
    expect(stats.approvedReportSignals).toBeGreaterThan(0)
    expect(stats.statesCovered).toBeGreaterThan(0)
    expect(stats.averageScore).toBeGreaterThan(0)
  })

  it("ranks predictive profile previews and creates safe suggestions", () => {
    const previews = searchClients("").map(toSearchPreviewProfile)
    const ranked = rankSearchPreviewProfiles(previews, "John Orlando")
    const suggestions = buildSearchSuggestions(previews, "John", "FL")

    expect(ranked[0]?.publicSlug).toBe("john-smith-orlando-fl")
    expect(suggestions.some((suggestion) => suggestion.href === "/client/john-smith-orlando-fl")).toBe(true)
    expect(JSON.stringify(suggestions)).not.toContain("sha256:")
  })

  it("recognizes private identifier searches without exposing raw identifiers", () => {
    const previews = searchClients("").map(toSearchPreviewProfile)
    const suggestions = buildSearchSuggestions(previews, "person@example.com", "FL")

    expect(isPrivateIdentifierSearch("person@example.com")).toBe(true)
    expect(isPrivateIdentifierSearch("(407) 555-1010")).toBe(true)
    expect(suggestions[0]?.kind).toBe("private_identifier")
    expect(suggestions[0]?.description).toContain("private matching")
    expect(JSON.stringify(suggestions)).not.toContain("407")
  })

  it("validates search activation inputs", () => {
    expect(savedClientSearchSchema.safeParse({
      query: "John Smith",
      state: "FL",
      riskLevel: "Elevated",
      category: "Non-payment",
      resultCount: 2,
    }).success).toBe(true)
    expect(searchAnalyticsEventSchema.safeParse({
      query: "John Smith",
      eventType: "search_submitted",
      source: "search_page",
      resultCount: 1,
    }).success).toBe(true)
    expect(profileShareEventSchema.safeParse({
      profileSlug: "john-smith-orlando-fl",
      channel: "referral_badge",
      source: "profile_page",
    }).success).toBe(true)
  })

  it("only returns public profile data with reviewable reports", () => {
    const profile = getPublicClientProfile("daniel-reed-austin-tx")

    expect(profile).toBeDefined()
    expect(profile?.reports.every((report) => ["approved", "disputed"].includes(report.status))).toBe(true)
    expect(JSON.stringify(profile)).not.toContain("@")
  })

  it("publishes approved positive reports separately from concern summaries", () => {
    const profile = getPublicClientProfile("maria-alvarez-tampa-fl")

    expect(profile?.positiveReports).toHaveLength(2)
    expect(profile?.positiveReports.every((report) => report.amountUnpaid === 0)).toBe(true)
    expect(profile?.balanceSummary.totalReportedUnpaid).toBe(0)
  })

  it("adds score breakdown and balance summaries to public profiles", () => {
    const profile = getPublicClientProfile("john-smith-orlando-fl")

    expect(profile?.scoreBreakdown.length).toBeGreaterThanOrEqual(6)
    expect(profile?.balanceSummary.totalReportedUnpaid).toBe(4200)
    expect(JSON.stringify(profile)).not.toContain("final-invoice.pdf")
  })

  it("builds public-safe trust and verification signals for profiles", () => {
    const profile = getPublicClientProfile("john-smith-orlando-fl")
    if (!profile) throw new Error("Expected public profile")
    const trust = getPublicTrustSummary(profile)
    const serialized = JSON.stringify(trust)

    expect(trust.verificationBadges.map((badge) => badge.label)).toContain("Verified public profile")
    expect(trust.verificationBadges.map((badge) => badge.label)).toContain("Evidence reviewed privately")
    expect(trust.confidence.score).toBeGreaterThan(50)
    expect(trust.confidence.level).toBe(reviewConfidenceLevel(trust.confidence.score))
    expect(trust.evidenceIndicators.map((item) => item.label)).toContain("Invoices reviewed")
    expect(trust.responseWorkflow.map((step) => step.label)).toEqual([
      "Verify contact",
      "Attach documentation",
      "Moderation review",
      "Publish approved context",
    ])
    expect(serialized).not.toContain("report-evidence/")
    expect(serialized).not.toContain("@")
  })

  it("labels individual report confidence from moderation and evidence context", () => {
    const evidenceBacked = clientReports.find((report) => report.id === "report_01")
    const noEvidence = clientReports.find((report) => report.id === "report_03")

    if (!evidenceBacked || !noEvidence) throw new Error("Expected seeded reports")

    expect(reportConfidenceLabel(evidenceBacked)).toBe("Strong")
    expect(reportConfidenceLabel(noEvidence)).toBe("Moderate")
  })
})

describe("business ratings and public business profiles", () => {
  it("calculates explainable contractor and business-owner ratings", () => {
    const contractor = contractorProfiles[0]
    const reports = clientReports.filter((report) => report.contractorId === contractor.id)
    const evidence = reportEvidence.filter((item) =>
      reports.some((report) => report.id === item.reportId),
    )
    const subscription = subscriptions.find((item) => item.contractorId === contractor.id)
    const rating = calculateBusinessRating({ contractor, reports, evidence, subscription })

    expect(rating.score).toBeGreaterThan(50)
    expect(businessRatingGrade(rating.score)).toBe(rating.grade)
    expect(rating.factors.map((factor) => factor.label)).toEqual([
      "Business identity and verification",
      "Client-facing project history",
      "Contracts and evidence discipline",
      "Payment and resolution posture",
      "Account and response readiness",
    ])
    expect(rating.profileKind).toBe("contractor")
    expect(rating.ratingName).toBe("Business Reliability Rating")
    expect(rating.summary).toContain("not a customer review score")
  })

  it("calculates a different subcontractor trade partner rating model", () => {
    const subcontractor = contractorProfiles.find((profile) => profile.businessName === "Bright Line Electric")

    if (!subcontractor) throw new Error("Expected seeded subcontractor profile")

    const reports = clientReports.filter((report) => report.contractorId === subcontractor.id)
    const evidence = reportEvidence.filter((item) =>
      reports.some((report) => report.id === item.reportId),
    )
    const rating = calculateBusinessRating({ contractor: subcontractor, reports, evidence })

    expect(rating.profileKind).toBe("subcontractor")
    expect(rating.ratingName).toBe("Trade Partner Reliability Rating")
    expect(rating.factors.map((factor) => factor.label)).toEqual([
      "Trade identity and credential readiness",
      "Scope and documentation clarity",
      "GC/sub relationship history",
      "Payment-chain reliability context",
      "Evidence and completion readiness",
      "Communication and resolution posture",
    ])
    expect(rating.summary).toContain("payment-chain context")
    expect(rating.factors.find((factor) => factor.label === "Payment-chain reliability context")?.description).toContain("pay application")
  })

  it("returns public business profiles without private account identifiers", () => {
    const profile = getPublicBusinessProfile("ridgebuild-contracting-orlando-fl")

    expect(profile).toBeDefined()
    expect(profile?.ratingGrade).toBeDefined()
    expect(profile?.publicClientReports.every((item) => item.client.isPublic)).toBe(true)
    expect(JSON.stringify(profile)).not.toContain("@")
    expect(JSON.stringify(profile)).not.toContain("FL-CBC-49201")
  })
})

describe("contractor growth engine", () => {
  it("summarizes referral credits without exposing full invite emails", () => {
    const data = getMockGrowthEngineData(contractorProfiles[0], "https://clientbureau.com")
    const summary = referralCreditSummary(data.invites, data.creditLedger)

    expect(summary.availableCents).toBe(2500)
    expect(summary.pendingCents).toBe(6000)
    expect(summary.completedInvites).toBe(1)
    expect(data.referralUrl).toContain("/signup?ref=")
    expect(JSON.stringify(data.badgeEmbed)).toContain("View RidgeBuild Contracting on Client Bureau")
  })

  it("tracks profile claiming and network score as a plain growth loop", () => {
    const data = getMockGrowthEngineData(contractorProfiles[0], "https://clientbureau.com")
    const completion = profileClaimCompletion(data.claimWorkflow)
    const score = networkGrowthScore({
      claimCompletion: completion,
      completedInvites: 2,
      completedReviewRequests: 3,
      publicProfileViews: 280,
    })

    expect(completion).toBeGreaterThan(50)
    expect(completion).toBeLessThanOrEqual(100)
    expect(score).toBeGreaterThan(completion / 2)
    expect(score).toBeLessThanOrEqual(100)
  })

  it("prioritizes active review requests before completed requests", () => {
    const data = getMockGrowthEngineData(contractorProfiles[0], "https://clientbureau.com")
    const ranked = rankReviewRequests([
      ...data.reviewRequests,
      {
        id: "request_completed",
        contractorId: contractorProfiles[0].id,
        clientName: "Completed Client",
        projectType: "Completed project",
        requestType: "positive_reference",
        status: "completed",
        requestUrl: "https://clientbureau.com/submit-report?intent=positive",
        dueAt: "2026-06-01T14:00:00.000Z",
      },
    ])

    expect(ranked[0]?.status).not.toBe("completed")
    expect(ranked.at(-1)?.status).toBe("completed")
  })
})

describe("enterprise dashboard summary", () => {
  it("builds KPI cards, trends, activity, reports, and insights for the contractor dashboard", () => {
    const dashboard = getContractorDashboard("user_contractor_01")
    const riskOps = getContractorRiskOpsData("user_contractor_01")

    if (!dashboard || !riskOps) throw new Error("Expected contractor dashboard data")

    const summary = buildEnterpriseDashboardSummary({
      dashboard,
      riskOps,
      clientProfiles,
      asOf: "2026-06-05T12:00:00.000Z",
    })

    expect(summary.kpis.map((kpi) => kpi.id)).toEqual([
      "open-balance",
      "pipeline-value",
      "agreement-status",
      "public-reviews",
    ])
    expect(summary.trends).toHaveLength(6)
    expect(summary.trends.at(-1)?.label).toBe("Jun")
    expect(summary.activityFeed.length).toBeGreaterThan(3)
    expect(summary.reportSummaries.map((item) => item.label)).toEqual([
      "Reports",
      "Documents",
      "Watchlist",
      "Saved searches",
    ])
    expect(summary.insights.map((item) => item.id)).toContain("open-balance")
    expect(summary.healthScore).toBeGreaterThan(0)
    expect(JSON.stringify(summary)).not.toContain("report-evidence/")
  })
})

describe("public SEO landing pages", () => {
  it("defines the requested public landing page clusters", () => {
    expect(getSeoLandingPage("clients", "florida")?.canonicalPath).toBe("/clients/florida")
    expect(getSeoLandingPage("reports", "non-payment")?.reportCategory).toBe("Non-payment")
    expect(getSeoLandingPage("industries", "service-businesses")?.title).toContain("Service Businesses")
    expect(allSeoLandingPages.length).toBe(12)
  })

  it("builds state and city directory paths from approved public profiles", () => {
    const directory = getClientDirectory(clientProfiles)
    const florida = directory.find((state) => state.slug === "florida")
    const orlando = florida?.cities.find((city) => city.slug === "orlando")

    expect(florida?.profileCount).toBeGreaterThan(0)
    expect(orlando?.profiles.some((profile) => profile.publicSlug === "john-smith-orlando-fl")).toBe(true)
  })

  it("includes SEO landing pages in the sitemap", async () => {
    const urls = (await sitemap()).map((entry) => entry.url)

    expect(urls).toContain("https://clientbureau.com/resources")
    expect(urls).toContain("https://clientbureau.com/clients")
    expect(urls).toContain("https://clientbureau.com/businesses")
    expect(urls).toContain("https://clientbureau.com/profiles")
    expect(urls).toContain("https://clientbureau.com/profiles/client")
    expect(urls).toContain("https://clientbureau.com/profiles/contractor")
    expect(urls).toContain("https://clientbureau.com/profiles/subcontractor")
    expect(urls).toContain("https://clientbureau.com/business-rating-methodology")
    expect(urls).toContain("https://clientbureau.com/business/ridgebuild-contracting-orlando-fl")
    expect(urls).toContain("https://clientbureau.com/clients/florida")
    expect(urls).toContain("https://clientbureau.com/clients/florida/orlando")
    expect(urls).toContain("https://clientbureau.com/reports/high-risk")
    expect(urls).toContain("https://clientbureau.com/industries/contractors")
    expect(urls).toContain("https://clientbureau.com/contractor-contract-template")
    expect(urls).toContain("https://clientbureau.com/florida-contractor-agreement-template")
    expect(urls).toContain("https://clientbureau.com/change-order-template")
    expect(urls).toContain("https://clientbureau.com/homeowner-wont-pay-contractor")
    expect(urls).toContain("https://clientbureau.com/client-screening-for-contractors")
  })

  it("defines high-intent acquisition pages with careful conversion copy", () => {
    expect(acquisitionPages.map((page) => page.slug)).toEqual([
      "contractor-contract-template",
      "florida-contractor-agreement-template",
      "change-order-template",
      "homeowner-wont-pay-contractor",
      "client-screening-for-contractors",
    ])
    expect(getAcquisitionPage("homeowner-wont-pay-contractor")?.trustPoints.join(" ")).toContain(
      "does not guarantee collection",
    )
    expect(JSON.stringify(acquisitionPages)).not.toContain("blacklist")
  })

  it("assigns launch visuals to public acquisition pages", () => {
    expect(acquisitionPages.every((page) => Boolean(page.visualAssetKey))).toBe(true)
    for (const page of acquisitionPages) {
      expect(page.visualAssetKey ? pageAssets[page.visualAssetKey].src : "").toMatch(/^\/images\/.+\.webp$/)
    }
  })

  it("ships optimized launch image assets with descriptive alt text", () => {
    for (const asset of Object.values(pageAssets)) {
      const assetPath = path.join(process.cwd(), "public", asset.src.replace(/^\//, ""))
      expect(existsSync(assetPath)).toBe(true)
      expect(asset.alt.length).toBeGreaterThan(30)
      expect(asset.points.length).toBeGreaterThanOrEqual(3)
      expect(asset.src).toMatch(/^\/images\/.+\.webp$/)
    }
  })

  it("generates careful metadata for public client profiles", async () => {
    const metadata = await generateClientProfileMetadata({
      params: Promise.resolve({ slug: "john-smith-orlando-fl" }),
    })

    expect(String(metadata.title)).toContain("John Smith")
    expect(String(metadata.title)).toContain("Client Bureau Profile")
    expect(String(metadata.description)).toContain("moderated contractor-submitted")
    expect(JSON.stringify(metadata.openGraph)).toContain("/client/john-smith-orlando-fl/opengraph-image")
  })

  it("generates safe public profile structured data without rating-rich-result markup", () => {
    const profile = getPublicClientProfile("john-smith-orlando-fl")

    expect(profile).toBeDefined()

    const json = JSON.stringify(getClientProfileStructuredData(profile!))

    expect(json).toContain("ProfilePage")
    expect(json).toContain("BreadcrumbList")
    expect(json).toContain("ItemList")
    expect(json).toContain("Approved contractor-submitted report summaries")
    expect(json).toContain("primaryImageOfPage")
    expect(json).toContain("#approved-summary-1")
    expect(json).not.toContain("AggregateRating")
    expect(json).not.toContain("\"Review\"")
    expect(json).not.toContain("ratingValue")
    expect(json).not.toContain("Client Bureau public profile slug")
    expect(json).not.toContain(`#report-${profile!.reports[0]?.id}`)
    expect(json).not.toContain("phoneHash")
    expect(json).not.toContain("emailHash")
    expect(json).not.toContain("storagePath")
  })

  it("generates careful metadata for public business profiles", async () => {
    const metadata = await generateBusinessProfileMetadata({
      params: Promise.resolve({ slug: "ridgebuild-contracting-orlando-fl" }),
    })

    expect(String(metadata.title)).toContain("RidgeBuild Contracting")
    expect(String(metadata.description)).toContain("business profile")
  })
})

describe("schemas and mock actions", () => {
  const requiredReportCertifications = {
    truthfulCertification: true,
    documentationCertification: true,
    publicSummaryCertification: true,
    relationshipCertification: true,
    moderationCertification: true,
    evidencePrivacyCertification: true,
    responseRightCertification: true,
    noHarassmentCertification: true,
  }

  it("validates report submission and rejects impossible unpaid amounts", () => {
    const parsed = clientReportSchema.safeParse({
      firstName: "Alex",
      lastName: "Morris",
      businessName: undefined,
      phone: undefined,
      city: "Miami",
      state: "FL",
      projectType: "Tile repair",
      projectCity: "Miami",
      projectState: "FL",
      contractAmount: 1000,
      amountUnpaid: 1200,
      reportCategory: "Non-payment",
      paymentStatus: "Final invoice unpaid",
      reportSummary: "A contractor-submitted report states final invoice payment remains unresolved.",
      detailedExperience:
        "The contractor reported documented completion, invoice delivery, and follow-up messages.",
    })

    expect(parsed.success).toBe(false)
  })

  it("validates positive report submissions with no unpaid amount", () => {
    const validPositive = clientReportSchema.safeParse({
      firstName: "Maria",
      lastName: "Alvarez",
      businessName: "Alvarez Beach Rentals",
      phone: undefined,
      email: "",
      city: "Tampa",
      state: "FL",
      projectType: "Rental unit paint refresh",
      projectCity: "Tampa",
      projectState: "FL",
      contractAmount: 5100,
      amountUnpaid: 0,
      reportCategory: "Would work with again",
      paymentStatus: "Paid on schedule with clear communication",
      reportSummary:
        "A contractor-submitted positive report states the client paid according to the agreement and communicated clearly.",
      detailedExperience:
        "The contractor reported clear scheduling, timely access, prompt approvals, and payment within the agreed invoice window after completion.",
      ...requiredReportCertifications,
    })
    const invalidPositive = clientReportSchema.safeParse({
      firstName: "Maria",
      lastName: "Alvarez",
      city: "Tampa",
      state: "FL",
      projectType: "Rental unit paint refresh",
      projectCity: "Tampa",
      projectState: "FL",
      contractAmount: 5100,
      amountUnpaid: 100,
      reportCategory: "Positive experience",
      paymentStatus: "Paid on schedule with clear communication",
      reportSummary:
        "A contractor-submitted positive report states the client paid according to the agreement and communicated clearly.",
      detailedExperience:
        "The contractor reported clear scheduling, timely access, prompt approvals, and payment within the agreed invoice window after completion.",
      ...requiredReportCertifications,
    })

    expect(validPositive.success).toBe(true)
    expect(invalidPositive.success).toBe(false)
  })

  it("requires stronger context for contractor and subcontractor profile reports", () => {
    const incompleteSubcontractorReport = clientReportSchema.safeParse({
      subjectProfileType: "subcontractor",
      firstName: "Drew",
      lastName: "Santos",
      businessName: "Bright Line Electric",
      city: "Orlando",
      state: "FL",
      projectType: "Electrical rough-in",
      projectCity: "Orlando",
      projectState: "FL",
      contractAmount: 9000,
      amountUnpaid: 2500,
      reportCategory: "Late payment",
      paymentStatus: "Retainage unresolved",
      reportSummary:
        "A contractor-submitted report states retainage remained unresolved after documented completion and follow-up.",
      detailedExperience:
        "The contractor reported a documented trade relationship, completion context, payment follow-up, and unresolved retainage.",
      ...requiredReportCertifications,
    })
    const completeSubcontractorReport = clientReportSchema.safeParse({
      subjectProfileType: "subcontractor",
      subjectProfileSubtype: "Licensed subcontractor",
      relationshipType: "contractor_to_subcontractor",
      reportedBusinessRole: "Subcontractor / trade partner",
      counterpartyBusinessRole: "Prime contractor / GC",
      firstName: "Drew",
      lastName: "Santos",
      businessName: "Bright Line Electric",
      city: "Orlando",
      state: "FL",
      projectJobTitle: "Lake Nona rough-in package",
      tradeCategory: "Electrical",
      projectType: "Electrical rough-in",
      jobType: "Residential rough-in",
      jobStatus: "Completed",
      projectCity: "Orlando",
      projectState: "FL",
      contractAmount: 9000,
      amountUnpaid: 2500,
      signedContract: true,
      scopeDocumentationStatus: "Signed contract",
      workAuthorizationStatus: "Authorized before work started",
      retainageAmount: 2500,
      paymentApplicationReference: "Pay app 2",
      licenseInsuranceContext: "License and insurance certificate were requested before scheduling.",
      relationshipVerificationSummary: "The contractor hired this subcontractor for the rough-in scope and has the signed work order, invoices, and messages.",
      reportCategory: "Late payment",
      paymentStatus: "Retainage unresolved",
      disputeStatus: "Disputed",
      reportSummary:
        "A contractor-submitted report states retainage remained unresolved after documented completion and follow-up.",
      detailedExperience:
        "The contractor reported a documented trade relationship, completion context, payment follow-up, and unresolved retainage.",
      whatWasAgreed: "Electrical rough-in scope, milestone payment terms, inspection coordination, and retainage terms were documented.",
      workCompleted: "The rough-in package was completed and submitted for inspection according to the documented work order.",
      paymentIssue: "The reported issue concerns retained payment remaining unresolved after documented follow-up.",
      evidenceSupport: "Agreement, invoice, message log, completion photos, and inspection-related notes are available for moderation.",
      ...requiredReportCertifications,
    })
    const wrongRelationship = clientReportSchema.safeParse({
      subjectProfileType: "contractor",
      subjectProfileSubtype: "General contractor",
      relationshipType: "contractor_to_subcontractor",
      reportedBusinessRole: "Prime contractor / GC",
      counterpartyBusinessRole: "Subcontractor / trade partner",
      firstName: "Morgan",
      lastName: "Ellis",
      businessName: "RidgeBuild Contracting",
      city: "Orlando",
      state: "FL",
      projectJobTitle: "GC payment dispute",
      tradeCategory: "Remodeling",
      projectType: "Kitchen remodel",
      jobType: "Residential remodel",
      jobStatus: "Completed",
      scopeDocumentationStatus: "Signed contract",
      workAuthorizationStatus: "Authorized before work started",
      relationshipVerificationSummary: "The subcontractor worked under this GC and has a signed subcontract, invoices, messages, and completion photos.",
      projectCity: "Orlando",
      projectState: "FL",
      contractAmount: 12000,
      amountUnpaid: 1800,
      reportCategory: "Late payment",
      paymentStatus: "Progress payment unresolved",
      reportSummary:
        "A subcontractor-submitted report states a progress payment remained unresolved after documented work and follow-up.",
      detailedExperience:
        "The subcontractor reported a documented GC/sub relationship, completed work, payment follow-up, and unresolved balance.",
      whatWasAgreed: "Trade scope, progress billing, schedule, and completion expectations were documented before the work started.",
      workCompleted: "The trade work was completed according to the requested scope and submitted for review.",
      paymentIssue: "The reported issue concerns a progress payment remaining unresolved after documented follow-up.",
      evidenceSupport: "Contract, invoice, messages, completion photos, and change-order notes are available for moderation.",
      ...requiredReportCertifications,
    })

    expect(incompleteSubcontractorReport.success).toBe(false)
    expect(completeSubcontractorReport.success).toBe(true)
    expect(wrongRelationship.success).toBe(false)
  })

  it("interprets client ratings and cleans public report copy", () => {
    expect(clientRatingBand(92, 2)).toBe("Strong client history")
    expect(clientRatingBand(66, 1)).toBe("Moderate caution")
    expect(clientRatingBand(50, 0)).toBe("Limited history")
    expect(cleanPublicReportText("Invoice was devliered   after completion.")).toBe(
      "Invoice was delivered after completion.",
    )
  })

  it("accepts client response requests with factual context", () => {
    expect(
      clientResponseSchema.safeParse({
        name: "John Smith",
        email: "john@example.com",
        profileUrl: "/client/john-smith-orlando-fl",
        requestType: "Dispute a report",
        verificationMethod: "Email verification",
        responseSummary:
          "The client states payment timing was connected to a requested documentation review.",
        contactCertification: true,
        documentationCertification: true,
      }).success,
    ).toBe(true)
    expect(
      clientResponseSchema.safeParse({
        name: "Orlando Roofing LLC",
        email: "owner@example.com",
        profileUrl: "/profiles/contractor/orlando-roofing-orlando-fl",
        projectJobId: "project_123",
        requestType: "Resolution update",
        verificationMethod: "Business documentation",
        responseSummary:
          "The business states the project was resolved after a documented payment-plan update and can provide supporting records for moderation.",
        contactCertification: true,
        documentationCertification: true,
      }).success,
    ).toBe(true)
  })

  it("validates admin profile graph operations with audit reasons", () => {
    expect(
      adminProfileClaimReviewSchema.safeParse({
        claimId: "claim_123",
        decision: "approved",
        moderatorNote: "Verification details support this profile claim.",
      }).success,
    ).toBe(true)
    expect(
      adminProfileMergeSchema.safeParse({
        sourceProfileId: "profile_a",
        targetProfileId: "profile_a",
        reason: "Same profile selected twice.",
      }).success,
    ).toBe(false)
    expect(
      adminReportReassignmentSchema.safeParse({
        reportId: "report_123",
        reason: "Confirmed report belongs to the target profile after evidence review.",
      }).success,
    ).toBe(false)
    expect(
      adminProfileRedactionSchema.safeParse({
        profileId: "profile_123",
        fieldName: "public_summary",
        reason: "Public summary contained private context and needs a safer replacement.",
        replacementValue: "Public summary redacted pending additional moderation.",
      }).success,
    ).toBe(true)
  })

  it("converts form data and creates pending mock reports", () => {
    const formData = new FormData()
    formData.set("firstName", "Alex")
    formData.set("lastName", "Morris")

    expect(formDataToObject(formData)).toEqual({
      firstName: "Alex",
      lastName: "Morris",
    })

    const report = simulateSubmittedClientReport({
      firstName: "Alex",
      lastName: "Morris",
      businessName: undefined,
      phone: undefined,
      city: "Miami",
      state: "FL",
      projectType: "Tile repair",
      projectCity: "Miami",
      projectState: "FL",
      contractAmount: 1000,
      amountUnpaid: 250,
      reportCategory: "Late payment",
      paymentStatus: "Paid after reminders",
      reportSummary: "A contractor-submitted report states payment was received after reminders.",
      detailedExperience:
        "The contractor reported documented reminders and eventual payment after invoice follow-up.",
    })

    expect(report.status).toBe("pending")
    expect(report.moderationNote).toContain("/client/alex-morris-miami-fl")
  })

  it("simulates approval publication with score recalculation", () => {
    const audit = simulateApprovalPublication(
      "report_07",
      "A contractor-submitted report describes repeated access cancellations before work could begin.",
    )

    expect(audit?.nextIsPublic).toBe(true)
    expect(audit?.generatedSlug).toBe("elaine-parker-nashville-tn")
    expect(audit?.recalculatedScore).toBeGreaterThan(0)
  })
})

describe("platform expansion feature utilities", () => {
  it("ranks watchlist alerts by priority and counts active high-signal items", () => {
    const ranked = rankWatchlistItems(contractorWatchlist, clientProfiles)

    expect(ranked[0]?.alertLevel).toBe("urgent")
    expect(countWatchlistAlerts(contractorWatchlist)).toBe(2)
  })

  it("ranks monitoring alerts and counts unread high-signal events", () => {
    const ranked = rankMonitoringAlerts(watchlistAlerts)

    expect(ranked[0]?.severity).toBe("urgent")
    expect(countUnreadMonitoringAlerts(watchlistAlerts)).toBe(2)
  })

  it("calculates report draft completion percentage", () => {
    expect(reportDraftCompletionPercentage(reportDrafts[0])).toBe(100)
  })

  it("recommends intake controls from payment and private-match signals", () => {
    expect(
      intakeRiskRecommendation({
        projectValue: 12000,
        depositReceived: false,
        contractSigned: true,
        privateMatchConfirmed: true,
      }),
    ).toBe("Use milestone billing")
  })

  it("filters and assigns moderation cases", () => {
    expect(filterModerationCases(moderationCases, "escalated")).toHaveLength(1)

    const assigned = assignModerationCase(moderationCases[0], "user_admin_01", "Review Team")

    expect(assigned.status).toBe("assigned")
    expect(assigned.assignedToName).toBe("Review Team")
  })

  it("validates supported moderation decision reasons", () => {
    expect(isValidDecisionReason("private_information")).toBe(true)
    expect(isValidDecisionReason("unsafe_reason")).toBe(false)
  })

  it("scores recovery cases, lien packets, and contract packets", () => {
    expect(paymentRecoveryPriority({ amountDue: 12000, invoiceAgeDays: 20 })).toBe("urgent")
    expect(paymentRecoveryPriority({ amountDue: 800, invoiceAgeDays: 10 })).toBe("low")
    expect(countOpenRecoveryCases(paymentRecoveryCases)).toBe(2)
    expect(lienNoticeReadinessLabel(lienNoticeDrafts[0])).toBe("Review required")
    expect(contractCompletionPercentage(contractWorkspaceItems[0])).toBe(100)
  })

  it("summarizes pipeline stages and ranks urgent work first", () => {
    const counts = pipelineStageCounts(clientPipelineItems)
    const ranked = rankClientPipelineItems(clientPipelineItems)

    expect(counts.payment_follow_up).toBe(1)
    expect(counts.closed).toBe(1)
    expect(ranked[0]?.stage).toBe("payment_follow_up")
  })

  it("builds today's work from pipeline, alerts, drafts, evidence, recovery, and contracts", () => {
    const work = buildTodaysWorkItems({
      pipeline: clientPipelineItems,
      alerts: watchlistAlerts,
      drafts: reportDrafts,
      evidence: evidenceVaultItems,
      recoveryCases: paymentRecoveryCases,
      contracts: contractPackets,
    })

    expect(work.length).toBeGreaterThan(4)
    expect(work.map((item) => item.label)).toContain("Payment Recovery")
    expect(work.map((item) => item.label)).toContain("Evidence Vault")
  })

  it("tracks recovery attempts, payment plans, contract packets, and saved views", () => {
    expect(nextRecoveryAttemptAction(paymentRecoveryAttempts[1])).toContain("dispute")
    expect(paymentPlanCompletion(paymentPlans[0])).toBe(5)
    expect(contractPacketCompletionPercentage(contractPackets[1])).toBeGreaterThanOrEqual(80)
    expect(filterAdminSavedViews(adminSavedViews, "recovery")).toHaveLength(1)
  })

  it("creates managed recovery cases and separates service fee costs", () => {
    expect(managedRecoveryCases[0]?.status).toBe("contact_in_progress")

    const recoveryCase = submitManagedRecoveryCase("contractor_01", {
      clientName: "John Smith",
      clientEmail: "john@example.com",
      city: "Orlando",
      state: "FL",
      amountDue: 4200,
      invoiceAgeDays: 42,
      preferredChannel: "email",
      evidenceVaultItemIds: "vault_01, vault_02",
      summary: "Final invoice is unpaid after documented completion, invoice delivery, and contractor follow-up records.",
      factualCertification: true,
      serviceTermsCertification: true,
    })
    const order = createServiceFeeOrder("contractor_01", {
      entityId: recoveryCase.id,
      kind: "managed_recovery",
    })

    expect(recoveryCase.status).toBe("fee_due")
    expect(recoveryCase.contractorDirectPayment).toBe(true)
    expect(recoveryCase.clientEmailMasked).not.toContain("john@example.com")
    expect(order.clientBureauFeeCents).toBe(14900)
    expect(order.passThroughFeeCents).toBe(0)
  })

  it("creates Florida lien filing cases and requires contractor authorization before review", () => {
    const lienCase = submitFloridaLienCase("contractor_01", {
      workflowType: "claim_of_lien_filing",
      clientName: "John Smith",
      ownerName: "John Smith",
      propertyCounty: "Orange",
      propertyCity: "Orlando",
      state: "FL",
      contractorRole: "direct_contractor",
      projectType: "Kitchen remodel",
      contractAmount: 18400,
      amountDue: 4200,
      firstWorkDate: "2026-03-10",
      lastWorkDate: "2026-04-06",
      noticeHistory: "Signed contract, completion record, final invoice, and payment follow-up are documented.",
      privateSummary: "Private Florida lien case prepared for attorney/vendor review with documents on file.",
      accuracyCertification: true,
      filingTermsCertification: true,
    })
    const signed = signLienFilingAuthorization("contractor_01", {
      caseId: lienCase.id,
      signerName: "Morgan Ellis",
      authorityTitle: "Owner",
      signatureName: "Morgan Ellis",
      accuracyCertification: true,
      authorityCertification: true,
      vendorReviewCertification: true,
    })
    const filingFee = createServiceFeeOrder("contractor_01", {
      entityId: lienCase.id,
      kind: "florida_lien_filing",
    })

    expect(lienCase.status).toBe("fee_due")
    expect(signed.status).toBe("attorney_vendor_review")
    expect(signed.contractorSignedAt).toBeDefined()
    expect(filingFee.clientBureauFeeCents).toBe(29900)
    expect(filingFee.passThroughFeeCents).toBeGreaterThan(0)
  })

  it("creates private contract signing links and records client signatures", () => {
    const seeded = getContractPacketByShareToken("new-intake-client-roof-repair-agreement-link-02")

    expect(seeded?.shareUrl).toBe("/contract/new-intake-client-roof-repair-agreement-link-02")

    const link = createContractShareLink("contractor_01", {
      packetId: "contract_packet_02",
      clientEmail: "client@example.com",
      paymentMode: "deposit_request",
      paymentSummary: "Deposit is requested before scheduling materials.",
      inviteClient: true,
    })

    expect(link.shareUrl).toBe("/contract/new-intake-client-roof-repair-agreement-link-02")
    expect(link.clientEmailMasked).not.toContain("client@example.com")
    expect(link.clientInviteStatus).toBe("invited")
    expect(link.signatureStatus).toBe("awaiting_client")

    const signed = signContractShare({
      shareToken: "new-intake-client-roof-repair-agreement-link-02",
      signerName: "Client Contact",
      signerEmail: "client@example.com",
      signatureName: "Client Contact",
      scopeReviewCertification: true,
      paymentTermsCertification: true,
      consentToElectronicSignature: true,
      authorityCertification: true,
      recordsCertification: true,
    })

    expect(signed.signatureStatus).toBe("client_signed")
    expect(signed.clientInviteStatus).toBe("joined")
    expect(signed.signedSnapshot?.signerName).toBe("Client Contact")
    expect(signed.signedDigest).toMatch(/^sha256:/)
    expect(JSON.stringify(signed)).not.toContain("client@example.com")
  })

  it("detects obvious private evidence leaks in public-facing payloads", () => {
    expect(hasPrivatePublicLeak({ storagePath: "report-evidence/report_01/final-invoice.pdf" })).toBe(true)
    expect(hasPrivatePublicLeak({ summary: "Evidence reviewed privately." })).toBe(false)
  })
})

describe("platform expansion schemas", () => {
  it("validates contractor watchlist creation", () => {
    expect(
      watchlistItemSchema.safeParse({
        clientId: "client_01",
        watchReason: "Review before accepting another job.",
        alertLevel: "high",
      }).success,
    ).toBe(true)
  })

  it("validates report drafts and amount-at-risk constraints", () => {
    expect(
      reportDraftSchema.safeParse({
        clientName: "John Smith",
        projectType: "Bathroom remodel",
        estimatedValue: 5000,
        amountAtRisk: 7000,
        summary: "Draft describes a documented project timeline.",
        nextStep: "Attach invoice",
        status: "draft",
      }).success,
    ).toBe(false)
  })

  it("validates intake and moderation action inputs", () => {
    expect(
      intakeAssessmentSchema.safeParse({
        clientName: "Maria Alvarez",
        city: "Tampa",
        state: "FL",
        projectValue: 5200,
        depositReceived: true,
      }).success,
    ).toBe(true)

    expect(
      moderationCaseAssignmentSchema.safeParse({
        caseId: "case_01",
        assignedTo: "user_admin_01",
      }).success,
    ).toBe(true)

    expect(
      moderationDecisionReasonSchema.safeParse({
        caseId: "case_01",
        decisionReason: "private_information",
      }).success,
    ).toBe(true)
  })

  it("validates recovery, lien notice, and contract workflow inputs", () => {
    expect(
      paymentRecoveryCaseSchema.safeParse({
        clientName: "John Smith",
        city: "Orlando",
        state: "FL",
        amountDue: 4200,
        invoiceAgeDays: 38,
        preferredChannel: "email",
        summary: "Invoice follow-up is tied to documented completion records and payment timeline.",
        factualCertification: true,
      }).success,
    ).toBe(true)

    expect(
      lienNoticeDraftSchema.safeParse({
        clientName: "John Smith",
        projectType: "Kitchen remodel",
        propertyCity: "Orlando",
        state: "FL",
        amountDue: 4200,
        lastWorkDate: "2026-04-06",
        reviewCertification: true,
      }).success,
    ).toBe(true)

    expect(
      contractWorkspaceItemSchema.safeParse({
        clientName: "Maria Alvarez",
        projectType: "Deck maintenance",
        templateType: "service_agreement",
        contractValue: 3900,
        depositRequired: 5000,
        summary: "Agreement includes scope, payment timing, and change-order controls.",
      }).success,
    ).toBe(false)
  })

  it("validates managed recovery and Florida lien service inputs", () => {
    expect(
      managedRecoveryCaseSchema.safeParse({
        clientName: "John Smith",
        clientEmail: "john@example.com",
        city: "Orlando",
        state: "FL",
        amountDue: 4200,
        invoiceAgeDays: 42,
        preferredChannel: "email",
        evidenceVaultItemIds: "vault_01, vault_02",
        summary: "Final invoice is unpaid after documented completion, invoice delivery, and contractor follow-up records.",
        factualCertification: true,
        serviceTermsCertification: true,
      }).success,
    ).toBe(true)

    expect(
      serviceFeeCheckoutSchema.safeParse({
        entityId: "managed_recovery_01",
        kind: "managed_recovery",
      }).success,
    ).toBe(true)

    expect(
      floridaLienCaseSchema.safeParse({
        workflowType: "claim_of_lien_filing",
        clientName: "John Smith",
        ownerName: "John Smith",
        propertyCounty: "Orange",
        propertyCity: "Orlando",
        state: "FL",
        contractorRole: "direct_contractor",
        projectType: "Kitchen remodel",
        contractAmount: 18400,
        amountDue: 4200,
        firstWorkDate: "2026-03-10",
        lastWorkDate: "2026-04-06",
        noticeHistory: "Signed contract, completion record, final invoice, and payment follow-up are documented.",
        privateSummary: "Private Florida lien case prepared for attorney/vendor review with documents on file.",
        accuracyCertification: true,
        filingTermsCertification: true,
      }).success,
    ).toBe(true)

    expect(
      floridaLienCaseSchema.safeParse({
        workflowType: "claim_of_lien_filing",
        clientName: "John Smith",
        ownerName: "John Smith",
        propertyCounty: "Orange",
        propertyCity: "Orlando",
        state: "GA",
        contractorRole: "direct_contractor",
        projectType: "Kitchen remodel",
        contractAmount: 18400,
        amountDue: 4200,
        lastWorkDate: "2026-04-06",
        noticeHistory: "This should fail because the service is Florida-only.",
        privateSummary: "Private case summary long enough for validation but wrong state.",
        accuracyCertification: true,
        filingTermsCertification: true,
      }).success,
    ).toBe(false)

    expect(
      floridaLienCaseSchema.safeParse({
        workflowType: "claim_of_lien_filing",
        clientName: "John Smith",
        ownerName: "John Smith",
        propertyCounty: "Orange",
        propertyCity: "Orlando",
        state: "FL",
        contractorRole: "direct_contractor",
        projectType: "Kitchen remodel",
        contractAmount: 1000,
        amountDue: 4200,
        lastWorkDate: "2026-04-06",
        noticeHistory: "This should fail because amount due exceeds contract value.",
        privateSummary: "Private case summary long enough for validation but amount is invalid.",
        accuracyCertification: true,
        filingTermsCertification: true,
      }).success,
    ).toBe(false)

    expect(
      lienFilingAuthorizationSchema.safeParse({
        caseId: "florida_lien_01",
        signerName: "Morgan Ellis",
        authorityTitle: "Owner",
        signatureName: "Morgan Ellis",
        accuracyCertification: true,
        authorityCertification: true,
        vendorReviewCertification: true,
      }).success,
    ).toBe(true)
  })

  it("calculates service readiness and blocks checkout until documents are linked", () => {
    const recoverySummary = buildRecoveryReadinessSummary({
      recoveryCase: managedRecoveryCases[0],
      evidenceVault: evidenceVaultItems,
      serviceFeeOrders,
      documentLinks: caseDocumentLinks,
    })
    const lienSummary = buildFloridaLienReadinessSummary({
      lienCase: floridaLienCases[0],
      evidenceVault: evidenceVaultItems,
      serviceFeeOrders,
      documentLinks: caseDocumentLinks,
    })
    const incompleteRecovery = buildRecoveryReadinessSummary({
      recoveryCase: {
        ...managedRecoveryCases[0],
        id: "managed_recovery_incomplete",
        serviceFeeOrderId: undefined,
        evidenceVaultItemIds: [],
      },
      evidenceVault: evidenceVaultItems,
      serviceFeeOrders: [],
      documentLinks: [],
    })

    expect(recoverySummary.readyForCheckout).toBe(true)
    expect(recoverySummary.feePaid).toBe(true)
    expect(recoverySummary.status).toBe("submitted")
    expect(lienSummary.readyForCheckout).toBe(true)
    expect(lienSummary.feePaid).toBe(true)
    expect(lienSummary.checks.find((item) => item.id === "authorization")?.complete).toBe(true)
    expect(incompleteRecovery.readyForCheckout).toBe(false)
    expect(incompleteRecovery.checks.find((item) => item.id === "documents")?.complete).toBe(false)
  })

  it("validates contractor ops workspace inputs", () => {
    expect(
      clientPipelineItemSchema.safeParse({
        clientName: "John Smith",
        city: "Orlando",
        state: "FL",
        stage: "screening",
        priority: "high",
        estimatedValue: 4200,
        nextAction: "Review private match before scheduling crews.",
        privateMatch: true,
      }).success,
    ).toBe(true)

    expect(
      updateClientPipelineStageSchema.safeParse({
        itemId: "pipeline_01",
        stage: "payment_follow_up",
      }).success,
    ).toBe(true)

    expect(
      clientRiskRoomSchema.safeParse({
        clientName: "John Smith",
        city: "Orlando",
        state: "FL",
        headline: "Payment follow-up context",
        summary: "Private room links search, evidence, recovery, and contract context.",
      }).success,
    ).toBe(true)
  })

  it("validates recovery attempts, payment plans, contract packets, and admin controls", () => {
    expect(
      paymentRecoveryAttemptSchema.safeParse({
        recoveryCaseId: "recovery_01",
        channel: "phone",
        attemptedAt: "2026-06-03T14:00",
        outcome: "needs_follow_up",
        note: "Factual phone call note with response path and no unsupported claims.",
      }).success,
    ).toBe(true)

    expect(
      paymentPlanSchema.safeParse({
        recoveryCaseId: "recovery_01",
        totalAmount: 4200,
        installmentAmount: 5000,
        dueDay: 15,
        notes: "Payment plan amount is intentionally invalid.",
      }).success,
    ).toBe(false)

    expect(
      contractPacketSchema.safeParse({
        clientName: "Maria Alvarez",
        clientLegalName: "Maria Alvarez",
        contractorLegalName: "RidgeBuild Contracting LLC",
        projectType: "Deck maintenance",
        templateType: "service_agreement",
        packetValue: 3900,
        depositRequired: 750,
        milestoneCount: 2,
        requiredBeforeScheduling: true,
        scopeSummary: "Deck maintenance agreement packet prepared for client review before scheduling.",
        includedWork: "Cleaning, sanding touch-ups, fastener inspection, finish application, and ordinary cleanup.",
        excludedWork: "Structural repairs, hidden rot remediation, and permit work require written change orders.",
        paymentTerms: "A deposit is due before scheduling with the final balance due after the completion walkthrough.",
        milestoneSchedule: "Deposit before scheduling | 750 | Before scheduling\nFinal walkthrough | 3150 | Completion",
        changeOrderPolicy: "Any added scope or material change must be approved in writing before added work begins.",
        cancellationPolicy: "Cancellation or rescheduling should be documented in writing with costs reconciled.",
        nextAction: "Review agreement before scheduling.",
      }).success,
    ).toBe(true)

    expect(
      contractPacketSchema.safeParse({
        ...floridaResidentialServiceAgreementTemplate.fields,
        clientName: "Florida Homeowner",
        clientLegalName: "Florida Homeowner",
        contractorLegalName: "RidgeBuild Contracting LLC",
        packetValue: 12000,
        depositRequired: 2500,
      }).success,
    ).toBe(true)
    expect(JSON.stringify(floridaResidentialServiceAgreementTemplate)).toContain("Attorney review")
    expect(JSON.stringify(floridaResidentialServiceAgreementTemplate)).not.toContain("blacklist")

    expect(
      contractPacketSchema.safeParse({
        clientName: "Maria Alvarez",
        projectType: "Deck maintenance",
        templateType: "service_agreement",
        packetValue: 3900,
        depositRequired: 750,
        milestoneCount: 2,
        scopeSummary: "Deck maintenance agreement packet prepared for client review before scheduling.",
        includedWork: "Cleaning, sanding touch-ups, fastener inspection, finish application, and ordinary cleanup.",
        paymentTerms: "A deposit is due before scheduling with the final balance due after the completion walkthrough.",
        milestoneSchedule: "Deposit before scheduling | 5000 | Before scheduling",
        changeOrderPolicy: "Any added scope or material change must be approved in writing before added work begins.",
        cancellationPolicy: "Cancellation or rescheduling should be documented in writing with costs reconciled.",
        nextAction: "Review agreement before scheduling.",
      }).success,
    ).toBe(false)

    expect(updateContractPacketStatusSchema.safeParse({ packetId: "contract_packet_01", status: "signed" }).success).toBe(true)
    expect(
      contractShareLinkSchema.safeParse({
        packetId: "contract_packet_01",
        clientEmail: "client@example.com",
        paymentMode: "milestone_schedule",
        paymentSummary: "Milestone payment timing is attached for review.",
        inviteClient: true,
      }).success,
    ).toBe(true)
    expect(
      contractSignatureSchema.safeParse({
        shareToken: "contract-token",
        signerName: "Client Contact",
        signerEmail: "client@example.com",
        signatureName: "Client Contact",
        scopeReviewCertification: true,
        paymentTermsCertification: true,
        consentToElectronicSignature: true,
        authorityCertification: true,
        recordsCertification: true,
      }).success,
    ).toBe(true)
    expect(
      contractSignatureSchema.safeParse({
        shareToken: "contract-token",
        signerName: "Client Contact",
        signerEmail: "client@example.com",
        signatureName: "Client Contact",
        consentToElectronicSignature: true,
        authorityCertification: true,
        recordsCertification: true,
      }).success,
    ).toBe(false)
    expect(updateEvidenceVaultStatusSchema.safeParse({ evidenceId: "vault_01", status: "reviewed" }).success).toBe(true)
    expect(adminSavedViewSchema.safeParse({ scope: "reports", name: "High priority", filterSummary: "priority=high" }).success).toBe(true)
    expect(
      recoveryComplianceReviewSchema.safeParse({
        recoveryCaseId: "recovery_01",
        status: "needs_changes",
        decisionReason: "Review factual language before outreach.",
      }).success,
    ).toBe(true)
  })

  it("keeps public profile output limited to public moderated data", () => {
    const profile = getPublicClientProfile("john-smith-orlando-fl")
    const serialized = JSON.stringify(profile)

    expect(profile?.reports.every((report) => ["approved", "disputed"].includes(report.status))).toBe(true)
    expect(serialized).not.toContain("pending")
    expect(serialized).not.toContain("rejected")
    expect(serialized).not.toContain("signed-completion-form.pdf")
  })

  it("covers Supabase contract packet migration fields in database types", () => {
    const typedInsert: Database["public"]["Tables"]["contract_packets"]["Insert"] = {
      contractor_id: "contractor_01",
      client_name: "Maria Alvarez",
      project_type: "Deck maintenance",
      template_type: "service_agreement",
      next_action: "Review agreement packet before sending.",
      scope_summary: "Scope is documented for private signing.",
      included_work: "Included work is documented.",
      payment_terms: "Payment terms are documented.",
      milestone_schedule: [{ id: "milestone_1", label: "Deposit", amount: 750 }],
      change_order_policy: "Change orders require written approval.",
      cancellation_policy: "Cancellation should be documented in writing.",
      signed_snapshot: null,
      signed_digest: null,
      signed_recorded_at: null,
    }

    expect(typedInsert.scope_summary).toContain("Scope")
    expect(requiredContractPacketColumns).toContain("signed_snapshot")
  })
})
