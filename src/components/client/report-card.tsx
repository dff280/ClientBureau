import { FileText, ThumbsUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { isPositiveReportCategory, type ClientReport } from "@/lib/types"

export function ReportCard({ report }: { report: ClientReport }) {
  const isPositive = isPositiveReportCategory(report.reportCategory)

  return (
    <Card
      className={cn(
        "rounded-md border-slate-200 shadow-sm",
        isPositive && "border-emerald-200 bg-emerald-50/40",
      )}
    >
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge
            variant="outline"
            className={cn(
              "rounded-md border-slate-300 bg-white",
              isPositive && "border-emerald-300 bg-white text-emerald-800",
            )}
          >
            {isPositive ? <ThumbsUp className="size-3" aria-hidden="true" /> : null}
            {report.reportCategory}
          </Badge>
          <span className="text-xs font-medium uppercase text-slate-500">
            {report.status === "approved" ? "Admin-approved" : report.status}
          </span>
        </div>
        <CardTitle className="text-lg text-slate-950">
          {isPositive ? "Positive contractor experience" : report.projectType}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">
            {isPositive ? "Moderated positive summary" : "Moderated summary"}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{report.publicSummary}</p>
        </div>
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Project</p>
            <p className="font-medium text-slate-900">
              {report.projectCity}, {report.projectState}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Payment</p>
            <p className="font-medium text-slate-900">{report.paymentStatus}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Reported unpaid</p>
            <p className="font-medium text-slate-900">
              {isPositive ? "None reported" : formatCurrency(report.amountUnpaid)}
            </p>
          </div>
        </div>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Resolution status</p>
            <p className="font-medium text-slate-900">{report.resolutionStatus ?? "Unresolved"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Evidence</p>
            <p className="inline-flex items-center gap-1 font-medium text-slate-900">
              <FileText className="size-4" aria-hidden="true" />
              {report.evidenceAttached ? "Evidence on file" : "No evidence summary"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}
