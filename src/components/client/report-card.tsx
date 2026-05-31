import { FileText } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ClientReport } from "@/lib/types"

export function ReportCard({ report }: { report: ClientReport }) {
  return (
    <Card className="rounded-md border-slate-200 shadow-sm">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant="outline" className="rounded-md border-slate-300 bg-white">
            {report.reportCategory}
          </Badge>
          <span className="text-xs font-medium uppercase text-slate-500">{report.status}</span>
        </div>
        <CardTitle className="text-lg text-slate-950">{report.projectType}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-slate-700">{report.publicSummary}</p>
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
            <p className="text-xs font-semibold uppercase text-slate-500">Evidence</p>
            <p className="inline-flex items-center gap-1 font-medium text-slate-900">
              <FileText className="size-4" aria-hidden="true" />
              {report.evidenceAttached ? "Attached" : "Not attached"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
