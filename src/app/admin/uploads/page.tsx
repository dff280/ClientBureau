import type { Metadata } from "next"
import { ClipboardCheck, FileSpreadsheet, ShieldAlert, UploadCloud } from "lucide-react"

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

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <AdminPageHeader
          eyebrow="Tools"
          title="CSV Intake"
          description="Preview report rows before import, flag duplicates, show validation errors, and create pending records by default."
          actions={
            <HeaderActionButton href="/admin/reports" variant="outline">
              <ClipboardCheck aria-hidden="true" />
              Review imported reports
            </HeaderActionButton>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total rows" value={totals.rows} helper="Rows staged across recent batches" icon={FileSpreadsheet} tone="slate" />
          <StatCard label="Ready rows" value={totals.ready} helper="Rows passing validation" icon={UploadCloud} tone="emerald" />
          <StatCard label="Duplicate warnings" value={totals.duplicates} helper="Rows blocked for review" icon={ShieldAlert} tone={totals.duplicates > 0 ? "amber" : "slate"} />
          <StatCard label="Imported" value={totals.imported} helper="Records created as pending" icon={ClipboardCheck} tone="blue" />
        </div>
        <AdminActionOutcomePanel
          title="After importing CSV rows"
          description="Bulk uploads should create clean pending records, not accidental public profiles or duplicate client records."
          items={[
            {
              detail: "Rows with missing required fields, invalid state values, confusing dates, or unsafe summaries should remain blocked until corrected.",
              label: "Validation",
              status: "Checked",
              title: "Bad rows should not import",
              tone: "amber",
            },
            {
              detail: "Potential duplicates should be reviewed before importing so client profile identity, city/state, and public slug quality stay clean.",
              label: "Duplicates",
              status: "Flagged",
              title: "Duplicate warnings should stay visible",
              tone: "blue",
            },
            {
              detail: "Imported report records should start pending by default and require admin moderation before any public profile output changes.",
              label: "Moderation",
              status: "Pending",
              title: "New records should enter review",
              tone: "emerald",
            },
          ]}
        />
        {moderationCrm ? (
          <div className="grid gap-4 md:grid-cols-2">
            {moderationCrm.importBatches.map((batch) => (
              <div key={batch.id} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">Import batch</p>
                    <h2 className="mt-2 font-semibold text-slate-950">{batch.fileName}</h2>
                    <p className="mt-1 text-sm text-slate-600">{new Date(batch.createdAt).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge tone={batch.status === "imported" ? "emerald" : "amber"}>
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
