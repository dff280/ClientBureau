"use client"

import { useActionState, useEffect, useState } from "react"
import { CheckCircle2, FileText, ShieldCheck, UploadCloud } from "lucide-react"
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
  const [files, setFiles] = useState<File[]>([])

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

      <WorkflowStep
        step="1"
        title="Client identity"
        text="Use the identity details from the contract, invoice, or written project record. Email and phone are used only for private matching."
      >
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
            <Input id="email" name="email" type="email" placeholder="Not shown publicly" />
            <FieldError name="email" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Client phone for private matching</Label>
            <Input id="phone" name="phone" placeholder="Not shown publicly" />
          </div>
          <div className="grid grid-cols-[1fr_100px] gap-3 md:col-span-2">
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
      </WorkflowStep>

      <WorkflowStep step="2" title="Project details" text="Describe the contracted work and where it occurred. Use the project location, not a private street address.">
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
        </div>
      </WorkflowStep>

      <WorkflowStep step="3" title="Payment timeline" text="Select the report category and state the current payment status using neutral, documentable language.">
        <div className="grid gap-4 md:grid-cols-2">
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
            <Input id="paymentStatus" name="paymentStatus" placeholder="Final invoice partially unpaid as of May 30" />
            <FieldError name="paymentStatus" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
        </div>
      </WorkflowStep>

      <WorkflowStep step="4" title="Dispute context" text="Give moderators enough context to understand whether there is a known disagreement, documentation request, or resolution attempt.">
        <div className="space-y-2">
          <Label htmlFor="detailedExperience">Detailed experience for moderator</Label>
          <Textarea
            id="detailedExperience"
            name="detailedExperience"
            placeholder="Example: Contract signed March 2; substantial completion April 18; invoice sent April 19; two documented follow-ups; client requested additional documentation May 1."
            className="min-h-36"
          />
          <FieldError name="detailedExperience" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
      </WorkflowStep>

      <WorkflowStep step="5" title="Public summary" text="This is the starting point for the moderated public summary. Avoid private details, labels, or claims about intent.">
        <div className="space-y-2">
          <Label htmlFor="reportSummary">Public report summary</Label>
          <Textarea
            id="reportSummary"
            name="reportSummary"
            placeholder="A contractor-submitted report states that a final invoice remained partially unpaid after documented completion and follow-up communication."
            className="min-h-28"
          />
          <FieldError name="reportSummary" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
      </WorkflowStep>

      <WorkflowStep step="6" title="Evidence" text="Evidence is private by default. Public pages show only summaries such as invoices reviewed or documents reviewed.">
        <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-5">
          <UploadCloud className="mb-2 size-6 text-slate-500" aria-hidden="true" />
          <Input
            id="evidence"
            name="evidence"
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.webp,.heic,.doc,.docx,image/*,application/pdf"
            className="bg-white"
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          />
          {files.length > 0 ? (
            <div className="mt-3 grid gap-2">
              {files.map((file) => (
                <div key={`${file.name}-${file.size}`} className="flex items-center gap-2 rounded-md border border-slate-200 bg-white p-2 text-sm text-slate-700">
                  <FileText className="size-4 text-slate-500" aria-hidden="true" />
                  <span className="truncate">{file.name}</span>
                  <span className="ml-auto text-xs text-slate-500">{Math.ceil(file.size / 1024)} KB</span>
                </div>
              ))}
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-full rounded-full bg-emerald-600" />
              </div>
            </div>
          ) : null}
          <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="evidenceAttached" value="true" className="size-4 rounded border-slate-300" />
            Evidence is attached for moderator review
          </label>
        </div>
      </WorkflowStep>

      <WorkflowStep step="7" title="Review and attest" text="Before submission, confirm the report is accurate, documentable, and appropriate for moderation.">
        <div className="grid gap-3">
          <Attestation name="truthfulCertification" label="I certify this report is truthful to the best of my knowledge." errors={state.ok ? undefined : state.fieldErrors} />
          <Attestation name="documentationCertification" label="I can provide documentation or have accurately described the documentation available." errors={state.ok ? undefined : state.fieldErrors} />
          <Attestation name="publicSummaryCertification" label="The public summary avoids private information, personal attacks, and claims about motive." errors={state.ok ? undefined : state.fieldErrors} />
        </div>
      </WorkflowStep>

      <PendingSubmitButton
        pendingText="Queuing report..."
        className="bg-slate-950 text-white hover:bg-slate-800"
      >
        <ShieldCheck aria-hidden="true" />
        Submit report for review
      </PendingSubmitButton>
    </form>
  )
}

function WorkflowStep({
  step,
  title,
  text,
  children,
}: {
  step: string
  title: string
  text: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-slate-950 text-sm font-semibold text-white">
          {step}
        </span>
        <div>
          <h2 className="font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function Attestation({
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
        <input type="checkbox" name={name} value="true" className="mt-1 size-4 rounded border-slate-300" />
        <span>{label}</span>
      </label>
      <FieldError name={name} errors={errors} />
    </div>
  )
}
