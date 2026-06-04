import type { Metadata } from "next"
import Link from "next/link"

import { AdminClientEditor } from "@/components/admin/admin-record-forms"
import { getAdminWorkspaceDataService } from "@/lib/repositories/client-bureau-service"

export const metadata: Metadata = {
  title: "Admin Client Profiles",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function AdminClientsPage() {
  const data = await getAdminWorkspaceDataService()
  const publicCount = data.clients.filter((client) => client.isPublic).length
  const privateCount = data.clients.length - publicCount
  const elevatedCount = data.clients.filter((client) => ["Elevated", "High"].includes(client.riskLevel)).length

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Header title="Client Profiles" text="Edit identity fields, score, risk, and public visibility. Private email and phone hashes stay hidden." />
        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="Total profiles" value={data.clients.length} />
          <Metric label="Public" value={publicCount} />
          <Metric label="Private" value={privateCount} />
          <Metric label="Elevated or high" value={elevatedCount} />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {data.clients.slice(0, 3).map((client) => (
            <div key={client.id} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">Profile health</p>
                  <h2 className="mt-2 font-semibold text-slate-950">
                    {client.firstName} {client.lastName}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">{client.city}, {client.state}</p>
                </div>
                <span className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600">
                  {client.isPublic ? "Public" : "Private"}
                </span>
              </div>
              <div className="mt-4 grid gap-2 text-xs text-slate-600">
                <p>SEO slug: <span className="font-semibold text-slate-950">{client.publicSlug}</span></p>
                <p>Reports: <span className="font-semibold text-slate-950">{client.reportCount}</span></p>
                <p>Private identifiers: <span className="font-semibold text-slate-950">hashed</span></p>
              </div>
              {client.isPublic ? (
                <Link href={`/client/${client.publicSlug}`} className="mt-4 inline-flex text-sm font-semibold text-amber-700">
                  Public SEO preview
                </Link>
              ) : null}
            </div>
          ))}
        </div>
        <div className="grid gap-4">
          {data.clients.map((client) => (
            <AdminClientEditor key={client.id} client={client} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Header({ title, text }: { title: string; text: string }) {
  return (
    <header className="border-b border-slate-200 pb-6">
      <p className="text-sm font-semibold uppercase text-amber-700">Record management</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{text}</p>
    </header>
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
