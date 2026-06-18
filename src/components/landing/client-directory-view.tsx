import Link from "next/link"
import { ArrowRight, MapPinned, Search, ShieldCheck } from "lucide-react"

import { RiskBadge } from "@/components/client/risk-badge"
import { FloridaPlaceDatalist } from "@/components/forms/florida-place-datalist"
import { StateSelect } from "@/components/forms/state-select"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { clientDatabaseSearchHref, clientProfileConfidence, clientProfilePrimarySignals } from "@/lib/client-database"
import type { ClientDirectoryCity, ClientDirectoryCounty, ClientDirectoryState } from "@/lib/client-directory"
import { getClientCityDirectoryHref } from "@/lib/client-directory"
import { floridaLocationLabel, floridaMunicipalities, floridaPlaceRecords } from "@/lib/florida-geography"
import { JsonLd, getFaqSchema } from "@/lib/seo"
import { getPublicDatabasePillar } from "@/lib/public-site"
import type { ClientProfile } from "@/lib/types"

const directoryFaqs = [
  {
    question: "What appears in the Client Database?",
    answer:
      "The Client Database lists approved public client, homeowner, property owner, customer, and business profiles by state and city. Profiles are published only after moderation and show cautious contractor-submitted report context, client response information, and public-safe rating factors.",
  },
  {
    question: "Does the Client Database show private client contact information?",
    answer:
      "No. Public directory and profile pages should not display raw phone numbers, email addresses, street addresses, raw evidence files, staff-only review notes, pending reports, or rejected reports.",
  },
  {
    question: "How should contractors use Client Database pages?",
    answer:
      "Contractors should use directory pages as one intake signal before accepting work, then combine profile context with contracts, deposits, change-order controls, project documentation, and their own business judgment.",
  },
]

const floridaCountyFaqs = [
  {
    question: "Does Client Bureau list every Florida county?",
    answer:
      "Yes. Client Bureau keeps a complete Florida county layer for browsing and intake, while profile-backed county pages are prioritized for sitemap indexing.",
  },
  {
    question: "Why are some Florida city or county pages noindex?",
    answer:
      "Empty official locations may be available for search and reporting, but they stay out of the sitemap until useful approved public profile context exists.",
  },
  {
    question: "Can contractors report an experience in a Florida town or Census place?",
    answer:
      "Yes. Florida cities, towns, villages, and Census places are available as clean location suggestions during search and report intake.",
  },
]

const clientDatabasePillar = getPublicDatabasePillar("clients")

export function ClientDirectoryIndexView({ states }: { states: ClientDirectoryState[] }) {
  const profileCount = states.reduce((total, state) => total + state.profileCount, 0)
  const reportCount = states.reduce((total, state) => total + state.reportCount, 0)
  const recentProfiles = states
    .flatMap((state) => state.profiles)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 8)

  return (
    <section className="bureau-paper">
      <JsonLd data={getFaqSchema(directoryFaqs)} />
      <DirectoryHero
        eyebrow="Client Database"
        title="Search the Client Database before you take the job."
        description="Look up approved public client profiles by name, business, city, or state. Public pages show moderated context only, with private identifiers and raw evidence kept sealed."
        stats={[
          ["Public profiles", profileCount.toLocaleString()],
          ["Approved reports", reportCount.toLocaleString()],
          ["States", states.length.toLocaleString()],
        ]}
      />
      <div className="bureau-container space-y-8 py-10">
        <DatabaseQuickStart profileCount={profileCount} reportCount={reportCount} stateCount={states.length} />

        {states.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {states.map((state) => (
              <StateDirectoryCard key={state.slug} state={state} />
            ))}
          </div>
        ) : (
          <EmptyDirectoryState />
        )}
        {recentProfiles.length > 0 ? (
          <ProfileGrid title="Recently updated approved profiles" profiles={recentProfiles} />
        ) : null}
        {clientDatabasePillar ? (
          <ClientDatabaseAuthority
            evidenceLabel="Private evidence indicators"
            profileCount={profileCount}
            reportCount={reportCount}
            stateCount={states.length}
          />
        ) : null}
        <DirectoryEducation
          title="How to read a public Client Database record"
          description="Each profile is a moderated intake signal. Use it to understand approved public context before scheduling crews, ordering materials, sending contract terms, or extending payment terms."
        />
      </div>
    </section>
  )
}

