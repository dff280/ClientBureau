"use client"

import { useActionState, useCallback, useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  FileText,
  LinkIcon,
  LockKeyhole,
  MessageSquareText,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

import { AdminDecisionPanel, AdminFilterBar } from "@/components/admin/admin-crm-ui"
import { AdminActionTokenInput } from "@/components/admin/admin-action-token-context"
import { EmptyState, StatusBadge } from "@/components/dashboard/dashboard-ui"
import { PendingSubmitButton } from "@/components/forms/pending-submit-button"
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
  const allItems = useMemo(
    () =>
      discussions
        .filter((discussion) => localStatuses[discussion.id] !== "deleted")
        .map((discussion) => ({
          ...discussion,
          status: (localStatuses[discussion.id] ?? discussion.status) as CommunityDiscussion["status"],
        })),
    [discussions, localStatuses],
  )
  const counts = useMemo(
    () => ({
      all: allItems.length,
      approved: allItems.filter((discussion) => discussion.status === "approved").length,
      pending: allItems.filter((discussion) => discussion.status === "pending").length,
      rejected: allItems.filter((discussion) => discussion.status === "rejected").length,
    }),
    [allItems],
  )
  const items = useMemo(
    () =>
      allItems
        .filter((discussion) => filter === "all" || discussion.status === filter)
        .sort((a, b) => discussionPriority(b) - discussionPriority(a)),
    [allItems, filter],
  )

  return (
    <div className="space-y-4">
      <AdminFilterBar
        title="Discussion queue"
        description="Review public-facing comments, responses, corrections, and supporting context. Pending and rejected entries stay private."
      >
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
              <span className="ml-2 rounded-sm bg-white/15 px-1.5 py-0.5 text-xs">
                {counts[item]}
              </span>
            </button>
          ))}
        </div>
      </AdminFilterBar>
      <div className="grid gap-3 md:grid-cols-4">
        <DiscussionQueueTile
          icon={AlertTriangle}
          label="Needs review"
          value={counts.pending}
          text="Private until approved by staff."
          tone={counts.pending > 0 ? "amber" : "emerald"}
        />
        <DiscussionQueueTile
          icon={ShieldCheck}
          label="Approved public"
          value={counts.approved}
          text="Visible only after moderation."
          tone="emerald"
        />
        <DiscussionQueueTile
          icon={LockKeyhole}
          label="Rejected hidden"
          value={counts.rejected}
          text="Not shown on public profiles."
          tone={counts.rejected > 0 ? "slate" : "emerald"}
        />
        <DiscussionQueueTile
          icon={MessageSquareText}
          label="Total records"
          value={counts.all}
          text="Responses, corrections, and context."
          tone="slate"
        />
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
          <EmptyState
            title="No discussion entries here"
            description="Switch filters or wait for the next response, correction, or community submission."
          />
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
  const age = ageLabel(discussion.createdAt)
  const hasAttachment = Boolean(discussion.attachmentUrl)
  const publicSafeStatus = discussion.status === "approved" ? "Public after moderation" : discussion.status === "pending" ? "Private pending review" : "Hidden from public"
  const profileContext = client
    ? `${client.firstName} ${client.lastName}, ${client.city}, ${client.state}`
    : "Client profile not found"

  useEffect(() => {
    if (state.message) toast[state.ok ? "success" : "error"](state.message)
    if (state.ok) onDone(discussion.id, state.data?.status ?? "deleted")
  }, [discussion.id, onDone, state])

  return (
    <form action={action} className="rounded-md border border-slate-200 bg-white shadow-sm">
      <AdminActionTokenInput />
      <input type="hidden" name="discussionId" value={discussion.id} />
      <div className="border-b border-slate-100 p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={discussion.status === "pending" ? "amber" : discussion.status === "approved" ? "emerald" : "rose"}>
                {discussion.status}
              </StatusBadge>
              {discussion.isVerified ? (
                <StatusBadge tone="emerald">Verified context</StatusBadge>
              ) : (
                <StatusBadge tone="slate">Unverified</StatusBadge>
              )}
              {hasAttachment ? <StatusBadge tone="blue">Attachment submitted</StatusBadge> : null}
              <span className="text-xs font-semibold uppercase text-slate-500">{discussion.relationshipCategory}</span>
            </div>
            <h2 className="text-lg font-semibold text-slate-950">{discussion.authorName}</h2>
            <p className="text-sm text-slate-500">
              {profileContext}
              {report ? ` / ${report.reportCategory}` : ""}
            </p>
          </div>
          <div className="grid gap-2 text-sm sm:grid-cols-2 lg:min-w-80">
            <ReviewSignal icon={CalendarClock} label="Submitted" value={age} />
            <ReviewSignal icon={LockKeyhole} label="Public status" value={publicSafeStatus} />
            <ReviewSignal icon={FileText} label="Profile context" value={client ? "Matched to client profile" : "Needs profile review"} tone={client ? "emerald" : "amber"} />
            <ReviewSignal icon={LinkIcon} label="Attachment" value={hasAttachment ? "Private review only" : "None submitted"} tone={hasAttachment ? "blue" : "slate"} />
          </div>
        </div>
      </div>
      <div className="grid gap-5 p-5 2xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Submitted comment</p>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-700">{discussion.commentBody}</p>
          </div>
          {hasAttachment ? (
            <div className="rounded-md border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900">
              Attachment or link was submitted for moderator review. Do not expose private document URLs, raw evidence, or private contact details on public profiles.
            </div>
          ) : null}
          <div className="grid gap-3 md:grid-cols-3">
            <ModerationCheck title="Neutral wording" text="Public copy should describe reported experience without accusations." tone="blue" />
            <ModerationCheck title="Response rights" text="Client responses, corrections, and disputes should remain easy to find." tone="emerald" />
            <ModerationCheck title="Private data" text="Email hashes, attachments, internal notes, and raw evidence stay private." tone="amber" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500" htmlFor={`${discussion.id}-moderator-note`}>
              Moderator note
            </label>
            <Textarea
              id={`${discussion.id}-moderator-note`}
              name="moderatorNote"
              placeholder="Add a short internal note before approving, verifying, rejecting, or deleting."
              className="mt-2 min-h-24 bg-white"
              defaultValue={discussion.moderatorNote}
            />
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Keep notes factual and internal. Do not paste private evidence paths, emails, phone numbers, or street addresses.
            </p>
          </div>
        </div>
        <AdminDecisionPanel
          title="Moderation decision"
          description="Approve only public-safe context. Verify when the relationship or supporting context has enough confidence."
        >
          <PendingSubmitButton name="decision" value="approved" pendingText="Approving..." className="bg-emerald-700 text-white hover:bg-emerald-800">
            <CheckCircle2 aria-hidden="true" />
            Approve public entry
          </PendingSubmitButton>
          <PendingSubmitButton name="decision" value="verified" pendingText="Verifying..." variant="outline">
            <ShieldCheck aria-hidden="true" />
            Verify context
          </PendingSubmitButton>
          <PendingSubmitButton name="decision" value="rejected" pendingText="Rejecting..." variant="outline">
            <XCircle aria-hidden="true" />
            Reject and keep private
          </PendingSubmitButton>
          <PendingSubmitButton name="decision" value="deleted" pendingText="Deleting..." variant="destructive">
            <Trash2 aria-hidden="true" />
            Delete record
          </PendingSubmitButton>
          <p className="text-xs leading-5 text-slate-500">
            Decisions update the queue immediately and create an audit trail through the existing moderation action.
          </p>
        </AdminDecisionPanel>
      </div>
    </form>
  )
}

