import type {
  AdminSavedView,
  AdminSavedViewScope,
  ClientPipelineItem,
  ClientIntakeAssessment,
  ClientProfile,
  ContractPacket,
  ContractWorkspaceItem,
  ContractorWatchlistItem,
  EvidenceVaultItem,
  LienNoticeDraft,
  ModerationCase,
  ModerationCaseStatus,
  ModerationDecisionReason,
  PaymentRecoveryCase,
  PaymentRecoveryAttempt,
  PaymentPlan,
  ReportDraft,
  WatchlistAlert,
} from "@/lib/types"

const requiredDraftFields: Array<keyof ReportDraft> = [
  "clientName",
  "projectType",
  "estimatedValue",
  "summary",
  "nextStep",
]

const priorityWeight: Record<ContractorWatchlistItem["alertLevel"], number> = {
  urgent: 4,
  high: 3,
  normal: 2,
  low: 1,
}

export const moderationDecisionReasons: ModerationDecisionReason[] = [
  "approved_with_edits",
  "insufficient_evidence",
  "private_information",
  "neutrality_issue",
  "duplicate_report",
  "policy_rejection",
]

export const clientPipelineStages: ClientPipelineItem["stage"][] = [
  "new_lead",
  "screening",
  "contract_pending",
  "active_job",
  "payment_follow_up",
  "closed",
]

const stageWeight: Record<ClientPipelineItem["stage"], number> = {
  payment_follow_up: 6,
  contract_pending: 5,
  active_job: 4,
  screening: 3,
  new_lead: 2,
  closed: 0,
}

export function reportDraftCompletionPercentage(draft: ReportDraft) {
  const completed = requiredDraftFields.filter((field) => {
    const value = draft[field]

    if (typeof value === "number") return value > 0
    return Boolean(String(value ?? "").trim())
  }).length

  return Math.round((completed / requiredDraftFields.length) * 100)
}

export function countWatchlistAlerts(items: ContractorWatchlistItem[]) {
  return items.filter((item) => item.status === "active" && ["urgent", "high"].includes(item.alertLevel)).length
}

export function countUnreadMonitoringAlerts(alerts: WatchlistAlert[]) {
  return alerts.filter((alert) => !alert.readAt && ["urgent", "high"].includes(alert.severity)).length
}

export function rankMonitoringAlerts(alerts: WatchlistAlert[]) {
  return [...alerts].sort((a, b) => {
    const aScore = priorityWeight[a.severity] ?? 1
    const bScore = priorityWeight[b.severity] ?? 1

    return bScore - aScore || b.createdAt.localeCompare(a.createdAt)
  })
}

export function rankWatchlistItems(items: ContractorWatchlistItem[], clients: ClientProfile[]) {
  return [...items].sort((a, b) => {
    const aClient = clients.find((client) => client.id === a.clientId)
    const bClient = clients.find((client) => client.id === b.clientId)
    const aScore = priorityWeight[a.alertLevel] * 100 + (a.privateMatch ? 20 : 0) + (100 - (aClient?.clientBureauScore ?? 75))
    const bScore = priorityWeight[b.alertLevel] * 100 + (b.privateMatch ? 20 : 0) + (100 - (bClient?.clientBureauScore ?? 75))

    return bScore - aScore || b.updatedAt.localeCompare(a.updatedAt)
  })
}

export function intakeRiskRecommendation(
  input: Pick<ClientIntakeAssessment, "projectValue" | "depositReceived" | "contractSigned" | "privateMatchConfirmed">,
): ClientIntakeAssessment["recommendation"] {
  if (input.privateMatchConfirmed && !input.depositReceived) return "Use milestone billing"
  if (input.projectValue >= 10000 && !input.contractSigned) return "Review before scheduling"
  if (!input.depositReceived) return "Request deposit"

  return "Proceed"
}

export function intakeAssessmentScore(input: Pick<ClientIntakeAssessment, "projectValue" | "depositReceived" | "contractSigned" | "privateMatchConfirmed">) {
  const valueRisk = input.projectValue >= 15000 ? 18 : input.projectValue >= 7500 ? 10 : 4
  const depositRisk = input.depositReceived ? -18 : 18
  const contractRisk = input.contractSigned ? -16 : 16
  const matchRisk = input.privateMatchConfirmed ? 14 : 0

  return Math.max(0, Math.min(100, 72 - valueRisk - depositRisk - contractRisk - matchRisk))
}

