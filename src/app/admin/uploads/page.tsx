import type { Metadata } from "next"

import { BulkUploadPanel } from "@/components/admin/bulk-upload-panel"
import { requireRole } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Admin Uploads",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function AdminUploadsPage() {
  await requireRole("admin")

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase text-amber-700">Bulk upload</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
            CSV report intake
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Preview rows before import, flag duplicates, show validation errors, and create pending records by default.
          </p>
        </header>
        <BulkUploadPanel />
      </div>
    </section>
  )
}
