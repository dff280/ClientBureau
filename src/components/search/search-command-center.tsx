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
import { useEffect, useMemo, useState } from "react"

import { RiskBadge } from "@/components/client/risk-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  buildSearchExperienceStats,
  formatClientName,
  getPreviewSearchText,
  type SearchPreviewProfile,
} from "@/lib/search-experience"
import { reportCategories, riskLevels, type ReportCategory, type RiskLevel } from "@/lib/types"

interface InitialSavedSearch {
  id: string
  query: string
  city?: string
  state?: string
}

interface SavedSearchRecord extends InitialSavedSearch {
  riskLevel?: RiskLevel
  category?: ReportCategory
  createdAt: string
}

interface SearchCommandCenterProps {
  query?: string
  state?: string
  riskLevel?: RiskLevel
  category?: ReportCategory
  profiles: SearchPreviewProfile[]
  initialSavedSearches?: InitialSavedSearch[]
}

const savedSearchStorageKey = "client-bureau.saved-searches"

function normalize(value?: string) {
  return value?.trim().toLowerCase() ?? ""
}

function isPrivateIdentifierIntent(value: string) {
  const digits = value.replace(/\D/g, "")

  return value.includes("@") || digits.length >= 7
}

function buildSearchHref({
  query,
  state,
  riskLevel,
  category,
}: {
  query?: string
  state?: string
  riskLevel?: RiskLevel
  category?: ReportCategory
}) {
  const params = new URLSearchParams()

  if (query?.trim()) params.set("q", query.trim())
  if (state?.trim()) params.set("state", state.trim().toUpperCase())
  if (riskLevel) params.set("risk", riskLevel)
  if (category) params.set("category", category)

  return `/search${params.size ? `?${params.toString()}` : ""}`
}

function savedSearchKey(search: Pick<SavedSearchRecord, "query" | "state" | "riskLevel" | "category">) {
  return [
    search.query.trim().toLowerCase(),
    search.state?.trim().toUpperCase() ?? "",
    search.riskLevel ?? "",
    search.category ?? "",
  ].join("|")
}

