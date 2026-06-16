import type { Metadata } from "next"

import { EntityProfileDirectory, getProfileDirectoryFaqs } from "@/components/profile/entity-profile-directory"
import { JsonLd, getFaqSchema } from "@/lib/seo"
import { getSiteUrl } from "@/lib/env"
import { publicDatabasePillars } from "@/lib/public-site"
import { getPublicEntityProfilesService, searchProfilesService } from "@/lib/repositories/client-bureau-service"
import { profileTypes, type ProfileType } from "@/lib/types"

export const metadata: Metadata = {
  title: "Public Databases",
  description:
    "Browse Client Bureau public databases for clients, contractors, service businesses, subcontractors, and trade professionals.",
  alternates: {
    canonical: `${getSiteUrl()}/profiles`,
  },
}

export const dynamic = "force-dynamic"

type ProfilesPageSearchParams = Promise<{
  q?: string
  state?: string
  profileType?: string
}>

function toProfileType(value?: string): ProfileType | undefined {
  return profileTypes.includes(value as ProfileType) ? (value as ProfileType) : undefined
}

export default async function ProfilesPage({ searchParams }: { searchParams: ProfilesPageSearchParams }) {
  const params = await searchParams
  const query = params.q?.trim() ?? ""
  const state = params.state?.trim().toUpperCase() || undefined
  const profileType = toProfileType(params.profileType)
  const [allProfiles, results] = await Promise.all([
    getPublicEntityProfilesService(),
    searchProfilesService(query, { state, profileType }),
  ])
  const states = [...new Set(allProfiles.map((profile) => profile.state))].sort()
  const siteUrl = getSiteUrl()

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Client Bureau Public Databases",
          url: `${siteUrl}/profiles`,
          description:
            "Public database hub for Client Bureau client, contractor, service business, subcontractor, and trade professional profiles.",
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "@id": `${siteUrl}/profiles#database-hubs`,
          name: "Client Bureau public database hubs",
          itemListElement: publicDatabasePillars.map((pillar, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: pillar.label,
            url: `${siteUrl}${pillar.href}`,
            description: pillar.primaryIntent,
          })),
        }}
      />
      <JsonLd data={getFaqSchema(getProfileDirectoryFaqs(profileType))} />
      <EntityProfileDirectory
        activeType={profileType}
        allProfiles={allProfiles}
        query={query}
        results={results}
        searchPath="/profiles"
        state={state}
        states={states}
      />
    </>
  )
}
