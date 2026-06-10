"use client"

import { useActionState, useEffect } from "react"
import { CheckCircle2, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import { FieldError } from "@/components/forms/field-error"
import { PendingSubmitButton } from "@/components/forms/pending-submit-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitProfileClaimAction } from "@/lib/actions/client-bureau"
import type { ActionResult, ProfileClaim, ProfileType } from "@/lib/types"

const initialState: ActionResult<ProfileClaim> = {
  ok: false,
  message: "",
}

export function ProfileClaimForm({
  profileId,
  profileSlug,
  profileType,
}: {
  profileId?: string
  profileSlug?: string
  profileType?: ProfileType
}) {
  const [state, action] = useActionState(submitProfileClaimAction, initialState)

  useEffect(() => {
    if (state.message) toast[state.ok ? "success" : "error"](state.message)
  }, [state])

  return (
    <form action={action} className="space-y-5">
      {profileId ? <input type="hidden" name="profileId" value={profileId} /> : null}
      {profileType ? <input type="hidden" name="profileType" value={profileType} /> : null}
      {profileSlug ? <input type="hidden" name="profileSlug" value={profileSlug} /> : null}
      {state.message ? (
        <Alert variant={state.ok ? "default" : "destructive"} className="rounded-md">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          <AlertTitle>{state.ok ? "Claim received" : "Claim needs attention"}</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="claimantName">Your name</Label>
          <Input id="claimantName" name="claimantName" placeholder="Morgan Ellis" autoComplete="name" />
          <FieldError name="claimantName" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="claimantEmail">Verification email</Label>
          <Input id="claimantEmail" name="claimantEmail" type="email" placeholder="you@business.com" autoComplete="email" />
          <FieldError name="claimantEmail" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="relationshipToProfile">Relationship to this profile</Label>
          <Input id="relationshipToProfile" name="relationshipToProfile" placeholder="Owner, authorized manager, reported party, customer, or correction requester" />
          <FieldError name="relationshipToProfile" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="verificationSummary">Verification summary</Label>
          <Textarea
            id="verificationSummary"
            name="verificationSummary"
            placeholder="Describe what connects you to this profile and what documentation you can provide for moderation review."
            className="min-h-28"
          />
          <FieldError name="verificationSummary" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
      </div>
      <label className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
        <input type="checkbox" name="truthfulCertification" value="true" className="mt-1 size-4 rounded border-slate-300" />
        <span>
          <span className="block font-semibold text-slate-950">I certify this claim is accurate.</span>
          <span className="mt-1 block text-xs leading-5 text-slate-600">
            Client Bureau may request documentation before assigning ownership, publishing a response, or changing public profile status.
          </span>
        </span>
      </label>
      <FieldError name="truthfulCertification" errors={state.ok ? undefined : state.fieldErrors} />
      <PendingSubmitButton pendingText="Submitting claim..." className="bg-slate-950 text-white hover:bg-slate-800">
        <ShieldCheck aria-hidden="true" />
        Submit claim for moderation
      </PendingSubmitButton>
    </form>
  )
}