export function filterModerationCases(cases: ModerationCase[], status: ModerationCaseStatus | "all") {
  if (status === "all") return cases

  return cases.filter((item) => item.status === status)
}

export function pipelineStageCounts(items: ClientPipelineItem[]) {
  return clientPipelineStages.reduce(
    (counts, stage) => ({
      ...counts,
      [stage]: items.filter((item) => item.stage === stage).length,
    }),
    {} as Record<ClientPipelineItem["stage"], number>,
  )
}

export function rankClientPipelineItems(items: ClientPipelineItem[]) {
  const now = Date.now()

  return [...items].sort((a, b) => {
    const aDue = a.dueAt ? new Date(a.dueAt).getTime() : Number.POSITIVE_INFINITY
    const bDue = b.dueAt ? new Date(b.dueAt).getTime() : Number.POSITIVE_INFINITY
    const aOverdue = aDue < now ? 200 : 0
    const bOverdue = bDue < now ? 200 : 0
    const aScore =
      priorityWeight[a.priority] * 100 + stageWeight[a.stage] * 10 + aOverdue + (a.privateMatch ? 12 : 0)
    const bScore =
      priorityWeight[b.priority] * 100 + stageWeight[b.stage] * 10 + bOverdue + (b.privateMatch ? 12 : 0)

    return bScore - aScore || aDue - bDue || b.updatedAt.localeCompare(a.updatedAt)
  })
}

export function buildTodaysWorkItems(input: {
  pipeline: ClientPipelineItem[]
  alerts: WatchlistAlert[]
  drafts: ReportDraft[]
  evidence: EvidenceVaultItem[]
  recoveryCases: PaymentRecoveryCase[]
  contracts: ContractPacket[]
}) {
  const pipelineItems = rankClientPipelineItems(input.pipeline)
    .filter((item) => item.stage !== "closed")
    .slice(0, 3)
    .map((item) => ({
      id: `pipeline_${item.id}`,
      label: "Pipeline",
      title: item.clientName,
      detail: item.nextAction,
      tone: item.priority,
    }))

  const alerts = rankMonitoringAlerts(input.alerts)
    .filter((item) => !item.readAt)
    .slice(0, 2)
    .map((item) => ({
      id: `alert_${item.id}`,
      label: "Alert",
      title: item.title,
      detail: item.description,
      tone: item.severity,
    }))

  const drafts = input.drafts
    .filter((item) => item.status !== "submitted")
    .slice(0, 2)
    .map((item) => ({
      id: `draft_${item.id}`,
      label: "Draft",
      title: item.clientName,
      detail: item.nextStep,
      tone: item.status === "ready_to_submit" ? "high" : "normal",
    }))

  const recovery = input.recoveryCases
    .filter((item) => !["resolved", "paused"].includes(item.status))
    .slice(0, 2)
    .map((item) => ({
      id: `recovery_${item.id}`,
      label: "Recovery Cases",
      title: item.clientName,
      detail: item.nextAction,
      tone: item.priority,
    }))

  const evidence = input.evidence
    .filter((item) => ["review_pending", "needs_more_info", "uploaded"].includes(item.status))
    .slice(0, 2)
    .map((item) => ({
      id: `evidence_${item.id}`,
      label: "Evidence",
      title: item.clientName,
      detail: item.publicSummary,
      tone: item.status === "needs_more_info" ? "high" : "normal",
    }))

  const contracts = input.contracts
    .filter((item) => !["signed", "archived"].includes(item.status) && item.signatureStatus !== "fully_signed")
    .slice(0, 2)
    .map((item) => ({
      id: `contract_${item.id}`,
      label: "Contract",
      title: item.clientName,
      detail: item.nextAction,
      tone: item.requiredBeforeScheduling ? "high" : "normal",
    }))

  return [...alerts, ...pipelineItems, ...drafts, ...recovery, ...evidence, ...contracts].slice(0, 10)
}

