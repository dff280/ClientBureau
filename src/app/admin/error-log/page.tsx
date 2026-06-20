import type { Metadata } from "next"
import Link from "next/link"
import { AlertTriangle, Bug, CheckCircle2, Clock3, ExternalLink, Search, ShieldCheck } from "lucide-react"

import { SiteErrorStatusForm } from "@/components/admin/site-error-status-form"
import { AdminPageHeader, DataTableToolbar, StatCard, StatusBadge } from "@/components/dashboard/dashboard-ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getSiteErrorReportsService } from "@/lib/repositories/client-bureau-service"
import type { SiteErrorReport } from "@/lib/types"

export const metadata: Metadata = {
  title: "Admin Error Log",
  description: "Internal Client Bureau site issue log for user-reported bugs, browser issues, QA findings, and launch triage.",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

type ErrorLogSearchParams = Promise<{
  status?: string
  severity?: string
  source?: string
  route?: string
}>

export default async function AdminErrorLogPage({ searchParams }: { searchParams: ErrorLogSearchParams }) {
  const params = await searchParams
  const reports = await getSiteErrorReportsService()
  const status = params.status?.trim().toLowerCase() ?? ""
  const severity = params.severity?.trim().toLowerCase() ?? ""
  const source = params.source?.trim().toLowerCase() ?? ""
  const route = params.route?.trim().toLowerCase() ?? ""
  const filtered = reports.filter((report) =>
    (!status || report.status === status) &&
    (!severity || report.severity === severity) &&
    (!source || report.source === source) &&
    (!route || report.route.toLowerCase().includes(route)),
  )
  const hasFilters = Boolean(status || severity || source || route)
  const openReports = reports.filter((report) => !["resolved", "ignored"].includes(report.status)).length
  const highAttention = reports.filter((report) => ["high", "critical"].includes(report.severity) && !["resolved", "ignored"].includes(report.status)).length
  const resolvedReports = reports.filter((report) => report.status === "resolved").length
  const browserReports = reports.filter((report) => report.source === "browser" || report.source === "manual").length

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <AdminPageHeader
          eyebrow="Platform"
          title="Error Log"
          description="Review reported site bugs, browser issues, QA findings, and launch blockers without digging through server logs."
          meta={
            <div className="grid gap-2 text-xs font-semibold uppercase text-slate-600 sm:grid-cols-3">
              <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                <ShieldCheck className="size-4 text-amber-700" aria-hidden="true" />
                Private data redacted before storage
              </span>
              <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                <Bug className="size-4 text-amber-700" aria-hidden="true" />
                Triage by route, severity, source
              </span>
              <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                <AlertTriangle className="size-4 text-amber-700" aria-hidden="true" />
                Do not paste passwords or raw evidence
              </span>
            </div>
          }
          actions={
            <>
              <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                <Link href="/admin/audit-log">
                  <ExternalLink aria-hidden="true" />
                  Audit Log
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/settings">Settings</Link>
              </Button>
            </>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Open issues" value={openReports} helper="New, triaged, or in-progress reports" icon={Bug} tone={openReports > 0 ? "amber" : "emerald"} />
          <StatCard label="High attention" value={highAttention} helper="High or critical unresolved issues" icon={AlertTriangle} tone={highAttention > 0 ? "rose" : "slate"} />
          <StatCard label="Browser/manual" value={browserReports} helper="Reports from users, staff, or QA" icon={Search} tone="blue" />
          <StatCard label="Resolved" value={resolvedReports} helper="Closed site issue reports" icon={CheckCircle2} tone="emerald" />
        </div>

        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-amber-800">How to send an issue back to Codex</p>
              <h2 className="mt-2 text-lg font-semibold text-amber-950">Copy the route, message, and status from this page.</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-amber-900">
                Admins should include the affected route, what they clicked, what they expected, and the newest error-log ID. Do not paste passwords, raw evidence files, private addresses, or full private contract text into issue notes.
              </p>
            </div>
            <code className="rounded-md border border-amber-200 bg-white px-3 py-2 text-xs text-amber-950">
              POST /api/error-reports
            </code>
          </div>
        </div>

        <DataTableToolbar
          title="Filter site issues"
          description="Narrow reports by status, severity, source, or route before updating the triage state."
        >
          <form className="grid w-full gap-2 lg:grid-cols-[170px_170px_170px_1fr_auto_auto]">
            <select
              name="status"
              defaultValue={params.status ?? ""}
              aria-label="Filter status"
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">All statuses</option>
              <option value="new">New</option>
              <option value="triaged">Triaged</option>
              <option value="in_progress">In progress</option>
              <option value="resolved">Resolved</option>
              <option value="ignored">Ignored</option>
            </select>
            <select
              name="severity"
              defaultValue={params.severity ?? ""}
              aria-label="Filter severity"
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">All severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="info">Info</option>
            </select>
            <select
              name="source"
              defaultValue={params.source ?? ""}
              aria-label="Filter source"
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">All sources</option>
              <option value="manual">Manual</option>
              <option value="browser">Browser</option>
              <option value="server">Server</option>
              <option value="qa">QA</option>
            </select>
            <Input name="route" defaultValue={params.route} placeholder="/admin/reports" aria-label="Filter route" />
            <Button className="bg-slate-950 text-white hover:bg-slate-800">
              <Search aria-hidden="true" />
              Apply
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/error-log">Clear</Link>
            </Button>
          </form>
        </DataTableToolbar>

        <div className="grid gap-4">
          {filtered.map((report) => (
            <SiteErrorCard key={report.id} report={report} />
          ))}
          {filtered.length === 0 ? <ErrorLogEmptyState hasFilters={hasFilters} /> : null}
        </div>
      </div>
    </section>
  )
}

function SiteErrorCard({ report }: { report: SiteErrorReport }) {
  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={severityTone(report.severity)}>{formatSeverity(report.severity)}</StatusBadge>
            <StatusBadge tone={statusTone(report.status)}>{formatStatus(report.status)}</StatusBadge>
            <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold uppercase text-slate-600">
              <Clock3 className="size-3" aria-hidden="true" />
              {formatDate(report.createdAt)}
            </span>
          </div>
          <h2 className="mt-3 text-lg font-semibold text-slate-950">{report.message}</h2>
          {report.notes ? <p className="mt-2 text-sm leading-6 text-slate-700">{report.notes}</p> : null}
          <div className="mt-4 grid gap-2 text-xs text-slate-600 md:grid-cols-2 xl:grid-cols-4">
            <ContextPill label="Route" value={report.route} />
            <ContextPill label="Source" value={formatStatus(report.source)} />
            <ContextPill label="Reporter" value={report.reporterRole ?? "Anonymous/public"} />
            <ContextPill label="Viewport" value={report.viewportWidth && report.viewportHeight ? `${report.viewportWidth} x ${report.viewportHeight}` : "Not supplied"} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {report.pageTitle ? <ContextPill label="Page" value={report.pageTitle} /> : null}
            {report.browserLanguage ? <ContextPill label="Language" value={report.browserLanguage} /> : null}
            {report.userAgent ? <ContextPill label="User agent" value={report.userAgent} wide /> : null}
          </div>
          <p className="mt-3 font-mono text-xs text-slate-500">{report.id}</p>
        </div>
        <div className="w-full rounded-md border border-slate-200 bg-slate-50 p-3 xl:w-80">
          <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Triage status</p>
          <SiteErrorStatusForm reportId={report.id} status={report.status} />
        </div>
      </div>
    </article>
  )
}

