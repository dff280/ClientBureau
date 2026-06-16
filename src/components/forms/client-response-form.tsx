"use client"

import { useActionState, useEffect } from "react"
import { CheckCircle2, FileText, ShieldCheck } from "lucide-react"
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

type ClientResponseFormProps = {
  defaultProfileUrl?: string
  defaultReportId?: string
  defaultProjectJobId?: string
}

export function ClientResponseForm({
  defaultProfileUrl,
  defaultProjectJobId,
  defaultReportId,
}: ClientResponseFormProps = {}) {
  const [state, action] = useActionState(submitClientResponseAction, initialState)

  useEffect(() => {
    if (state.message) toast[state.ok ? "success" : "error"](state.message)
  }, [state])

  return (
    <form action={action} className="grid gap-6">
      {state.message ? (
        <Alert
          variant={state.ok ? "default" : "destructive"}
          className={state.ok ? "rounded-md border-emerald-200 bg-emerald-50 text-emerald-950" : "rounded-md"}
        >
          {state.ok ? <CheckCircle2 className="size-4" aria-hidden="true" /> : null}
          <AlertTitle>{state.ok ? "Response queued" : "Review required"}</AlertTitle>
          <AlertDescription>
            {state.message}
            {state.ok ? " A moderator will review the profile reference, verify contact information, and decide whether the response, correction, or resolution update should be published." : null}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        Use this form to submit a response, dispute, correction request, or resolution update.
        Public display is never automatic; every submission is reviewed for relevance, privacy,
        profile match, tone, and documentation.
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" name="name" placeholder="Name for moderator verification" />
          <FieldError name="name" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email for moderator contact</Label>
          <Input id="email" name="email" type="email" placeholder="Review contact email" />
          <FieldError name="email" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone optional</Label>
          <Input id="phone" name="phone" placeholder="Used only if verification needs it" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profileUrl">Client Bureau profile URL</Label>
          <Input id="profileUrl" name="profileUrl" defaultValue={defaultProfileUrl} placeholder="/client/john-smith-orlando-fl" />
          <FieldError name="profileUrl" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        {defaultReportId ? <input type="hidden" name="reportId" value={defaultReportId} /> : null}
        {defaultProjectJobId ? <input type="hidden" name="projectJobId" value={defaultProjectJobId} /> : null}
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
            <option>Resolution update</option>
          </select>
          <p className="text-xs leading-5 text-slate-500">
            Choose the closest match. Moderators may relabel the public context during review.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="verificationMethod">Preferred verification</Label>
          <select
            id="verificationMethod"
            name="verificationMethod"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option>Email verification</option>
            <option>Phone verification</option>
            <option>Business documentation</option>
          </select>
          <p className="text-xs leading-5 text-slate-500">
            Verification details are used for review and are not displayed publicly.
          </p>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="attachmentUrl">Optional documentation link</Label>
          <Input id="attachmentUrl" name="attachmentUrl" placeholder="Private review link, document URL, or file reference" />
          <p className="text-xs leading-5 text-slate-500">
            Documentation is reviewed privately. Public profiles show only moderated summaries.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="responseSummary">What should moderators know?</Label>
        <Textarea
          id="responseSummary"
          name="responseSummary"
          className="min-h-36"
          placeholder="Example: I am requesting a correction because the report date appears to reference a different project. I can provide the signed scope and payment confirmation for moderator review."
        />
        <p className="text-xs leading-5 text-slate-500">
          Keep this factual and specific. Avoid private contact details, threats, insults, or unsupported accusations.
        </p>
        <FieldError name="responseSummary" errors={state.ok ? undefined : state.fieldErrors} />
      </div>

      <div className="grid gap-3">
        <Attestation
          name="contactCertification"
          icon={ShieldCheck}
          label="I certify my contact information is accurate for moderation follow-up."
          errors={state.ok ? undefined : state.fieldErrors}
        />
        <Attestation
          name="documentationCertification"
          icon={FileText}
          label="I certify that any documentation or context I submit is accurate and relevant."
          errors={state.ok ? undefined : state.fieldErrors}
        />
      </div>

      <PendingSubmitButton pendingText="Queuing response..." className="bg-slate-950 text-white hover:bg-slate-800">
        Submit response for review
      </PendingSubmitButton>
    </form>
  )
}

function Attestation({
  name,
  label,
  icon: Icon,
  errors,
}: {
  name: string
  label: string
  icon: typeof ShieldCheck
  errors?: Record<string, string[]>
}) {
  return (
    <div>
      <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
        <input type="checkbox" name={name} value="true" className="mt-1 size-4 rounded border-slate-300" />
        <Icon className="mt-0.5 size-4 shrink-0 text-amber-700" aria-hidden="true" />
        <span>{label}</span>
      </label>
      <FieldError name={name} errors={errors} />
    </div>
  )
}
