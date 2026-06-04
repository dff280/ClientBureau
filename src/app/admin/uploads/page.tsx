import type { Metadata } from "next"

import { BulkUploadPanel } from "@/components/admin/bulk-upload-panel"
import { getAdminModerationCrmDataService } from "@/lib/repositories/client-bureau-service"

export const metadata: Metadata = {
  title: "Admin Uploads / CSV Intake",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function AdminUploadsPage() {
  const moderationCrm = await getAdminModerationCrmDataService()

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase text-amber-700">Uploads / CSV intake</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
            Uploads / CSV Intake
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Preview report rows before import, flag duplicates, show validation errors, and create pending records by default.
          </p>
        </header>
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
                  <span className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold capitalize text-slate-600">
                    {batch.status.replace("_", " ")}
                  </span>
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
