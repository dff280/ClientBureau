import Link from "next/link"
import {
  BadgeCheck,
  Building2,
  FileSearch,
  Filter,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react"

import { EntityProfileResultCard } from "@/components/search/entity-profile-result-card"
import { PremiumCtaBand, PremiumHero, PremiumProofStrip, ProductMockupFrame } from "@/components/marketing/premium-page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { profileTypeLabel, profileTypePluralLabel } from "@/lib/entity-profiles"
import { profileTypes, type EntityProfile, type EntityProfileSearchResult, type ProfileType } from "@/lib/types"

type ProfileDirectoryCopy = {
  eyebrow: string
  title: string
  description: string
  primaryLabel: string
}

const directoryCopy: Record<ProfileType | "all", ProfileDirectoryCopy> = {
  all: {
    eyebrow: "Unified profile directory",
    title: "Search public profiles for clients, contractors, and subcontractors.",
    description:
      "Browse approved Client Bureau profile records across clients, homeowners, contractors, service businesses, subcontractors, and trade professionals. Public pages show moderated summaries and safe profile context only.",
    primaryLabel: "Search all profiles",
  },
  client: {
    eyebrow: "Client and customer profiles",
    title: "Find client, homeowner, property owner, and customer profiles.",
    description:
      "Review public client profiles with approved contractor-submitted summaries, response context, evidence-on-file labels, and city/state profile records before taking work.",
    primaryLabel: "Search client profiles",
  },
  contractor: {
    eyebrow: "Contractor profiles",
    title: "Find contractor and service business profiles.",
    description:
      "Review public contractor and service business profiles with verification signals, documented project context, public contribution history, and profile claiming paths.",
    primaryLabel: "Search contractor profiles",
  },
  subcontractor: {
    eyebrow: "Subcontractor profiles",
    title: "Find subcontractor and trade professional profiles.",
    description:
      "Review public subcontractor and trade professional profiles for role context, project relationships, verification signals, and moderated business-to-business report history.",
    primaryLabel: "Search subcontractor profiles",
  },
}

export function getProfileDirectoryFaqs(profileType?: ProfileType) {
  const profileLabel = profileType ? profileTypePluralLabel(profileType).toLowerCase() : "public profiles"

  return [
    {
      question: `What appears in ${profileLabel}?`,
      answer:
        "Client Bureau profile directories show public-safe profile records, city/state context, verification signals, approved report indicators, and response paths. Raw private identifiers and raw evidence are not displayed.",
    },
    {
      question: "Can I search contractors, subcontractors, and clients?",
      answer:
        "Yes. The public directory supports client, contractor, service business, subcontractor, and trade professional profiles when those records are approved for public display.",
    },
    {
      question: "When should I use private search instead?",
      answer:
        "Use private dashboard search when you need saved searches, watchlists, private matching, or account-specific actions. Public directories are designed for approved profile discovery and SEO-safe browsing.",
    },
  ]
}

export function EntityProfileDirectory({
  activeType,
  allProfiles,
  results,
  searchPath,
  state,
  states,
  query,
}: {
  activeType?: ProfileType
  allProfiles: EntityProfile[]
  results: EntityProfileSearchResult[]
  searchPath: string
  state?: string
  states: string[]
  query: string
}) {
  const copy = directoryCopy[activeType ?? "all"]
  const visibleProfiles = activeType
    ? allProfiles.filter((profile) => profile.profileType === activeType)
    : allProfiles
  const profileCounts = profileTypes.map((type) => ({
    href: `/profiles/${type}`,
    label: profileTypePluralLabel(type),
    type,
    value: allProfiles.filter((profile) => profile.profileType === type).length,
  }))
  const verifiedCount = visibleProfiles.filter((profile) =>
    ["claimed", "verified"].includes(profile.claimedStatus),
  ).length
  const evidenceCount = visibleProfiles.filter((profile) => profile.evidenceOnFileCount > 0).length
  const reportCount = visibleProfiles.reduce((total, profile) => total + profile.reportCount, 0)
  const faqs = getProfileDirectoryFaqs(activeType)

  return (
    <main className="bg-slate-100">
      <PremiumHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        primary={{ href: "#profile-directory", label: copy.primaryLabel, icon: Search }}
        secondary={{ href: "/claim-profile", label: "Claim or correct a profile", icon: BadgeCheck }}
        aside={
          <ProductMockupFrame
            dark
            eyebrow="Profile graph"
            title={`${visibleProfiles.length} public ${visibleProfiles.length === 1 ? "profile" : "profiles"}`}
            description="Profile pages connect business roles, city/state records, approved report context, response paths, and public-safe verification signals."
            points={[
              "Clients, contractors, and subcontractors",
              "Approved public summaries only",
              "Private identifiers and raw evidence stay sealed",
            ]}
          />
        }
      />

      <PremiumProofStrip
        dark
        items={[
          { label: "Directory", value: visibleProfiles.length.toLocaleString(), text: "Public-safe profiles available for this view." },
          { label: "Verification", value: verifiedCount.toLocaleString(), text: "Claimed or verified profile records." },
          { label: "Reports", value: reportCount.toLocaleString(), text: "Approved or connected report signals." },
          { label: "Evidence", value: evidenceCount.toLocaleString(), text: "Profiles with private evidence indicators." },
        ]}
      />

      <section id="profile-directory" className="bureau-section">
        <div className="bureau-container space-y-6">
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-5 p-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase text-amber-700">Profile search</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
                    Search by name, business, trade, city, or state.
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    Use this public directory for broad profile discovery. Use the private dashboard search when phone, email, saved searches, and watchlists matter.
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link href={activeType ? `/search?profileType=${activeType}` : "/search"}>
                    <FileSearch aria-hidden="true" />
                    Open private search
                  </Link>
                </Button>
              </div>

              <form action={searchPath} className="grid gap-3 lg:grid-cols-[1fr_150px_180px_auto]">
                <input
                  aria-label="Search public profiles"
                  className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                  defaultValue={query}
                  name="q"
                  placeholder="Name, business, trade, or city"
                />
                <select
                  aria-label="Filter profile state"
                  className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-sm"
                  defaultValue={state ?? ""}
                  name="state"
                >
                  <option value="">All states</option>
                  {states.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                {!activeType ? (
                  <select
                    aria-label="Filter profile type"
                    className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-sm"
                    defaultValue=""
                    name="profileType"
                  >
                    <option value="">All profile types</option>
                    {profileTypes.map((type) => (
                      <option key={type} value={type}>{profileTypeLabel(type)}</option>
                    ))}
                  </select>
                ) : (
                  <input type="hidden" name="profileType" value={activeType} />
                )}
                <Button className="h-11 bg-slate-950 text-white hover:bg-slate-800">
                  <Filter aria-hidden="true" />
                  Filter profiles
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid gap-3 md:grid-cols-3">
            {profileCounts.map((item) => (
              <Link
                key={item.type}
                href={item.href}
                className={`rounded-md border p-4 shadow-sm transition hover:-translate-y-0.5 ${
                  activeType === item.type
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-950 hover:border-amber-300"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={activeType === item.type ? "text-xs font-semibold uppercase text-amber-300" : "text-xs font-semibold uppercase text-amber-700"}>
                      Profile type
                    </p>
                    <h3 className="mt-2 font-semibold">{item.label}</h3>
                  </div>
                  <span className={activeType === item.type ? "text-2xl font-semibold text-white" : "text-2xl font-semibold text-slate-950"}>
                    {item.value}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-amber-700">Directory results</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
                {activeType ? profileTypePluralLabel(activeType) : "All public profiles"}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                {results.length} {results.length === 1 ? "profile" : "profiles"} matched. Public pages show approved context only and never display private phone numbers, emails, street addresses, raw evidence files, pending content, or internal notes.
              </p>
            </div>
            <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
              <Link href="/signup">
                <ShieldCheck aria-hidden="true" />
                Create account
              </Link>
            </Button>
          </div>

          {results.length > 0 ? (
            <div className="grid gap-4">
              {results.map((result) => (
                <EntityProfileResultCard key={result.id} result={result} />
              ))}
            </div>
          ) : (
            <Card className="rounded-md border-dashed border-slate-300 bg-white shadow-sm">
              <CardContent className="grid place-items-center px-6 py-12 text-center">
                <div className="flex size-12 items-center justify-center rounded-md bg-amber-100 text-amber-800">
                  <UsersRound className="size-6" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-slate-950">No public profiles matched those filters.</h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  Clear the search, choose another state, or use the private search workflow for account-level saved searches and watchlist actions.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                    <Link href={searchPath}>
                      <Building2 aria-hidden="true" />
                      Clear filters
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/search">Open private search</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="bureau-section bg-white">
        <div className="bureau-container">
          <div className="grid gap-6 lg:grid-cols-[0.7fr_1fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase text-amber-700">Directory FAQ</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
                Public profile discovery without exposing private records.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                These directories help people find approved Client Bureau profiles while keeping sensitive information, raw evidence, and internal moderation details private.
              </p>
            </div>
            <div className="grid gap-3">
              {faqs.map((item) => (
                <Card key={item.question} className="rounded-md border-slate-200 bg-slate-50 shadow-sm">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-slate-950">{item.question}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PremiumCtaBand
        eyebrow="Business-owner protection"
        title="Use public profiles for discovery, then use your private dashboard to act."
        description="Create an account to save searches, watch profiles, build contract packets, organize evidence, open recovery cases, and document client experiences safely."
        primary={{ href: "/signup", label: "Create account", icon: ShieldCheck }}
        secondary={{ href: "/how-it-works", label: "How it works", icon: FileSearch }}
      />
    </main>
  )
}
