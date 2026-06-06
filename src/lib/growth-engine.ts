import type { ContractorProfile } from "@/lib/types"
import { buildBusinessSlug } from "@/lib/business-rating"

export type ReferralInviteStatus = "draft" | "sent" | "joined" | "credited" | "expired"
export type GrowthCreditStatus = "available" | "pending" | "redeemed"
export type ProfileClaimStatus = "unclaimed" | "in_review" | "claimed"
export type ReviewRequestStatus = "draft" | "sent" | "opened" | "completed" | "expired"

export interface ReferralInvite {
  id: string
  contractorId: string
  recipientName: string
  recipientEmail: string
  businessName: string
  trade: string
  status: ReferralInviteStatus
  creditCents: number
  createdAt: string
  expiresAt: string
}

export interface GrowthCreditLedgerEntry {
  id: string
  label: string
  status: GrowthCreditStatus
  creditCents: number
  createdAt: string
}

export interface ProfileClaimStep {
  id: string
  label: string
  description: string
  complete: boolean
}

export interface ProfileClaimWorkflow {
  id: string
  contractorId: string
  businessName: string
  publicProfileHref: string
  claimStatus: ProfileClaimStatus
  steps: ProfileClaimStep[]
  nextAction: string
}

export interface ReviewRequest {
  id: string
  contractorId: string
  clientName: string
  projectType: string
  requestType: "positive_reference" | "contractor_review" | "resolution_update"
  status: ReviewRequestStatus
  requestUrl: string
  sentAt?: string
  dueAt: string
}

export interface GrowthEngineData {
  referralCode: string
  referralUrl: string
  badgeEmbed: string
  invites: ReferralInvite[]
  creditLedger: GrowthCreditLedgerEntry[]
  claimWorkflow: ProfileClaimWorkflow
  reviewRequests: ReviewRequest[]
  networkLoops: Array<{
    title: string
    description: string
    metric: string
  }>
}

export function referralCreditSummary(invites: ReferralInvite[], ledger: GrowthCreditLedgerEntry[] = []) {
  const invitePending = invites
    .filter((invite) => invite.status === "sent" || invite.status === "joined")
    .reduce((total, invite) => total + invite.creditCents, 0)
  const inviteAvailable = invites
    .filter((invite) => invite.status === "credited")
    .reduce((total, invite) => total + invite.creditCents, 0)
  const ledgerAvailable = ledger
    .filter((entry) => entry.status === "available")
    .reduce((total, entry) => total + entry.creditCents, 0)
  const ledgerPending = ledger
    .filter((entry) => entry.status === "pending")
    .reduce((total, entry) => total + entry.creditCents, 0)
  const redeemed = ledger
    .filter((entry) => entry.status === "redeemed")
    .reduce((total, entry) => total + entry.creditCents, 0)

  return {
    availableCents: inviteAvailable + ledgerAvailable,
    pendingCents: invitePending + ledgerPending,
    lifetimeCents: inviteAvailable + ledgerAvailable + redeemed,
    completedInvites: invites.filter((invite) => invite.status === "joined" || invite.status === "credited").length,
  }
}

export function profileClaimCompletion(workflow: ProfileClaimWorkflow) {
  if (workflow.steps.length === 0) return 0

  return Math.round((workflow.steps.filter((step) => step.complete).length / workflow.steps.length) * 100)
}

export function rankReviewRequests(requests: ReviewRequest[], asOf = "2026-06-05T12:00:00.000Z") {
  const now = new Date(asOf).getTime()
  const statusPriority: Record<ReviewRequestStatus, number> = {
    opened: 0,
    sent: 1,
    draft: 2,
    expired: 3,
    completed: 4,
  }

  return [...requests].sort((left, right) => {
    const leftDue = new Date(left.dueAt).getTime()
    const rightDue = new Date(right.dueAt).getTime()
    const leftOverdue = leftDue < now && left.status !== "completed" ? -1 : 0
    const rightOverdue = rightDue < now && right.status !== "completed" ? -1 : 0

    return (
      leftOverdue - rightOverdue ||
      statusPriority[left.status] - statusPriority[right.status] ||
      leftDue - rightDue
    )
  })
}

export function networkGrowthScore(input: {
  claimCompletion: number
  completedInvites: number
  completedReviewRequests: number
  publicProfileViews: number
}) {
  const claimScore = Math.min(35, Math.round(input.claimCompletion * 0.35))
  const inviteScore = Math.min(25, input.completedInvites * 8)
  const reviewScore = Math.min(25, input.completedReviewRequests * 7)
  const viewScore = Math.min(15, Math.floor(input.publicProfileViews / 20))

  return Math.min(100, claimScore + inviteScore + reviewScore + viewScore)
}

