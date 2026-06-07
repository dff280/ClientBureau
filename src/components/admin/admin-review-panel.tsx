"use client"

import Link from "next/link"
import { useActionState, useCallback, useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Inbox,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

import { AdminDecisionPanel } from "@/components/admin/admin-crm-ui"
import { AdminActionTokenInput } from "@/components/admin/admin-action-token-context"
import { FieldError } from "@/components/forms/field-error"
import { PendingSubmitButton } from "@/components/forms/pending-submit-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { bulkReviewReportsAction, reviewReportAction } from "@/lib/actions/client-bureau"
import type {
  ActionResult,
  AdminReview,
  ClientProfile,
  ClientReport,
  ReportEvidence,
  ReviewChecklistItem,
} from "@/lib/types"
import { cn } from "@/lib/utils"

export interface AdminReviewItem {
  review: AdminReview
  report?: ClientReport
  client?: ClientProfile
  evidence: ReportEvidence[]
  checklist: ReviewChecklistItem[]
}

type ReviewFilter = "needs_review" | "published" | "rejected" | "all"

const initialReviewState: ActionResult<AdminReview> = {
  ok: false,
  message: "",
}

const initialBulkState: ActionResult<{ updated: AdminReview[]; deletedIds: string[] }> = {
  ok: false,
  message: "",
}

const filters: { id: ReviewFilter; label: string }[] = [
  { id: "needs_review", label: "Needs review" },
  { id: "published", label: "Published" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All" },
]

function statusLabel(status: AdminReview["status"]) {
  if (status === "needs_dispute_review") return "Dispute review"
  return status
}

function reviewPriority(item: AdminReviewItem) {
  if (item.review.status === "queued") return "Ready"
  if (item.review.status === "needs_dispute_review") return "Dispute"
  if (item.review.status === "approved") return "Published"
  return "Closed"
}

function filterReview(item: AdminReviewItem, filter: ReviewFilter) {
  if (filter === "all") return true
  if (filter === "needs_review") return ["queued", "needs_dispute_review"].includes(item.review.status)
  if (filter === "published") return item.review.status === "approved"
  return item.review.status === "rejected"
}

function clientName(item: AdminReviewItem) {
  if (!item.client) return "Client review"
  return `${item.client.firstName} ${item.client.lastName}`
}

function money(value?: number) {
  if (value === undefined) return "Not provided"
  return `$${value.toLocaleString()}`
}

function yesNo(value?: boolean) {
  if (value === true) return "Yes"
  if (value === false) return "No"
  return "Not provided"
}

function dateRange(start?: string, end?: string) {
  if (!start && !end) return "Not provided"
  if (start && end) return `${new Date(start).toLocaleDateString()} to ${new Date(end).toLocaleDateString()}`
  return start ? `Started ${new Date(start).toLocaleDateString()}` : `Completed ${new Date(end ?? "").toLocaleDateString()}`
}

export function AdminReviewPanel({ items }: { items: AdminReviewItem[] }) {
  const [filter, setFilter] = useState<ReviewFilter>("needs_review")
  const [localStatuses, setLocalStatuses] = useState<Record<string, AdminReview["status"]>>({})
  const [deletedReportIds, setDeletedReportIds] = useState<string[]>([])
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([])
  const displayItems = useMemo(
    () =>
      items
        .filter((item) => !deletedReportIds.includes(item.review.reportId))
        .map((item) => ({
          ...item,
          review: {
            ...item.review,
            status: localStatuses[item.review.reportId] ?? item.review.status,
          },
        })),
    [deletedReportIds, items, localStatuses],
  )
  const visibleItems = useMemo(
    () => displayItems.filter((item) => filterReview(item, filter)),
    [displayItems, filter],
  )
  const [selectedId, setSelectedId] = useState(visibleItems[0]?.review.id ?? displayItems[0]?.review.id ?? "")
  const selectedItem =
    visibleItems.find((item) => item.review.id === selectedId) ?? visibleItems[0] ?? displayItems[0]

  const counts = useMemo(
    () => ({
      needsReview: displayItems.filter((item) => filterReview(item, "needs_review")).length,
      published: displayItems.filter((item) => item.review.status === "approved").length,
      rejected: displayItems.filter((item) => item.review.status === "rejected").length,
      evidence: displayItems.filter((item) => item.evidence.length > 0).length,
    }),
    [displayItems],
  )
  const selectedCsv = selectedReportIds.join(",")
  const markReportStatus = useCallback((reportId: string, status: AdminReview["status"]) => {
    setLocalStatuses((current) => ({ ...current, [reportId]: status }))
    setSelectedReportIds((current) => current.filter((id) => id !== reportId))
  }, [])
  const markBulkResult = useCallback((result: { updated: AdminReview[]; deletedIds: string[] }) => {
    if (result.deletedIds.length > 0) {
      setDeletedReportIds((current) => [...new Set([...current, ...result.deletedIds])])
      setSelectedReportIds((current) => current.filter((id) => !result.deletedIds.includes(id)))
    }

    if (result.updated.length > 0) {
      setLocalStatuses((current) => ({
        ...current,
        ...Object.fromEntries(result.updated.map((review) => [review.reportId, review.status])),
      }))
      setSelectedReportIds((current) =>
        current.filter((id) => !result.updated.some((review) => review.reportId === id)),
      )
    }
  }, [])

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Needs review" value={counts.needsReview} tone="amber" />
        <Metric label="Evidence attached" value={counts.evidence} tone="slate" />
        <Metric label="Published" value={counts.published} tone="emerald" />
        <Metric label="Rejected" value={counts.rejected} tone="rose" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <section className="rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-950">Moderation queue</h2>
                <p className="mt-1 text-xs text-slate-500">{visibleItems.length} records in view</p>
              </div>
              <Badge variant="outline" className="rounded-md">
                Admin only
              </Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {filters.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  size="sm"
                  variant={filter === item.id ? "default" : "outline"}
                  className={cn(filter === item.id && "bg-slate-950 text-white hover:bg-slate-800")}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          <BulkModerationBar selectedCsv={selectedCsv} selectedCount={selectedReportIds.length} onComplete={markBulkResult} />

          <div className="max-h-[calc(100vh-310px)] min-h-72 overflow-y-auto p-2">
            {visibleItems.length > 0 ? (
              <div className="space-y-2">
                {visibleItems.map((item) => (
                  <QueueButton
                    key={item.review.id}
                    item={item}
                    selected={selectedItem?.review.id === item.review.id}
                    checked={selectedReportIds.includes(item.review.reportId)}
                    onCheckedChange={(checked) => {
                      setSelectedReportIds((current) =>
                        checked
                          ? [...new Set([...current, item.review.reportId])]
                          : current.filter((id) => id !== item.review.reportId),
                      )
                    }}
                    onSelect={() => setSelectedId(item.review.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="grid place-items-center gap-3 px-6 py-12 text-center">
                <div className="flex size-12 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                  <Inbox className="size-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-950">No reports here.</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Switch filters or wait for the next contractor submission.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {selectedItem ? (
          <ModerationWorkspace
            key={selectedItem.review.id}
            item={selectedItem}
            onResolved={(status) => markReportStatus(selectedItem.review.reportId, status)}
          />
        ) : (
          <section className="rounded-md border border-slate-200 bg-white p-10 text-center shadow-sm">
            <Inbox className="mx-auto size-10 text-slate-400" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-semibold text-slate-950">No review selected.</h2>
            <p className="mt-2 text-sm text-slate-600">Select a queue item to begin moderation.</p>
          </section>
        )}
      </div>
    </div>
  )
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: "amber" | "slate" | "emerald" | "rose"
}) {
  const toneClass = {
    amber: "border-amber-200 bg-amber-50 text-amber-950",
    slate: "border-slate-200 bg-white text-slate-950",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-950",
    rose: "border-rose-200 bg-rose-50 text-rose-950",
  }[tone]

  return (
    <div className={cn("rounded-md border p-4 shadow-sm", toneClass)}>
      <p className="text-xs font-semibold uppercase opacity-70">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  )
}

function QueueButton({
  item,
  selected,
  checked,
  onCheckedChange,
  onSelect,
}: {
  item: AdminReviewItem
  selected: boolean
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  onSelect: () => void
}) {
  const report = item.report
  const status = item.review.status

  return (
    <div
      className={cn(
        "grid grid-cols-[auto_1fr] gap-2 rounded-md border p-2 transition",
        selected
          ? "border-slate-950 bg-slate-950 text-white"
          : "border-slate-200 bg-white text-slate-950 hover:border-slate-300 hover:bg-slate-50",
      )}
    >
      <Checkbox
        aria-label={`Select ${clientName(item)}`}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="mt-1"
      />
      <button type="button" onClick={onSelect} className="min-w-0 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{clientName(item)}</p>
            <p className={cn("mt-1 truncate text-xs", selected ? "text-slate-300" : "text-slate-500")}>
              {report?.reportCategory ?? "Uncategorized"} / {report?.projectCity ?? "Project city"}
            </p>
          </div>
          <span
            className={cn(
              "rounded-md border px-2 py-1 text-[11px] font-semibold uppercase",
              selected ? "border-white/20 text-white" : "border-slate-200 text-slate-600",
            )}
          >
            {reviewPriority(item)}
          </span>
        </div>
        <div className={cn("mt-3 flex items-center gap-2 text-xs", selected ? "text-slate-300" : "text-slate-500")}>
          {status === "queued" ? <Clock3 className="size-3.5" aria-hidden="true" /> : null}
          {status === "needs_dispute_review" ? <AlertTriangle className="size-3.5" aria-hidden="true" /> : null}
          {status === "approved" ? <CheckCircle2 className="size-3.5" aria-hidden="true" /> : null}
          {status === "rejected" ? <XCircle className="size-3.5" aria-hidden="true" /> : null}
          <span className="capitalize">{statusLabel(status)}</span>
          <span>/</span>
          <span>{item.evidence.length} evidence files</span>
        </div>
      </button>
    </div>
  )
}

function BulkModerationBar({
  selectedCsv,
  selectedCount,
  onComplete,
}: {
  selectedCsv: string
  selectedCount: number
  onComplete: (result: { updated: AdminReview[]; deletedIds: string[] }) => void
}) {
  const [state, action] = useActionState(bulkReviewReportsAction, initialBulkState)

  useEffect(() => {
    if (state.message) toast[state.ok ? "success" : "error"](state.message)
    if (state.ok) onComplete(state.data)
  }, [onComplete, state])

  return (
    <form action={action} className="border-b border-slate-200 bg-slate-50 p-3">
      <AdminActionTokenInput />
      <input type="hidden" name="reportIds" value={selectedCsv} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase text-slate-500">{selectedCount} selected</p>
        <div className="flex flex-wrap gap-2">
          <PendingSubmitButton
            size="sm"
            name="decision"
            value="approved"
            variant="outline"
            pendingText="Approving..."
            disabled={selectedCount === 0}
          >
            Bulk approve
          </PendingSubmitButton>
          <PendingSubmitButton
            size="sm"
            name="decision"
            value="rejected"
            variant="outline"
            pendingText="Rejecting..."
            disabled={selectedCount === 0}
          >
            Bulk reject
          </PendingSubmitButton>
          <PendingSubmitButton
            size="sm"
            name="decision"
            value="deleted"
            variant="destructive"
            pendingText="Deleting..."
            disabled={selectedCount === 0}
          >
            Delete
          </PendingSubmitButton>
        </div>
      </div>
    </form>
  )
}

function ModerationWorkspace({
  item,
  onResolved,
}: {
  item: AdminReviewItem
  onResolved: (status: AdminReview["status"]) => void
}) {
  const [state, action] = useActionState(reviewReportAction, initialReviewState)
  const report = item.report
  const client = item.client
  const [summary, setSummary] = useState(report?.publicSummary ?? "")
  const currentStatus = state.ok ? state.data.status : item.review.status
  const publicHref = state.ok
    ? state.data.publishedProfileUrl
    : client?.isPublic
      ? `/client/${client.publicSlug}`
      : undefined
  const amountUnpaid = report?.amountUnpaid ?? 0
  const contractAmount = report?.contractAmount ?? 0
  const [moderatorNote, setModeratorNote] = useState(item.review.notes ?? "")
  const needsInfoNote =
    "Needs more information: request clearer identity, evidence, payment timeline, contract terms, or dispute context before this report can be published."

  useEffect(() => {
    if (state.message) toast[state.ok ? "success" : "error"](state.message)
    if (state.ok) {
      onResolved(state.data.status)
    }
  }, [onResolved, state])

  return (
    <section className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-md capitalize">
                {statusLabel(currentStatus)}
              </Badge>
              {report?.status ? (
                <Badge variant="secondary" className="rounded-md capitalize">
                  report {report.status}
                </Badge>
              ) : null}
            </div>
            <h2 className="text-2xl font-semibold text-slate-950">{clientName(item)}</h2>
            <p className="text-sm leading-6 text-slate-600">
              {report?.reportCategory ?? "Report category"} / {report?.paymentStatus ?? "Payment status"}
            </p>
          </div>
          {publicHref ? (
            <Button asChild variant="outline">
              <Link href={publicHref} target="_blank">
                <ExternalLink aria-hidden="true" />
                Public profile
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <form action={action} className="grid gap-0 xl:grid-cols-[1fr_340px]">
        <AdminActionTokenInput />
        <input type="hidden" name="reportId" value={report?.id ?? item.review.reportId} />

        <div className="space-y-6 p-5">
          {state.message ? (
            <Alert
              variant={state.ok ? "default" : "destructive"}
              className={state.ok ? "rounded-md border-emerald-200 bg-emerald-50 text-emerald-950" : "rounded-md"}
            >
              {state.ok ? <CheckCircle2 className="size-4" aria-hidden="true" /> : null}
              <AlertTitle>{state.ok ? "Moderation saved" : "Moderation needs attention"}</AlertTitle>
              <AlertDescription className="space-y-2">
                <span>{state.message}</span>
                {state.ok && state.data.publishedProfileUrl ? (
                  <Link
                    href={state.data.publishedProfileUrl}
                    target="_blank"
                    className="block font-semibold underline underline-offset-4"
                  >
                    Open published public profile
                  </Link>
                ) : null}
              </AlertDescription>
            </Alert>
          ) : null}

          <WorkflowSection
            step="1"
            title="Identity and project facts"
            description="Confirm the report belongs to the intended public client profile."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <Fact icon={<UserRound className="size-4" />} label="Client" value={clientName(item)} />
              <Fact label="Location" value={client ? `${client.city}, ${client.state}` : "Unknown"} />
              <Fact label="Project type" value={report?.projectType ?? "Unknown"} />
              <Fact label="Project location" value={report ? `${report.projectCity}, ${report.projectState}` : "Unknown"} />
              <Fact label="Contract amount" value={`$${contractAmount.toLocaleString()}`} />
              <Fact label="Amount unpaid" value={`$${amountUnpaid.toLocaleString()}`} />
              <Fact label="Client type" value={report?.clientType ?? "Not provided"} />
              <Fact label="Trade / service" value={report?.tradeCategory ?? "Not provided"} />
              <Fact label="Job type" value={report?.jobType ?? "Not provided"} />
              <Fact label="Job status" value={report?.jobStatus ?? "Not provided"} />
              <Fact label="Project dates" value={dateRange(report?.jobStartDate, report?.jobCompletionDate)} />
              <Fact label="Private job address" value={report?.clientJobAddressPrivate ? "Captured privately" : "Not provided"} />
            </div>
          </WorkflowSection>

          <WorkflowSection
            step="2"
            title="Contractor statement"
            description="Review the private detail and keep the public version limited to supportable context."
          >
            <div className="grid gap-4">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Contractor summary</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {report?.reportSummary ?? "No report summary available."}
                </p>
              </div>
              <div className="rounded-md border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Detailed moderator note</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {report?.detailedExperience ?? "No detailed experience available."}
                </p>
              </div>
              {report?.detailedTimelinePrivate ? (
                <div className="rounded-md border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase text-slate-500">Structured private timeline</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                    {report.detailedTimelinePrivate}
                  </p>
                </div>
              ) : null}
              <div className="grid gap-3 md:grid-cols-3">
                <Fact label="Signed contract" value={yesNo(report?.signedContract)} />
                <Fact label="Written change order" value={yesNo(report?.writtenChangeOrder)} />
                <Fact label="Deposit requested" value={money(report?.depositRequested)} />
                <Fact label="Deposit paid" value={money(report?.depositPaid)} />
                <Fact label="Final invoice" value={money(report?.finalInvoiceAmount)} />
                <Fact label="Materials purchased" value={money(report?.materialsPurchasedAmount)} />
                <Fact label="Dispute status" value={report?.disputeStatus ?? "Not provided"} />
                <Fact label="Amount disputed" value={money(report?.amountDisputed)} />
                <Fact label="Days overdue" value={report?.daysOverdue === undefined ? "Not provided" : String(report.daysOverdue)} />
                <Fact label="Client responded" value={yesNo(report?.clientResponded)} />
                <Fact label="Issue resolved" value={yesNo(report?.issueResolved)} />
                <Fact label="Evidence confidence" value={report?.evidenceConfidence ?? "Limited"} />
              </div>
              {report?.resolutionSummary ? (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase text-emerald-900">Resolution context</p>
                  <p className="mt-2 text-sm leading-6 text-emerald-950">{report.resolutionSummary}</p>
                </div>
              ) : null}
            </div>
          </WorkflowSection>

          <WorkflowSection
            step="3"
            title="Public summary"
            description="This exact summary appears on the public client page after approval."
          >
            <div className="space-y-3">
              <Textarea
                name="editedPublicSummary"
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                className="min-h-32"
              />
              <FieldError name="editedPublicSummary" errors={state.ok ? undefined : state.fieldErrors} />
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-semibold uppercase text-amber-900">Public preview</p>
                <p className="mt-2 text-sm leading-6 text-amber-950">{summary}</p>
              </div>
            </div>
          </WorkflowSection>
        </div>

        <aside className="border-t border-slate-200 bg-slate-50 p-5 xl:border-l xl:border-t-0">
          <div className="sticky top-5 space-y-5">
            <WorkflowSection
              compact
              step="4"
              title="Evidence"
              description="Files remain admin-only."
            >
              <div className="space-y-2">
                {item.evidence.length > 0 ? (
                  item.evidence.map((evidence) => (
                    <div
                      key={evidence.id}
                      className="flex items-center gap-2 rounded-md border border-slate-200 bg-white p-2 text-xs text-slate-600"
                    >
                      <FileText className="size-3.5" aria-hidden="true" />
                      <span className="truncate">{evidence.fileName}</span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-md border border-dashed border-slate-300 bg-white p-4 text-sm leading-6 text-slate-600">
                    No evidence files are attached.
                  </div>
                )}
              </div>
            </WorkflowSection>

            <AdminDecisionPanel
              title="Safety checklist and decision"
              description="Approve only when the public summary is neutral, supportable, and private-data safe."
            >
              <div className="space-y-3">
                <label className="flex items-start gap-2 text-sm text-slate-700">
                  <Checkbox name="checklistEvidence" defaultChecked={report?.evidenceAttached} />
                  <span>Evidence reviewed</span>
                </label>
                <label className="flex items-start gap-2 text-sm text-slate-700">
                  <Checkbox name="checklistNeutral" />
                  <span>Public summary is neutral and fact-based</span>
                </label>
                <label className="flex items-start gap-2 text-sm text-slate-700">
                  <Checkbox name="checklistPrivate" defaultChecked />
                  <span>Phone and email are not visible publicly</span>
                </label>
                <FieldError name="checklist" errors={state.ok ? undefined : state.fieldErrors} />
                <Textarea
                  name="moderatorNote"
                  value={moderatorNote}
                  onChange={(event) => setModeratorNote(event.target.value)}
                  placeholder="Moderator note or information request"
                  className="min-h-24 bg-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModeratorNote(needsInfoNote)}
                >
                  <AlertTriangle aria-hidden="true" />
                  Use needs-more-info note
                </Button>
                <Separator />
                <div className="grid gap-2">
                  <PendingSubmitButton
                    name="decision"
                    value="approved"
                    pendingText="Publishing..."
                    className="bg-emerald-700 text-white hover:bg-emerald-800"
                    disabled={currentStatus === "approved"}
                  >
                    <ShieldCheck aria-hidden="true" />
                    Approve and publish profile
                  </PendingSubmitButton>
                  <Button
                    type="submit"
                    name="decision"
                    value="rejected"
                    variant="destructive"
                    disabled={currentStatus === "rejected"}
                  >
                    <XCircle aria-hidden="true" />
                    Reject / needs more information
                  </Button>
                </div>
                {state.ok ? (
                  <p className="text-xs leading-5 text-slate-500">{state.data.notes}</p>
                ) : item.review.notes ? (
                  <p className="text-xs leading-5 text-slate-500">{item.review.notes}</p>
                ) : null}
              </div>
            </AdminDecisionPanel>
          </div>
        </aside>
      </form>
    </section>
  )
}

function WorkflowSection({
  step,
  title,
  description,
  children,
  compact = false,
}: {
  step: string
  title: string
  description: string
  children: React.ReactNode
  compact?: boolean
}) {
  return (
    <section className={cn("space-y-3", !compact && "rounded-md border border-slate-200 bg-white p-4")}>
      <div className="flex gap-3">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-slate-950 text-xs font-semibold text-white">
          {step}
        </div>
        <div>
          <h3 className="font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
      </div>
      <div>{children}</div>
    </section>
  )
}

function Fact({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
        {icon}
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  )
}
