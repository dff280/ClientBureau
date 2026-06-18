import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ClipboardCheck,
  ClipboardList,
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
import { publicDatabasePillars, type PublicDatabasePillar } from "@/lib/public-site"
import { buildSearchHref } from "@/lib/search-experience"
import { tradeCategories, tradeCategoryGroups } from "@/lib/trade-taxonomy"
import { profileTypes, type EntityProfile, type EntityProfileSearchResult, type ProfileType } from "@/lib/types"

type ProfileDirectoryCopy = {
  eyebrow: string
  title: string
  description: string
  primaryLabel: string
}

const directoryCopy: Record<ProfileType | "all", ProfileDirectoryCopy> = {
  all: {
    eyebrow: "Three public databases",
    title: "Browse the Client, Contractor, and Subcontractor databases.",
    description:
      "Client Bureau organizes approved public records into three clear databases: clients, contractors, and subcontractors. Public pages show moderated summaries and safe profile context only.",
    primaryLabel: "Browse all databases",
  },
  client: {
    eyebrow: "Client Database",
    title: "Browse the Client Database.",
    description:
      "Review public client, homeowner, property owner, customer, and business profiles with approved contractor-submitted summaries, response context, evidence-on-file labels, and city/state records.",
    primaryLabel: "Check Client Database",
  },
  contractor: {
    eyebrow: "Contractor Database",
    title: "Browse the Contractor Business Database.",
    description:
      "Review public contractor and service-business profiles with verification signals, service-area context, documented project history, public profile status, and claim paths.",
    primaryLabel: "Open Contractor Database",
  },
  subcontractor: {
    eyebrow: "Subcontractor Database",
    title: "Browse the Subcontractor and Trade Partner Database.",
    description:
      "Review public subcontractor, installer, crew, specialty trade, and vendor profiles for trade scope, GC/sub relationship context, documentation readiness, and payment-chain signals.",
    primaryLabel: "Open Subcontractor Database",
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
        "Contractor pages focus on business verification, service-area context, public project records, claim status, and approved profile context. Private identifiers and staff-only review notes stay sealed.",
      quickStartEyebrow: "Contractor Database",
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
        "These profiles help service businesses and prime contractors show public verification and project context while keeping raw evidence, private contact data, and staff-only review notes out of public view.",
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
      quickStartEyebrow: "Subcontractor Database",
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
        "Client pages show approved context only and never display private phone numbers, emails, street addresses, raw evidence files, pending content, or staff-only review notes.",
      quickStartEyebrow: "Client Database",
      quickStartTitle: "Check the customer before the job starts.",
      quickStartDescription:
        "Client and customer profiles are built for pre-job screening, documented payment context, response rights, and private matching from the dashboard.",
      quickStartCards: [
        {
          icon: Search,
          title: "Check before committing",
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
      ctaTitle: "Check a client privately before you take the job.",
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
    proofNoun: "Public-safe records available across all databases.",
    proofContext: "Approved or connected report signals.",
    resultDescription:
      "Public pages show approved context only and never display private phone numbers, emails, street addresses, raw evidence files, pending content, or staff-only review notes.",
    quickStartEyebrow: "Database graph",
    quickStartTitle: "Three databases, one relationship graph.",
    quickStartDescription:
      "Use Client Bureau public profiles to understand the role someone played in the business relationship before moving into private checks, watchlists, contracts, or reports.",
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
      "Create an account to save checks, watch profiles, build contract packets, organize evidence, open recovery cases, and document client experiences safely.",
    accent: {
      icon: "bg-slate-950 text-amber-300",
      selected: "border-slate-950 bg-slate-950 text-white",
      text: "text-amber-700",
      panel: "border-slate-200 bg-white hover:border-amber-300",
    },
  }
}

function buildReportExperienceHref({
  profileType,
  state,
  tradeCategory,
}: {
  profileType?: ProfileType
  state?: string
  tradeCategory?: string
}) {
  const params = new URLSearchParams()
  if (profileType) params.set("profileType", profileType)
  if (state) params.set("state", state)
  if (tradeCategory) params.set("tradeCategory", tradeCategory)

  return `/submit-report${params.size ? `?${params.toString()}` : ""}`
}

function pillarForProfileType(profileType?: ProfileType) {
  if (profileType === "client") return publicDatabasePillars.find((pillar) => pillar.id === "clients")
  if (profileType === "contractor") return publicDatabasePillars.find((pillar) => pillar.id === "contractors")
  if (profileType === "subcontractor") return publicDatabasePillars.find((pillar) => pillar.id === "subcontractors")

  return undefined
}

function databaseProofItems({
  activeType,
  evidenceCount,
  reportCount,
  verifiedCount,
  visibleCount,
}: {
  activeType?: ProfileType
  evidenceCount: number
  reportCount: number
  verifiedCount: number
  visibleCount: number
}) {
  if (activeType === "contractor") {
    return [
      { label: "Businesses", value: visibleCount.toLocaleString(), text: "Contractors and service companies with public trust profiles." },
      { label: "Verification", value: verifiedCount.toLocaleString(), text: "Claimed or verified records with correction paths." },
      { label: "Project context", value: reportCount.toLocaleString(), text: "Approved summaries tied to business and service history." },
      { label: "Evidence labels", value: evidenceCount.toLocaleString(), text: "Private evidence indicators without raw file exposure." },
    ]
  }

  if (activeType === "subcontractor") {
    return [
      { label: "Trade partners", value: visibleCount.toLocaleString(), text: "Specialty trades, crews, installers, vendors, and subs." },
      { label: "Trade proof", value: verifiedCount.toLocaleString(), text: "Claimed or verified records with role-specific context." },
      { label: "Payment chain", value: reportCount.toLocaleString(), text: "Approved summaries involving scope, retainage, or GC/sub context." },
      { label: "Evidence readiness", value: evidenceCount.toLocaleString(), text: "Private evidence indicators for scope and payment-chain review." },
    ]
  }

  if (activeType === "client") {
    return [
      { label: "Client records", value: visibleCount.toLocaleString(), text: "Homeowners, customers, property owners, and business clients." },
      { label: "Response paths", value: verifiedCount.toLocaleString(), text: "Profiles with claim, correction, or response context when available." },
      { label: "Reports", value: reportCount.toLocaleString(), text: "Approved positive, concern, dispute, and resolution summaries." },
      { label: "Evidence", value: evidenceCount.toLocaleString(), text: "Private evidence indicators without raw identifiers." },
    ]
  }

  return [
    { label: "Profiles", value: visibleCount.toLocaleString(), text: "Public records across all approved profile types." },
    { label: "Claimed", value: verifiedCount.toLocaleString(), text: "Claimed or verified records with correction paths." },
    { label: "Reports", value: reportCount.toLocaleString(), text: "Approved public summaries across the relationship graph." },
    { label: "Evidence", value: evidenceCount.toLocaleString(), text: "Profiles with private evidence indicators." },
  ]
}

export function getProfileDirectoryFaqs(profileType?: ProfileType) {
  const pillar = pillarForProfileType(profileType)

  if (pillar) {
    return [
      ...pillar.faqs,
      {
        question: `What public signals appear in the ${pillar.label}?`,
        answer:
          `${pillar.label} pages can show ${pillar.publicSignals.slice(0, 3).join(", ").toLowerCase()}, and public-safe next steps. ${pillar.privacyNote}`,
      },
    ]
  }

  const profileLabel = profileType ? profileTypePluralLabel(profileType).toLowerCase() : "public profiles"

  return [
    {
      question: `What appears in ${profileLabel}?`,
      answer:
        "Client Bureau profile directories show public-safe profile records, city/state context, verification signals, approved report indicators, and response paths. Raw private identifiers and raw evidence are not displayed.",
    },
    {
      question: "Can I check contractors, subcontractors, and clients?",
      answer:
        "Yes. Client Bureau has separate public database views for clients, contractors, service businesses, subcontractors, and trade professionals when those records are approved for public display.",
    },
    {
      question: "When should I use a private client check instead?",
      answer:
        "Use the private dashboard check when you need saved searches, watchlists, private matching, or account-specific actions. Public directories are designed for approved profile discovery and SEO-safe browsing.",
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
  tradeCategory,
  query,
}: {
  activeType?: ProfileType
  allProfiles: EntityProfile[]
  results: EntityProfileSearchResult[]
  searchPath: string
  state?: string
  states: string[]
  tradeCategory?: string
  query: string
}) {
  const copy = directoryCopy[activeType ?? "all"]
  const presentation = directoryRolePresentation(activeType)
  const matchesActiveType = (profile: EntityProfile, type: ProfileType) =>
    profile.profileType === type || Boolean(profile.accountCapabilities?.includes(type))
  const visibleProfiles = activeType
    ? allProfiles.filter((profile) => matchesActiveType(profile, activeType))
    : allProfiles
  const profileCounts = profileTypes.map((type) => ({
    href: `/profiles/${type}`,
    label: profileTypePluralLabel(type),
    type,
    value: allProfiles.filter((profile) => matchesActiveType(profile, type)).length,
  }))
  const verifiedCount = visibleProfiles.filter((profile) =>
    ["claimed", "verified"].includes(profile.claimedStatus),
  ).length
  const evidenceCount = visibleProfiles.filter((profile) => profile.evidenceOnFileCount > 0).length
  const reportCount = visibleProfiles.reduce((total, profile) => total + profile.reportCount, 0)
  const showTradeFilter = activeType === "contractor" || activeType === "subcontractor"
  const hasDirectoryFilters = Boolean(query || state || tradeCategory)
  const directoryAsset =
    activeType === "contractor"
      ? pageAssets.platformHero
      : activeType === "subcontractor"
        ? pageAssets.evidenceVault
        : activeType === "client"
          ? pageAssets.searchDossier
          : pageAssets.searchDossier
  const privateSearchHref = buildSearchHref({
    query,
    state,
    profileType: activeType,
    tradeCategory: showTradeFilter ? tradeCategory : undefined,
  })
  const reportExperienceHref = buildReportExperienceHref({
    profileType: activeType,
    state,
    tradeCategory: showTradeFilter ? tradeCategory : undefined,
  })
  const activePillar = pillarForProfileType(activeType)
  const proofItems = databaseProofItems({
    activeType,
    evidenceCount,
    reportCount,
    verifiedCount,
    visibleCount: visibleProfiles.length,
  })

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
        items={proofItems}
      />
      <section id="profile-directory" className="bureau-section">
        <div className="bureau-container space-y-6">
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-5 p-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase text-amber-700">Database check</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
                    Check by name, business, trade, city, or state.
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    Use this public database view for broad profile discovery. Use the private dashboard search when private matching, saved searches, and watchlists matter.
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link href={privateSearchHref}>
                    <FileSearch aria-hidden="true" />
                    Open private check
                  </Link>
                </Button>
              </div>

              <form action={searchPath} className={showTradeFilter ? "grid gap-3 lg:grid-cols-[1fr_150px_220px_auto]" : "grid gap-3 lg:grid-cols-[1fr_150px_180px_auto]"}>
                <input
                  aria-label="Check public profiles"
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
                {showTradeFilter ? (
                  <select
                    aria-label="Filter trade category"
                    className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-sm"
                    defaultValue={tradeCategory ?? ""}
                    name="tradeCategory"
                  >
                    <option value="">All trades</option>
                    {tradeCategoryGroups.map((group) => {
                      const groupOptions = tradeCategories.filter((category) =>
                        category.group === group &&
                        (!activeType || category.profileTypes.some((type) => type === activeType)),
                      )
                      if (groupOptions.length === 0) return null

                      return (
                        <optgroup key={group} label={group}>
                          {groupOptions.map((category) => (
                            <option key={category.slug} value={category.label}>
                              {category.label}
                            </option>
                          ))}
                        </optgroup>
                      )
                    })}
                  </select>
                ) : null}
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
              <DatabaseTrustNote
                items={[
                  "Approved profiles only",
                  "Private identifiers hidden",
                  "No raw evidence files",
                  activeType === "subcontractor" ? "Trade context separated" : "Response rights available",
                ]}
              />
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
              <p className="text-sm font-semibold uppercase text-amber-700">Database results</p>
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
                <h3 className="mt-4 text-xl font-semibold text-slate-950">
                  {activeType === "subcontractor" && !hasDirectoryFilters
                    ? "No verified public trade profiles in this market yet."
                    : activeType === "subcontractor"
                      ? "No verified public trade profiles matched those filters."
                      : "No public profiles matched those filters."}
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  {activeType === "subcontractor" && !hasDirectoryFilters
                    ? "Verified trade profiles appear only after staff confirm identity, trade scope, public-safe summary, claim status, and visibility. Unverified records stay private."
                    : activeType === "subcontractor"
                      ? "Verified trade profiles appear after claim, moderation, and public visibility review. You can claim a trade profile, report a documented GC/sub experience, or use private checks for saved-search and watchlist actions."
                      : "Clear the search, choose another state, or use the private check workflow for account-level saved searches and watchlist actions."}
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                    <Link href={searchPath}>
                      <Building2 aria-hidden="true" />
                      Clear filters
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={privateSearchHref}>Open private check</Link>
                  </Button>
                  {activeType === "subcontractor" ? (
                    <>
                      <Button asChild variant="outline">
                        <Link href="/claim-profile?profileType=subcontractor">Claim trade profile</Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href={reportExperienceHref}>Report trade experience</Link>
                      </Button>
                    </>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          )}

          <DatabaseReadingSection
            presentation={presentation}
            activeType={activeType}
          />

          {activePillar ? (
            <DatabaseAuthorityPanel
              pillar={activePillar}
              profileCount={visibleProfiles.length}
              verifiedCount={verifiedCount}
              reportCount={reportCount}
              evidenceCount={evidenceCount}
            />
          ) : (
            <AllDatabasesAuthorityPanel
              clientCount={profileCounts.find((item) => item.type === "client")?.value ?? 0}
              contractorCount={profileCounts.find((item) => item.type === "contractor")?.value ?? 0}
              subcontractorCount={profileCounts.find((item) => item.type === "subcontractor")?.value ?? 0}
            />
          )}
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

function DatabaseAuthorityPanel({
  evidenceCount,
  pillar,
  profileCount,
  reportCount,
  verifiedCount,
}: {
  evidenceCount: number
  pillar: PublicDatabasePillar
  profileCount: number
  reportCount: number
  verifiedCount: number
}) {
  return (
    <section className="border-y border-slate-200 bg-slate-50 py-8 sm:py-10">
      <div className="bureau-container grid gap-5 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
              Database authority
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">
              {pillar.authorityTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{pillar.authorityDescription}</p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <AuthorityMetric label="Profiles" value={profileCount.toLocaleString()} />
              <AuthorityMetric label="Verified/claimed" value={verifiedCount.toLocaleString()} />
              <AuthorityMetric label="Approved reports" value={reportCount.toLocaleString()} />
              <AuthorityMetric label="Evidence labels" value={evidenceCount.toLocaleString()} />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="grid gap-5 p-5 sm:p-6 lg:grid-cols-2">
              <DatabaseList title="Public signals" items={pillar.publicSignals} />
              <DatabaseList title="How to read records" items={pillar.recordsExplained} />
            </CardContent>
          </Card>
          <div className="grid gap-3 md:grid-cols-2">
            {pillar.internalLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-md border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300"
              >
                <p className="text-sm font-semibold text-slate-950">{item.label}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-amber-700">
                  Open page
                  <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function DatabaseReadingSection({
  activeType,
  presentation,
}: {
  activeType?: ProfileType
  presentation: DirectoryRolePresentation
}) {
  return (
    <section className="grid gap-5 rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:grid-cols-[0.68fr_1.32fr] lg:items-start">
      <div>
        <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${presentation.accent.text}`}>
          {presentation.quickStartEyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">
          {presentation.quickStartTitle}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {presentation.quickStartDescription}
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {presentation.quickStartCards.map((item) => {
          const Icon = item.icon

          return (
            <div key={item.title} className={`rounded-md border p-4 ${presentation.accent.panel}`}>
              <span className={`flex size-10 items-center justify-center rounded-md ${presentation.accent.icon}`}>
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-3 font-semibold text-slate-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
            </div>
          )
        })}
      </div>
      {activeType === "subcontractor" ? (
        <div className="lg:col-span-2">
          <SubcontractorReadingGuide />
        </div>
      ) : null}
    </section>
  )
}

function DatabaseTrustNote({ items }: { items: string[] }) {
  return (
    <div className="grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item} className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <ShieldCheck className="size-4 shrink-0 text-emerald-700" aria-hidden="true" />
          <span>{item}</span>
        </div>
      ))}
    </div>
  )
}

function AllDatabasesAuthorityPanel({
  clientCount,
  contractorCount,
  subcontractorCount,
}: {
  clientCount: number
  contractorCount: number
  subcontractorCount: number
}) {
  const counts = {
    clients: clientCount,
    contractors: contractorCount,
    subcontractors: subcontractorCount,
  } as const

  return (
    <section className="border-y border-slate-200 bg-slate-50 py-8 sm:py-10">
      <div className="bureau-container">
        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardContent className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[0.62fr_1.38fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                Public database authority
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">
                Three databases, one relationship graph.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Client Bureau separates client checks, contractor business trust, and subcontractor trade-partner context
                so each public page answers a different business question without exposing private records.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {publicDatabasePillars.map((pillar) => (
                <Link
                  key={pillar.id}
                  href={pillar.href}
                  className="rounded-md border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-white"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                    {counts[pillar.id].toLocaleString()} profiles
                  </p>
                  <h3 className="mt-2 font-semibold text-slate-950">{pillar.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{pillar.primaryIntent}</p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function DatabaseList({ items, title }: { items: string[]; title: string }) {
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

function AuthorityMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  )
}

function SubcontractorReadingGuide() {
  const items = [
    {
      icon: Wrench,
      title: "Trade scope",
      text: "Look for the specialty trade, crew role, installer type, labor-provider context, or licensed-subcontractor category.",
    },
    {
      icon: Handshake,
      title: "Relationship path",
      text: "Read whether the record involves subcontractor-to-contractor, contractor-to-subcontractor, or business-to-business project context.",
    },
    {
      icon: ClipboardList,
      title: "Payment-chain signals",
      text: "Retainage, pay applications, draw requests, milestone billing, and resolution status matter more here than customer-facing review language.",
    },
    {
      icon: ShieldCheck,
      title: "Private evidence",
      text: "Public pages can show evidence-on-file labels, but raw contracts, invoices, photos, messages, and staff notes stay private.",
    },
  ]

  return (
    <Card className="overflow-hidden rounded-md border-blue-200 bg-gradient-to-br from-blue-50 via-white to-slate-50 shadow-sm">
      <CardContent className="p-5">
        <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
              How to read subcontractor profiles
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
              This is a trade-partner record, not a customer review page.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Subcontractors, installers, crews, and specialty trades carry different risk than customer-facing contractors.
              Client Bureau separates trade scope, relationship documentation, payment-chain context, and private evidence indicators.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {items.map((item) => {
              const Icon = item.icon

              return (
                <div key={item.title} className="rounded-md border border-blue-100 bg-white/80 p-4 shadow-sm">
                  <span className="flex size-10 items-center justify-center rounded-md bg-blue-100 text-blue-800">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-3 font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
