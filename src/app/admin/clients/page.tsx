import type { Metadata } from "next"
import { Eye, Search, ShieldCheck, UserRound } from "lucide-react"

import { AdminActionOutcomePanel, AdminFilterBar } from "@/components/admin/admin-crm-ui"
import { AdminClientEditor } from "@/components/admin/admin-record-forms"
import {
  AdminPageHeader,
  DashboardSection,
  EmptyState,
  HeaderActionButton,
  StatCard,
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
        <DashboardSection
          eyebrow="Profile editing rules"
          title="Keep public records clean and private data sealed"
          description="Profile edits should improve identity clarity, public visibility, rating context, and response fairness without exposing private matching information."
        >
          <div className="grid gap-3 md:grid-cols-3">
            <ProfileRule title="Use dropdown states" text="City and state should stay consistent for search, public profile URLs, and directory pages." />
            <ProfileRule title="Require audit notes" text="Visibility, rating, risk, and identity edits need a clear moderator note before saving." />
            <ProfileRule title="Preview public output" text="Open the public profile after edits and confirm only approved summaries and safe labels are visible." />
          </div>
        </DashboardSection>
        <AdminActionOutcomePanel
          title="After editing a client profile"
          description="Profile edits should improve matching, SEO, rating context, and fairness without turning private records into public content."
          items={[
            {
              detail: "The public slug, city, state, visibility, rating, risk level, and report count should be clear before a profile is public.",
              label: "Profile health",
              status: "Reviewed",
              title: "Public fields should be intentional",
              tone: "blue",
            },
            {
              detail: "Phone hashes, email hashes, raw contact details, evidence paths, internal notes, and pending records must stay out of public cards.",
              label: "Privacy",
              status: "Sealed",
              title: "Private identifiers should remain hidden",
              tone: "emerald",
            },
            {
              detail: "Visibility, rating, risk, identity, and merge-related edits should include a moderator note that another admin can understand later.",
              label: "Audit",
              status: "Required",
              title: "The edit should be traceable",
              tone: "amber",
            },
          ]}
        />
        <AdminFilterBar
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
        </AdminFilterBar>
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredClients.map((client) => (
            <AdminClientEditor key={client.id} client={client} />
          ))}
          {filteredClients.length === 0 ? (
            <div className="xl:col-span-2">
              <EmptyState
                icon={Search}
                title="No client profiles match"
                description="Clear the filters or search another name, city, state, business, or profile slug."
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function ProfileRule({ text, title }: { text: string; title: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <p className="font-semibold text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  )
}
