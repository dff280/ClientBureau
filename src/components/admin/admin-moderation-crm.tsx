"use client"

import { useActionState, useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileText,
  ShieldCheck,
  UserCheck,
} from "lucide-react"
import { toast } from "sonner"

import { AdminActionTokenInput } from "@/components/admin/admin-action-token-context"
import { PendingSubmitButton } from "@/components/forms/pending-submit-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  assignModerationCaseAction,
  setModerationDecisionReasonAction,
  updateModerationCaseAction,
} from "@/lib/actions/client-bureau"
import { filterModerationCases, moderationDecisionReasons } from "@/lib/platform-features"
import type {
  ActionResult,
  AdminModerationCrmData,
  ModerationCase,
  ModerationCaseStatus,
  User,
} from "@/lib/types"
import { cn } from "@/lib/utils"

const caseState: ActionResult<ModerationCase> = { ok: false, message: "" }
const filters: Array<ModerationCaseStatus | "all"> = ["all", "unassigned", "assigned", "escalated", "closed"]

export function AdminModerationCrm({
  data,
  users,
  compact = false,
}: {
  data: AdminModerationCrmData
  users: User[]
  compact?: boolean
}) {
  const [filter, setFilter] = useState<ModerationCaseStatus | "all">("all")
  const visibleCases = useMemo(() => filterModerationCases(data.cases, filter), [data.cases, filter])

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-4">
        {data.workload.map((metric) => (
          <WorkloadMetric key={metric.id} metric={metric} />
        ))}
      </div>

      <Card className="rounded-md border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ShieldCheck className="size-5 text-amber-700" aria-hidden="true" />
                Moderation CRM
              </CardTitle>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Triage queue, reviewer ownership, escalation state, decision reasons, and public-summary preview.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm font-semibold capitalize",
                    filter === item
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-700",
                  )}
                >
                  {item.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 p-5">
          {visibleCases.map((caseItem) => (
            <ModerationCaseCard key={caseItem.id} caseItem={caseItem} users={users} compact={compact} />
          ))}
          {visibleCases.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-600">
              No moderation cases match this queue view.
            </div>
          ) : null}
        </CardContent>
      </Card>

      {!compact ? (
        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="size-5 text-amber-700" aria-hidden="true" />
              Import batch history
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-y border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-4">Batch</th>
                  <th className="p-4">Rows</th>
                  <th className="p-4">Ready</th>
                  <th className="p-4">Duplicates</th>
                  <th className="p-4">Imported</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.importBatches.map((batch) => (
                  <tr key={batch.id} className="border-b border-slate-100">
                    <td className="p-4">
                      <p className="font-semibold text-slate-950">{batch.fileName}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {batch.createdBy} / {new Date(batch.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="p-4 text-slate-600">{batch.totalRows}</td>
                    <td className="p-4 text-slate-600">{batch.readyRows}</td>
                    <td className="p-4 text-slate-600">{batch.duplicateRows}</td>
                    <td className="p-4 text-slate-600">{batch.importedRows}</td>
                    <td className="p-4">
                      <Badge variant="outline" className="rounded-md capitalize">
                        {batch.status.replace("_", " ")}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

function ModerationCaseCard({
  caseItem,
  users,
  compact,
}: {
  caseItem: ModerationCase
  users: User[]
  compact: boolean
}) {
  const [assignState, assignAction] = useActionState(assignModerationCaseAction, caseState)
  const [updateState, updateAction] = useActionState(updateModerationCaseAction, caseState)
  const [reasonState, reasonAction] = useActionState(setModerationDecisionReasonAction, caseState)
  const [nowMs] = useState(() => Date.now())
  const currentCase = reasonState.ok ? reasonState.data : updateState.ok ? updateState.data : assignState.ok ? assignState.data : caseItem
  const overdue = new Date(currentCase.dueAt).getTime() < nowMs

  useToastState(assignState)
  useToastState(updateState)
  useToastState(reasonState)

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cn("rounded-md text-white", priorityClass(currentCase.priority))}>
              {currentCase.priority}
            </Badge>
            <Badge variant="outline" className="rounded-md capitalize">
              {currentCase.status.replace("_", " ")}
            </Badge>
            <Badge variant="secondary" className="rounded-md capitalize">
              {currentCase.queueStage.replace("_", " ")}
            </Badge>
            {overdue ? (
              <Badge className="rounded-md bg-rose-700 text-white">
                <AlertTriangle className="size-3" aria-hidden="true" />
                Due now
              </Badge>
            ) : null}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-950">{currentCase.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{currentCase.summary}</p>
          </div>
          <div className="grid gap-3 text-sm md:grid-cols-3">
            <Fact label="Assigned" value={currentCase.assignedToName ?? "Unassigned"} />
            <Fact label="Due" value={new Date(currentCase.dueAt).toLocaleDateString()} />
            <Fact label="Decision reason" value={currentCase.decisionReason?.replaceAll("_", " ") ?? "Not selected"} />
          </div>
          {currentCase.publicSummaryPreview ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase text-amber-900">Public-summary preview</p>
              <p className="mt-2 text-sm leading-6 text-amber-950">{currentCase.publicSummaryPreview}</p>
            </div>
          ) : null}
        </div>

        <div className={cn("grid gap-3", compact && "xl:grid-cols-1")}>
          <form action={assignAction} className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <AdminActionTokenInput />
            <input type="hidden" name="caseId" value={currentCase.id} />
            <p className="text-xs font-semibold uppercase text-slate-500">Assignment</p>
            <select name="assignedTo" defaultValue={currentCase.assignedTo ?? users[0]?.id} className="mt-2 h-10 w-full rounded-md border border-input bg-white px-3 text-sm">
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName}
                </option>
              ))}
            </select>
            <PendingSubmitButton pendingText="Assigning..." className="mt-2 w-full bg-slate-950 text-white hover:bg-slate-800">
              <UserCheck aria-hidden="true" />
              Assign case
            </PendingSubmitButton>
          </form>

          <form action={updateAction} className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <AdminActionTokenInput />
            <input type="hidden" name="caseId" value={currentCase.id} />
            <p className="text-xs font-semibold uppercase text-slate-500">Queue controls</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <select name="priority" defaultValue={currentCase.priority} className="h-10 rounded-md border border-input bg-white px-3 text-sm">
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <select name="status" defaultValue={currentCase.status} className="h-10 rounded-md border border-input bg-white px-3 text-sm">
                <option value="unassigned">Unassigned</option>
                <option value="assigned">Assigned</option>
                <option value="escalated">Escalated</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <Textarea name="escalationNote" defaultValue={currentCase.escalationNote} placeholder="Escalation or queue note" className="mt-2 min-h-16" />
            <PendingSubmitButton pendingText="Updating..." variant="outline" className="mt-2 w-full">
              <Clock3 aria-hidden="true" />
              Update case
            </PendingSubmitButton>
          </form>

          <form action={reasonAction} className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <AdminActionTokenInput />
            <input type="hidden" name="caseId" value={currentCase.id} />
            <p className="text-xs font-semibold uppercase text-slate-500">Decision reason</p>
            <select name="decisionReason" defaultValue={currentCase.decisionReason ?? "approved_with_edits"} className="mt-2 h-10 w-full rounded-md border border-input bg-white px-3 text-sm">
              {moderationDecisionReasons.map((reason) => (
                <option key={reason} value={reason}>
                  {reason.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <Textarea name="moderatorNote" placeholder="Decision note for audit context" className="mt-2 min-h-16" />
            <PendingSubmitButton pendingText="Saving..." variant="outline" className="mt-2 w-full">
              <CheckCircle2 aria-hidden="true" />
              Save reason
            </PendingSubmitButton>
          </form>
        </div>
      </div>
    </div>
  )
}

function WorkloadMetric({ metric }: { metric: AdminModerationCrmData["workload"][number] }) {
  const toneClass = {
    slate: "border-slate-200 bg-white text-slate-950",
    amber: "border-amber-200 bg-amber-50 text-amber-950",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-950",
    rose: "border-rose-200 bg-rose-50 text-rose-950",
  }[metric.tone]

  return (
    <div className={cn("rounded-md border p-4 shadow-sm", toneClass)}>
      <p className="text-xs font-semibold uppercase opacity-70">{metric.label}</p>
      <p className="mt-2 text-3xl font-semibold">{metric.value}</p>
      <p className="mt-1 text-xs opacity-70">{metric.helper}</p>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-2 font-semibold capitalize text-slate-950">{value}</p>
    </div>
  )
}

function priorityClass(priority: ModerationCase["priority"]) {
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
