"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowRight, FileText } from "lucide-react"

import { RiskBadge } from "@/components/client/risk-badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { isPositiveReportCategory, type ClientProfile, type ClientReport, type ReportEvidence } from "@/lib/types"

const statuses = [
  "All",
  "Draft",
  "Submitted",
  "In Review",
  "Needs More Info",
  "Approved",
  "Positive",
  "Rejected",
  "Published",
  "Disputed",
  "Resolved",
] as const

type WorkflowStatus = (typeof statuses)[number]

export function DashboardReports({
  reports,
  clients,
  evidence,
}: {
  reports: ClientReport[]
  clients: ClientProfile[]
  evidence: ReportEvidence[]
}) {
  const [status, setStatus] = useState<WorkflowStatus>("All")
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)

  const selectedReport = reports.find((report) => report.id === selectedReportId)
  const selectedClient = selectedReport
    ? clients.find((client) => client.id === selectedReport.clientId)
    : undefined
  const selectedEvidence = selectedReport
    ? evidence.filter((item) => item.reportId === selectedReport.id)
    : []

  const filteredReports = useMemo(
    () =>
      reports.filter((report) => reportMatchesStatus(report, status, clients)),
    [clients, reports, status],
  )
  const statusCounts = useMemo(
    () =>
      statuses.map((item) => ({
        label: item,
        count: reports.filter((report) => reportMatchesStatus(report, item, clients)).length,
      })),
    [clients, reports],
  )

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase text-amber-700">Report workspace</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Showing {filteredReports.length} of {reports.length} submitted reports. Positive reports, payment issues,
                disputes, and resolved records stay grouped by status.
              </p>
            </div>
            <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
              <Link href="/submit-report">
                Report a Client Experience
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>

        <Tabs value={status} onValueChange={(value) => setStatus(value as WorkflowStatus)}>
          <TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
            {statusCounts.map((item) => (
              <TabsTrigger
                key={item.label}
                value={item.label}
                className="group rounded-md border border-slate-200 bg-white px-3 py-2 capitalize data-[state=active]:bg-slate-950 data-[state=active]:text-white"
              >
                {item.label}
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 group-data-[state=active]:bg-white/15 group-data-[state=active]:text-white">
                  {item.count}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="grid gap-3 md:hidden">
          {filteredReports.map((report) => (
            <ReportStatusCard
              key={report.id}
              client={clients.find((profile) => profile.id === report.clientId)}
              evidenceCount={evidence.filter((item) => item.reportId === report.id).length}
              onView={() => setSelectedReportId(report.id)}
              report={report}
            />
          ))}
          {filteredReports.length === 0 ? <ReportEmptyState status={status} /> : null}
        </div>

        <div className="hidden overflow-hidden rounded-md border border-slate-200 bg-white md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Evidence</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => {
                const client = clients.find((profile) => profile.id === report.clientId)
                const evidenceCount = evidence.filter((item) => item.reportId === report.id).length
                const publicStatus = getWorkflowLabel(report, Boolean(client?.isPublic))
                const isPositive = isPositiveReportCategory(report.reportCategory)

                return (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      {client ? `${client.firstName} ${client.lastName}` : "Client"}
                      {client?.isPublic ? (
                        <div className="mt-1">
                          <Link href={`/client/${client.publicSlug}`} className="text-xs text-amber-700">
                            Public profile
                          </Link>
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {report.reportCategory}
                      {isPositive ? (
                        <div className="mt-1 text-xs font-medium text-emerald-700">Positive report</div>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <span className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold uppercase text-slate-600">
                        {publicStatus}
                      </span>
                    </TableCell>
                    <TableCell>{evidenceCount} files</TableCell>
                    <TableCell className="text-right">
                      <Button type="button" variant="outline" size="sm" onClick={() => setSelectedReportId(report.id)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8">
                    <ReportEmptyState status={status} />
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </div>

      <Sheet open={Boolean(selectedReport)} onOpenChange={(open) => !open && setSelectedReportId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>
              {selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : "Report detail"}
            </SheetTitle>
          </SheetHeader>
          {selectedReport ? (
            <div className="mt-6 space-y-5">
              {selectedClient ? (
                <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {selectedClient.city}, {selectedClient.state}
                    </p>
                    <p className="text-xs text-slate-500">Score {selectedClient.clientBureauScore}</p>
                  </div>
                  <RiskBadge riskLevel={selectedClient.riskLevel} />
                </div>
              ) : null}
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Public summary</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{selectedReport.publicSummary}</p>
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">Contract</p>
                  <p className="font-semibold text-slate-950">${selectedReport.contractAmount.toLocaleString()}</p>
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    {isPositiveReportCategory(selectedReport.reportCategory) ? "Positive payment context" : "Unpaid"}
                  </p>
                  <p className="font-semibold text-slate-950">
                    {isPositiveReportCategory(selectedReport.reportCategory)
                      ? "No unpaid amount reported"
                      : `$${selectedReport.amountUnpaid.toLocaleString()}`}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-950">Evidence</p>
                {selectedEvidence.length > 0 ? (
                  selectedEvidence.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 rounded-md border border-slate-200 p-3 text-sm">
                      <FileText className="size-4 text-slate-500" aria-hidden="true" />
                      {item.fileName}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No evidence files are attached.</p>
                )}
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  )
}

function reportMatchesStatus(report: ClientReport, status: WorkflowStatus, clients: ClientProfile[]) {
  const client = clients.find((profile) => profile.id === report.clientId)

  if (status === "All") return true
  if (status === "Draft") return false
  if (status === "Submitted" || status === "In Review") return report.status === "pending"
  if (status === "Needs More Info") return report.moderationNote?.toLowerCase().includes("more info") ?? false
  if (status === "Approved") return report.status === "approved"
  if (status === "Positive") return isPositiveReportCategory(report.reportCategory)
  if (status === "Rejected") return report.status === "rejected"
  if (status === "Published") return report.status === "approved" && Boolean(client?.isPublic)
  if (status === "Disputed") return report.status === "disputed"
  if (status === "Resolved") {
    return ["resolved", "paid"].some((term) => report.paymentStatus.toLowerCase().includes(term))
  }

  return true
}

function ReportStatusCard({
  client,
  evidenceCount,
  onView,
  report,
}: {
  client?: ClientProfile
  evidenceCount: number
  onView: () => void
  report: ClientReport
}) {
  const publicStatus = getWorkflowLabel(report, Boolean(client?.isPublic))
  const isPositive = isPositiveReportCategory(report.reportCategory)

  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-amber-700">
            {isPositive ? "Positive client experience" : "Client experience report"}
          </p>
          <h3 className="mt-1 truncate font-semibold text-slate-950">
            {client ? `${client.firstName} ${client.lastName}` : "Client"}
          </h3>
          {client ? (
            <p className="mt-1 text-xs text-slate-500">
              {client.city}, {client.state}
            </p>
          ) : null}
        </div>
        <span className="shrink-0 rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold uppercase text-slate-600">
          {publicStatus}
        </span>
      </div>

      <div className="mt-4 grid gap-2 text-sm">
        <div className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2">
          <span className="text-slate-500">Category</span>
          <span className="font-medium text-slate-950">{report.reportCategory}</span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2">
          <span className="text-slate-500">Payment context</span>
          <span className="font-medium text-slate-950">
            {isPositive ? "No issue reported" : `$${report.amountUnpaid.toLocaleString()} reported unpaid`}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2">
          <span className="text-slate-500">Evidence</span>
          <span className="font-medium text-slate-950">{evidenceCount} file{evidenceCount === 1 ? "" : "s"}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onView}>
          View details
        </Button>
        {client?.isPublic ? (
          <Button asChild variant="ghost" size="sm">
            <Link href={`/client/${client.publicSlug}`}>Open public profile</Link>
          </Button>
        ) : null}
      </div>
    </article>
  )
}

function ReportEmptyState({ status }: { status: WorkflowStatus }) {
  return (
    <div className="mx-auto max-w-xl rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <p className="text-sm font-semibold text-slate-950">No {status.toLowerCase()} reports yet.</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        When reports enter this status, they will appear here with evidence, publication, and moderation context.
      </p>
      <Button asChild className="mt-4 bg-slate-950 text-white hover:bg-slate-800">
        <Link href="/submit-report">Report a Client Experience</Link>
      </Button>
    </div>
  )
}

function getWorkflowLabel(report: ClientReport, isPublic: boolean) {
  if (report.status === "pending") return "In Review"
  if (report.status === "approved" && isPublic) return "Published"
  if (report.status === "approved") return "Approved"
  if (report.status === "rejected") return "Rejected"
  if (report.status === "disputed") return "Disputed"

  return report.status
}
