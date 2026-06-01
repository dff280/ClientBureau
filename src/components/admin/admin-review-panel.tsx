"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useActionState, useEffect, useMemo, useState } from "react"
import { CheckCircle2, ExternalLink, Eye, FileText, Inbox, XCircle } from "lucide-react"
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
  const queuedCount = useMemo(() => items.filter((item) => item.review.status === "queued").length, [items])
  const approvedCount = useMemo(() => items.filter((item) => item.review.status === "approved").length, [items])
  const rejectedCount = useMemo(() => items.filter((item) => item.review.status === "rejected").length, [items])

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
            <p className="text-sm font-semibold uppercase text-slate-500">Approved</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{approvedCount}</p>
          </CardContent>
        </Card>
        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-semibold uppercase text-slate-500">Rejected</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{rejectedCount}</p>
          </CardContent>
        </Card>
      </div>

      {items.length > 0 ? (
        <div className="grid gap-5">
          {items.map((item) => (
            <ReviewCard key={item.review.id} item={item} />
          ))}
        </div>
      ) : (
        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardContent className="grid gap-3 p-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-md bg-slate-100 text-slate-700">
              <Inbox className="size-6" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-950">No reports in review.</h2>
            <p className="text-sm leading-6 text-slate-600">
              New contractor submissions will appear here after they are queued for moderation.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ReviewCard({ item }: { item: AdminReviewItem }) {
  const router = useRouter()
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

  useEffect(() => {
    if (state.message) {
      toast[state.ok ? "success" : "error"](state.message)
    }

    if (state.ok) {
      router.refresh()
    }
  }, [router, state])

  return (
    <Card className="rounded-md border-slate-200 bg-white shadow-sm">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-xl">
            {client ? `${client.firstName} ${client.lastName}` : "Client review"}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {publicHref ? (
              <Button asChild size="sm" variant="outline">
                <Link href={publicHref} target="_blank">
                  <ExternalLink aria-hidden="true" />
                  Public profile
                </Link>
              </Button>
            ) : null}
            <span className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold uppercase text-slate-600">
              {currentStatus}
            </span>
          </div>
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
                disabled={currentStatus === "approved"}
              >
                <CheckCircle2 aria-hidden="true" />
                Approve and publish
              </PendingSubmitButton>
              <Button
                type="submit"
                name="decision"
                value="rejected"
                variant="destructive"
                disabled={currentStatus === "rejected"}
              >
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
