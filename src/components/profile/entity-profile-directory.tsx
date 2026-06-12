import Link from "next/link"
import {
  BadgeCheck,
  Building2,
  ClipboardCheck,
  FileSearch,
  Filter,
  Hammer,
  Handshake,
  Search,
  ShieldCheck,
  UsersRound,
  Wrench,
  type LucideIcon,
} from "lucide-react"

import { EntityProfileResultCard } from "@/components/search/entity-profile-result-card"
import { PremiumCtaBand, PremiumHero, PremiumProofStrip, ProductMockupFrame } from "@/components/marketing/premium-page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { profileTypeLabel, profileTypePluralLabel } from "@/lib/entity-profiles"
import { pageAssets } from "@/lib/page-assets"
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
      "Review public contractor and service-business profiles with verification signals, service-area context, documented project history, and profile claiming paths.",
    primaryLabel: "Search contractor profiles",
  },
  subcontractor: {
    eyebrow: "Subcontractor profiles",
    title: "Find subcontractor and trade professional profiles.",
    description:
      "Review public subcontractor and trade professional profiles for trade scope, GC/sub relationship context, documentation readiness, and payment-chain signals.",
    primaryLabel: "Search subcontractor profiles",
  },
}

type DirectoryRolePresentation = {
  asideEyebrow: string
  asideTitle: string
  asideDescription: string
  asidePoints: string[]
  proofNoun: string
  proofContext: string
  resultDescription: string
  quickStartEyebrow: string
  quickStartTitle: string
  quickStartDescription: string
  quickStartCards: Array<{
    icon: LucideIcon
    title: string
    text: string
  }>
  faqTitle: string
  faqDescription: string
  ctaTitle: string
  ctaDescription: string
  accent: {
    icon: string
    selected: string
    text: string
    panel: string
  }
}

