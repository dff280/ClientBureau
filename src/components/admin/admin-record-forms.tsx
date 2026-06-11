"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { useActionState, useEffect } from "react"
import {
  BadgeCheck,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileCheck2,
  LockKeyhole,
  Pencil,
  ShieldCheck,
  Trash2,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

import { AdminProfileHealthCard } from "@/components/admin/admin-crm-ui"
import { AdminActionTokenInput } from "@/components/admin/admin-action-token-context"
import { FieldError } from "@/components/forms/field-error"
import { PendingSubmitButton } from "@/components/forms/pending-submit-button"
import { StateSelect } from "@/components/forms/state-select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import {
  adminDeleteRecordAction,
  adminUpdateClientAction,
  adminUpdateContractorAction,
} from "@/lib/actions/client-bureau"
import { buildBusinessSlug } from "@/lib/business-rating"
import { clientRatingBand } from "@/lib/client-rating"
import type { ActionResult, AuditLogEntry, ClientProfile, ContractorProfile } from "@/lib/types"
import { riskLevels } from "@/lib/types"
import { cn } from "@/lib/utils"

const clientState: ActionResult<ClientProfile> = { ok: false, message: "" }
const contractorState: ActionResult<ContractorProfile> = { ok: false, message: "" }
const deleteState: ActionResult<AuditLogEntry | boolean> = { ok: false, message: "" }

export type ClientProfileReportMetrics = {
  approved: number
  disputed: number
  evidence: number
  lastReportAt?: string
  pending: number
  positive: number
  rejected: number
  resolved: number
  total: number
}

