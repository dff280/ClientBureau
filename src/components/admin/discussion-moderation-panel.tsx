"use client"

import { useActionState, useCallback, useEffect, useMemo, useState } from "react"
import { CheckCircle2, ShieldCheck, Trash2, XCircle } from "lucide-react"
import { toast } from "sonner"

import { PendingSubmitButton } from "@/components/forms/pending-submit-button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { adminDiscussionReviewAction } from "@/lib/actions/client-bureau"
import type { ActionResult, ClientProfile, ClientReport, CommunityDiscussion } from "@/lib/types"
import { cn } from "@/lib/utils"

const initialState: ActionResult<CommunityDiscussion | undefined> = {
  ok: false,
  message: "",
}

export function DiscussionModerationPanel({
  discussions,
  clients,
  reports,
}: {
  discussions: CommunityDiscussion[]
  clients: ClientProfile[]
  reports: ClientReport[]
}) {
  const [filter, setFilter] = useState<CommunityDiscussion["status"] | "all">("pending")
  const [localStatuses, setLocalStatuses] = useState<Record<string, CommunityDiscussion["status"] | "deleted">>({})
  const handleDone = useCallback((id: string, status: CommunityDiscussion["status"] | "deleted") => {
    setLocalStatuses((current) => ({ ...current, [id]: status }))
  }, [])
  const items = useMemo(
    () =>
      discussions
        .filter((discussion) => localStatuses[discussion.id] !== "deleted")
        .map((discussion) => ({
          ...discussion,
          status: (localStatuses[discussion.id] ?? discussion.status) as CommunityDiscussion["status"],
        }))
        .filter((discussion) => filter === "all" || discussion.status === filter),
    [discussions, filter, localStatuses],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["pending", "approved", "rejected", "all"] as const).map((item) => (
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
            {item}
          </button>
        ))}
      </div>
      <div className="grid gap-4">
        {items.map((discussion) => (
          <DiscussionCard
            key={discussion.id}
            discussion={discussion}
            client={clients.find((item) => item.id === discussion.clientId)}
            report={reports.find((item) => item.id === discussion.reportId)}
            onDone={handleDone}
          />
        ))}
        {items.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
            No discussion entries in this filter.
          </div>
        ) : null}
      </div>
    </div>
  )
}

function DiscussionCard({
  discussion,
  client,
  report,
  onDone,
}: {
  discussion: CommunityDiscussion
  client?: ClientProfile
  report?: ClientReport
  onDone: (id: string, status: CommunityDiscussion["status"] | "deleted") => void
}) {
  const [state, action] = useActionState(adminDiscussionReviewAction, initialState)

  useEffect(() => {
    if (state.message) toast[state.ok ? "success" : "error"](state.message)
    if (state.ok) onDone(discussion.id, state.data?.status ?? "deleted")
  }, [discussion.id, onDone, state])

  return (
    <form action={action} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <input type="hidden" name="discussionId" value={discussion.id} />
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={discussion.status === "pending" ? "outline" : "secondary"} className="rounded-md capitalize">
              {discussion.status}
            </Badge>
            {discussion.isVerified ? (
              <Badge className="rounded-md bg-emerald-700 text-white">Verified</Badge>
            ) : null}
            <span className="text-xs font-semibold uppercase text-slate-500">{discussion.relationshipCategory}</span>
          </div>
          <h2 className="font-semibold text-slate-950">{discussion.authorName}</h2>
          <p className="text-sm text-slate-500">
            {client ? `${client.firstName} ${client.lastName}, ${client.city}, ${client.state}` : "Client not found"}
            {report ? ` / ${report.reportCategory}` : ""}
          </p>
          <p className="max-w-4xl text-sm leading-6 text-slate-700">{discussion.commentBody}</p>
          {discussion.attachmentUrl ? (
            <p className="text-xs text-slate-500">Attachment/link submitted for moderator review.</p>
          ) : null}
        </div>
        <div className="grid min-w-56 gap-2">
          <PendingSubmitButton name="decision" value="approved" pendingText="Approving..." className="bg-emerald-700 text-white hover:bg-emerald-800">
            <CheckCircle2 aria-hidden="true" />
            Approve
          </PendingSubmitButton>
          <PendingSubmitButton name="decision" value="verified" pendingText="Verifying..." variant="outline">
            <ShieldCheck aria-hidden="true" />
            Verify
          </PendingSubmitButton>
          <PendingSubmitButton name="decision" value="rejected" pendingText="Rejecting..." variant="outline">
            <XCircle aria-hidden="true" />
            Reject
          </PendingSubmitButton>
          <PendingSubmitButton name="decision" value="deleted" pendingText="Deleting..." variant="destructive">
            <Trash2 aria-hidden="true" />
            Delete
          </PendingSubmitButton>
        </div>
      </div>
      <Textarea name="moderatorNote" placeholder="Moderator note" className="mt-4 min-h-20" defaultValue={discussion.moderatorNote} />
    </form>
  )
}
