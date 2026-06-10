import Link from "next/link"
import type React from "react"
import { ArrowRight, BadgeCheck, Eye, FileText, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { EntityProfileSearchResult } from "@/lib/types"

export function EntityProfileResultCard({ result }: { result: EntityProfileSearchResult }) {
  const tone =
    result.profileType === "client"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : result.profileType === "subcontractor"
        ? "border-blue-200 bg-blue-50 text-blue-800"
        : "border-emerald-200 bg-emerald-50 text-emerald-800"

  return (
    <Card className="rounded-md border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="grid gap-5 p-5 lg:grid-cols-[1fr_260px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${tone}`}>
                  {result.profileTypeLabel}
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase text-slate-500">
                  {result.claimedStatus === "claimed" ? "Claimed" : "Unclaimed"}
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-black text-slate-950">{result.displayName}</h2>
              <p className="mt-1 text-sm font-medium text-slate-600">
                {result.city}, {result.state} · {result.matchedBy}
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Indicator</p>
              <p className="mt-1 text-2xl font-black text-slate-950">{result.ratingScore}</p>
              <p className="text-xs font-semibold text-slate-500">{result.ratingBand}</p>
            </div>
          </div>

          <p className="max-w-3xl text-sm leading-6 text-slate-700">
            {result.latestSummary || "Approved public profile context is available. Private identifiers and raw evidence are not shown publicly."}
          </p>

          <div className="grid gap-2 sm:grid-cols-3">
            <Signal icon={<FileText className="size-4" aria-hidden="true" />} label={`${result.reportCount} public ${result.reportCount === 1 ? "report" : "reports"}`} />
            <Signal icon={<ShieldCheck className="size-4" aria-hidden="true" />} label={result.evidenceOnFile ? "Evidence on file" : "Evidence private"} />
            <Signal icon={<BadgeCheck className="size-4" aria-hidden="true" />} label={result.responseContext ?? "Response available"} />
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-md border border-slate-200 bg-slate-50 p-4">
          <div>
            <p className="text-sm font-semibold text-slate-950">Recommended next step</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{result.nextAction}</p>
          </div>
          <div className="grid gap-2">
            <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
              <Link href={result.profileHref}>
                <Eye aria-hidden="true" />
                View profile
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/submit-report?profileType=${result.profileType}&profileId=${result.id}`}>
                Report experience
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Signal({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
      <span className="text-amber-700">{icon}</span>
      {label}
    </div>
  )
}
