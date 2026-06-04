"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useActionState, useEffect, useMemo } from "react"
import {
  AlertTriangle,
  BellRing,
  ClipboardCheck,
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
import { PendingSubmitButton } from "@/components/forms/pending-submit-button"
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
  createLienNoticeDraftAction,
  createPaymentRecoveryCaseAction,
  createPaymentPlanAction,
  createRiskRoomAction,
  createWatchlistItemAction,
  deleteReportDraftAction,
  logPaymentRecoveryAttemptAction,
  saveReportDraftAction,
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
  ClientIntakeAssessment,
  ClientPipelineItem,
  ClientProfile,
  ClientRiskRoom,
  ContractPacket,
  ContractWorkspaceItem,
  ContractorRiskOpsData,
  ContractorWatchlistItem,
  EvidenceVaultItem,
  LienNoticeDraft,
  PaymentPlan,
  PaymentRecoveryCase,
  PaymentRecoveryAttempt,
  ReportDraft,
  WatchlistAlert,
} from "@/lib/types"
import { cn } from "@/lib/utils"

const watchState: ActionResult<ContractorWatchlistItem> = { ok: false, message: "" }
const draftState: ActionResult<ReportDraft> = { ok: false, message: "" }
const deleteDraftState: ActionResult<AuditLogEntry | boolean> = { ok: false, message: "" }
const intakeState: ActionResult<ClientIntakeAssessment> = { ok: false, message: "" }
const recoveryState: ActionResult<PaymentRecoveryCase> = { ok: false, message: "" }
const lienNoticeState: ActionResult<LienNoticeDraft> = { ok: false, message: "" }
const contractState: ActionResult<ContractWorkspaceItem> = { ok: false, message: "" }
const pipelineState: ActionResult<ClientPipelineItem> = { ok: false, message: "" }
const riskRoomState: ActionResult<ClientRiskRoom> = { ok: false, message: "" }
const recoveryAttemptState: ActionResult<PaymentRecoveryAttempt> = { ok: false, message: "" }
const paymentPlanState: ActionResult<PaymentPlan> = { ok: false, message: "" }
const contractPacketState: ActionResult<ContractPacket> = { ok: false, message: "" }
const contractShareState: ActionResult<ContractPacket> = { ok: false, message: "" }
const evidenceVaultState: ActionResult<EvidenceVaultItem> = { ok: false, message: "" }
const workspaceTabs = new Set([
  "overview",
  "pipeline",
  "watchlist",
  "alerts",
  "reports",
  "evidence",
  "recovery",
  "lien-readiness",
  "contracts",
  "account",
  "activity",
])

function normalizeWorkspaceTab(value: string | null) {
  const aliases: Record<string, string> = {
    payment: "recovery",
    "payment-recovery": "recovery",
    lien: "lien-readiness",
    "notice-readiness": "lien-readiness",
  }
  const normalized = value ? aliases[value] ?? value : null

  return normalized && workspaceTabs.has(normalized) ? normalized : "overview"
}

