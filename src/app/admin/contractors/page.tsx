import type { Metadata } from "next"

import { AdminContractorEditor } from "@/components/admin/admin-record-forms"
import { getAdminWorkspaceDataService } from "@/lib/repositories/client-bureau-service"

export const metadata: Metadata = {
  title: "Admin Businesses / Users",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function AdminContractorsPage() {
  const data = await getAdminWorkspaceDataService()
  const verified = data.contractors.filter((contractor) => contractor.verificationStatus === "verified").length
  const pending = data.contractors.filter((contractor) => contractor.verificationStatus === "pending").length

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase text-amber-700">Record management</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
            Businesses / Users
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Modify business profiles, verify accounts, view users, and keep admin notes in the audit log.
          </p>
        </header>

        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="Users" value={data.users.length} />
          <Metric label="Businesses" value={data.contractors.length} />
          <Metric label="Verified" value={verified} />
          <Metric label="Pending verification" value={pending} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {data.users.map((user) => (
            <div key={user.id} className="rounded-md border border-slate-200 bg-white p-4 text-sm shadow-sm">
              <p className="font-semibold text-slate-950">{user.fullName}</p>
              <p className="mt-1 text-slate-600">{user.email}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase">
                <span className="rounded-md border border-slate-200 px-2 py-1 text-slate-500">{user.role}</span>
                <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700">
                  account active
                </span>
              </div>
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

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
    </div>
  )
}
