import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { EntityProfileDirectory, getProfileDirectoryFaqs } from "@/components/profile/entity-profile-directory"
import { JsonLd, getFaqSchema } from "@/lib/seo"
import { getSiteUrl } from "@/lib/env"
import { profileTypePluralLabel } from "@/lib/entity-profiles"
import { getPublicEntityProfilesService, searchProfilesService } from "@/lib/repositories/client-bureau-service"
import { profileTypes, type ProfileType } from "@/lib/types"

type ProfileTypeDirectoryProps = {
  params: Promise<{
    profileType: string
  }>
  searchParams: Promise<{
    q?: string
    state?: string
  }>
}

function toProfileType(value: string): ProfileType | undefined {
  return profileTypes.includes(value as ProfileType) ? (value as ProfileType) : undefined
}

function titleForProfileType(profileType: ProfileType) {
  if (profileType === "client") return "Client and Customer Profiles"
  if (profileType === "subcontractor") return "Subcontractor and Trade Professional Profiles"

  return "Contractor and Service Business Profiles"
}

function descriptionForProfileType(profileType: ProfileType) {
  if (profileType === "client") {
    return "Search public Client Bureau profiles for clients, homeowners, customers, property owners, and businesses contractors worked for."
  }

  if (profileType === "subcontractor") {
    return "Search public subcontractor and trade-professional profiles by trade scope, GC/sub relationship context, and payment-chain signals."
  }

  return "Search public Client Bureau contractor and service-business profiles with verification, service-area context, and moderated project records."
}

export async function generateMetadata({ params }: ProfileTypeDirectoryProps): Promise<Metadata> {
  const { profileType: rawProfileType } = await params
  const profileType = toProfileType(rawProfileType)

  if (!profileType) return {}

  const title = `${titleForProfileType(profileType)} | Client Bureau`
  const description = descriptionForProfileType(profileType)

  return {
    title,
    description,
    alternates: {
      canonical: `${getSiteUrl()}/profiles/${profileType}`,
    },
  }
}

export default async function ProfileTypeDirectoryPage({
  params,
  searchParams,
}: ProfileTypeDirectoryProps) {
  const { profileType: rawProfileType } = await params
  const profileType = toProfileType(rawProfileType)

  if (!profileType) notFound()

  const queryParams = await searchParams
  const query = queryParams.q?.trim() ?? ""
  const state = queryParams.state?.trim().toUpperCase() || undefined
  const [allProfiles, results] = await Promise.all([
    getPublicEntityProfilesService(),
    searchProfilesService(query, { state, profileType }),
  ])
  const typedProfiles = allProfiles.filter((profile) =>
    profile.profileType === profileType || profile.accountCapabilities?.includes(profileType),
  )
  const states = [...new Set(typedProfiles.map((profile) => profile.state))].sort()
  const siteUrl = getSiteUrl()

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${profileTypePluralLabel(profileType)} | Client Bureau`,
          url: `${siteUrl}/profiles/${profileType}`,
          description: descriptionForProfileType(profileType),
        }}
      />
      <JsonLd data={getFaqSchema(getProfileDirectoryFaqs(profileType))} />
      <EntityProfileDirectory
        activeType={profileType}
        allProfiles={allProfiles}
        query={query}
        results={results}
        searchPath={`/profiles/${profileType}`}
        state={state}
        states={states}
      />
    </>
  )
}
