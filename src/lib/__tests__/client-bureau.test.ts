import { describe, expect, it } from "vitest"

import { formDataToObject } from "@/lib/actions/result"
import sitemap from "@/app/sitemap"
import { generateMetadata as generateClientProfileMetadata } from "@/app/client/[slug]/page"
import { clientReportSchema, clientResponseSchema } from "@/lib/schemas/client-bureau"
import {
  calculateClientBureauScore,
  getReportedBalanceSummary,
  getScoreCategoryBreakdown,
  scoreToRiskLevel,
} from "@/lib/scoring"
import { buildClientSlug, ensureUniqueSlug } from "@/lib/slug"
import { getInternalRedirectUrl } from "@/lib/urls"
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
  createContractShareLink,
  getContractPacketByShareToken,
  searchClients,
  signContractShare,
  simulateApprovalPublication,
  simulateSubmittedClientReport,
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
import {
  clientProfiles,
  adminSavedViews,
  clientPipelineItems,
  contractPackets,
  contractorWatchlist,
  contractWorkspaceItems,
  evidenceVaultItems,
  lienNoticeDrafts,
  moderationCases,
  paymentPlans,
  paymentRecoveryAttempts,
  paymentRecoveryCases,
  reportDrafts,
  watchlistAlerts,
} from "@/lib/mock-data"
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
  lienNoticeDraftSchema,
  paymentPlanSchema,
  paymentRecoveryAttemptSchema,
  moderationCaseAssignmentSchema,
  moderationDecisionReasonSchema,
  paymentRecoveryCaseSchema,
  recoveryComplianceReviewSchema,
  reportDraftSchema,
  updateClientPipelineStageSchema,
  updateContractPacketStatusSchema,
  updateEvidenceVaultStatusSchema,
  watchlistItemSchema,
} from "@/lib/schemas/client-bureau"
import type { ClientReport } from "@/lib/types"

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
    expect(copy).toContain("Recovery is documentation-first")
    expect(copy.toLowerCase()).not.toMatch(/blacklist|shame|scammer|deadbeat|fraudster/)
  })

  it("exposes platform modules in public and contractor navigation", () => {
    expect(publicPrimaryNav.map((item) => item.label)).toEqual([
      "Search",
      "How It Works",
      "Pricing",
      "Resources",
      "About",
      "Contact",
    ])
    expect(contractorDashboardNav.map((item) => item.label)).toEqual([
      "Overview",
      "Search Clients",
      "Reports",
      "Watchlist",
      "Contracts",
      "Payment Recovery",
      "Lien Readiness",
      "Evidence Vault",
      "Alerts",
      "Billing",
    ])
    expect(contractorPrimaryNav.find((item) => item.label === "Contracts")?.href).toBe(
      "/dashboard?workspace=contracts",
    )
    expect(contractorDashboardNav.find((item) => item.label === "Lien Readiness")?.href).toBe(
      "/dashboard?workspace=lien-readiness",
    )
    expect(contractorDashboardNav.find((item) => item.label === "Billing")?.href).toBe(
      "/dashboard?workspace=billing",
    )
    expect(contractorDashboardGroups.map((group) => group.title)).toEqual([
      "Before the Job",
      "Agreement and Records",
      "After the Invoice",
      "Account",
    ])
    expect(resourceNavigationGroups.flatMap((group) => group.links).map((item) => item.href)).toContain(
      "/score-methodology",
    )
    expect(adminNavigationGroups.map((group) => group.title)).toEqual([
      "Command",
      "Moderation",
      "Records",
      "Operations",
      "System",
    ])
    expect(adminNavigationGroups.flatMap((group) => group.links).map((item) => item.label)).toEqual([
      "Command Center",
      "Reports",
      "Discussions",
      "Uploads",
      "Clients",
      "Contractors",
      "Recovery",
      "Contracts",
      "Audit Log",
      "Settings",
    ])
    expect(adminNavigationGroups.flatMap((group) => group.links).map((item) => item.href)).toContain(
      "/admin?workspace=recovery",
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
})

describe("search and public profiles", () => {
  it("ranks matching search results and preserves private identifier language", () => {
    const results = searchClients("John", { state: "FL" })

    expect(results[0]?.publicSlug).toBe("john-smith-orlando-fl")
    expect(results[0]?.matchScore).toBeGreaterThan(0)
    expect(results[0]?.matchedBy).toContain("Name")
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
})

describe("public SEO landing pages", () => {
  it("defines the requested public landing page clusters", () => {
    expect(getSeoLandingPage("clients", "florida")?.canonicalPath).toBe("/clients/florida")
    expect(getSeoLandingPage("reports", "non-payment")?.reportCategory).toBe("Non-payment")
    expect(getSeoLandingPage("industries", "service-businesses")?.title).toContain("Service Businesses")
    expect(allSeoLandingPages.length).toBe(12)
  })

  it("includes SEO landing pages in the sitemap", async () => {
    const urls = (await sitemap()).map((entry) => entry.url)

    expect(urls).toContain("https://clientbureau.com/resources")
    expect(urls).toContain("https://clientbureau.com/clients/florida")
    expect(urls).toContain("https://clientbureau.com/reports/high-risk")
    expect(urls).toContain("https://clientbureau.com/industries/contractors")
  })

  it("generates careful metadata for public client profiles", async () => {
    const metadata = await generateClientProfileMetadata({
      params: Promise.resolve({ slug: "john-smith-orlando-fl" }),
    })

    expect(String(metadata.title)).toContain("John Smith")
    expect(String(metadata.description)).toContain("moderated contractor-submitted")
  })
})

describe("schemas and mock actions", () => {
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
      truthfulCertification: true,
      documentationCertification: true,
      publicSummaryCertification: true,
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
      truthfulCertification: true,
      documentationCertification: true,
      publicSummaryCertification: true,
    })

    expect(validPositive.success).toBe(true)
    expect(invalidPositive.success).toBe(false)
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

  it("scores recovery, lien readiness, and contract packets", () => {
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
    expect(work.map((item) => item.label)).toContain("Recovery")
    expect(work.map((item) => item.label)).toContain("Evidence")
  })

  it("tracks recovery attempts, payment plans, contract packets, and saved views", () => {
    expect(nextRecoveryAttemptAction(paymentRecoveryAttempts[1])).toContain("dispute")
    expect(paymentPlanCompletion(paymentPlans[0])).toBe(5)
    expect(contractPacketCompletionPercentage(contractPackets[1])).toBeGreaterThanOrEqual(80)
    expect(filterAdminSavedViews(adminSavedViews, "recovery")).toHaveLength(1)
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
      consentToElectronicSignature: true,
      authorityCertification: true,
      recordsCertification: true,
    })

    expect(signed.signatureStatus).toBe("client_signed")
    expect(signed.clientInviteStatus).toBe("joined")
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
        projectType: "Deck maintenance",
        templateType: "service_agreement",
        packetValue: 3900,
        depositRequired: 750,
        milestoneCount: 2,
        requiredBeforeScheduling: true,
        nextAction: "Review agreement before scheduling.",
      }).success,
    ).toBe(true)

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
})
