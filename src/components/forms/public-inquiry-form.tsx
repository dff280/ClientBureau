"use client"

import { useActionState, useEffect } from "react"
import { CheckCircle2, MailCheck, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import { FieldError } from "@/components/forms/field-error"
import { PendingSubmitButton } from "@/components/forms/pending-submit-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitPublicInquiryAction } from "@/lib/actions/client-bureau"
import type { ActionResult, PublicInquiry, PublicInquiryTopic, PublicInquiryType } from "@/lib/types"

const initialState: ActionResult<PublicInquiry> = {
  ok: false,
  message: "",
}

const topicOptions: Array<{ value: PublicInquiryTopic; label: string }> = [
  { value: "account_help", label: "Account help" },
  { value: "report_or_moderation", label: "Report or moderation" },
  { value: "client_response_or_correction", label: "Client response or correction" },
  { value: "profile_claim_or_verification", label: "Profile claim or verification" },
  { value: "enterprise_or_team_review", label: "Enterprise or team review" },
  { value: "privacy_or_policy", label: "Privacy or policy" },
  { value: "other", label: "Other" },
]

export function PublicInquiryForm({
  inquiryType = "general_support",
  defaultTopic,
  sourcePath,
  submitLabel,
  pendingLabel,
}: {
  inquiryType?: PublicInquiryType
  defaultTopic?: PublicInquiryTopic
  sourcePath: string
  submitLabel?: string
  pendingLabel?: string
}) {
  const [state, action] = useActionState(submitPublicInquiryAction, initialState)
  const topic = defaultTopic ?? (inquiryType === "enterprise" ? "enterprise_or_team_review" : "account_help")
  const formIdBase = `public-inquiry-${sourcePath.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "contact"}`

  useEffect(() => {
    if (state.message) toast[state.ok ? "success" : "error"](state.message)
  }, [state])

  return (
    <form action={action} className="grid gap-5 rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <input type="hidden" name="inquiryType" value={inquiryType} />
      <input type="hidden" name="sourcePath" value={sourcePath} />
      <div className="hidden" aria-hidden="true">
        <label htmlFor={`${formIdBase}-website`}>Website</label>
        <input id={`${formIdBase}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state.message ? (
        <Alert
          variant={state.ok ? "default" : "destructive"}
          className={state.ok ? "rounded-md border-emerald-200 bg-emerald-50 text-emerald-950" : "rounded-md"}
        >
          {state.ok ? <CheckCircle2 className="size-4" aria-hidden="true" /> : null}
          <AlertTitle>{state.ok ? "Inquiry received" : "Review required"}</AlertTitle>
          <AlertDescription>
            {state.message}
            {state.ok
              ? " Do not send raw evidence through general contact. Use the dashboard, client-response form, or profile-claim path when a request needs private documentation."
              : null}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <p className="font-semibold">General inquiry only</p>
        <p className="mt-1">
          Do not paste raw evidence, client phone numbers, private addresses, gate codes, invoices, contract files,
          screenshots, banking details, or sensitive identifiers here. We will route you to the correct private workflow if documentation is needed.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${formIdBase}-fullName`}>Name</Label>
          <Input id={`${formIdBase}-fullName`} name="fullName" autoComplete="name" placeholder="Your name" />
          <FieldError name="fullName" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${formIdBase}-email`}>Reply email</Label>
          <Input id={`${formIdBase}-email`} name="email" type="email" autoComplete="email" placeholder="Reply email for private follow-up" />
          <FieldError name="email" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${formIdBase}-businessName`}>Business name optional</Label>
          <Input id={`${formIdBase}-businessName`} name="businessName" autoComplete="organization" placeholder="Business or organization" />
          <FieldError name="businessName" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${formIdBase}-topic`}>Topic</Label>
          <select
            id={`${formIdBase}-topic`}
            name="topic"
            defaultValue={topic}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {topicOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError name="topic" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formIdBase}-message`}>How can we route this?</Label>
        <Textarea
          id={`${formIdBase}-message`}
          name="message"
          className="min-h-32"
          placeholder="Briefly describe the question or team need without including raw evidence, private contact details, or sensitive identifiers."
        />
        <FieldError name="message" errors={state.ok ? undefined : state.fieldErrors} />
      </div>

      <div>
        <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
          <input type="checkbox" name="privacyCertification" value="true" className="mt-1 size-4 rounded border-slate-300" />
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-amber-700" aria-hidden="true" />
          <span>
            <span className="block font-semibold text-slate-950">I understand this is a general inquiry.</span>
            <span className="mt-1 block text-xs leading-5 text-slate-600">
              Evidence, corrections, claims, report details, and client responses should use the dedicated private workflows.
            </span>
          </span>
        </label>
        <FieldError name="privacyCertification" errors={state.ok ? undefined : state.fieldErrors} />
      </div>

      <PendingSubmitButton pendingText={pendingLabel ?? "Sending inquiry..."} className="bg-slate-950 text-white hover:bg-slate-800">
        <MailCheck aria-hidden="true" />
        {submitLabel ?? (inquiryType === "enterprise" ? "Send enterprise inquiry" : "Send support inquiry")}
      </PendingSubmitButton>
    </form>
  )
}
