"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useActionState, useEffect, useMemo, useState, type ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import {
  AlertTriangle,
  BellRing,
  ClipboardCheck,
  CreditCard,
  FolderKanban,
  FileText,
  Gauge,
  Landmark,
  Link2,
  ListChecks,
  PhoneCall,
  PlusCircle,
  Radar,
  Search,
  Send,
  ShieldCheck,
  Signature,
  Vault,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

import { ContractorWorkspaceGuidance } from "@/components/dashboard/contractor-workspace-guidance"
import { FieldError } from "@/components/forms/field-error"
import { FloridaCountySelect } from "@/components/forms/florida-county-select"
import { PendingSubmitButton } from "@/components/forms/pending-submit-button"
import { StateSelect } from "@/components/forms/state-select"
import { TradeCategorySelect } from "@/components/forms/trade-category-select"
import { floridaResidentialServiceAgreementTemplate } from "@/lib/contract-templates"
import type { BillingAvailability } from "@/lib/billing-availability"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  createClientPipelineItemAction,
  createContractWorkspaceItemAction,
  createContractPacketAction,
  createContractShareLinkAction,
  createIntakeAssessmentAction,
  createLienServiceFeeCheckoutAction,
  createLienNoticeDraftAction,
  createPaymentRecoveryCaseAction,
  createPaymentPlanAction,
  createRecoveryServiceFeeCheckoutAction,
  createRiskRoomAction,
  createWatchlistItemAction,
  deleteReportDraftAction,
  linkEvidenceToServiceCaseAction,
  logPaymentRecoveryAttemptAction,
  runFloridaLienPrecheckAction,
  runRecoveryPrecheckAction,
  saveReportDraftAction,
  signLienFilingAuthorizationAction,
  submitFloridaLienCaseAction,
  submitManagedRecoveryCaseAction,
  updateClientPipelineStageAction,
  updateContractPacketStatusAction,
  updateEvidenceVaultStatusAction,
  updateWatchlistItemAction,
} from "@/lib/actions/client-bureau"
import {
  buildTodaysWorkItems,
  clientPipelineStages,
  contractPacketCompletionPercentage,
  contractCompletionPercentage,
  countOpenRecoveryCases,
  countWatchlistAlerts,
  countUnreadMonitoringAlerts,
  lienNoticeReadinessLabel,
  nextRecoveryAttemptAction,
  paymentPlanCompletion,
  pipelineStageCounts,
  rankClientPipelineItems,
  rankWatchlistItems,
  rankMonitoringAlerts,
  reportDraftCompletionPercentage,
} from "@/lib/platform-features"
import type {
  ActionResult,
  AuditLogEntry,
  CaseDocumentLink,
  ClientIntakeAssessment,
  ClientPipelineItem,
  ClientProfile,
  ClientRiskRoom,
  ContractPacket,
  ContractWorkspaceItem,
  ContractorRiskOpsData,
  ContractorWatchlistItem,
  EvidenceVaultItem,
  FloridaLienCase,
  LienNoticeDraft,
  ManagedRecoveryCase,
  PaymentPlan,
  PaymentRecoveryCase,
  PaymentRecoveryAttempt,
  ReportDraft,
  ServiceReadinessSummary,
  ServiceFeeOrder,
  Subscription,
  WatchlistAlert,
} from "@/lib/types"
import { pricingTiers } from "@/lib/stripe/pricing"
import { cn } from "@/lib/utils"

const watchState: ActionResult<ContractorWatchlistItem> = { ok: false, message: "" }
const draftState: ActionResult<ReportDraft> = { ok: false, message: "" }
const deleteDraftState: ActionResult<AuditLogEntry | boolean> = { ok: false, message: "" }
const intakeState: ActionResult<ClientIntakeAssessment> = { ok: false, message: "" }
const recoveryState: ActionResult<PaymentRecoveryCase> = { ok: false, message: "" }
const managedRecoveryState: ActionResult<ManagedRecoveryCase> = { ok: false, message: "" }
const serviceFeeState: ActionResult<ServiceFeeOrder> = { ok: false, message: "" }
const serviceReadinessState: ActionResult<ServiceReadinessSummary> = { ok: false, message: "" }
const caseDocumentLinkState: ActionResult<CaseDocumentLink> = { ok: false, message: "" }
const lienNoticeState: ActionResult<LienNoticeDraft> = { ok: false, message: "" }
const floridaLienState: ActionResult<FloridaLienCase> = { ok: false, message: "" }
const contractState: ActionResult<ContractWorkspaceItem> = { ok: false, message: "" }
const pipelineState: ActionResult<ClientPipelineItem> = { ok: false, message: "" }
const riskRoomState: ActionResult<ClientRiskRoom> = { ok: false, message: "" }
const recoveryAttemptState: ActionResult<PaymentRecoveryAttempt> = { ok: false, message: "" }
const paymentPlanState: ActionResult<PaymentPlan> = { ok: false, message: "" }
const contractPacketState: ActionResult<ContractPacket> = { ok: false, message: "" }
const contractShareState: ActionResult<ContractPacket> = { ok: false, message: "" }
const evidenceVaultState: ActionResult<EvidenceVaultItem> = { ok: false, message: "" }
const workspaceTabValues = [
  "overview",
  "pipeline",
  "watchlist",
  "alerts",
  "reports",
  "evidence",
  "recovery",
  "lien-readiness",
  "contracts",
  "billing",
  "account",
  "activity",
] as const

export type DashboardWorkspaceTab = (typeof workspaceTabValues)[number]

export type DashboardJobContext = {
  city?: string
  jobId?: string
  jobTitle?: string
  state?: string
  tradeCategory?: string
}

const workspaceTabs = new Set<string>(workspaceTabValues)
const bureauProWorkspaceTabs = new Set<DashboardWorkspaceTab>([
  "contracts",
  "evidence",
  "recovery",
  "lien-readiness",
])

const workspaceRoutes: Record<DashboardWorkspaceTab, string> = {
  overview: "/dashboard",
  pipeline: "/dashboard/activity",
  watchlist: "/dashboard/watchlist",
  alerts: "/dashboard/watchlist",
  reports: "/dashboard/reports",
  evidence: "/dashboard/evidence",
  recovery: "/dashboard/recovery",
  "lien-readiness": "/dashboard/lien-readiness",
  contracts: "/dashboard/contracts",
  billing: "/dashboard/billing",
  account: "/dashboard/billing",
  activity: "/dashboard/activity",
}

const workspaceNavigationGroups: {
  title: string
  text: string
  items: {
    value: string
    label: string
    icon: LucideIcon
  }[]
}[] = [
  {
    title: "Start here",
    text: "Your daily work queue.",
    items: [
      { value: "overview", label: "Today", icon: Gauge },
      { value: "pipeline", label: "Client Pipeline", icon: FolderKanban },
    ],
  },
  {
    title: "Find Clients",
    text: "Screen and monitor before the job.",
    items: [
      { value: "watchlist", label: "Watchlist", icon: Radar },
      { value: "alerts", label: "Alerts", icon: BellRing },
    ],
  },
  {
    title: "Reports",
    text: "Draft, submit, and track reports.",
    items: [
      { value: "reports", label: "Reports", icon: ClipboardCheck },
    ],
  },
  {
    title: "Documents",
    text: "Agreements and private records.",
    items: [
      { value: "contracts", label: "Contracts", icon: Signature },
      { value: "evidence", label: "Evidence Vault", icon: Vault },
    ],
  },
  {
    title: "Payments",
    text: "Recovery help and payment records.",
    items: [
      { value: "recovery", label: "Payment Recovery", icon: PhoneCall },
    ],
  },
  {
    title: "Project Protection",
    text: "Private safeguards before staff action.",
    items: [
      { value: "lien-readiness", label: "Florida Lien Service", icon: Landmark },
      { value: "account", label: "Verification", icon: ShieldCheck },
    ],
  },
  {
    title: "Account",
    text: "Plan, settings, and history.",
    items: [
      { value: "billing", label: "Billing", icon: CreditCard },
      { value: "activity", label: "Activity", icon: FileText },
    ],
  },
]

function normalizeWorkspaceTab(value: string | null) {
  const aliases: Record<string, string> = {
    payment: "recovery",
    "payment-recovery": "recovery",
    lien: "lien-readiness",
    "notice-readiness": "lien-readiness",
  }
  const normalized = value ? aliases[value] ?? value : null

  return normalized && workspaceTabs.has(normalized) ? (normalized as DashboardWorkspaceTab) : "overview"
}

function JobContextHiddenField({ jobContext }: { jobContext?: DashboardJobContext | null }) {
  if (!jobContext?.jobId) return null

  return (
    <>
      <input type="hidden" name="projectJobId" value={jobContext.jobId} />
      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">
        This record will be saved back to the private job file
        {jobContext.jobTitle ? `: ${jobContext.jobTitle}` : "."}
      </div>
    </>
  )
}

