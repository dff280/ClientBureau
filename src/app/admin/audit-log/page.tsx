import type { Metadata } from "next"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getAdminWorkspaceDataService } from "@/lib/repositories/client-bureau-service"

export const metadata: Metadata = {
  title: "Admin Audit Log",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

type AuditSearchParams = Promise<{
  actor?: string
  action?: string
  entity?: string
}>

export default async function AdminAuditLogPage({ searchParams }: { searchParams: AuditSearchParams }) {
  const params = await searchParams
  const data = await getAdminWorkspaceDataService()
  const actor = params.actor?.trim().toLowerCase() ?? ""
  const action = params.action?.trim().toLowerCase() ?? ""
  const entity = params.entity?.trim().toLowerCase() ?? ""
  const entries = data.auditLog.filter((entry) => {
    const actorText = [entry.actorName, entry.actorId].filter(Boolean).join(" ").toLowerCase()
    const actionText = entry.action.toLowerCase()
    const entityText = [entry.entityType, entry.entityId].join(" ").toLowerCase()

    return (
      (!actor || actorText.includes(actor)) &&
      (!action || actionText.includes(action)) &&
      (!entity || entityText.includes(entity))
    )
  })

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase text-amber-700">Audit Log</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
            Audit Log
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Tracks approvals, rejections, edits, deletes, bulk imports, status changes, and public visibility changes.
          </p>
        </header>
        <form className="grid gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_1fr_1fr_auto]">
          <Input name="actor" defaultValue={params.actor} placeholder="Filter actor" />
          <Input name="action" defaultValue={params.action} placeholder="Filter action" />
          <Input name="entity" defaultValue={params.entity} placeholder="Filter entity" />
          <Button className="bg-slate-950 text-white hover:bg-slate-800">Apply filters</Button>
        </form>
        <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Actor</th>
                <th className="p-3">Action</th>
                <th className="p-3">Entity</th>
                <th className="p-3">Summary</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-100">
                  <td className="p-3 text-slate-600">{new Date(entry.createdAt).toLocaleString()}</td>
                  <td className="p-3 font-semibold text-slate-950">{entry.actorName ?? entry.actorId ?? "System"}</td>
                  <td className="p-3">
                    <Badge variant="outline" className="rounded-md">{entry.action}</Badge>
                  </td>
                  <td className="p-3 text-slate-600">{entry.entityType} / {entry.entityId}</td>
                  <td className="p-3 text-slate-700">{entry.summary}</td>
                </tr>
              ))}
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-slate-500">
                    No audit entries match the current filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