export function getMockGrowthEngineData(contractor: ContractorProfile, siteUrl: string): GrowthEngineData {
  const referralCode = `${contractor.businessName.replace(/[^a-z0-9]+/gi, "").slice(0, 10).toUpperCase()}-${contractor.state}`
  const publicProfileHref = `/business/${buildBusinessSlug(contractor)}`
  const referralUrl = `${siteUrl}/signup?ref=${encodeURIComponent(referralCode)}`

  return {
    referralCode,
    referralUrl,
    badgeEmbed: `<a href="${siteUrl}${publicProfileHref}" rel="nofollow noopener">View ${contractor.businessName} on Client Bureau</a>`,
    invites: [
      {
        id: "invite_01",
        contractorId: contractor.id,
        recipientName: "Alex Rivera",
        recipientEmail: "alex@riverabuilds.com",
        businessName: "Rivera Builds",
        trade: "Finish carpentry",
        status: "joined",
        creditCents: 2500,
        createdAt: "2026-05-17T14:00:00.000Z",
        expiresAt: "2026-07-17T14:00:00.000Z",
      },
      {
        id: "invite_02",
        contractorId: contractor.id,
        recipientName: "Danielle Moore",
        recipientEmail: "danielle@mooretile.com",
        businessName: "Moore Tile Co.",
        trade: "Tile installation",
        status: "sent",
        creditCents: 2500,
        createdAt: "2026-05-28T14:00:00.000Z",
        expiresAt: "2026-07-28T14:00:00.000Z",
      },
    ],
    creditLedger: [
      {
        id: "credit_01",
        label: "Verified contractor referral",
        status: "available",
        creditCents: 2500,
        createdAt: "2026-05-21T14:00:00.000Z",
      },
      {
        id: "credit_02",
        label: "Profile badge setup credit",
        status: "pending",
        creditCents: 1000,
        createdAt: "2026-05-31T14:00:00.000Z",
      },
    ],
    claimWorkflow: {
      id: "claim_01",
      contractorId: contractor.id,
      businessName: contractor.businessName,
      publicProfileHref,
      claimStatus: contractor.verificationStatus === "verified" ? "claimed" : "in_review",
      nextAction: "Add service areas and publish the profile badge on your website.",
      steps: [
        {
          id: "claim_step_01",
          label: "Business identity",
          description: "Business name, trade, and market are connected to your account.",
          complete: true,
        },
        {
          id: "claim_step_02",
          label: "Verification records",
          description: "License, email, phone, or insurance signals support the profile claim.",
          complete: contractor.verificationStatus !== "unverified",
        },
        {
          id: "claim_step_03",
          label: "Service areas",
          description: "Service markets help contractors and clients understand where the business operates.",
          complete: true,
        },
        {
          id: "claim_step_04",
          label: "Profile badge",
          description: "A branded badge on your website helps people verify the public profile.",
          complete: false,
        },
        {
          id: "claim_step_05",
          label: "Review request loop",
          description: "Send reference requests after completed jobs to build useful reputation context.",
          complete: false,
        },
      ],
    },
    reviewRequests: [
      {
        id: "request_01",
        contractorId: contractor.id,
        clientName: "Maria Alvarez",
        projectType: "Deck maintenance",
        requestType: "positive_reference",
        status: "opened",
        requestUrl: `${siteUrl}/submit-report?intent=positive&contractor=${encodeURIComponent(contractor.businessName)}`,
        sentAt: "2026-05-30T14:00:00.000Z",
        dueAt: "2026-06-07T14:00:00.000Z",
      },
      {
        id: "request_02",
        contractorId: contractor.id,
        clientName: "New intake client",
        projectType: "Roof repair",
        requestType: "contractor_review",
        status: "draft",
        requestUrl: `${siteUrl}/submit-report?contractor=${encodeURIComponent(contractor.businessName)}`,
        dueAt: "2026-06-12T14:00:00.000Z",
      },
    ],
    networkLoops: [
      {
        title: "Invite trusted contractors",
        description: "More verified contractors create better search coverage and better public profile context.",
        metric: "1 joined referral",
      },
      {
        title: "Request references after jobs",
        description: "Positive, resolved, and documented experiences make the network useful without becoming a complaint wall.",
        metric: "2 active requests",
      },
      {
        title: "Claim and share profiles",
        description: "Claimed public business profiles make referral traffic and trust verification easier.",
        metric: "Profile in review",
      },
    ],
  }
}
