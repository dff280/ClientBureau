import type { Metadata } from "next"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { Bell, ClipboardCheck, FilePlus2, LockKeyhole, Radar, SearchCheck, ShieldCheck } from "lucide-react"

import { SearchCommandCenter } from "@/components/search/search-command-center"
import { EntityProfileResultCard } from "@/components/search/entity-profile-result-card"
import { PremiumHero, PremiumProofStrip, ProductMockupFrame } from "@/components/marketing/premium-page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getCurrentUser } from "@/lib/auth"
import { getContractorDashboardService, searchClientsService, searchProfilesService } from "@/lib/repositories/client-bureau-service"
import { toSearchPreviewProfile } from "@/lib/search-experience"
import { profileTypes, reportCategories, riskLevels, type ProfileType, type ReportCategory, type RiskLevel } from "@/lib/types"

export const metadata: Metadata = {
  title: "Check a Client",
  description:
    "Search Client Bureau for client, contractor, subcontractor, and service-business profiles with moderated public context.",
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
  profileType?: string
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

function profileTypeFilterHref(input: {
  query: string
  state?: string
  riskLevel?: RiskLevel
  category?: ReportCategory
  profileType?: ProfileType
}) {
  const params = new URLSearchParams()
  if (input.query.trim()) params.set("q", input.query.trim())
  if (input.state) params.set("state", input.state)
  if (input.riskLevel) params.set("risk", input.riskLevel)
  if (input.category) params.set("category", input.category)
  if (input.profileType) params.set("profileType", input.profileType)

  return `/search${params.size ? `?${params.toString()}` : ""}`
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const query = params.q ?? ""
  const state = params.state?.trim().toUpperCase() || undefined
  const riskLevel = toRiskLevel(params.risk)
  const category = toReportCategory(params.category)
  const profileType = toProfileType(params.profileType)
  const user = await getCurrentUser()
  const [results, previewResults, dashboard] = await Promise.all([
    searchProfilesService(query, { state, riskLevel, category, profileType }),
    searchClientsService("", {}),
    user ? getContractorDashboardService(user.id).catch(() => undefined) : Promise.resolve(undefined),
  ])
  const previewProfiles = previewResults.slice(0, 100).map(toSearchPreviewProfile)
  const hasSearch = Boolean(query || state || riskLevel || category)
  const isAuthenticated = Boolean(user)

  return (
    <>
      <PremiumHero
        eyebrow={isAuthenticated ? "Contractor account active" : "Limited public preview"}
        title="Check a Client Before You Take the Job."
        description="Search names, businesses, cities, private-match identifiers, categories, and public profiles before you risk labor, materials, scheduling, deposits, or final invoice exposure."
        primary={{ href: "#client-search", label: "Start Search", icon: Radar }}
        secondary={{ href: reportPrefillHref(query, state), label: "Report a Client Experience", icon: FilePlus2 }}
        aside={
          <div className="space-y-4">
            <ProductMockupFrame
              dark
              eyebrow={isAuthenticated ? "Private matching enabled" : "Public preview"}
              title="Search intelligence, not guesswork."
              description={
                isAuthenticated
                  ? "Use names, businesses, cities, phone, or email to support private matching while public results stay carefully moderated."
                  : query
                    ? `Create a free account to save "${query}" and continue into watchlists, private matching, and report workflows.`
                    : "Search is private. Raw phone numbers, emails, addresses, and evidence files are not displayed on public profiles."
              }
              imageSrc="/images/search-intelligence-console.webp"
              imageAlt="Client Bureau search intelligence console with client profile previews."
              points={["Approved public summaries", "Private identifier matching", "Saved searches and watchlists"]}
            />
            {!isAuthenticated ? (
              <Button asChild className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400">
                <Link href={signupSearchHref(query, state, riskLevel, category)}>
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
          { label: "Search by", value: "Name + business", text: "City, state, phone, email, and job context can support matching." },
          { label: "Profile types", value: "All roles", text: "Clients, contractors, subcontractors, and trade businesses can appear when approved." },
          { label: "Public result", value: "Approved only", text: "Pending, rejected, private, and raw evidence content stays hidden." },
          { label: "Privacy", value: "Protected", text: "Raw contact details and evidence files are not displayed publicly." },
        ]}
        dark
      />

      <section id="client-search" className="bureau-section bg-slate-100">
        <div className="bureau-container space-y-8">

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
          {results.length} {results.length === 1 ? "profile" : "profiles"} found across clients, contractors, and subcontractors
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={reportPrefillHref(query, state)}>
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
                <Link href={profileTypeFilterHref({ query, state, riskLevel, category, profileType: typedValue })}>
                  {label}
                </Link>
              </Button>
            )
          })}
        </div>

        <SearchActivationGuide
          hasSearch={hasSearch}
          isAuthenticated={isAuthenticated}
          query={query}
          resultCount={results.length}
          state={state}
          signupHref={signupSearchHref(query, state, riskLevel, category)}
        />

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
                    <Link href={signupSearchHref(query, state, riskLevel, category)}>Create free account</Link>
                  </Button>
                )}
                <Button asChild variant="outline">
                  <Link href={reportPrefillHref(query, state)}>Report a Client Experience</Link>
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
  signupHref,
}: {
  hasSearch: boolean
  isAuthenticated: boolean
  query: string
  resultCount: number
  state?: string
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
      href: reportPrefillHref(query, state),
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
          <p className="text-xs font-semibold uppercase text-amber-700">Search decision guide</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">What to do with this search</h2>
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
