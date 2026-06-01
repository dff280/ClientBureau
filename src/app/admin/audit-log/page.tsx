import type { Metadata } from "next"

import { Badge } from "@/components/ui/badge"
import { requireRole } from "@/lib/auth"
import { getAdminWorkspaceDataService } from "@/lib/repositories/client-bureau-service"

export const metadata: Metadata = {
  title: "Admin Audit Log",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function AdminAuditLogPage() {
  await requireRole("admin")
  const data = await getAdminWorkspaceDataService()

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase text-amber-700">Audit history</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
            Admin action log
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Tracks approvals, rejections, edits, deletes, bulk imports, status changes, and public visibility changes.
          </p>
        </header>
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
              {data.auditLog.map((entry) => (
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
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
