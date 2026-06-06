import type { Metadata } from "next"
import { CalendarDays, History, Search, ShieldCheck, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AdminPageHeader, DataTableToolbar, StatCard, StatusBadge } from "@/components/dashboard/dashboard-ui"
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
  date?: string
}>

export default async function AdminAuditLogPage({ searchParams }: { searchParams: AuditSearchParams }) {
  const params = await searchParams
  const data = await getAdminWorkspaceDataService()
  const actor = params.actor?.trim().toLowerCase() ?? ""
  const action = params.action?.trim().toLowerCase() ?? ""
  const entity = params.entity?.trim().toLowerCase() ?? ""
  const date = params.date?.trim() ?? ""
  const entries = data.auditLog.filter((entry) => {
    const actorText = [entry.actorName, entry.actorId].filter(Boolean).join(" ").toLowerCase()
    const actionText = entry.action.toLowerCase()
    const entityText = [entry.entityType, entry.entityId].join(" ").toLowerCase()
    const dateText = new Date(entry.createdAt).toISOString().slice(0, 10)

    return (
      (!actor || actorText.includes(actor)) &&
      (!action || actionText.includes(action)) &&
      (!entity || entityText.includes(entity)) &&
      (!date || dateText === date)
    )
  })
  const adminActions = data.auditLog.filter((entry) => entry.actorId).length
  const visibilityChanges = data.auditLog.filter((entry) =>
    entry.summary.toLowerCase().includes("public") || entry.action.toLowerCase().includes("visibility"),
  ).length
  const destructiveActions = data.auditLog.filter((entry) =>
    ["delete", "reject"].some((term) => entry.action.toLowerCase().includes(term)),
  ).length

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <AdminPageHeader
          eyebrow="Platform"
          title="Audit Log"
          description="Track approvals, rejections, edits, deletes, imports, status changes, public visibility changes, and moderator decisions."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total events" value={data.auditLog.length} helper="All recorded audit entries" icon={History} tone="slate" />
          <StatCard label="Admin actions" value={adminActions} helper="Entries tied to an admin actor" icon={UserRound} tone="blue" />
          <StatCard label="Visibility changes" value={visibilityChanges} helper="Public/private status movement" icon={ShieldCheck} tone="amber" />
          <StatCard label="Deletes / rejects" value={destructiveActions} helper="High-attention decisions" icon={CalendarDays} tone={destructiveActions > 0 ? "rose" : "slate"} />
        </div>
        <DataTableToolbar
          title="Filter audit trail"
          description="Narrow the log by actor, action, entity, or exact date."
        >
          <form className="grid w-full gap-2 md:grid-cols-[1fr_1fr_1fr_160px_auto]">
            <Input name="actor" defaultValue={params.actor} placeholder="Actor" aria-label="Filter actor" />
            <Input name="action" defaultValue={params.action} placeholder="Action" aria-label="Filter action" />
            <Input name="entity" defaultValue={params.entity} placeholder="Entity" aria-label="Filter entity" />
            <Input name="date" defaultValue={params.date} type="date" aria-label="Filter date" />
            <Button className="bg-slate-950 text-white hover:bg-slate-800">
              <Search aria-hidden="true" />
              Apply
            </Button>
          </form>
        </DataTableToolbar>
        <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm">
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
                    <StatusBadge tone={entry.action.toLowerCase().includes("reject") ? "rose" : "slate"}>{entry.action}</StatusBadge>
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
