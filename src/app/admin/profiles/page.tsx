import type { Metadata } from "next"
import Link from "next/link"
import { BadgeCheck, Eye, GitMerge, Search, ShieldCheck, UsersRound } from "lucide-react"

import { AdminFilterBar, AdminProfileHealthCard } from "@/components/admin/admin-crm-ui"
import {
  AdminPageHeader,
  EmptyState,
  HeaderActionButton,
  StatCard,
} from "@/components/dashboard/dashboard-ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { deriveEntityProfiles, entityProfileHref, profileTypeLabel } from "@/lib/entity-profiles"
import { getAdminWorkspaceDataService, getPublicBusinessProfilesService } from "@/lib/repositories/client-bureau-service"
import { profileTypes, type ProfileType } from "@/lib/types"

export const metadata: Metadata = {
  title: "Admin Unified Profiles",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

type AdminProfilesSearchParams = Promise<{
  q?: string
  type?: string
  status?: string
}>

function toProfileType(value?: string): ProfileType | undefined {
  return profileTypes.includes(value as ProfileType) ? (value as ProfileType) : undefined
}

export default async function AdminProfilesPage({ searchParams }: { searchParams: AdminProfilesSearchParams }) {
  const params = await searchParams
  const [data, businesses] = await Promise.all([
    getAdminWorkspaceDataService(),
    getPublicBusinessProfilesService().catch(() => []),
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
  const filteredProfiles = profiles.filter((profile) => {
    const haystack = [
      profile.displayName,
      profile.businessName,
      profile.city,
      profile.state,
      profile.slug,
      profile.profileType,
      profile.profileSubtype,
      profile.claimedStatus,
      profile.verificationLevel,
      profile.duplicateGroupKey,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    return (
      (!query || haystack.includes(query)) &&
      (!type || profile.profileType === type) &&
      (status === "all" || profile.claimedStatus === status || (status === "public" ? profile.isPublic : status === "private" ? !profile.isPublic : false))
    )
  })
  const publicCount = profiles.filter((profile) => profile.isPublic).length
  const claimedCount = profiles.filter((profile) => profile.claimedStatus === "claimed").length
  const duplicateSignals = profiles.filter((profile) => profile.duplicateGroupKey).length

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
          <StatCard label="Claimed" value={claimedCount} helper="Owned or verified profile context" icon={BadgeCheck} tone="blue" />
          <StatCard label="Graph signals" value={duplicateSignals} helper="Duplicate keys, claims, and reassignment context" icon={GitMerge} tone="amber" />
        </div>

        <AdminFilterBar
          title="Find public records and claim targets"
          description="Search by name, business, city, state, slug, type, visibility, or claim status."
        >
          <form className="grid w-full gap-2 sm:w-auto sm:grid-cols-[220px_160px_150px_auto]">
            <Input name="q" defaultValue={params.q} placeholder="Search profiles" aria-label="Search unified profiles" />
            <select name="type" defaultValue={type ?? "all"} className="h-10 rounded-md border border-input bg-white px-3 text-sm">
              <option value="all">All types</option>
              {profileTypes.map((item) => (
                <option key={item} value={item}>{profileTypeLabel(item)}</option>
              ))}
            </select>
            <select name="status" defaultValue={status} className="h-10 rounded-md border border-input bg-white px-3 text-sm">
              <option value="all">All status</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="claimed">Claimed</option>
              <option value="unclaimed">Unclaimed</option>
              <option value="disputed">Disputed</option>
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
                  { label: "Claim status", value: profile.claimedStatus },
                  { label: "Subtype", value: String(profile.profileSubtype ?? "General profile") },
                  { label: "Verification", value: profile.verificationBadges?.length ? profile.verificationBadges.join(", ") : profile.verificationLevel ?? "Moderation only" },
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
                        <Link href={entityProfileHref(profile)} target="_blank">
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
