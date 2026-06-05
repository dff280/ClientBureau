import type {
  ClientProfile,
  ClientReport,
  ContractorProfile,
  ContractorRiskOpsData,
  ReportEvidence,
  SavedSearch,
  Subscription,
  User,
} from "@/lib/types"

type DashboardInput = {
  user: User
  contractor: ContractorProfile
  reports: ClientReport[]
  evidence: ReportEvidence[]
  savedSearches: SavedSearch[]
  subscription?: Subscription
}

export type DashboardKpiTone = "slate" | "amber" | "emerald" | "rose" | "blue"

export interface DashboardKpi {
  id: string
  label: string
  value: string
  helper: string
  href: string
  tone: DashboardKpiTone
  trend: string
}

export interface DashboardTrendPoint {
  label: string
  searches: number
  reviews: number
  agreements: number
  balanceAtRisk: number
}

export interface DashboardActivityFeedItem {
  id: string
  label: string
  title: string
  detail: string
  href: string
  createdAt: string
  tone: DashboardKpiTone
}

export interface DashboardReportSummary {
  id: string
  label: string
  value: string
  helper: string
  href: string
}

export interface DashboardBusinessInsight {
  id: string
  title: string
  description: string
  actionLabel: string
  href: string
  tone: DashboardKpiTone
}

export interface EnterpriseDashboardSummary {
  kpis: DashboardKpi[]
  trends: DashboardTrendPoint[]
  activityFeed: DashboardActivityFeedItem[]
  reportSummaries: DashboardReportSummary[]
  insights: DashboardBusinessInsight[]
  healthScore: number
  periodLabel: string
}

export function buildEnterpriseDashboardSummary(input: {
  dashboard: DashboardInput
  riskOps: ContractorRiskOpsData
  clientProfiles: ClientProfile[]
  asOf?: string
}): EnterpriseDashboardSummary {
  const { dashboard, riskOps, clientProfiles } = input
  const asOf = input.asOf ? new Date(input.asOf) : new Date()
  const openRecoveryCases = [
    ...riskOps.paymentRecoveryCases.filter((item) => !["resolved", "paused"].includes(item.status)),
    ...riskOps.managedRecoveryCases.filter((item) => !["resolved", "closed", "paused"].includes(item.status)),
  ]
  const openBalance = openRecoveryCases.reduce((total, item) => total + item.amountDue, 0)
  const pipelineValue = riskOps.clientPipeline
    .filter((item) => item.stage !== "closed")
    .reduce((total, item) => total + item.estimatedValue, 0)
  const unsignedContracts = riskOps.contractPackets.filter(
    (item) => !["signed", "archived"].includes(item.status) && item.signatureStatus !== "fully_signed",
  )
  const signedContracts = riskOps.contractPackets.filter(
    (item) => item.status === "signed" || item.signatureStatus === "fully_signed",
  )
  const evidenceNeedsReview = riskOps.evidenceVault.filter((item) =>
    ["uploaded", "review_pending", "needs_more_info"].includes(item.status),
  )
  const unreadAlerts = riskOps.watchlistAlerts.filter((item) => !item.readAt)
  const publishedReports = dashboard.reports.filter((report) => {
    const client = clientProfiles.find((profile) => profile.id === report.clientId)
    return report.status === "approved" && Boolean(client?.isPublic)
  })
  const pendingReports = dashboard.reports.filter((report) => report.status === "pending")
  const resolvedReports = dashboard.reports.filter((report) =>
    ["Paid in full", "Settled", "Resolved", "Admin verified"].includes(report.resolutionStatus ?? ""),
  )

  const healthScore = businessHealthScore({
    openBalance,
    pipelineValue,
    unreadAlerts: unreadAlerts.length,
    unsignedContracts: unsignedContracts.length,
    evidenceNeedsReview: evidenceNeedsReview.length,
    verificationReady: dashboard.contractor.verificationStatus === "verified",
    reportsSubmitted: dashboard.reports.length,
  })
  const trends = buildTrendPoints({
    asOf,
    searches: dashboard.savedSearches,
    reports: dashboard.reports,
    contracts: riskOps.contractPackets,
    recoveryCases: openRecoveryCases,
  })

  return {
    healthScore,
    periodLabel: `${trends[0]?.label ?? "Recent"} - ${trends.at(-1)?.label ?? "Today"}`,
    kpis: [
      {
        id: "open-balance",
        label: "Open balances",
        value: formatCurrency(openBalance),
        helper: `${openRecoveryCases.length} recovery case${openRecoveryCases.length === 1 ? "" : "s"}`,
        href: "/dashboard/recovery",
        tone: openBalance > 0 ? "rose" : "emerald",
        trend: openBalance > 0 ? "Action needed" : "Clear",
      },
      {
        id: "pipeline-value",
        label: "Pipeline protected",
        value: formatCurrency(pipelineValue),
        helper: `${riskOps.clientPipeline.filter((item) => item.stage !== "closed").length} active client file${riskOps.clientPipeline.length === 1 ? "" : "s"}`,
        href: "/dashboard/activity",
        tone: "blue",
        trend: "Screen before scheduling",
      },
      {
        id: "agreement-status",
        label: "Agreements",
        value: `${signedContracts.length}/${riskOps.contractPackets.length}`,
        helper: `${unsignedContracts.length} waiting on signature or review`,
        href: "/dashboard/contracts",
        tone: unsignedContracts.length > 0 ? "amber" : "emerald",
        trend: "Terms coverage",
      },
      {
        id: "public-reviews",
        label: "Published reviews",
        value: String(publishedReports.length),
        helper: `${pendingReports.length} in review, ${resolvedReports.length} resolved`,
        href: "/dashboard/reports",
        tone: pendingReports.length > 0 ? "amber" : "emerald",
        trend: "Moderation status",
      },
    ],
    trends,
    activityFeed: buildActivityFeed({ dashboard, riskOps, openRecoveryCases }),
    reportSummaries: [
      {
        id: "reports",
        label: "Reviews",
        value: String(dashboard.reports.length),
        helper: `${publishedReports.length} published / ${pendingReports.length} pending`,
        href: "/dashboard/reports",
      },
      {
        id: "documents",
        label: "Documents",
        value: String(dashboard.evidence.length + riskOps.evidenceVault.length),
        helper: `${evidenceNeedsReview.length} need review`,
        href: "/dashboard/evidence",
      },
      {
        id: "watchlist",
        label: "Watchlist",
        value: String(riskOps.watchlist.filter((item) => item.status === "active").length),
        helper: `${unreadAlerts.length} unread alerts`,
        href: "/dashboard/watchlist",
      },
      {
        id: "searches",
        label: "Saved searches",
        value: String(dashboard.savedSearches.length),
        helper: "Client checks saved this month",
        href: "/search",
      },
    ],
    insights: buildBusinessInsights({
      openBalance,
      pipelineValue,
      unsignedContracts: unsignedContracts.length,
      evidenceNeedsReview: evidenceNeedsReview.length,
      unreadAlerts: unreadAlerts.length,
      pendingReports: pendingReports.length,
      verificationReady: dashboard.contractor.verificationStatus === "verified",
    }),
  }
}

