import type { Metadata } from "next"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { Bell, ClipboardCheck, FilePlus2, LockKeyhole, Radar, SearchCheck, ShieldCheck } from "lucide-react"

import { SearchCommandCenter } from "@/components/search/search-command-center"
import { EntityProfileResultCard } from "@/components/search/entity-profile-result-card"
import { PremiumHero, PremiumProofStrip, ProductMockupFrame, PublicDatabaseShowcase } from "@/components/marketing/premium-page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getCurrentUser } from "@/lib/auth"
import { pageAssets } from "@/lib/page-assets"
import { getContractorDashboardService, searchClientsService, searchProfilesService } from "@/lib/repositories/client-bureau-service"
import { toSearchPreviewProfile } from "@/lib/search-experience"
import { profileTypes, reportCategories, riskLevels, type ProfileType, type ReportCategory, type RiskLevel } from "@/lib/types"

export const metadata: Metadata = {
  title: "Check a Client",
  description:
    "Check Client Bureau for client, contractor, subcontractor, and service-business profiles with moderated public context.",
  alternates: {
    canonical: "/search",
  },
  robots: {
    index: false,
    follow: true,
  },
}

export const dynamic = "force-dynamic"

type SearchParams = Promise<{
  q?: string
  state?: string
  risk?: string
  category?: string
  profileType?: string
  tradeCategory?: string
}>

function toRiskLevel(value?: string): RiskLevel | undefined {
  return riskLevels.includes(value as RiskLevel) ? (value as RiskLevel) : undefined
}

function toReportCategory(value?: string): ReportCategory | undefined {
  return reportCategories.includes(value as ReportCategory) ? (value as ReportCategory) : undefined
}

function toProfileType(value?: string): ProfileType | undefined {
  return profileTypes.includes(value as ProfileType) ? (value as ProfileType) : undefined
}

function reportPrefillHref(query: string, state?: string, profileType?: ProfileType, tradeCategory?: string) {
  const params = new URLSearchParams()
  const tokens = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (tokens[0]) params.set("firstName", tokens[0])
  if (tokens[1]) params.set("lastName", tokens[1])
  if (state) params.set("state", state)
  if (profileType) params.set("profileType", profileType)
  if (tradeCategory) params.set("tradeCategory", tradeCategory)

  return `/submit-report${params.size ? `?${params.toString()}` : ""}`
}

function signupSearchHref(query: string, state?: string, riskLevel?: RiskLevel, category?: ReportCategory, profileType?: ProfileType, tradeCategory?: string) {
  const params = new URLSearchParams()
  const nextParams = new URLSearchParams()

  if (query.trim()) nextParams.set("q", query.trim())
  if (state) nextParams.set("state", state)
  if (riskLevel) nextParams.set("risk", riskLevel)
  if (category) nextParams.set("category", category)
  if (profileType) nextParams.set("profileType", profileType)
  if (tradeCategory) nextParams.set("tradeCategory", tradeCategory)

  params.set("next", `/search${nextParams.size ? `?${nextParams.toString()}` : ""}`)
  if (query.trim()) params.set("q", query.trim())

  return `/signup?${params.toString()}`
}

function profileTypeFilterHref(input: {
  query: string
  state?: string
  riskLevel?: RiskLevel
  category?: ReportCategory
  profileType?: ProfileType
  tradeCategory?: string
}) {
  const params = new URLSearchParams()
  if (input.query.trim()) params.set("q", input.query.trim())
  if (input.state) params.set("state", input.state)
  if (input.riskLevel) params.set("risk", input.riskLevel)
  if (input.category) params.set("category", input.category)
  if (input.profileType) params.set("profileType", input.profileType)
  if (input.tradeCategory) params.set("tradeCategory", input.tradeCategory)

  return `/search${params.size ? `?${params.toString()}` : ""}`
}