export function ClientDirectoryStateView({ state }: { state: ClientDirectoryState }) {
  const isFlorida = state.slug === "florida"

  return (
    <section className="bureau-paper">
      <JsonLd data={getFaqSchema(directoryFaqs)} />
      <DirectoryHero
        eyebrow="State Client Database"
        title={`${state.name} Client Database profiles`}
        description={`Browse approved public client profiles and city directories in ${state.name}. These pages show moderated contractor-submitted report context and client response information only after review.`}
        stats={[
          ["Public profiles", state.profileCount.toLocaleString()],
          ["Approved reports", state.reportCount.toLocaleString()],
          ["Cities", state.cities.length.toLocaleString()],
        ]}
      />
      <div className="bureau-container space-y-8 py-10">
        <DirectoryBreadcrumbs
          items={[
            { href: "/clients", label: "Client Database" },
            { href: `/clients/${state.slug}`, label: state.name },
          ]}
        />
        {isFlorida ? (
          <FloridaCoveragePanel
            title="Florida counties, cities, towns, villages, and Census places are available for clean searching."
            description="Client Bureau uses official Florida geography data so contractors can search and submit records with consistent city, town, county, and local-market names. Empty markets stay out of the sitemap until they have useful public profile context."
          />
        ) : null}
        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <p className="text-sm font-semibold uppercase text-amber-700">City markets</p>
              <h2 className="text-2xl font-semibold text-slate-950">Find profiles by local market.</h2>
              <p className="text-sm leading-6 text-slate-600">
                City pages give contractors and search crawlers a direct path to approved public profiles
                in each market.
              </p>
              {isFlorida ? (
                <Button asChild variant="outline" className="w-full justify-center">
                  <Link href="/clients/florida/counties">
                    Browse Florida counties
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              ) : null}
              <div className="grid gap-2">
                {state.cities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/clients/${state.slug}/${city.slug}`}
                    className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-amber-300 hover:bg-white hover:text-slate-950"
                  >
                    <span>{city.name}</span>
                    <span className="text-xs text-slate-500">{city.profileCount} profiles</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <p className="text-sm font-semibold uppercase text-amber-700">Responsible research</p>
              <h2 className="text-2xl font-semibold text-slate-950">Use this as one intake signal.</h2>
              <p className="text-sm leading-6 text-slate-600">
                Client Bureau public pages are not accusation lists. They organize approved summaries,
                reported experience context, rating factors, response paths, and evidence-on-file
                labels to support better business decisions.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Moderated public summaries",
                  "Client right-of-response",
                  "Evidence reviewed privately",
                  "No raw contact identifiers",
                ].map((point) => (
                  <div key={point} className="flex gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-700" aria-hidden="true" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <ProfileGrid title={`Approved ${state.name} profiles`} profiles={state.profiles} />
        {clientDatabasePillar ? (
          <ClientDatabaseAuthority
            compact
            evidenceLabel="Evidence-on-file labels"
            profileCount={state.profileCount}
            reportCount={state.reportCount}
            stateCount={state.cities.length}
          />
        ) : null}
        <DirectoryEducation
          title={`Using ${state.name} public profile context responsibly`}
          description={`Client Bureau organizes ${state.name} profiles for contractors who want a pre-job client check before they commit labor, materials, delivery capacity, or payment terms.`}
        />
      </div>
    </section>
  )
}

export function ClientDirectoryCityView({
  state,
  city,
}: {
  state: ClientDirectoryState
  city: ClientDirectoryCity
}) {
  const place = city.floridaPlace
  const placeTypeLabel = place
    ? place.kind === "cdp"
      ? "Census-designated place"
      : `${place.kind.charAt(0).toUpperCase()}${place.kind.slice(1)}`
    : "City"

  return (
    <section className="bureau-paper">
      <JsonLd data={getFaqSchema(directoryFaqs)} />
      <DirectoryHero
        eyebrow="City Client Database"
        title={`${city.name}, ${state.code} Client Database profiles`}
        description={`Browse approved public client profiles in ${city.name}, ${state.name}. Public pages show moderated contractor-submitted reports, response context, and evidence-on-file summaries.`}
        stats={[
          ["Public profiles", city.profileCount.toLocaleString()],
          ["Approved reports", city.reportCount.toLocaleString()],
          ["Last updated", formatDate(city.lastUpdated)],
        ]}
      />
      <div className="bureau-container space-y-8 py-10">
        <DirectoryBreadcrumbs
          items={[
            { href: "/clients", label: "Client Database" },
            { href: `/clients/${state.slug}`, label: state.name },
            { href: `/clients/${state.slug}/${city.slug}`, label: city.name },
          ]}
        />
        {place ? (
          <FloridaLocationContextCard
            title={`${city.name} is tracked as a Florida ${placeTypeLabel.toLowerCase()} in the Client Database.`}
            description={
              city.profileCount > 0
                ? "This market has approved public profile context. The page can be used as a direct local-market path for contractors and search engines."
                : "No approved public profiles are listed here yet. The page remains useful for private searches and intake, but it stays out of the sitemap until real public record context exists."
            }
            facts={[
              ["Location type", placeTypeLabel],
              ["County", place.counties.map((county) => `${county.name} County`).join(" / ") || "Florida"],
              ["Public profiles", city.profileCount.toLocaleString()],
            ]}
          />
        ) : null}
        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardContent className="grid gap-4 p-6 lg:grid-cols-[1fr_280px] lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">
                Check before scheduling work in {city.name}.
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Review approved profile context, then document your own experience or use Client
                Bureau tools for contracts, evidence, recovery, and Florida lien service workflows.
              </p>
            </div>
            <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
              <Link href={clientDatabaseSearchHref({ state: state.code })}>Check this market</Link>
            </Button>
          </CardContent>
        </Card>
        <ProfileGrid title={`Approved profiles in ${city.name}`} profiles={city.profiles} />
        {clientDatabasePillar ? (
          <ClientDatabaseAuthority
            compact
            evidenceLabel="City-level public context"
            profileCount={city.profileCount}
            reportCount={city.reportCount}
            stateCount={1}
          />
        ) : null}
        <DirectoryEducation
          title={`What ${city.name} contractors can learn here`}
          description={`This city Client Database page helps business owners review approved public profile context before scheduling crews, ordering materials, accepting custom work, extending payment terms, or sending a contract packet.`}
        />
      </div>
    </section>
  )
}

export function ClientDirectoryCountyIndexView({ counties }: { counties: ClientDirectoryCounty[] }) {
  const reportCount = counties.reduce((total, county) => total + county.reportCount, 0)
  const activeCounties = counties.filter((county) => county.profileCount > 0)

  return (
    <section className="bureau-paper">
      <JsonLd data={getFaqSchema(floridaCountyFaqs)} />
      <DirectoryHero
        eyebrow="Florida County Client Database"
        title="Browse Florida Client Database coverage by county."
        description="Use county pages to find official Florida markets, approved public client profiles, and clean local-market paths without publishing empty thin SEO pages."
        stats={[
          ["Florida counties", counties.length.toLocaleString()],
          ["Counties with profiles", activeCounties.length.toLocaleString()],
          ["Approved reports", reportCount.toLocaleString()],
        ]}
      />
      <div className="bureau-container space-y-8 py-10">
        <DirectoryBreadcrumbs
          items={[
            { href: "/clients", label: "Client Database" },
            { href: "/clients/florida", label: "Florida" },
            { href: "/clients/florida/counties", label: "Counties" },
          ]}
        />
        <FloridaCoveragePanel
          title="Florida coverage is complete for selection, conservative for indexing."
          description="Every Florida county is listed for browsing and intake. County detail pages with approved public profile context can enter the sitemap; empty county pages remain crawlable noindex."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {counties.map((county) => (
            <CountyDirectoryCard key={county.slug} county={county} />
          ))}
        </div>
        <DirectoryEducation
          title="Why county pages stay profile-backed"
          description="County pages help contractors browse official local markets, but Client Bureau avoids filling Google with empty pages. Pages become stronger as real approved profiles, reports, responses, and evidence summaries are published."
        />
      </div>
    </section>
  )
}

export function ClientDirectoryCountyView({ county }: { county: ClientDirectoryCounty }) {
  const municipalityCount = county.places.filter((place) => place.isMunicipality).length
  const cdpCount = county.places.filter((place) => place.isCensusDesignatedPlace).length

  return (
    <section className="bureau-paper">
      <DirectoryHero
        eyebrow="County Client Database"
        title={`${county.name} County, FL Client Database`}
        description={`Browse approved public Client Bureau profile context and official Florida local-market links for ${county.name} County.`}
        stats={[
          ["Public profiles", county.profileCount.toLocaleString()],
          ["Approved reports", county.reportCount.toLocaleString()],
          ["Local places", county.places.length.toLocaleString()],
        ]}
      />
      <div className="bureau-container space-y-8 py-10">
        <DirectoryBreadcrumbs
          items={[
            { href: "/clients", label: "Client Database" },
            { href: "/clients/florida", label: "Florida" },
            { href: "/clients/florida/counties", label: "Counties" },
            { href: `/clients/florida/counties/${county.slug}`, label: `${county.name} County` },
          ]}
        />
        <FloridaLocationContextCard
          title={`${county.name} County coverage is organized by official Florida place names.`}
          description={
            county.profileCount > 0
              ? "This county has approved public profile context and direct links into local Client Database markets."
              : "No approved public profiles are listed in this county yet. Contractors can still search privately or submit a documented experience for moderation."
          }
          facts={[
            ["Municipalities", municipalityCount.toLocaleString()],
            ["CDPs / local places", cdpCount.toLocaleString()],
            ["Public profiles", county.profileCount.toLocaleString()],
          ]}
        />
        {county.profileCities.length > 0 ? (
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <p className="text-sm font-semibold uppercase text-amber-700">Profile-backed local markets</p>
              <h2 className="text-2xl font-semibold text-slate-950">Approved Client Database pages in {county.name} County.</h2>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {county.profileCities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/clients/florida/${city.slug}`}
                    className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-amber-300 hover:bg-white hover:text-slate-950"
                  >
                    {city.name}
                    <span className="ml-2 text-xs text-slate-500">{city.profileCount} profiles</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <EmptyDirectoryState />
        )}
        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardContent className="space-y-4 p-6">
            <p className="text-sm font-semibold uppercase text-amber-700">Official local places</p>
            <h2 className="text-2xl font-semibold text-slate-950">Florida places available for clean intake.</h2>
            <p className="text-sm leading-6 text-slate-600">
              These places are available for search and form selection. Pages without approved public profile context stay out of the sitemap.
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {county.places.slice(0, 24).map((place) => (
                <Link
                  key={place.slug}
                  href={`/clients/florida/${place.slug}`}
                  className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-amber-300 hover:bg-white hover:text-slate-950"
                >
                  {place.name}
                  <span className="ml-2 text-xs text-slate-500">{place.kind === "cdp" ? "CDP" : place.kind}</span>
                </Link>
              ))}
            </div>
            {county.places.length > 24 ? (
              <p className="text-xs font-medium text-slate-500">
                Showing 24 of {county.places.length.toLocaleString()} official places in this county.
              </p>
            ) : null}
          </CardContent>
        </Card>
        <ProfileGrid title={`Approved ${county.name} County profiles`} profiles={county.profiles} />
      </div>
    </section>
  )
}

