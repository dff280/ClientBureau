import type {
  ClientReport,
  ContractorRiskOpsData,
  Subscription,
} from "@/lib/types"

export const dashboardToolRouteChecklist = [
  { href: "/dashboard/activity", slug: "activity", title: "Activity" },
  { href: "/dashboard/alerts", slug: "alerts", title: "Alerts" },
  { href: "/dashboard/billing", slug: "billing", title: "Billing" },
  { href: "/dashboard/contracts", slug: "contracts", title: "Contracts" },
  { href: "/dashboard/evidence", slug: "evidence", title: "Evidence Vault" },
  { href: "/dashboard/growth", slug: "growth", title: "Growth Engine" },
  { href: "/dashboard/lien-readiness", slug: "lien-readiness", title: "Florida Lien Service" },
  { href: "/dashboard/recovery", slug: "recovery", title: "Payment Recovery" },
  { href: "/dashboard/reports", slug: "reports", title: "Reports" },
  { href: "/dashboard/watchlist", slug: "watchlist", title: "Watchlist" },
] as const

export type DashboardToolSlug = (typeof dashboardToolRouteChecklist)[number]["slug"]

export type DashboardToolConfidence = {
  attentionCount: number
  attentionLabel: string
  emptyDetail: string
  emptyTitle: string
  recordCount: number
  recordLabel: string
  verifyAfterSave: string
}

