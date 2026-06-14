import type { Metadata } from "next"
import Link from "next/link"
import {
  AlertTriangle,
  ExternalLink,
  FileSearch,
  History,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AdminPageHeader, DataTableToolbar, StatCard, StatusBadge } from "@/components/dashboard/dashboard-ui"
import { getAdminWorkspaceDataService } from "@/lib/repositories/client-bureau-service"
import type { AdminEntityType, AuditLogEntry } from "@/lib/types"

export const metadata: Metadata = {
  title: "Admin Audit Log",
  description:
    "Internal audit trail for Client Bureau admin approvals, edits, imports, deletes, profile graph changes, service cases, and publication decisions.",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

type AuditSearchParams = Promise<{
  actor?: string
  action?: string
  entity?: string
  date?: string
  severity?: string
}>

export default async function AdminAuditLogPage({ searchParams }: { searchParams: AuditSearchParams }) {
  const params = await searchParams
  const data = await getAdminWorkspaceDataService()
  const actor = params.actor?.trim().toLowerCase() ?? ""
  const action = params.action?.trim().toLowerCase() ?? ""
  const entity = params.entity?.trim().toLowerCase() ?? ""
  const date = params.date?.trim() ?? ""
  const severity = params.severity?.trim().toLowerCase() ?? ""
  const entries = data.auditLog.filter((entry) => {
    const actorText = [entry.actorName, entry.actorId].filter(Boolean).join(" ").toLowerCase()
    const actionText = entry.action.toLowerCase()
    const entityText = [entry.entityType, entry.entityId].join(" ").toLowerCase()
    const dateText = new Date(entry.createdAt).toISOString().slice(0, 10)
    const severityText = getAuditSeverity(entry).level

    return (
      (!actor || actorText.includes(actor)) &&
      (!action || actionText.includes(action)) &&
      (!entity || entityText.includes(entity)) &&
      (!date || dateText === date) &&
      (!severity || severityText === severity)
    )
  })
  const hasFilters = Boolean(actor || action || entity || date || severity)
  const adminActions = data.auditLog.filter((entry) => entry.actorId).length
  const visibilityChanges = data.auditLog.filter((entry) =>
    entry.summary.toLowerCase().includes("public") || entry.action.toLowerCase().includes("visibility"),
  ).length
  const highAttentionActions = data.auditLog.filter((entry) => getAuditSeverity(entry).level === "high").length
  const systemEvents = data.auditLog.filter((entry) => !entry.actorId).length
  const actorOptions = uniqueAuditOptions(
    data.auditLog.flatMap((entry) => [entry.actorName, entry.actorId]),
  ).slice(0, 40)
  const actionOptions = uniqueAuditOptions(data.auditLog.map((entry) => entry.action))
  const entityOptions = uniqueAuditOptions(data.auditLog.map((entry) => entry.entityType))

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <AdminPageHeader
          eyebrow="Platform"
          title="Audit Log"
          description="Follow the staff trail for approvals, edits, imports, deletes, profile graph changes, service cases, and publication decisions."
          meta={
            <div className="grid gap-2 text-xs font-semibold uppercase text-slate-600 sm:grid-cols-3">
              <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                <ShieldCheck className="size-4 text-amber-700" aria-hidden="true" />
                Every decision should be traceable
              </span>
              <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                <FileSearch className="size-4 text-amber-700" aria-hidden="true" />
                Filter by actor, entity, date
              </span>
              <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                <AlertTriangle className="size-4 text-amber-700" aria-hidden="true" />
                High-attention actions stay visible
              </span>
            </div>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total events" value={data.auditLog.length} helper="All recorded audit entries" icon={History} tone="slate" />
          <StatCard label="Filtered view" value={entries.length} helper={hasFilters ? "Events matching active filters" : "Showing the full audit trail"} icon={Search} tone="blue" />
          <StatCard label="Admin actions" value={adminActions} helper="Events tied to an authenticated staff actor" icon={UserRound} tone="emerald" />
          <StatCard label="High attention" value={highAttentionActions} helper="Deletes, rejects, redactions, merges, and blocked actions" icon={AlertTriangle} tone={highAttentionActions > 0 ? "rose" : "slate"} />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <AuditFocusCard
            title="Publication and visibility"
            value={visibilityChanges}
            description="Public/private profile movement, approved summaries, and publication decisions."
            href="/admin/clients"
            tone="amber"
          />
          <AuditFocusCard
            title="Admin-attributed actions"
            value={adminActions}
            description="Entries tied to an authenticated staff or admin actor."
            href="/admin/contractors"
            tone="blue"
          />
          <AuditFocusCard
            title="System or service events"
            value={systemEvents}
            description="Automated or service-generated records that may need operational context."
            href="/admin/settings"
            tone={systemEvents > 0 ? "slate" : "emerald"}
          />
        </div>
        <DataTableToolbar
          title="Filter audit trail"
          description="Narrow the log by actor, action, entity, exact date, or inferred attention level."
        >
          <form className="grid w-full gap-2 lg:grid-cols-[1fr_1fr_1fr_160px_170px_auto_auto]">
            <Input name="actor" defaultValue={params.actor} placeholder="Actor" aria-label="Filter actor" list="audit-actor-options" />
            <Input name="action" defaultValue={params.action} placeholder="Action" aria-label="Filter action" list="audit-action-options" />
            <Input name="entity" defaultValue={params.entity} placeholder="Entity" aria-label="Filter entity" list="audit-entity-options" />
            <Input name="date" defaultValue={params.date} type="date" aria-label="Filter date" />
            <select
              name="severity"
              defaultValue={params.severity ?? ""}
              aria-label="Filter attention level"
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">All attention levels</option>
              <option value="high">High attention</option>
              <option value="attention">Needs review</option>
              <option value="success">Completed</option>
              <option value="routine">Routine</option>
            </select>
            <Button className="bg-slate-950 text-white hover:bg-slate-800">
              <Search aria-hidden="true" />
              Apply
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/audit-log">Clear</Link>
            </Button>
            <AuditFilterOptions id="audit-actor-options" options={actorOptions} />
            <AuditFilterOptions id="audit-action-options" options={actionOptions} format={formatAction} />
            <AuditFilterOptions id="audit-entity-options" options={entityOptions} format={formatEntityType} />
          </form>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Suggestions come from the current audit trail. You can still type partial names, action fragments, IDs, or entity types for broader searches.
          </p>
          {hasFilters ? (
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {actor ? <FilterPill label="Actor" value={params.actor ?? ""} /> : null}
              {action ? <FilterPill label="Action" value={params.action ?? ""} /> : null}
              {entity ? <FilterPill label="Entity" value={params.entity ?? ""} /> : null}
              {date ? <FilterPill label="Date" value={date} /> : null}
              {severity ? <FilterPill label="Attention" value={formatSeverityFilter(severity)} /> : null}
            </div>
          ) : null}
        </DataTableToolbar>

        <div className="grid gap-3 lg:hidden">
          {entries.map((entry) => (
            <AuditEventCard key={entry.id} entry={entry} />
          ))}
          {entries.length === 0 ? <AuditEmptyState hasFilters={hasFilters} /> : null}
        </div>

        <div className="hidden overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm lg:block">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Attention</th>
                <th className="p-3">Actor</th>
                <th className="p-3">Action</th>
                <th className="p-3">Entity</th>
                <th className="p-3">Summary</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const severityDetails = getAuditSeverity(entry)
                return (
                  <tr key={entry.id} className="border-b border-slate-100 align-top">
                    <td className="p-3 text-slate-600">
                      <p className="font-medium text-slate-700">{formatAuditDate(entry.createdAt)}</p>
                      <p className="mt-1 text-xs text-slate-500">{auditDateStamp(entry.createdAt)}</p>
                    </td>
                    <td className="p-3">
                      <StatusBadge tone={severityDetails.tone}>{severityDetails.label}</StatusBadge>
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-slate-950">{entry.actorName ?? "System"}</p>
                      <p className="mt-1 max-w-[180px] truncate text-xs text-slate-500">{entry.actorId ?? "Automated or imported event"}</p>
                    </td>
                    <td className="p-3">
                      <StatusBadge tone={actionTone(entry.action)}>{formatAction(entry.action)}</StatusBadge>
                    </td>
                    <td className="p-3 text-slate-600">
                      <EntityLink entry={entry} />
                    </td>
                    <td className="p-3">
                      <p className="max-w-xl text-slate-700">{entry.summary}</p>
                      <AuditMetadata metadata={entry.metadata} />
                    </td>
                  </tr>
                )
              })}
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8">
                    <AuditEmptyState hasFilters={hasFilters} />
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function AuditFocusCard({
  title,
  value,
  description,
  href,
  tone,
}: {
  title: string
  value: number
  description: string
  href: string
  tone: "slate" | "amber" | "emerald" | "blue"
}) {
  const toneClass = {
    slate: "border-slate-200 bg-white text-slate-950",
    amber: "border-amber-200 bg-amber-50 text-amber-950",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-950",
    blue: "border-sky-200 bg-sky-50 text-sky-950",
  }[tone]

  return (
    <Link href={href} className={`block rounded-md border p-4 shadow-sm transition hover:-translate-y-0.5 ${toneClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase opacity-70">{title}</p>
          <p className="mt-2 text-3xl font-semibold">{value}</p>
        </div>
        <ExternalLink className="size-4 opacity-60" aria-hidden="true" />
      </div>
      <p className="mt-2 text-sm leading-6 opacity-75">{description}</p>
    </Link>
  )
}

function AuditEventCard({ entry }: { entry: AuditLogEntry }) {
  const severity = getAuditSeverity(entry)
  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">{formatAuditDate(entry.createdAt)}</p>
          <h2 className="mt-2 font-semibold text-slate-950">{formatAction(entry.action)}</h2>
        </div>
        <StatusBadge tone={severity.tone}>{severity.label}</StatusBadge>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{entry.summary}</p>
      <div className="mt-4 grid gap-2 text-xs text-slate-600">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="font-semibold uppercase text-slate-500">Actor</p>
          <p className="mt-1 font-medium text-slate-900">{entry.actorName ?? "System"}</p>
          <p className="mt-1 truncate">{entry.actorId ?? "Automated or imported event"}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="font-semibold uppercase text-slate-500">Entity</p>
          <EntityLink entry={entry} />
        </div>
      </div>
      <AuditMetadata metadata={entry.metadata} />
    </article>
  )
}

function AuditEmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-md bg-slate-950 text-amber-300">
        <History className="size-6" aria-hidden="true" />
      </div>
      <h2 className="mt-4 font-semibold text-slate-950">
        {hasFilters ? "No audit entries match these filters" : "No audit events recorded yet"}
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
        {hasFilters
          ? "Clear filters or broaden the actor, action, entity, date, or attention level to review more events."
          : "Approvals, profile edits, imports, service updates, and record changes will appear here once recorded."}
      </p>
      {hasFilters ? (
        <Button asChild className="mt-4 bg-slate-950 text-white hover:bg-slate-800">
          <Link href="/admin/audit-log">Clear filters</Link>
        </Button>
      ) : null}
    </div>
  )
}

function FilterPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-700">
      <span className="text-slate-500">{label}</span>
      {value}
    </span>
  )
}

function AuditFilterOptions({
  format,
  id,
  options,
}: {
  format?: (value: string) => string
  id: string
  options: string[]
}) {
  if (options.length === 0) return null

  return (
    <datalist id={id}>
      {options.map((option) => (
        <option key={option} value={option}>
          {format ? format(option) : option}
        </option>
      ))}
    </datalist>
  )
}

function EntityLink({ entry }: { entry: AuditLogEntry }) {
  const href = entityHref(entry.entityType)
  const label = formatEntityType(entry.entityType)

  return (
    <Link href={href} className="group inline-flex max-w-[260px] flex-col gap-1 rounded-md text-sm font-medium text-slate-700 hover:text-slate-950">
      <span className="inline-flex items-center gap-1">
        {label}
        <ExternalLink className="size-3 opacity-50 transition group-hover:opacity-100" aria-hidden="true" />
      </span>
      <span className="truncate text-xs font-normal text-slate-500">{entry.entityId}</span>
    </Link>
  )
}

function AuditMetadata({ metadata }: { metadata?: AuditLogEntry["metadata"] }) {
  if (!metadata || Object.keys(metadata).length === 0) return null

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {Object.entries(metadata).slice(0, 4).map(([key, value]) => (
        <span key={key} className="inline-flex max-w-full items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600">
          <span className="font-semibold text-slate-700">{formatMetadataKey(key)}:</span>
          <span className="truncate">{String(value ?? "none")}</span>
        </span>
      ))}
    </div>
  )
}

function getAuditSeverity(entry: AuditLogEntry): {
  level: "high" | "attention" | "success" | "routine"
  label: string
  tone: "slate" | "amber" | "emerald" | "rose" | "blue"
} {
  const text = `${entry.action} ${entry.summary}`.toLowerCase()

  if (["delete", "deleted", "reject", "rejected", "redact", "redaction", "merge", "reassign", "blocked", "failed", "denied"].some((term) => text.includes(term))) {
    return { level: "high", label: "High attention", tone: "rose" }
  }

  if (["visibility", "public", "publish", "published", "approve", "approved", "filed", "lien", "release", "fee", "role", "setting"].some((term) => text.includes(term))) {
    return { level: "attention", label: "Needs review", tone: "amber" }
  }

  if (["created", "imported", "signed", "resolved", "completed", "accepted"].some((term) => text.includes(term))) {
    return { level: "success", label: "Completed", tone: "emerald" }
  }

  return { level: "routine", label: "Routine", tone: "slate" }
}

function actionTone(action: string): "slate" | "amber" | "emerald" | "rose" | "blue" {
  const normalized = action.toLowerCase()
  if (["delete", "reject", "redact", "merge", "reassign"].some((term) => normalized.includes(term))) return "rose"
  if (["approve", "publish", "visibility", "file"].some((term) => normalized.includes(term))) return "amber"
  if (["create", "import", "sign", "resolve"].some((term) => normalized.includes(term))) return "emerald"
  return "blue"
}

function entityHref(entityType: AdminEntityType): string {
  const routes: Partial<Record<AdminEntityType, string>> = {
    user: "/admin/contractors",
    contractor: "/admin/contractors",
    client: "/admin/clients",
    entity_profile: "/admin/profiles",
    profile_claim: "/admin/profiles",
    project_job: "/admin/profiles",
    profile_relationship: "/admin/profiles",
    profile_merge: "/admin/profiles",
    report_reassignment: "/admin/profiles",
    profile_redaction: "/admin/profiles",
    report: "/admin/reports",
    discussion: "/admin/discussions",
    evidence: "/admin/reports",
    bulk_upload: "/admin/uploads",
    recovery: "/admin/recovery",
    lien_readiness: "/admin/recovery",
    contract: "/admin/contracts",
    contract_packet: "/admin/contracts",
    managed_recovery: "/admin/recovery",
    florida_lien: "/admin/recovery",
    service_fee: "/admin/recovery",
    risk_room: "/admin/clients",
    pipeline: "/admin/clients",
    evidence_vault: "/admin/reports",
    saved_view: "/admin/settings",
    assignment: "/admin/settings",
    compliance_review: "/admin/recovery",
    setting: "/admin/settings",
  }

  return routes[entityType] ?? "/admin"
}

function formatAuditDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function auditDateStamp(value: string) {
  return `Audit date ${new Date(value).toISOString().slice(0, 10)}`
}

function formatAction(action: string) {
  return action.replaceAll("_", " ")
}

function formatEntityType(entityType: string) {
  return entityType.replaceAll("_", " ")
}

function formatMetadataKey(key: string) {
  return key.replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("_", " ").toLowerCase()
}

function formatSeverityFilter(severity: string) {
  if (severity === "high") return "High attention"
  if (severity === "attention") return "Needs review"
  if (severity === "success") return "Completed"
  if (severity === "routine") return "Routine"
  return severity
}

function uniqueAuditOptions(values: Array<string | null | undefined>) {
  return [...new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value)))].sort((a, b) =>
    a.localeCompare(b),
  )
}
