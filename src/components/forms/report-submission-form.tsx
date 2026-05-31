"use client"

import { useActionState, useEffect } from "react"
import { CheckCircle2, UploadCloud } from "lucide-react"
import { toast } from "sonner"

import { FieldError } from "@/components/forms/field-error"
import { PendingSubmitButton } from "@/components/forms/pending-submit-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitClientReportAction } from "@/lib/actions/client-bureau"
import type { ActionResult, ClientReport } from "@/lib/types"
import { reportCategories } from "@/lib/types"

const initialState: ActionResult<ClientReport> = {
  ok: false,
  message: "",
}

interface ReportSubmissionFormProps {
  defaults?: Partial<Record<string, string>>
}

export function ReportSubmissionForm({ defaults = {} }: ReportSubmissionFormProps) {
  const [state, action] = useActionState(submitClientReportAction, initialState)

  useEffect(() => {
    if (state.message) {
      toast[state.ok ? "success" : "error"](state.message)
    }
  }, [state])

  return (
    <form action={action} className="grid gap-6">
      {state.ok ? (
        <Alert className="rounded-md border-emerald-200 bg-emerald-50 text-emerald-950">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          <AlertTitle>Report queued</AlertTitle>
          <AlertDescription>
            {state.message} Report ID: {state.data.id}. {state.data.moderationNote}
          </AlertDescription>
        </Alert>
      ) : state.message ? (
        <Alert variant="destructive" className="rounded-md">
          <AlertTitle>Review required</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">Client first name</Label>
          <Input id="firstName" name="firstName" defaultValue={defaults.firstName} placeholder="John" />
          <FieldError name="firstName" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Client last name</Label>
          <Input id="lastName" name="lastName" defaultValue={defaults.lastName} placeholder="Smith" />
          <FieldError name="lastName" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessName">Business name optional</Label>
          <Input id="businessName" name="businessName" defaultValue={defaults.businessName} placeholder="Smith Holdings" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Client email for private matching</Label>
          <Input id="email" name="email" type="email" placeholder="private match only" />
          <FieldError name="email" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Client phone for private matching</Label>
          <Input id="phone" name="phone" placeholder="private match only" />
        </div>
        <div className="grid grid-cols-[1fr_100px] gap-3">
          <div className="space-y-2">
            <Label htmlFor="city">Client city</Label>
            <Input id="city" name="city" defaultValue={defaults.city} placeholder="Orlando" />
            <FieldError name="city" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" name="state" defaultValue={defaults.state} placeholder="FL" />
            <FieldError name="state" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="projectType">Project type</Label>
          <Input id="projectType" name="projectType" placeholder="Kitchen remodel" />
          <FieldError name="projectType" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <div className="grid grid-cols-[1fr_100px] gap-3">
          <div className="space-y-2">
            <Label htmlFor="projectCity">Project city</Label>
            <Input id="projectCity" name="projectCity" defaultValue={defaults.city} placeholder="Orlando" />
            <FieldError name="projectCity" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectState">State</Label>
            <Input id="projectState" name="projectState" defaultValue={defaults.state} placeholder="FL" />
            <FieldError name="projectState" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contractAmount">Contract amount</Label>
          <Input id="contractAmount" name="contractAmount" type="number" placeholder="18400" />
          <FieldError name="contractAmount" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amountUnpaid">Amount unpaid</Label>
          <Input id="amountUnpaid" name="amountUnpaid" type="number" placeholder="4200" />
          <FieldError name="amountUnpaid" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reportCategory">Report category</Label>
          <select
            id="reportCategory"
            name="reportCategory"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {reportCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <FieldError name="reportCategory" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentStatus">Payment status</Label>
          <Input id="paymentStatus" name="paymentStatus" placeholder="Final invoice partially unpaid" />
          <FieldError name="paymentStatus" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reportSummary">Public report summary</Label>
        <Textarea
          id="reportSummary"
          name="reportSummary"
          placeholder="A contractor-submitted report states..."
          className="min-h-24"
        />
        <FieldError name="reportSummary" errors={state.ok ? undefined : state.fieldErrors} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="detailedExperience">Detailed experience for moderator</Label>
        <Textarea
          id="detailedExperience"
          name="detailedExperience"
          placeholder="Describe timeline, documentation, invoice status, and communication facts."
          className="min-h-32"
        />
        <FieldError name="detailedExperience" errors={state.ok ? undefined : state.fieldErrors} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="evidence">Evidence uploads</Label>
        <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-5">
          <UploadCloud className="mb-2 size-6 text-slate-500" aria-hidden="true" />
          <Input id="evidence" name="evidence" type="file" multiple className="bg-white" />
          <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="evidenceAttached" value="true" className="size-4 rounded border-slate-300" />
            Evidence is attached for moderator review
          </label>
          <p className="mt-2 text-xs text-slate-500">
            Future Supabase Storage bucket: `report-evidence`.
          </p>
        </div>
      </div>
      <PendingSubmitButton
        pendingText="Queuing report..."
        className="bg-slate-950 text-white hover:bg-slate-800"
      >
        Submit report for review
      </PendingSubmitButton>
    </form>
  )
}
