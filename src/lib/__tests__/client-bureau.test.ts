import { describe, expect, it } from "vitest"

import { formDataToObject } from "@/lib/actions/result"
import { clientReportSchema, clientResponseSchema } from "@/lib/schemas/client-bureau"
import { calculateClientBureauScore, scoreToRiskLevel } from "@/lib/scoring"
import { buildClientSlug, ensureUniqueSlug } from "@/lib/slug"
import { getInternalRedirectUrl } from "@/lib/urls"
import {
  assignModerationCase,
  countWatchlistAlerts,
  filterModerationCases,
  intakeRiskRecommendation,
  isValidDecisionReason,
  rankWatchlistItems,
  reportDraftCompletionPercentage,
} from "@/lib/platform-features"
import {
  getPublicClientProfile,
  searchClients,
  simulateApprovalPublication,
  simulateSubmittedClientReport,
} from "@/lib/repositories/client-bureau"
import {
  clientProfiles,
  contractorWatchlist,
  moderationCases,
  reportDrafts,
} from "@/lib/mock-data"
import {
  intakeAssessmentSchema,
  moderationCaseAssignmentSchema,
  moderationDecisionReasonSchema,
  reportDraftSchema,
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
})

describe("schemas and mock actions", () => {
  it("validates report submission and rejects impossible unpaid amounts", () => {
    const parsed = clientReportSchema.safeParse({
      firstName: "Alex",
      lastName: "Morris",
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

  it("keeps public profile output limited to public moderated data", () => {
    const profile = getPublicClientProfile("john-smith-orlando-fl")
    const serialized = JSON.stringify(profile)

    expect(profile?.reports.every((report) => ["approved", "disputed"].includes(report.status))).toBe(true)
    expect(serialized).not.toContain("pending")
    expect(serialized).not.toContain("rejected")
    expect(serialized).not.toContain("signed-completion-form.pdf")
  })
})
