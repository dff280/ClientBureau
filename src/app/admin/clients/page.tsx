import type { Metadata } from "next"
import { AlertTriangle, Clock3, Eye, FileCheck2, Search, ShieldCheck, UserRound, type LucideIcon } from "lucide-react"

import { AdminActionOutcomePanel, AdminFilterBar } from "@/components/admin/admin-crm-ui"
import { AdminClientEditor, type ClientProfileReportMetrics } from "@/components/admin/admin-record-forms"
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
import type { ClientProfile } from "@/lib/types"

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
  const reportMetricsByClientId = buildReportMetrics(data.reports)
  const getClientMetrics = (clientId: string) => reportMetricsByClientId.get(clientId) ?? emptyMetrics
  const readyToPublishCount = data.clients.filter((client) => !client.isPublic && getClientMetrics(client.id).approved > 0).length
  const disputeReviewCount = data.clients.filter((client) => getClientMetrics(client.id).disputed > 0).length
  const stalePublicCount = data.clients.filter((client) => client.isPublic && isOlderThanDays(client.updatedAt, 45)).length
  const filteredClients = data.clients
    .filter((client) => {
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
    .sort((a, b) => clientPriority(b, getClientMetrics(b.id)) - clientPriority(a, getClientMetrics(a.id)))

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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Total profiles" value={data.clients.length} helper="All client profile records" icon={UserRound} tone="slate" />
          <StatCard label="Public" value={publicCount} helper="SEO-visible approved profiles" icon={Eye} tone="emerald" />
          <StatCard label="Private" value={privateCount} helper="Not visible on public pages" icon={ShieldCheck} tone="blue" />
          <StatCard label="Elevated or high" value={elevatedCount} helper="Profiles needing extra care" icon={ShieldCheck} tone={elevatedCount > 0 ? "amber" : "slate"} />
          <StatCard label="Ready checks" value={readyToPublishCount} helper="Private profiles with approved reports" icon={FileCheck2} tone={readyToPublishCount > 0 ? "amber" : "slate"} />
        </div>
        <DashboardSection
          eyebrow="Today's profile work"
          title="Prioritize records before changing visibility"
          description="Start with profiles that have approved report context, open disputes, stale public data, or elevated risk. These are the records most likely to affect search quality and fairness."
        >
          <div className="grid gap-3 md:grid-cols-4">
            <ProfileWorkTile
              icon={FileCheck2}
              label="Ready to publish"
              value={readyToPublishCount}
              text="Private profiles with approved report context that may be ready for public visibility."
              tone={readyToPublishCount > 0 ? "amber" : "slate"}
            />
            <ProfileWorkTile
              icon={AlertTriangle}
              label="Dispute review"
              value={disputeReviewCount}
              text="Profiles with disputed report context that need careful response and visibility checks."
              tone={disputeReviewCount > 0 ? "amber" : "slate"}
            />
            <ProfileWorkTile
              icon={Clock3}
              label="Stale public records"
              value={stalePublicCount}
              text="Public profiles that have not been reviewed in more than 45 days."
              tone={stalePublicCount > 0 ? "amber" : "slate"}
            />
            <ProfileWorkTile
              icon={ShieldCheck}
              label="Private identifiers"
              value="Sealed"
              text="Phone, email, street address, raw evidence, and internal notes stay out of public views."
              tone="emerald"
            />
          </div>
        </DashboardSection>
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
            <AdminClientEditor key={client.id} client={client} metrics={getClientMetrics(client.id)} />
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

const emptyMetrics: ClientProfileReportMetrics = {
  approved: 0,
  disputed: 0,
  evidence: 0,
  pending: 0,
  positive: 0,
  rejected: 0,
  resolved: 0,
  total: 0,
}

function buildReportMetrics(reports: Awaited<ReturnType<typeof getAdminWorkspaceDataService>>["reports"]) {
  const metrics = new Map<string, ClientProfileReportMetrics>()

  for (const report of reports) {
    const current = metrics.get(report.clientId) ?? { ...emptyMetrics }
    current.total += 1

    if (report.status === "approved") current.approved += 1
    if (report.status === "pending") current.pending += 1
    if (report.status === "rejected") current.rejected += 1
    if (report.status === "disputed") current.disputed += 1
    if (report.evidenceAttached) current.evidence += 1
    if (["Positive experience", "Would work with again"].includes(report.reportCategory)) current.positive += 1
    if (report.issueResolved || report.resolutionStatus === "Resolved") current.resolved += 1
    if (!current.lastReportAt || new Date(report.createdAt).getTime() > new Date(current.lastReportAt).getTime()) {
      current.lastReportAt = report.createdAt
    }

    metrics.set(report.clientId, current)
  }

  return metrics
}

function clientPriority(client: ClientProfile, metrics: ClientProfileReportMetrics) {
  let priority = 0
  if (!client.isPublic && metrics.approved > 0) priority += 100
  if (metrics.pending > 0) priority += 60
  if (metrics.disputed > 0) priority += 50
  if (["Elevated", "High"].includes(client.riskLevel)) priority += 25
  if (client.isPublic && isOlderThanDays(client.updatedAt, 45)) priority += 10
  return priority
}

function isOlderThanDays(value: string, days: number) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  return Date.now() - date.getTime() > days * 86_400_000
}

function ProfileWorkTile({
  icon: Icon,
  label,
  text,
  tone = "slate",
  value,
}: {
  icon: LucideIcon
  label: string
  text: string
  tone?: "slate" | "amber" | "emerald"
  value: number | string
}) {
  const toneClass = {
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
  }[tone]

  return (
    <div className={`rounded-md border p-4 ${toneClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase opacity-70">{label}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white/80 text-slate-950 shadow-sm">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 opacity-80">{text}</p>
    </div>
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
