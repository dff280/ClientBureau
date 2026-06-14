import type { Metadata } from "next"
import Link from "next/link"
import {
  AlertTriangle,
  BadgeCheck,
  BriefcaseBusiness,
  ClipboardCheck,
  Eye,
  EyeOff,
  FileCheck2,
  GitMerge,
  Search,
  ShieldCheck,
  UserCheck,
  UsersRound,
  Wrench,
  type LucideIcon,
} from "lucide-react"

import { AdminActionOutcomePanel, AdminFilterBar, AdminProfileHealthCard } from "@/components/admin/admin-crm-ui"
import { AdminProfileGraphActions } from "@/components/admin/admin-profile-graph-actions"
import {
  AdminPageHeader,
  DashboardSection,
  EmptyState,
  HeaderActionButton,
  StatCard,
  StatusBadge,
} from "@/components/dashboard/dashboard-ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { claimedStatusLabel, deriveEntityProfiles, entityProfileHref, profileSupportsType, profileTypeLabel } from "@/lib/entity-profiles"
import { getAdminWorkspaceDataService, getProfileClaimsService, getPublicBusinessProfilesService } from "@/lib/repositories/client-bureau-service"
import { tradeCategories, tradeCategoryGroups, tradeCategoryMatches } from "@/lib/trade-taxonomy"
import { profileTypes, verificationLevels, type EntityProfile, type ProfileClaim, type ProfileType } from "@/lib/types"