export function AdminClientEditor({
  client,
  metrics = emptyClientMetrics,
}: {
  client: ClientProfile
  metrics?: ClientProfileReportMetrics
}) {
  const [state, action] = useActionState(adminUpdateClientAction, clientState)
  const [deleteResult, deleteAction] = useActionState(adminDeleteRecordAction, deleteState)
  const name = `${client.firstName} ${client.lastName}`
  const ratingBand = clientRatingBand(client.clientBureauScore, client.reportCount)
  const publicationState = getPublicationState(client, metrics)

  useEffect(() => {
    if (state.message) toast[state.ok ? "success" : "error"](state.message)
  }, [state])

  useEffect(() => {
    if (deleteResult.message) toast[deleteResult.ok ? "success" : "error"](deleteResult.message)
  }, [deleteResult])

  return (
    <Sheet>
      <AdminProfileHealthCard
        title={name}
        subtitle={`${client.city}, ${client.state}${client.businessName ? ` / ${client.businessName}` : ""}`}
        badge={client.isPublic ? "Public" : "Private"}
        tone={client.isPublic ? "emerald" : "slate"}
        facts={[
          { label: "Client Bureau Rating", value: `${client.clientBureauScore}/100` },
          { label: "Rating band", value: ratingBand },
          { label: "Risk level", value: client.riskLevel },
          { label: "Approved / total reports", value: `${metrics.approved} / ${metrics.total}` },
          { label: "Pending / disputed", value: `${metrics.pending} pending / ${metrics.disputed} disputed` },
          { label: "Evidence status", value: metrics.evidence > 0 ? `${metrics.evidence} evidence-backed report${metrics.evidence === 1 ? "" : "s"}` : "No evidence label yet" },
          { label: "Public slug", value: client.publicSlug },
          { label: "Last report activity", value: metrics.lastReportAt ? ageLabel(metrics.lastReportAt) : "No report activity" },
        ]}
        actions={
          <>
            <SheetTrigger asChild>
              <Button className="bg-slate-950 text-white hover:bg-slate-800">
                <Pencil aria-hidden="true" />
                Edit profile
              </Button>
            </SheetTrigger>
            {client.isPublic ? (
              <Button asChild variant="outline">
                <Link href={`/client/${client.publicSlug}`} target="_blank">
                  <ExternalLink aria-hidden="true" />
                  Public preview
                </Link>
              </Button>
            ) : null}
          </>
        }
      >
        <div className="grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
          <ReadinessItem
            icon={publicationState.icon}
            label="Publication"
            text={publicationState.text}
            tone={publicationState.tone}
          />
          <ReadinessItem
            icon={LockKeyhole}
            label="Private match"
            text="Phone and email remain hashed"
            tone="emerald"
          />
          <ReadinessItem
            icon={FileCheck2}
            label="Evidence"
            text={metrics.evidence > 0 ? "Private evidence on file" : "Evidence not labeled yet"}
            tone={metrics.evidence > 0 ? "blue" : "slate"}
          />
          <ReadinessItem
            icon={Clock3}
            label="Review age"
            text={ageLabel(client.updatedAt)}
            tone={isOlderThanDays(client.updatedAt, 45) ? "amber" : "slate"}
          />
        </div>
      </AdminProfileHealthCard>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-2xl">
        <SheetHeader className="border-b border-slate-200 p-5">
          <SheetTitle>Edit client profile</SheetTitle>
          <SheetDescription>
            Update public-safe identity, rating display, visibility, and audit context. Raw phone, email,
            street address, and evidence files stay private.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-5 p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <EditorSummaryTile label="Publication state" value={publicationState.text} tone={publicationState.tone} />
            <EditorSummaryTile label="Approved reports" value={String(metrics.approved)} tone={metrics.approved > 0 ? "emerald" : "slate"} />
            <EditorSummaryTile label="Open disputes" value={String(metrics.disputed)} tone={metrics.disputed > 0 ? "amber" : "slate"} />
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Publication preview</p>
            <p className="mt-2 text-sm font-semibold text-slate-950">{name} in {client.city}, {client.state}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Public URL: /client/{client.publicSlug}. Private matching fields are stored as hashes and are not shown publicly.
            </p>
          </div>
          <form action={action} className="grid gap-5">
            <AdminActionTokenInput />
            <input type="hidden" name="clientId" value={client.id} />
            <EditorFormSection
              title="Identity and directory fields"
              description="These fields power admin matching, public profile headings, profile URLs, and city/state directory pages."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <LabeledInput label="First name" name="firstName" defaultValue={client.firstName} errors={state.ok ? undefined : state.fieldErrors} />
                <LabeledInput label="Last name" name="lastName" defaultValue={client.lastName} errors={state.ok ? undefined : state.fieldErrors} />
                <LabeledInput label="Business optional" name="businessName" defaultValue={client.businessName ?? ""} />
                <LabeledInput label="City" name="city" defaultValue={client.city} errors={state.ok ? undefined : state.fieldErrors} />
                <LabeledState label="State" id={`${client.id}-state`} name="state" defaultValue={client.state} errors={state.ok ? undefined : state.fieldErrors} />
              </div>
            </EditorFormSection>
            <EditorFormSection
              title="Rating, risk, and public visibility"
              description="Only public-safe identity, score context, approved summaries, response context, and evidence indicators should appear publicly."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-slate-500" htmlFor={`${client.id}-risk`}>
                    Risk level
                  </label>
                  <select
                    id={`${client.id}-risk`}
                    name="riskLevel"
                    defaultValue={client.riskLevel}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {riskLevels.map((risk) => (
                      <option key={risk}>{risk}</option>
                    ))}
                  </select>
                </div>
                <LabeledInput label="Client Bureau Rating" name="clientBureauScore" defaultValue={String(client.clientBureauScore)} type="number" />
              </div>
              <label className="mt-4 flex items-start gap-2 rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700">
                <Checkbox name="isPublic" defaultChecked={client.isPublic} />
                <span>
                  <span className="block font-semibold text-slate-950">Make profile public</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-600">
                    Only public-safe identity, rating context, approved reports, and response context can appear on public pages.
                  </span>
                </span>
              </label>
            </EditorFormSection>
            <EditorFormSection
              title="Moderator note"
              description="Explain why identity, visibility, risk, or rating changed so the next admin can understand the decision."
            >
              <Textarea name="moderatorNote" required placeholder="Required moderator note for audit log" className="min-h-24 bg-white" />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Keep notes factual and internal. Do not paste private evidence paths or raw contact details.
              </p>
            </EditorFormSection>
            <PendingSubmitButton pendingText="Saving..." className="bg-slate-950 text-white hover:bg-slate-800">
              <CheckCircle2 aria-hidden="true" />
              Save profile changes
            </PendingSubmitButton>
          </form>
          <form action={deleteAction} className="rounded-md border border-rose-200 bg-rose-50 p-4">
            <AdminActionTokenInput />
            <input type="hidden" name="entityType" value="client" />
            <input type="hidden" name="entityId" value={client.id} />
            <p className="text-sm font-semibold text-rose-950">Delete client profile</p>
            <p className="mt-1 text-xs leading-5 text-rose-800">
              Use only for duplicate or unsafe records. This action creates an audit event.
            </p>
            <Button type="submit" variant="destructive" size="sm" className="mt-3">
              <Trash2 aria-hidden="true" />
              Delete client
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function AdminContractorEditor({ contractor }: { contractor: ContractorProfile }) {
  const [state, action] = useActionState(adminUpdateContractorAction, contractorState)
  const [deleteResult, deleteAction] = useActionState(adminDeleteRecordAction, deleteState)
  const verificationTone = contractor.verificationStatus === "verified" ? "emerald" : contractor.verificationStatus === "pending" ? "amber" : "slate"
  const profileGaps = [
    !contractor.licenseNumber ? "license" : null,
    !contractor.serviceArea ? "service area" : null,
    !contractor.businessType ? "business type" : null,
  ].filter(Boolean)

  useEffect(() => {
    if (state.message) toast[state.ok ? "success" : "error"](state.message)
  }, [state])

  useEffect(() => {
    if (deleteResult.message) toast[deleteResult.ok ? "success" : "error"](deleteResult.message)
  }, [deleteResult])

  return (
    <Sheet>
      <AdminProfileHealthCard
        title={contractor.businessName}
        subtitle={`${contractor.trade} / ${contractor.city}, ${contractor.state}`}
        badge={contractor.verificationStatus}
        tone={verificationTone}
        facts={[
          { label: "Business owner workspace", value: "Active" },
          { label: "Trade or service", value: contractor.trade },
          { label: "Business type", value: contractor.businessType ?? "Not provided" },
          { label: "Location", value: `${contractor.city}, ${contractor.state}` },
          { label: "Service area", value: contractor.serviceArea ?? "Not provided" },
          { label: "Verification", value: contractor.verificationStatus },
          { label: "License", value: contractor.licenseNumber ?? "Not provided" },
          { label: "Workspace age", value: ageLabel(contractor.createdAt) },
        ]}
        actions={
          <>
            <SheetTrigger asChild>
              <Button className="bg-slate-950 text-white hover:bg-slate-800">
                <Pencil aria-hidden="true" />
                Edit business
              </Button>
            </SheetTrigger>
            <Button asChild variant="outline">
              <Link href={`/business/${buildBusinessSlug(contractor)}`} target="_blank">
                <ExternalLink aria-hidden="true" />
                Public profile
              </Link>
            </Button>
          </>
        }
      >
        <div className="grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
          <ReadinessItem
            icon={BadgeCheck}
            label="Verification"
            text={contractor.verificationStatus === "verified" ? "Verified business" : contractor.verificationStatus === "pending" ? "Review pending" : "Not verified yet"}
            tone={verificationTone}
          />
          <ReadinessItem
            icon={ShieldCheck}
            label="Profile health"
            text={profileGaps.length ? `Missing ${profileGaps.join(", ")}` : "Core fields complete"}
            tone={profileGaps.length ? "amber" : "emerald"}
          />
          <ReadinessItem
            icon={LockKeyhole}
            label="Private account"
            text="Billing and account emails stay private"
            tone="emerald"
          />
          <ReadinessItem
            icon={FileCheck2}
            label="Public profile"
            text="Preview before promoting"
            tone="blue"
          />
        </div>
      </AdminProfileHealthCard>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-2xl">
        <SheetHeader className="border-b border-slate-200 p-5">
          <SheetTitle>Edit business / user workspace</SheetTitle>
          <SheetDescription>
            Update business profile fields, verification status, location, and audit notes. Account role and billing remain controlled by existing auth and billing records.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-5 p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <EditorSummaryTile label="Verification" value={contractor.verificationStatus} tone={verificationTone} />
            <EditorSummaryTile label="Profile gaps" value={profileGaps.length ? String(profileGaps.length) : "Complete"} tone={profileGaps.length ? "amber" : "emerald"} />
            <EditorSummaryTile label="Workspace age" value={ageLabel(contractor.createdAt)} tone="slate" />
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Account context</p>
            <p className="mt-2 text-sm font-semibold text-slate-950">{contractor.businessName}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Business-owner workspace. Verification changes should be documented for the audit trail.
            </p>
          </div>
          <form action={action} className="grid gap-4">
            <AdminActionTokenInput />
            <input type="hidden" name="contractorId" value={contractor.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <LabeledInput label="Business" name="businessName" defaultValue={contractor.businessName} errors={state.ok ? undefined : state.fieldErrors} />
              <LabeledInput label="Trade" name="trade" defaultValue={contractor.trade} errors={state.ok ? undefined : state.fieldErrors} />
              <LabeledInput label="City" name="city" defaultValue={contractor.city} errors={state.ok ? undefined : state.fieldErrors} />
              <LabeledState label="State" id={`${contractor.id}-state`} name="state" defaultValue={contractor.state} errors={state.ok ? undefined : state.fieldErrors} />
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-slate-500" htmlFor={`${contractor.id}-verification`}>
                  Verification
                </label>
                <select
                  id={`${contractor.id}-verification`}
                  name="verificationStatus"
                  defaultValue={contractor.verificationStatus}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="unverified">Unverified</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                </select>
              </div>
            </div>
            <div>
              <Textarea name="moderatorNote" required placeholder="Required moderator note for audit log" className="min-h-24" />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Note why the business profile, verification, or location changed.
              </p>
            </div>
            <PendingSubmitButton pendingText="Saving..." className="bg-slate-950 text-white hover:bg-slate-800">
              <ShieldCheck aria-hidden="true" />
              Save business changes
            </PendingSubmitButton>
          </form>
          <form action={deleteAction} className="rounded-md border border-rose-200 bg-rose-50 p-4">
            <AdminActionTokenInput />
            <input type="hidden" name="entityType" value="contractor" />
            <input type="hidden" name="entityId" value={contractor.id} />
            <p className="text-sm font-semibold text-rose-950">Delete business profile</p>
            <p className="mt-1 text-xs leading-5 text-rose-800">
              Use only for duplicate, abandoned, or unsafe records. This action creates an audit event.
            </p>
            <Button type="submit" variant="destructive" size="sm" className="mt-3">
              <Trash2 aria-hidden="true" />
              Delete business
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}

const emptyClientMetrics: ClientProfileReportMetrics = {
  approved: 0,
  disputed: 0,
  evidence: 0,
  pending: 0,
  positive: 0,
  rejected: 0,
  resolved: 0,
  total: 0,
}

type ReadinessTone = "slate" | "amber" | "emerald" | "blue"

const readinessToneClasses: Record<ReadinessTone, string> = {
  slate: "border-slate-200 bg-white text-slate-700",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
  blue: "border-sky-200 bg-sky-50 text-sky-800",
}

function getPublicationState(client: ClientProfile, metrics: ClientProfileReportMetrics): {
  icon: LucideIcon
  text: string
  tone: ReadinessTone
} {
  if (client.isPublic) {
    return {
      icon: BadgeCheck,
      text: "Public and searchable",
      tone: "emerald",
    }
  }

  if (metrics.approved > 0) {
    return {
      icon: FileCheck2,
      text: "Approved report ready",
      tone: "blue",
    }
  }

  if (metrics.pending > 0 || metrics.disputed > 0) {
    return {
      icon: Clock3,
      text: "Review before publishing",
      tone: "amber",
    }
  }

  return {
    icon: LockKeyhole,
    text: "Private record only",
    tone: "slate",
  }
}

function ReadinessItem({
  icon: Icon,
  label,
  text,
  tone = "slate",
}: {
  icon: LucideIcon
  label: string
  text: string
  tone?: ReadinessTone
}) {
  return (
    <div className={cn("flex items-start gap-2 rounded-md border p-3", readinessToneClasses[tone])}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase opacity-70">{label}</p>
        <p className="mt-1 text-sm font-semibold leading-5">{text}</p>
      </div>
    </div>
  )
}

function EditorSummaryTile({
  label,
  value,
  tone = "slate",
}: {
  label: string
  value: string
  tone?: ReadinessTone
}) {
  return (
    <div className={cn("rounded-md border p-3", readinessToneClasses[tone])}>
      <p className="text-xs font-semibold uppercase opacity-70">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-5">{value}</p>
    </div>
  )
}

function EditorFormSection({
  children,
  description,
  title,
}: {
  children: ReactNode
  description: string
  title: string
}) {
  return (
    <section className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-semibold text-slate-950">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function ageLabel(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Date unavailable"

  const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86_400_000))
  if (days === 0) return "Updated today"
  if (days === 1) return "Updated 1 day ago"
  return `Updated ${days} days ago`
}

function isOlderThanDays(value: string, days: number) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  return Date.now() - date.getTime() > days * 86_400_000
}

function LabeledInput({
  label,
  name,
  defaultValue,
  errors,
  type = "text",
}: {
  label: string
  name: string
  defaultValue: string
  errors?: Record<string, string[]>
  type?: string
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase text-slate-500" htmlFor={`${name}-${defaultValue}`}>
        {label}
      </label>
      <Input id={`${name}-${defaultValue}`} name={name} defaultValue={defaultValue} type={type} />
      <FieldError name={name} errors={errors} />
    </div>
  )
}

function LabeledState({
  label,
  id,
  name,
  defaultValue,
  errors,
}: {
  label: string
  id: string
  name: string
  defaultValue?: string
  errors?: Record<string, string[]>
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase text-slate-500" htmlFor={id}>
        {label}
      </label>
      <StateSelect id={id} name={name} defaultValue={defaultValue} />
      <FieldError name={name} errors={errors} />
    </div>
  )
}
