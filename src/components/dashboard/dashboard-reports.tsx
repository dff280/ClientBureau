"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { FileText } from "lucide-react"

import { RiskBadge } from "@/components/client/risk-badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ClientProfile, ClientReport, ReportEvidence } from "@/lib/types"

const statuses = [
  "All",
  "Draft",
  "Submitted",
  "In Review",
  "Needs More Info",
  "Approved",
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
      reports.filter((report) => {
        const client = clients.find((profile) => profile.id === report.clientId)

        if (status === "All") return true
        if (status === "Draft") return false
        if (status === "Submitted" || status === "In Review") return report.status === "pending"
        if (status === "Needs More Info") return report.moderationNote?.toLowerCase().includes("more info")
        if (status === "Approved") return report.status === "approved"
        if (status === "Rejected") return report.status === "rejected"
        if (status === "Published") return report.status === "approved" && Boolean(client?.isPublic)
        if (status === "Disputed") return report.status === "disputed"
        if (status === "Resolved") {
          return ["resolved", "paid"].some((term) => report.paymentStatus.toLowerCase().includes(term))
        }

        return true
      }),
    [clients, reports, status],
  )

  return (
    <>
      <div className="space-y-4">
        <Tabs value={status} onValueChange={(value) => setStatus(value as WorkflowStatus)}>
          <TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
            {statuses.map((item) => (
              <TabsTrigger
                key={item}
                value={item}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 capitalize data-[state=active]:bg-slate-950 data-[state=active]:text-white"
              >
                {item}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
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
                  <TableCell>{report.reportCategory}</TableCell>
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
                <TableCell colSpan={5} className="py-8 text-center text-sm text-slate-500">
                  No reports match this status yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
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
                  <p className="text-xs font-semibold uppercase text-slate-500">Unpaid</p>
                  <p className="font-semibold text-slate-950">${selectedReport.amountUnpaid.toLocaleString()}</p>
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

function getWorkflowLabel(report: ClientReport, isPublic: boolean) {
  if (report.status === "pending") return "In Review"
  if (report.status === "approved" && isPublic) return "Published"
  if (report.status === "approved") return "Approved"
  if (report.status === "rejected") return "Rejected"
  if (report.status === "disputed") return "Disputed"

  return report.status
}
