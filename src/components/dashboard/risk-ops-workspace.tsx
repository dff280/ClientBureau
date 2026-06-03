"use client"

import Link from "next/link"
import { useActionState, useEffect, useMemo } from "react"
import {
  AlertTriangle,
  BellRing,
  ClipboardCheck,
  FileText,
  Gauge,
  Landmark,
  ListChecks,
  PhoneCall,
  PlusCircle,
  Radar,
  Search,
  Send,
  ShieldCheck,
  Signature,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

import { FieldError } from "@/components/forms/field-error"
import { PendingSubmitButton } from "@/components/forms/pending-submit-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import {
  createContractWorkspaceItemAction,
  createIntakeAssessmentAction,
  createLienNoticeDraftAction,
  createPaymentRecoveryCaseAction,
  createWatchlistItemAction,
  deleteReportDraftAction,
  saveReportDraftAction,
  updateWatchlistItemAction,
} from "@/lib/actions/client-bureau"
import {
  contractCompletionPercentage,
  countOpenRecoveryCases,
  countWatchlistAlerts,
  countUnreadMonitoringAlerts,
  lienNoticeReadinessLabel,
  rankWatchlistItems,
  rankMonitoringAlerts,
  reportDraftCompletionPercentage,
} from "@/lib/platform-features"
import type {
  ActionResult,
  AuditLogEntry,
  ClientIntakeAssessment,
  ClientProfile,
  ContractWorkspaceItem,
  ContractorRiskOpsData,
  ContractorWatchlistItem,
  LienNoticeDraft,
  PaymentRecoveryCase,
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

export function RiskOpsWorkspace({
  riskOps,
  clients,
}: {
  riskOps: ContractorRiskOpsData
  clients: ClientProfile[]
}) {
  const rankedWatchlist = useMemo(
    () => rankWatchlistItems(riskOps.watchlist, clients),
    [clients, riskOps.watchlist],
  )
  const rankedAlerts = useMemo(() => rankMonitoringAlerts(riskOps.watchlistAlerts), [riskOps.watchlistAlerts])
  const activeAlertCount = countWatchlistAlerts(riskOps.watchlist)
  const unreadMonitoringAlerts = countUnreadMonitoringAlerts(riskOps.watchlistAlerts)
  const readyDrafts = riskOps.reportDrafts.filter((draft) => draft.status === "ready_to_submit").length
  const evidenceNeedingReview = riskOps.evidenceSummaries.filter((item) =>
    ["review_pending", "needs_more_info", "missing"].includes(item.status),
  ).length
  const openRecoveryCases = countOpenRecoveryCases(riskOps.paymentRecoveryCases)
  const lienDraftsRequiringReview = riskOps.lienNoticeDrafts.filter((item) => item.requiredReview).length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <RiskMetric label="Watchlist alerts" value={activeAlertCount + unreadMonitoringAlerts} helper="High-priority client signals" tone="amber" />
        <RiskMetric label="Ready drafts" value={readyDrafts} helper="Reports close to submission" tone="emerald" />
        <RiskMetric label="Evidence review" value={evidenceNeedingReview} helper="Files needing attention" tone="rose" />
        <RiskMetric label="Intake reviews" value={riskOps.intakeAssessments.length} helper="Recent pre-contract checks" tone="slate" />
        <RiskMetric label="Recovery cases" value={openRecoveryCases} helper="Open payment follow-up" tone="amber" />
        <RiskMetric label="Notice review" value={lienDraftsRequiringReview} helper="State-specific review" tone="rose" />
      </div>

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
              <Landmark className="size-5 text-amber-700" aria-hidden="true" />
              Lien notice readiness
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
                  title="No notice packets yet"
                  text="Create a private readiness packet to track deadline review, contract context, evidence, and state-specific notice checks."
                />
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-md border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Signature className="size-5 text-amber-700" aria-hidden="true" />
            Contract workspace
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 p-5 xl:grid-cols-[360px_1fr]">
          <ContractWorkspaceForm />
          <div className="grid gap-3 md:grid-cols-2">
            {riskOps.contractDocuments.map((item) => (
              <ContractDocumentCard key={item.id} item={item} />
            ))}
            {riskOps.contractDocuments.length === 0 ? (
              <EmptyState
                title="No contract packets yet"
                text="Create reusable contract packets for scope, deposits, milestones, payment plans, completion records, and change orders."
              />
            ) : null}
          </div>
        </CardContent>
      </Card>

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
                  text="Save a draft when you need time to collect invoice, access, communication, or completion details before submission."
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

      <Card className="rounded-md border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-xl">Recent risk operations activity</CardTitle>
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
        <option value="letter">Letter packet</option>
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
        Create packet
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
        Create contract packet
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
      <p className="mt-2 text-xs text-slate-500">{completion}% packet readiness</p>
      <p className="mt-3 text-sm leading-6 text-slate-700">{item.summary}</p>
      <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
        {item.nextStep}
      </div>
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

function priorityClass(priority: PaymentRecoveryCase["priority"]) {
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
