import Link from "next/link"
import { ArrowRight, MapPinned, Search, ShieldCheck } from "lucide-react"

import { RiskBadge } from "@/components/client/risk-badge"
import { TrustGuardrailStrip } from "@/components/marketing/premium-page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { ClientDirectoryCity, ClientDirectoryState } from "@/lib/client-directory"
import { getClientCityDirectoryHref } from "@/lib/client-directory"
import { JsonLd, getFaqSchema } from "@/lib/seo"
import type { ClientProfile } from "@/lib/types"

const directoryFaqs = [
  {
    question: "What appears in the Client Bureau directory?",
    answer:
      "The directory lists approved public client profiles by state and city. Profiles are published only after moderation and should show cautious contractor-submitted report context, client response information, and public-safe rating factors.",
  },
  {
    question: "Does the directory show private client contact information?",
    answer:
      "No. Public directory and profile pages should not display raw phone numbers, email addresses, street addresses, raw evidence files, internal notes, pending reports, or rejected reports.",
  },
  {
    question: "How should contractors use directory pages?",
    answer:
      "Contractors should use directory pages as one intake signal before accepting work, then combine profile context with contracts, deposits, change-order controls, project documentation, and their own business judgment.",
  },
]

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
        eyebrow="Public client directory"
        title="Browse approved Client Bureau profiles by state and city."
        description="Client Bureau directory pages help contractors and business owners discover public, admin-approved client profiles without relying on a search form alone."
        stats={[
          ["Public profiles", profileCount.toLocaleString()],
          ["Approved reports", reportCount.toLocaleString()],
          ["States", states.length.toLocaleString()],
        ]}
      />
      <TrustGuardrailStrip
        items={[
          "Approved profile links only",
          "No raw contact identifiers",
          "Evidence summarized safely",
          "Client response paths included",
        ]}
        dark
      />
      <div className="bureau-container space-y-8 py-10">
        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardContent className="grid gap-4 p-6 lg:grid-cols-[1fr_280px] lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">State directories</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Each state page links to city directories and approved client profiles. Pending,
                rejected, private evidence, raw email, phone, and internal notes are not shown.
              </p>
            </div>
            <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
              <Link href="/search">
                <Search aria-hidden="true" />
                Check a Client
              </Link>
            </Button>
          </CardContent>
        </Card>

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
        <DirectoryEducation
          title="How to use the Client Bureau directory"
          description="The directory is built for careful pre-job research. It gives contractors and service businesses a direct path to approved public profiles while keeping sensitive matching data and private workflow records out of search results."
        />
      </div>
    </section>
  )
}

export function ClientDirectoryStateView({ state }: { state: ClientDirectoryState }) {
  return (
    <section className="bureau-paper">
      <JsonLd data={getFaqSchema(directoryFaqs)} />
      <DirectoryHero
        eyebrow="State client directory"
        title={`${state.name} Client Bureau profiles`}
        description={`Browse approved public client profiles and city directories in ${state.name}. These pages show moderated contractor-submitted report context and client response information only after review.`}
        stats={[
          ["Public profiles", state.profileCount.toLocaleString()],
          ["Approved reports", state.reportCount.toLocaleString()],
          ["Cities", state.cities.length.toLocaleString()],
        ]}
      />
      <TrustGuardrailStrip
        items={[
          "State directory is public-safe",
          "Pending reports hidden",
          "Private evidence sealed",
          "Use as one intake signal",
        ]}
        dark
      />
      <div className="bureau-container space-y-8 py-10">
        <DirectoryBreadcrumbs
          items={[
            { href: "/clients", label: "Client Directory" },
            { href: `/clients/${state.slug}`, label: state.name },
          ]}
        />
        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <p className="text-sm font-semibold uppercase text-amber-700">City directories</p>
              <h2 className="text-2xl font-semibold text-slate-950">Find profiles by local market.</h2>
              <p className="text-sm leading-6 text-slate-600">
                City pages give crawlers and contractors a direct path to approved public profiles
                in each market.
              </p>
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
  return (
    <section className="bureau-paper">
      <JsonLd data={getFaqSchema(directoryFaqs)} />
      <DirectoryHero
        eyebrow="City client directory"
        title={`${city.name}, ${state.code} Client Bureau profiles`}
        description={`Browse approved public client profiles in ${city.name}, ${state.name}. Public pages show moderated contractor-submitted reports, response context, and evidence-on-file summaries.`}
        stats={[
          ["Public profiles", city.profileCount.toLocaleString()],
          ["Approved reports", city.reportCount.toLocaleString()],
          ["Last updated", formatDate(city.lastUpdated)],
        ]}
      />
      <TrustGuardrailStrip
        items={[
          "City profile links are moderated",
          "No street addresses displayed",
          "Response context included when approved",
          "Check before scheduling",
        ]}
        dark
      />
      <div className="bureau-container space-y-8 py-10">
        <DirectoryBreadcrumbs
          items={[
            { href: "/clients", label: "Client Directory" },
            { href: `/clients/${state.slug}`, label: state.name },
            { href: `/clients/${state.slug}/${city.slug}`, label: city.name },
          ]}
        />
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
              <Link href="/submit-report">Report a Client Experience</Link>
            </Button>
          </CardContent>
        </Card>
        <ProfileGrid title={`Approved profiles in ${city.name}`} profiles={city.profiles} />
        <DirectoryEducation
          title={`What ${city.name} contractors can learn here`}
          description={`This city directory helps business owners review approved public profile context before scheduling crews, ordering materials, accepting custom work, extending payment terms, or sending a contract packet.`}
        />
      </div>
    </section>
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
              <Link href="/search">
                <Search aria-hidden="true" />
                Check a Client
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
              <Link href="/how-it-works">How Client Bureau Works</Link>
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
            <Card key={profile.id} className="bureau-hover-lift rounded-md border-slate-200 bg-white shadow-sm">
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
                <div className="grid gap-3 sm:grid-cols-3">
                  <DirectoryFact label="Rating" value={`${profile.clientBureauScore}/100`} />
                  <DirectoryFact label="Reports" value={String(profile.reportCount)} />
                  <DirectoryFact label="Updated" value={formatDate(profile.updatedAt)} />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="outline">
                    <Link href={`/client/${profile.publicSlug}`}>
                      View profile
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                  <Link href={getClientCityDirectoryHref(profile)} className="inline-flex items-center text-sm font-semibold text-amber-700 hover:text-amber-800">
                    {profile.city} directory
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyDirectoryState />
      )}
    </div>
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
  return (
    <Card className="rounded-md border-slate-200 bg-white shadow-sm">
      <CardContent className="space-y-6 p-6">
        <div>
          <p className="text-sm font-semibold uppercase text-amber-700">Responsible directory use</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h2>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-semibold text-slate-950">Moderated public summaries</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Client Bureau directory pages link to public profiles created from approved
              contractor-submitted summaries. The wording should stay neutral, factual, and tied
              to documented reported experiences instead of broad accusations.
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-semibold text-slate-950">Private matching stays private</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Contractors may search with private identifiers, but public pages do not show raw
              emails, phone numbers, street addresses, uploaded evidence, internal notes, or
              unapproved submissions. Evidence is summarized only as public-safe context.
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-semibold text-slate-950">Response and resolution context</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Clients can submit a response, correction, dispute, or resolution update. Approved
              response context helps contractors understand whether an issue is open, resolved,
              disputed, or supported by additional documentation.
            </p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {directoryFaqs.map((faq) => (
            <div key={faq.question} className="rounded-md border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-950">{faq.question}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
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
