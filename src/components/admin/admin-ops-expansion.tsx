"use client"

import { useActionState, useEffect } from "react"
import { ClipboardCheck, Filter, ShieldCheck, Signature } from "lucide-react"
import { toast } from "sonner"

import { AdminActionTokenInput } from "@/components/admin/admin-action-token-context"
import { FieldError } from "@/components/forms/field-error"
import { PendingSubmitButton } from "@/components/forms/pending-submit-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  reviewRecoveryComplianceAction,
  saveAdminQueueViewAction,
} from "@/lib/actions/client-bureau"
import type {
  ActionResult,
  AdminModerationCrmData,
  AdminSavedView,
  ContractorRiskOpsData,
  RecoveryComplianceReview,
} from "@/lib/types"

const savedViewState: ActionResult<AdminSavedView> = { ok: false, message: "" }
const complianceState: ActionResult<RecoveryComplianceReview> = { ok: false, message: "" }

export function AdminOpsExpansion({
  moderationCrm,
  riskOps,
}: {
  moderationCrm: AdminModerationCrmData
  riskOps?: ContractorRiskOpsData
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <Card className="rounded-md border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Filter className="size-5 text-amber-700" aria-hidden="true" />
            Saved queue views
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 p-5 lg:grid-cols-[320px_1fr]">
          <SavedViewForm />
          <div className="grid gap-3">
            {moderationCrm.savedViews.map((view) => (
              <div key={view.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="rounded-md capitalize">{view.scope}</Badge>
                  {view.isDefault ? <Badge className="rounded-md bg-slate-950 text-white">Default</Badge> : null}
                </div>
                <h3 className="mt-3 font-semibold text-slate-950">{view.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {Object.entries(view.filters).map(([key, value]) => `${key}: ${value}`).join(" / ")}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-md border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShieldCheck className="size-5 text-amber-700" aria-hidden="true" />
            Recovery case and contract compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 p-5 lg:grid-cols-[320px_1fr]">
          <ComplianceReviewForm riskOps={riskOps} />
          <div className="grid gap-3">
            {moderationCrm.recoveryComplianceReviews.map((review) => (
              <div key={review.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="rounded-md capitalize">{review.status.replaceAll("_", " ")}</Badge>
                  <Badge variant="secondary" className="rounded-md">
                    {review.publicVisibilityAllowed ? "Public allowed" : "Private only"}
                  </Badge>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-950">{review.decisionReason}</p>
                {review.requiredChanges.length > 0 ? (
                  <ul className="mt-2 grid gap-1 text-xs leading-5 text-slate-600">
                    {review.requiredChanges.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-md border-slate-200 bg-white shadow-sm xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Signature className="size-5 text-amber-700" aria-hidden="true" />
            Contract packet visibility
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {riskOps?.contractPackets.map((packet) => {
            const digest = packet.signedDigest
              ? `${packet.signedDigest.slice(0, 16)}...${packet.signedDigest.slice(-8)}`
              : "pending"

            return (
              <div key={packet.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="rounded-md capitalize">{packet.status.replaceAll("_", " ")}</Badge>
                  <Badge variant="secondary" className="rounded-md capitalize">{packet.shareStatus?.replaceAll("_", " ") ?? "draft"}</Badge>
                </div>
                <h3 className="mt-3 font-semibold text-slate-950">{packet.clientName}</h3>
                <p className="mt-1 text-sm text-slate-600">{packet.projectType} / {packet.templateType.replaceAll("_", " ")}</p>
                <div className="mt-3 grid gap-1 text-xs leading-5 text-slate-500">
                  <span>Signature: {packet.signatureStatus?.replaceAll("_", " ") ?? "not sent"}</span>
                  <span>Payment mode: {packet.paymentMode?.replaceAll("_", " ") ?? "none"}</span>
                  <span>Client contact: {packet.clientEmailMasked ?? "not added"}</span>
                  <span>Signed: {packet.signedRecordAt ? new Date(packet.signedRecordAt).toLocaleDateString() : "not signed"}</span>
                  <span>Digest: {digest}</span>
                </div>
              </div>
            )
          })}
          {!riskOps?.contractPackets.length ? (
            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              Contract packet records will appear here after contractors create private agreement packets.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="rounded-md border-slate-200 bg-white shadow-sm xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ClipboardCheck className="size-5 text-amber-700" aria-hidden="true" />
            Queue assignments
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {moderationCrm.queueAssignments.map((assignment) => (
            <div key={assignment.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-md bg-slate-950 text-white">{assignment.priority}</Badge>
                <Badge variant="outline" className="rounded-md capitalize">{assignment.entityType}</Badge>
                <Badge variant="secondary" className="rounded-md capitalize">{assignment.status.replaceAll("_", " ")}</Badge>
              </div>
              <p className="mt-3 font-semibold text-slate-950">{assignment.entityId}</p>
              <p className="mt-1 text-sm text-slate-600">{assignment.assignedToName}</p>
              <p className="mt-2 text-xs text-slate-500">Due {new Date(assignment.dueAt).toLocaleString()}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function SavedViewForm() {
  const [state, action] = useActionState(saveAdminQueueViewAction, savedViewState)

  useToastState(state)

  return (
    <form action={action} className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
      <AdminActionTokenInput />
      <Input name="name" placeholder="Saved view name" />
      <select name="scope" defaultValue="reports" className="h-10 rounded-md border border-input bg-white px-3 text-sm">
        <option value="reports">Reports</option>
        <option value="clients">Clients</option>
        <option value="contractors">Businesses / Users</option>
        <option value="discussions">Discussions</option>
        <option value="uploads">Uploads / CSV Intake</option>
        <option value="recovery">Recovery Cases</option>
        <option value="contracts">Contracts / Templates</option>
        <option value="audit">Audit Log</option>
      </select>
      <Textarea name="filterSummary" placeholder="Example: priority=high, status=queued" className="min-h-20" />
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <Checkbox name="isDefault" />
        Make default
      </label>
      <PendingSubmitButton pendingText="Saving..." className="bg-slate-950 text-white hover:bg-slate-800">
        Save view
      </PendingSubmitButton>
      <FieldError name="name" errors={state.ok ? undefined : state.fieldErrors} />
    </form>
  )
}

function ComplianceReviewForm({ riskOps }: { riskOps?: ContractorRiskOpsData }) {
  const [state, action] = useActionState(reviewRecoveryComplianceAction, complianceState)

  useToastState(state)

  const recovery = riskOps?.paymentRecoveryCases[0]
  const lien = riskOps?.lienNoticeDrafts[0]
  const packet = riskOps?.contractPackets[0]

  return (
    <form action={action} className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
      <AdminActionTokenInput />
      <select name="recoveryCaseId" defaultValue={recovery?.id ?? ""} className="h-10 rounded-md border border-input bg-white px-3 text-sm">
        <option value="">No recovery record</option>
        {riskOps?.paymentRecoveryCases.map((item) => (
          <option key={item.id} value={item.id}>{item.clientName}</option>
        ))}
      </select>
      <input type="hidden" name="lienNoticeDraftId" value={lien?.id ?? ""} />
      <input type="hidden" name="contractPacketId" value={packet?.id ?? ""} />
      <select name="status" defaultValue="pending" className="h-10 rounded-md border border-input bg-white px-3 text-sm">
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="needs_changes">Needs changes</option>
        <option value="blocked">Blocked</option>
      </select>
      <Input name="decisionReason" placeholder="Decision reason" />
      <Textarea name="requiredChanges" placeholder="Required changes, separated by commas or new lines" className="min-h-20" />
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <Checkbox name="publicVisibilityAllowed" />
        Public visibility allowed
      </label>
      <PendingSubmitButton pendingText="Saving..." className="bg-slate-950 text-white hover:bg-slate-800">
        Save review
      </PendingSubmitButton>
      <FieldError name="decisionReason" errors={state.ok ? undefined : state.fieldErrors} />
    </form>
  )
}

function useToastState<T>(state: ActionResult<T>) {
  useEffect(() => {
    if (state.message) toast[state.ok ? "success" : "error"](state.message)
  }, [state])
}
