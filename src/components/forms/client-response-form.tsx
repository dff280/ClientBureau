"use client"

import { useActionState, useEffect } from "react"
import { CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

import { FieldError } from "@/components/forms/field-error"
import { PendingSubmitButton } from "@/components/forms/pending-submit-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitClientResponseAction } from "@/lib/actions/client-bureau"
import type { ActionResult, ClientResponse } from "@/lib/types"

const initialState: ActionResult<ClientResponse> = {
  ok: false,
  message: "",
}

export function ClientResponseForm() {
  const [state, action] = useActionState(submitClientResponseAction, initialState)

  useEffect(() => {
    if (state.message) toast[state.ok ? "success" : "error"](state.message)
  }, [state])

  return (
    <form action={action} className="grid gap-5">
      {state.message ? (
        <Alert
          variant={state.ok ? "default" : "destructive"}
          className={state.ok ? "rounded-md border-emerald-200 bg-emerald-50 text-emerald-950" : "rounded-md"}
        >
          {state.ok ? <CheckCircle2 className="size-4" aria-hidden="true" /> : null}
          <AlertTitle>{state.ok ? "Response queued" : "Review required"}</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" name="name" placeholder="Name on profile" />
          <FieldError name="name" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="review contact" />
          <FieldError name="email" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profileUrl">Profile URL</Label>
          <Input id="profileUrl" name="profileUrl" placeholder="/client/john-smith-orlando-fl" />
          <FieldError name="profileUrl" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="requestType">Request type</Label>
          <select
            id="requestType"
            name="requestType"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option>Publish a response</option>
            <option>Dispute a report</option>
            <option>Request correction</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="responseSummary">Response summary</Label>
        <Textarea
          id="responseSummary"
          name="responseSummary"
          className="min-h-36"
          placeholder="Provide factual context, documentation references, and the specific report or profile item you are responding to."
        />
        <FieldError name="responseSummary" errors={state.ok ? undefined : state.fieldErrors} />
      </div>
      <PendingSubmitButton pendingText="Queuing response..." className="bg-slate-950 text-white hover:bg-slate-800">
        Submit response for review
      </PendingSubmitButton>
    </form>
  )
}
