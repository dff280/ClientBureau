"use client"

import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  Clock3,
  Eye,
  FilePlus2,
  Filter,
  LockKeyhole,
  MapPin,
  Radar,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react"
import { useEffect, useMemo, useState, useTransition } from "react"

import { RiskBadge } from "@/components/client/risk-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  deleteSavedSearchAction,
  recordSearchEventAction,
  saveClientSearchAction,
} from "@/lib/actions/client-bureau"
import {
  buildSearchHref,
  buildSearchExperienceStats,
  buildSearchSuggestions,
  formatClientName,
  getPreviewSearchText,
  isPrivateIdentifierSearch,
  rankSearchPreviewProfiles,
  type SearchPreviewProfile,
} from "@/lib/search-experience"
import { usStates } from "@/lib/locations"
import {
  reportCategories,
  riskLevels,
  type ActionResult,
  type ReportCategory,
  type RiskLevel,
  type SavedClientSearch,
  type SearchAnalyticsEvent,
} from "@/lib/types"

interface InitialSavedSearch {
  id: string
  query: string
  city?: string
  state?: string
}

interface SavedSearchRecord extends InitialSavedSearch {
  riskLevel?: RiskLevel
  category?: ReportCategory
  resultCount?: number
  createdAt: string
}

interface SearchCommandCenterProps {
  query?: string
  state?: string
  riskLevel?: RiskLevel
  category?: ReportCategory
  profiles: SearchPreviewProfile[]
  initialSavedSearches?: InitialSavedSearch[]
  isAuthenticated?: boolean
}

const savedSearchStorageKey = "client-bureau.saved-searches"

function savedSearchKey(search: Pick<SavedSearchRecord, "query" | "state" | "riskLevel" | "category">) {
  return [
    search.query.trim().toLowerCase(),
    search.state?.trim().toUpperCase() ?? "",
    search.riskLevel ?? "",
    search.category ?? "",
  ].join("|")
}

function uniqueSavedSearches(searches: SavedSearchRecord[]) {
  const seen = new Set<string>()

  return searches.filter((search) => {
    const key = savedSearchKey(search)

    if (seen.has(key)) return false
    seen.add(key)

    return true
  })
}

const savedSearchInitialState: ActionResult<SavedClientSearch> = { ok: false, message: "" }
const deleteSavedSearchInitialState: ActionResult<boolean> = { ok: false, message: "" }
const searchEventInitialState: ActionResult<SearchAnalyticsEvent> = { ok: false, message: "" }