function profilePreviewScore(profile: SearchPreviewProfile, query: string) {
  const value = normalize(query)
  const fullName = normalize(formatClientName(profile))
  const businessName = normalize(profile.businessName)
  const cityState = normalize(`${profile.city} ${profile.state}`)
  const latestCategory = normalize(profile.latestCategory)
  const text = getPreviewSearchText(profile)

  if (!value) return profile.reportCount * 5 + profile.clientBureauScore

  return (
    (fullName.startsWith(value) ? 80 : 0) +
    (fullName.includes(value) ? 45 : 0) +
    (businessName.includes(value) ? 35 : 0) +
    (cityState.includes(value) ? 20 : 0) +
    (latestCategory.includes(value) ? 16 : 0) +
    (text.includes(value) ? 10 : 0) +
    profile.reportCount * 4 +
    profile.matchScore
  )
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

export function SearchCommandCenter({
  query,
  state,
  riskLevel,
  category,
  profiles,
  initialSavedSearches = [],
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
  const privateIdentifierIntent = isPrivateIdentifierIntent(liveQuery)
  const stateFilter = stateValue.trim().toUpperCase()
  const riskFilter = riskValue || undefined
  const categoryFilter = categoryValue || undefined

  const filteredProfiles = useMemo(() => {
    return profiles
      .filter((profile) => {
        const matchesState = !stateFilter || profile.state === stateFilter
        const matchesRisk = !riskFilter || profile.riskLevel === riskFilter
        const matchesCategory = !categoryFilter || profile.latestCategory === categoryFilter

        return matchesState && matchesRisk && matchesCategory
      })
      .sort((a, b) => profilePreviewScore(b, liveQuery) - profilePreviewScore(a, liveQuery))
  }, [categoryFilter, liveQuery, profiles, riskFilter, stateFilter])

  const instantProfiles = useMemo(() => {
    if (privateIdentifierIntent) return filteredProfiles.slice(0, 3)

    const value = normalize(liveQuery)
    const matches = value
      ? filteredProfiles.filter((profile) => getPreviewSearchText(profile).includes(value))
      : filteredProfiles

    return matches.slice(0, 4)
  }, [filteredProfiles, liveQuery, privateIdentifierIntent])

  const marketSuggestions = useMemo(() => {
    const seen = new Set<string>()
    const value = normalize(liveQuery)

    return profiles
      .map((profile) => ({
        label: `${profile.city}, ${profile.state}`,
        query: profile.city,
        state: profile.state,
      }))
      .filter((market) => {
        const key = market.label.toLowerCase()
        const matches = !value || key.includes(value)

        if (!matches || seen.has(key)) return false
        seen.add(key)

        return true
      })
      .slice(0, 4)
  }, [liveQuery, profiles])

  const categorySuggestions = useMemo(() => {
    const value = normalize(liveQuery)

    return reportCategories
      .filter((item) => !value || normalize(item).includes(value))
      .slice(0, 4)
  }, [liveQuery])

  function handleSaveSearch() {
    const nextSearch: SavedSearchRecord = {
      id: `saved_${Date.now()}`,
      query: liveQuery.trim() || "All public profiles",
      state: stateFilter || undefined,
      riskLevel: riskFilter,
      category: categoryFilter,
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
  }

  function handleRemoveSavedSearch(id: string) {
    const next = savedSearches.filter((search) => search.id !== id)

    setSavedSearches(next)
    try {
      window.localStorage.setItem(savedSearchStorageKey, JSON.stringify(next))
    } catch {
      // Browser storage can be disabled; the in-memory list still updates.
    }
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

              <form action="/search" className="grid gap-3">
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
                  <Input
                    name="state"
                    value={stateValue}
                    onChange={(event) => setStateValue(event.target.value.toUpperCase())}
                    placeholder="State"
                    className="h-11 uppercase"
                    aria-label="Filter by state"
                  />
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
                    Search
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
                      Phone and email checks run securely after you press Search. Public previews never reveal
                      private identifiers.
                    </div>
                  ) : null}

                  <div className="mt-4 grid gap-3">
                    {instantProfiles.map((profile) => (
                      <Link
                        key={profile.id}
                        href={`/client/${profile.publicSlug}`}
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
                          {profile.latestSummary ?? "Approved public profile with moderated contractor reviews."}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                          <span>{profile.reportCount} approved signals</span>
                          {profile.latestCategory ? <span>{profile.latestCategory}</span> : null}
                          <span className="text-amber-700 group-hover:text-amber-800">Open profile</span>
                        </div>
                      </Link>
                    ))}

                    {instantProfiles.length === 0 ? (
                      <div className="rounded-md border border-dashed border-slate-300 bg-white p-4 text-sm leading-6 text-slate-600">
                        No public previews match yet. Press Search to run the full private check or create a
                        documented report if this client should be reviewed.
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

                    {marketSuggestions.map((market) => (
                      <Link
                        key={market.label}
                        href={buildSearchHref({ query: liveQuery || market.query, state: market.state })}
                        className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm transition hover:border-amber-300 hover:bg-white"
                      >
                        <span className="font-semibold text-slate-950">Search {market.label}</span>
                        <span className="mt-1 block text-xs text-slate-500">City and state filter</span>
                      </Link>
                    ))}

                    {categorySuggestions.map((item) => (
                      <Link
                        key={item}
                        href={buildSearchHref({ query: liveQuery, state: stateValue, category: item })}
                        className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm transition hover:border-amber-300 hover:bg-white"
                      >
                        <span className="font-semibold text-slate-950">{item}</span>
                        <span className="mt-1 block text-xs text-slate-500">Filter by report type</span>
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
                <Button
                  type="button"
                  onClick={handleSaveSearch}
                  className="mt-4 w-full bg-amber-500 text-slate-950 hover:bg-amber-400"
                >
                  <Save aria-hidden="true" />
                  Save current search
                </Button>
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
                          {[search.city, search.state, search.riskLevel, search.category].filter(Boolean).join(" · ") ||
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
              If search does not find an approved profile, submit a documented contractor review for moderation.
            </p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/submit-report">
            <FilePlus2 aria-hidden="true" />
            Leave a review
          </Link>
        </Button>
      </div>
    </div>
  )
}
