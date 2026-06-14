"use client"

import Link from "next/link"
import { useActionState } from "react"
import { ArrowRight, BriefcaseBusiness, ClipboardList, FileText, MapPin, Plus, ShieldCheck, Trash2, Users, type LucideIcon } from "lucide-react"

import {
  addProjectJobParticipantAction,
  createProjectJobAction,
  removeProjectJobParticipantAction,
  updateProjectJobAction,
  updateProjectJobParticipantAction,
} from "@/lib/actions/client-bureau"
import { FieldError } from "@/components/forms/field-error"
import { PendingSubmitButton } from "@/components/forms/pending-submit-button"
import { StateSelect } from "@/components/forms/state-select"
import { TradeCategorySelect } from "@/components/forms/trade-category-select"
import { DashboardSection, StatusBadge, StatCard } from "@/components/dashboard/dashboard-ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { profileTypeLabel } from "@/lib/entity-profiles"
import type { ActionResult, EntityProfile, ProjectJob, ProjectJobDetail, ProjectJobParticipant } from "@/lib/types"
import {
  jobBillingRelationships,
  jobParticipantStatuses,
  projectJobPriorities,
  projectJobStatuses,
  projectJobTypes,
  projectProfileRoles,
  projectPropertyTypes,
} from "@/lib/types"

const jobState: ActionResult<ProjectJob> = { ok: false, message: "" }
const participantState: ActionResult<ProjectJobParticipant> = { ok: false, message: "" }

function labelize(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function ActionMessage<T>({ state }: { state: ActionResult<T> }) {
  if (!state.message) return null

  return (
    <p className={state.ok ? "text-sm font-medium text-emerald-700" : "text-sm font-medium text-red-700"}>
      {state.message}
    </p>
  )
}

function SelectField({
  defaultValue,
  label,
  name,
  options,
}: {
  defaultValue?: string
  label: string
  name: string
  options: readonly string[]
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-slate-700 outline-none transition focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <option value="" disabled>Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>{labelize(option)}</option>
        ))}
      </select>
    </div>
  )
}

