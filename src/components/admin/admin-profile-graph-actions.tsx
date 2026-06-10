"use client"

import type React from "react"
import { useActionState, useEffect } from "react"
import { GitMerge, GitPullRequestArrow, ShieldCheck, TextSearch } from "lucide-react"
import { toast } from "sonner"

import { AdminActionTokenInput } from "@/components/admin/admin-action-token-context"
import { FieldError } from "@/components/forms/field-error"
import { PendingSubmitButton } from "@/components/forms/pending-submit-button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  mergeEntityProfilesAction,
  reassignReportProfileAction,
  redactEntityProfileFieldAction,
  reviewProfileClaimAction,
} from "@/lib/actions/client-bureau"
import type {
  ActionResult,
  ClientReport,
  EntityProfile,
  ProfileClaim,
  ProfileMergeEvent,
  ProfileRedactionEvent,
  ReportReassignmentEvent,
} from "@/lib/types"

const claimState: ActionResult<ProfileClaim> = { ok: false, message: "" }
const mergeState: ActionResult<ProfileMergeEvent> = { ok: false, message: "" }
const reassignState: ActionResult<ReportReassignmentEvent> = { ok: false, message: "" }
const redactionState: ActionResult<ProfileRedactionEvent> = { ok: false, message: "" }

const redactionFields = [
  ["display_name", "Display name"],
  ["business_name", "Business name"],
  ["public_summary", "Public summary"],
  ["city", "City"],
  ["state", "State"],
  ["slug", "Slug"],
] as const

type AdminProfileGraphActionsProps = {
  profiles: EntityProfile[]
  claims: ProfileClaim[]
  reports: ClientReport[]
}

export function AdminProfileGraphActions({ claims, profiles, reports }: AdminProfileGraphActionsProps) {
  const duplicateGroups = profiles.reduce<Record<string, EntityProfile[]>>((groups, profile) => {
    if (!profile.duplicateGroupKey) return groups
    groups[profile.duplicateGroupKey] = [...(groups[profile.duplicateGroupKey] ?? []), profile]
    return groups
  }, {})
  const duplicateGroupCount = Object.values(duplicateGroups).filter((group) => group.length > 1).length
  const pendingClaims = claims.filter((claim) => claim.status === "pending")

  return (
    <section className="space-y-4">
      <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-amber-700">Graph operations</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Claims, duplicates, reassignment, and redaction</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Use these controls when a public profile needs ownership review, duplicate cleanup, report movement, or public/private field protection. Every action requires a moderator note.
            </p>
          </div>
          <div className="grid gap-2 text-sm sm:grid-cols-3">
            <Metric label="Pending claims" value={pendingClaims.length} />
            <Metric label="Duplicate groups" value={duplicateGroupCount} />
            <Metric label="Reports with graph" value={reports.filter((report) => report.projectJobId || report.subjectProfileId).length} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ClaimReviewCard claims={claims} />
        <MergeProfilesCard profiles={profiles} />
        <ReassignReportCard profiles={profiles} reports={reports} />
        <RedactionCard profiles={profiles} />
      </div>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
    </div>
  )
}

function ClaimReviewCard({ claims }: { claims: ProfileClaim[] }) {
  const [state, action] = useActionState(reviewProfileClaimAction, claimState)
  useToastState(state)

  return (
    <GraphCard
      icon={<ShieldCheck className="size-5" aria-hidden="true" />}
      title="Review profile claim"
      text="Approve, reject, or dispute a profile claim after checking verification details."
    >
      <form action={action} className="space-y-3">
        <AdminActionTokenInput />
        <div className="space-y-2">
          <Label htmlFor="claimId">Claim</Label>
          <select id="claimId" name="claimId" className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm">
            {claims.length > 0 ? claims.map((claim) => (
              <option key={claim.id} value={claim.id}>
                {claim.claimantName} · {claim.relationshipToProfile} · {claim.status}
              </option>
            )) : (
              <option value="">No claims available</option>
            )}
          </select>
          <FieldError name="claimId" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="decision">Decision</Label>
          <select id="decision" name="decision" className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm">
            <option value="approved">Approve and verify</option>
            <option value="rejected">Reject claim</option>
            <option value="disputed">Mark disputed</option>
          </select>
          <FieldError name="decision" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <NoteField name="moderatorNote" label="Moderator note" errorState={state} placeholder="Reviewed verification details and profile ownership context." />
        <PendingSubmitButton className="w-full bg-slate-950 text-white hover:bg-slate-800">Save claim decision</PendingSubmitButton>
      </form>
    </GraphCard>
  )
}