export function RiskOpsWorkspace({
  focusTab,
  riskOps,
  clients,
  subscription,
  billingAvailability,
  jobContext,
}: {
  focusTab?: DashboardWorkspaceTab
  riskOps: ContractorRiskOpsData
  clients: ClientProfile[]
  subscription?: Subscription
  billingAvailability?: BillingAvailability
  jobContext?: DashboardJobContext | null
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTab = focusTab ?? normalizeWorkspaceTab(searchParams.get("workspace"))
  const updateWorkspaceTab = (tab: string) => {
    if (focusTab) {
      router.push(workspaceRoutes[normalizeWorkspaceTab(tab)] ?? "/dashboard")
      return
    }

    const params = new URLSearchParams(searchParams.toString())

    if (tab === "overview") {
      params.delete("workspace")
    } else {
      params.set("workspace", tab)
    }

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }
  const rankedWatchlist = useMemo(
    () => rankWatchlistItems(riskOps.watchlist, clients),
    [clients, riskOps.watchlist],
  )
  const rankedAlerts = useMemo(() => rankMonitoringAlerts(riskOps.watchlistAlerts), [riskOps.watchlistAlerts])
  const activeAlertCount = countWatchlistAlerts(riskOps.watchlist)
  const unreadMonitoringAlerts = countUnreadMonitoringAlerts(riskOps.watchlistAlerts)
  const readyDrafts = riskOps.reportDrafts.filter((draft) => draft.status === "ready_to_submit").length
  const evidenceNeedingReview =
    riskOps.evidenceSummaries.filter((item) => ["review_pending", "needs_more_info", "missing"].includes(item.status))
      .length +
    riskOps.evidenceVault.filter((item) => ["review_pending", "needs_more_info", "uploaded"].includes(item.status))
      .length
  const openRecoveryCases =
    countOpenRecoveryCases(riskOps.paymentRecoveryCases) +
    riskOps.managedRecoveryCases.filter((item) => !["resolved", "closed"].includes(item.status)).length
  const lienDraftsRequiringReview =
    riskOps.lienNoticeDrafts.filter((item) => item.requiredReview).length +
    riskOps.floridaLienCases.filter((item) => !["released", "closed"].includes(item.status)).length
  const rankedPipeline = useMemo(() => rankClientPipelineItems(riskOps.clientPipeline), [riskOps.clientPipeline])
  const stageCounts = useMemo(() => pipelineStageCounts(riskOps.clientPipeline), [riskOps.clientPipeline])
  const todaysWork = useMemo(
    () =>
      buildTodaysWorkItems({
        pipeline: riskOps.clientPipeline,
        alerts: riskOps.watchlistAlerts,
        drafts: riskOps.reportDrafts,
        evidence: riskOps.evidenceVault,
        recoveryCases: riskOps.paymentRecoveryCases,
        contracts: riskOps.contractPackets,
      }),
    [riskOps],
  )
  const openPipelineItems = riskOps.clientPipeline.filter((item) => item.stage !== "closed").length
  const openContractPackets = riskOps.contractPackets.filter((item) => !["signed", "archived"].includes(item.status)).length
  const billingPlan = pricingTiers.find((tier) => tier.id === (subscription?.tier ?? "free")) ?? pricingTiers[0]
  const subscriptionTier = subscription?.tier ?? "free"
  const planFitNotice = getPlanFitNotice(activeTab, subscriptionTier)
  const billingStatus = !subscription || subscription.status === "mock" ? "active" : subscription.status.replaceAll("_", " ")
  const billingReviewMode = !billingAvailability?.subscriptionCheckoutAvailable
  const billingPeriodEnd = subscription?.currentPeriodEnd
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
        new Date(subscription.currentPeriodEnd),
      )
    : "No renewal date"
  const planUsage = [
    {
      label: "Saved searches",
      value: clients.length,
      limit: subscription?.tier === "bureau_team" ? 250 : subscription?.tier === "pro" ? 50 : 3,
    },
    {
      label: "Watchlist records",
      value: riskOps.watchlist.length,
      limit: subscription?.tier === "bureau_team" ? 250 : subscription?.tier === "pro" ? 25 : 3,
    },
    {
      label: "Contract packets",
      value: riskOps.contractPackets.length,
      limit: subscription?.tier === "bureau_team" ? 100 : subscription?.tier === "pro" ? 5 : 1,
    },
  ]
  const summaryMetrics = [
    {
      label: "Today",
      value: todaysWork.length,
      helper: "What needs your attention now",
      tone: "slate" as const,
    },
    {
      label: "Client activity",
      value: openPipelineItems + activeAlertCount + unreadMonitoringAlerts,
      helper: "Pipeline records and watchlist signals",
      tone: "amber" as const,
    },
    {
      label: "Documents",
      value: readyDrafts + evidenceNeedingReview + openContractPackets,
      helper: "Reports, evidence, and signing links",
      tone: "emerald" as const,
    },
    {
      label: "Payments",
      value: openRecoveryCases + lienDraftsRequiringReview,
      helper: "Managed recovery and Florida lien service work",
      tone: "rose" as const,
    },
  ]
  const toolIntro = (title: string, text: string) =>
    focusTab ? null : <WorkspaceIntro title={title} text={text} />

  return (
    <div className="space-y-6">
      {!focusTab ? <ContractorWorkspaceGuidance onOpenTab={updateWorkspaceTab} /> : null}

      {!focusTab ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryMetrics.map((metric) => (
            <RiskMetric key={metric.label} {...metric} />
          ))}
        </div>
      ) : null}

      <Tabs value={activeTab} onValueChange={updateWorkspaceTab} className="space-y-5">
        {!focusTab ? <WorkspaceTabNavigation /> : null}
        {planFitNotice ? <PlanFitNotice {...planFitNotice} /> : null}

        <TabsContent value="overview" className="space-y-5">
          {toolIntro(
            "Today's work",
            "A short work queue for urgent client signals, report drafts, payment follow-up, evidence review, and contract signing links.",
          )}
          <Accordion type="multiple" defaultValue={["today", "rooms"]} className="gap-4">
            <AccordionItem value="today" className="rounded-md border border-slate-200 bg-white px-4 shadow-sm">
              <AccordionTrigger className="py-4 text-base font-semibold text-slate-950">
                Today&apos;s Work
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="grid gap-3 md:grid-cols-2">
                  {todaysWork.map((item) => (
                    <div key={item.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="rounded-md">{item.label}</Badge>
                        <Badge className={cn("rounded-md text-white", priorityClass(item.tone))}>{item.tone}</Badge>
                      </div>
                      <p className="mt-3 font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
                    </div>
                  ))}
                  {todaysWork.length === 0 ? (
                    <EmptyState
                      title="No urgent work today"
                      text="Client pipeline, reports, recovery, evidence, and contracts will appear here as records need attention."
                    />
                  ) : null}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="rooms" className="rounded-md border border-slate-200 bg-white px-4 shadow-sm">
              <AccordionTrigger className="py-4 text-base font-semibold text-slate-950">
                Job Files
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
                  <RiskRoomForm clients={clients} />
                  <div className="grid gap-3 md:grid-cols-2">
                    {riskOps.riskRooms.map((room) => (
                      <RiskRoomCard key={room.id} room={room} />
                    ))}
                    {riskOps.riskRooms.length === 0 ? (
                      <EmptyState
                        title="No job files yet"
                        text="Create one private file per important client or project to group checks, reports, evidence, recovery notes, and contract signing links."
                      />
                    ) : null}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-5">
          {toolIntro(
            "Client pipeline",
            "Track leads from first search through screening, contract, active work, payment follow-up, and closeout.",
          )}
          <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
            <PipelineCreateForm clients={clients} />
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                {clientPipelineStages.map((stage) => (
                  <div key={stage} className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-slate-500">{stage.replaceAll("_", " ")}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">{stageCounts[stage] ?? 0}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-3">
                {rankedPipeline.map((item) => (
                  <PipelineCard key={item.id} item={item} />
                ))}
                {rankedPipeline.length === 0 ? (
                  <EmptyState
                    title="No pipeline records yet"
                    text="Create a client pipeline record from search, intake, report, recovery, or contract work."
                  />
                ) : null}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="watchlist" className="space-y-5">
          {toolIntro(
            "Search, watch, and assess before scheduling",
            "Use this workspace before accepting new work, approving change orders, or committing crew time.",
          )}
          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Radar className="size-5 text-amber-700" aria-hidden="true" />
              Client watchlist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <CreatePanel
              actionLabel="Watch client"
              defaultOpen={rankedWatchlist.length === 0}
              title="Add a watched client"
              text="Use this when you want alerts before accepting more work, approving changes, or scheduling crews."
            >
              <WatchlistCreateForm clients={clients} />
            </CreatePanel>
            <div className="grid gap-3">
              {rankedWatchlist.map((item) => (
                <WatchlistCard key={item.id} item={item} client={clients.find((client) => client.id === item.clientId)} />
              ))}
              {rankedWatchlist.length === 0 ? (
                <EmptyState
                  title="No watched clients yet"
                  text="Watch a client profile to track new reports, response context, dispute changes, resolved cases, and rating movement."
                />
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-xl">
              <ListChecks className="size-5 text-amber-700" aria-hidden="true" />
              Intake assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-5">
            <CreatePanel
              actionLabel="Create assessment"
              defaultOpen={riskOps.intakeAssessments.length === 0}
              title="Create intake assessment"
              text="Use this before you decide deposit, contract, schedule, and milestone controls."
            >
              <IntakeAssessmentForm />
            </CreatePanel>
            <div className="space-y-3">
              {riskOps.intakeAssessments.map((assessment) => (
                <div key={assessment.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{assessment.clientName}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {assessment.city}, {assessment.state} / ${assessment.projectValue.toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="rounded-md bg-white">
                      {assessment.recommendation}
                    </Badge>
                  </div>
                  <Progress value={assessment.score} className="mt-3" />
                  <p className="mt-2 text-xs leading-5 text-slate-600">{assessment.notes}</p>
                </div>
              ))}
              {riskOps.intakeAssessments.length === 0 ? (
                <EmptyState
                  title="No intake assessments yet"
                  text="Create an assessment before accepting work that requires deposits, materials, crew time, or scheduled access."
                />
              ) : null}
            </div>
          </CardContent>
        </Card>

          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-5">
          {toolIntro(
            "Monitoring alerts",
            "Review watched-client changes, dispute updates, resolved-case signals, and rating movement without digging through every tool.",
          )}
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-xl">
            <BellRing className="size-5 text-amber-700" aria-hidden="true" />
            Monitoring alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 p-5 md:grid-cols-3">
          {rankedAlerts.map((alert) => (
            <MonitoringAlertCard key={alert.id} alert={alert} client={clients.find((client) => client.id === alert.clientId)} />
          ))}
          {rankedAlerts.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 p-6 text-sm text-slate-600 md:col-span-3">
              No monitoring alerts yet. Watch a client to track new reports, responses, disputes, score changes, and resolved-case updates.
            </div>
          ) : null}
        </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recovery" className="space-y-5">
          {toolIntro(
            "Get Help Recovering Payment",
            "Open a private managed case when an invoice is overdue and you want Client Bureau staff to review documents, contact the client, and seek a contractor-direct resolution.",
          )}
          {!focusTab ? (
            <div className="grid gap-3 md:grid-cols-3">
              <ToolExplainer
                title="What this service does"
                text="Resolution Desk reviews your invoice, contract, and evidence, then logs factual outreach and response history."
              />
              <ToolExplainer
                title="How payment works"
                text="Client Bureau charges a service fee. Any recovered payment is paid directly to your business."
              />
              <ToolExplainer
                title="What stays private"
                text="Client contact details, private evidence, staff notes, and payment records are not shown on public profiles."
              />
            </div>
          ) : null}
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-xl">
                <PhoneCall className="size-5 text-amber-700" aria-hidden="true" />
                Managed Resolution Desk
              </CardTitle>
              <p className="text-sm leading-6 text-slate-600">
                Submit the case, pay the service fee, upload documents, and track staff review, client response, payment-plan offers, and resolution.
              </p>
            </CardHeader>
            <CardContent className="grid gap-5 p-5 xl:grid-cols-[380px_1fr]">
              <CreatePanel
                actionLabel="Open case"
                defaultOpen={riskOps.managedRecoveryCases.length === 0}
                title="Open managed case"
                text="Use this when you want Client Bureau to help seek a documented payment resolution."
              >
                <ManagedRecoveryCaseForm jobContext={jobContext} />
              </CreatePanel>
              <div className="grid gap-3 md:grid-cols-2">
                {riskOps.managedRecoveryCases.map((item) => (
                  <ManagedRecoveryCaseCard
                    key={item.id}
                    item={item}
                    feeOrder={riskOps.serviceFeeOrders.find((order) => order.entityId === item.id)}
                    readiness={riskOps.serviceReadiness.find(
                      (summary) => summary.entityType === "managed_recovery" && summary.entityId === item.id
                    )}
                    documentLinks={riskOps.caseDocumentLinks.filter(
                      (link) => link.entityType === "managed_recovery" && link.entityId === item.id
                    )}
                    evidenceVault={riskOps.evidenceVault}
                  />
                ))}
                {riskOps.managedRecoveryCases.length === 0 ? (
                  <EmptyState
                    title="No managed recovery cases yet"
                    text="Open a private Resolution Desk case when you want staff help reviewing documents and seeking a contractor-direct payment resolution."
                  />
                ) : null}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-xl">
              <PhoneCall className="size-5 text-amber-700" aria-hidden="true" />
              Private follow-up records
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 p-5 lg:grid-cols-[0.9fr_1.1fr]">
            <CreatePanel
              actionLabel="Create record"
              defaultOpen={riskOps.paymentRecoveryCases.length === 0}
              title="Create internal tracking record"
              text="Use this for your own invoice timeline, call logging, and follow-up notes."
            >
              <PaymentRecoveryForm jobContext={jobContext} />
            </CreatePanel>
            <div className="space-y-3">
              {riskOps.paymentRecoveryCases.map((item) => (
                <PaymentRecoveryCard key={item.id} item={item} />
              ))}
              {riskOps.paymentRecoveryCases.length === 0 ? (
                <EmptyState
                  title="No recovery cases yet"
                  text="Create a factual payment follow-up case when an invoice needs documented outreach, call logging, or resolution tracking."
                />
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-xl">
              <PhoneCall className="size-5 text-amber-700" aria-hidden="true" />
              Contact attempts
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 p-5 lg:grid-cols-[0.9fr_1.1fr]">
            <CreatePanel
              actionLabel="Log attempt"
              defaultOpen={riskOps.paymentRecoveryAttempts.length === 0 && riskOps.paymentRecoveryCases.length > 0}
              title="Log contact attempt"
              text="Record calls, emails, letters, and portal messages with outcome and follow-up date."
            >
              <RecoveryAttemptForm cases={riskOps.paymentRecoveryCases} />
            </CreatePanel>
            <div className="space-y-3">
              {riskOps.paymentRecoveryAttempts.map((item) => (
                <RecoveryAttemptCard key={item.id} item={item} />
              ))}
              {riskOps.paymentRecoveryAttempts.length === 0 ? (
                <EmptyState
                  title="No contact attempts logged"
                  text="Log factual emails, letters, calls, and client portal messages with outcome and follow-up dates."
                />
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-xl">
              <ClipboardCheck className="size-5 text-amber-700" aria-hidden="true" />
              Payment plans
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 p-5 lg:grid-cols-[0.9fr_1.1fr]">
            <CreatePanel
              actionLabel="Create plan"
              defaultOpen={riskOps.paymentPlans.length === 0 && riskOps.paymentRecoveryCases.length > 0}
              title="Create payment plan"
              text="Track proposed or accepted payment timing privately."
            >
              <PaymentPlanForm cases={riskOps.paymentRecoveryCases} />
            </CreatePanel>
            <div className="space-y-3">
              {riskOps.paymentPlans.map((item) => (
                <PaymentPlanCard key={item.id} item={item} />
              ))}
              {riskOps.paymentPlans.length === 0 ? (
                <EmptyState
                  title="No payment plans tracked"
                  text="Create proposed or accepted plans for private invoice recovery tracking."
                />
              ) : null}
            </div>
          </CardContent>
        </Card>
          </div>
        </TabsContent>

        <TabsContent value="lien-readiness" className="space-y-5">
          {toolIntro(
            "Florida Lien Service",
            "Create a private Florida notice or claim-of-lien filing case, pay the service fee plus pass-through filing costs, sign authorization, and track attorney/vendor review through recording proof and release.",
          )}
          {!focusTab ? (
            <div className="grid gap-3 md:grid-cols-3">
              <ToolExplainer
                title="Florida first"
                text="This workflow is limited to Florida properties while Client Bureau builds attorney/vendor filing operations state by state."
              />
              <ToolExplainer
                title="Authorization required"
                text="You must certify accuracy and authorize review before a notice is sent or filing is routed."
              />
              <ToolExplainer
                title="What stays private"
                text="Property details, raw documents, staff notes, drafts, receipts, and recording files stay private."
              />
            </div>
          ) : null}
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Landmark className="size-5 text-amber-700" aria-hidden="true" />
                Florida notice and filing cases
              </CardTitle>
              <p className="text-sm leading-6 text-slate-600">
                Submit case details, pay the Client Bureau service fee plus pass-through costs, sign authorization, and track review through notice, filing, recording proof, and release.
              </p>
            </CardHeader>
            <CardContent className="grid gap-5 p-5 xl:grid-cols-[420px_1fr]">
              <CreatePanel
                actionLabel="Start case"
                defaultOpen={riskOps.floridaLienCases.length === 0}
                title="Start Florida lien case"
                text="Use for a Florida notice packet or claim-of-lien filing workflow."
              >
                <FloridaLienCaseForm jobContext={jobContext} />
              </CreatePanel>
              <div className="grid gap-3 md:grid-cols-2">
                {riskOps.floridaLienCases.map((item) => (
                  <FloridaLienCaseCard
                    key={item.id}
                    item={item}
                    feeOrder={riskOps.serviceFeeOrders.find((order) => order.entityId === item.id)}
                    readiness={riskOps.serviceReadiness.find(
                      (summary) => summary.entityType === "florida_lien" && summary.entityId === item.id
                    )}
                    documentLinks={riskOps.caseDocumentLinks.filter(
                      (link) => link.entityType === "florida_lien" && link.entityId === item.id
                    )}
                    evidenceVault={riskOps.evidenceVault}
                  />
                ))}
                {riskOps.floridaLienCases.length === 0 ? (
                  <EmptyState
                    title="No Florida lien service cases yet"
                    text="Start a private Florida notice or claim-of-lien case when deadline, property, contract, and unpaid invoice details need review."
                  />
                ) : null}
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Landmark className="size-5 text-amber-700" aria-hidden="true" />
                Readiness checklist records
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 p-5 lg:grid-cols-[0.9fr_1.1fr]">
              <CreatePanel
                actionLabel="Create checklist"
                defaultOpen={riskOps.lienNoticeDrafts.length === 0}
                title="Create internal checklist"
                text="Use this for early deadline and document review before starting a managed Florida service case."
              >
                <LienNoticeDraftForm jobContext={jobContext} />
              </CreatePanel>
              <div className="space-y-3">
                {riskOps.lienNoticeDrafts.map((item) => (
                  <LienNoticeCard key={item.id} item={item} />
                ))}
                {riskOps.lienNoticeDrafts.length === 0 ? (
                  <EmptyState
                    title="No lien packets yet"
                    text="Create a private packet to track deadline review, contract context, evidence, and state-specific notice checks."
                  />
                ) : null}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-5">
          {toolIntro(
            "Contracts",
            "Create private agreement links clients can review and sign, invite the client into the workflow, and track signature plus payment timing before work starts.",
          )}
          {!focusTab ? (
            <div className="grid gap-3 md:grid-cols-3">
              <ToolExplainer
                title="What this does"
                text="Contract links give the client a private review page for scope, price, deposit, milestones, and electronic signature."
              />
              <ToolExplainer
                title="Separate service workflows"
                text="Recovery outreach and Florida lien filing are handled in their own managed-service pages, not inside contract signing links."
              />
              <ToolExplainer
                title="Future payment path"
                text="Deposit and milestone coordination is staged here so a reviewed payment layer can be added cleanly later."
              />
            </div>
          ) : null}
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Signature className="size-5 text-amber-700" aria-hidden="true" />
            Agreement builder
          </CardTitle>
          <p className="text-sm leading-6 text-slate-600">
            Draft the agreement controls you want attached to a client signing link.
          </p>
        </CardHeader>
        <CardContent className="grid gap-5 p-5 xl:grid-cols-[360px_1fr]">
          <CreatePanel
            actionLabel="Create template"
            defaultOpen={riskOps.contractDocuments.length === 0}
            title="Create agreement template"
            text="Prepare reusable agreement controls before generating a signing packet."
          >
            <ContractWorkspaceForm jobContext={jobContext} />
          </CreatePanel>
          <div className="grid gap-3 md:grid-cols-2">
            {riskOps.contractDocuments.map((item) => (
              <ContractDocumentCard key={item.id} item={item} />
            ))}
            {riskOps.contractDocuments.length === 0 ? (
              <EmptyState
                title="No agreement templates yet"
                text="Create reusable agreement controls for scope, deposits, milestones, payment plans, completion records, and change orders."
              />
            ) : null}
          </div>
        </CardContent>
      </Card>

          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-xl">
                <FolderKanban className="size-5 text-amber-700" aria-hidden="true" />
                Contract signing links
              </CardTitle>
              <p className="text-sm leading-6 text-slate-600">
                Prepare a private link, send it to the client, track signature status, and coordinate deposit or milestone timing.
              </p>
            </CardHeader>
            <CardContent className="grid gap-5 p-5 xl:grid-cols-[360px_1fr]">
              <CreatePanel
                actionLabel="Create packet"
                defaultOpen={riskOps.contractPackets.length === 0}
                title="Create agreement packet"
                text="Prepare the private signing packet before sending it to a client."
              >
                <ContractPacketForm jobContext={jobContext} />
              </CreatePanel>
              <div className="grid gap-3 md:grid-cols-2">
                {riskOps.contractPackets.map((item) => (
                  <ContractPacketCard key={item.id} item={item} />
                ))}
                {riskOps.contractPackets.length === 0 ? (
                  <EmptyState
                    title="No contract signing links yet"
                    text="Create links for service agreements, change orders, payment plans, completion certificates, and private notice records."
                  />
                ) : null}
              </div>
            </CardContent>
          </Card>

        </TabsContent>

        <TabsContent value="reports" className="space-y-5">
          {toolIntro(
            "Reports, Evidence Vault, and submission readiness",
            "Continue report drafts, check evidence review, and follow the next recommended documentation step.",
          )}
          <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="size-5 text-amber-700" aria-hidden="true" />
              Report draft control
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 p-5 lg:grid-cols-[0.95fr_1.05fr]">
            <CreatePanel
              actionLabel="Save draft"
              defaultOpen={riskOps.reportDrafts.length === 0}
              title="Save report draft"
              text="Start a draft when you need time to gather invoices, access records, or communication history."
            >
              <ReportDraftForm clients={clients} jobContext={jobContext} />
            </CreatePanel>
            <div className="space-y-3">
              {riskOps.reportDrafts.map((draft) => (
                <DraftCard key={draft.id} draft={draft} />
              ))}
                {riskOps.reportDrafts.length === 0 ? (
                  <EmptyState
                    title="No draft reports yet"
                    text="Save a draft when you need time to gather invoice, access, communication, or completion details before submission."
                  />
                ) : null}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="size-5 text-amber-700" aria-hidden="true" />
                Evidence Vault
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {riskOps.evidenceSummaries.map((item) => (
                <div key={item.id} className="rounded-md border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-950">{item.label}</p>
                    <Badge variant="outline" className="rounded-md capitalize">
                      {item.status.replaceAll("_", " ")}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.reviewedCount}/{item.fileCount} reviewed / updated {new Date(item.lastUpdatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {riskOps.evidenceSummaries.length === 0 ? (
                <EmptyState
                  title="No evidence in review"
                  text="Evidence summaries appear here after reports include invoices, screenshots, contracts, photos, or PDFs for private review."
                />
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Recommended actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {riskOps.recommendedActions.map((action) => (
                <div key={action} className="flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                  <ClipboardCheck className="mt-0.5 size-4 shrink-0 text-amber-700" aria-hidden="true" />
                  {action}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
          </div>
        </TabsContent>

        <TabsContent value="evidence" className="space-y-5">
          {toolIntro(
            "Evidence Vault",
            "Track invoices, screenshots, contracts, photos, and PDFs as private review records. Public pages only show evidence summaries.",
          )}
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Vault className="size-5 text-amber-700" aria-hidden="true" />
                Evidence Vault
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 p-5 md:grid-cols-2">
              {riskOps.evidenceVault.map((item) => (
                <EvidenceVaultCard key={item.id} item={item} />
              ))}
              {riskOps.evidenceVault.length === 0 ? (
                <EmptyState
                  title="No private evidence records yet"
                  text="Uploaded invoices, screenshots, contracts, photos, and PDFs will appear here as private contractor/admin records."
                />
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-5">
          {toolIntro(
            "Account controls and safeguards",
            "Keep verification, security, privacy, and workflow readiness in one compact place.",
          )}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Business verification", "Pending/verified profile status keeps report context accountable."],
              ["Private matching", "Phone and email checks remain hashed and never appear on public pages."],
              ["2FA-ready sign-in", "The account model is ready for stronger authentication prompts."],
              ["Compliance gates", "Recovery cases, lien packet, and contract workflows stay private until reviewed."],
            ].map(([title, text]) => (
              <Card key={title} className="rounded-md border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-3 p-5">
                  <ShieldCheck className="size-6 text-amber-700" aria-hidden="true" />
                  <h3 className="font-semibold text-slate-950">{title}</h3>
                  <p className="text-sm leading-6 text-slate-600">{text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-5">
          {toolIntro(
            "Billing",
            "Review your plan, usage, billing availability, and account verification for Client Bureau contractor tools.",
          )}
          <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CreditCard className="size-5 text-amber-700" aria-hidden="true" />
                  Current plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 p-5">
                <div className="flex flex-col justify-between gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-sm font-semibold uppercase text-amber-700">Plan</p>
                    <h3 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
                      {billingPlan.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {billingPlan.price} {billingPlan.cadence}
                    </p>
                  </div>
                  <Badge className="rounded-md bg-emerald-700 text-white capitalize">{billingStatus}</Badge>
                </div>
                <p className="text-sm leading-6 text-slate-600">{billingPlan.description}</p>
                {billingAvailability ? (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                    <p className="font-semibold">{billingAvailability.dashboardStatusLabel}</p>
                    <p className="mt-1">{billingAvailability.dashboardStatusDetail}</p>
                  </div>
                ) : null}
                <div className="grid gap-3 md:grid-cols-3">
                  <BillingMetric label="Status" value={billingStatus} />
                  <BillingMetric label="Renewal" value={billingPeriodEnd} />
                  <BillingMetric label="Billing contact" value="Account email" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">Included with this plan</p>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {billingPlan.features.slice(0, 6).map((feature) => (
                      <div key={feature} className="flex gap-2 rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700">
                        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-700" aria-hidden="true" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                    <Link href="/pricing">Compare plans</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/contact#support-inquiry">Request billing review</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-5">
              <Card className="rounded-md border-slate-200 bg-white shadow-sm">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="text-lg">Workspace usage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-5">
                  {planUsage.map((item) => {
                    const usage = Math.min(100, Math.round((item.value / item.limit) * 100))

                    return (
                      <div key={item.label} className="space-y-2">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-semibold text-slate-950">{item.label}</span>
                          <span className="text-slate-500">
                            {item.value} / {item.limit}
                          </span>
                        </div>
                        <Progress value={usage} />
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card className="rounded-md border-slate-200 bg-white shadow-sm">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="text-lg">Invoices and payment method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-5 text-sm text-slate-600">
                  <BillingRow
                    label="Latest invoice"
                    value={
                      billingReviewMode
                        ? "No workspace invoice issued"
                        : billingPlan.id === "free"
                          ? "No paid invoice issued"
                          : "Sent to billing contact"
                    }
                  />
                  <BillingRow
                    label="Payment method"
                    value={
                      billingReviewMode
                        ? "Not collected from this workspace yet"
                        : billingPlan.id === "free"
                          ? "No card required"
                          : "Secure card billing"
                    }
                  />
                  <BillingRow
                    label="Receipts"
                    value={
                      billingReviewMode
                        ? "Available after billing is activated"
                        : "Delivered to the account email when payment is processed"
                    }
                  />
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">
                    {billingReviewMode
                      ? "Plan changes and service fees are reviewed before billing is collected. Your private workspace remains available for account records."
                      : "Plan changes and payment updates should be reviewed from this billing workspace before expanding search, contracts, recovery, lien service, and workspace usage."}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-5">
          {toolIntro(
            "Recent workspace activity",
            "Use this timeline to confirm recent reports, saved searches, approvals, evidence changes, and resolution work.",
          )}
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-xl">Recent contractor workspace activity</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 p-5 md:grid-cols-3">
          {riskOps.activity.map((item) => (
            <div key={item.id} className="rounded-md border border-slate-200 p-4">
              <Badge
                variant="outline"
                className={cn(
                  "rounded-md capitalize",
                  item.tone === "positive" && "border-emerald-200 bg-emerald-50 text-emerald-800",
                  item.tone === "warning" && "border-amber-200 bg-amber-50 text-amber-900",
                )}
              >
                {item.tone}
              </Badge>
              <h3 className="mt-3 font-semibold text-slate-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </div>
          ))}
        </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function WorkspaceTabNavigation() {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex flex-col justify-between gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase text-amber-700">Dashboard tools</p>
          <h2 className="text-lg font-semibold text-slate-950">Choose what you need to do.</h2>
        </div>
        <p className="max-w-xl text-xs leading-5 text-slate-500">
          The dashboard is grouped by plain business jobs: find clients, organize documents,
          manage payments, and keep account records current.
        </p>
      </div>
      <TabsList className="grid h-auto w-full gap-3 bg-transparent p-0 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        {workspaceNavigationGroups.map((group) => (
          <div key={group.title} className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">{group.title}</p>
            <p className="mt-1 min-h-8 text-xs leading-4 text-slate-500">{group.text}</p>
            <div className="mt-3 grid gap-2">
              {group.items.map((item) => {
                const Icon = item.icon

                return (
                  <TabsTrigger
                    key={item.value}
                    value={item.value}
                    className="h-auto justify-start gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700 shadow-none data-[state=active]:border-slate-950 data-[state=active]:bg-slate-950 data-[state=active]:text-white"
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {item.label}
                  </TabsTrigger>
                )
              })}
            </div>
          </div>
        ))}
      </TabsList>
    </div>
  )
}

function WorkspaceIntro({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase text-amber-700">Tool overview</p>
      <h2 className="mt-1 text-xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{text}</p>
    </div>
  )
}

function ToolExplainer({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase text-amber-700">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  )
}

function getPlanFitNotice(tab: DashboardWorkspaceTab, tier: Subscription["tier"] | "free") {
  if (!bureauProWorkspaceTabs.has(tab) || tier === "bureau_team") return null

  const toolLabel =
    tab === "lien-readiness"
      ? "Florida Lien Service"
      : tab === "recovery"
        ? "Payment Recovery"
        : tab === "contracts"
          ? "Contracts"
          : "Evidence Vault"

  return {
    toolLabel,
    currentPlan: tier === "pro" ? "Pro Check" : "Free",
  }
}

function PlanFitNotice({ currentPlan, toolLabel }: { currentPlan: string; toolLabel: string }) {
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-4 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Bureau Pro workspace</p>
          <h3 className="mt-1 text-base font-semibold text-amber-950">{toolLabel} is part of the full protection plan.</h3>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-amber-900">
            Your current plan is {currentPlan}. Existing private records stay visible, and paid activation is reviewed before billing is collected. Bureau Pro is the best fit when you need jobs, contracts, evidence, recovery, and Florida lien service in one workflow.
          </p>
        </div>
        <Button asChild variant="outline" className="w-fit border-amber-300 bg-white text-amber-950 hover:bg-amber-100">
          <Link href="/pricing?plan=bureau_team">Review Bureau Pro</Link>
        </Button>
      </div>
    </div>
  )
}

function CreatePanel({
  actionLabel = "Create new",
  children,
  defaultOpen = false,
  text,
  title,
}: {
  actionLabel?: string
  children: ReactNode
  defaultOpen?: boolean
  text: string
  title: string
}) {
  return (
    <details className="group rounded-md border border-slate-200 bg-white shadow-sm" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none flex-col justify-between gap-3 p-4 transition hover:bg-slate-50 sm:flex-row sm:items-center">
        <span>
          <span className="block font-semibold text-slate-950">{title}</span>
          <span className="mt-1 block text-sm leading-5 text-slate-600">{text}</span>
        </span>
        <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white">
          <PlusCircle className="size-4" aria-hidden="true" />
          {actionLabel}
        </span>
      </summary>
      <div className="border-t border-slate-200 bg-slate-50/50 p-4">{children}</div>
    </details>
  )
}

function PipelineCreateForm({ clients }: { clients: ClientProfile[] }) {
  const [state, action] = useActionState(createClientPipelineItemAction, pipelineState)

  useToastState(state)

  return (
    <form action={action} className="grid gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <select name="clientId" className="h-10 rounded-md border border-input bg-white px-3 text-sm">
        <option value="">No matched profile yet</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.firstName} {client.lastName} / {client.city}, {client.state}
          </option>
        ))}
      </select>
      <Input name="clientName" placeholder="Client name" />
      <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
        <Input name="city" placeholder="City" />
        <StateSelect id="pipelineState" name="state" ariaLabel="Pipeline item state" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <select name="stage" defaultValue="screening" className="h-10 rounded-md border border-input bg-white px-3 text-sm">
          {clientPipelineStages.map((stage) => (
            <option key={stage} value={stage}>{stage.replaceAll("_", " ")}</option>
          ))}
        </select>
        <select name="priority" defaultValue="normal" className="h-10 rounded-md border border-input bg-white px-3 text-sm">
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
      <Input name="estimatedValue" type="number" placeholder="Estimated value" />
      <Input name="dueAt" type="datetime-local" aria-label="Due date" />
      <Textarea name="nextAction" placeholder="Next action before scheduling or payment follow-up" className="min-h-20" />
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <Checkbox name="privateMatch" />
        Private match reviewed
      </label>
      <PendingSubmitButton pendingText="Creating..." className="bg-slate-950 text-white hover:bg-slate-800">
        <FolderKanban aria-hidden="true" />
        Create pipeline item
      </PendingSubmitButton>
      <FieldError name="clientName" errors={state.ok ? undefined : state.fieldErrors} />
    </form>
  )
}

function PipelineCard({ item }: { item: ClientPipelineItem }) {
  const [state, action] = useActionState(updateClientPipelineStageAction, pipelineState)

  useToastState(state)

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1fr_260px] lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cn("rounded-md text-white", priorityClass(item.priority))}>{item.priority}</Badge>
            <Badge variant="outline" className="rounded-md capitalize">{item.stage.replaceAll("_", " ")}</Badge>
            {item.privateMatch ? <Badge variant="secondary" className="rounded-md">Private match</Badge> : null}
          </div>
          <h3 className="mt-3 text-lg font-semibold text-slate-950">{item.clientName}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {item.city}, {item.state} / ${item.estimatedValue.toLocaleString()}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-700">{item.nextAction}</p>
          <p className="mt-2 text-xs text-slate-500">
            Due: {item.dueAt ? new Date(item.dueAt).toLocaleString() : "No due date set"}
          </p>
        </div>
        <form action={action} className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <input type="hidden" name="itemId" value={item.id} />
          <p className="text-xs font-semibold uppercase text-slate-500">Move stage</p>
          <select name="stage" defaultValue={item.stage} className="mt-2 h-10 w-full rounded-md border border-input bg-white px-3 text-sm">
            {clientPipelineStages.map((stage) => (
              <option key={stage} value={stage}>{stage.replaceAll("_", " ")}</option>
            ))}
          </select>
          <PendingSubmitButton pendingText="Moving..." variant="outline" className="mt-2 w-full">
            Update stage
          </PendingSubmitButton>
        </form>
      </div>
    </div>
  )
}

function RiskRoomForm({ clients }: { clients: ClientProfile[] }) {
  const [state, action] = useActionState(createRiskRoomAction, riskRoomState)

  useToastState(state)

  return (
    <form action={action} className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
      <select name="clientId" className="h-10 rounded-md border border-input bg-white px-3 text-sm">
        <option value="">Private unmatched client</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.firstName} {client.lastName}
          </option>
        ))}
      </select>
      <Input name="clientName" placeholder="Client name" />
      <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
        <Input name="city" placeholder="City" />
        <StateSelect id="riskRoomState" name="state" ariaLabel="Client work file state" />
      </div>
      <Input name="headline" placeholder="Client work file headline" />
      <Textarea name="summary" placeholder="Search notes, contract controls, evidence, payment follow-up, and next decision" className="min-h-24" />
      <PendingSubmitButton pendingText="Creating..." className="bg-slate-950 text-white hover:bg-slate-800">
        <PlusCircle aria-hidden="true" />
        Create client file
      </PendingSubmitButton>
      <FieldError name="summary" errors={state.ok ? undefined : state.fieldErrors} />
    </form>
  )
}

function RiskRoomCard({ room }: { room: ClientRiskRoom }) {
  const linkedCount =
    room.linkedSearchIds.length +
    room.linkedWatchlistIds.length +
    room.linkedAssessmentIds.length +
    room.linkedContractIds.length +
    room.linkedReportDraftIds.length +
    room.linkedEvidenceIds.length +
    room.linkedRecoveryIds.length +
    room.linkedResolutionIds.length

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <Badge variant="outline" className="rounded-md">Private client file</Badge>
      <h3 className="mt-3 font-semibold text-slate-950">{room.clientName}</h3>
      <p className="mt-1 text-xs text-slate-500">
        {room.city}, {room.state} / {linkedCount} linked records
      </p>
      <p className="mt-3 text-sm font-semibold text-slate-950">{room.headline}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{room.summary}</p>
      <p className="mt-3 text-xs text-slate-500">Updated {new Date(room.lastActivityAt).toLocaleDateString()}</p>
    </div>
  )
}

function WatchlistCreateForm({ clients }: { clients: ClientProfile[] }) {
  const [state, action] = useActionState(createWatchlistItemAction, watchState)

  useToastState(state)

  return (
    <form action={action} className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="grid gap-3 lg:grid-cols-[1fr_130px]">
        <select name="clientId" className="h-10 rounded-md border border-input bg-white px-3 text-sm">
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.firstName} {client.lastName} / {client.city}, {client.state}
            </option>
          ))}
        </select>
        <select name="alertLevel" defaultValue="high" className="h-10 rounded-md border border-input bg-white px-3 text-sm">
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
          <option value="low">Low</option>
        </select>
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto]">
        <Input name="watchReason" placeholder="Reason to watch before accepting additional work" />
        <PendingSubmitButton pendingText="Adding..." className="bg-slate-950 text-white hover:bg-slate-800">
          <PlusCircle aria-hidden="true" />
          Watch client
        </PendingSubmitButton>
      </div>
      <FieldError name="watchReason" errors={state.ok ? undefined : state.fieldErrors} />
    </form>
  )
}

function WatchlistCard({ item, client }: { item: ContractorWatchlistItem; client?: ClientProfile }) {
  const [state, action] = useActionState(updateWatchlistItemAction, watchState)

  useToastState(state)

  return (
    <div className="rounded-md border border-slate-200 p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-md bg-slate-950 text-white">{item.alertLevel}</Badge>
            {item.privateMatch ? <Badge variant="outline" className="rounded-md">Private match checked</Badge> : null}
          </div>
          <h3 className="mt-3 font-semibold text-slate-950">
            {client ? `${client.firstName} ${client.lastName}` : "Client watch item"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{client ? `${client.city}, ${client.state}` : "Location pending"}</p>
          <p className="mt-3 text-sm leading-6 text-slate-700">{item.watchReason}</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">{item.lastSignal}</p>
        </div>
        <form action={action}>
          <input type="hidden" name="itemId" value={item.id} />
          <input type="hidden" name="status" value={item.status === "active" ? "cleared" : "active"} />
          <PendingSubmitButton size="sm" variant="outline" pendingText="Saving...">
            <XCircle aria-hidden="true" />
            {item.status === "active" ? "Clear" : "Restore"}
          </PendingSubmitButton>
        </form>
      </div>
    </div>
  )
}

function MonitoringAlertCard({ alert, client }: { alert: WatchlistAlert; client?: ClientProfile }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={cn("rounded-md text-white", alert.severity === "urgent" ? "bg-rose-700" : alert.severity === "high" ? "bg-amber-700" : "bg-slate-700")}>
          {alert.severity}
        </Badge>
        <Badge variant="outline" className="rounded-md capitalize">
          {alert.eventType.replaceAll("_", " ")}
        </Badge>
      </div>
      <h3 className="mt-3 font-semibold text-slate-950">{alert.title}</h3>
      <p className="mt-1 text-xs text-slate-500">
        {client ? `${client.firstName} ${client.lastName} / ${client.city}, ${client.state}` : "Private match alert"}
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{alert.description}</p>
      {alert.profileSlug ? (
        <Button asChild size="sm" variant="outline" className="mt-3">
          <Link href={`/client/${alert.profileSlug}`}>Review profile</Link>
        </Button>
      ) : null}
    </div>
  )
}

function IntakeAssessmentForm() {
  const [state, action] = useActionState(createIntakeAssessmentAction, intakeState)

  useToastState(state)

  return (
    <form action={action} className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_110px_160px]">
        <Input name="clientName" placeholder="Client name" />
        <Input name="city" placeholder="City" />
        <StateSelect id="intakeState" name="state" ariaLabel="Intake state" />
      </div>
      <Input name="projectValue" type="number" placeholder="Project value" />
      <Textarea name="notes" placeholder="Intake notes for your team" className="min-h-20" />
      <div className="grid gap-2 text-sm text-slate-700">
        <label className="flex items-center gap-2">
          <Checkbox name="depositReceived" />
          Deposit received
        </label>
        <label className="flex items-center gap-2">
          <Checkbox name="contractSigned" />
          Contract signed
        </label>
        <label className="flex items-center gap-2">
          <Checkbox name="privateMatchConfirmed" />
          Private match reviewed
        </label>
      </div>
      <PendingSubmitButton pendingText="Assessing..." className="bg-slate-950 text-white hover:bg-slate-800">
        <Gauge aria-hidden="true" />
        Create assessment
      </PendingSubmitButton>
      <FieldError name="clientName" errors={state.ok ? undefined : state.fieldErrors} />
    </form>
  )
}

function ReportDraftForm({ clients, jobContext }: { clients: ClientProfile[]; jobContext?: DashboardJobContext | null }) {
  const [state, action] = useActionState(saveReportDraftAction, draftState)

  useToastState(state)

  return (
    <form action={action} className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
      <JobContextHiddenField jobContext={jobContext} />
      <select name="clientId" className="h-10 rounded-md border border-input bg-white px-3 text-sm">
        <option value="">No matched profile yet</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.firstName} {client.lastName}
          </option>
        ))}
      </select>
      <Input name="clientName" placeholder="Client name" />
      <TradeCategorySelect
        id="report-draft-project-type"
        name="projectType"
        otherName="otherProjectTypeDetail"
        defaultValue={jobContext?.tradeCategory}
        label="Project type"
        required
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="estimatedValue" type="number" placeholder="Estimated value" />
        <Input name="amountAtRisk" type="number" placeholder="Amount at risk" />
      </div>
      <Textarea name="summary" placeholder="Draft summary" />
      <Input name="nextStep" placeholder="Next action" />
      <select name="status" defaultValue="draft" className="h-10 rounded-md border border-input bg-white px-3 text-sm">
        <option value="draft">Draft</option>
        <option value="ready_to_submit">Ready to submit</option>
      </select>
      <PendingSubmitButton pendingText="Saving..." className="bg-slate-950 text-white hover:bg-slate-800">
        Save draft
      </PendingSubmitButton>
      <FieldError name="summary" errors={state.ok ? undefined : state.fieldErrors} />
    </form>
  )
}

function DraftCard({ draft }: { draft: ReportDraft }) {
  const [state, action] = useActionState(deleteReportDraftAction, deleteDraftState)
  const completion = reportDraftCompletionPercentage(draft)

  useToastState(state)

  return (
    <div className="rounded-md border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Badge variant="outline" className="rounded-md capitalize">
            {draft.status.replaceAll("_", " ")}
          </Badge>
          <h3 className="mt-3 font-semibold text-slate-950">{draft.clientName}</h3>
          <p className="mt-1 text-sm text-slate-500">{draft.projectType} / ${draft.estimatedValue.toLocaleString()}</p>
        </div>
        <form action={action}>
          <input type="hidden" name="draftId" value={draft.id} />
          <PendingSubmitButton size="sm" variant="ghost" pendingText="Deleting..." className="text-rose-700">
            Delete
          </PendingSubmitButton>
        </form>
      </div>
      <Progress value={completion} className="mt-4" />
      <p className="mt-2 text-xs text-slate-500">{completion}% complete</p>
      <p className="mt-3 text-sm leading-6 text-slate-700">{draft.summary}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href="/submit-report">Continue draft</Link>
        </Button>
        <Button asChild size="sm" variant="ghost">
          <Link href="/search">
            <Search aria-hidden="true" />
            Compare clients
          </Link>
        </Button>
      </div>
    </div>
  )
}

function ManagedRecoveryCaseForm({ jobContext }: { jobContext?: DashboardJobContext | null }) {
  const [state, action] = useActionState(submitManagedRecoveryCaseAction, managedRecoveryState)

  useToastState(state)

  return (
    <form action={action} className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
      <JobContextHiddenField jobContext={jobContext} />
      <div className="grid gap-3 sm:grid-cols-[1fr_100px_160px]">
        <Input name="clientName" placeholder="Client name" />
        <Input name="city" placeholder="City" defaultValue={jobContext?.city} />
        <StateSelect id="managedRecoveryState" name="state" defaultValue={jobContext?.state} ariaLabel="Managed recovery state" />
      </div>
      <Input name="clientEmail" type="email" placeholder="Client email for private matching (optional)" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="amountDue" type="number" placeholder="Amount due" />
        <Input name="invoiceAgeDays" type="number" placeholder="Invoice age in days" />
      </div>
      <select name="preferredChannel" defaultValue="email" className="h-10 rounded-md border border-input bg-white px-3 text-sm">
        <option value="email">Email first</option>
        <option value="phone">Phone follow-up</option>
        <option value="letter">Mailed letter</option>
        <option value="client_portal">Client portal message</option>
      </select>
      <Textarea name="evidenceVaultItemIds" placeholder="Evidence vault IDs or labels on file, separated by commas (optional)" className="min-h-16" />
      <Textarea
        name="summary"
        placeholder="Brief factual timeline: contract, work completed, invoice amount, due date, client response, and documents on file"
        className="min-h-24"
      />
      <label className="flex items-start gap-2 text-sm leading-6 text-slate-700">
        <Checkbox name="factualCertification" className="mt-1" />
        The case is based on accurate invoice, project, and communication records.
      </label>
      <label className="flex items-start gap-2 text-sm leading-6 text-slate-700">
        <Checkbox name="serviceTermsCertification" className="mt-1" />
        I authorize Client Bureau staff to review this private case and contact the client to seek a contractor-direct resolution.
      </label>
      <PendingSubmitButton pendingText="Submitting..." className="bg-slate-950 text-white hover:bg-slate-800">
        <PhoneCall aria-hidden="true" />
        Submit managed case
      </PendingSubmitButton>
      <FieldError name="summary" errors={state.ok ? undefined : state.fieldErrors} />
      <FieldError name="factualCertification" errors={state.ok ? undefined : state.fieldErrors} />
      <FieldError name="serviceTermsCertification" errors={state.ok ? undefined : state.fieldErrors} />
    </form>
  )
}

function RecoveryFeeCheckoutForm({ entityId, disabled = false }: { entityId: string; disabled?: boolean }) {
  const [state, action] = useActionState(createRecoveryServiceFeeCheckoutAction, serviceFeeState)
  const router = useRouter()

  useToastState(state)
  useEffect(() => {
    if (state.ok && state.data?.stripeCheckoutUrl) router.push(state.data.stripeCheckoutUrl)
  }, [router, state])

  return (
    <form action={action}>
      <input type="hidden" name="entityId" value={entityId} />
      <PendingSubmitButton size="sm" variant="outline" pendingText="Preparing..." disabled={disabled}>
        <CreditCard aria-hidden="true" />
        Pay service fee
      </PendingSubmitButton>
    </form>
  )
}

function LienFeeCheckoutForm({
  entityId,
  kind,
  disabled = false,
}: {
  entityId: string
  kind: "florida_lien_notice" | "florida_lien_filing"
  disabled?: boolean
}) {
  const [state, action] = useActionState(createLienServiceFeeCheckoutAction, serviceFeeState)
  const router = useRouter()

  useToastState(state)
  useEffect(() => {
    if (state.ok && state.data?.stripeCheckoutUrl) router.push(state.data.stripeCheckoutUrl)
  }, [router, state])

  return (
    <form action={action}>
      <input type="hidden" name="entityId" value={entityId} />
      <input type="hidden" name="kind" value={kind} />
      <PendingSubmitButton size="sm" variant="outline" pendingText="Preparing..." disabled={disabled}>
        <CreditCard aria-hidden="true" />
        Pay service fee
      </PendingSubmitButton>
    </form>
  )
}

function serviceFeeSummary(order?: ServiceFeeOrder) {
  if (!order) return "Service fee not started"

  const platformFee = order.clientBureauFeeCents / 100
  const passThrough = order.passThroughFeeCents / 100
  const extra = passThrough > 0 ? ` + $${passThrough.toLocaleString()} pass-through` : ""

  return `$${platformFee.toLocaleString()} Client Bureau fee${extra} / ${order.status.replaceAll("_", " ")}`
}

function readinessBadgeClass(status?: ServiceReadinessSummary["status"]) {
  if (status === "submitted" || status === "under_review") return "bg-emerald-700 text-white"
  if (status === "ready_for_checkout" || status === "fee_due") return "bg-amber-700 text-white"
  if (status === "blocked" || status === "needs_more_info") return "bg-rose-700 text-white"

  return "bg-slate-950 text-white"
}

function RevenueReadinessPanel({
  caseId,
  entityType,
  readiness,
  feeOrder,
  lienKind,
}: {
  caseId: string
  entityType: "managed_recovery" | "florida_lien"
  readiness?: ServiceReadinessSummary
  feeOrder?: ServiceFeeOrder
  lienKind?: "florida_lien_notice" | "florida_lien_filing"
}) {
  const [state, action] = useActionState(
    entityType === "managed_recovery" ? runRecoveryPrecheckAction : runFloridaLienPrecheckAction,
    serviceReadinessState
  )
  const current = state.ok && state.data.entityId === caseId ? state.data : readiness

  useToastState(state)

  return (
    <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Service readiness</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">
            {current ? current.nextAction : "Run a precheck before paying the service fee."}
          </p>
        </div>
        {current ? (
          <Badge className={cn("rounded-md capitalize", readinessBadgeClass(current.status))}>
            {current.status.replaceAll("_", " ")}
          </Badge>
        ) : null}
      </div>
      {current ? (
        <>
          <Progress value={current.score} className="mt-3" />
          <p className="mt-2 text-xs text-slate-500">{current.score}% complete before staff review</p>
          <div className="mt-3 grid gap-2">
            {current.checks.map((item) => (
              <div key={item.id} className="flex items-start gap-2 text-xs leading-5 text-slate-600">
                <span
                  className={cn(
                    "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                    item.complete ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
                  )}
                  aria-hidden="true"
                >
                  {item.complete ? "OK" : "!"}
                </span>
                <span>
                  <strong className="text-slate-900">{item.label}:</strong> {item.detail}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <form action={action}>
          <input type="hidden" name="caseId" value={caseId} />
          <PendingSubmitButton size="sm" variant="outline" pendingText="Checking...">
            <ClipboardCheck aria-hidden="true" />
            Run precheck
          </PendingSubmitButton>
        </form>
        {feeOrder?.status === "paid" ? (
          <Badge className="rounded-md bg-emerald-700 text-white">Fee paid</Badge>
        ) : entityType === "managed_recovery" ? (
          <RecoveryFeeCheckoutForm entityId={caseId} disabled={current ? !current.readyForCheckout : true} />
        ) : (
          <LienFeeCheckoutForm
            entityId={caseId}
            kind={lienKind ?? "florida_lien_filing"}
            disabled={current ? !current.readyForCheckout : true}
          />
        )}
      </div>
      {!current?.readyForCheckout ? (
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Checkout opens after the required identity, timeline, document, and authorization checks pass.
        </p>
      ) : null}
    </div>
  )
}

function CaseDocumentLinks({ links }: { links: CaseDocumentLink[] }) {
  if (links.length === 0) {
    return (
      <p className="mt-3 rounded-md border border-dashed border-slate-300 bg-white p-3 text-xs leading-5 text-slate-500">
        No private evidence has been linked to this service case yet.
      </p>
    )
  }

  return (
    <div className="mt-3 rounded-md border border-slate-200 bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Linked private evidence</p>
      <div className="mt-2 grid gap-2">
        {links.map((link) => (
          <div key={link.id} className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <span className="font-medium text-slate-900">{link.documentLabel}</span>
            <Badge variant="outline" className="rounded-md capitalize">
              {link.documentCategory}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}

function LinkEvidenceToCaseForm({
  entityType,
  entityId,
  evidenceVault,
}: {
  entityType: "managed_recovery" | "florida_lien"
  entityId: string
  evidenceVault: EvidenceVaultItem[]
}) {
  const [state, action] = useActionState(linkEvidenceToServiceCaseAction, caseDocumentLinkState)

  useToastState(state)

  return (
    <form action={action} className="mt-3 grid gap-2 rounded-md border border-slate-200 bg-white p-3">
      <input type="hidden" name="entityType" value={entityType} />
      <input type="hidden" name="entityId" value={entityId} />
      <select
        name="evidenceVaultItemId"
        className="h-9 rounded-md border border-input bg-white px-3 text-xs"
        disabled={evidenceVault.length === 0}
      >
        {evidenceVault.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label} / {item.fileCategory.replaceAll("_", " ")}
          </option>
        ))}
      </select>
      <div className="grid gap-2 sm:grid-cols-2">
        <Input name="documentLabel" placeholder="Document label" className="h-9 text-xs" />
        <select name="documentCategory" defaultValue="invoice" className="h-9 rounded-md border border-input bg-white px-3 text-xs">
          <option value="invoice">Invoice</option>
          <option value="contract">Contract</option>
          <option value="screenshot">Screenshot</option>
          <option value="photo">Photo</option>
          <option value="pdf">PDF</option>
          <option value="other">Other</option>
        </select>
      </div>
      <Input name="publicSummary" placeholder="Private/public-safe summary, optional" className="h-9 text-xs" />
      <PendingSubmitButton size="sm" variant="outline" pendingText="Linking..." disabled={evidenceVault.length === 0}>
        <Link2 aria-hidden="true" />
        Link private evidence
      </PendingSubmitButton>
      <FieldError name="documentLabel" errors={state.ok ? undefined : state.fieldErrors} />
      {evidenceVault.length === 0 ? (
        <p className="text-xs leading-5 text-slate-500">Upload evidence in the Evidence Vault before linking documents here.</p>
      ) : null}
    </form>
  )
}

function ManagedRecoveryCaseCard({
  item,
  feeOrder,
  readiness,
  documentLinks,
  evidenceVault,
}: {
  item: ManagedRecoveryCase
  feeOrder?: ServiceFeeOrder
  readiness?: ServiceReadinessSummary
  documentLinks: CaseDocumentLink[]
  evidenceVault: EvidenceVaultItem[]
}) {
  return (
    <div className="rounded-md border border-slate-200 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={cn("rounded-md text-white", priorityClass(item.priority))}>{item.priority}</Badge>
        <Badge variant="outline" className="rounded-md capitalize">{item.status.replaceAll("_", " ")}</Badge>
        <Badge variant="secondary" className="rounded-md">Private service</Badge>
      </div>
      <h3 className="mt-3 font-semibold text-slate-950">{item.clientName}</h3>
      <p className="mt-1 text-sm text-slate-500">
        {item.city}, {item.state} / ${item.amountDue.toLocaleString()} / {item.invoiceAgeDays} days past invoice
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-700">{item.summary}</p>
      <div className="mt-3 grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
        <span className="font-semibold text-slate-900">Fee status: {serviceFeeSummary(feeOrder)}</span>
        <span>Payment recovery remains contractor-direct. Client Bureau does not hold recovered funds.</span>
        <span>Next: {item.nextAction}</span>
      </div>
      <RevenueReadinessPanel
        caseId={item.id}
        entityType="managed_recovery"
        readiness={readiness}
        feeOrder={feeOrder}
      />
      <CaseDocumentLinks links={documentLinks} />
      <LinkEvidenceToCaseForm entityType="managed_recovery" entityId={item.id} evidenceVault={evidenceVault} />
    </div>
  )
}

function PaymentRecoveryForm({ jobContext }: { jobContext?: DashboardJobContext | null }) {
  const [state, action] = useActionState(createPaymentRecoveryCaseAction, recoveryState)

  useToastState(state)

  return (
    <form action={action} className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
      <JobContextHiddenField jobContext={jobContext} />
      <div className="grid gap-3 sm:grid-cols-[1fr_100px_160px]">
        <Input name="clientName" placeholder="Client name" />
        <Input name="city" placeholder="City" defaultValue={jobContext?.city} />
        <StateSelect id="paymentRecoveryState" name="state" defaultValue={jobContext?.state} ariaLabel="Payment recovery state" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="amountDue" type="number" placeholder="Amount due" />
        <Input name="invoiceAgeDays" type="number" placeholder="Invoice age in days" />
      </div>
      <select name="preferredChannel" defaultValue="email" className="h-10 rounded-md border border-input bg-white px-3 text-sm">
        <option value="email">Email reminder</option>
        <option value="phone">Documented phone call</option>
        <option value="letter">Mailed letter</option>
        <option value="client_portal">Client portal message</option>
      </select>
      <Textarea
        name="summary"
        placeholder="Factual invoice, project, and payment timeline summary"
        className="min-h-20"
      />
      <label className="flex items-start gap-2 text-sm leading-6 text-slate-700">
        <Checkbox name="factualCertification" className="mt-1" />
        This recovery record is based on accurate invoice and project documentation.
      </label>
      <PendingSubmitButton pendingText="Creating..." className="bg-slate-950 text-white hover:bg-slate-800">
        <Send aria-hidden="true" />
        Create recovery case
      </PendingSubmitButton>
      <FieldError name="summary" errors={state.ok ? undefined : state.fieldErrors} />
      <FieldError name="factualCertification" errors={state.ok ? undefined : state.fieldErrors} />
    </form>
  )
}

function PaymentRecoveryCard({ item }: { item: PaymentRecoveryCase }) {
  return (
    <div className="rounded-md border border-slate-200 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={cn("rounded-md text-white", priorityClass(item.priority))}>
          {item.priority}
        </Badge>
        <Badge variant="outline" className="rounded-md capitalize">
          {item.status.replaceAll("_", " ")}
        </Badge>
        <Badge variant="secondary" className="rounded-md capitalize">
          {item.preferredChannel.replaceAll("_", " ")}
        </Badge>
      </div>
      <h3 className="mt-3 font-semibold text-slate-950">{item.clientName}</h3>
      <p className="mt-1 text-sm text-slate-500">
        {item.city}, {item.state} / ${item.amountDue.toLocaleString()} / {item.invoiceAgeDays} days
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-700">{item.summary}</p>
      <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3">
        <p className="text-xs font-semibold uppercase text-amber-900">Next action</p>
        <p className="mt-1 text-sm leading-6 text-amber-950">{item.nextAction}</p>
      </div>
      <ul className="mt-3 grid gap-1 text-xs leading-5 text-slate-500">
        {item.complianceFlags.map((flag) => (
          <li key={flag}>- {flag}</li>
        ))}
      </ul>
    </div>
  )
}

function RecoveryAttemptForm({ cases }: { cases: PaymentRecoveryCase[] }) {
  const [state, action] = useActionState(logPaymentRecoveryAttemptAction, recoveryAttemptState)

  useToastState(state)

  return (
    <form action={action} className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
      <select name="recoveryCaseId" className="h-10 rounded-md border border-input bg-white px-3 text-sm">
        {cases.map((item) => (
          <option key={item.id} value={item.id}>{item.clientName} / ${item.amountDue.toLocaleString()}</option>
        ))}
      </select>
      <div className="grid gap-3 sm:grid-cols-2">
        <select name="channel" defaultValue="phone" className="h-10 rounded-md border border-input bg-white px-3 text-sm">
          <option value="email">Email</option>
          <option value="phone">Phone call</option>
          <option value="letter">Letter</option>
          <option value="client_portal">Client portal</option>
        </select>
        <select name="outcome" defaultValue="needs_follow_up" className="h-10 rounded-md border border-input bg-white px-3 text-sm">
          <option value="no_response">No response</option>
          <option value="client_responded">Client responded</option>
          <option value="payment_promised">Payment promised</option>
          <option value="payment_received">Payment received</option>
          <option value="dispute_raised">Dispute raised</option>
          <option value="needs_follow_up">Needs follow-up</option>
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="attemptedAt" type="datetime-local" aria-label="Attempted at" />
        <Input name="nextFollowUpAt" type="datetime-local" aria-label="Next follow-up" />
      </div>
      <Textarea name="note" placeholder="Factual call, email, letter, or portal-message note" className="min-h-20" />
      <PendingSubmitButton pendingText="Logging..." className="bg-slate-950 text-white hover:bg-slate-800">
        <PhoneCall aria-hidden="true" />
        Log attempt
      </PendingSubmitButton>
      <FieldError name="note" errors={state.ok ? undefined : state.fieldErrors} />
    </form>
  )
}

function RecoveryAttemptCard({ item }: { item: PaymentRecoveryAttempt }) {
  return (
    <div className="rounded-md border border-slate-200 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="rounded-md capitalize">{item.channel.replaceAll("_", " ")}</Badge>
        <Badge variant="secondary" className="rounded-md capitalize">{item.outcome.replaceAll("_", " ")}</Badge>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{item.note}</p>
      <p className="mt-2 text-xs text-slate-500">
        Attempted {new Date(item.attemptedAt).toLocaleString()}
        {item.nextFollowUpAt ? ` / Follow up ${new Date(item.nextFollowUpAt).toLocaleString()}` : ""}
      </p>
      <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
        {nextRecoveryAttemptAction(item)}
      </div>
    </div>
  )
}

function PaymentPlanForm({ cases }: { cases: PaymentRecoveryCase[] }) {
  const [state, action] = useActionState(createPaymentPlanAction, paymentPlanState)

  useToastState(state)

  return (
    <form action={action} className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
      <select name="recoveryCaseId" className="h-10 rounded-md border border-input bg-white px-3 text-sm">
        {cases.map((item) => (
          <option key={item.id} value={item.id}>{item.clientName} / ${item.amountDue.toLocaleString()}</option>
        ))}
      </select>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="totalAmount" type="number" placeholder="Total amount" />
        <Input name="installmentAmount" type="number" placeholder="Installment amount" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="dueDay" type="number" placeholder="Due day" />
        <Input name="nextDueDate" type="date" aria-label="Next due date" />
      </div>
      <select name="status" defaultValue="proposed" className="h-10 rounded-md border border-input bg-white px-3 text-sm">
        <option value="proposed">Proposed</option>
        <option value="accepted">Accepted</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
        <option value="missed">Missed</option>
        <option value="paused">Paused</option>
      </select>
      <Textarea name="notes" placeholder="Payment plan terms and response notes" className="min-h-20" />
      <PendingSubmitButton pendingText="Creating..." className="bg-slate-950 text-white hover:bg-slate-800">
        Create plan
      </PendingSubmitButton>
      <FieldError name="installmentAmount" errors={state.ok ? undefined : state.fieldErrors} />
    </form>
  )
}

function PaymentPlanCard({ item }: { item: PaymentPlan }) {
  const completion = paymentPlanCompletion(item)

  return (
    <div className="rounded-md border border-slate-200 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="rounded-md capitalize">{item.status}</Badge>
        <Badge variant="secondary" className="rounded-md">${item.installmentAmount.toLocaleString()} installments</Badge>
      </div>
      <Progress value={completion} className="mt-4" />
      <p className="mt-2 text-xs text-slate-500">{completion}% tracking readiness</p>
      <p className="mt-3 text-sm leading-6 text-slate-700">{item.notes}</p>
      <p className="mt-2 text-xs text-slate-500">
        Total ${item.totalAmount.toLocaleString()} / due day {item.dueDay}
        {item.nextDueDate ? ` / next ${item.nextDueDate}` : ""}
      </p>
    </div>
  )
}

function FloridaLienCaseForm({ jobContext }: { jobContext?: DashboardJobContext | null }) {
  const [state, action] = useActionState(submitFloridaLienCaseAction, floridaLienState)

  useToastState(state)

  return (
    <form action={action} className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
      <JobContextHiddenField jobContext={jobContext} />
      <select name="workflowType" defaultValue="claim_of_lien_filing" className="h-10 rounded-md border border-input bg-white px-3 text-sm">
        <option value="notice_packet">Florida notice packet</option>
        <option value="claim_of_lien_filing">Florida claim of lien filing</option>
      </select>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="clientName" placeholder="Client name" />
        <Input name="ownerName" placeholder="Property owner name" />
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_160px]">
        <FloridaCountySelect id="floridaLienPropertyCounty" name="propertyCounty" labelClassName="sr-only" />
        <Input name="propertyCity" placeholder="Property city" defaultValue={jobContext?.city} />
        <StateSelect id="floridaLienState" name="state" defaultValue={jobContext?.state ?? "FL"} ariaLabel="Florida lien state" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="parcelNumber" placeholder="Parcel number (optional)" />
        <select name="contractorRole" defaultValue="direct_contractor" className="h-10 rounded-md border border-input bg-white px-3 text-sm">
          <option value="direct_contractor">Direct contractor</option>
          <option value="subcontractor">Subcontractor</option>
          <option value="supplier">Supplier</option>
          <option value="laborer">Laborer</option>
          <option value="other">Other role</option>
        </select>
      </div>
      <TradeCategorySelect
        id="floridaLienProjectType"
        name="projectType"
        otherName="otherProjectTypeDetail"
        defaultValue={jobContext?.tradeCategory}
        label="Project type / trade category"
        required
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="contractAmount" type="number" placeholder="Contract amount" />
        <Input name="amountDue" type="number" placeholder="Unpaid amount" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Input name="firstWorkDate" type="date" aria-label="First work date" />
        <Input name="lastWorkDate" type="date" aria-label="Last work date" />
        <Input name="filingDeadline" type="date" aria-label="Filing deadline" />
      </div>
      <Textarea name="legalDescription" placeholder="Legal description if available (kept private)" className="min-h-20" />
      <Textarea name="noticeHistory" placeholder="Notice, invoice, contract, payment request, and communication history" className="min-h-24" />
      <Textarea name="privateSummary" placeholder="Private case summary for Client Bureau and attorney/vendor review" className="min-h-24" />
      <label className="flex items-start gap-2 text-sm leading-6 text-slate-700">
        <Checkbox name="accuracyCertification" className="mt-1" />
        I certify this case information is accurate to the best of my knowledge.
      </label>
      <label className="flex items-start gap-2 text-sm leading-6 text-slate-700">
        <Checkbox name="filingTermsCertification" className="mt-1" />
        I understand this is a managed workflow routed through attorney/vendor review and does not guarantee lien priority, enforceability, or collection.
      </label>
      <PendingSubmitButton pendingText="Submitting..." className="bg-slate-950 text-white hover:bg-slate-800">
        <Landmark aria-hidden="true" />
        Submit Florida case
      </PendingSubmitButton>
      <FieldError name="amountDue" errors={state.ok ? undefined : state.fieldErrors} />
      <FieldError name="state" errors={state.ok ? undefined : state.fieldErrors} />
      <FieldError name="accuracyCertification" errors={state.ok ? undefined : state.fieldErrors} />
      <FieldError name="filingTermsCertification" errors={state.ok ? undefined : state.fieldErrors} />
    </form>
  )
}

function LienAuthorizationForm({ caseId }: { caseId: string }) {
  const [state, action] = useActionState(signLienFilingAuthorizationAction, floridaLienState)

  useToastState(state)

  return (
    <form action={action} className="mt-3 grid gap-2 rounded-md border border-amber-200 bg-amber-50 p-3">
      <input type="hidden" name="caseId" value={caseId} />
      <Input name="signerName" placeholder="Signer name" className="bg-white" />
      <Input name="authorityTitle" placeholder="Authority/title" className="bg-white" />
      <Input name="signatureName" placeholder="Type signer name again" className="bg-white" />
      <label className="flex items-start gap-2 text-xs leading-5 text-amber-950">
        <Checkbox name="accuracyCertification" className="mt-1" />
        Filing information is accurate.
      </label>
      <label className="flex items-start gap-2 text-xs leading-5 text-amber-950">
        <Checkbox name="authorityCertification" className="mt-1" />
        I am authorized to sign for the contractor.
      </label>
      <label className="flex items-start gap-2 text-xs leading-5 text-amber-950">
        <Checkbox name="vendorReviewCertification" className="mt-1" />
        I authorize attorney/e-recording vendor review before sending or filing.
      </label>
      <PendingSubmitButton size="sm" pendingText="Signing..." className="bg-slate-950 text-white hover:bg-slate-800">
        <Signature aria-hidden="true" />
        Sign authorization
      </PendingSubmitButton>
      <FieldError name="signatureName" errors={state.ok ? undefined : state.fieldErrors} />
    </form>
  )
}

function FloridaLienCaseCard({
  item,
  feeOrder,
  readiness,
  documentLinks,
  evidenceVault,
}: {
  item: FloridaLienCase
  feeOrder?: ServiceFeeOrder
  readiness?: ServiceReadinessSummary
  documentLinks: CaseDocumentLink[]
  evidenceVault: EvidenceVaultItem[]
}) {
  const kind = item.workflowType === "notice_packet" ? "florida_lien_notice" : "florida_lien_filing"

  return (
    <div className="rounded-md border border-slate-200 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="rounded-md capitalize">{item.workflowType.replaceAll("_", " ")}</Badge>
        <Badge className="rounded-md bg-slate-950 text-white capitalize">{item.status.replaceAll("_", " ")}</Badge>
        <Badge variant="secondary" className="rounded-md">{item.propertyCounty} County</Badge>
      </div>
      <h3 className="mt-3 font-semibold text-slate-950">{item.clientName}</h3>
      <p className="mt-1 text-sm text-slate-500">
        {item.projectType} / {item.propertyCity}, FL / ${item.amountDue.toLocaleString()} unpaid
      </p>
      <div className="mt-3 grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
        <span>Fee status: {serviceFeeSummary(feeOrder)}</span>
        <span>Attorney/vendor status: {item.attorneyVendorStatus.replaceAll("_", " ")}</span>
        <span>Filing deadline: {item.filingDeadline ?? "Review required"}</span>
        <span>Next: {item.nextAction}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{item.privateSummary}</p>
      <RevenueReadinessPanel
        caseId={item.id}
        entityType="florida_lien"
        readiness={readiness}
        feeOrder={feeOrder}
        lienKind={kind}
      />
      <CaseDocumentLinks links={documentLinks} />
      <LinkEvidenceToCaseForm entityType="florida_lien" entityId={item.id} evidenceVault={evidenceVault} />
      {item.contractorSignedAt ? (
        <Badge variant="outline" className="mt-3 rounded-md">Authorized by {item.contractorSignatureName ?? "contractor"}</Badge>
      ) : null}
      {!item.contractorSignedAt ? <LienAuthorizationForm caseId={item.id} /> : null}
    </div>
  )
}

function LienNoticeDraftForm({ jobContext }: { jobContext?: DashboardJobContext | null }) {
  const [state, action] = useActionState(createLienNoticeDraftAction, lienNoticeState)

  useToastState(state)

  return (
    <form action={action} className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
      <JobContextHiddenField jobContext={jobContext} />
      <Input name="clientName" placeholder="Client name" />
      <TradeCategorySelect
        id="lienNoticeProjectType"
        name="projectType"
        otherName="otherProjectTypeDetail"
        defaultValue={jobContext?.tradeCategory}
        label="Project type / trade category"
        required
      />
      <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
        <Input name="propertyCity" placeholder="Property city" defaultValue={jobContext?.city} />
        <StateSelect id="lienNoticeState" name="state" defaultValue={jobContext?.state ?? "FL"} ariaLabel="Lien notice state" />
      </div>
      <Input name="amountDue" type="number" placeholder="Amount due" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="lastWorkDate" type="date" aria-label="Last work date" />
        <Input name="targetSendDate" type="date" aria-label="Target send date" />
      </div>
      <label className="flex items-start gap-2 text-sm leading-6 text-slate-700">
        <Checkbox name="reviewCertification" className="mt-1" />
        State-specific lien packet requirements will be reviewed before any notice is sent.
      </label>
      <PendingSubmitButton pendingText="Creating..." className="bg-slate-950 text-white hover:bg-slate-800">
        <Landmark aria-hidden="true" />
        Create lien packet
      </PendingSubmitButton>
      <FieldError name="reviewCertification" errors={state.ok ? undefined : state.fieldErrors} />
    </form>
  )
}

function LienNoticeCard({ item }: { item: LienNoticeDraft }) {
  return (
    <div className="rounded-md border border-slate-200 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="rounded-md">
          {lienNoticeReadinessLabel(item)}
        </Badge>
        <Badge variant="secondary" className="rounded-md capitalize">
          {item.status.replaceAll("_", " ")}
        </Badge>
      </div>
      <h3 className="mt-3 font-semibold text-slate-950">{item.clientName}</h3>
      <p className="mt-1 text-sm text-slate-500">
        {item.projectType} / {item.propertyCity}, {item.state} / ${item.amountDue.toLocaleString()}
      </p>
      <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
        <span>Last work: {item.lastWorkDate}</span>
        <span>Target send: {item.targetSendDate ?? "Review pending"}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{item.nextStep}</p>
      <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
        {item.jurisdictionNote}
      </p>
    </div>
  )
}

function ContractWorkspaceForm({ jobContext }: { jobContext?: DashboardJobContext | null }) {
  const [state, action] = useActionState(createContractWorkspaceItemAction, contractState)

  useToastState(state)

  return (
    <form action={action} className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
      <JobContextHiddenField jobContext={jobContext} />
      <Input name="clientName" placeholder="Client name" />
      <TradeCategorySelect
        id="contractWorkspaceProjectType"
        name="projectType"
        otherName="otherProjectTypeDetail"
        defaultValue={jobContext?.tradeCategory}
        label="Project type / trade category"
        required
      />
      <select name="templateType" defaultValue="service_agreement" className="h-10 rounded-md border border-input bg-white px-3 text-sm">
        <option value="service_agreement">Service agreement</option>
        <option value="change_order">Change order</option>
        <option value="payment_plan">Payment plan</option>
        <option value="completion_certificate">Completion certificate</option>
        <option value="notice_of_nonpayment">Notice of non-payment</option>
      </select>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="contractValue" type="number" placeholder="Contract value" />
        <Input name="depositRequired" type="number" placeholder="Deposit required" />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <Checkbox name="milestoneBilling" />
        Include milestone billing controls
      </label>
      <Textarea name="summary" placeholder="Scope, payment, and documentation controls" className="min-h-20" />
      <PendingSubmitButton pendingText="Creating..." className="bg-slate-950 text-white hover:bg-slate-800">
        <Signature aria-hidden="true" />
        Create agreement draft
      </PendingSubmitButton>
      <FieldError name="summary" errors={state.ok ? undefined : state.fieldErrors} />
      <FieldError name="depositRequired" errors={state.ok ? undefined : state.fieldErrors} />
    </form>
  )
}

function ContractDocumentCard({ item }: { item: ContractWorkspaceItem }) {
  const completion = contractCompletionPercentage(item)

  return (
    <div className="rounded-md border border-slate-200 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="rounded-md capitalize">
          {item.status}
        </Badge>
        <Badge variant="secondary" className="rounded-md capitalize">
          {item.templateType.replaceAll("_", " ")}
        </Badge>
      </div>
      <h3 className="mt-3 font-semibold text-slate-950">{item.clientName}</h3>
      <p className="mt-1 text-sm text-slate-500">
        {item.projectType} / ${item.contractValue.toLocaleString()} / deposit ${item.depositRequired.toLocaleString()}
      </p>
      <Progress value={completion} className="mt-4" />
      <p className="mt-2 text-xs text-slate-500">{completion}% agreement readiness</p>
      <p className="mt-3 text-sm leading-6 text-slate-700">{item.summary}</p>
      <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
        {item.nextStep}
      </div>
    </div>
  )
}

function ContractPacketForm({ jobContext }: { jobContext?: DashboardJobContext | null }) {
  const [state, action] = useActionState(createContractPacketAction, contractPacketState)
  const [activeTemplate, setActiveTemplate] = useState<"blank" | "florida">("blank")
  const [openPolicySection, setOpenPolicySection] = useState<string | undefined>(undefined)
  const templateValues = activeTemplate === "florida"
    ? floridaResidentialServiceAgreementTemplate.fields
    : undefined
  const packetErrors = state.ok ? undefined : state.fieldErrors
  const policyNeedsAttention = Boolean(
    packetErrors?.changeOrderPolicy?.length || packetErrors?.cancellationPolicy?.length,
  )
  const policySectionValue = policyNeedsAttention ? "policies" : openPolicySection
  const createdPacket = state.ok ? state.data : undefined

  useToastState(state)

  return (
    <div className="grid gap-4">
      <div className="rounded-md border border-amber-200 bg-amber-50/70 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-950">Start from a reviewed structure</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Use the Florida starter to prefill scope, exclusions, payment timing, change-order rules, and review notes.
              Edit every field before sending a signing link.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="bg-slate-950 text-white hover:bg-slate-800"
              onClick={() => setActiveTemplate("florida")}
            >
              <ListChecks aria-hidden="true" />
              Use Florida starter
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setActiveTemplate("blank")}>
              Start blank
            </Button>
          </div>
        </div>
        {activeTemplate === "florida" ? (
          <div className="mt-3 grid gap-2 text-xs leading-5 text-slate-600">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-md border-amber-300 bg-white text-amber-800">
                Florida-aware
              </Badge>
              <Badge variant="outline" className="rounded-md border-amber-300 bg-white text-amber-800">
                Attorney-review recommended
              </Badge>
              <Badge variant="outline" className="rounded-md border-amber-300 bg-white text-amber-800">
                Private signing packet
              </Badge>
            </div>
            <p>
              This starter is not legal advice. Florida lien, notice, cancellation, licensing, permit, roofing,
              and local-code requirements can vary by work type and transaction.
            </p>
            <p className="font-medium text-amber-900">
              Replace the 0 milestone amounts with real deposit, progress, and final-payment amounts before sharing.
            </p>
          </div>
        ) : (
          <p className="mt-3 rounded-md border border-dashed border-amber-300 bg-white/70 p-3 text-xs leading-5 text-amber-950">
            Blank packets require scope, included work, payment terms, change-order policy, cancellation policy,
            and next action.
          </p>
        )}
      </div>

      {createdPacket ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold">Agreement packet created.</p>
              <p className="mt-1 text-emerald-900">
                Review the packet, create a private signing link, and keep the job file connected before work is
                scheduled.
              </p>
            </div>
            <Badge className="rounded-md bg-emerald-700 text-white">Ready for review</Badge>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline" className="border-emerald-300 bg-white text-emerald-950">
              <Link href={`#contract-packet-${createdPacket.id}`}>
                <FileText aria-hidden="true" />
                Review packet
              </Link>
            </Button>
            <span className="inline-flex min-h-9 items-center rounded-md border border-emerald-200 bg-white px-3 text-xs font-semibold text-emerald-900">
              Create the signing link from the packet card below.
            </span>
            {createdPacket.projectJobId ? (
              <Button asChild size="sm" variant="outline" className="border-emerald-300 bg-white text-emerald-950">
                <Link href={`/dashboard/jobs/${createdPacket.projectJobId}`}>
                  <FolderKanban aria-hidden="true" />
                  Return to Job file
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      <form key={activeTemplate} action={action} className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4">
        <div>
          <p className="text-sm font-semibold text-slate-950">Create agreement packet</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Build the private record first. Send the signing link only after scope, payment terms, and policies are ready.
          </p>
        </div>
        <JobContextHiddenField jobContext={jobContext} />

        <div className="grid gap-3 sm:grid-cols-2">
          <Input name="clientName" placeholder="Client display name" />
          <Input name="clientLegalName" placeholder="Client legal name, if different" />
          <Input name="contractorLegalName" placeholder="Your legal business name" />
          <TradeCategorySelect
            id="contract-packet-project-type"
            name="projectType"
            otherName="otherProjectTypeDetail"
            defaultValue={templateValues?.projectType ?? jobContext?.tradeCategory}
            label="Project type"
            required
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_150px_150px]">
          <select
            name="templateType"
            defaultValue={templateValues?.templateType ?? "service_agreement"}
            className="h-10 rounded-md border border-input bg-white px-3 text-sm"
          >
            <option value="service_agreement">Service agreement</option>
            <option value="change_order">Change order</option>
            <option value="payment_plan">Payment plan</option>
            <option value="completion_certificate">Completion certificate</option>
            <option value="notice_of_nonpayment">Notice of non-payment</option>
          </select>
          <Input name="projectStartDate" type="date" aria-label="Projected start date" />
          <Input name="projectEndDate" type="date" aria-label="Projected end date" />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Input name="packetValue" type="number" placeholder="Agreement value" />
          <Input name="depositRequired" type="number" placeholder="Deposit required" />
          <Input
            name="milestoneCount"
            type="number"
            placeholder="Milestone count"
            defaultValue={templateValues?.milestoneCount}
          />
        </div>

        <Textarea
          name="scopeSummary"
          placeholder="Scope summary: what job this agreement covers"
          defaultValue={templateValues?.scopeSummary}
          className="min-h-20"
        />
        <Textarea
          name="includedWork"
          placeholder="Included work: labor, materials, deliverables, access requirements, cleanup"
          defaultValue={templateValues?.includedWork}
          className="min-h-24"
        />
        <Textarea
          name="excludedWork"
          placeholder="Excluded work: anything that requires a written change order"
          defaultValue={templateValues?.excludedWork}
          className="min-h-20"
        />
        <Textarea
          name="paymentTerms"
          placeholder="Payment terms: deposit, milestone timing, due dates, accepted payment methods"
          defaultValue={templateValues?.paymentTerms}
          className="min-h-24"
        />
        <Textarea
          name="milestoneSchedule"
          placeholder="Milestone schedule, one per line: Deposit before scheduling | 2500 | Before scheduling"
          defaultValue={templateValues?.milestoneSchedule}
          className="min-h-24"
        />

        <Accordion
          type="single"
          collapsible
          value={policySectionValue}
          onValueChange={setOpenPolicySection}
          className="rounded-md border border-slate-200 bg-white px-3"
        >
          <AccordionItem value="policies" className="border-none">
            <AccordionTrigger className="text-sm font-semibold text-slate-950">
              <span className="flex flex-wrap items-center gap-2">
                <span>Agreement policies</span>
                {policyNeedsAttention ? (
                  <Badge variant="outline" className="rounded-md border-red-200 bg-red-50 text-red-700">
                    Agreement policies need attention
                  </Badge>
                ) : null}
              </span>
            </AccordionTrigger>
            <AccordionContent className="grid gap-3">
              <Textarea
                name="changeOrderPolicy"
                placeholder="Change-order policy: how added work, material changes, or schedule changes are approved"
                defaultValue={templateValues?.changeOrderPolicy}
                className="min-h-20"
              />
              <FieldError name="changeOrderPolicy" errors={packetErrors} />
              <Textarea
                name="cancellationPolicy"
                placeholder="Cancellation policy: pause, reschedule, materials, completed work, and written notice"
                defaultValue={templateValues?.cancellationPolicy}
                className="min-h-20"
              />
              <FieldError name="cancellationPolicy" errors={packetErrors} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Textarea
          name="nextAction"
          placeholder="Next contract action before scheduling"
          defaultValue={templateValues?.nextAction}
          className="min-h-20"
        />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <Checkbox name="requiredBeforeScheduling" defaultChecked={templateValues?.requiredBeforeScheduling} />
          Require this signed packet before scheduling work
        </label>
        <ContractPacketValidationSummary errors={packetErrors} />
        <PendingSubmitButton pendingText="Creating..." className="bg-slate-950 text-white hover:bg-slate-800">
          <Signature aria-hidden="true" />
          Create agreement packet
        </PendingSubmitButton>
        <FieldError name="clientName" errors={packetErrors} />
        <FieldError name="projectType" errors={packetErrors} />
        <FieldError name="packetValue" errors={packetErrors} />
        <FieldError name="depositRequired" errors={packetErrors} />
        <FieldError name="milestoneCount" errors={packetErrors} />
        <FieldError name="scopeSummary" errors={packetErrors} />
        <FieldError name="includedWork" errors={packetErrors} />
        <FieldError name="paymentTerms" errors={packetErrors} />
        <FieldError name="milestoneSchedule" errors={packetErrors} />
        <FieldError name="projectEndDate" errors={packetErrors} />
        <FieldError name="nextAction" errors={packetErrors} />
      </form>
    </div>
  )
}

const contractPacketErrorLabels: Record<string, string> = {
  cancellationPolicy: "Cancellation policy",
  changeOrderPolicy: "Change-order policy",
  clientName: "Client display name",
  depositRequired: "Deposit required",
  includedWork: "Included work",
  milestoneCount: "Milestone count",
  milestoneSchedule: "Milestone schedule",
  nextAction: "Next action",
  packetValue: "Agreement value",
  paymentTerms: "Payment terms",
  projectEndDate: "Projected end date",
  projectType: "Project type",
  scopeSummary: "Scope summary",
}

function ContractPacketValidationSummary({ errors }: { errors?: Record<string, string[]> }) {
  const entries = Object.entries(errors ?? {})
    .filter(([, messages]) => messages.length > 0)
    .map(([field, messages]) => ({
      field,
      label: contractPacketErrorLabels[field] ?? field,
      message: messages[0],
    }))

  if (entries.length === 0) return null

  return (
    <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-800">
      <p className="font-semibold text-red-900">Finish these agreement fields before creating the packet:</p>
      <ul className="mt-2 grid gap-1 sm:grid-cols-2">
        {entries.map((entry) => (
          <li key={entry.field}>
            <span className="font-semibold">{entry.label}:</span> {entry.message}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ContractPacketCard({ item }: { item: ContractPacket }) {
  const [statusState, statusAction] = useActionState(updateContractPacketStatusAction, contractPacketState)
  const [shareState, shareAction] = useActionState(createContractShareLinkAction, contractShareState)
  const displayItem = shareState.ok ? shareState.data : statusState.ok ? statusState.data : item
  const completion = contractPacketCompletionPercentage(displayItem)
  const shareUrl = displayItem.shareUrl
  const shareUrlLabel = shareUrl?.startsWith("/") ? shareUrl : shareUrl?.replace(/^https?:\/\//, "")
  const milestones = displayItem.milestoneSchedule ?? []
  const signedDigestLabel = displayItem.signedDigest
    ? `${displayItem.signedDigest.slice(0, 18)}...${displayItem.signedDigest.slice(-8)}`
    : undefined

  useToastState(statusState)
  useToastState(shareState)

  return (
    <div id={`contract-packet-${displayItem.id}`} className="scroll-mt-24 rounded-md border border-slate-200 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="rounded-md capitalize">{displayItem.status.replaceAll("_", " ")}</Badge>
        <Badge variant="secondary" className="rounded-md capitalize">{displayItem.templateType.replaceAll("_", " ")}</Badge>
        {displayItem.requiredBeforeScheduling ? <Badge className="rounded-md bg-amber-700 text-white">Before scheduling</Badge> : null}
        {displayItem.signatureStatus ? (
          <Badge variant="outline" className="rounded-md capitalize">
            {displayItem.signatureStatus.replaceAll("_", " ")}
          </Badge>
        ) : null}
      </div>
      <h3 className="mt-3 font-semibold text-slate-950">{displayItem.clientName}</h3>
      <p className="mt-1 text-sm text-slate-500">
        {displayItem.projectType} / ${displayItem.packetValue.toLocaleString()} / deposit ${displayItem.depositRequired.toLocaleString()}
      </p>
      <Progress value={completion} className="mt-4" />
      <p className="mt-2 text-xs text-slate-500">{completion}% link readiness / {displayItem.milestoneCount} milestones</p>
      <p className="mt-3 text-sm leading-6 text-slate-700">{displayItem.nextAction}</p>

      <div className="mt-4 grid gap-3 rounded-md border border-slate-200 bg-white p-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Scope summary</p>
          <p className="mt-1 text-sm leading-6 text-slate-700">{displayItem.scopeSummary}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Included work</p>
            <p className="mt-1 line-clamp-4 text-sm leading-6 text-slate-700">{displayItem.includedWork}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Payment terms</p>
            <p className="mt-1 line-clamp-4 text-sm leading-6 text-slate-700">{displayItem.paymentTerms}</p>
          </div>
        </div>
        {milestones.length > 0 ? (
          <div className="grid gap-2">
            <p className="text-xs font-semibold uppercase text-slate-500">Milestones</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {milestones.slice(0, 4).map((milestone) => (
                <div key={milestone.id} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                  <p className="font-semibold text-slate-950">{milestone.label}</p>
                  <p className="mt-1">${milestone.amount.toLocaleString()} {milestone.due ? `/ ${milestone.due}` : ""}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
        <div className="grid gap-2 sm:grid-cols-2">
          <span>Client invite: {displayItem.clientInviteStatus?.replaceAll("_", " ") ?? "not invited"}</span>
          <span>Share status: {displayItem.shareStatus?.replaceAll("_", " ") ?? "draft"}</span>
          <span>Client contact: {displayItem.clientEmailMasked ?? "not added"}</span>
          <span>Payment mode: {displayItem.paymentMode?.replaceAll("_", " ") ?? "none"}</span>
          <span>Signed record: {displayItem.signedRecordAt ? new Date(displayItem.signedRecordAt).toLocaleDateString() : "not signed"}</span>
          <span>Signed digest: {signedDigestLabel ?? "pending"}</span>
        </div>
        {displayItem.paymentSummary ? <p>{displayItem.paymentSummary}</p> : null}
        {shareUrl ? (
          <div className="flex flex-col gap-2 rounded-md border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="truncate font-medium text-slate-950">{shareUrlLabel}</span>
            <Button asChild size="sm" variant="outline">
              <Link href={shareUrl} target="_blank" rel="noreferrer">
                <Link2 aria-hidden="true" />
                Open link
              </Link>
            </Button>
          </div>
        ) : (
          <p className="rounded-md border border-dashed border-slate-300 bg-white p-3">
            Add the client email below to prepare a private signing link.
          </p>
        )}
      </div>

      <form action={shareAction} className="mt-3 grid gap-2 rounded-md border border-slate-200 bg-white p-3">
        <input type="hidden" name="packetId" value={displayItem.id} />
        <div className="grid gap-2 sm:grid-cols-[1fr_170px]">
          <Input name="clientEmail" type="email" placeholder="Client email for signing link" />
          <select name="paymentMode" defaultValue={displayItem.paymentMode ?? "none"} className="h-10 rounded-md border border-input bg-white px-3 text-sm">
            <option value="none">No payment request</option>
            <option value="deposit_request">Deposit request</option>
            <option value="milestone_schedule">Milestone schedule</option>
            <option value="platform_review">Payment review</option>
          </select>
        </div>
        <Textarea name="clientMessage" placeholder="Short note shown with the private signing link" className="min-h-16" />
        <Textarea name="paymentSummary" placeholder="Deposit, milestone, or payment coordination note" defaultValue={displayItem.paymentSummary} className="min-h-16" />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <Checkbox name="inviteClient" defaultChecked={displayItem.clientInviteStatus === "invited" || displayItem.clientInviteStatus === "joined"} />
          Invite client to join this contract workspace
        </label>
        <PendingSubmitButton pendingText="Preparing..." className="bg-slate-950 text-white hover:bg-slate-800">
          <Send aria-hidden="true" />
          Prepare signing link
        </PendingSubmitButton>
        <FieldError name="clientEmail" errors={shareState.ok ? undefined : shareState.fieldErrors} />
      </form>

      <form action={statusAction} className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
        <input type="hidden" name="packetId" value={displayItem.id} />
        <select name="status" defaultValue={displayItem.status} className="h-10 rounded-md border border-input bg-white px-3 text-sm">
          <option value="draft">Draft</option>
          <option value="review_ready">Review ready</option>
          <option value="sent">Sent</option>
          <option value="signed">Signed</option>
          <option value="expired">Expired</option>
          <option value="archived">Archived</option>
        </select>
        <PendingSubmitButton pendingText="Saving..." variant="outline">
          Update
        </PendingSubmitButton>
      </form>
    </div>
  )
}

function EvidenceVaultCard({ item }: { item: EvidenceVaultItem }) {
  const [state, action] = useActionState(updateEvidenceVaultStatusAction, evidenceVaultState)

  useToastState(state)

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="rounded-md capitalize">{item.fileCategory}</Badge>
        <Badge variant="secondary" className="rounded-md capitalize">{item.status.replaceAll("_", " ")}</Badge>
      </div>
      <h3 className="mt-3 font-semibold text-slate-950">{item.label}</h3>
      <p className="mt-1 text-sm text-slate-500">{item.clientName}</p>
      <p className="mt-3 text-sm leading-6 text-slate-700">{item.publicSummary}</p>
      <p className="mt-2 text-xs text-slate-500">
        Private storage path is hidden from public pages. Uploaded {new Date(item.uploadedAt).toLocaleDateString()}.
      </p>
      <form action={action} className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
        <input type="hidden" name="evidenceId" value={item.id} />
        <select name="status" defaultValue={item.status} className="h-10 rounded-md border border-input bg-white px-3 text-sm">
          <option value="uploaded">Uploaded</option>
          <option value="mapped">Mapped</option>
          <option value="review_pending">Review pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="needs_more_info">Needs more info</option>
          <option value="archived">Archived</option>
        </select>
        <PendingSubmitButton pendingText="Saving..." variant="outline">
          Update
        </PendingSubmitButton>
      </form>
    </div>
  )
}

function RiskMetric({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: number
  helper: string
  tone: "slate" | "amber" | "emerald" | "rose"
}) {
  const toneClass = {
    slate: "border-slate-200 bg-white text-slate-950",
    amber: "border-amber-200 bg-amber-50 text-amber-950",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-950",
    rose: "border-rose-200 bg-rose-50 text-rose-950",
  }[tone]

  return (
    <div className={cn("rounded-md border p-4 shadow-sm", toneClass)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase opacity-70">{label}</p>
        {tone === "rose" || tone === "amber" ? <AlertTriangle className="size-4 opacity-70" aria-hidden="true" /> : null}
      </div>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-xs opacity-70">{helper}</p>
    </div>
  )
}

function BillingMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold capitalize text-slate-950">{value}</p>
    </div>
  )
}

function BillingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-slate-200 bg-slate-50 p-3">
      <span className="font-semibold text-slate-950">{label}</span>
      <span className="max-w-56 text-right text-slate-600">{value}</span>
    </div>
  )
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-white p-4 text-sm">
      <p className="font-semibold text-slate-950">{title}</p>
      <p className="mt-1 leading-6 text-slate-600">{text}</p>
    </div>
  )
}

function priorityClass(priority: string) {
  if (priority === "urgent") return "bg-rose-700"
  if (priority === "high") return "bg-amber-700"
  if (priority === "low") return "bg-slate-500"

  return "bg-slate-950"
}

function useToastState<T>(state: ActionResult<T>) {
  useEffect(() => {
    if (state.message) toast[state.ok ? "success" : "error"](state.message)
  }, [state])
}