function JobFormFields({ job }: { job?: ProjectJob }) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="title">Job name</Label>
          <Input id="title" name="title" defaultValue={job?.title} placeholder="Pool deck painting after pool remodel" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="jobNumber">Job number</Label>
          <Input id="jobNumber" name="jobNumber" defaultValue={job?.jobNumber} placeholder="Generated if left blank" />
        </div>
        <SelectField label="Job status" name="status" options={projectJobStatuses} defaultValue={job?.status ?? "lead"} />
        <SelectField label="Job type" name="jobType" options={projectJobTypes} defaultValue={job?.jobType ?? "direct_client_job"} />
        <SelectField label="Priority" name="priority" options={projectJobPriorities} defaultValue={job?.priority ?? "normal"} />
        <TradeCategorySelect
          id="projectType"
          name="projectType"
          otherName="otherProjectTypeDetail"
          defaultValue={job?.projectType}
          label="Service type"
          required
        />
        <TradeCategorySelect
          id="tradeCategory"
          name="tradeCategory"
          otherName="otherTradeCategoryDetail"
          defaultValue={job?.tradeCategory}
          label="Trade category"
        />
        <div className="grid gap-2">
          <Label htmlFor="contractAmount">Contract value</Label>
          <Input id="contractAmount" name="contractAmount" type="number" min="0" step="0.01" defaultValue={job?.contractAmount ?? 0} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="amountDue">Amount currently due</Label>
          <Input id="amountDue" name="amountDue" type="number" min="0" step="0.01" defaultValue={job?.amountDue ?? 0} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="shortDescription">Short description</Label>
        <Textarea id="shortDescription" name="shortDescription" defaultValue={job?.shortDescription} placeholder="Plain-English summary of the job." required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="detailedScopeOfWork">Scope of work</Label>
        <Textarea id="detailedScopeOfWork" name="detailedScopeOfWork" defaultValue={job?.detailedScopeOfWork} placeholder="What is included, what is excluded, and how the scope is documented." />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="addressLine1">Address line 1</Label>
          <Input id="addressLine1" name="addressLine1" defaultValue={job?.addressLine1} placeholder="Private job address" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="addressLine2">Address line 2</Label>
          <Input id="addressLine2" name="addressLine2" defaultValue={job?.addressLine2} placeholder="Unit, gate, building, suite" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" defaultValue={job?.city} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="state">State</Label>
          <StateSelect id="state" name="state" defaultValue={job?.state} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="postalCode">Postal code</Label>
          <Input id="postalCode" name="postalCode" defaultValue={job?.postalCode} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="county">County</Label>
          <Input id="county" name="county" defaultValue={job?.county} />
        </div>
        <SelectField label="Property type" name="propertyType" options={projectPropertyTypes} defaultValue={job?.propertyType ?? "residential"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="startDate">Start date</Label>
          <Input id="startDate" name="startDate" type="date" defaultValue={job?.startDate} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="targetCompletionDate">Target completion</Label>
          <Input id="targetCompletionDate" name="targetCompletionDate" type="date" defaultValue={job?.targetCompletionDate} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="completionDate">Completed date</Label>
          <Input id="completionDate" name="completionDate" type="date" defaultValue={job?.completionDate} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="accessInstructions">Access instructions</Label>
          <Textarea id="accessInstructions" name="accessInstructions" defaultValue={job?.accessInstructions} placeholder="How the crew gets access. Kept private." />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="privateAccessCode">Gate / lockbox code</Label>
          <Input id="privateAccessCode" name="privateAccessCode" defaultValue={job?.privateAccessCode} placeholder="Private field" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="parkingInstructions">Parking instructions</Label>
          <Textarea id="parkingInstructions" name="parkingInstructions" defaultValue={job?.parkingInstructions} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="siteWarnings">Site warnings / safety notes</Label>
          <Textarea id="siteWarnings" name="siteWarnings" defaultValue={job?.siteWarnings} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="customerFacingNotes">Customer-facing notes</Label>
          <Textarea id="customerFacingNotes" name="customerFacingNotes" defaultValue={job?.customerFacingNotes} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="privateNotes">Internal notes</Label>
          <Textarea id="privateNotes" name="privateNotes" defaultValue={job?.privateNotes} />
        </div>
      </div>
    </div>
  )
}

