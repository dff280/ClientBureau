import type { Metadata } from "next"
import Link from "next/link"
import { Eye, Search, ShieldCheck, UserRound } from "lucide-react"

import { AdminClientEditor } from "@/components/admin/admin-record-forms"
import {
  AdminPageHeader,
  DataTableToolbar,
  EmptyState,
  HeaderActionButton,
  StatCard,
  StatusBadge,
} from "@/components/dashboard/dashboard-ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getAdminWorkspaceDataService } from "@/lib/repositories/client-bureau-service"

export const metadata: Metadata = {
  title: "Admin Client Profiles",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

type AdminClientsSearchParams = Promise<{
  q?: string
  status?: string
  risk?: string
}>

export default async function AdminClientsPage({ searchParams }: { searchParams: AdminClientsSearchParams }) {
  const params = await searchParams
  const data = await getAdminWorkspaceDataService()
  const query = params.q?.trim().toLowerCase() ?? ""
  const status = params.status ?? "all"
  const risk = params.risk ?? "all"
  const publicCount = data.clients.filter((client) => client.isPublic).length
  const privateCount = data.clients.length - publicCount
  const elevatedCount = data.clients.filter((client) => ["Elevated", "High"].includes(client.riskLevel)).length
  const filteredClients = data.clients.filter((client) => {
    const nameText = [client.firstName, client.lastName, client.businessName, client.city, client.state, client.publicSlug]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    return (
      (!query || nameText.includes(query)) &&
      (status === "all" || (status === "public" ? client.isPublic : !client.isPublic)) &&
      (risk === "all" || client.riskLevel === risk)
    )
  })

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <AdminPageHeader
          eyebrow="Records"
          title="Manage Client Profiles"
          description="Review profile visibility, rating context, city/state SEO fields, and private matching signals without exposing raw contact data."
          actions={
            <>
              <HeaderActionButton href="/admin/reports" variant="outline">
                <ShieldCheck aria-hidden="true" />
                Review reports
              </HeaderActionButton>
              <HeaderActionButton href="/search" variant="outline">
                <Eye aria-hidden="true" />
                Search preview
              </HeaderActionButton>
            </>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total profiles" value={data.clients.length} helper="All client profile records" icon={UserRound} tone="slate" />
          <StatCard label="Public" value={publicCount} helper="SEO-visible approved profiles" icon={Eye} tone="emerald" />
          <StatCard label="Private" value={privateCount} helper="Not visible on public pages" icon={ShieldCheck} tone="blue" />
          <StatCard label="Elevated or high" value={elevatedCount} helper="Profiles needing extra care" icon={ShieldCheck} tone={elevatedCount > 0 ? "amber" : "slate"} />
        </div>
        <DataTableToolbar
          title="Find a profile"
          description="Search by name, business, city, state, or slug. Filter to the records you need to review."
        >
          <form className="grid w-full gap-2 sm:w-auto sm:grid-cols-[220px_140px_140px_auto]">
            <Input name="q" defaultValue={params.q} placeholder="Search profiles" aria-label="Search client profiles" />
            <select name="status" defaultValue={status} className="h-10 rounded-md border border-input bg-white px-3 text-sm">
              <option value="all">All status</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            <select name="risk" defaultValue={risk} className="h-10 rounded-md border border-input bg-white px-3 text-sm">
              <option value="all">All risk</option>
              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="Elevated">Elevated</option>
              <option value="High">High</option>
            </select>
            <Button className="bg-slate-950 text-white hover:bg-slate-800">
              <Search aria-hidden="true" />
              Filter
            </Button>
          </form>
        </DataTableToolbar>
        <div className="grid gap-4 lg:grid-cols-3">
          {filteredClients.slice(0, 6).map((client) => (
            <div key={client.id} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">Profile health</p>
                  <h2 className="mt-2 font-semibold text-slate-950">
                    {client.firstName} {client.lastName}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">{client.city}, {client.state}</p>
                </div>
                <StatusBadge tone={client.isPublic ? "emerald" : "slate"}>
                  {client.isPublic ? "Public" : "Private"}
                </StatusBadge>
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
          {filteredClients.length === 0 ? (
            <div className="lg:col-span-3">
              <EmptyState
                icon={Search}
                title="No client profiles match"
                description="Clear the filters or search another name, city, state, business, or profile slug."
              />
            </div>
          ) : null}
        </div>
        <div className="grid gap-4">
          {filteredClients.map((client) => (
            <AdminClientEditor key={client.id} client={client} />
          ))}
        </div>
      </div>
    </section>
  )
}