function buildTrendPoints(input: {
  asOf: Date
  searches: SavedSearch[]
  reports: ClientReport[]
  contracts: ContractorRiskOpsData["contractPackets"]
  recoveryCases: Array<{ amountDue: number; createdAt: string }>
}) {
  const buckets = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(input.asOf)
    date.setDate(1)
    date.setMonth(date.getMonth() - (5 - index))
    const key = monthKey(date)

    return {
      key,
      label: date.toLocaleString("en-US", { month: "short" }),
      searches: 0,
      reviews: 0,
      agreements: 0,
      balanceAtRisk: 0,
    }
  })
  const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]))

  for (const search of input.searches) {
    const bucket = byKey.get(monthKey(new Date(search.createdAt)))
    if (bucket) bucket.searches += 1
  }

  for (const report of input.reports) {
    const bucket = byKey.get(monthKey(new Date(report.createdAt)))
    if (bucket) bucket.reviews += 1
  }

  for (const contract of input.contracts) {
    const bucket = byKey.get(monthKey(new Date(contract.createdAt)))
    if (bucket) bucket.agreements += 1
  }

  for (const recoveryCase of input.recoveryCases) {
    const bucket = byKey.get(monthKey(new Date(recoveryCase.createdAt)))
    if (bucket) bucket.balanceAtRisk += recoveryCase.amountDue
  }

  return buckets.map((bucket) => ({
    label: bucket.label,
    searches: bucket.searches,
    reviews: bucket.reviews,
    agreements: bucket.agreements,
    balanceAtRisk: bucket.balanceAtRisk,
  }))
}

