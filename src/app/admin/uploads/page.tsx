import type { Metadata } from "next"
import {
  AlertTriangle,
  ClipboardCheck,
  FileCheck2,
  FileSpreadsheet,
  LockKeyhole,
  SearchCheck,
  ShieldAlert,
} from "lucide-react"

import { AdminActionOutcomePanel } from "@/components/admin/admin-crm-ui"
import { BulkUploadPanel } from "@/components/admin/bulk-upload-panel"
import { AdminPageHeader, HeaderActionButton, StatCard, StatusBadge } from "@/components/dashboard/dashboard-ui"
import { getAdminModerationCrmDataService } from "@/lib/repositories/client-bureau-service"

export const metadata: Metadata = {
  title: "Admin Uploads / CSV Intake",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function AdminUploadsPage() {
  const moderationCrm = await getAdminModerationCrmDataService()
  const totals = moderationCrm?.importBatches.reduce(
    (summary, batch) => ({
      rows: summary.rows + batch.totalRows,
      ready: summary.ready + batch.readyRows,
      duplicates: summary.duplicates + batch.duplicateRows,
      imported: summary.imported + batch.importedRows,
    }),
    { rows: 0, ready: 0, duplicates: 0, imported: 0 },
  ) ?? { rows: 0, ready: 0, duplicates: 0, imported: 0 }
  const needsReview = moderationCrm?.importBatches.filter((batch) => batch.status === "needs_review").length ?? 0
  const importRate = totals.rows > 0 ? Math.round((totals.imported / totals.rows) * 100) : 0

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <AdminPageHeader
          eyebrow="Tools"
          title="CSV Intake Desk"
          description="Stage bulk report rows, catch bad state values and duplicates, then create private pending records for moderation review."
          actions={
            <HeaderActionButton href="/admin/reports" variant="outline">
              <ClipboardCheck aria-hidden="true" />
              Review imported reports
            </HeaderActionButton>
          }
          meta={
            <div className="grid gap-2 text-xs font-semibold uppercase text-slate-600 sm:grid-cols-3">
              <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                <SearchCheck className="size-4 text-amber-700" aria-hidden="true" />
                Validate before import
              </span>
              <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                <ShieldAlert className="size-4 text-amber-700" aria-hidden="true" />
                Duplicates stay visible
              </span>
              <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                <LockKeyhole className="size-4 text-amber-700" aria-hidden="true" />
                Imported rows stay pending
              </span>
            </div>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Rows staged" value={totals.rows} helper="Rows across recent intake batches" icon={FileSpreadsheet} tone="slate" />
          <StatCard label="Ready rows" value={totals.ready} helper="Rows passing basic validation" icon={FileCheck2} tone="emerald" />
          <StatCard label="Needs review" value={needsReview} helper="Batches with duplicate or validation attention" icon={AlertTriangle} tone={needsReview > 0 ? "amber" : "slate"} />
          <StatCard label="Import completion" value={`${importRate}%`} helper={`${totals.imported} records created as pending`} icon={ClipboardCheck} tone="blue" />
        </div>
        <AdminActionOutcomePanel
          title="CSV intake operating rules"
          description="Bulk intake should speed up review without bypassing moderation, identity quality, or public-profile safety."
          items={[
            {
              detail: "Rows with missing names, missing cities, invalid state values, non-numeric amounts, or empty summaries remain blocked until corrected.",
              label: "Validation",
              status: "Checked",
              title: "Bad rows do not import",
              tone: "amber",
            },
            {
              detail: "Potential duplicates should be reviewed before importing so client profile identity, city/state, and public slug quality stay clean.",
              label: "Duplicates",
              status: "Flagged",
              title: "Duplicate warnings stay visible",
              tone: "blue",
            },
            {
              detail: "Imported report records start pending by default and require admin moderation before any public profile output changes.",
              label: "Moderation",
              status: "Pending",
              title: "New records enter review",
              tone: "emerald",
            },
          ]}
        />
        {moderationCrm ? (
          <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase text-amber-700">Recent intake batches</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">Batch history</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                  Use recent batches to spot repeat duplicate patterns, bad CSV formatting, and rows that still need staff attention.
                </p>
              </div>
              <StatusBadge tone={needsReview > 0 ? "amber" : "emerald"}>
                {needsReview > 0 ? `${needsReview} need review` : "No batch blockers"}
              </StatusBadge>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {moderationCrm.importBatches.map((batch) => (
                <div key={batch.id} className="rounded-md border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase text-slate-500">Import batch</p>
                      <h3 className="mt-2 truncate font-semibold text-slate-950">{batch.fileName}</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        Created {new Date(batch.createdAt).toLocaleDateString()} by {batch.createdBy}
                      </p>
                    </div>
                    <StatusBadge tone={batch.status === "imported" ? "emerald" : batch.status === "needs_review" ? "amber" : "blue"}>
                      {batch.status.replace("_", " ")}
                    </StatusBadge>
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
                    <Stat label="Rows" value={batch.totalRows} />
                    <Stat label="Ready" value={batch.readyRows} />
                    <Stat label="Dupes" value={batch.duplicateRows} />
                    <Stat label="Imported" value={batch.importedRows} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
        <BulkUploadPanel />
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
      <p className="font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-slate-500">{label}</p>
    </div>
  )
}
