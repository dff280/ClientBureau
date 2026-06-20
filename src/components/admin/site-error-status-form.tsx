"use client"

import { useActionState } from "react"

import { AdminActionTokenInput } from "@/components/admin/admin-action-token-context"
import { Button } from "@/components/ui/button"
import { updateSiteErrorReportStatusAction } from "@/lib/actions/client-bureau"
import type { ActionResult, SiteErrorReport } from "@/lib/types"

const initialState: ActionResult<SiteErrorReport> = { ok: false, message: "" }

export function SiteErrorStatusForm({
  reportId,
  status,
}: {
  reportId: string
  status: SiteErrorReport["status"]
}) {
  const [state, action, pending] = useActionState(updateSiteErrorReportStatusAction, initialState)

  return (
    <form action={action} className="grid gap-2 sm:grid-cols-[1fr_auto]">
      <AdminActionTokenInput />
      <input type="hidden" name="reportId" value={reportId} />
      <select
        name="status"
        defaultValue={status}
        aria-label="Update site error status"
        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
      >
        <option value="new">New</option>
        <option value="triaged">Triaged</option>
        <option value="in_progress">In progress</option>
        <option value="resolved">Resolved</option>
        <option value="ignored">Ignored</option>
      </select>
      <Button type="submit" disabled={pending} className="bg-slate-950 text-white hover:bg-slate-800">
        {pending ? "Saving..." : "Update"}
      </Button>
      {state.message ? (
        <p className={`sm:col-span-2 text-xs ${state.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  )
}
