"use client"

import { useActionState, useEffect } from "react"
import { CheckCircle2, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { AdminActionTokenInput } from "@/components/admin/admin-action-token-context"
import { FieldError } from "@/components/forms/field-error"
import { PendingSubmitButton } from "@/components/forms/pending-submit-button"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  adminDeleteRecordAction,
  adminUpdateClientAction,
  adminUpdateContractorAction,
} from "@/lib/actions/client-bureau"
import type { ActionResult, AuditLogEntry, ClientProfile, ContractorProfile } from "@/lib/types"
import { riskLevels } from "@/lib/types"

const clientState: ActionResult<ClientProfile> = { ok: false, message: "" }
const contractorState: ActionResult<ContractorProfile> = { ok: false, message: "" }
const deleteState: ActionResult<AuditLogEntry | boolean> = { ok: false, message: "" }

export function AdminClientEditor({ client }: { client: ClientProfile }) {
  const [state, action] = useActionState(adminUpdateClientAction, clientState)
  const [deleteResult, deleteAction] = useActionState(adminDeleteRecordAction, deleteState)

  useEffect(() => {
    if (state.message) toast[state.ok ? "success" : "error"](state.message)
  }, [state])

  useEffect(() => {
    if (deleteResult.message) toast[deleteResult.ok ? "success" : "error"](deleteResult.message)
  }, [deleteResult])

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <form action={action} className="grid gap-3 lg:grid-cols-[1.2fr_1.2fr_1fr_90px_120px_auto] lg:items-end">
        <AdminActionTokenInput />
        <input type="hidden" name="clientId" value={client.id} />
        <LabeledInput label="First name" name="firstName" defaultValue={client.firstName} errors={state.ok ? undefined : state.fieldErrors} />
        <LabeledInput label="Last name" name="lastName" defaultValue={client.lastName} errors={state.ok ? undefined : state.fieldErrors} />
        <LabeledInput label="City" name="city" defaultValue={client.city} errors={state.ok ? undefined : state.fieldErrors} />
        <LabeledInput label="State" name="state" defaultValue={client.state} errors={state.ok ? undefined : state.fieldErrors} />
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-slate-500" htmlFor={`${client.id}-risk`}>
            Risk
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
        <LabeledInput label="Score" name="clientBureauScore" defaultValue={String(client.clientBureauScore)} type="number" />
        <div className="lg:col-span-3">
          <LabeledInput label="Business optional" name="businessName" defaultValue={client.businessName ?? ""} />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <Checkbox name="isPublic" defaultChecked={client.isPublic} />
          Public
        </label>
        <div className="lg:col-span-2">
          <Textarea name="moderatorNote" placeholder="Moderator note for audit log" className="min-h-10" />
        </div>
        <PendingSubmitButton pendingText="Saving..." className="bg-slate-950 text-white hover:bg-slate-800">
          <CheckCircle2 aria-hidden="true" />
          Save
        </PendingSubmitButton>
      </form>
      <form action={deleteAction} className="mt-3 flex justify-end">
        <AdminActionTokenInput />
        <input type="hidden" name="entityType" value="client" />
        <input type="hidden" name="entityId" value={client.id} />
        <Button type="submit" variant="ghost" size="sm" className="text-rose-700 hover:text-rose-800">
          <Trash2 aria-hidden="true" />
          Delete client
        </Button>
      </form>
    </div>
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
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <form action={action} className="grid gap-3 lg:grid-cols-[1.4fr_1.2fr_1fr_90px_140px_auto] lg:items-end">
        <AdminActionTokenInput />
        <input type="hidden" name="contractorId" value={contractor.id} />
        <LabeledInput label="Business" name="businessName" defaultValue={contractor.businessName} errors={state.ok ? undefined : state.fieldErrors} />
        <LabeledInput label="Trade" name="trade" defaultValue={contractor.trade} errors={state.ok ? undefined : state.fieldErrors} />
        <LabeledInput label="City" name="city" defaultValue={contractor.city} errors={state.ok ? undefined : state.fieldErrors} />
        <LabeledInput label="State" name="state" defaultValue={contractor.state} errors={state.ok ? undefined : state.fieldErrors} />
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
            <option value="unverified">unverified</option>
            <option value="pending">pending</option>
            <option value="verified">verified</option>
          </select>
        </div>
        <PendingSubmitButton pendingText="Saving..." className="bg-slate-950 text-white hover:bg-slate-800">
          Save
        </PendingSubmitButton>
        <div className="lg:col-span-6">
          <Textarea name="moderatorNote" placeholder="Moderator note for audit log" className="min-h-10" />
        </div>
      </form>
      <form action={deleteAction} className="mt-3 flex justify-end">
        <AdminActionTokenInput />
        <input type="hidden" name="entityType" value="contractor" />
        <input type="hidden" name="entityId" value={contractor.id} />
        <Button type="submit" variant="ghost" size="sm" className="text-rose-700 hover:text-rose-800">
          <Trash2 aria-hidden="true" />
          Delete contractor
        </Button>
      </form>
    </div>
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