export function buildDashboardToolConfidence({
  reports,
  riskOps,
  savedSearchCount,
  subscription,
  tool,
}: {
  reports: ClientReport[]
  riskOps: ContractorRiskOpsData
  savedSearchCount: number
  subscription?: Subscription
  tool: DashboardToolSlug
}): DashboardToolConfidence {
  const unreadAlerts = riskOps.watchlistAlerts.filter((item) => !item.readAt).length
  const openContractPackets = riskOps.contractPackets.filter(
    (item) => !["signed", "archived"].includes(item.status),
  ).length
  const evidenceNeedsReview =
    riskOps.evidenceSummaries.filter((item) => ["review_pending", "needs_more_info", "missing"].includes(item.status)).length +
    riskOps.evidenceVault.filter((item) => ["review_pending", "needs_more_info", "uploaded"].includes(item.status)).length
  const openRecoveryCases =
    riskOps.paymentRecoveryCases.filter((item) => !["paid", "closed"].includes(item.status)).length +
    riskOps.managedRecoveryCases.filter((item) => !["resolved", "closed"].includes(item.status)).length
  const openLienCases =
    riskOps.lienNoticeDrafts.filter((item) => item.requiredReview).length +
    riskOps.floridaLienCases.filter((item) => !["released", "closed"].includes(item.status)).length
  const openPipelineItems = riskOps.clientPipeline.filter((item) => item.stage !== "closed").length
  const reportDraftsReady = riskOps.reportDrafts.filter((item) => item.status === "ready_to_submit").length

  switch (tool) {
    case "activity":
      return {
        attentionCount: openPipelineItems + unreadAlerts,
        attentionLabel: "open client/pipeline signals",
        emptyDetail: "Activity appears after searches, reports, contracts, evidence, recovery, or profile updates happen.",
        emptyTitle: "No workspace activity yet",
        recordCount: riskOps.activity.length + riskOps.clientPipeline.length,
        recordLabel: "activity and pipeline records",
        verifyAfterSave: "Refresh this page after any dashboard action; the new event should appear in Recent workspace activity or the matching tool list.",
      }
    case "alerts":
      return {
        attentionCount: unreadAlerts,
        attentionLabel: "unread alerts",
        emptyDetail: "Watch a client from Search or Watchlist to begin receiving private account alerts.",
        emptyTitle: "No alerts yet",
        recordCount: riskOps.watchlistAlerts.length,
        recordLabel: "monitoring alerts",
        verifyAfterSave: "After watching a client, return here and confirm future profile, response, dispute, or rating movement appears as an alert.",
      }
    case "billing":
      return {
        attentionCount: subscription?.tier === "free" ? 1 : 0,
        attentionLabel: subscription?.tier === "free" ? "plan review available" : "account items needing attention",
        emptyDetail: "Billing remains in review mode until paid checkout is intentionally enabled and tested.",
        emptyTitle: "Billing review mode",
        recordCount: 1,
        recordLabel: `${subscription?.tier ?? "free"} plan record`,
        verifyAfterSave: "Plan interest and billing review requests should route through signup/contact without exposing checkout internals.",
      }
    case "contracts":
      return {
        attentionCount: openContractPackets,
        attentionLabel: "open signing packets",
        emptyDetail: "Create an agreement packet when scope, deposit, milestones, and change-order terms are ready.",
        emptyTitle: "No contract records yet",
        recordCount: riskOps.contractDocuments.length + riskOps.contractPackets.length,
        recordLabel: "agreement records",
        verifyAfterSave: "After creating a packet, refresh Contracts and confirm it appears under Contract signing links with the expected status.",
      }
    case "evidence":
      return {
        attentionCount: evidenceNeedsReview,
        attentionLabel: "items needing review",
        emptyDetail: "Evidence appears here after files are attached to reports, recovery, lien service, or private job workflows.",
        emptyTitle: "No private evidence records yet",
        recordCount: riskOps.evidenceVault.length + riskOps.evidenceSummaries.length,
        recordLabel: "evidence records",
        verifyAfterSave: "After updating an evidence status, refresh Evidence Vault and confirm the status changed on the same private item.",
      }
    case "growth":
      return {
        attentionCount: 0,
        attentionLabel: "growth tasks needing attention",
        emptyDetail: "Use Growth after real jobs to invite trusted contractors, claim your profile, and request feedback.",
        emptyTitle: "Growth tools ready",
        recordCount: 0,
        recordLabel: "private growth records",
        verifyAfterSave: "Invite and profile-claim actions should show clear confirmation before you leave the page.",
      }
    case "lien-readiness":
      return {
        attentionCount: openLienCases,
        attentionLabel: "lien items in review",
        emptyDetail: "Start a Florida case only when property, deadline, contract, invoice, and authorization details are ready for review.",
        emptyTitle: "No Florida lien records yet",
        recordCount: riskOps.floridaLienCases.length + riskOps.lienNoticeDrafts.length,
        recordLabel: "Florida lien service records",
        verifyAfterSave: "After submitting a case or checklist, refresh Florida Lien Service and confirm it appears with its current review status.",
      }
    case "recovery":
      return {
        attentionCount: openRecoveryCases,
        attentionLabel: "open recovery items",
        emptyDetail: "Open a case when overdue payment needs documented private follow-up and contractor-direct resolution tracking.",
        emptyTitle: "No recovery records yet",
        recordCount:
          riskOps.managedRecoveryCases.length +
          riskOps.paymentRecoveryCases.length +
          riskOps.paymentRecoveryAttempts.length +
          riskOps.paymentPlans.length,
        recordLabel: "payment recovery records",
        verifyAfterSave: "After opening a case, logging contact, or creating a plan, refresh Payment Recovery and confirm the record remains visible.",
      }
    case "reports":
      return {
        attentionCount: reportDraftsReady,
        attentionLabel: "drafts ready to submit",
        emptyDetail: "Save a draft or submit a report when you have a documented positive, resolved, or payment-related client experience.",
        emptyTitle: "No report records yet",
        recordCount: reports.length + riskOps.reportDrafts.length,
        recordLabel: "submitted and draft reports",
        verifyAfterSave: "After saving a draft, refresh Reports and confirm it appears in Report draft control before submitting.",
      }
    case "watchlist":
      return {
        attentionCount: unreadAlerts,
        attentionLabel: "unread watchlist alerts",
        emptyDetail: "Run a client check, then save or watch clients you may work with again.",
        emptyTitle: "No watched clients yet",
        recordCount: riskOps.watchlist.length + savedSearchCount,
        recordLabel: "watched clients and saved searches",
        verifyAfterSave: "After saving a search or watching a client, refresh Watchlist and confirm the saved item remains visible.",
      }
  }
}
