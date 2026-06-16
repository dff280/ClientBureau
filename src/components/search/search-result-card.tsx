import Link from "next/link"
import {
  ArrowRight,
  Bell,
  FileCheck2,
  FilePlus2,
  MapPin,
  MessageSquareWarning,
  ShieldCheck,
  Star,
  type LucideIcon,
} from "lucide-react"

import { RiskBadge } from "@/components/client/risk-badge"
import { ScoreGauge } from "@/components/client/score-gauge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { clientProfilePrimarySignals } from "@/lib/client-database"
import { cleanPublicReportText, clientRatingBand } from "@/lib/client-rating"
import type { ClientSearchResult } from "@/lib/types"

export function SearchResultCard({ result }: { result: ClientSearchResult }) {
  const paymentLabel = result.paymentContextLabel ?? "Payment context reviewed"
  const ratingBand = clientRatingBand(result.clientBureauScore, result.reportCount)
  const primarySignals = clientProfilePrimarySignals(result)
  const reportHref = `/submit-report?${new URLSearchParams({
    firstName: result.firstName,
    lastName: result.lastName,
    city: result.city,
    state: result.state,
    businessName: result.businessName ?? "",
  }).toString()}`

  return (
    <Card className="overflow-hidden rounded-md border-slate-200 bg-white shadow-sm transition hover:border-amber-300 hover:shadow-md">
      <CardContent className="grid gap-6 p-5 lg:grid-cols-[190px_1fr_210px] lg:items-center">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <ScoreGauge score={result.clientBureauScore} label="Client Bureau Rating" />
          <p className="mt-2 text-sm font-semibold text-slate-700">{ratingBand}</p>
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-950">
              {result.firstName} {result.lastName}
            </h2>
            <RiskBadge riskLevel={result.riskLevel} />
            <Badge variant="outline" className="rounded-md border-emerald-200 bg-emerald-50 text-emerald-800">
              <ShieldCheck className="size-3" aria-hidden="true" />
              Public record
            </Badge>
          </div>
          {result.businessName ? (
            <p className="font-medium text-slate-700">{result.businessName}</p>
          ) : null}
          <p className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="size-4" aria-hidden="true" />
            {result.city}, {result.state}
          </p>
          <p className="text-sm leading-6 text-slate-700">
            {cleanPublicReportText(result.latestSummary) || "Approved profile with moderated contractor-submitted reports."}
          </p>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
            <span className="font-semibold text-slate-950">Why this result appears:</span> {result.matchedBy}.
            Review the profile before scheduling work, ordering materials, sending contract terms, or extending credit.
          </div>
          <div className="grid gap-2 text-xs font-medium text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
            <SearchFact icon={ShieldCheck} label={`${result.reportCount} approved signals`} />
            <SearchFact icon={FileCheck2} label={primarySignals.evidenceLabel} />
            <SearchFact icon={MessageSquareWarning} label={`${result.openDisputeCount ?? 0} open disputes`} />
            <SearchFact icon={Star} label={`${result.positiveSignalCount ?? 0} positive signals`} />
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500">
            <span>{result.matchedBy}</span>
            <span>{paymentLabel}</span>
            {result.latestCategory ? <span>Latest: {result.latestCategory}</span> : null}
          </div>
        </div>
        <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">Next step</p>
          <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
            <Link href={`/client/${result.publicSlug}`}>
              View Client Profile
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/dashboard/watchlist?clientSlug=${encodeURIComponent(result.publicSlug)}`}>
              <Bell aria-hidden="true" />
              Watch client
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={reportHref}>
              <FilePlus2 aria-hidden="true" />
              Report experience
            </Link>
          </Button>
          <p className="text-xs leading-5 text-slate-500">
            Client Database pages show approved summaries only. Private identifiers and evidence files stay hidden.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function SearchFact({
  icon: Icon,
  label,
}: {
  icon: LucideIcon
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2">
      <Icon className="size-3.5 text-amber-700" aria-hidden="true" />
      {label}
    </span>
  )
}
