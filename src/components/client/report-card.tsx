import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  MessageSquareText,
  ShieldCheck,
  ThumbsUp,
} from "lucide-react"
import type { ComponentType, ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { cleanPublicReportText, reportResponseStatus } from "@/lib/client-rating"
import { reportConfidenceLabel, reportConfidenceScore } from "@/lib/trust-verification"
import { isPositiveReportCategory, type ClientReport } from "@/lib/types"

export function ReportCard({ report }: { report: ClientReport }) {
  const isPositive = isPositiveReportCategory(report.reportCategory)
  const confidenceLabel = reportConfidenceLabel(report)
  const confidenceScore = reportConfidenceScore(report)
  const responseStatus = report.responseStatus ?? reportResponseStatus(report)
  const resolutionStatus = report.resolutionStatus ?? (isPositive ? "No issue reported" : "Unresolved")
  const hasResolvedContext = ["Paid in full", "Settled", "Resolved", "Admin verified"].includes(resolutionStatus)
  const hasDisputeContext = report.status === "disputed" || responseStatus === "Disputed" || resolutionStatus === "Disputed"
  const statusTone = isPositive
    ? "emerald"
    : hasResolvedContext
      ? "blue"
      : hasDisputeContext
        ? "amber"
        : "rose"
  const timeline = report.timeline?.slice(0, 3) ?? []

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-md border-slate-200 bg-white shadow-sm",
        statusTone === "emerald" && "border-emerald-200",
        statusTone === "blue" && "border-sky-200",
        statusTone === "amber" && "border-amber-200",
        statusTone === "rose" && "border-rose-200",
      )}
    >
      <CardHeader
        className={cn(
          "gap-4 border-b p-5",
          statusTone === "emerald" && "border-emerald-100 bg-emerald-50/70",
          statusTone === "blue" && "border-sky-100 bg-sky-50/70",
          statusTone === "amber" && "border-amber-100 bg-amber-50/70",
          statusTone === "rose" && "border-rose-100 bg-rose-50/60",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <ReportStatusPill tone={statusTone}>
                {isPositive ? <ThumbsUp className="size-3" aria-hidden="true" /> : <AlertTriangle className="size-3" aria-hidden="true" />}
                {isPositive ? "Positive experience" : "Payment or project concern"}
              </ReportStatusPill>
              <ReportStatusPill tone="slate">{report.reportCategory}</ReportStatusPill>
              {hasDisputeContext ? <ReportStatusPill tone="amber">Dispute context</ReportStatusPill> : null}
              {hasResolvedContext ? <ReportStatusPill tone="blue">Resolution context</ReportStatusPill> : null}
              {report.evidenceAttached ? <ReportStatusPill tone="emerald">Evidence on file</ReportStatusPill> : null}
            </div>
            <CardTitle className="text-xl text-slate-950">
              {isPositive ? "Approved positive client experience" : report.projectType}
            </CardTitle>
            <p className="text-sm leading-6 text-slate-600">
              {report.projectCity}, {report.projectState} · {formatDate(report.approvedAt ?? report.createdAt)}
            </p>
          </div>
          <div className="rounded-md border border-white/80 bg-white/85 px-3 py-2 text-right shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">Review confidence</p>
            <p className="mt-1 text-lg font-semibold text-slate-950">{confidenceScore}/100</p>
            <p className="text-xs font-semibold text-slate-500">{confidenceLabel}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="size-4 text-amber-700" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase text-slate-500">
              {isPositive ? "Moderated positive summary" : "Moderated public summary"}
            </p>
          </div>
          <p className="mt-3 text-base leading-7 text-slate-800">{cleanPublicReportText(report.publicSummary)}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ReportDossierMetric icon={FileText} label="Project context" value={report.projectType} />
          <ReportDossierMetric icon={CircleDollarSign} label="Payment status" value={isPositive ? "No issue reported" : report.paymentStatus} />
          <ReportDossierMetric
            icon={CircleDollarSign}
            label={isPositive ? "Payment issue" : "Reported payment context"}
            value={isPositive ? "None reported" : formatCurrency(report.amountUnpaid)}
          />
          <ReportDossierMetric icon={CheckCircle2} label="Resolution" value={resolutionStatus} />
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
          <ReportEvidenceSummary report={report} confidenceLabel={confidenceLabel} />
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <MessageSquareText className="size-4 text-amber-700" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase text-slate-500">Response and dispute context</p>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-950">{responseStatus}</p>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              Clients can submit a response, correction, dispute, or resolution update for moderator review.
            </p>
          </div>
        </div>

        {timeline.length > 0 ? (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <CalendarClock className="size-4 text-amber-700" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase text-slate-500">Public timeline markers</p>
            </div>
            <div className="mt-3 grid gap-2">
              {timeline.map((event) => (
                <div key={event.id} className="rounded-md border border-slate-200 bg-white p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-slate-950">{event.title}</p>
                    <time className="text-xs font-semibold text-slate-500">{formatDate(event.createdAt)}</time>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{event.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">
          <p className="font-semibold">Careful-use note</p>
          <p className="mt-1">
            This is a moderated contractor-submitted experience summary. It is not a legal finding,
            credit score, background check, collection action, or guarantee.
          </p>
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

function ReportStatusPill({
  children,
  tone,
}: {
  children: ReactNode
  tone: "amber" | "blue" | "emerald" | "rose" | "slate"
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md bg-white",
        tone === "amber" && "border-amber-300 text-amber-900",
        tone === "blue" && "border-sky-300 text-sky-900",
        tone === "emerald" && "border-emerald-300 text-emerald-900",
        tone === "rose" && "border-rose-300 text-rose-900",
        tone === "slate" && "border-slate-300 text-slate-700",
      )}
    >
      {children}
    </Badge>
  )
}

function ReportDossierMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-amber-700" aria-hidden="true" />
        <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      </div>
      <p className="mt-2 text-sm font-semibold leading-5 text-slate-950">{value}</p>
    </div>
  )
}

function ReportEvidenceSummary({
  confidenceLabel,
  report,
}: {
  confidenceLabel: string
  report: ClientReport
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-4 text-amber-700" aria-hidden="true" />
        <p className="text-xs font-semibold uppercase text-slate-500">Evidence and moderation</p>
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-950">
        {report.evidenceAttached ? "Private evidence on file" : "No public evidence summary"}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-600">
        {confidenceLabel} confidence based on moderation status, private evidence indicators,
        response context, and resolution information. Raw files are not public.
      </p>
    </div>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}