export function RiskOpsWorkspace({
  riskOps,
  clients,
}: {
  riskOps: ContractorRiskOpsData
  clients: ClientProfile[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTab = normalizeWorkspaceTab(searchParams.get("workspace"))
  const updateWorkspaceTab = (tab: string) => {
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
  const openRecoveryCases = countOpenRecoveryCases(riskOps.paymentRecoveryCases)
  const lienDraftsRequiringReview = riskOps.lienNoticeDrafts.filter((item) => item.requiredReview).length
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

  return (
    <div className="space-y-6">
      <ContractorWorkspaceGuidance onOpenTab={updateWorkspaceTab} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-8">
        <RiskMetric label="Today" value={todaysWork.length} helper="Next best actions" tone="slate" />
        <RiskMetric label="Pipeline" value={openPipelineItems} helper="Open client records" tone="slate" />
        <RiskMetric label="Watchlist alerts" value={activeAlertCount + unreadMonitoringAlerts} helper="Monitoring changes" tone="amber" />
        <RiskMetric label="Ready drafts" value={readyDrafts} helper="Reports close to submission" tone="emerald" />
        <RiskMetric label="Evidence review" value={evidenceNeedingReview} helper="Files needing attention" tone="rose" />
        <RiskMetric label="Payment follow-up" value={openRecoveryCases} helper="Open private records" tone="amber" />
        <RiskMetric label="Lien readiness" value={lienDraftsRequiringReview} helper="Review-gated checklists" tone="rose" />
        <RiskMetric label="Contracts" value={openContractPackets} helper="Client signing links" tone="emerald" />
      </div>

      <Tabs value={activeTab} onValueChange={updateWorkspaceTab} className="space-y-5">
        <div className="overflow-x-auto rounded-md border border-slate-200 bg-white p-1 shadow-sm">
          <TabsList className="h-auto w-max min-w-full justify-start gap-1 bg-transparent p-0">
            <TabsTrigger value="overview" className="px-3 py-2">Overview</TabsTrigger>
            <TabsTrigger value="pipeline" className="px-3 py-2">Pipeline</TabsTrigger>
            <TabsTrigger value="watchlist" className="px-3 py-2">Watchlist</TabsTrigger>
            <TabsTrigger value="alerts" className="px-3 py-2">Alerts</TabsTrigger>
            <TabsTrigger value="reports" className="px-3 py-2">Reports</TabsTrigger>
            <TabsTrigger value="evidence" className="px-3 py-2">Evidence Vault</TabsTrigger>
            <TabsTrigger value="recovery" className="px-3 py-2">Payment Recovery</TabsTrigger>
            <TabsTrigger value="lien-readiness" className="px-3 py-2">Lien Readiness</TabsTrigger>
            <TabsTrigger value="contracts" className="px-3 py-2">Contracts</TabsTrigger>
            <TabsTrigger value="account" className="px-3 py-2">Account</TabsTrigger>
            <TabsTrigger value="activity" className="px-3 py-2">Timeline</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-5">
          <WorkspaceIntro
            title="Today's work"
            text="A short work queue for urgent client signals, report drafts, payment follow-up, evidence review, and contract signing links."
          />
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
                Client Work Files
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
                        title="No client work files yet"
                        text="Create one private file per important client to group searches, reports, evidence, recovery notes, and contract signing links."
                      />
                    ) : null}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-5">
          <WorkspaceIntro
            title="Client pipeline"
            text="Track leads from first search through screening, contract, active work, payment follow-up, and closeout."
          />
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
          <WorkspaceIntro
            title="Search, watch, and assess before scheduling"
            text="Use this workspace before accepting new work, approving change orders, or committing crew time."
          />
          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Radar className="size-5 text-amber-700" aria-hidden="true" />
              Client watchlist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <WatchlistCreateForm clients={clients} />
            <div className="grid gap-3">
              {rankedWatchlist.map((item) => (
                <WatchlistCard key={item.id} item={item} client={clients.find((client) => client.id === item.clientId)} />
              ))}
              {rankedWatchlist.length === 0 ? (
                <EmptyState
                  title="No watched clients yet"
                  text="Watch a client profile to track new reports, response context, dispute changes, resolved cases, and score movement."
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
            <IntakeAssessmentForm />
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
          <WorkspaceIntro
            title="Monitoring alerts"
            text="Review watched-client changes, dispute updates, resolved-case signals, and score movement without digging through every tool."
          />
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
          <WorkspaceIntro
            title="Payment recovery"
            text="Create documented outreach, call logs, payment-plan records, and resolution tracking. This is a private workflow for factual follow-up, not automated collection."
          />
          <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-xl">
              <PhoneCall className="size-5 text-amber-700" aria-hidden="true" />
              Payment recovery center
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 p-5 lg:grid-cols-[0.9fr_1.1fr]">
            <PaymentRecoveryForm />
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
            <RecoveryAttemptForm cases={riskOps.paymentRecoveryCases} />
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
            <PaymentPlanForm cases={riskOps.paymentRecoveryCases} />
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
          <WorkspaceIntro
            title="Lien readiness"
            text="Track deadlines, contract context, invoice history, and supporting documents in a private review-gated checklist before any sensitive notice is considered."
          />
          <div className="grid gap-3 md:grid-cols-3">
            <ToolExplainer
              title="What this does"
              text="Organizes the facts a contractor may need to review deadlines, required documents, and project context."
            />
            <ToolExplainer
              title="Review required"
              text="Readiness records are private and should be reviewed for state, project, and contract requirements before action."
            />
            <ToolExplainer
              title="What stays private"
              text="Client contact details, property addresses, uploaded files, and internal notes are not shown on public profiles."
            />
          </div>
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Landmark className="size-5 text-amber-700" aria-hidden="true" />
                Lien readiness checklists
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 p-5 lg:grid-cols-[0.9fr_1.1fr]">
              <LienNoticeDraftForm />
              <div className="space-y-3">
                {riskOps.lienNoticeDrafts.map((item) => (
                  <LienNoticeCard key={item.id} item={item} />
                ))}
                {riskOps.lienNoticeDrafts.length === 0 ? (
                  <EmptyState
                    title="No readiness checklists yet"
                    text="Create a private checklist to track deadline review, contract context, evidence, and state-specific notice checks."
                  />
                ) : null}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-5">
          <WorkspaceIntro
            title="Contracts and client signing links"
            text="Create private agreement links clients can review and sign, invite the client into the workflow, and track signature plus payment timing before work starts."
          />
          <div className="grid gap-3 md:grid-cols-3">
            <ToolExplainer
              title="What this does"
              text="Contract links give the client a private review page for scope, price, deposit, milestones, and electronic signature."
            />
            <ToolExplainer
              title="What it does not do yet"
              text="Client Bureau does not automatically hold funds, place calls, file liens, or send legal notices from this workflow."
            />
            <ToolExplainer
              title="Future payment path"
              text="Deposit and milestone coordination is staged here so a reviewed payment layer can be added cleanly later."
            />
          </div>
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
          <ContractWorkspaceForm />
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
              <ContractPacketForm />
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
          <WorkspaceIntro
            title="Reports, evidence, and submission readiness"
            text="Continue report drafts, check evidence review, and follow the next recommended documentation step."
          />
          <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="size-5 text-amber-700" aria-hidden="true" />
              Report draft control
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 p-5 lg:grid-cols-[0.95fr_1.05fr]">
            <ReportDraftForm clients={clients} />
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
                Evidence status center
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
          <WorkspaceIntro
            title="Private evidence vault"
            text="Track invoices, screenshots, contracts, photos, and PDFs as private operational records. Public pages only show evidence summaries."
          />
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Vault className="size-5 text-amber-700" aria-hidden="true" />
                Evidence vault
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
          <WorkspaceIntro
            title="Account controls and safeguards"
            text="Keep verification, security, privacy, and workflow readiness in one compact place."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Business verification", "Pending/verified profile status keeps report context accountable."],
              ["Private matching", "Phone and email checks remain hashed and never appear on public pages."],
              ["2FA-ready sign-in", "The account model is ready for stronger authentication prompts."],
              ["Compliance gates", "Recovery, lien, and contract workflows stay private until reviewed."],
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

        <TabsContent value="activity" className="space-y-5">
          <WorkspaceIntro
            title="Recent workspace activity"
            text="Use this timeline to confirm recent reports, saved searches, approvals, evidence changes, and resolution work."
          />
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

function WorkspaceIntro({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase text-amber-700">Workspace</p>
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
      <div className="grid gap-3 sm:grid-cols-[1fr_80px]">
        <Input name="city" placeholder="City" />
        <Input name="state" placeholder="FL" className="uppercase" />
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
      <div className="grid gap-3 sm:grid-cols-[1fr_80px]">
        <Input name="city" placeholder="City" />
        <Input name="state" placeholder="FL" className="uppercase" />
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
      <div className="grid gap-3 sm:grid-cols-[1fr_110px_90px]">
        <Input name="clientName" placeholder="Client name" />
        <Input name="city" placeholder="City" />
        <Input name="state" placeholder="FL" className="uppercase" />
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

function ReportDraftForm({ clients }: { clients: ClientProfile[] }) {
  const [state, action] = useActionState(saveReportDraftAction, draftState)

  useToastState(state)

  return (
    <form action={action} className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
      <select name="clientId" className="h-10 rounded-md border border-input bg-white px-3 text-sm">
        <option value="">No matched profile yet</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.firstName} {client.lastName}
          </option>
        ))}
      </select>
      <Input name="clientName" placeholder="Client name" />
      <Input name="projectType" placeholder="Project type" />
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

function PaymentRecoveryForm() {
  const [state, action] = useActionState(createPaymentRecoveryCaseAction, recoveryState)

  useToastState(state)

  return (
    <form action={action} className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_100px_80px]">
        <Input name="clientName" placeholder="Client name" />
        <Input name="city" placeholder="City" />
        <Input name="state" placeholder="FL" className="uppercase" />
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

function LienNoticeDraftForm() {
  const [state, action] = useActionState(createLienNoticeDraftAction, lienNoticeState)

  useToastState(state)

  return (
    <form action={action} className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
      <Input name="clientName" placeholder="Client name" />
      <Input name="projectType" placeholder="Project type" />
      <div className="grid gap-3 sm:grid-cols-[1fr_80px]">
        <Input name="propertyCity" placeholder="Property city" />
        <Input name="state" placeholder="FL" className="uppercase" />
      </div>
      <Input name="amountDue" type="number" placeholder="Amount due" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="lastWorkDate" type="date" aria-label="Last work date" />
        <Input name="targetSendDate" type="date" aria-label="Target send date" />
      </div>
      <label className="flex items-start gap-2 text-sm leading-6 text-slate-700">
        <Checkbox name="reviewCertification" className="mt-1" />
        State-specific notice requirements will be reviewed before any notice is sent.
      </label>
      <PendingSubmitButton pendingText="Creating..." className="bg-slate-950 text-white hover:bg-slate-800">
        <Landmark aria-hidden="true" />
        Create readiness checklist
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

function ContractWorkspaceForm() {
  const [state, action] = useActionState(createContractWorkspaceItemAction, contractState)

  useToastState(state)

  return (
    <form action={action} className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
      <Input name="clientName" placeholder="Client name" />
      <Input name="projectType" placeholder="Project type" />
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

function ContractPacketForm() {
  const [state, action] = useActionState(createContractPacketAction, contractPacketState)

  useToastState(state)

  return (
    <form action={action} className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
      <Input name="clientName" placeholder="Client name" />
      <Input name="projectType" placeholder="Project type" />
      <select name="templateType" defaultValue="service_agreement" className="h-10 rounded-md border border-input bg-white px-3 text-sm">
        <option value="service_agreement">Service agreement</option>
        <option value="change_order">Change order</option>
        <option value="payment_plan">Payment plan</option>
        <option value="completion_certificate">Completion certificate</option>
        <option value="notice_of_nonpayment">Notice of non-payment</option>
      </select>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="packetValue" type="number" placeholder="Agreement value" />
        <Input name="depositRequired" type="number" placeholder="Deposit required" />
      </div>
      <Input name="milestoneCount" type="number" placeholder="Milestone count" />
      <Textarea name="nextAction" placeholder="Next contract action before scheduling" className="min-h-20" />
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <Checkbox name="requiredBeforeScheduling" />
        Required before scheduling
      </label>
      <PendingSubmitButton pendingText="Creating..." className="bg-slate-950 text-white hover:bg-slate-800">
        <Signature aria-hidden="true" />
        Create signing link
      </PendingSubmitButton>
      <FieldError name="depositRequired" errors={state.ok ? undefined : state.fieldErrors} />
    </form>
  )
}

function ContractPacketCard({ item }: { item: ContractPacket }) {
  const [statusState, statusAction] = useActionState(updateContractPacketStatusAction, contractPacketState)
  const [shareState, shareAction] = useActionState(createContractShareLinkAction, contractShareState)
  const displayItem = shareState.ok ? shareState.data : statusState.ok ? statusState.data : item
  const completion = contractPacketCompletionPercentage(displayItem)
  const shareUrl = displayItem.shareUrl
  const shareUrlLabel = shareUrl?.startsWith("/") ? shareUrl : shareUrl?.replace(/^https?:\/\//, "")

  useToastState(statusState)
  useToastState(shareState)

  return (
    <div className="rounded-md border border-slate-200 p-4">
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

      <div className="mt-4 grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
        <div className="grid gap-2 sm:grid-cols-2">
          <span>Client invite: {displayItem.clientInviteStatus?.replaceAll("_", " ") ?? "not invited"}</span>
          <span>Share status: {displayItem.shareStatus?.replaceAll("_", " ") ?? "draft"}</span>
          <span>Client contact: {displayItem.clientEmailMasked ?? "not added"}</span>
          <span>Payment mode: {displayItem.paymentMode?.replaceAll("_", " ") ?? "none"}</span>
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
