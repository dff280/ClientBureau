import type {
  ClientIntakeAssessment,
  ClientProfile,
  ContractorWatchlistItem,
  ModerationCase,
  ModerationCaseStatus,
  ModerationDecisionReason,
  ReportDraft,
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