const searchDossierAsset = pageAssets.searchDossier

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const query = params.q ?? ""
  const state = params.state?.trim().toUpperCase() || undefined
  const riskLevel = toRiskLevel(params.risk)
  const category = toReportCategory(params.category)
  const profileType = toProfileType(params.profileType)
  const tradeCategory = params.tradeCategory?.trim() || undefined
  const hasSearch = Boolean(query || state || riskLevel || category || tradeCategory || profileType)
  const resultLimit = hasSearch ? 80 : 24
  const previewLimit = hasSearch ? 60 : 24
  const user = await getCurrentUser()
  const [results, previewResults, dashboard] = await Promise.all([
    searchProfilesService(query, { state, riskLevel, category, profileType, tradeCategory, limit: resultLimit }),
    searchClientsService("", { limit: previewLimit }),
    user ? getContractorDashboardService(user.id).catch(() => undefined) : Promise.resolve(undefined),
  ])
  const previewProfiles = previewResults.slice(0, previewLimit).map(toSearchPreviewProfile)
  const isAuthenticated = Boolean(user)
  const activeFilters = [
    query.trim() ? `Search: ${query.trim()}` : undefined,
    state ? `State: ${state}` : undefined,
    profileType ? `Type: ${profileType === "client" ? "Clients" : profileType === "contractor" ? "Contractors" : "Subcontractors"}` : undefined,
    tradeCategory ? `Trade: ${tradeCategory}` : undefined,
    riskLevel ? `Risk: ${riskLevel}` : undefined,
    category ? `Report: ${category}` : undefined,
  ].filter(Boolean) as string[]

  return (
    <>
      {hasSearch ? (
        <section className="relative overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(245,158,11,0.22),transparent_34%),linear-gradient(135deg,#020617_0%,#0f172a_52%,#111827_100%)]" />
          <div className="bureau-container relative py-8 sm:py-10">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-md border border-amber-300/35 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-200">
                  <SearchCheck className="size-4" aria-hidden="true" />
                  Database search active
                </div>
                <p className="mt-4 text-sm font-semibold text-amber-200">
                  Check a Client Before You Take the Job.
                </p>
                <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-normal text-white sm:text-4xl lg:text-5xl">
                  Client Bureau search results
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200 sm:text-base">
                  You are viewing approved public matches and safe previews. Private identifiers, raw evidence,
                  pending records, rejected records, and internal notes stay hidden.
                </p>
                {activeFilters.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {activeFilters.map((filter) => (
                      <span key={filter} className="rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-100">
                        {filter}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="rounded-md border border-white/10 bg-white/10 p-4 shadow-xl shadow-slate-950/20">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-200">Result count</p>
                <p className="mt-2 text-4xl font-semibold text-white">{results.length}</p>
                <p className="mt-1 text-sm leading-6 text-slate-200">
                  {results.length === 1 ? "approved profile matched" : "approved profiles matched"} this search.
                </p>
                <div className="mt-4 flex gap-2">
                  <Button asChild className="flex-1 bg-amber-500 text-slate-950 hover:bg-amber-400">
                    <Link href={results.length > 0 ? "#profile-results" : "#client-search"}>
                      {results.length > 0 ? "View matches" : "Review search"}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
                    <Link href="/search">Reset</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <>
          <PremiumHero
            eyebrow={isAuthenticated ? "Contractor account active" : "Limited public preview"}
            title="Check a Client Before You Take the Job."
            description="One search can scan approved Client, Contractor, and Subcontractor Database records while keeping private identifiers and raw evidence out of public view."
            primary={{ href: "#client-search", label: "Start search", icon: Radar }}
            secondary={{ href: reportPrefillHref(query, state, profileType, tradeCategory), label: "Report a Client Experience", icon: FilePlus2 }}
            aside={
              <div className="space-y-4">
                <ProductMockupFrame
                  dark
                  eyebrow={isAuthenticated ? "Private matching enabled" : "Public preview"}
                  title="Client-check intelligence, not guesswork."
                  description="Client checks are private. Raw phone numbers, emails, addresses, and evidence files are not displayed on public profiles."
                  imageSrc={searchDossierAsset.src}
                  imageAlt={searchDossierAsset.alt}
                  points={searchDossierAsset.points}
                />
                {!isAuthenticated ? (
                  <Button asChild className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400">
                    <Link href={signupSearchHref(query, state, riskLevel, category, profileType, tradeCategory)}>
                      <LockKeyhole aria-hidden="true" />
                      Create free account
                    </Link>
                  </Button>
                ) : null}
              </div>
            }
          />
          <PremiumProofStrip
            items={[
              { label: "Search", value: "One box", text: "Name, business, city, state, trade, or private-match context." },
              { label: "Databases", value: "3", text: "Clients, contractors, and subcontractors when approved." },
              { label: "Public result", value: "Moderated", text: "Pending, rejected, and private records stay hidden." },
              { label: "Privacy", value: "Sealed", text: "Raw contact details and evidence files are not shown." },
            ]}
            dark
          />
        </>
      )}

      <section id="client-search" className={hasSearch ? "bg-slate-100 py-8 sm:py-10" : "bureau-section bg-slate-100"}>
        <div className="bureau-container space-y-8">

        <SearchCommandCenter
          key={`${query}|${state ?? ""}|${riskLevel ?? ""}|${category ?? ""}|${profileType ?? ""}|${tradeCategory ?? ""}`}
          query={query}
          state={state}
          riskLevel={riskLevel}
          category={category}
          profileType={profileType}
          tradeCategory={tradeCategory}
          profiles={previewProfiles}
          initialSavedSearches={dashboard?.savedSearches}
          isAuthenticated={isAuthenticated}
        />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-slate-500">Server-verified results</p>
            <p className="mt-1 text-sm font-medium text-slate-600">
          {results.length} {results.length === 1 ? "profile" : "profiles"} found across the Client, Contractor, and Subcontractor databases
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={reportPrefillHref(query, state, profileType, tradeCategory)}>
              <FilePlus2 aria-hidden="true" />
              Report a Client Experience
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            ["All profiles", undefined],
            ["Clients", "client"],
            ["Contractors", "contractor"],
            ["Subcontractors", "subcontractor"],
          ].map(([label, value]) => {
            const typedValue = value as ProfileType | undefined
            const active = profileType === typedValue || (!profileType && !typedValue)

            return (
              <Button key={label} asChild variant={active ? "default" : "outline"} className={active ? "bg-slate-950 text-white hover:bg-slate-800" : ""}>
                <Link href={profileTypeFilterHref({ query, state, riskLevel, category, profileType: typedValue, tradeCategory })}>
                  {label}
                </Link>
              </Button>
            )
          })}
        </div>

        {hasSearch ? (
          <SearchActivationGuide
            hasSearch={hasSearch}
            isAuthenticated={isAuthenticated}
            query={query}
            resultCount={results.length}
            state={state}
            profileType={profileType}
            tradeCategory={tradeCategory}
            signupHref={signupSearchHref(query, state, riskLevel, category, profileType, tradeCategory)}
          />
        ) : (
          <PublicDatabaseShowcase
            compact
            eyebrow="Choose the right database"
            title="Not every search is a client check."
            description="Browse clients, contractors, or subcontractors directly when you already know which kind of record you need."
          />
        )}

        {results.length > 0 ? (
          <div id="profile-results" className="scroll-mt-24 grid gap-4">
            {results.map((result) => (
              <EntityProfileResultCard key={result.id} result={result} />
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
                {isAuthenticated ? (
                  <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                    <Link href="/dashboard/watchlist">Open Watchlist</Link>
                  </Button>
                ) : (
                  <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                    <Link href={signupSearchHref(query, state, riskLevel, category, profileType, tradeCategory)}>Create free account</Link>
                  </Button>
                )}
                <Button asChild variant="outline">
                  <Link href={reportPrefillHref(query, state, profileType, tradeCategory)}>Report a Client Experience</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
    </>
  )
}

function SearchActivationGuide({
  hasSearch,
  isAuthenticated,
  query,
  resultCount,
  state,
  profileType,
  tradeCategory,
  signupHref,
}: {
  hasSearch: boolean
  isAuthenticated: boolean
  query: string
  resultCount: number
  state?: string
  profileType?: ProfileType
  tradeCategory?: string
  signupHref: string
}) {
  const searchedLabel = query.trim() ? `"${query.trim()}"` : "this search"
  const resultTone = resultCount > 0 ? "text-emerald-800" : hasSearch ? "text-amber-800" : "text-slate-700"
  const resultCopy =
    resultCount > 0
      ? `${resultCount} approved ${resultCount === 1 ? "profile" : "profiles"} matched. Open a profile before you quote, schedule, send contract terms, or order materials.`
      : hasSearch
        ? `No approved public profile is visible for ${searchedLabel} yet. That is not a clearance signal; save the search or document the experience.`
        : "Run a client check before you commit labor, materials, scheduling, payment terms, or final invoice exposure."

  const actions = [
    {
      detail: resultCount > 0
        ? "Read approved summaries, response context, evidence labels, and profile history before deciding next terms."
        : "Save the name or business so you can check again before the job moves forward.",
      href: resultCount > 0 ? "#profile-results" : isAuthenticated ? "/dashboard/watchlist" : signupHref,
      icon: resultCount > 0 ? SearchCheck : Bell,
      label: resultCount > 0 ? "Review profile context" : isAuthenticated ? "Save to watchlist" : "Create account to save",
      title: resultCount > 0 ? "Review the match" : "Keep the search warm",
    },
    {
      detail: "If you have direct experience, submit a factual report with documentation for moderation.",
      href: reportPrefillHref(query, state, profileType, tradeCategory),
      icon: FilePlus2,
      label: "Report a Client Experience",
      title: "Document what happened",
    },
    {
      detail: "Use contracts, private evidence, payment recovery, or lien service tools when the job needs stronger protection.",
      href: isAuthenticated ? "/dashboard" : "/how-it-works",
      icon: ShieldCheck,
      label: isAuthenticated ? "Open dashboard tools" : "See how it works",
      title: "Choose the protection path",
    },
  ]

  return (
    <Card className="rounded-md border-slate-200 bg-white shadow-sm">
      <CardContent className="grid gap-5 p-5 lg:grid-cols-[280px_1fr]">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-amber-700">Client check guide</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">What to do with this client check</h2>
          <p className={`mt-2 text-sm leading-6 ${resultTone}`}>{resultCopy}</p>
          <div className="mt-4 flex items-start gap-2 rounded-md border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-600">
            <ClipboardCheck className="mt-0.5 size-4 shrink-0 text-amber-700" aria-hidden="true" />
            <span>Public results show approved context only. Private identifiers, raw evidence, pending content, and internal notes stay hidden.</span>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {actions.map((action) => (
            <SearchActivationAction key={action.title} {...action} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SearchActivationAction({
  detail,
  href,
  icon: Icon,
  label,
  title,
}: {
  detail: string
  href: string
  icon: LucideIcon
  label: string
  title: string
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col justify-between rounded-md border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-white"
    >
      <div>
        <span className="flex size-10 items-center justify-center rounded-md bg-slate-950 text-amber-300">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <h3 className="mt-4 font-semibold text-slate-950">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
      </div>
      <span className="mt-4 text-sm font-semibold text-amber-700 group-hover:text-amber-800">{label}</span>
    </Link>
  )
}
