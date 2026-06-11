"use client"

import { useActionState, useEffect } from "react"
import { CheckCircle2, MessageSquareText } from "lucide-react"
import { toast } from "sonner"

import { FieldError } from "@/components/forms/field-error"
import { PendingSubmitButton } from "@/components/forms/pending-submit-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { submitCommunityDiscussionAction } from "@/lib/actions/client-bureau"
import { discussionCategories } from "@/lib/schemas/client-bureau"
import type { ActionResult, CommunityDiscussion } from "@/lib/types"

const initialState: ActionResult<CommunityDiscussion> = { ok: false, message: "" }

export type PublicCommunityDiscussionEntry = Pick<
  CommunityDiscussion,
  "id" | "relationshipCategory" | "isVerified" | "authorName" | "commentBody"
>

export function CommunityDiscussionSection({
  profileSlug,
  discussions,
}: {
  profileSlug: string
  discussions: PublicCommunityDiscussionEntry[]
}) {
  const [state, action] = useActionState(submitCommunityDiscussionAction, initialState)

  useEffect(() => {
    if (state.message) toast[state.ok ? "success" : "error"](state.message)
  }, [state])

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-950">Community Discussion</h2>
        <p className="text-sm leading-6 text-slate-600">
          Public entries are moderated before display. Unapproved, private, and internal
          moderation content is never shown on this profile.
        </p>
      </div>

      <div className="grid gap-3">
        {discussions.length > 0 ? (
          discussions.map((discussion) => (
            <article key={discussion.id} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-md">
                  {discussion.relationshipCategory}
                </Badge>
                {discussion.isVerified ? (
                  <Badge className="rounded-md bg-emerald-700 text-white">Verified context</Badge>
                ) : null}
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-950">{discussion.authorName}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{discussion.commentBody}</p>
            </article>
          ))
        ) : (
          <div className="rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
            No approved community discussion entries are published for this profile.
          </div>
        )}
      </div>

      <form action={action} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <input type="hidden" name="profileSlug" value={profileSlug} />
        <div className="flex items-center gap-2">
          <MessageSquareText className="size-5 text-amber-700" aria-hidden="true" />
          <h3 className="font-semibold text-slate-950">Add Experience / Submit Response / Report Inaccuracy</h3>
        </div>
        {state.message ? (
          <Alert className="mt-4 rounded-md border-emerald-200 bg-emerald-50 text-emerald-950">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            <AlertTitle>{state.ok ? "Submitted for moderation" : "Submission needs attention"}</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        ) : null}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="discussion-name">Name</label>
            <Input id="discussion-name" name="name" />
            <FieldError name="name" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="discussion-email">Email</label>
            <Input id="discussion-email" name="email" type="email" />
            <FieldError name="email" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="discussion-category">Relationship/category</label>
            <select
              id="discussion-category"
              name="relationshipCategory"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {discussionCategories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="attachment-url">Optional attachment/link</label>
            <Input id="attachment-url" name="attachmentUrl" placeholder="https://..." />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <label className="text-sm font-semibold text-slate-700" htmlFor="discussion-body">Comment body</label>
          <Textarea id="discussion-body" name="commentBody" className="min-h-28" />
          <FieldError name="commentBody" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <label className="mt-4 flex items-start gap-2 text-sm text-slate-700">
          <Checkbox name="truthfulCertification" />
          <span>I certify this submission is truthful to the best of my knowledge and may be moderated before publication.</span>
        </label>
        <FieldError name="truthfulCertification" errors={state.ok ? undefined : state.fieldErrors} />
        <PendingSubmitButton pendingText="Submitting..." className="mt-4 bg-slate-950 text-white hover:bg-slate-800">
          Submit for moderation
        </PendingSubmitButton>
      </form>
    </section>
  )
}
