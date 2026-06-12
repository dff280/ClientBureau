"use client"

import { useActionState, useEffect, useState } from "react"
import { AlertTriangle, CheckCircle2, FileText, ShieldCheck, ThumbsUp, UploadCloud } from "lucide-react"
import { toast } from "sonner"

import { FieldError } from "@/components/forms/field-error"
import { PendingSubmitButton } from "@/components/forms/pending-submit-button"
import { StateSelect } from "@/components/forms/state-select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitClientReportAction } from "@/lib/actions/client-bureau"
import { clientTypes, jobStatuses, paymentDisputeStatuses } from "@/lib/locations"
import type { ActionResult, ClientReport, ProfileType, ReportCategory, ReportRelationshipType } from "@/lib/types"
import {
  clientProfileSubtypes,
  contractorProfileSubtypes,
  isPositiveReportCategory,
  positiveReportCategories,
  profileTypes,
  reportCategories,
  reportRelationshipTypes,
  subcontractorProfileSubtypes,
} from "@/lib/types"
import { cn } from "@/lib/utils"

const initialState: ActionResult<ClientReport> = {
  ok: false,
  message: "",
}

const profileTypeLabels: Record<ProfileType, string> = {
  client: "Client / homeowner / customer",
  contractor: "Contractor / service business",
  subcontractor: "Subcontractor / trade pro",
}

const relationshipLabels: Record<ReportRelationshipType, string> = {
  contractor_to_client: "I am a contractor reporting a client/customer",
  subcontractor_to_contractor: "I am a subcontractor reporting a contractor/business",
  contractor_to_subcontractor: "I am a contractor reporting a subcontractor/trade pro",
  client_to_contractor: "I am a client/customer reporting a contractor/business",
  business_to_business: "Business-to-business project relationship",
}

const profileSubtypeOptions: Record<ProfileType, readonly string[]> = {
  client: clientProfileSubtypes,
  contractor: contractorProfileSubtypes,
  subcontractor: subcontractorProfileSubtypes,
}

function defaultRelationshipForProfile(type: ProfileType): ReportRelationshipType {
  if (type === "contractor") return "subcontractor_to_contractor"
  if (type === "subcontractor") return "contractor_to_subcontractor"

  return "contractor_to_client"
}

interface ReportSubmissionFormProps {
  defaults?: Partial<Record<string, string>>
}