function ContextPill({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <span className={`inline-flex min-w-0 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 ${wide ? "max-w-full" : ""}`}>
      <span className="shrink-0 font-semibold uppercase text-slate-500">{label}</span>
      <span className="truncate text-slate-700">{value}</span>
    </span>
  )
}

function ErrorLogEmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-md bg-slate-950 text-amber-300">
        <Bug className="size-6" aria-hidden="true" />
      </div>
      <h2 className="mt-4 font-semibold text-slate-950">
        {hasFilters ? "No site issues match these filters" : "No site issues reported yet"}
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
        {hasFilters
          ? "Clear filters or broaden the status, severity, source, or route to review more issues."
          : "Browser reports, staff QA notes, and launch blockers will appear here after migration 0025 is applied and reports are submitted."}
      </p>
      {hasFilters ? (
        <Button asChild className="mt-4 bg-slate-950 text-white hover:bg-slate-800">
          <Link href="/admin/error-log">Clear filters</Link>
        </Button>
      ) : null}
    </div>
  )
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatSeverity(value: SiteErrorReport["severity"]) {
  return value === "info" ? "Info" : formatStatus(value)
}

function severityTone(value: SiteErrorReport["severity"]): "slate" | "amber" | "rose" | "emerald" | "blue" {
  if (value === "critical" || value === "high") return "rose"
  if (value === "medium") return "amber"
  if (value === "low") return "blue"
  return "slate"
}

function statusTone(value: SiteErrorReport["status"]): "slate" | "amber" | "rose" | "emerald" | "blue" {
  if (value === "resolved") return "emerald"
  if (value === "ignored") return "slate"
  if (value === "in_progress") return "blue"
  if (value === "triaged") return "amber"
  return "rose"
}
