import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { EntityProfileDirectory, getProfileDirectoryFaqs } from "@/components/profile/entity-profile-directory"
import { JsonLd, getFaqSchema } from "@/lib/seo"
import { getSiteUrl } from "@/lib/env"
import { getPublicEntityProfilesService, searchProfilesService } from "@/lib/repositories/client-bureau-service"
import { profileTypes, type ProfileType } from "@/lib/types"

type ProfileTypeDirectoryProps = {
  params: Promise<{
    profileType: string
  }>
  searchParams: Promise<{
    q?: string
    state?: string
    tradeCategory?: string
  }>
}

function toProfileType(value: string): ProfileType | undefined {
  return profileTypes.includes(value as ProfileType) ? (value as ProfileType) : undefined
}

function titleForProfileType(profileType: ProfileType) {
  if (profileType === "client") return "Client Database"
  if (profileType === "subcontractor") return "Subcontractor Database"

  return "Contractor Database"
}

function descriptionForProfileType(profileType: ProfileType) {
  if (profileType === "client") {
    return "Browse the Client Bureau Client Database for clients, homeowners, customers, property owners, and businesses contractors worked for."
  }

  if (profileType === "subcontractor") {
    return "Browse the Subcontractor Database by trade scope, GC/sub relationship context, documentation readiness, and payment-chain signals."
  }

  return "Browse the Contractor Database with service-business verification, service-area context, and moderated public project records."
}

export async function generateMetadata({ params }: ProfileTypeDirectoryProps): Promise<Metadata> {
  const { profileType: rawProfileType } = await params
  const profileType = toProfileType(rawProfileType)

  if (!profileType) return {}

  const title = titleForProfileType(profileType)
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
  const tradeCategory = queryParams.tradeCategory?.trim() || undefined
  const [allProfiles, results] = await Promise.all([
    getPublicEntityProfilesService(),
    searchProfilesService(query, { state, profileType, tradeCategory }),
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
          name: `${titleForProfileType(profileType)} | Client Bureau`,
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
        tradeCategory={tradeCategory}
      />
    </>
  )
}
