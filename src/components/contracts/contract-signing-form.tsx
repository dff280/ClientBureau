"use client"

import { useActionState, useEffect } from "react"
import { CheckCircle2, Printer, Signature } from "lucide-react"
import { toast } from "sonner"

import { FieldError } from "@/components/forms/field-error"
import { PendingSubmitButton } from "@/components/forms/pending-submit-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signContractShareAction } from "@/lib/actions/client-bureau"
import type { ActionResult, ContractPacket } from "@/lib/types"

const initialState: ActionResult<ContractPacket> = { ok: false, message: "" }

export function ContractSigningForm({ shareToken }: { shareToken: string }) {
  const [state, action] = useActionState(signContractShareAction, initialState)

  useEffect(() => {
    if (state.message) {
      toast[state.ok ? "success" : "error"](state.message)
    }
  }, [state])

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="shareToken" value={shareToken} />

      {state.ok ? (
        <Alert className="rounded-md border-emerald-200 bg-emerald-50 text-emerald-950">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          <AlertTitle>Signature recorded</AlertTitle>
          <AlertDescription>
            {state.message} Contract status: {state.data.signatureStatus?.replaceAll("_", " ") ?? "client signed"}.
          </AlertDescription>
          <button
            type="button"
            onClick={() => window.print()}
            className="mt-3 inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-100"
          >
            <Printer className="size-4" aria-hidden="true" />
            Print signed summary
          </button>
        </Alert>
      ) : state.message ? (
        <Alert variant="destructive" className="rounded-md">
          <AlertTitle>Review required</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="signerName">Your legal name</Label>
          <Input id="signerName" name="signerName" placeholder="Full name" />
          <FieldError name="signerName" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signerEmail">Email for verification</Label>
          <Input id="signerEmail" name="signerEmail" type="email" placeholder="you@example.com" />
          <FieldError name="signerEmail" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signatureName">Typed signature</Label>
        <Input id="signatureName" name="signatureName" placeholder="Type your name as your signature" />
        <FieldError name="signatureName" errors={state.ok ? undefined : state.fieldErrors} />
      </div>

      <div className="grid gap-3">
        <SigningCheck
          name="scopeReviewCertification"
          label="I reviewed the scope summary, included work, excluded work, change-order policy, and cancellation terms."
          errors={state.ok ? undefined : state.fieldErrors}
        />
        <SigningCheck
          name="paymentTermsCertification"
          label="I reviewed the documented payment terms, deposit amount, milestone schedule, and due-date context."
          errors={state.ok ? undefined : state.fieldErrors}
        />
        <SigningCheck
          name="consentToElectronicSignature"
          label="I consent to use electronic records and electronic signatures for this agreement."
          errors={state.ok ? undefined : state.fieldErrors}
        />
        <SigningCheck
          name="authorityCertification"
          label="I confirm I am authorized to review and sign this agreement."
          errors={state.ok ? undefined : state.fieldErrors}
        />
        <SigningCheck
          name="recordsCertification"
          label="I confirm I can access and keep a copy of the agreement electronically."
          errors={state.ok ? undefined : state.fieldErrors}
        />
      </div>

      <PendingSubmitButton pendingText="Recording signature..." className="bg-slate-950 text-white hover:bg-slate-800">
        <Signature aria-hidden="true" />
        Sign agreement
      </PendingSubmitButton>
    </form>
  )
}

function SigningCheck({
  name,
  label,
  errors,
}: {
  name: string
  label: string
  errors?: Record<string, string[]>
}) {
  return (
    <div>
      <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
        <Checkbox name={name} className="mt-1" />
        <span>{label}</span>
      </label>
      <FieldError name={name} errors={errors} />
    </div>
  )
}