export function SearchCommandCenter({
  query,
  state,
  riskLevel,
  category,
  profiles,
  initialSavedSearches = [],
  isAuthenticated = false,
}: SearchCommandCenterProps) {
  const [liveQuery, setLiveQuery] = useState(query ?? "")
  const [stateValue, setStateValue] = useState(state ?? "")
  const [riskValue, setRiskValue] = useState<RiskLevel | "">(riskLevel ?? "")
  const [categoryValue, setCategoryValue] = useState<ReportCategory | "">(category ?? "")
  const initialSavedRecords = useMemo(
    () =>
      initialSavedSearches.map((item) => ({
        ...item,
        createdAt: new Date().toISOString(),
      })),
    [initialSavedSearches],
  )
  const [savedSearches, setSavedSearches] = useState<SavedSearchRecord[]>(() =>
    uniqueSavedSearches(initialSavedRecords).slice(0, 8),
  )
  const [savedMessage, setSavedMessage] = useState("")
  const [isSavingSearch, startSaveSearchTransition] = useTransition()
  const [, startEventTransition] = useTransition()

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const stored = window.localStorage.getItem(savedSearchStorageKey)
        const parsed = stored ? (JSON.parse(stored) as SavedSearchRecord[]) : []

        setSavedSearches(uniqueSavedSearches([...parsed, ...initialSavedRecords]).slice(0, 8))
      } catch {
        setSavedSearches(uniqueSavedSearches(initialSavedRecords).slice(0, 8))
      }
    })
  }, [initialSavedRecords])

  const stats = useMemo(() => buildSearchExperienceStats(profiles), [profiles])
  const privateIdentifierIntent = isPrivateIdentifierSearch(liveQuery)
  const stateFilter = stateValue.trim().toUpperCase()
  const riskFilter = riskValue || undefined
  const categoryFilter = categoryValue || undefined

  const filteredProfiles = useMemo(() => {
    return rankSearchPreviewProfiles(profiles, liveQuery)
      .filter((profile) => {
        const matchesState = !stateFilter || profile.state === stateFilter
        const matchesRisk = !riskFilter || profile.riskLevel === riskFilter
        const matchesCategory = !categoryFilter || profile.latestCategory === categoryFilter

        return matchesState && matchesRisk && matchesCategory
      })
  }, [categoryFilter, liveQuery, profiles, riskFilter, stateFilter])

  const instantProfiles = useMemo(() => {
    if (privateIdentifierIntent) return filteredProfiles.slice(0, 3)

    const value = liveQuery.trim().toLowerCase()
    const matches = value
      ? filteredProfiles.filter((profile) => getPreviewSearchText(profile).includes(value))
      : filteredProfiles

    return matches.slice(0, 4)
  }, [filteredProfiles, liveQuery, privateIdentifierIntent])

  const suggestions = useMemo(
    () => buildSearchSuggestions(profiles, liveQuery, stateFilter || undefined),
    [liveQuery, profiles, stateFilter],
  )

  function buildSearchEventFormData(
    eventType: "search_submitted" | "suggestion_clicked" | "result_viewed" | "save_search" | "private_identifier_check" | "no_result",
    resultCount = filteredProfiles.length,
  ) {
    const formData = new FormData()
    if (liveQuery.trim()) formData.set("query", liveQuery.trim())
    if (stateFilter) formData.set("state", stateFilter)
    if (riskFilter) formData.set("riskLevel", riskFilter)
    if (categoryFilter) formData.set("category", categoryFilter)
    formData.set("resultCount", String(resultCount))
    formData.set("eventType", eventType)
    formData.set("source", "search_page")

    return formData
  }

  function trackSearchEvent(
    eventType: "search_submitted" | "suggestion_clicked" | "result_viewed" | "save_search" | "private_identifier_check" | "no_result",
    resultCount = filteredProfiles.length,
  ) {
    startEventTransition(() => {
      void recordSearchEventAction(searchEventInitialState, buildSearchEventFormData(eventType, resultCount)).catch(() => undefined)
    })
  }

  function handleSaveSearch() {
    const nextSearch: SavedSearchRecord = {
      id: `saved_${Date.now()}`,
      query: liveQuery.trim() || "All public profiles",
      state: stateFilter || undefined,
      riskLevel: riskFilter,
      category: categoryFilter,
      resultCount: filteredProfiles.length,
      createdAt: new Date().toISOString(),
    }

    const next = uniqueSavedSearches([nextSearch, ...savedSearches]).slice(0, 8)

    setSavedSearches(next)
    setSavedMessage("Search saved.")

    try {
      window.localStorage.setItem(savedSearchStorageKey, JSON.stringify(next))
    } catch {
      setSavedMessage("Search saved for this session.")
    }

    if (!isAuthenticated) return

    const formData = new FormData()
    formData.set("searchId", nextSearch.id)
    formData.set("query", nextSearch.query)
    if (nextSearch.state) formData.set("state", nextSearch.state)
    if (nextSearch.riskLevel) formData.set("riskLevel", nextSearch.riskLevel)
    if (nextSearch.category) formData.set("category", nextSearch.category)
    formData.set("resultCount", String(nextSearch.resultCount ?? 0))

    startSaveSearchTransition(() => {
      void (async () => {
        try {
          const result = await saveClientSearchAction(savedSearchInitialState, formData)
          trackSearchEvent("save_search", nextSearch.resultCount ?? 0)

          if (!result.ok) {
            setSavedMessage("Search saved in this browser.")
            return
          }

          const serverSearch: SavedSearchRecord = {
            id: result.data.id,
            query: result.data.query,
            city: result.data.city,
            state: result.data.state,
            riskLevel: result.data.riskLevel,
            category: result.data.category,
            resultCount: result.data.resultCount,
            createdAt: result.data.createdAt,
          }
          const updated = uniqueSavedSearches([serverSearch, ...next]).slice(0, 8)
          setSavedSearches(updated)
          setSavedMessage(result.message)

          try {
            window.localStorage.setItem(savedSearchStorageKey, JSON.stringify(updated))
          } catch {
            // Local persistence can be blocked; the server action already completed.
          }
        } catch {
          setSavedMessage("Search saved in this browser.")
        }
      })()
    })
  }

  function handleRemoveSavedSearch(id: string) {
    const next = savedSearches.filter((search) => search.id !== id)

    setSavedSearches(next)
    try {
      window.localStorage.setItem(savedSearchStorageKey, JSON.stringify(next))
    } catch {
      // Browser storage can be disabled; the in-memory list still updates.
    }

    if (!isAuthenticated) return

    const formData = new FormData()
    formData.set("searchId", id)
    startSaveSearchTransition(() => {
      void deleteSavedSearchAction(deleteSavedSearchInitialState, formData).catch(() => undefined)
    })
  }

  const currentHref = buildSearchHref({
    query: liveQuery,
    state: stateValue,
    riskLevel: riskFilter,
    category: categoryFilter,
  })

  return (
    <div className="grid gap-5">
      <Card className="overflow-hidden rounded-md border-slate-200 bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="grid gap-0 xl:grid-cols-[1fr_360px]">
            <div className="space-y-5 p-4 sm:p-5 lg:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-md border-amber-200 bg-amber-50 text-amber-900">
                  <Sparkles className="size-3" aria-hidden="true" />
                  Predictive search
                </Badge>
                <Badge variant="outline" className="rounded-md border-slate-200 bg-slate-50 text-slate-700">
                  <LockKeyhole className="size-3" aria-hidden="true" />
                  Private identifier matching
                </Badge>
              </div>

              <form
                action="/search"
                className="grid gap-3"
                onSubmit={() => trackSearchEvent(privateIdentifierIntent ? "private_identifier_check" : filteredProfiles.length > 0 ? "search_submitted" : "no_result")}
              >
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    name="q"
                    value={liveQuery}
                    onChange={(event) => {
                      setLiveQuery(event.target.value)
                      setSavedMessage("")
                    }}
                    placeholder="Search a client by name, business, city, phone, or email"
                    className="h-14 rounded-md border-slate-300 pl-12 text-base shadow-sm"
                    aria-label="Search clients"
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-[120px_1fr_1fr_auto]">
                  <select
                    name="state"
                    value={stateValue}
                    onChange={(event) => setStateValue(event.target.value.toUpperCase())}
                    className="h-11 rounded-md border border-input bg-background px-3 text-sm text-slate-700 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    aria-label="Filter by state"
                  >
                    <option value="">All states</option>
                    {usStates.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.code}
                      </option>
                    ))}
                  </select>
                  <select
                    name="risk"
                    value={riskValue}
                    onChange={(event) => setRiskValue(event.target.value as RiskLevel | "")}
                    className="h-11 rounded-md border border-input bg-background px-3 text-sm text-slate-700 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    aria-label="Filter by risk level"
                  >
                    <option value="">All risk levels</option>
                    {riskLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                  <select
                    name="category"
                    value={categoryValue}
                    onChange={(event) => setCategoryValue(event.target.value as ReportCategory | "")}
                    className="h-11 rounded-md border border-input bg-background px-3 text-sm text-slate-700 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    aria-label="Filter by report category"
                  >
                    <option value="">All report types</option>
                    {reportCategories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <Button className="h-11 bg-slate-950 px-6 text-white hover:bg-slate-800" type="submit">
                    Check
                    <ArrowRight aria-hidden="true" />
                  </Button>
                </div>
              </form>

              <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">Reputation previews</p>
                      <h2 className="mt-1 text-lg font-semibold text-slate-950">Fast matches while you type</h2>
                    </div>
                    <Badge variant="outline" className="rounded-md bg-white text-slate-600">
                      {instantProfiles.length} shown
                    </Badge>
                  </div>

                  {privateIdentifierIntent ? (
                    <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-950">
                      Phone and email checks require a secure account workflow. Public previews never reveal
                      private identifiers.
                    </div>
                  ) : null}

                  <div className="mt-4 grid gap-3">
                    {instantProfiles.map((profile) => (
                      <Link
                        key={profile.id}
                        href={`/client/${profile.publicSlug}`}
                        onClick={() => trackSearchEvent("result_viewed", instantProfiles.length)}
                        className="group rounded-md border border-slate-200 bg-white p-4 shadow-sm transition hover:border-amber-300 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-slate-950">{formatClientName(profile)}</h3>
                              <RiskBadge riskLevel={profile.riskLevel} />
                            </div>
                            {profile.businessName ? (
                              <p className="mt-1 truncate text-sm font-medium text-slate-700">
                                {profile.businessName}
                              </p>
                            ) : null}
                            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                              <MapPin className="size-3.5" aria-hidden="true" />
                              {profile.city}, {profile.state}
                            </p>
                          </div>
                          <div className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-center">
                            <p className="text-xl font-semibold text-slate-950">{profile.clientBureauScore}</p>
                            <p className="text-[11px] font-semibold uppercase text-slate-500">score</p>
                          </div>
                        </div>
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                          {profile.latestSummary ?? "Approved public profile with moderated contractor-submitted reports."}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                          <span>{profile.reportCount} approved signals</span>
                          {profile.positiveSignalCount ? <span>{profile.positiveSignalCount} positive</span> : null}
                          {profile.openDisputeCount ? <span>{profile.openDisputeCount} open dispute</span> : null}
                          {profile.evidenceOnFile ? <span>Evidence on file</span> : null}
                          {profile.latestCategory ? <span>{profile.latestCategory}</span> : null}
                          <span className="text-amber-700 group-hover:text-amber-800">Open profile</span>
                        </div>
                      </Link>
                    ))}

                    {instantProfiles.length === 0 ? (
                      <div className="rounded-md border border-dashed border-slate-300 bg-white p-4 text-sm leading-6 text-slate-600">
                        No public previews match yet. Create a free account to save this search, create a
                        private client file, or report a documented client experience for moderation.
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-md border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <Radar className="size-4 text-amber-700" aria-hidden="true" />
                    <h2 className="font-semibold text-slate-950">Search suggestions</h2>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Start with a name, then narrow by city, state, report type, or risk level.
                  </p>

                  <div className="mt-4 grid gap-2">
                    {privateIdentifierIntent ? (
                      <Link
                        href={currentHref}
                        className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-950 transition hover:border-amber-300"
                      >
                        Run private identifier check
                        <span className="mt-1 block text-xs font-normal leading-5 text-amber-900">
                          Search securely by phone or email without displaying either publicly.
                        </span>
                      </Link>
                    ) : null}

                    {suggestions.map((suggestion) => (
                      <Link
                        key={suggestion.id}
                        href={suggestion.href}
                        onClick={() => trackSearchEvent("suggestion_clicked")}
                        className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm transition hover:border-amber-300 hover:bg-white"
                      >
                        <span className="font-semibold text-slate-950">{suggestion.label}</span>
                        <span className="mt-1 block text-xs text-slate-500">{suggestion.description}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <aside className="border-t border-slate-200 bg-slate-950 p-4 text-white sm:p-5 lg:p-6 xl:border-l xl:border-t-0">
              <div className="flex items-center gap-2 text-amber-300">
                <BarChart3 className="size-5" aria-hidden="true" />
                <p className="text-sm font-semibold uppercase">Search intelligence</p>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-md border border-white/10 bg-white/5 p-3">
                  <p className="text-2xl font-semibold">{stats.publicProfiles}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">public profiles</p>
                </div>
                <div className="rounded-md border border-white/10 bg-white/5 p-3">
                  <p className="text-2xl font-semibold">{stats.approvedReportSignals}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">approved signals</p>
                </div>
                <div className="rounded-md border border-white/10 bg-white/5 p-3">
                  <p className="text-2xl font-semibold">{stats.highAttentionProfiles}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">attention profiles</p>
                </div>
                <div className="rounded-md border border-white/10 bg-white/5 p-3">
                  <p className="text-2xl font-semibold">{stats.averageScore}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">average score</p>
                </div>
              </div>

              <div className="mt-5 rounded-md border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2">
                  <Save className="size-4 text-amber-300" aria-hidden="true" />
                  <h2 className="font-semibold">Saved searches</h2>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Save searches you run often, then use the watchlist for alerts when a profile changes.
                </p>
                {isAuthenticated ? (
                  <Button
                    type="button"
                    onClick={handleSaveSearch}
                    disabled={isSavingSearch}
                    className="mt-4 w-full bg-amber-500 text-slate-950 hover:bg-amber-400"
                  >
                    <Save aria-hidden="true" />
                    {isSavingSearch ? "Saving search..." : "Save current search"}
                  </Button>
                ) : (
                  <Button asChild className="mt-4 w-full bg-amber-500 text-slate-950 hover:bg-amber-400">
                    <Link href={`/signup?next=${encodeURIComponent(currentHref)}`}>
                      <LockKeyhole aria-hidden="true" />
                      Create account to save
                    </Link>
                  </Button>
                )}
                {savedMessage ? <p className="mt-2 text-xs font-medium text-amber-200">{savedMessage}</p> : null}

                <div className="mt-4 grid gap-2">
                  {savedSearches.slice(0, 4).map((search) => (
                    <div key={search.id} className="flex items-center gap-2 rounded-md bg-white/10 p-2">
                      <Link
                        href={buildSearchHref({
                          query: search.query === "All public profiles" ? "" : search.query,
                          state: search.state,
                          riskLevel: search.riskLevel,
                          category: search.category,
                        })}
                        className="min-w-0 flex-1 text-sm"
                      >
                        <span className="block truncate font-semibold">{search.query}</span>
                        <span className="block truncate text-xs text-slate-300">
                          {[search.city, search.state, search.riskLevel, search.category].filter(Boolean).join(" / ") ||
                            "All filters"}
                        </span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleRemoveSavedSearch(search.id)}
                        className="rounded-md p-1 text-slate-300 transition hover:bg-white/10 hover:text-white"
                        aria-label={`Remove saved search ${search.query}`}
                      >
                        <X className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                  {savedSearches.length === 0 ? (
                    <p className="rounded-md border border-dashed border-white/20 p-3 text-sm leading-6 text-slate-300">
                      Saved searches appear here after you save one.
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 grid gap-3 text-sm leading-6 text-slate-300">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-1 size-4 shrink-0 text-amber-300" aria-hidden="true" />
                  <span>Only admin-approved public profile information appears in results.</span>
                </div>
                <div className="flex gap-3">
                  <Bell className="mt-1 size-4 shrink-0 text-amber-300" aria-hidden="true" />
                  <span>Use watchlists to monitor profiles before you schedule, contract, or collect deposits.</span>
                </div>
              </div>
            </aside>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        <Link
          href="/clients"
          className="rounded-md border border-slate-200 bg-white p-4 shadow-sm transition hover:border-amber-300"
        >
          <Building2 className="size-5 text-amber-700" aria-hidden="true" />
          <h2 className="mt-3 font-semibold text-slate-950">Browse client directory</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Explore approved profiles by state and city.</p>
        </Link>
        <Link
          href="/reports/recent"
          className="rounded-md border border-slate-200 bg-white p-4 shadow-sm transition hover:border-amber-300"
        >
          <Clock3 className="size-5 text-amber-700" aria-hidden="true" />
          <h2 className="mt-3 font-semibold text-slate-950">Recent public reports</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Review newly published moderated summaries.</p>
        </Link>
        <Link
          href="/dashboard/watchlist"
          className="rounded-md border border-slate-200 bg-white p-4 shadow-sm transition hover:border-amber-300"
        >
          <Eye className="size-5 text-amber-700" aria-hidden="true" />
          <h2 className="mt-3 font-semibold text-slate-950">Watchlist and alerts</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Track client profiles you may work with again.</p>
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <Filter className="mt-1 size-5 text-amber-700" aria-hidden="true" />
          <div>
            <p className="font-semibold text-slate-950">Need to document a new experience?</p>
            <p className="text-sm leading-6 text-slate-600">
              If search does not find an approved profile, submit a documented client experience for moderation.
            </p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/submit-report">
            <FilePlus2 aria-hidden="true" />
            Report a Client Experience
          </Link>
        </Button>
      </div>
    </div>
  )
}
