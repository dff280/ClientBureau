import Link from "next/link"
import { ArrowRight, MapPin, ShieldCheck } from "lucide-react"

import { RiskBadge } from "@/components/client/risk-badge"
import { ScoreGauge } from "@/components/client/score-gauge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { ClientSearchResult } from "@/lib/types"

export function SearchResultCard({ result }: { result: ClientSearchResult }) {
  return (
    <Card className="overflow-hidden rounded-md border-slate-200 bg-white shadow-sm transition hover:border-amber-300 hover:shadow-md">
      <CardContent className="grid gap-6 p-5 lg:grid-cols-[190px_1fr_180px] lg:items-center">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <ScoreGauge score={result.clientBureauScore} label="Reputation Score" />
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
            {result.latestSummary ?? "Approved profile with moderated contractor-submitted reviews."}
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500">
            <span>{result.reportCount} approved reputation signals</span>
            <span>{result.matchedBy}</span>
            <span>Relevance {result.matchScore}</span>
            {result.latestCategory ? <span>Latest: {result.latestCategory}</span> : null}
          </div>
        </div>
        <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">Next step</p>
          <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
            <Link href={`/client/${result.publicSlug}`}>
              View profile
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <p className="text-xs leading-5 text-slate-500">
            Public pages show approved summaries only. Private identifiers and evidence files stay hidden.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
