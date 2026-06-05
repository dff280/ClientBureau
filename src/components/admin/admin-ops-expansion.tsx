"use client"

import { useActionState, useEffect } from "react"
import { ClipboardCheck, Filter, Landmark, PhoneCall, ShieldCheck, Signature } from "lucide-react"
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
  adminApproveLienFilingAction,
  adminApproveLienNoticeAction,
  adminRecordLienFiledAction,
  adminRecordLienReleaseAction,
  adminRequestLienMoreInfoAction,
  adminUploadRecordingProofAction,
  logResolutionDeskContactAction,
  markRecoveryResolvedAction,
  reviewRecoveryComplianceAction,
  saveAdminQueueViewAction,
} from "@/lib/actions/client-bureau"
import type {
  ActionResult,
  AdminModerationCrmData,
  AdminSavedView,
  ContractorRiskOpsData,
  FloridaLienCase,
  LienFilingRecord,
  LienReleaseRecord,
  ManagedRecoveryCase,
  RecoveryComplianceReview,
  RecoveryCommunication,
} from "@/lib/types"

const savedViewState: ActionResult<AdminSavedView> = { ok: false, message: "" }
const complianceState: ActionResult<RecoveryComplianceReview> = { ok: false, message: "" }
const resolutionContactState: ActionResult<RecoveryCommunication> = { ok: false, message: "" }
const managedRecoveryState: ActionResult<ManagedRecoveryCase> = { ok: false, message: "" }
const floridaLienState: ActionResult<FloridaLienCase> = { ok: false, message: "" }
const lienFilingState: ActionResult<LienFilingRecord> = { ok: false, message: "" }
const lienReleaseState: ActionResult<LienReleaseRecord> = { ok: false, message: "" }

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
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-xl">
            <PhoneCall className="size-5 text-amber-700" aria-hidden="true" />
            Resolution Desk
          </CardTitle>
          <p className="text-sm leading-6 text-slate-600">
            Managed recovery cases are private staff workflows. Log factual contacts, note client responses, and mark contractor-direct resolutions.
          </p>
        </CardHeader>
        <CardContent className="grid gap-5 p-5 lg:grid-cols-[360px_1fr]">
          <ResolutionDeskContactForm cases={riskOps?.managedRecoveryCases ?? []} />
          <div className="grid gap-3 md:grid-cols-2">
            {riskOps?.managedRecoveryCases.map((item) => (
              <div key={item.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="rounded-md capitalize">{item.status.replaceAll("_", " ")}</Badge>
                  <Badge variant="secondary" className="rounded-md capitalize">{item.priority}</Badge>
                </div>
                <h3 className="mt-3 font-semibold text-slate-950">{item.clientName}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  ${item.amountDue.toLocaleString()} / {item.invoiceAgeDays} days / {item.city}, {item.state}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-700">{item.nextAction}</p>
                <ResolveRecoveryForm caseId={item.id} amountDue={item.amountDue} />
              </div>
            ))}
            {!riskOps?.managedRecoveryCases.length ? (
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                Managed recovery cases will appear here after contractors submit Resolution Desk requests.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-md border-slate-200 bg-white shadow-sm xl:col-span-2">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Landmark className="size-5 text-amber-700" aria-hidden="true" />
            Florida lien service queue
          </CardTitle>
          <p className="text-sm leading-6 text-slate-600">
            Review Florida notice and claim-of-lien cases for fee status, contractor authorization, attorney/vendor readiness, recording proof, and release needs.
          </p>
        </CardHeader>
        <CardContent className="grid gap-5 p-5 lg:grid-cols-[360px_1fr]">
          <FloridaLienAdminActionForm cases={riskOps?.floridaLienCases ?? []} filingRecords={riskOps?.lienFilingRecords ?? []} />
          <div className="grid gap-3 md:grid-cols-2">
            {riskOps?.floridaLienCases.map((item) => (
              <div key={item.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="rounded-md capitalize">{item.workflowType.replaceAll("_", " ")}</Badge>
                  <Badge className="rounded-md bg-slate-950 text-white capitalize">{item.status.replaceAll("_", " ")}</Badge>
                  <Badge variant="secondary" className="rounded-md">{item.propertyCounty} County</Badge>
                </div>
                <h3 className="mt-3 font-semibold text-slate-950">{item.clientName}</h3>
                <div className="mt-2 grid gap-1 text-xs leading-5 text-slate-600">
                  <span>Amount due: ${item.amountDue.toLocaleString()}</span>
                  <span>Deadline: {item.filingDeadline ?? "review required"}</span>
                  <span>Contractor signature: {item.contractorSignedAt ? "received" : "required"}</span>
                  <span>Vendor status: {item.attorneyVendorStatus.replaceAll("_", " ")}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{item.nextAction}</p>
              </div>
            ))}
            {!riskOps?.floridaLienCases.length ? (
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                Florida lien service cases will appear here after contractors submit notice or filing requests.
              </div>
            ) : null}
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

function ResolutionDeskContactForm({ cases }: { cases: ManagedRecoveryCase[] }) {
  const [contactState, contactAction] = useActionState(logResolutionDeskContactAction, resolutionContactState)

  useToastState(contactState)

  return (
    <form action={contactAction} className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
      <AdminActionTokenInput />
      <select name="caseId" className="h-10 rounded-md border border-input bg-white px-3 text-sm">
        {cases.map((item) => (
          <option key={item.id} value={item.id}>{item.clientName} / ${item.amountDue.toLocaleString()}</option>
        ))}
      </select>
      <div className="grid gap-3 sm:grid-cols-2">
        <select name="channel" defaultValue="email" className="h-10 rounded-md border border-input bg-white px-3 text-sm">
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="letter">Letter</option>
          <option value="client_portal">Client portal</option>
        </select>
        <select name="direction" defaultValue="outbound" className="h-10 rounded-md border border-input bg-white px-3 text-sm">
          <option value="outbound">Outbound</option>
          <option value="inbound">Inbound</option>
          <option value="internal">Internal note</option>
        </select>
      </div>
      <Input name="subject" placeholder="Subject" />
      <select name="outcome" defaultValue="needs_follow_up" className="h-10 rounded-md border border-input bg-white px-3 text-sm">
        <option value="no_response">No response</option>
        <option value="client_responded">Client responded</option>
        <option value="payment_promised">Payment promised</option>
        <option value="payment_received">Payment received</option>
        <option value="dispute_raised">Dispute raised</option>
        <option value="needs_follow_up">Needs follow-up</option>
      </select>
      <Input name="contactedAt" type="datetime-local" aria-label="Contacted at" />
      <Textarea name="note" placeholder="Factual private contact note" className="min-h-24" />
      <PendingSubmitButton pendingText="Logging..." className="bg-slate-950 text-white hover:bg-slate-800">
        <PhoneCall aria-hidden="true" />
        Log Resolution Desk contact
      </PendingSubmitButton>
      <FieldError name="note" errors={contactState.ok ? undefined : contactState.fieldErrors} />
    </form>
  )
}

function ResolveRecoveryForm({ caseId, amountDue }: { caseId: string; amountDue: number }) {
  const [state, action] = useActionState(markRecoveryResolvedAction, managedRecoveryState)

  useToastState(state)

  return (
    <form action={action} className="mt-3 grid gap-2 rounded-md border border-slate-200 bg-white p-3">
      <AdminActionTokenInput />
      <input type="hidden" name="caseId" value={caseId} />
      <Input name="amountResolved" type="number" defaultValue={amountDue} aria-label="Resolved amount" />
      <Textarea name="resolutionSummary" placeholder="Resolution summary and contractor-direct payment note" className="min-h-16" />
      <PendingSubmitButton size="sm" variant="outline" pendingText="Saving...">
        Mark resolved
      </PendingSubmitButton>
    </form>
  )
}

function FloridaLienAdminActionForm({
  cases,
  filingRecords,
}: {
  cases: FloridaLienCase[]
  filingRecords: LienFilingRecord[]
}) {
  const [moreInfoState, moreInfoAction] = useActionState(adminRequestLienMoreInfoAction, floridaLienState)
  const [noticeState, noticeAction] = useActionState(adminApproveLienNoticeAction, floridaLienState)
  const [filingState, filingAction] = useActionState(adminApproveLienFilingAction, floridaLienState)
  const [filedState, filedAction] = useActionState(adminRecordLienFiledAction, lienFilingState)
  const [proofState, proofAction] = useActionState(adminUploadRecordingProofAction, lienFilingState)
  const [releaseState, releaseAction] = useActionState(adminRecordLienReleaseAction, lienReleaseState)
  const activeCase = cases[0]
  const activeFiling = filingRecords[0]

  useToastState(moreInfoState)
  useToastState(noticeState)
  useToastState(filingState)
  useToastState(filedState)
  useToastState(proofState)
  useToastState(releaseState)

  return (
    <div className="grid gap-3">
      <form action={moreInfoAction} className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
        <AdminActionTokenInput />
        <select name="caseId" defaultValue={activeCase?.id ?? ""} className="h-10 rounded-md border border-input bg-white px-3 text-sm">
          {cases.map((item) => (
            <option key={item.id} value={item.id}>{item.clientName} / {item.propertyCounty}</option>
          ))}
        </select>
        <Textarea name="decisionNote" placeholder="Decision note" className="min-h-20" />
        <div className="grid gap-2 sm:grid-cols-3">
          <PendingSubmitButton pendingText="Saving..." variant="outline" formAction={moreInfoAction}>
            More info
          </PendingSubmitButton>
          <PendingSubmitButton pendingText="Approving..." formAction={noticeAction} className="bg-slate-950 text-white hover:bg-slate-800">
            Approve notice
          </PendingSubmitButton>
          <PendingSubmitButton pendingText="Approving..." formAction={filingAction} className="bg-amber-700 text-white hover:bg-amber-800">
            Approve filing
          </PendingSubmitButton>
        </div>
      </form>

      <form action={filedAction} className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
        <AdminActionTokenInput />
        <input type="hidden" name="caseId" value={activeCase?.id ?? ""} />
        <select name="filingMethod" defaultValue="attorney_vendor" className="h-10 rounded-md border border-input bg-white px-3 text-sm">
          <option value="attorney_vendor">Attorney/vendor</option>
          <option value="e_recording_vendor">E-recording vendor</option>
          <option value="county_clerk_manual">County clerk manual</option>
        </select>
        <Input name="recordingVendor" placeholder="Recording vendor" />
        <Input name="clerkCounty" defaultValue={activeCase?.propertyCounty ?? ""} placeholder="Clerk county" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input name="filedAt" type="date" aria-label="Filed date" />
          <Input name="instrumentNumber" placeholder="Instrument number (if known)" />
        </div>
        <PendingSubmitButton pendingText="Recording..." className="bg-slate-950 text-white hover:bg-slate-800">
          Record filed
        </PendingSubmitButton>
      </form>

      <form action={proofAction} className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
        <AdminActionTokenInput />
        <select name="filingRecordId" defaultValue={activeFiling?.id ?? ""} className="h-10 rounded-md border border-input bg-white px-3 text-sm">
          {filingRecords.map((item) => (
            <option key={item.id} value={item.id}>{item.clerkCounty} / {item.status.replaceAll("_", " ")}</option>
          ))}
        </select>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input name="recordingConfirmedAt" type="date" aria-label="Recording confirmed date" />
          <Input name="instrumentNumber" placeholder="Instrument number" />
        </div>
        <Textarea name="proofSummary" placeholder="Recording proof summary" className="min-h-16" />
        <PendingSubmitButton pendingText="Uploading..." className="bg-slate-950 text-white hover:bg-slate-800">
          Record proof
        </PendingSubmitButton>
      </form>

      <form action={releaseAction} className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
        <AdminActionTokenInput />
        <input type="hidden" name="caseId" value={activeCase?.id ?? ""} />
        <div className="grid gap-3 sm:grid-cols-2">
          <select name="releaseReason" defaultValue="paid" className="h-10 rounded-md border border-input bg-white px-3 text-sm">
            <option value="paid">Paid</option>
            <option value="settled">Settled</option>
            <option value="expired">Expired</option>
            <option value="withdrawn">Withdrawn</option>
            <option value="error_correction">Correction</option>
          </select>
          <select name="releaseStatus" defaultValue="draft" className="h-10 rounded-md border border-input bg-white px-3 text-sm">
            <option value="draft">Draft</option>
            <option value="sent_for_signature">Sent for signature</option>
            <option value="recorded">Recorded</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
        <Input name="releaseInstrumentNumber" placeholder="Release instrument number" />
        <Textarea name="notes" placeholder="Release notes" className="min-h-16" />
        <PendingSubmitButton pendingText="Saving..." className="bg-slate-950 text-white hover:bg-slate-800">
          Save release
        </PendingSubmitButton>
      </form>
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
