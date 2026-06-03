import {
  getPublicClientProfileService,
  getPublicClientProfilesService,
} from "@/lib/repositories/client-bureau-service"
import { filterProfilesForLanding, type SeoLandingPage } from "@/lib/seo-landing-pages"
import type { PublicClientProfile } from "@/lib/types"

export async function getDetailedPublicProfiles(): Promise<PublicClientProfile[]> {
  const profiles = await getPublicClientProfilesService()
  const detailed = await Promise.all(
    profiles.map((profile) => getPublicClientProfileService(profile.publicSlug)),
  )

  return detailed.filter((profile): profile is PublicClientProfile => Boolean(profile))
}

export async function getProfilesForLanding(page: SeoLandingPage) {
  const profiles = await getDetailedPublicProfiles()

  return filterProfilesForLanding(page, profiles)
}
