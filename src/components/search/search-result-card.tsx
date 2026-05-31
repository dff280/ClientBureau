import Link from "next/link"
import { ArrowRight, MapPin } from "lucide-react"

import { RiskBadge } from "@/components/client/risk-badge"
import { ScoreGauge } from "@/components/client/score-gauge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { ClientSearchResult } from "@/lib/types"

export function SearchResultCard({ result }: { result: ClientSearchResult }) {
  return (
    <Card className="rounded-md border-slate-200 shadow-sm">
      <CardContent className="grid gap-6 p-5 md:grid-cols-[170px_1fr_auto] md:items-center">
        <ScoreGauge score={result.clientBureauScore} className="md:max-w-40" />
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-950">
              {result.firstName} {result.lastName}
            </h2>
            <RiskBadge riskLevel={result.riskLevel} />
          </div>
          {result.businessName ? (
            <p className="font-medium text-slate-700">{result.businessName}</p>
          ) : null}
          <p className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="size-4" aria-hidden="true" />
            {result.city}, {result.state}
          </p>
          <p className="text-sm leading-6 text-slate-700">
            {result.latestSummary ?? "Approved profile with moderated contractor-submitted reports."}
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500">
            <span>{result.reportCount} approved reports</span>
            <span>{result.matchedBy}</span>
            <span>Relevance {result.matchScore}</span>
            {result.latestCategory ? <span>Latest: {result.latestCategory}</span> : null}
          </div>
        </div>
        <Button asChild variant="outline" className="md:self-center">
          <Link href={`/client/${result.publicSlug}`}>
            View profile
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
