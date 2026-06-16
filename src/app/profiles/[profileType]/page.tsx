import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { EntityProfileDirectory, getProfileDirectoryFaqs } from "@/components/profile/entity-profile-directory"
import { JsonLd, getFaqSchema } from "@/lib/seo"
import { getSiteUrl } from "@/lib/env"
import { getPublicDatabasePillar } from "@/lib/public-site"
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
  const pillar =
    profileType === "client"
      ? getPublicDatabasePillar("clients")
      : profileType === "contractor"
        ? getPublicDatabasePillar("contractors")
        : getPublicDatabasePillar("subcontractors")

  return pillar?.label ?? "Public Database"
}

function descriptionForProfileType(profileType: ProfileType) {
  const pillar =
    profileType === "client"
      ? getPublicDatabasePillar("clients")
      : profileType === "contractor"
        ? getPublicDatabasePillar("contractors")
        : getPublicDatabasePillar("subcontractors")

  return pillar?.primaryIntent ?? "Browse public Client Bureau profile records."
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
  const pillar =
    profileType === "client"
      ? getPublicDatabasePillar("clients")
      : profileType === "contractor"
        ? getPublicDatabasePillar("contractors")
        : getPublicDatabasePillar("subcontractors")

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${titleForProfileType(profileType)} | Client Bureau`,
          url: `${siteUrl}/profiles/${profileType}`,
          description: descriptionForProfileType(profileType),
          mainEntity: {
            "@id": `${siteUrl}/profiles/${profileType}#profile-list`,
          },
        }}
      />
      {pillar ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            "@id": `${siteUrl}/profiles/${profileType}#database-links`,
            name: `${pillar.label} related pages`,
            itemListElement: pillar.internalLinks.map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: item.label,
              url: `${siteUrl}${item.href}`,
              description: item.description,
            })),
          }}
        />
      ) : null}
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
