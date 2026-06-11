import Link from "next/link"
import type React from "react"
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Eye,
  FileText,
  MapPin,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { EntityProfileSearchResult } from "@/lib/types"

export function EntityProfileResultCard({ result }: { result: EntityProfileSearchResult }) {
  const tone = profileTypeTone(result.profileType)
  const scoreTone = result.ratingScore >= 80 ? "text-emerald-700" : result.ratingScore >= 65 ? "text-amber-700" : "text-rose-700"
  const submitHref = `/submit-report?profileType=${result.profileType}&profileSubtype=${encodeURIComponent(String(result.profileSubtype ?? ""))}&profileSlug=${encodeURIComponent(result.slug)}&city=${encodeURIComponent(result.city)}&state=${encodeURIComponent(result.state)}`
  const claimHref = `/claim-profile?profileSlug=${encodeURIComponent(result.slug)}&profileType=${encodeURIComponent(result.profileType)}`
  const watchHref = `/dashboard/watchlist?profileSlug=${encodeURIComponent(result.slug)}`

  return (
    <Card className="overflow-hidden rounded-md border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg hover:shadow-slate-950/10">
      <CardContent className="p-0">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_286px]">
          <div className="space-y-5 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-md border px-3 py-1 text-xs font-semibold uppercase ${tone}`}>
                    {result.profileTypeLabel}
                  </span>
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase text-slate-600">
                    {formatSubtype(result.profileSubtype)}
                  </span>
                  <span className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase text-emerald-800">
                    <ShieldCheck className="mr-1 inline size-3" aria-hidden="true" />
                    Approved public profile
                  </span>
                </div>

                <h2 className="mt-3 text-2xl font-semibold tracking-normal text-slate-950">{result.displayName}</h2>
                {result.businessName ? (
                  <p className="mt-1 text-sm font-semibold text-slate-700">{result.businessName}</p>
                ) : null}
                <p className="mt-2 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-600">
                  <MapPin className="size-4 text-amber-700" aria-hidden="true" />
                  <span>
                    {result.city}, {result.state}
                  </span>
                  <span className="text-slate-300">/</span>
                  <span>{result.matchedBy}</span>
                </p>
              </div>

              <div className="grid min-w-32 rounded-md border border-slate-200 bg-slate-50 p-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Rating</p>
                <p className={`mt-1 text-3xl font-semibold ${scoreTone}`}>{result.ratingScore}</p>
                <p className="text-xs font-semibold text-slate-600">{String(result.ratingBand)}</p>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-amber-700">Why this matters</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {result.latestSummary ||
                  "Approved public profile context is available. Private identifiers and raw evidence are not shown publicly."}
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <Signal
                icon={<FileText className="size-4" aria-hidden="true" />}
                label={`${result.reportCount} public ${result.reportCount === 1 ? "report" : "reports"}`}
              />
              <Signal
                icon={<BadgeCheck className="size-4" aria-hidden="true" />}
                label={`${result.positiveReportCount} positive`}
              />
              <Signal
                icon={<MessageSquareText className="size-4" aria-hidden="true" />}
                label={result.responseContext ?? "Response available"}
              />
              <Signal
                icon={<ShieldCheck className="size-4" aria-hidden="true" />}
                label={result.evidenceOnFile ? "Evidence on file" : "Evidence private"}
              />
            </div>
          </div>

          <aside className="flex flex-col justify-between gap-5 border-t border-slate-200 bg-slate-50 p-5 lg:border-l lg:border-t-0">
            <div>
              <p className="text-xs font-semibold uppercase text-amber-700">Recommended next step</p>
              <h3 className="mt-2 font-semibold text-slate-950">{result.nextAction}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Open the profile first, then decide whether to watch it, report your own documented experience, or request a correction path.
              </p>
            </div>

            <div className="grid gap-2">
              <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                <Link href={result.profileHref}>
                  <Eye aria-hidden="true" />
                  View profile
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={watchHref}>
                  <Bell aria-hidden="true" />
                  Watch profile
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={submitHref}>Report experience</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href={claimHref}>Claim or correct profile</Link>
              </Button>
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-600">
              Public search results show approved, moderated context only. Raw emails, phone numbers, addresses,
              evidence files, pending content, and internal notes stay private.
            </div>
          </aside>
        </div>
      </CardContent>
    </Card>
  )
}

function profileTypeTone(profileType: EntityProfileSearchResult["profileType"]) {
  if (profileType === "client") return "border-amber-200 bg-amber-50 text-amber-800"
  if (profileType === "subcontractor") return "border-blue-200 bg-blue-50 text-blue-800"

  return "border-emerald-200 bg-emerald-50 text-emerald-800"
}

function formatSubtype(value: EntityProfileSearchResult["profileSubtype"]) {
  if (!value) return "General profile"

  return String(value).replaceAll("_", " ")
}

function Signal({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex min-h-14 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
      <span className="text-amber-700">{icon}</span>
      <span>{label}</span>
    </div>
  )
}