export function JobsWorkspace({ accounts, jobs }: { accounts: EntityProfile[]; jobs: ProjectJob[] }) {
  const [state, formAction] = useActionState(createProjectJobAction, jobState)

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-md border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-5 text-white shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Private project files</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal">Jobs connect the real work, the site, and every person involved.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Use Jobs before the work starts and keep them updated during the project. A job is private by default:
              public profiles never show addresses, access codes, internal notes, or participant notes.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <JobValueCard icon={MapPin} title="Site info" text="Property, schedule, access, parking, and safety notes." />
            <JobValueCard icon={ClipboardList} title="Scope" text="Included work, trade category, amount due, and private notes." />
            <JobValueCard icon={Users} title="Roles" text="Attach the same account as different roles on different jobs." />
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Private jobs" value={jobs.length} helper="Project records in this account." icon={BriefcaseBusiness} />
        <StatCard label="Active" value={jobs.filter((job) => !["completed", "cancelled", "archived"].includes(job.status)).length} helper="Open or scheduled work." icon={MapPin} tone="blue" />
        <StatCard label="Accounts available" value={accounts.length} helper="Existing profiles you can attach." icon={Users} tone="amber" />
      </div>

      <DashboardSection
        eyebrow="Start here"
        title="Create a private job record"
        description="Create one job for each real project. Then attach the client, property owner, contractor, subcontractor, vendor, or crew profiles that belong to that specific job."
      >
        <details open={jobs.length === 0 || Boolean(state.message)} className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <summary className="flex cursor-pointer list-none flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <span>
              <span className="font-semibold text-slate-950">{jobs.length === 0 ? "Create your first job" : "Create another job"}</span>
              <span className="mt-1 block text-sm leading-6 text-slate-600">
                Keep the full form hidden until you need it, so the dashboard stays simple.
              </span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
              <Plus className="size-4" aria-hidden="true" />
              Open form
            </span>
          </summary>
          <form action={formAction} className="mt-5 space-y-5 rounded-md border border-slate-200 bg-white p-4">
            <JobFormFields />
            <FieldError name="title" errors={state.ok ? undefined : state.fieldErrors} />
            <FieldError name="addressLine1" errors={state.ok ? undefined : state.fieldErrors} />
            <ActionMessage state={state} />
            <PendingSubmitButton className="bg-slate-950 text-white hover:bg-slate-800" pendingText="Creating job...">
              <Plus aria-hidden="true" />
              Create job
            </PendingSubmitButton>
          </form>
        </details>
      </DashboardSection>

      <DashboardSection
        eyebrow="Job list"
        title="Current jobs"
        description="Open a job to manage property details, scope, and job-specific participants."
      >
        <div className="grid gap-3">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/dashboard/jobs/${job.id}`}
              className="group rounded-md border border-slate-200 bg-slate-50 p-4 transition hover:border-amber-300 hover:bg-white"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-950">{job.title}</h3>
                    <StatusBadge tone={job.priority === "urgent" || job.priority === "high" ? "amber" : "slate"}>{labelize(job.status)}</StatusBadge>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {job.city}, {job.state} / {labelize(job.jobType ?? "direct_client_job")} / {job.projectType}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{job.jobNumber ?? job.id}</p>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700">
                  Open job <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
          {jobs.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6">
              <h3 className="font-semibold text-slate-950">No jobs yet.</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Create the first job above, then attach existing client, contractor, subcontractor, vendor, or crew profiles as participants.
              </p>
            </div>
          ) : null}
        </div>
      </DashboardSection>
    </div>
  )
}

function ParticipantFormFields({
  accounts,
  participant,
}: {
  accounts: EntityProfile[]
  participant?: ProjectJobParticipant
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="grid gap-2">
        <Label htmlFor={participant ? `accountId-${participant.id}` : "accountId"}>Existing account/profile</Label>
        <select
          id={participant ? `accountId-${participant.id}` : "accountId"}
          name="accountId"
          defaultValue={participant?.profileId ?? ""}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-slate-700 outline-none transition focus-visible:ring-3 focus-visible:ring-ring/50"
          required
        >
          <option value="" disabled>Select existing account</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.displayName} / {labelize(account.profileType)} / {account.city}, {account.state}
            </option>
          ))}
        </select>
      </div>
      <SelectField label="Role on this job" name="roleOnJob" options={projectProfileRoles} defaultValue={participant?.role ?? "client"} />
      <div className="grid gap-2">
        <Label htmlFor={participant ? `hiredByAccountId-${participant.id}` : "hiredByAccountId"}>Hired by / reports to account</Label>
        <select
          id={participant ? `hiredByAccountId-${participant.id}` : "hiredByAccountId"}
          name="hiredByAccountId"
          defaultValue={participant?.hiredByProfileId ?? ""}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-slate-700 outline-none transition focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">Not specified</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>{account.displayName}</option>
          ))}
        </select>
      </div>
      <SelectField label="Billing relationship" name="billingRelationship" options={jobBillingRelationships} defaultValue={participant?.billingRelationship} />
      <SelectField label="Participant status" name="participantStatus" options={jobParticipantStatuses} defaultValue={participant?.participantStatus ?? "active"} />
      <div className="grid gap-2">
        <Label htmlFor={participant ? `contractAmount-${participant.id}` : "contractAmount"}>Agreed amount</Label>
        <Input id={participant ? `contractAmount-${participant.id}` : "contractAmount"} name="contractAmount" type="number" min="0" step="0.01" defaultValue={participant?.contractAmount ?? 0} />
      </div>
      <div className="grid gap-2 lg:col-span-2">
        <Label htmlFor={participant ? `scopeAssigned-${participant.id}` : "scopeAssigned"}>Scope assigned</Label>
        <Textarea id={participant ? `scopeAssigned-${participant.id}` : "scopeAssigned"} name="scopeAssigned" defaultValue={participant?.scopeAssigned} />
      </div>
      <div className="grid gap-2 lg:col-span-2">
        <Label htmlFor={participant ? `notes-${participant.id}` : "notes"}>Private notes</Label>
        <Textarea id={participant ? `notes-${participant.id}` : "notes"} name="notes" defaultValue={participant?.notes} />
      </div>
    </div>
  )
}

export function JobDetailWorkspace({ accounts, job }: { accounts: EntityProfile[]; job: ProjectJobDetail }) {
  const [jobUpdateState, jobUpdateAction] = useActionState(updateProjectJobAction, jobState)
  const [addState, addAction] = useActionState(addProjectJobParticipantAction, participantState)
  const [updateState, updateAction] = useActionState(updateProjectJobParticipantAction, participantState)
  const [removeState, removeAction] = useActionState(removeProjectJobParticipantAction, participantState)
  const visibleParticipants = job.participants.filter((participant) => participant.participantStatus !== "removed")

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Status" value={labelize(job.status)} helper="Current job stage." />
        <StatCard label="Priority" value={labelize(job.priority ?? "normal")} helper="Used for daily triage." tone={job.priority === "urgent" || job.priority === "high" ? "amber" : "slate"} />
        <StatCard label="Participants" value={visibleParticipants.length} helper="Accounts attached to this job." icon={Users} tone="blue" />
        <StatCard label="Value" value={`$${job.contractAmount.toLocaleString()}`} helper="Private contract value." tone="emerald" />
      </div>

      <div className="grid gap-3 lg:grid-cols-4">
        <JobActionLink href="/dashboard/contracts" icon={FileText} title="Create contract packet" text="Turn the job scope into a private signing packet." />
        <JobActionLink href="/submit-report" icon={ClipboardList} title="Report an experience" text="Document client, contractor, or subcontractor context." />
        <JobActionLink href="/dashboard/evidence" icon={ShieldCheck} title="Organize evidence" text="Attach invoices, photos, contracts, and messages privately." />
        <JobActionLink href="/dashboard/recovery" icon={BriefcaseBusiness} title="Payment recovery" text="Open a managed case if payment becomes an issue." />
      </div>

      <DashboardSection
        eyebrow="Job information"
        title="Edit job details"
        description="This private record tracks the project identity, property, schedule, scope, and internal notes."
      >
        <form action={jobUpdateAction} className="space-y-5">
          <input type="hidden" name="jobId" value={job.id} />
          <JobFormFields job={job} />
          <ActionMessage state={jobUpdateState} />
          <PendingSubmitButton className="bg-slate-950 text-white hover:bg-slate-800" pendingText="Saving job...">
            Save job details
          </PendingSubmitButton>
        </form>
      </DashboardSection>

      <DashboardSection
        eyebrow="Participants"
        title="Attach existing accounts to this job"
        description="Assign roles for this job only. The underlying account can be a contractor on one job and a subcontractor on another."
      >
        <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <p className="font-semibold">Important: account type is not the same as role on this job.</p>
          <p className="mt-1">
            Pick an existing account/profile, then choose what role it played on this project. Removing a participant only removes that role from this job. It does not delete the account, public profile, reports, or history.
          </p>
        </div>

        <form action={addAction} className="space-y-5 rounded-md border border-slate-200 bg-slate-50 p-4">
          <input type="hidden" name="jobId" value={job.id} />
          <ParticipantFormFields accounts={accounts} />
          <FieldError name="accountId" errors={addState.ok ? undefined : addState.fieldErrors} />
          <FieldError name="roleOnJob" errors={addState.ok ? undefined : addState.fieldErrors} />
          <ActionMessage state={addState} />
          <PendingSubmitButton className="bg-amber-500 text-slate-950 hover:bg-amber-400" pendingText="Adding participant...">
            <Plus aria-hidden="true" />
            Add participant
          </PendingSubmitButton>
        </form>

        <div className="mt-5 grid gap-4">
          {visibleParticipants.map((participant) => (
            <div key={participant.id} className="rounded-md border border-slate-200 bg-white p-4">
              <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
                <div>
                  <h3 className="font-semibold text-slate-950">{participant.profile?.displayName ?? participant.profileId}</h3>
                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <ParticipantFact label="Role on this job" value={labelize(participant.role)} />
                    <ParticipantFact label="Account type" value={participant.profile ? profileTypeLabel(participant.profile.profileType) : "Existing profile"} />
                    <ParticipantFact label="Status" value={labelize(participant.participantStatus)} />
                    <ParticipantFact
                      label="Hired by / reports to"
                      value={participant.hiredByProfileId ? accounts.find((account) => account.id === participant.hiredByProfileId)?.displayName ?? "Linked account" : "Not specified"}
                    />
                  </div>
                  {participant.scopeAssigned ? <p className="mt-2 text-sm leading-6 text-slate-600">{participant.scopeAssigned}</p> : null}
                </div>
                <form action={removeAction}>
                  <input type="hidden" name="jobId" value={job.id} />
                  <input type="hidden" name="participantId" value={participant.id} />
                  <PendingSubmitButton variant="outline" pendingText="Removing...">
                    <Trash2 aria-hidden="true" />
                    Remove role from job
                  </PendingSubmitButton>
                </form>
              </div>
              <details className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-slate-950">Edit this participant role</summary>
                <form action={updateAction} className="mt-4 space-y-4">
                  <input type="hidden" name="jobId" value={job.id} />
                  <input type="hidden" name="participantId" value={participant.id} />
                  <ParticipantFormFields accounts={accounts} participant={participant} />
                  <ActionMessage state={updateState} />
                  <PendingSubmitButton variant="outline" pendingText="Saving participant...">
                    Save participant
                  </PendingSubmitButton>
                </form>
              </details>
            </div>
          ))}
          {visibleParticipants.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6">
              <h3 className="font-semibold text-slate-950">No participants attached yet.</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Add the client, property owner, hiring contractor, prime contractor, subcontractor, vendor, or internal crew from existing account profiles.
              </p>
            </div>
          ) : null}
        </div>
        <ActionMessage state={removeState} />
      </DashboardSection>

      <Button asChild variant="outline">
        <Link href="/dashboard/jobs">Back to all jobs</Link>
      </Button>
    </div>
  )
}

function JobValueCard({
  icon: Icon,
  text,
  title,
}: {
  icon: LucideIcon
  text: string
  title: string
}) {
  return (
    <div className="rounded-md border border-white/10 bg-white/10 p-4">
      <Icon className="size-5 text-amber-300" aria-hidden="true" />
      <h3 className="mt-3 font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-300">{text}</p>
    </div>
  )
}

function JobActionLink({
  href,
  icon: Icon,
  text,
  title,
}: {
  href: string
  icon: LucideIcon
  text: string
  title: string
}) {
  return (
    <Link href={href} className="group rounded-md border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300">
      <Icon className="size-5 text-amber-700" aria-hidden="true" />
      <h3 className="mt-3 font-semibold text-slate-950">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-amber-700">
        Open tool <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  )
}

function ParticipantFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  )
}