function discussionPriority(discussion: CommunityDiscussion) {
  let priority = 0
  if (discussion.status === "pending") priority += 100
  if (!discussion.isVerified) priority += 30
  if (discussion.attachmentUrl) priority += 15
  if (isOlderThanDays(discussion.createdAt, 7)) priority += 10
  return priority
}

function ageLabel(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Date unavailable"

  const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86_400_000))
  if (days === 0) return "Submitted today"
  if (days === 1) return "Submitted 1 day ago"
  return `Submitted ${days} days ago`
}

function isOlderThanDays(value: string, days: number) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  return Date.now() - date.getTime() > days * 86_400_000
}

function ReviewSignal({
  icon: Icon,
  label,
  tone = "slate",
  value,
}: {
  icon: typeof CalendarClock
  label: string
  tone?: "slate" | "amber" | "emerald" | "blue"
  value: string
}) {
  const toneClass = {
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    blue: "border-sky-200 bg-sky-50 text-sky-900",
  }[tone]

  return (
    <div className={cn("flex items-start gap-2 rounded-md border p-3", toneClass)}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase opacity-70">{label}</p>
        <p className="mt-1 text-sm font-semibold leading-5">{value}</p>
      </div>
    </div>
  )
}

function ModerationCheck({
  text,
  title,
  tone = "slate",
}: {
  text: string
  title: string
  tone?: "slate" | "amber" | "emerald" | "blue"
}) {
  const toneClass = {
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    blue: "border-sky-200 bg-sky-50 text-sky-900",
  }[tone]

  return (
    <div className={cn("rounded-md border p-3", toneClass)}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-5 opacity-80">{text}</p>
    </div>
  )
}

function DiscussionQueueTile({
  icon: Icon,
  label,
  text,
  tone = "slate",
  value,
}: {
  icon: typeof AlertTriangle
  label: string
  text: string
  tone?: "slate" | "amber" | "emerald"
  value: number
}) {
  const toneClass = {
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
  }[tone]

  return (
    <div className={cn("rounded-md border p-4", toneClass)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase opacity-70">{label}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white/80 text-slate-950 shadow-sm">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 opacity-80">{text}</p>
    </div>
  )
}