export function ReportSubmissionForm({ defaults = {} }: ReportSubmissionFormProps) {
  const [state, action] = useActionState(submitClientReportAction, initialState)
  const [files, setFiles] = useState<File[]>([])
  const initialCategory = defaults.intent === "positive" ? positiveReportCategories[0] : reportCategories[0]
  const initialProfileType = profileTypes.includes(defaults.profileType as ProfileType) ? defaults.profileType as ProfileType : "client"
  const [subjectProfileType, setSubjectProfileType] = useState<ProfileType>(initialProfileType)
  const [relationshipType, setRelationshipType] = useState<ReportRelationshipType>(
    reportRelationshipTypes.includes(defaults.relationshipType as ReportRelationshipType)
      ? (defaults.relationshipType as ReportRelationshipType)
      : defaultRelationshipForProfile(initialProfileType),
  )
  const [reportCategory, setReportCategory] = useState<ReportCategory>(initialCategory)
  const [amountUnpaid, setAmountUnpaid] = useState(defaults.amountUnpaid ?? "")
  const isPositiveReport = isPositiveReportCategory(reportCategory)
  const isBusinessProfileReport = subjectProfileType === "contractor" || subjectProfileType === "subcontractor"

  useEffect(() => {
    if (state.message) {
      toast[state.ok ? "success" : "error"](state.message)
    }
  }, [state])

  return (
    <form action={action} className="grid gap-6">
      <input type="hidden" name="reportIntent" value={isPositiveReport ? "positive" : "concern"} />
      {defaults.profileId ? <input type="hidden" name="subjectProfileId" value={defaults.profileId} /> : null}
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
        title="Who is this experience about?"
        text="Choose the role of the person or business connected to the job. More complete identity data improves private matching, but raw email and phone are never shown publicly."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="subjectProfileType">Profile type</Label>
            <select
              id="subjectProfileType"
              name="subjectProfileType"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              value={subjectProfileType}
              onChange={(event) => {
                const nextType = event.target.value as ProfileType
                setSubjectProfileType(nextType)
                setRelationshipType(defaultRelationshipForProfile(nextType))
              }}
            >
              {profileTypes.map((type) => (
                <option key={type} value={type}>{profileTypeLabels[type]}</option>
              ))}
            </select>
            <FieldError name="subjectProfileType" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subjectProfileSubtype">Profile subtype</Label>
            <select
              key={subjectProfileType}
              id="subjectProfileSubtype"
              name="subjectProfileSubtype"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              defaultValue={defaults.profileSubtype ?? ""}
            >
              <option value="">Select best fit</option>
              {profileSubtypeOptions[subjectProfileType].map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <FieldError name="subjectProfileSubtype" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="relationshipType">Relationship</Label>
            <select
              id="relationshipType"
              name="relationshipType"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              value={relationshipType}
              onChange={(event) => setRelationshipType(event.target.value as ReportRelationshipType)}
            >
              {reportRelationshipTypes.map((type) => (
                <option key={type} value={type}>{relationshipLabels[type]}</option>
              ))}
            </select>
            <FieldError name="relationshipType" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientType">Reported party type</Label>
            <select id="clientType" name="clientType" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50" defaultValue="Individual">
              {clientTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <FieldError name="clientType" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          {isBusinessProfileReport ? (
            <div className="md:col-span-2">
              <RoleRequirementsPanel profileType={subjectProfileType} />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="businessName">
              {isBusinessProfileReport ? "Business or display name" : "Business name optional"}
            </Label>
            <Input
              id="businessName"
              name="businessName"
              defaultValue={defaults.businessName}
              placeholder={isBusinessProfileReport ? "Bright Line Electric" : "ABC Property Group"}
            />
            <FieldError name="businessName" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">Reported party first name</Label>
            <Input id="firstName" name="firstName" defaultValue={defaults.firstName} placeholder="John" />
            <FieldError name="firstName" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Reported party last name</Label>
            <Input id="lastName" name="lastName" defaultValue={defaults.lastName} placeholder="Smith" />
            <FieldError name="lastName" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email for private matching</Label>
            <Input id="email" name="email" type="email" placeholder="Not shown publicly" />
            <FieldError name="email" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone for private matching</Label>
            <Input id="phone" name="phone" placeholder="Not shown publicly" />
          </div>
          <div className="grid gap-3 md:col-span-2 md:grid-cols-[1fr_180px_120px]">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" defaultValue={defaults.city} placeholder="Orlando" />
              <FieldError name="city" errors={state.ok ? undefined : state.fieldErrors} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <StateSelect id="state" name="state" defaultValue={defaults.state} />
              <FieldError name="state" errors={state.ok ? undefined : state.fieldErrors} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP optional</Label>
              <Input id="zip" name="zip" inputMode="numeric" placeholder="32801" />
              <FieldError name="zip" errors={state.ok ? undefined : state.fieldErrors} />
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="jobAddress">Job address optional and private</Label>
            <Input id="jobAddress" name="jobAddress" placeholder="Street address is used only for moderation/private matching" autoComplete="street-address" />
            <p className="text-xs leading-5 text-slate-500">Public profiles show city/state only. Street addresses are not published.</p>
            <FieldError name="jobAddress" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
        </div>
      </WorkflowStep>

      <WorkflowStep step="2" title="Project details" text="Describe the contracted work and where it occurred. Use the project location, not a private street address.">
        <div className="grid gap-4 md:grid-cols-2">
          {defaults.projectJobId ? <input type="hidden" name="projectJobId" value={defaults.projectJobId} /> : null}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="projectJobTitle">Project/job label{isBusinessProfileReport ? " required" : ""}</Label>
            <Input id="projectJobTitle" name="projectJobTitle" defaultValue={defaults.projectJobTitle} placeholder="Smith kitchen remodel, Orlando" />
            <p className="text-xs leading-5 text-slate-500">
              This creates a private job record that connects reports, evidence, contracts, responses, and future updates.
            </p>
            <FieldError name="projectJobTitle" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tradeCategory">Trade or service category{isBusinessProfileReport ? " required" : ""}</Label>
            <Input id="tradeCategory" name="tradeCategory" placeholder="Painting, roofing, remodeling, HVAC" />
            <FieldError name="tradeCategory" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectType">Project type</Label>
            <Input id="projectType" name="projectType" placeholder="Kitchen remodel" />
            <FieldError name="projectType" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jobType">Job type{isBusinessProfileReport ? " required" : ""}</Label>
            <Input id="jobType" name="jobType" placeholder="Residential repaint, emergency repair, commercial install" />
            <FieldError name="jobType" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jobStatus">Job status{isBusinessProfileReport ? " required" : ""}</Label>
            <select id="jobStatus" name="jobStatus" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50" defaultValue="">
              <option value="">Select status</option>
              {jobStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <FieldError name="jobStatus" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
            <div className="space-y-2">
              <Label htmlFor="projectCity">Project city</Label>
              <Input id="projectCity" name="projectCity" defaultValue={defaults.city} placeholder="Orlando" />
              <FieldError name="projectCity" errors={state.ok ? undefined : state.fieldErrors} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectState">State</Label>
              <StateSelect id="projectState" name="projectState" defaultValue={defaults.state} />
              <FieldError name="projectState" errors={state.ok ? undefined : state.fieldErrors} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="jobStartDate">Job start date optional</Label>
              <Input id="jobStartDate" name="jobStartDate" type="date" />
              <FieldError name="jobStartDate" errors={state.ok ? undefined : state.fieldErrors} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobCompletionDate">Completion date optional</Label>
              <Input id="jobCompletionDate" name="jobCompletionDate" type="date" />
              <FieldError name="jobCompletionDate" errors={state.ok ? undefined : state.fieldErrors} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contractAmount">Contract amount</Label>
            <Input id="contractAmount" name="contractAmount" type="number" placeholder="18400" />
            <FieldError name="contractAmount" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="depositRequested">Deposit requested optional</Label>
              <Input id="depositRequested" name="depositRequested" type="number" min="0" placeholder="2500" />
              <FieldError name="depositRequested" errors={state.ok ? undefined : state.fieldErrors} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="depositPaid">Deposit paid optional</Label>
              <Input id="depositPaid" name="depositPaid" type="number" min="0" placeholder="2500" />
              <FieldError name="depositPaid" errors={state.ok ? undefined : state.fieldErrors} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="finalInvoiceAmount">Final invoice amount optional</Label>
              <Input id="finalInvoiceAmount" name="finalInvoiceAmount" type="number" min="0" placeholder="18400" />
              <FieldError name="finalInvoiceAmount" errors={state.ok ? undefined : state.fieldErrors} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="materialsPurchasedAmount">Materials purchased optional</Label>
              <Input id="materialsPurchasedAmount" name="materialsPurchasedAmount" type="number" min="0" placeholder="4200" />
              <FieldError name="materialsPurchasedAmount" errors={state.ok ? undefined : state.fieldErrors} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amountUnpaid">
              {isPositiveReport ? "Amount unpaid" : "Amount unpaid"}
            </Label>
            <Input
              id="amountUnpaid"
              name="amountUnpaid"
              type="number"
              min="0"
              value={isPositiveReport ? "0" : amountUnpaid}
              readOnly={isPositiveReport}
              placeholder={isPositiveReport ? "0" : "4200"}
              onChange={(event) => setAmountUnpaid(event.target.value)}
            />
            <p className="text-xs leading-5 text-slate-500">
              {isPositiveReport
                ? "Positive reports must show no unpaid amount. Use payment status to describe paid, resolved, or would-work-again context."
                : "Enter the amount currently represented as unpaid or unresolved. Use 0 if the issue is resolved."}
            </p>
            <FieldError name="amountUnpaid" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="grid content-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="signedContract" value="true" className="size-4 rounded border-slate-300" />
              Signed contract or proposal exists
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="writtenChangeOrder" value="true" className="size-4 rounded border-slate-300" />
              Written change order exists
            </label>
          </div>
        </div>
      </WorkflowStep>

      <WorkflowStep
        step="3"
        title="Experience type and payment timeline"
        text="Choose whether this is a concern report or a positive client recommendation. Both paths require a real business relationship, moderation, and documentation."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <ReportIntentCard
            active={!isPositiveReport}
            icon={<AlertTriangle className="size-5" aria-hidden="true" />}
            title="Document a concern"
            text="Use for payment issues, scope changes, cancellations, chargebacks, or other project concerns."
            onClick={() => setReportCategory("Non-payment")}
          />
          <ReportIntentCard
            active={isPositiveReport}
            icon={<ThumbsUp className="size-5" aria-hidden="true" />}
            title="Recommend a client"
            text="Use for paid-on-time, cooperative, professional, or would-work-with-again experiences."
            onClick={() => setReportCategory("Positive experience")}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="reportCategory">Report category</Label>
            <select
              id="reportCategory"
              name="reportCategory"
              value={reportCategory}
              onChange={(event) => setReportCategory(event.target.value as ReportCategory)}
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
            <Label htmlFor="secondaryCategory">Secondary category optional</Label>
            <select
              id="secondaryCategory"
              name="secondaryCategory"
              defaultValue=""
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">No secondary category</option>
              {reportCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <FieldError name="secondaryCategory" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentStatus">Payment status</Label>
            <Input
              id="paymentStatus"
              name="paymentStatus"
              placeholder={
                isPositiveReport
                  ? "Paid on schedule; no open payment issue"
                  : "Final invoice partially unpaid as of May 30"
              }
            />
            <FieldError name="paymentStatus" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="disputeStatus">Payment/dispute status</Label>
            <select id="disputeStatus" name="disputeStatus" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50" defaultValue={isPositiveReport ? "No payment issue" : ""}>
              <option value="">Select status</option>
              {paymentDisputeStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <FieldError name="disputeStatus" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="grid gap-3 md:col-span-2 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amountDisputed">Amount disputed optional</Label>
              <Input id="amountDisputed" name="amountDisputed" type="number" min="0" placeholder="1200" />
              <FieldError name="amountDisputed" errors={state.ok ? undefined : state.fieldErrors} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="daysOverdue">Days overdue optional</Label>
              <Input id="daysOverdue" name="daysOverdue" type="number" min="0" placeholder="30" />
              <FieldError name="daysOverdue" errors={state.ok ? undefined : state.fieldErrors} />
            </div>
          </div>
          <div className="grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:col-span-2 sm:grid-cols-2">
            {[
              ["clientResponded", "Client responded"],
              ["issueResolved", "Issue resolved"],
              ["paymentReminderSent", "Payment reminder sent"],
              ["demandLetterSent", "Demand letter sent"],
              ["lienNoticeStarted", "Lien notice/legal process started"],
            ].map(([name, label]) => (
              <label key={name} className="flex items-center gap-2">
                <input type="checkbox" name={name} value="true" className="size-4 rounded border-slate-300" />
                {label}
              </label>
            ))}
          </div>
        </div>
      </WorkflowStep>

      <WorkflowStep step="4" title="Dispute context" text="Give moderators enough context to understand whether there is a known disagreement, documentation request, or resolution attempt.">
        <div className="space-y-2">
          <Label htmlFor="detailedExperience">Detailed experience for moderator</Label>
          <Textarea
            id="detailedExperience"
            name="detailedExperience"
            placeholder={
              isPositiveReport
                ? "Example: Contract signed March 2; milestones were approved promptly; payment was received according to the agreement; communication was professional through completion."
                : "Example: Contract signed March 2; substantial completion April 18; invoice sent April 19; two documented follow-ups; client requested additional documentation May 1."
            }
            className="min-h-36"
          />
          <FieldError name="detailedExperience" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <StructuredTextarea name="whatWasAgreed" label="What was agreed?" placeholder="Briefly describe the agreed scope, price, timeline, or payment terms." errors={state.ok ? undefined : state.fieldErrors} />
          <StructuredTextarea name="workCompleted" label="What work was completed?" placeholder="Describe completed labor, materials, milestones, approvals, or delivery." errors={state.ok ? undefined : state.fieldErrors} />
          <StructuredTextarea name="paymentIssue" label="What payment or dispute issue occurred?" placeholder="Describe the reported issue using factual, neutral wording." errors={state.ok ? undefined : state.fieldErrors} />
          <StructuredTextarea name="evidenceSupport" label="What evidence supports this?" placeholder="List invoices, contracts, messages, photos, receipts, change orders, or notices." errors={state.ok ? undefined : state.fieldErrors} />
          <div className="md:col-span-2">
            <StructuredTextarea name="desiredResolution" label="What would resolve the issue?" placeholder="Describe payment, correction, documentation, or resolution terms that would close the matter." errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="resolutionSummary">Resolution summary optional</Label>
            <Textarea id="resolutionSummary" name="resolutionSummary" placeholder="If resolved or partially resolved, describe the current outcome." className="min-h-24" />
            <FieldError name="resolutionSummary" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
        </div>
      </WorkflowStep>

      <WorkflowStep step="5" title="Public summary" text="This is the starting point for the moderated public summary. Avoid private details, labels, or claims about intent.">
        <div className="space-y-2">
          <Label htmlFor="reportSummary">Public report summary</Label>
          <Textarea
            id="reportSummary"
            name="reportSummary"
            placeholder={
              isPositiveReport
                ? "A contractor-submitted positive report states that the client paid according to the agreement and maintained clear project communication."
                : "A contractor-submitted report states that a final invoice remained partially unpaid after documented completion and follow-up communication."
            }
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
          <Attestation name="relationshipCertification" label="I confirm I had a real commercial relationship with the reported party." errors={state.ok ? undefined : state.fieldErrors} />
          <Attestation name="truthfulCertification" label="I certify this report is truthful to the best of my knowledge." errors={state.ok ? undefined : state.fieldErrors} />
          <Attestation name="documentationCertification" label="I can provide documentation or have accurately described the documentation available." errors={state.ok ? undefined : state.fieldErrors} />
          <Attestation
            name="publicSummaryCertification"
            label={
              isPositiveReport
                ? "The public summary describes a positive reported experience without private details or exaggerated claims."
                : "The public summary avoids private information, personal attacks, and claims about motive."
            }
            errors={state.ok ? undefined : state.fieldErrors}
          />
          <Attestation name="moderationCertification" label="I understand public summaries are moderated before publication." errors={state.ok ? undefined : state.fieldErrors} />
          <Attestation name="evidencePrivacyCertification" label="I understand private evidence is not automatically public." errors={state.ok ? undefined : state.fieldErrors} />
          <Attestation name="responseRightCertification" label="I understand reported parties may respond or request correction." errors={state.ok ? undefined : state.fieldErrors} />
          <Attestation name="noHarassmentCertification" label="I will not include threats, harassment, or sensitive personal information in public summaries." errors={state.ok ? undefined : state.fieldErrors} />
        </div>
      </WorkflowStep>

      <PendingSubmitButton
        pendingText="Queuing report..."
        className="bg-slate-950 text-white hover:bg-slate-800"
      >
        <ShieldCheck aria-hidden="true" />
        Submit for Moderation
      </PendingSubmitButton>
    </form>
  )
}

function ReportIntentCard({
  active,
  icon,
  title,
  text,
  onClick,
}: {
  active: boolean
  icon: React.ReactNode
  title: string
  text: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border p-4 text-left transition hover:border-slate-400",
        active
          ? "border-slate-950 bg-slate-950 text-white shadow-sm"
          : "border-slate-200 bg-slate-50 text-slate-700",
      )}
    >
      <span
        className={cn(
          "mb-3 flex size-10 items-center justify-center rounded-md",
          active ? "bg-white/10 text-amber-200" : "bg-white text-amber-700",
        )}
      >
        {icon}
      </span>
      <span className="block font-semibold">{title}</span>
      <span className={cn("mt-2 block text-sm leading-6", active ? "text-slate-200" : "text-slate-600")}>
        {text}
      </span>
    </button>
  )
}

function RoleRequirementsPanel({ profileType }: { profileType: ProfileType }) {
  const isSubcontractor = profileType === "subcontractor"
  const title = isSubcontractor
    ? "Subcontractor reports need trade and payment-chain context."
    : "Contractor reports need business relationship context."
  const items = isSubcontractor
    ? [
        "Choose the trade subtype, such as licensed subcontractor, crew, installer, or specialty trade.",
        "Use contractor-to-subcontractor or business-to-business relationship context.",
        "Include trade category, job status, scope agreement, completed work, and evidence description.",
        "For concerns, describe payment-chain, retainage, scope, or dispute context in neutral terms.",
      ]
    : [
        "Choose the contractor subtype, such as general contractor, service business, or specialty contractor.",
        "Use subcontractor-to-contractor, client-to-contractor, or business-to-business relationship context.",
        "Include service category, job status, scope agreement, completed work, and evidence description.",
        "For concerns, describe payment, scope, schedule, or dispute context in neutral terms.",
      ]

  return (
    <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
      <p className="font-semibold">{title}</p>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {items.map((item) => (
          <div key={item} className="flex gap-2 leading-6">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-blue-700" aria-hidden="true" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
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

function StructuredTextarea({
  name,
  label,
  placeholder,
  errors,
}: {
  name: string
  label: string
  placeholder: string
  errors?: Record<string, string[]>
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Textarea id={name} name={name} placeholder={placeholder} className="min-h-28" />
      <FieldError name={name} errors={errors} />
    </div>
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