function directoryRolePresentation(profileType?: ProfileType): DirectoryRolePresentation {
  if (profileType === "contractor") {
    return {
      asideEyebrow: "Business trust dossier",
      asideTitle: "Contractor readiness profile",
      asideDescription:
        "Contractor profiles focus on customer-facing businesses: verification, service area, public project history, claim status, and correction rights.",
      asidePoints: [
        "Prime contractors and service businesses",
        "Business verification and service-area signals",
        "Public project context without private files",
      ],
      proofNoun: "Contractor and service-business profiles.",
      proofContext: "Business trust and public project signals.",
      resultDescription:
        "Contractor pages focus on business verification, service-area context, public project records, claim status, and approved profile context. Private identifiers and internal notes stay sealed.",
      quickStartEyebrow: "Contractor trust directory",
      quickStartTitle: "Built for customer-facing businesses and prime contractors.",
      quickStartDescription:
        "Contractor profiles should feel like official business dossiers: what the company does, where it works, how it documents projects, and how it can claim or correct its record.",
      quickStartCards: [
        {
          icon: Building2,
          title: "Business verification",
          text: "Surface claim status, verified-business signals, public contribution history, and profile correction paths.",
        },
        {
          icon: ClipboardCheck,
          title: "Project oversight",
          text: "Frame contractor records around service area, project history, client-facing documentation, and approved public summaries.",
        },
        {
          icon: ShieldCheck,
          title: "Professional trust",
          text: "Show moderated context without turning the profile into a complaint page or open lead marketplace.",
        },
      ],
      faqTitle: "Contractor profiles are business-trust records.",
      faqDescription:
        "These profiles help service businesses and prime contractors show public verification and project context while keeping raw evidence, private contact data, and internal notes out of public view.",
      ctaTitle: "Claim, verify, and strengthen your contractor profile.",
      ctaDescription:
        "Create an account to claim your profile, monitor public context, document client experiences, and keep your business record accurate.",
      accent: {
        icon: "bg-emerald-100 text-emerald-800",
        selected: "border-emerald-700 bg-emerald-700 text-white",
        text: "text-emerald-700",
        panel: "border-emerald-200 bg-emerald-50/60 hover:border-emerald-300",
      },
    }
  }

  if (profileType === "subcontractor") {
    return {
      asideEyebrow: "Trade partner dossier",
      asideTitle: "Subcontractor readiness profile",
      asideDescription:
        "Subcontractor profiles focus on specialty trades, crews, installers, labor providers, project relationships, and documented payment-chain context.",
      asidePoints: [
        "Specialty trades, crews, and installers",
        "GC/sub relationship and scope context",
        "Payment-chain and evidence indicators",
      ],
      proofNoun: "Subcontractor and trade professional profiles.",
      proofContext: "Trade scope, relationship, and documentation signals.",
      resultDescription:
        "Subcontractor pages focus on trade specialization, GC/sub relationship context, scope documentation, payment-chain indicators, and private evidence signals. Raw files and private contact data stay sealed.",
      quickStartEyebrow: "Trade partner directory",
      quickStartTitle: "Built for specialty trades, crews, and project partners.",
      quickStartDescription:
        "Subcontractor profiles answer a different question than contractor profiles: what trade relationship existed, what scope was documented, and what payment-chain context is available.",
      quickStartCards: [
        {
          icon: Wrench,
          title: "Trade specialization",
          text: "Highlight specialty trade, crew, installer, labor-provider, or licensed-subcontractor context.",
        },
        {
          icon: Handshake,
          title: "GC/sub relationship context",
          text: "Separate subcontractor-to-contractor and contractor-to-subcontractor experiences from direct client jobs.",
        },
        {
          icon: ClipboardCheck,
          title: "Payment-chain documentation",
          text: "Emphasize documented scope, retainage/payment context, evidence indicators, and resolution status.",
        },
      ],
      faqTitle: "Subcontractor profiles are trade-partner records.",
      faqDescription:
        "These profiles help businesses understand specialty trade context, project relationships, and payment-chain documentation without exposing raw evidence or private identifiers.",
      ctaTitle: "Claim and verify your trade partner profile.",
      ctaDescription:
        "Create an account to claim your trade profile, document GC/sub relationships, organize evidence, and keep public context accurate.",
      accent: {
        icon: "bg-blue-100 text-blue-800",
        selected: "border-blue-700 bg-blue-700 text-white",
        text: "text-blue-700",
        panel: "border-blue-200 bg-blue-50/60 hover:border-blue-300",
      },
    }
  }

  if (profileType === "client") {
    return {
      asideEyebrow: "Client record context",
      asideTitle: "Client-facing public profiles",
      asideDescription:
        "Client profiles help contractors and service businesses review approved reported experiences before committing labor, materials, schedule, or deposits.",
      asidePoints: [
        "Homeowners, customers, and property owners",
        "Right-of-response visible when approved",
        "Private identifiers and raw evidence stay sealed",
      ],
      proofNoun: "Approved client/customer profiles in this view.",
      proofContext: "Approved client-experience report signals.",
      resultDescription:
        "Client pages show approved context only and never display private phone numbers, emails, street addresses, raw evidence files, pending content, or internal notes.",
      quickStartEyebrow: "Client screening",
      quickStartTitle: "Check the customer before the job starts.",
      quickStartDescription:
        "Client and customer profiles are built for pre-job screening, documented payment context, response rights, and private matching from the dashboard.",
      quickStartCards: [
        {
          icon: Search,
          title: "Search before committing",
          text: "Review public profile context before scheduling labor, ordering materials, or extending payment terms.",
        },
        {
          icon: ShieldCheck,
          title: "Moderated summaries",
          text: "Only approved public summaries appear; raw evidence and private identifiers are not published.",
        },
        {
          icon: BadgeCheck,
          title: "Response rights",
          text: "Clients can respond, dispute, request correction, or provide resolution updates through moderation.",
        },
      ],
      faqTitle: "Client profile discovery without exposing private identifiers.",
      faqDescription:
        "Client profiles help business owners inspect approved reported context while keeping raw evidence and sensitive identifiers private.",
      ctaTitle: "Search a client privately before you take the job.",
      ctaDescription:
        "Create an account to use private matching, save searches, watch client profiles, and document client experiences safely.",
      accent: {
        icon: "bg-amber-100 text-amber-800",
        selected: "border-amber-500 bg-amber-500 text-slate-950",
        text: "text-amber-700",
        panel: "border-amber-200 bg-amber-50/60 hover:border-amber-300",
      },
    }
  }

  return {
    asideEyebrow: "Profile graph",
    asideTitle: "Public role directory",
    asideDescription:
      "Profile pages connect business roles, city/state records, approved report context, response paths, and public-safe verification signals.",
    asidePoints: [
      "Clients, contractors, and subcontractors",
      "Approved public summaries only",
      "Private identifiers and raw evidence stay sealed",
    ],
    proofNoun: "Public-safe profiles available for this view.",
    proofContext: "Approved or connected report signals.",
    resultDescription:
      "Public pages show approved context only and never display private phone numbers, emails, street addresses, raw evidence files, pending content, or internal notes.",
    quickStartEyebrow: "Profile graph",
    quickStartTitle: "One directory, three relationship roles.",
    quickStartDescription:
      "Use Client Bureau public profiles to understand the role someone played in the business relationship before moving into private saved searches, watchlists, contracts, or reports.",
    quickStartCards: [
      {
        icon: UsersRound,
        title: "Clients and customers",
        text: "Homeowners, property owners, business clients, and customers connected to approved contractor-submitted context.",
      },
      {
        icon: Building2,
        title: "Contractor businesses",
        text: "Service businesses and prime contractors with public verification, project, and profile-claiming signals.",
      },
      {
        icon: Hammer,
        title: "Subcontractor trade partners",
        text: "Specialty trades, crews, installers, and labor providers with role-specific project and relationship context.",
      },
    ],
    faqTitle: "Public profile discovery without exposing private records.",
    faqDescription:
      "These directories help people find approved Client Bureau profiles while keeping sensitive information, raw evidence, and internal moderation details private.",
    ctaTitle: "Use public profiles for discovery, then use your private dashboard to act.",
    ctaDescription:
      "Create an account to save searches, watch profiles, build contract packets, organize evidence, open recovery cases, and document client experiences safely.",
    accent: {
      icon: "bg-slate-950 text-amber-300",
      selected: "border-slate-950 bg-slate-950 text-white",
      text: "text-amber-700",
      panel: "border-slate-200 bg-white hover:border-amber-300",
    },
  }
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
  const presentation = directoryRolePresentation(activeType)
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
  const directoryAsset =
    activeType === "contractor"
      ? pageAssets.platformHero
      : activeType === "subcontractor"
        ? pageAssets.evidenceVault
        : activeType === "client"
          ? pageAssets.searchDossier
          : pageAssets.searchDossier

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
            eyebrow={presentation.asideEyebrow}
            title={presentation.asideTitle}
            description={`${visibleProfiles.length} public ${visibleProfiles.length === 1 ? "profile" : "profiles"}. ${presentation.asideDescription}`}
            imageSrc={directoryAsset.src}
            imageAlt={directoryAsset.alt}
            points={presentation.asidePoints}
          />
        }
      />

      <PremiumProofStrip
        dark
        items={[
          { label: "Directory", value: visibleProfiles.length.toLocaleString(), text: presentation.proofNoun },
          { label: "Verification", value: verifiedCount.toLocaleString(), text: "Claimed or verified profile records." },
          { label: "Reports", value: reportCount.toLocaleString(), text: presentation.proofContext },
          { label: "Evidence", value: evidenceCount.toLocaleString(), text: "Profiles with private evidence indicators." },
        ]}
      />

      <section className="bureau-section bg-white">
        <div className="bureau-container grid gap-6 lg:grid-cols-[0.72fr_1fr] lg:items-start">
          <div>
            <p className={`text-sm font-semibold uppercase tracking-[0.16em] ${presentation.accent.text}`}>
              {presentation.quickStartEyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal text-balance text-slate-950 sm:text-4xl">
              {presentation.quickStartTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
              {presentation.quickStartDescription}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {presentation.quickStartCards.map((item) => {
              const Icon = item.icon

              return (
                <Card key={item.title} className={`rounded-md shadow-sm transition hover:-translate-y-0.5 ${presentation.accent.panel}`}>
                  <CardContent className="p-5">
                    <span className={`flex size-11 items-center justify-center rounded-md ${presentation.accent.icon}`}>
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 font-semibold text-slate-950">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

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
                    ? presentation.accent.selected
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
                {results.length} {results.length === 1 ? "profile" : "profiles"} matched. {presentation.resultDescription}
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
                {presentation.faqTitle}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {presentation.faqDescription}
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
        title={presentation.ctaTitle}
        description={presentation.ctaDescription}
        primary={{ href: "/signup", label: "Create account", icon: ShieldCheck }}
        secondary={{ href: "/how-it-works", label: "How it works", icon: FileSearch }}
      />
    </main>
  )
}