export function paymentRecoveryPriority(input: Pick<PaymentRecoveryCase, "amountDue" | "invoiceAgeDays">) {
  if (input.amountDue >= 10000 || input.invoiceAgeDays >= 90) return "urgent"
  if (input.amountDue >= 5000 || input.invoiceAgeDays >= 45) return "high"
  if (input.amountDue >= 1000 || input.invoiceAgeDays >= 21) return "normal"

  return "low"
}

export function countOpenRecoveryCases(cases: PaymentRecoveryCase[]) {
  return cases.filter((item) => !["resolved", "paused"].includes(item.status)).length
}

export function nextRecoveryAttemptAction(attempt: Pick<PaymentRecoveryAttempt, "outcome" | "channel">) {
  if (attempt.outcome === "payment_received") return "Update the report or recovery record with resolution context."
  if (attempt.outcome === "payment_promised") return "Create or update a payment plan and track the next due date."
  if (attempt.outcome === "dispute_raised") return "Pause public escalation and route dispute context to moderation."
  if (attempt.channel === "phone") return "Log call details and schedule one documented follow-up if needed."

  return "Wait for the response window, then log the next factual follow-up."
}

export function paymentPlanCompletion(plan: PaymentPlan) {
  if (plan.status === "completed") return 100
  if (plan.status === "accepted" || plan.status === "active") {
    return Math.max(10, Math.min(90, Math.round((plan.installmentAmount / plan.totalAmount) * 100)))
  }
  if (plan.status === "missed") return 20
  if (plan.status === "paused") return 10

  return 5
}

export function lienNoticeReadinessLabel(draft: Pick<LienNoticeDraft, "status" | "requiredReview">) {
  if (draft.status === "not_eligible") return "Not eligible"
  if (draft.status === "sent") return "Notice sent"
  if (draft.status === "released") return "Released"
  if (draft.requiredReview) return "Review required"

  return "Ready for review"
}

export function contractCompletionPercentage(item: ContractWorkspaceItem) {
  const fields = [
    item.clientName,
    item.projectType,
    item.templateType,
    item.contractValue > 0,
    item.summary,
    item.nextStep,
  ]
  const complete = fields.filter(Boolean).length

  return Math.round((complete / fields.length) * 100)
}

export function contractPacketCompletionPercentage(item: ContractPacket) {
  const base = contractCompletionPercentage({
    id: item.id,
    contractorId: item.contractorId,
    clientName: item.clientName,
    projectType: item.projectType,
    templateType: item.templateType,
    contractValue: item.packetValue,
    depositRequired: item.depositRequired,
    milestoneBilling: item.milestoneCount > 0,
    status: item.status === "review_ready" ? "draft" : item.status,
    nextStep: item.nextAction,
    summary: item.nextAction,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  })

  const shareBonus = item.shareToken ? 8 : 0
  const signatureBonus =
    item.signatureStatus === "fully_signed"
      ? 12
      : item.signatureStatus === "client_signed" || item.signatureStatus === "contractor_signed"
        ? 8
        : item.signatureStatus === "awaiting_client"
          ? 4
          : 0
  const readiness = item.requiredBeforeScheduling ? Math.max(base, 80) : base

  return Math.min(100, readiness + shareBonus + signatureBonus)
}

export function filterAdminSavedViews(views: AdminSavedView[], scope: AdminSavedViewScope | "all") {
  if (scope === "all") return views

  return views.filter((view) => view.scope === scope)
}

export function hasPrivatePublicLeak(value: unknown) {
  const serialized = JSON.stringify(value)

  return /@|report-evidence\/|signed-completion-form|final-invoice|chargeback-notice|access-window-log/i.test(serialized)
}

export function assignModerationCase(caseItem: ModerationCase, reviewerId: string, reviewerName: string): ModerationCase {
  return {
    ...caseItem,
    status: "assigned",
    assignedTo: reviewerId,
    assignedToName: reviewerName,
    updatedAt: new Date().toISOString(),
  }
}

export function isValidDecisionReason(value: string): value is ModerationDecisionReason {
  return moderationDecisionReasons.includes(value as ModerationDecisionReason)
}