function MergeProfilesCard({ profiles }: { profiles: EntityProfile[] }) {
  const [state, action] = useActionState(mergeEntityProfilesAction, mergeState)
  useToastState(state)

  return (
    <GraphCard
      icon={<GitMerge className="size-5" aria-hidden="true" />}
      title="Merge duplicate profiles"
      text="Hide a duplicate profile, preserve an audit event, and optionally move reports to the canonical profile."
    >
      <form action={action} className="space-y-3">
        <AdminActionTokenInput />
        <ProfileSelect id="sourceProfileId" label="Duplicate source profile" profiles={profiles} errors={state.ok ? undefined : state.fieldErrors} />
        <ProfileSelect id="targetProfileId" label="Canonical target profile" profiles={profiles} errors={state.ok ? undefined : state.fieldErrors} />
        <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
          <input type="checkbox" name="moveReports" className="size-4" />
          Move reports from source to target
        </label>
        <NoteField name="reason" label="Merge reason" errorState={state} placeholder="Same person/business and market after duplicate review." />
        <PendingSubmitButton className="w-full bg-slate-950 text-white hover:bg-slate-800">Record merge</PendingSubmitButton>
      </form>
    </GraphCard>
  )
}

function ReassignReportCard({ profiles, reports }: { profiles: EntityProfile[]; reports: ClientReport[] }) {
  const [state, action] = useActionState(reassignReportProfileAction, reassignState)
  useToastState(state)

  return (
    <GraphCard
      icon={<GitPullRequestArrow className="size-5" aria-hidden="true" />}
      title="Reassign report"
      text="Move a report to the correct subject profile or attach it to a documented project/job record."
    >
      <form action={action} className="space-y-3">
        <AdminActionTokenInput />
        <div className="space-y-2">
          <Label htmlFor="reportId">Report</Label>
          <select id="reportId" name="reportId" className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm">
            {reports.map((report) => (
              <option key={report.id} value={report.id}>
                {report.reportCategory} · {report.projectCity}, {report.projectState} · {report.status}
              </option>
            ))}
          </select>
          <FieldError name="reportId" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <ProfileSelect id="nextSubjectProfileId" label="New subject profile optional" profiles={profiles} includeBlank errors={state.ok ? undefined : state.fieldErrors} />
        <div className="space-y-2">
          <Label htmlFor="nextProjectJobId">Project/job ID optional</Label>
          <Input id="nextProjectJobId" name="nextProjectJobId" placeholder="Paste project/job UUID if known" />
          <FieldError name="nextProjectJobId" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <NoteField name="reason" label="Reassignment reason" errorState={state} placeholder="Report belongs to this canonical profile or job after evidence review." />
        <PendingSubmitButton className="w-full bg-slate-950 text-white hover:bg-slate-800">Record reassignment</PendingSubmitButton>
      </form>
    </GraphCard>
  )
}

function RedactionCard({ profiles }: { profiles: EntityProfile[] }) {
  const [state, action] = useActionState(redactEntityProfileFieldAction, redactionState)
  useToastState(state)

  return (
    <GraphCard
      icon={<TextSearch className="size-5" aria-hidden="true" />}
      title="Redact public field"
      text="Record why a public-facing field was redacted or replaced. Private identifiers and raw files remain sealed."
    >
      <form action={action} className="space-y-3">
        <AdminActionTokenInput />
        <ProfileSelect id="profileId" label="Profile" profiles={profiles} errors={state.ok ? undefined : state.fieldErrors} />
        <div className="space-y-2">
          <Label htmlFor="fieldName">Field</Label>
          <select id="fieldName" name="fieldName" className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm">
            {redactionFields.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <FieldError name="fieldName" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="replacementValue">Replacement value optional</Label>
          <Input id="replacementValue" name="replacementValue" placeholder="Use only for display name, business name, or public summary" />
          <FieldError name="replacementValue" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <NoteField name="reason" label="Redaction reason" errorState={state} placeholder="Public field contained private, confusing, or unsupported context." />
        <PendingSubmitButton className="w-full bg-slate-950 text-white hover:bg-slate-800">Record redaction</PendingSubmitButton>
      </form>
    </GraphCard>
  )
}

function GraphCard({
  children,
  icon,
  text,
  title,
}: {
  children: React.ReactNode
  icon: React.ReactNode
  text: string
  title: string
}) {
  return (
    <Card className="rounded-md border-slate-200 bg-white shadow-sm">
      <CardContent className="space-y-4 p-5">
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-800">
            {icon}
          </div>
          <div>
            <h3 className="font-black text-slate-950">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

function ProfileSelect({
  errors,
  id,
  includeBlank = false,
  label,
  profiles,
}: {
  errors?: Record<string, string[]>
  id: string
  includeBlank?: boolean
  label: string
  profiles: EntityProfile[]
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <select id={id} name={id} className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm">
        {includeBlank ? <option value="">No change</option> : null}
        {profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.displayName} · {profile.profileType} · {profile.city}, {profile.state}
          </option>
        ))}
      </select>
      <FieldError name={id} errors={errors} />
    </div>
  )
}

function NoteField({
  errorState,
  label,
  name,
  placeholder,
}: {
  errorState: ActionResult<unknown>
  label: string
  name: string
  placeholder: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Textarea id={name} name={name} placeholder={placeholder} className="min-h-24" />
      <FieldError name={name} errors={errorState.ok ? undefined : errorState.fieldErrors} />
    </div>
  )
}

function useToastState<T>(state: ActionResult<T>) {
  useEffect(() => {
    if (!state.message) return
    toast[state.ok ? "success" : "error"](state.message)
  }, [state])
}