function buildActivityFeed(input: {
  dashboard: DashboardInput
  riskOps: ContractorRiskOpsData
  openRecoveryCases: Array<{ id: string; clientName: string; nextAction: string; createdAt: string; updatedAt: string }>
}): DashboardActivityFeedItem[] {
  const reportItems = input.dashboard.reports.map((report) => ({
    id: `report-${report.id}`,
    label: "Review",
    title: report.reportCategory,
    detail: report.reportSummary,
    href: "/dashboard/reports",
    createdAt: report.createdAt,
    tone: report.status === "approved" ? "emerald" : report.status === "pending" ? "amber" : "slate",
  }) satisfies DashboardActivityFeedItem)
  const contractItems = input.riskOps.contractPackets.map((contract) => ({
    id: `contract-${contract.id}`,
    label: "Contract",
    title: contract.clientName,
    detail: contract.nextAction,
    href: "/dashboard/contracts",
    createdAt: contract.updatedAt,
    tone: contract.signatureStatus === "fully_signed" ? "emerald" : "amber",
  }) satisfies DashboardActivityFeedItem)
  const recoveryItems = input.openRecoveryCases.map((item) => ({
    id: `recovery-${item.id}`,
    label: "Payment Recovery",
    title: item.clientName,
    detail: item.nextAction,
    href: "/dashboard/recovery",
    createdAt: item.updatedAt,
    tone: "rose",
  }) satisfies DashboardActivityFeedItem)
  const workspaceItems = input.riskOps.activity.map((item) => ({
    id: `activity-${item.id}`,
    label: "Workspace",
    title: item.title,
    detail: item.description,
    href: "/dashboard/activity",
    createdAt: item.createdAt,
    tone: item.tone === "positive" ? "emerald" : item.tone === "warning" ? "amber" : "slate",
  }) satisfies DashboardActivityFeedItem)

  return [...reportItems, ...contractItems, ...recoveryItems, ...workspaceItems]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8)
}

function buildBusinessInsights(input: {
  openBalance: number
  pipelineValue: number
  unsignedContracts: number
  evidenceNeedsReview: number
  unreadAlerts: number
  pendingReports: number
  verificationReady: boolean
}): DashboardBusinessInsight[] {
  const insights: DashboardBusinessInsight[] = []

  if (input.openBalance > 0) {
    insights.push({
      id: "open-balance",
      title: "Prioritize payment follow-up",
      description: `${formatCurrency(input.openBalance)} is currently tied to open recovery work. Review the next action before sending new reminders.`,
      actionLabel: "Open recovery",
      href: "/dashboard/recovery",
      tone: "rose",
    })
  }

  if (input.unsignedContracts > 0) {
    insights.push({
      id: "contracts",
      title: "Tighten agreement coverage",
      description: `${input.unsignedContracts} agreement packet${input.unsignedContracts === 1 ? "" : "s"} still need signature or review before work moves forward.`,
      actionLabel: "Review contracts",
      href: "/dashboard/contracts",
      tone: "amber",
    })
  }

  if (input.evidenceNeedsReview > 0) {
    insights.push({
      id: "evidence",
      title: "Clean up evidence readiness",
      description: `${input.evidenceNeedsReview} evidence item${input.evidenceNeedsReview === 1 ? "" : "s"} need review, mapping, or more information.`,
      actionLabel: "Open evidence",
      href: "/dashboard/evidence",
      tone: "blue",
    })
  }

  if (input.unreadAlerts > 0) {
    insights.push({
      id: "alerts",
      title: "Check monitored-client changes",
      description: `${input.unreadAlerts} watchlist alert${input.unreadAlerts === 1 ? "" : "s"} may affect scheduling, deposits, or contract terms.`,
      actionLabel: "View alerts",
      href: "/dashboard/watchlist",
      tone: "amber",
    })
  }

  if (!input.verificationReady) {
    insights.push({
      id: "verification",
      title: "Finish business verification",
      description: "A verified business profile improves trust signals before review requests, contracts, and profile sharing.",
      actionLabel: "Open account",
      href: "/dashboard/billing",
      tone: "blue",
    })
  }

  if (insights.length === 0) {
    insights.push({
      id: "clear",
      title: "Workspace is current",
      description: `You have ${formatCurrency(input.pipelineValue)} in active pipeline with no urgent dashboard issues.`,
      actionLabel: "Search next client",
      href: "/search",
      tone: "emerald",
    })
  }

  return insights.slice(0, 4)
}

function businessHealthScore(input: {
  openBalance: number
  pipelineValue: number
  unreadAlerts: number
  unsignedContracts: number
  evidenceNeedsReview: number
  verificationReady: boolean
  reportsSubmitted: number
}) {
  const balancePenalty = input.pipelineValue > 0 ? Math.min(22, Math.round((input.openBalance / input.pipelineValue) * 40)) : 0
  const alertPenalty = Math.min(16, input.unreadAlerts * 4)
  const contractPenalty = Math.min(18, input.unsignedContracts * 6)
  const evidencePenalty = Math.min(12, input.evidenceNeedsReview * 4)
  const verificationPenalty = input.verificationReady ? 0 : 10
  const contributionBonus = Math.min(8, input.reportsSubmitted * 2)

  return Math.max(0, Math.min(100, 82 - balancePenalty - alertPenalty - contractPenalty - evidencePenalty - verificationPenalty + contributionBonus))
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  })
}
