"use client"

import { useActionState, useEffect, useMemo, useState } from "react"
import { CheckCircle2, Eye, FileText, XCircle } from "lucide-react"
import { toast } from "sonner"

import { FieldError } from "@/components/forms/field-error"
import { PendingSubmitButton } from "@/components/forms/pending-submit-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { reviewReportAction } from "@/lib/actions/client-bureau"
import type {
  ActionResult,
  AdminReview,
  ClientProfile,
  ClientReport,
  ReportEvidence,
  ReviewChecklistItem,
} from "@/lib/types"

export interface AdminReviewItem {
  review: AdminReview
  report?: ClientReport
  client?: ClientProfile
  evidence: ReportEvidence[]
  checklist: ReviewChecklistItem[]
}

const initialReviewState: ActionResult<AdminReview> = {
  ok: false,
  message: "",
}

export function AdminReviewPanel({ items }: { items: AdminReviewItem[] }) {
  const [reviews] = useState(items)
  const queuedCount = useMemo(
    () => reviews.filter((item) => item.review.status === "queued").length,
    [reviews],
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-semibold uppercase text-slate-500">Queued</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{queuedCount}</p>
          </CardContent>
        </Card>
        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-semibold uppercase text-slate-500">Total in panel</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{reviews.length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-semibold uppercase text-slate-500">Approval gate</p>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
              Evidence, neutral wording, and private identifier checks are required before publishing.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5">
        {reviews.map((item) => (
          <ReviewCard key={item.review.id} item={item} />
        ))}
      </div>
    </div>
  )
}

function ReviewCard({ item }: { item: AdminReviewItem }) {
  const [state, action] = useActionState(reviewReportAction, initialReviewState)
  const report = item.report
  const client = item.client
  const [summary, setSummary] = useState(report?.publicSummary ?? "")

  useEffect(() => {
    if (state.message) toast[state.ok ? "success" : "error"](state.message)
  }, [state])

  return (
    <Card className="rounded-md border-slate-200 bg-white shadow-sm">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-xl">
            {client ? `${client.firstName} ${client.lastName}` : "Client review"}
          </CardTitle>
          <span className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold uppercase text-slate-600">
            {state.ok ? state.data.status : item.review.status}
          </span>
        </div>
        <p className="text-sm leading-6 text-slate-600">
          {report?.reportCategory ?? "Report category"} | {report?.paymentStatus ?? "Payment status"}
        </p>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <input type="hidden" name="reportId" value={report?.id ?? item.review.reportId} />
          <div className="space-y-4">
            {state.message ? (
              <Alert
                variant={state.ok ? "default" : "destructive"}
                className={state.ok ? "rounded-md border-emerald-200 bg-emerald-50 text-emerald-950" : "rounded-md"}
              >
                {state.ok ? <CheckCircle2 className="size-4" aria-hidden="true" /> : null}
                <AlertTitle>{state.ok ? "Review updated" : "Review needs attention"}</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            ) : null}
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Contractor summary</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {report?.reportSummary ?? "No report summary available."}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-950">Edited public summary</p>
              <Textarea
                name="editedPublicSummary"
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                className="min-h-28"
              />
              <FieldError name="editedPublicSummary" errors={state.ok ? undefined : state.fieldErrors} />
            </div>
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase text-amber-900">Public preview</p>
              <p className="mt-2 text-sm leading-6 text-amber-950">{summary}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <PendingSubmitButton
                name="decision"
                value="approved"
                pendingText="Approving..."
                className="bg-emerald-700 text-white hover:bg-emerald-800"
              >
                <CheckCircle2 aria-hidden="true" />
                Approve and publish
              </PendingSubmitButton>
              <Button type="submit" name="decision" value="rejected" variant="destructive">
                <XCircle aria-hidden="true" />
                Reject
              </Button>
            </div>
            {state.ok ? (
              <p className="text-sm leading-6 text-slate-500">{state.data.notes}</p>
            ) : item.review.notes ? (
              <p className="text-sm leading-6 text-slate-500">{item.review.notes}</p>
            ) : null}
          </div>
          <div className="space-y-4">
            <div className="rounded-md border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-950">Approval checklist</p>
              <div className="mt-3 space-y-3">
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
              </div>
            </div>
            <div className="rounded-md border border-slate-200 p-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
                <Eye className="size-4" aria-hidden="true" />
                Evidence list
              </p>
              <div className="space-y-2">
                {item.evidence.length > 0 ? (
                  item.evidence.map((evidence) => (
                    <div key={evidence.id} className="flex items-center gap-2 rounded-md bg-slate-50 p-2 text-xs text-slate-600">
                      <FileText className="size-3.5" aria-hidden="true" />
                      {evidence.fileName}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No evidence attached.</p>
                )}
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" className="w-full">
                  View policy checks
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Moderation checks</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  {item.checklist.map((check) => (
                    <div key={check.id} className="rounded-md border border-slate-200 p-3">
                      <p className="text-sm font-semibold text-slate-950">{check.label}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">{check.description}</p>
                      <p className="mt-2 text-xs font-semibold uppercase text-slate-500">{check.status}</p>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