function ClientDatabaseAuthority({
  compact = false,
  evidenceLabel,
  profileCount,
  reportCount,
  stateCount,
}: {
  compact?: boolean
  evidenceLabel: string
  profileCount: number
  reportCount: number
  stateCount: number
}) {
  if (!clientDatabasePillar) return null

  return (
    <Card className="rounded-md border-slate-200 bg-white shadow-sm">
      <CardContent className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
            Client Database authority
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">
            {clientDatabasePillar.authorityTitle}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {compact ? clientDatabasePillar.primaryIntent : clientDatabasePillar.authorityDescription}
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <DirectoryFact label="Profiles" value={profileCount.toLocaleString()} />
            <DirectoryFact label="Reports" value={reportCount.toLocaleString()} />
            <DirectoryFact label="Coverage" value={stateCount.toLocaleString()} />
          </div>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <AuthorityList title="Public signals" items={[...clientDatabasePillar.publicSignals.slice(0, 3), evidenceLabel]} />
            <AuthorityList title="How records should be read" items={clientDatabasePillar.recordsExplained} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
              {clientDatabasePillar.internalLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-md border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-white"
                >
                  <p className="font-semibold text-slate-950">{item.label}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                  <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-amber-700">
                    Open page
                    <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AuthorityList({ items, title }: { items: string[]; title: string }) {
  return (
    <div>
      <h3 className="font-semibold text-slate-950">{title}</h3>
      <ul className="mt-3 grid gap-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-slate-600">
            <ShieldCheck className="mt-1 size-4 shrink-0 text-emerald-700" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function DirectoryHero({
  eyebrow,
  title,
  description,
  stats,
}: {
  eyebrow: string
  title: string
  description: string
  stats: [string, string][]
}) {
  return (
    <div className="premium-hero-surface relative isolate overflow-hidden border-b border-slate-800 bg-slate-950 text-white">
      <div className="bureau-container grid gap-6 py-8 sm:py-12 lg:grid-cols-[1fr_340px] lg:items-end">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-md border border-amber-300/30 bg-white/5 px-3 py-2 text-sm font-semibold text-amber-200">
            <MapPinned className="size-4" aria-hidden="true" />
            {eyebrow}
          </div>
          <div>
            <h1 className="max-w-4xl text-3xl font-semibold tracking-normal text-balance sm:text-4xl lg:text-5xl">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">{description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-amber-500 text-slate-950 hover:bg-amber-400">
              <a href="#client-database-search">
                <Search aria-hidden="true" />
                Search Client Database
              </a>
            </Button>
            <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
              <Link href="/submit-report">Report a Client Experience</Link>
            </Button>
          </div>
        </div>
        <Card className="premium-card-glow rounded-md border-white/10 bg-white/5 text-white shadow-sm">
          <CardContent className="grid gap-2 p-3 sm:p-4">
            {stats.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 rounded-md border border-white/10 bg-white/5 px-3 py-2">
                <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
                <p className="text-xl font-semibold text-white">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DatabaseQuickStart({
  profileCount,
  reportCount,
  stateCount,
}: {
  profileCount: number
  reportCount: number
  stateCount: number
}) {
  return (
    <Card id="client-database-search" className="scroll-mt-24 overflow-hidden rounded-md border-slate-200 bg-white shadow-sm">
      <CardContent className="grid gap-0 p-0 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5 p-5 sm:p-6">
          <div>
            <p className="text-sm font-semibold uppercase text-amber-700">Search clients</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
              Run a client check by name, business, or market.
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Use the Client Database before quotes, scheduling, material orders, contract terms,
              deposits, or payment milestones. Searches use approved public records and private-safe matching.
            </p>
          </div>
          <form action="/search" method="get" className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_210px_auto] sm:p-4">
            <input type="hidden" name="profileType" value="client" />
            <FloridaPlaceDatalist id="client-database-location-options" />
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase text-slate-500">Name or business</span>
              <input
                name="q"
                type="search"
                placeholder="John Smith, ABC Holdings, property owner..."
                list="client-database-location-options"
                className="h-10 rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase text-slate-500">State</span>
              <StateSelect id="client-database-state" name="state" required={false} />
            </label>
            <Button className="mt-auto h-10 bg-slate-950 text-white hover:bg-slate-800">
              <Search aria-hidden="true" />
              Check a Client
            </Button>
          </form>
        </div>
        <div className="border-t border-slate-200 bg-slate-950 p-5 text-white sm:p-6 lg:border-l lg:border-t-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-300">Database proof</p>
          <div className="mt-4 grid gap-3">
            <DirectoryProofMetric label="Public profiles" value={profileCount.toLocaleString()} />
            <DirectoryProofMetric label="Approved reports" value={reportCount.toLocaleString()} />
            <DirectoryProofMetric label="State directories" value={stateCount.toLocaleString()} />
          </div>
          <div className="mt-5 rounded-md border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
            Public profiles never show raw phone numbers, emails, street addresses, raw evidence files,
            pending reports, rejected reports, or staff-only review notes.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function FloridaCoveragePanel({ description, title }: { description: string; title: string }) {
  return (
    <Card className="rounded-md border-slate-200 bg-white shadow-sm">
      <CardContent className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[1fr_360px] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-amber-700">Florida geography coverage</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
          <DirectoryFact label="Counties" value="67" />
          <DirectoryFact label="Municipalities" value={floridaMunicipalities.length.toLocaleString()} />
          <DirectoryFact label="Florida places" value={floridaPlaceRecords.length.toLocaleString()} />
        </div>
      </CardContent>
    </Card>
  )
}

function FloridaLocationContextCard({
  description,
  facts,
  title,
}: {
  description: string
  facts: [string, string][]
  title: string
}) {
  return (
    <Card className="rounded-md border-slate-200 bg-white shadow-sm">
      <CardContent className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[1fr_360px] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-amber-700">Official Florida market</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <div className="grid gap-2">
          {facts.map(([label, value]) => (
            <DirectoryFact key={label} label={label} value={value} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function CountyDirectoryCard({ county }: { county: ClientDirectoryCounty }) {
  const samplePlaces = county.places.slice(0, 4).map(floridaLocationLabel)

  return (
    <Card className="bureau-hover-lift rounded-md border-slate-200 bg-white shadow-sm">
      <CardContent className="space-y-5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">{county.name} County</h2>
            <p className="mt-1 text-sm text-slate-500">
              {county.profileCount} public profiles / {county.places.length} official places
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/clients/florida/counties/${county.slug}`}>
              Open county
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-2">
          {samplePlaces.map((place) => (
            <p key={place} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
              {place}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function DirectoryProofMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  )
}

function StateDirectoryCard({ state }: { state: ClientDirectoryState }) {
  return (
    <Card className="bureau-hover-lift rounded-md border-slate-200 bg-white shadow-sm">
      <CardContent className="space-y-5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">{state.name}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {state.profileCount} public profiles / {state.reportCount} approved reports
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/clients/${state.slug}`}>
              Open state
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {state.cities.slice(0, 6).map((city) => (
            <Link
              key={city.slug}
              href={`/clients/${state.slug}/${city.slug}`}
              className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-amber-300 hover:bg-white hover:text-slate-950"
            >
              {city.name}
              <span className="ml-2 text-xs text-slate-500">{city.profileCount}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ProfileGrid({ title, profiles }: { title: string; profiles: ClientProfile[] }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-amber-700">Approved public profiles</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950">{title}</h2>
        </div>
        <Button asChild variant="outline">
          <Link href="/client-response">Submit response or correction</Link>
        </Button>
      </div>
      {profiles.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {profiles.map((profile) => (
            <ProfileDirectoryCard key={profile.id} profile={profile} />
          ))}
        </div>
      ) : (
        <EmptyDirectoryState />
      )}
    </div>
  )
}

function ProfileDirectoryCard({ profile }: { profile: ClientProfile }) {
  const confidence = clientProfileConfidence(profile)
  const signals = clientProfilePrimarySignals(profile)

  return (
    <Card className="bureau-hover-lift rounded-md border-slate-200 bg-white shadow-sm">
      <CardContent className="space-y-5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-950">
              {profile.firstName} {profile.lastName}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {profile.businessName ? `${profile.businessName} / ` : ""}
              {profile.city}, {profile.state}
            </p>
          </div>
          <RiskBadge riskLevel={profile.riskLevel} />
        </div>
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
          {confidence.summary}
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <DirectoryFact label="Context rating" value={`${profile.clientBureauScore}/100`} />
          <DirectoryFact label="Reports" value={String(profile.reportCount)} />
          <DirectoryFact label="Rating label" value={signals.ratingLabel} />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href={`/client/${profile.publicSlug}`}>
              View profile
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Link href={getClientCityDirectoryHref(profile)} className="inline-flex items-center text-sm font-semibold text-amber-700 hover:text-amber-800">
            {profile.city} market
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function DirectoryFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
    </div>
  )
}

function DirectoryEducation({ title, description }: { title: string; description: string }) {
  const guardrails = [
    {
      title: "Moderated summaries only",
      text: "Profiles are based on approved reported experiences and should be read as business-context records, not broad accusations or guarantees.",
    },
    {
      title: "Private matching stays private",
      text: "Searches may use private identifiers, but public pages do not show raw emails, phones, street addresses, evidence files, or staff-only review notes.",
    },
    {
      title: "Response and resolution context",
      text: "Approved responses, disputes, corrections, positive reports, and resolution updates help keep the record balanced and useful.",
    },
  ]

  return (
    <Card className="rounded-md border-slate-200 bg-white shadow-sm">
      <CardContent className="grid gap-5 p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase text-amber-700">Responsible database use</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h2>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">{description}</p>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">
            Use this page as one intake signal before scheduling crews, ordering materials, accepting custom work,
            extending payment terms, or sending an agreement packet. A public profile should support a careful
            business decision; it should not replace contracts, deposits, documentation, or direct professional judgment.
          </p>
        </div>
        <div className="grid gap-3">
          {guardrails.map((item) => (
            <div key={item.title} className="flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-700" aria-hidden="true" />
              <span>
                <strong className="block text-slate-950">{item.title}</strong>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function DirectoryBreadcrumbs({ items }: { items: { href: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase text-slate-500">
      {items.map((item, index) => (
        <span key={item.href} className="contents">
          {index > 0 ? <span aria-hidden="true">/</span> : null}
          <Link href={item.href} className="hover:text-slate-950">{item.label}</Link>
        </span>
      ))}
    </nav>
  )
}

function EmptyDirectoryState() {
  return (
    <Card className="rounded-md border-slate-200 bg-white shadow-sm">
      <CardContent className="p-8 text-center">
        <h2 className="text-2xl font-semibold text-slate-950">No approved public profiles are listed yet.</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Client Bureau publishes public profile links only after admin moderation. Contractors can
          still search privately or report a documented client experience for review.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
            <Link href="/search">Check a Client</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/submit-report">Report a Client Experience</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}
