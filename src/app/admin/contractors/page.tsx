import type { Metadata } from "next"

import { AdminContractorEditor } from "@/components/admin/admin-record-forms"
import { getAdminWorkspaceDataService } from "@/lib/repositories/client-bureau-service"

export const metadata: Metadata = {
  title: "Admin Contractors",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function AdminContractorsPage() {
  const data = await getAdminWorkspaceDataService()

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase text-amber-700">Record management</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
            Contractors and users
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Modify contractor profiles, verify accounts, view all users, and keep admin notes in the audit log.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {data.users.map((user) => (
            <div key={user.id} className="rounded-md border border-slate-200 bg-white p-4 text-sm shadow-sm">
              <p className="font-semibold text-slate-950">{user.fullName}</p>
              <p className="mt-1 text-slate-600">{user.email}</p>
              <p className="mt-2 text-xs font-semibold uppercase text-slate-500">{user.role}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4">
          {data.contractors.map((contractor) => (
            <AdminContractorEditor key={contractor.id} contractor={contractor} />
          ))}
        </div>
      </div>
    </section>
  )
}
