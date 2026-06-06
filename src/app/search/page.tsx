import type { Metadata } from "next"
import Link from "next/link"
import { FilePlus2, LockKeyhole, Radar, ShieldCheck } from "lucide-react"

import { SearchCommandCenter } from "@/components/search/search-command-center"
import { SearchResultCard } from "@/components/search/search-result-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getCurrentUser } from "@/lib/auth"
import { getContractorDashboardService, searchClientsService } from "@/lib/repositories/client-bureau-service"
import { toSearchPreviewProfile } from "@/lib/search-experience"
import { reportCategories, riskLevels, type ReportCategory, type RiskLevel } from "@/lib/types"

export const metadata: Metadata = {
  title: "Check a Client",
  description:
    "Search Client Bureau for moderated client profiles, contractor-submitted reports, private matching, and approved public summaries.",
  alternates: {
    canonical: "/search",
  },
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = "force-dynamic"

type SearchParams = Promise<{
  q?: string
  state?: string
  risk?: string
  category?: string
}>

function toRiskLevel(value?: string): RiskLevel | undefined {
  return riskLevels.includes(value as RiskLevel) ? (value as RiskLevel) : undefined
}

function toReportCategory(value?: string): ReportCategory | undefined {
  return reportCategories.includes(value as ReportCategory) ? (value as ReportCategory) : undefined
}

function reportPrefillHref(query: string, state?: string) {
  const params = new URLSearchParams()
  const tokens = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (tokens[0]) params.set("firstName", tokens[0])
  if (tokens[1]) params.set("lastName", tokens[1])
  if (state) params.set("state", state)

  return `/submit-report${params.size ? `?${params.toString()}` : ""}`
}

function signupSearchHref(query: string, state?: string, riskLevel?: RiskLevel, category?: ReportCategory) {
  const params = new URLSearchParams()
  const nextParams = new URLSearchParams()

  if (query.trim()) nextParams.set("q", query.trim())
  if (state) nextParams.set("state", state)
  if (riskLevel) nextParams.set("risk", riskLevel)
  if (category) nextParams.set("category", category)

  params.set("next", `/search${nextParams.size ? `?${nextParams.toString()}` : ""}`)
  if (query.trim()) params.set("q", query.trim())

  return `/signup?${params.toString()}`
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const query = params.q ?? ""
  const state = params.state?.trim().toUpperCase() || undefined
  const riskLevel = toRiskLevel(params.risk)
  const category = toReportCategory(params.category)
  const user = await getCurrentUser()
  const [results, previewResults, dashboard] = await Promise.all([
    searchClientsService(query, { state, riskLevel, category }),
    searchClientsService("", {}),
    user ? getContractorDashboardService(user.id).catch(() => undefined) : Promise.resolve(undefined),
  ])
  const previewProfiles = previewResults.slice(0, 100).map(toSearchPreviewProfile)
  const hasSearch = Boolean(query || state || riskLevel || category)
  const isAuthenticated = Boolean(user)

  return (
    <section className="bureau-section bg-slate-100">
      <div className="bureau-container space-y-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-end">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm">
              <LockKeyhole className="size-4 text-amber-600" aria-hidden="true" />
              {isAuthenticated ? "Contractor account active" : "Limited public preview"}
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
              Check a Client Before You Take the Job.
            </h1>
            <p className="max-w-3xl leading-7 text-slate-600">
              Type a name, business, city, phone, email, or job address to see predictive suggestions,
              reputation previews, saved searches, and public-safe client report context before you commit to the work.
            </p>
          </div>
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-amber-700" aria-hidden="true" />
                <p className="text-sm font-semibold uppercase text-slate-500">
                  {isAuthenticated ? "Private matching" : "Public preview"}
                </p>
              </div>
              <p className="text-sm leading-6 text-slate-600">
                {isAuthenticated
                  ? "Search can use phone and email as private matching signals. Results show only approved public summaries and non-sensitive identity fields."
                  : "Public previews show approved profile context. Create a free account to save the search and continue into the full client-check workflow."}
              </p>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                <Radar className="mb-2 size-4 text-amber-700" aria-hidden="true" />
                {isAuthenticated
                  ? "Add search findings to your watchlist from the dashboard before scheduling work."
                  : query
                    ? `Create a free account to view available report context for "${query}" and save this search.`
                    : "Search first. If there is no public match yet, create a private client file or submit a documented client experience."}
              </div>
              {!isAuthenticated ? (
                <Button asChild className="w-full bg-slate-950 text-white hover:bg-slate-800">
                  <Link href={signupSearchHref(query, state, riskLevel, category)}>Create free account</Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <SearchCommandCenter
          key={`${query}|${state ?? ""}|${riskLevel ?? ""}|${category ?? ""}`}
          query={query}
          state={state}
          riskLevel={riskLevel}
          category={category}
          profiles={previewProfiles}
          initialSavedSearches={dashboard?.savedSearches}
          isAuthenticated={isAuthenticated}
        />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-slate-500">Server-verified results</p>
            <p className="mt-1 text-sm font-medium text-slate-600">
              {results.length} {results.length === 1 ? "profile" : "profiles"} found from approved public records
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={reportPrefillHref(query, state)}>
              <FilePlus2 aria-hidden="true" />
              Report a Client Experience
            </Link>
          </Button>
        </div>

        {results.length > 0 ? (
          <div className="grid gap-4">
            {results.map((result) => (
              <SearchResultCard key={result.id} result={result} />
            ))}
          </div>
        ) : (
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="grid gap-5 p-8 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-md bg-amber-100 text-amber-800">
                <FilePlus2 className="size-6" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-slate-950">
                  {hasSearch ? "No public reports found yet." : "Start with a client search."}
                </h2>
                <p className="mx-auto max-w-2xl text-sm leading-6 text-slate-600">
                  No public reports may exist yet, especially in early markets. Create a private client file,
                  save this search, or submit a documented client experience for moderation.
                </p>
              </div>
              <div className="mx-auto flex flex-wrap justify-center gap-3">
                <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                  <Link href={signupSearchHref(query, state, riskLevel, category)}>Create free account</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={reportPrefillHref(query, state)}>Report a Client Experience</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}
