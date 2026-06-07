"use client"

import Link from "next/link"
import { useActionState, useEffect } from "react"
import { CheckCircle2, ExternalLink, Pencil, ShieldCheck, Trash2 } from "lucide-react"
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

const clientState: ActionResult<ClientProfile> = { ok: false, message: "" }
const contractorState: ActionResult<ContractorProfile> = { ok: false, message: "" }
const deleteState: ActionResult<AuditLogEntry | boolean> = { ok: false, message: "" }

export function AdminClientEditor({ client }: { client: ClientProfile }) {
  const [state, action] = useActionState(adminUpdateClientAction, clientState)
  const [deleteResult, deleteAction] = useActionState(adminDeleteRecordAction, deleteState)
  const name = `${client.firstName} ${client.lastName}`
  const ratingBand = clientRatingBand(client.clientBureauScore, client.reportCount)

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
          { label: "Reports", value: client.reportCount },
          { label: "Public slug", value: client.publicSlug },
          { label: "Private identifiers", value: "Hashed/private match only" },
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
      />
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-2xl">
        <SheetHeader className="border-b border-slate-200 p-5">
          <SheetTitle>Edit client profile</SheetTitle>
          <SheetDescription>
            Update public-safe identity, rating display, visibility, and audit context. Raw phone, email,
            street address, and evidence files stay private.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-5 p-5">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Publication preview</p>
            <p className="mt-2 text-sm font-semibold text-slate-950">{name} in {client.city}, {client.state}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Public URL: /client/{client.publicSlug}. Private matching fields are stored as hashes and are not shown publicly.
            </p>
          </div>
          <form action={action} className="grid gap-4">
            <AdminActionTokenInput />
            <input type="hidden" name="clientId" value={client.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <LabeledInput label="First name" name="firstName" defaultValue={client.firstName} errors={state.ok ? undefined : state.fieldErrors} />
              <LabeledInput label="Last name" name="lastName" defaultValue={client.lastName} errors={state.ok ? undefined : state.fieldErrors} />
              <LabeledInput label="Business optional" name="businessName" defaultValue={client.businessName ?? ""} />
              <LabeledInput label="City" name="city" defaultValue={client.city} errors={state.ok ? undefined : state.fieldErrors} />
              <LabeledState label="State" id={`${client.id}-state`} name="state" defaultValue={client.state} errors={state.ok ? undefined : state.fieldErrors} />
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
            <label className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <Checkbox name="isPublic" defaultChecked={client.isPublic} />
              <span>
                <span className="block font-semibold text-slate-950">Make profile public</span>
                <span className="mt-1 block text-xs leading-5 text-slate-600">
                  Only public-safe identity, rating context, approved reports, and response context can appear on public pages.
                </span>
              </span>
            </label>
            <div>
              <Textarea name="moderatorNote" required placeholder="Required moderator note for audit log" className="min-h-24" />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Note why the profile, visibility, risk, or rating display changed.
              </p>
            </div>
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
        tone={contractor.verificationStatus === "verified" ? "emerald" : contractor.verificationStatus === "pending" ? "amber" : "slate"}
        facts={[
          { label: "Business owner workspace", value: "Active" },
          { label: "Trade or service", value: contractor.trade },
          { label: "Location", value: `${contractor.city}, ${contractor.state}` },
          { label: "Verification", value: contractor.verificationStatus },
          { label: "License", value: contractor.licenseNumber ?? "Not provided" },
          { label: "Plan context", value: "Managed through billing records" },
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
      />
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-2xl">
        <SheetHeader className="border-b border-slate-200 p-5">
          <SheetTitle>Edit business / user workspace</SheetTitle>
          <SheetDescription>
            Update business profile fields, verification status, location, and audit notes. Account role and billing remain controlled by existing auth and billing records.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-5 p-5">
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
