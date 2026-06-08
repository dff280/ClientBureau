import Link from "next/link"
import {
  Activity,
  ArrowRight,
  BarChart3,
  ClipboardCheck,
  ChevronDown,
  DollarSign,
  FileText,
  Lightbulb,
  Search,
  ShieldCheck,
  Signature,
  TrendingUp,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type {
  DashboardActivityFeedItem,
  DashboardBusinessInsight,
  DashboardKpi,
  DashboardKpiTone,
  DashboardReportSummary,
  DashboardTrendPoint,
  EnterpriseDashboardSummary,
} from "@/lib/enterprise-dashboard"

const toneClasses: Record<DashboardKpiTone, string> = {
  amber: "border-amber-200 bg-amber-50 text-amber-950",
  blue: "border-sky-200 bg-sky-50 text-sky-950",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-950",
  rose: "border-rose-200 bg-rose-50 text-rose-950",
  slate: "border-slate-200 bg-white text-slate-950",
}

const iconClasses: Record<DashboardKpiTone, string> = {
  amber: "bg-amber-500 text-slate-950",
  blue: "bg-sky-700 text-white",
  emerald: "bg-emerald-700 text-white",
  rose: "bg-rose-700 text-white",
  slate: "bg-slate-950 text-white",
}

const kpiIcons = {
  "agreement-status": Signature,
  "open-balance": DollarSign,
  "pipeline-value": BarChart3,
  "public-reviews": ClipboardCheck,
}

export function EnterpriseDashboardOverview({ summary }: { summary: EnterpriseDashboardSummary }) {
  return (
    <section className="space-y-5">
      <Card className="overflow-hidden rounded-md border-slate-200 bg-white shadow-sm">
        <CardContent className="grid gap-0 p-0 xl:grid-cols-[1fr_330px]">
          <div className="p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs font-semibold uppercase text-amber-700">Business snapshot</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950">
                  Risk, documents, payments, and activity in one view.
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  A finance-style operating dashboard for the work that protects the business:
                  search, contracts, reviews, evidence, recovery, and alerts.
                </p>
              </div>
              <Badge className="w-fit rounded-md bg-slate-950 text-white">
                {summary.periodLabel}
              </Badge>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {summary.kpis.map((kpi) => (
                <KpiCard key={kpi.id} kpi={kpi} />
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-950 p-5 text-white xl:border-l xl:border-t-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-amber-300">Business health</p>
                <p className="mt-2 text-5xl font-semibold">{summary.healthScore}</p>
              </div>
              <span className="flex size-11 items-center justify-center rounded-md bg-amber-500 text-slate-950">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </span>
            </div>
            <Progress value={summary.healthScore} className="mt-5" />
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Higher scores mean fewer unresolved balances, fewer unread alerts, stronger agreement
              coverage, and cleaner evidence readiness.
            </p>
          </div>
        </CardContent>
      </Card>

      <details className="group rounded-md border border-slate-200 bg-white shadow-sm">
        <summary className="flex cursor-pointer list-none flex-col justify-between gap-3 p-5 marker:hidden sm:flex-row sm:items-center">
          <span>
            <span className="text-xs font-semibold uppercase text-amber-700">Detailed insights</span>
            <span className="mt-1 block text-xl font-semibold tracking-normal text-slate-950">
              Trends, reports, and activity history
            </span>
            <span className="mt-1 block max-w-3xl text-sm leading-6 text-slate-600">
              Open this when you want deeper context. The dashboard stays focused on what needs action first.
            </span>
          </span>
          <span className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
            View details
            <ChevronDown className="size-4 transition group-open:rotate-180" aria-hidden="true" />
          </span>
        </summary>
        <div className="space-y-5 border-t border-slate-100 p-5">
          <div className="grid gap-5 xl:grid-cols-[1.12fr_0.88fr]">
            <TrendPanel trends={summary.trends} />
            <InsightPanel insights={summary.insights} />
          </div>

          <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <ReportCenter summaries={summary.reportSummaries} />
            <ActivityFeed items={summary.activityFeed} />
          </div>
        </div>
      </details>
    </section>
  )
}

function KpiCard({ kpi }: { kpi: DashboardKpi }) {
  const Icon = kpiIcons[kpi.id as keyof typeof kpiIcons] ?? TrendingUp

  return (
    <Link
      href={kpi.href}
      className={`block rounded-md border p-4 shadow-sm transition hover:-translate-y-0.5 ${toneClasses[kpi.tone]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase opacity-70">{kpi.label}</p>
          <p className="mt-2 truncate text-3xl font-semibold">{kpi.value}</p>
        </div>
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-md ${iconClasses[kpi.tone]}`}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 opacity-75">{kpi.helper}</p>
      <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold">
        {kpi.trend}
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </p>
    </Link>
  )
}

function TrendPanel({ trends }: { trends: DashboardTrendPoint[] }) {
  const maxActivity = Math.max(1, ...trends.map((point) => point.searches + point.reviews + point.agreements))
  const maxBalance = Math.max(1, ...trends.map((point) => point.balanceAtRisk))

  return (
    <Card className="rounded-md border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-xl">
          <TrendingUp className="size-5 text-amber-700" aria-hidden="true" />
          Trends
        </CardTitle>
        <p className="text-sm leading-6 text-slate-600">
          Six-month view of client checks, reports, agreements, and balance at risk.
        </p>
      </CardHeader>
      <CardContent className="grid gap-4 p-5">
        {trends.map((point) => {
          const activity = point.searches + point.reviews + point.agreements

          return (
            <div key={point.label} className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[70px_1fr_1fr] lg:items-center">
              <p className="text-sm font-semibold text-slate-950">{point.label}</p>
              <div>
                <div className="flex justify-between gap-3 text-xs font-semibold text-slate-500">
                  <span>Activity</span>
                  <span>{activity} actions</span>
                </div>
                <Progress value={(activity / maxActivity) * 100} className="mt-2" />
                <p className="mt-1 text-xs text-slate-500">
                  {point.searches} searches / {point.reviews} reports / {point.agreements} agreements
                </p>
              </div>
              <div>
                <div className="flex justify-between gap-3 text-xs font-semibold text-slate-500">
                  <span>Balance at risk</span>
                  <span>{formatCurrency(point.balanceAtRisk)}</span>
                </div>
                <Progress value={(point.balanceAtRisk / maxBalance) * 100} className="mt-2" />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function InsightPanel({ insights }: { insights: DashboardBusinessInsight[] }) {
  return (
    <Card className="rounded-md border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Lightbulb className="size-5 text-amber-700" aria-hidden="true" />
          Business insights
        </CardTitle>
        <p className="text-sm leading-6 text-slate-600">
          Plain-English recommendations based on your current workspace.
        </p>
      </CardHeader>
      <CardContent className="grid gap-3 p-5">
        {insights.map((insight) => (
          <Link
            key={insight.id}
            href={insight.href}
            className={`rounded-md border p-4 transition hover:-translate-y-0.5 ${toneClasses[insight.tone]}`}
          >
            <p className="font-semibold">{insight.title}</p>
            <p className="mt-2 text-sm leading-6 opacity-80">{insight.description}</p>
            <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold">
              {insight.actionLabel}
              <ArrowRight className="size-4" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}

function ReportCenter({ summaries }: { summaries: DashboardReportSummary[] }) {
  const icons = [ClipboardCheck, FileText, Activity, Search]

  return (
    <Card className="rounded-md border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-xl">
          <BarChart3 className="size-5 text-amber-700" aria-hidden="true" />
          Reports center
        </CardTitle>
        <p className="text-sm leading-6 text-slate-600">
          QuickBooks-style rollups for reports, documents, watchlists, and searches.
        </p>
      </CardHeader>
      <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
        {summaries.map((summary, index) => {
          const Icon = icons[index] ?? FileText

          return (
            <Link key={summary.id} href={summary.href} className="rounded-md border border-slate-200 bg-slate-50 p-4 transition hover:border-amber-300">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">{summary.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950">{summary.value}</p>
                </div>
                <span className="flex size-10 items-center justify-center rounded-md bg-slate-950 text-white">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{summary.helper}</p>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}

function ActivityFeed({ items }: { items: DashboardActivityFeedItem[] }) {
  return (
    <Card className="rounded-md border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Activity className="size-5 text-amber-700" aria-hidden="true" />
          Activity feed
        </CardTitle>
        <p className="text-sm leading-6 text-slate-600">
          The latest reports, agreements, recovery tasks, and workspace events.
        </p>
      </CardHeader>
      <CardContent className="grid gap-3 p-5">
        {items.map((item) => (
          <Link key={item.id} href={item.href} className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 transition hover:border-amber-300 sm:grid-cols-[1fr_auto] sm:items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-md bg-white">
                  {item.label}
                </Badge>
                <span className="text-xs font-semibold text-slate-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2 font-semibold text-slate-950">{item.title}</p>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{item.detail}</p>
            </div>
            <span className={`w-fit rounded-md border px-2 py-1 text-xs font-semibold capitalize ${toneClasses[item.tone]}`}>
              {item.tone}
            </span>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  })
}