export const metadata: Metadata = {
  title: "Admin Unified Profiles",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

type AdminProfilesSearchParams = Promise<{
  q?: string
  type?: string
  status?: string
  tradeCategory?: string
  visibility?: string
  verification?: string
}>

function toProfileType(value?: string): ProfileType | undefined {
  return profileTypes.includes(value as ProfileType) ? (value as ProfileType) : undefined
}

export default async function AdminProfilesPage({ searchParams }: { searchParams: AdminProfilesSearchParams }) {
  const params = await searchParams
  const [data, businesses, claims] = await Promise.all([
    getAdminWorkspaceDataService(),
    getPublicBusinessProfilesService().catch(() => []),
    getProfileClaimsService().catch(() => []),
  ])
  const profiles = deriveEntityProfiles({
    clients: data.clients,
    contractors: data.contractors,
    reports: data.reports,
    publicBusinesses: businesses,
  })
  const query = params.q?.trim().toLowerCase() ?? ""
  const type = toProfileType(params.type)
  const status = params.status ?? "all"
  const claimStatus = status === "public" || status === "private" ? "all" : status
  const visibility = params.visibility ?? (status === "public" || status === "private" ? status : "all")
  const verification = params.verification ?? "all"
  const tradeCategory = params.tradeCategory?.trim() || undefined
  const filteredProfiles = profiles.filter((profile) => {
    const haystack = [
      profile.displayName,
      profile.businessName,
      profile.city,
      profile.state,
      profile.slug,
      profile.profileType,
      profile.profileSubtype,
      profile.tradeCategory,
      profile.claimedStatus,
      profile.verificationLevel,
      profile.duplicateGroupKey,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
    const tradeText = [
      profile.displayName,
      profile.businessName,
      profile.profileSubtype,
      profile.tradeCategory,
      profile.publicSummary,
    ]
      .filter(Boolean)
      .join(" ")
    const matchesVisibility =
      visibility === "all" ||
      (visibility === "public" ? profile.isPublic : visibility === "private" ? !profile.isPublic : true)
    const matchesVerification =
      verification === "all" ||
      profile.verificationLevel === verification ||
      (verification === "verified" &&
        (["claimed", "verified"].includes(profile.claimedStatus) || Boolean(profile.verificationBadges?.length))) ||
      (verification === "needs_review" &&
        !["claimed", "verified"].includes(profile.claimedStatus) &&
        !profile.verificationBadges?.length)

    return (
      (!query || haystack.includes(query)) &&
      (!type || profileSupportsType(profile, type)) &&
      (!tradeCategory || tradeCategoryMatches(tradeText, tradeCategory)) &&
      (claimStatus === "all" || profile.claimedStatus === claimStatus) &&
      matchesVisibility &&
      matchesVerification
    )
  })
  const publicCount = profiles.filter((profile) => profile.isPublic).length
  const claimedCount = profiles.filter((profile) => profile.claimedStatus === "claimed" || profile.claimedStatus === "verified").length
  const subcontractorProfiles = profiles.filter((profile) => profileSupportsType(profile, "subcontractor"))
  const publicSubcontractorCount = subcontractorProfiles.filter((profile) => profile.isPublic).length
  const verifiedSubcontractorCount = subcontractorProfiles.filter((profile) =>
    ["claimed", "verified"].includes(profile.claimedStatus) || profile.verificationBadges?.length,
  ).length
  const subcontractorLaunchReadyCount = subcontractorProfiles.filter((profile) =>
    subcontractorLaunchReadiness(profile).ready,
  ).length
  const subcontractorLaunchCandidates = subcontractorProfiles
    .map((profile) => ({
      profile,
      readiness: subcontractorLaunchReadiness(profile),
    }))
    .sort((a, b) => b.readiness.score - a.readiness.score || Number(b.profile.isPublic) - Number(a.profile.isPublic))
    .slice(0, 4)
  const duplicateGroups = profiles.reduce<Record<string, EntityProfile[]>>((groups, profile) => {
    if (!profile.duplicateGroupKey) return groups
    groups[profile.duplicateGroupKey] = [...(groups[profile.duplicateGroupKey] ?? []), profile]
    return groups
  }, {})
  const duplicateGroupCount = Object.values(duplicateGroups).filter((group) => group.length > 1).length
  const duplicateSignals = profiles.filter((profile) => {
    if (!profile.duplicateGroupKey) return false
    return (duplicateGroups[profile.duplicateGroupKey]?.length ?? 0) > 1
  }).length
  const pendingClaimCount = claims.filter((claim) => claim.status === "pending").length
  const disputedClaimCount = claims.filter((claim) => claim.status === "disputed").length
  const disputedProfileCount = profiles.filter((profile) => profile.claimedStatus === "disputed" || profile.disputedReportCount > 0).length
  const privateProfileCount = profiles.filter((profile) => !profile.isPublic).length
  const redactionCount = profiles.filter(
    (profile) => profile.redactionNote || Object.keys(profile.publicFieldRedactions ?? {}).length > 0,
  ).length
  const evidenceGapCount = profiles.filter((profile) => profile.reportCount > 0 && profile.evidenceOnFileCount === 0).length
  const responseGapCount = profiles.filter(
    (profile) => profile.profileType === "client" && profile.isPublic && profile.responseCount === 0,
  ).length
  const pendingClaims = claims.filter((claim) => ["pending", "disputed"].includes(claim.status)).slice(0, 4)
  const priorityProfiles = [...profiles]
    .filter((profile) => profilePriority(profile, duplicateGroups) > 0)
    .sort((a, b) => profilePriority(b, duplicateGroups) - profilePriority(a, duplicateGroups))
    .slice(0, 6)

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <AdminPageHeader
          eyebrow="Records"
          title="Unified Profile CRM"
          description="Manage the broader Client Bureau profile layer across clients, contractors, subcontractors, claims, public visibility, duplicate signals, and report assignment context."
          actions={
            <>
              <HeaderActionButton href="/admin/clients" variant="outline">
                <UsersRound aria-hidden="true" />
                Client records
              </HeaderActionButton>
              <HeaderActionButton href="/admin/contractors" variant="outline">
                <ShieldCheck aria-hidden="true" />
                Business records
              </HeaderActionButton>
            </>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Unified profiles" value={profiles.length} helper="Clients, contractors, and subcontractors" icon={UsersRound} tone="slate" />
          <StatCard label="Public profiles" value={publicCount} helper="SEO-visible approved or business records" icon={Eye} tone="emerald" />
          <StatCard label="Claimed / verified" value={claimedCount} helper="Owned or verified profile context" icon={BadgeCheck} tone="blue" />
          <StatCard label="Pending claims" value={pendingClaimCount} helper="Claims awaiting verification review" icon={BadgeCheck} tone="amber" />
          <StatCard label="Graph signals" value={duplicateSignals} helper={`${duplicateGroupCount} duplicate group${duplicateGroupCount === 1 ? "" : "s"} need review`} icon={GitMerge} tone={duplicateSignals > 0 ? "amber" : "slate"} />
        </div>

        <DashboardSection
          eyebrow="Subcontractor launch readiness"
          title="Prepare the first verified trade-professional profile"
          description="Client Bureau should publish only real subcontractor or trade-professional records. Use this checklist before acquisition campaigns point at the subcontractor directory."
        >
          <div className="grid gap-3 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="rounded-md border border-blue-200 bg-blue-50 p-5 text-blue-950">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Trade inventory</p>
                  <p className="mt-2 text-3xl font-semibold">{publicSubcontractorCount}</p>
                  <p className="mt-1 text-sm leading-6">
                    Public subcontractor-capable profiles currently available. Live SEO warns until at least one real verified trade profile is published.
                  </p>
                </div>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-white text-blue-800">
                  <Wrench className="size-5" aria-hidden="true" />
                </span>
              </div>
              <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <ProfileFact label="Total trade records" value={subcontractorProfiles.length} />
                <ProfileFact label="Claimed / verified" value={verifiedSubcontractorCount} />
                <ProfileFact label="Launch-ready" value={subcontractorLaunchReadyCount} />
                <ProfileFact label="Rating model" value="Trade Partner" />
              </dl>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <LaunchChecklistCard
                icon={BriefcaseBusiness}
                title="Identity is real"
                detail="Use a real subcontractor, installer, crew, labor provider, or specialty trade. Do not create placeholder records for SEO."
              />
              <LaunchChecklistCard
                icon={ClipboardCheck}
                title="Trade scope is clear"
                detail="Set subtype, trade category, city/state, service area context, and public-safe summary before publishing."
              />
              <LaunchChecklistCard
                icon={ShieldCheck}
                title="Verification is documented"
                detail="Confirm claim status, business relationship, license/insurance indicators where available, and moderator note."
              />
              <LaunchChecklistCard
                icon={Eye}
                title="Public output is safe"
                detail="Preview the public profile and confirm no raw email, phone, address, evidence path, private contract data, or admin note appears."
              />
            </div>
          </div>
          <div className="mt-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">First verified profile queue</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-950">Subcontractor records closest to launch-ready</h3>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                  Publish only after the record represents a real trade business, has a safe public summary, and includes a moderator note for the decision.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/admin/profiles?type=subcontractor&visibility=public">
                  <Search aria-hidden="true" />
                  View trade candidates
                </Link>
              </Button>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {subcontractorLaunchCandidates.map(({ profile, readiness }) => (
                <SubcontractorLaunchCandidateCard
                  key={profile.id}
                  profile={profile}
                  readiness={readiness}
                />
              ))}
              {subcontractorLaunchCandidates.length === 0 ? (
                <div className="lg:col-span-2">
                  <EmptyState
                    icon={Wrench}
                    title="No subcontractor-capable profiles yet"
                    description="Real trade-professional records will appear here after claim, report, business, or profile data creates a subcontractor-capable profile."
                  />
                </div>
              ) : null}
            </div>
          </div>
        </DashboardSection>

        <DashboardSection
          eyebrow="Daily identity queue"
          title="What needs profile staff attention today"
          description="A fast operator view for claim verification, duplicate cleanup, private/public visibility, redactions, evidence gaps, and response/dispute context."
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <IdentityQueueCard
              icon={UserCheck}
              title="Claims to verify"
              value={pendingClaimCount}
              detail="Ownership or relationship claims waiting for staff review and a moderator note."
              tone={pendingClaimCount > 0 ? "amber" : "emerald"}
            />
            <IdentityQueueCard
              icon={GitMerge}
              title="Duplicate groups"
              value={duplicateGroupCount}
              detail="Groups with more than one matching profile signal that may need merge or reassignment review."
              tone={duplicateGroupCount > 0 ? "amber" : "slate"}
            />
            <IdentityQueueCard
              icon={AlertTriangle}
              title="Dispute context"
              value={disputedProfileCount + disputedClaimCount}
              detail="Profiles or claims with dispute context that should be reviewed before public changes."
              tone={disputedProfileCount + disputedClaimCount > 0 ? "rose" : "slate"}
            />
            <IdentityQueueCard
              icon={EyeOff}
              title="Private profiles"
              value={privateProfileCount}
              detail="Profiles not currently visible in public directories or SEO surfaces."
              tone={privateProfileCount > 0 ? "blue" : "slate"}
            />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <IdentityQueueCard
              icon={FileCheck2}
              title="Evidence gaps"
              value={evidenceGapCount}
              detail="Profiles with reports but no evidence-on-file label yet."
              tone={evidenceGapCount > 0 ? "amber" : "emerald"}
              compact
            />
            <IdentityQueueCard
              icon={ClipboardCheck}
              title="Response opportunities"
              value={responseGapCount}
              detail="Public client profiles with no approved response or correction context."
              tone={responseGapCount > 0 ? "blue" : "slate"}
              compact
            />
            <IdentityQueueCard
              icon={ShieldCheck}
              title="Redaction records"
              value={redactionCount}
              detail="Profiles with public-field redaction or private display notes on file."
              tone={redactionCount > 0 ? "amber" : "slate"}
              compact
            />
          </div>
        </DashboardSection>

        <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <DashboardSection
            eyebrow="Claim verification"
            title="Profile claims needing a decision"
            description="Claims should be approved, rejected, or disputed only after identity, business relationship, and verification details are reviewed."
          >
            <div className="grid gap-3">
              {pendingClaims.map((claim) => (
                <ClaimQueueCard
                  key={claim.id}
                  claim={claim}
                  profile={profiles.find((profile) => profile.id === claim.profileId)}
                />
              ))}
              {pendingClaims.length === 0 ? (
                <EmptyState
                  icon={BadgeCheck}
                  title="No profile claims need review"
                  description="Pending or disputed profile ownership claims will appear here with verification context."
                />
              ) : null}
            </div>
          </DashboardSection>

          <DashboardSection
            eyebrow="Profile cleanup"
            title="Identity records to inspect"
            description="Prioritize records with duplicate groups, disputes, evidence gaps, redaction notes, or report context that is not ready for public visibility."
          >
            <div className="grid gap-3 md:grid-cols-2">
              {priorityProfiles.map((profile) => (
                <ProfilePriorityCard
                  key={profile.id}
                  profile={profile}
                  duplicateCount={profile.duplicateGroupKey ? duplicateGroups[profile.duplicateGroupKey]?.length ?? 0 : 0}
                />
              ))}
              {priorityProfiles.length === 0 ? (
                <div className="md:col-span-2">
                  <EmptyState
                    icon={ShieldCheck}
                    title="No profile cleanup priorities"
                    description="Duplicate, redaction, evidence, dispute, or visibility-priority profiles will appear here."
                  />
                </div>
              ) : null}
            </div>
          </DashboardSection>
        </div>

        <AdminProfileGraphActions profiles={profiles} claims={claims} reports={data.reports} />

        <AdminActionOutcomePanel
          title="After changing unified profile graph records"
          description="Profile graph actions should make identities cleaner, claims more accountable, and report assignment safer without exposing private records."
          items={[
            {
              detail: "Claim approvals, rejections, disputes, duplicate grouping, and reassignment should leave the profile easier to understand.",
              label: "Graph quality",
              status: "Cleaner",
              title: "The profile relationship should be clearer",
              tone: "blue",
            },
            {
              detail: "Report reassignment, merges, and redactions should never publish pending content, raw evidence, contact details, or internal notes.",
              label: "Privacy",
              status: "Sealed",
              title: "Public output should remain safe",
              tone: "emerald",
            },
            {
              detail: "Each claim, merge, reassignment, or redaction needs a moderator note that explains the evidence and decision context.",
              label: "Audit",
              status: "Required",
              title: "The action should be defensible",
              tone: "amber",
            },
          ]}
        />

        <AdminFilterBar
          title="Find public records and claim targets"
          description="Search by name, business, city, state, slug, type, trade category, visibility, claim status, or verification status."
        >
          <form className="grid w-full gap-2 sm:w-auto xl:grid-cols-[210px_150px_190px_135px_150px_175px_auto]">
            <Input name="q" defaultValue={params.q} placeholder="Search profiles" aria-label="Search unified profiles" />
            <select name="type" defaultValue={type ?? "all"} className="h-10 rounded-md border border-input bg-white px-3 text-sm">
              <option value="all">All types</option>
              {profileTypes.map((item) => (
                <option key={item} value={item}>{profileTypeLabel(item)}</option>
              ))}
            </select>
            <select name="tradeCategory" defaultValue={tradeCategory ?? ""} className="h-10 rounded-md border border-input bg-white px-3 text-sm">
              <option value="">All trades</option>
              {tradeCategoryGroups.map((group) => {
                const groupOptions = tradeCategories.filter((category) => category.group === group)
                if (groupOptions.length === 0) return null

                return (
                  <optgroup key={group} label={group}>
                    {groupOptions.map((category) => (
                      <option key={category.slug} value={category.label}>{category.label}</option>
                    ))}
                  </optgroup>
                )
              })}
            </select>
            <select name="visibility" defaultValue={visibility} className="h-10 rounded-md border border-input bg-white px-3 text-sm">
              <option value="all">All visibility</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            <select name="status" defaultValue={claimStatus} className="h-10 rounded-md border border-input bg-white px-3 text-sm">
              <option value="all">All claims</option>
              <option value="claimed">Claimed</option>
              <option value="claim_pending">Claim pending</option>
              <option value="unclaimed">Unclaimed</option>
              <option value="disputed">Disputed</option>
              <option value="verified">Verified</option>
            </select>
            <select name="verification" defaultValue={verification} className="h-10 rounded-md border border-input bg-white px-3 text-sm">
              <option value="all">All verification</option>
              <option value="verified">Any verified signal</option>
              <option value="needs_review">Needs review</option>
              {verificationLevels.map((level) => (
                <option key={level} value={level}>{level.replaceAll("_", " ")}</option>
              ))}
            </select>
            <Button className="bg-slate-950 text-white hover:bg-slate-800">
              <Search aria-hidden="true" />
              Filter
            </Button>
          </form>
        </AdminFilterBar>

        <div className="grid gap-4 xl:grid-cols-2">
          {filteredProfiles.map((profile) => {
            const editHref =
              profile.profileType === "client" && profile.legacyClientId
                ? `/admin/clients?q=${encodeURIComponent(profile.displayName)}`
                : profile.legacyContractorId
                  ? `/admin/contractors?q=${encodeURIComponent(profile.displayName)}`
                  : "/admin/settings"

            return (
              <AdminProfileHealthCard
                key={profile.id}
                title={profile.displayName}
                subtitle={`${profileTypeLabel(profile.profileType)} / ${profile.city}, ${profile.state}`}
                badge={profile.isPublic ? "Public" : "Private"}
                tone={profile.isPublic ? "emerald" : profile.claimedStatus === "disputed" ? "rose" : "slate"}
                facts={[
                  { label: "Claim status", value: claimedStatusLabel(profile.claimedStatus) },
                  { label: "Subtype", value: String(profile.profileSubtype ?? "General profile") },
                  { label: "Trade category", value: profile.tradeCategory ?? String(profile.profileSubtype ?? "Not set") },
                  { label: "Verification", value: profile.verificationBadges?.length ? profile.verificationBadges.join(", ") : profile.verificationLevel ?? "Moderation only" },
                  { label: "Capabilities", value: profile.accountCapabilities?.length ? profile.accountCapabilities.map(profileTypeLabel).join(", ") : profileTypeLabel(profile.profileType) },
                  { label: "Rating / band", value: `${profile.ratingScore} / ${profile.ratingBand}` },
                  { label: "Reports", value: profile.reportCount },
                  { label: "Positive reports", value: profile.positiveReportCount },
                  { label: "Evidence", value: profile.evidenceOnFileCount > 0 ? "Private evidence on file" : "No evidence label yet" },
                  { label: "Duplicate key", value: profile.duplicateGroupKey ?? "Not generated" },
                  { label: "Redaction", value: profile.redactionNote ? "Redaction note on file" : "No public redaction note" },
                  { label: "Slug", value: profile.slug },
                ]}
                actions={
                  <>
                    <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                      <Link href={editHref}>
                        <ShieldCheck aria-hidden="true" />
                        Manage record
                      </Link>
                    </Button>
                    {profile.isPublic ? (
                      <Button asChild variant="outline">
                        <Link href={entityProfileHref(profile, type)} target="_blank">
                          <Eye aria-hidden="true" />
                          Public profile
                        </Link>
                      </Button>
                    ) : null}
                    <Button asChild variant="outline">
                      <Link href="/admin/reports">
                        <GitMerge aria-hidden="true" />
                        Reassign reports
                      </Link>
                    </Button>
                  </>
                }
              />
            )
          })}
          {filteredProfiles.length === 0 ? (
            <div className="xl:col-span-2">
              <EmptyState
                icon={Search}
                title="No profiles match"
                description="Clear filters or search another name, business, city, state, profile type, or claim status."
              />
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-md border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-semibold uppercase text-amber-800">Duplicate review</p>
            <p className="mt-2 text-sm leading-6 text-amber-950">
              Use duplicate keys to group similar names, businesses, and cities before merging. Merges must preserve
              audit history and keep reports connected to the correct project/job record.
            </p>
          </div>
          <div className="rounded-md border border-blue-200 bg-blue-50 p-5">
            <p className="text-sm font-semibold uppercase text-blue-800">Report reassignment</p>
            <p className="mt-2 text-sm leading-6 text-blue-950">
              Reassignment should move reports between profile and project records only after confirming relationship,
              location, and evidence context. Public pages should update after moderation approval.
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase text-slate-500">Public/private redaction</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Public records may show city, state, moderated summaries, confidence labels, and evidence-on-file
              indicators. Emails, phones, street addresses, raw files, notes, contracts, invoices, and IDs stay private.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function LaunchChecklistCard({
  icon: Icon,
  title,
  detail,
}: {
  icon: LucideIcon
  title: string
  detail: string
}) {
  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <span className="flex size-10 items-center justify-center rounded-md bg-blue-100 text-blue-800">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h3 className="mt-3 font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
    </article>
  )
}

function IdentityQueueCard({
  icon: Icon,
  title,
  value,
  detail,
  tone,
  compact = false,
}: {
  icon: LucideIcon
  title: string
  value: number
  detail: string
  tone: "slate" | "amber" | "emerald" | "rose" | "blue"
  compact?: boolean
}) {
  const toneClass = {
    slate: "border-slate-200 bg-slate-50 text-slate-950",
    amber: "border-amber-200 bg-amber-50 text-amber-950",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-950",
    rose: "border-rose-200 bg-rose-50 text-rose-950",
    blue: "border-sky-200 bg-sky-50 text-sky-950",
  }[tone]

  return (
    <article className={`rounded-md border p-4 ${toneClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase opacity-70">{title}</p>
          <p className={compact ? "mt-2 text-2xl font-semibold" : "mt-2 text-3xl font-semibold"}>{value}</p>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white/70">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 opacity-75">{detail}</p>
    </article>
  )
}

function ClaimQueueCard({
  claim,
  profile,
}: {
  claim: ProfileClaim
  profile?: EntityProfile
}) {
  return (
    <article className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={claim.status === "pending" ? "amber" : "rose"}>{claim.status}</StatusBadge>
            <StatusBadge tone="slate">{claim.relationshipToProfile}</StatusBadge>
          </div>
          <h3 className="mt-3 font-semibold text-slate-950">{claim.claimantName}</h3>
          <p className="mt-1 text-sm text-slate-600">
            {profile ? `${profile.displayName} / ${profileTypeLabel(profile.profileType)}` : "Profile record not loaded"}
          </p>
        </div>
        <StatusBadge tone={profile?.isPublic ? "emerald" : "slate"}>{profile?.isPublic ? "Public" : "Private"}</StatusBadge>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{claim.verificationSummary}</p>
      <p className="mt-2 text-xs text-slate-500">Updated {formatProfileDate(claim.updatedAt)}. Claimant email remains private.</p>
    </article>
  )
}

function ProfilePriorityCard({
  profile,
  duplicateCount,
}: {
  profile: EntityProfile
  duplicateCount: number
}) {
  const reasons = profilePriorityReasons(profile, duplicateCount)

  return (
    <article className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-950">{profile.displayName}</p>
          <p className="mt-1 text-sm text-slate-600">
            {profileTypeLabel(profile.profileType)} / {profile.city}, {profile.state}
          </p>
        </div>
        <StatusBadge tone={profile.isPublic ? "emerald" : "slate"}>{profile.isPublic ? "Public" : "Private"}</StatusBadge>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {reasons.map((reason) => (
          <StatusBadge key={reason.label} tone={reason.tone}>{reason.label}</StatusBadge>
        ))}
      </div>
      <dl className="mt-4 grid gap-2 sm:grid-cols-2">
        <ProfileFact label="Reports" value={profile.reportCount} />
        <ProfileFact label="Evidence" value={profile.evidenceOnFileCount > 0 ? "On file" : "Needs label"} />
        <ProfileFact label="Responses" value={profile.responseCount} />
        <ProfileFact label="Updated" value={formatProfileDate(profile.updatedAt)} />
      </dl>
    </article>
  )
}

function SubcontractorLaunchCandidateCard({
  profile,
  readiness,
}: {
  profile: EntityProfile
  readiness: ReturnType<typeof subcontractorLaunchReadiness>
}) {
  const previewHref = entityProfileHref(profile, "subcontractor")

  return (
    <article className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={readiness.ready ? "emerald" : "amber"}>
              {readiness.ready ? "Launch-ready" : `${readiness.score}% ready`}
            </StatusBadge>
            <StatusBadge tone={profile.isPublic ? "emerald" : "slate"}>{profile.isPublic ? "Public" : "Private"}</StatusBadge>
            <StatusBadge tone="blue">{profile.tradeCategory ?? String(profile.profileSubtype ?? "Trade category needed")}</StatusBadge>
          </div>
          <h3 className="mt-3 font-semibold text-slate-950">{profile.displayName}</h3>
          <p className="mt-1 text-sm text-slate-600">
            {profile.city}, {profile.state} / {claimedStatusLabel(profile.claimedStatus)}
          </p>
        </div>
        <div className="rounded-md border border-white bg-white px-3 py-2 text-right shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Rating</p>
          <p className="mt-1 text-lg font-semibold text-slate-950">{profile.ratingScore}/100</p>
        </div>
      </div>
      {readiness.missing.length > 0 ? (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs font-semibold uppercase text-amber-800">Missing before publishing</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-6 text-amber-950">
            {readiness.missing.slice(0, 5).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-950">
          Ready for final moderator note and public profile privacy preview.
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href={`/admin/profiles?q=${encodeURIComponent(profile.displayName)}&type=subcontractor`}>
            Review record
          </Link>
        </Button>
        {profile.isPublic ? (
          <Button asChild size="sm" variant="outline">
            <Link href={previewHref} target="_blank">
              Preview public profile
            </Link>
          </Button>
        ) : null}
      </div>
    </article>
  )
}

function ProfileFact({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-white bg-white p-3">
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-slate-950">{value}</dd>
    </div>
  )
}

function subcontractorLaunchReadiness(profile: EntityProfile) {
  const missing: string[] = []
  const hasVerification =
    ["claimed", "verified"].includes(profile.claimedStatus) ||
    Boolean(profile.verificationBadges?.length) ||
    ["business_verified", "license_verified", "insurance_verified", "admin_verified"].includes(String(profile.verificationLevel))

  if (!profileSupportsType(profile, "subcontractor")) missing.push("Profile type or account capabilities must include subcontractor")
  if (!profile.displayName && !profile.businessName) missing.push("Real business or trade display name")
  if (!profile.city || !profile.state) missing.push("City and state")
  if (!profile.profileSubtype) missing.push("Subcontractor subtype")
  if (!profile.tradeCategory && !profile.profileSubtype) missing.push("Canonical trade category or clear trade subtype")
  if (!profile.publicSummary) missing.push("Public-safe summary")
  if (!hasVerification) missing.push("Claim, verification, or documented moderator context")
  if (!profile.isPublic) missing.push("Public visibility enabled after review")
  if (profile.ratingScore <= 0) missing.push("Trade Partner Reliability Rating")
  if (profile.claimedStatus === "disputed") missing.push("Dispute resolved or clearly moderated before launch")

  return {
    missing,
    ready: missing.length === 0,
    score: Math.max(0, Math.min(100, 100 - missing.length * 12)),
  }
}

function profilePriority(profile: EntityProfile, duplicateGroups: Record<string, EntityProfile[]>) {
  let score = 0
  const duplicateCount = profile.duplicateGroupKey ? duplicateGroups[profile.duplicateGroupKey]?.length ?? 0 : 0
  if (profile.claimedStatus === "claim_pending") score += 12
  if (profile.claimedStatus === "disputed" || profile.disputedReportCount > 0) score += 11
  if (duplicateCount > 1) score += 9
  if (profile.redactionNote || Object.keys(profile.publicFieldRedactions ?? {}).length > 0) score += 7
  if (profile.reportCount > 0 && profile.evidenceOnFileCount === 0) score += 5
  if (!profile.isPublic && profile.reportCount > 0) score += 4
  if (daysSince(profile.updatedAt) >= 30) score += 2
  return score
}

function profilePriorityReasons(profile: EntityProfile, duplicateCount: number) {
  const reasons: Array<{ label: string; tone: "slate" | "amber" | "emerald" | "rose" | "blue" }> = []
  if (profile.claimedStatus === "claim_pending") reasons.push({ label: "claim pending", tone: "amber" })
  if (profile.claimedStatus === "disputed" || profile.disputedReportCount > 0) reasons.push({ label: "dispute context", tone: "rose" })
  if (duplicateCount > 1) reasons.push({ label: `${duplicateCount} duplicate signals`, tone: "amber" })
  if (profile.redactionNote || Object.keys(profile.publicFieldRedactions ?? {}).length > 0) reasons.push({ label: "redaction note", tone: "blue" })
  if (profile.reportCount > 0 && profile.evidenceOnFileCount === 0) reasons.push({ label: "evidence label needed", tone: "amber" })
  if (!profile.isPublic && profile.reportCount > 0) reasons.push({ label: "private with reports", tone: "slate" })
  if (reasons.length === 0) reasons.push({ label: "review", tone: "slate" })
  return reasons
}

function daysSince(value: string) {
  const time = new Date(value).getTime()
  if (Number.isNaN(time)) return 0
  return Math.floor((Date.now() - time) / 86_400_000)
}

function formatProfileDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(new Date(value))
}
