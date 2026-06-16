import type { ClientProfile } from "@/lib/types"
import {
  floridaCountyRecords,
  floridaPlacesByCountySlug,
  getFloridaCounty,
  getFloridaPlace,
  type FloridaCountyRecord,
  type FloridaPlaceRecord,
} from "@/lib/florida-geography"

export interface ClientDirectoryCity {
  name: string
  slug: string
  profileCount: number
  reportCount: number
  lastUpdated: string
  profiles: ClientProfile[]
  floridaPlace?: FloridaPlaceRecord
  isEmptyOfficialLocation?: boolean
}

export interface ClientDirectoryState {
  code: string
  name: string
  slug: string
  profileCount: number
  reportCount: number
  lastUpdated: string
  cities: ClientDirectoryCity[]
  profiles: ClientProfile[]
}

export interface ClientDirectoryCounty {
  name: string
  slug: string
  profileCount: number
  reportCount: number
  lastUpdated: string
  profiles: ClientProfile[]
  places: FloridaPlaceRecord[]
  profileCities: ClientDirectoryCity[]
  county: FloridaCountyRecord
}

const stateNames: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  DC: "District of Columbia",
}

export function directorySlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function getStateName(state: string) {
  const normalized = state.trim().toUpperCase()

  return stateNames[normalized] ?? state.trim()
}

export function getStateSlug(state: string) {
  return directorySlug(getStateName(state))
}

export function getClientStateDirectoryHref(profile: Pick<ClientProfile, "state">) {
  return `/clients/${getStateSlug(profile.state)}`
}

export function getClientCityDirectoryHref(profile: Pick<ClientProfile, "city" | "state">) {
  return `${getClientStateDirectoryHref(profile)}/${directorySlug(profile.city)}`
}

export function getClientDirectory(profiles: ClientProfile[]) {
  const publicProfiles = profiles
    .filter((profile) => profile.isPublic)
    .slice()
    .sort((a, b) => `${a.state}-${a.city}-${a.lastName}`.localeCompare(`${b.state}-${b.city}-${b.lastName}`))
  const byState = new Map<string, ClientProfile[]>()

  for (const profile of publicProfiles) {
    const key = profile.state.trim().toUpperCase()
    byState.set(key, [...(byState.get(key) ?? []), profile])
  }

  return Array.from(byState.entries())
    .map(([code, stateProfiles]) => {
      const byCity = new Map<string, ClientProfile[]>()

      for (const profile of stateProfiles) {
        const key = directorySlug(profile.city)
        byCity.set(key, [...(byCity.get(key) ?? []), profile])
      }

      const cities = Array.from(byCity.entries())
        .map(([slug, cityProfiles]) => ({
          name: cityProfiles[0]?.city ?? slug,
          slug,
          profileCount: cityProfiles.length,
          reportCount: sumReports(cityProfiles),
          lastUpdated: latestUpdatedAt(cityProfiles),
          profiles: sortProfiles(cityProfiles),
        }))
        .sort((a, b) => a.name.localeCompare(b.name))

      return {
        code,
        name: getStateName(code),
        slug: getStateSlug(code),
        profileCount: stateProfiles.length,
        reportCount: sumReports(stateProfiles),
        lastUpdated: latestUpdatedAt(stateProfiles),
        cities,
        profiles: sortProfiles(stateProfiles),
      } satisfies ClientDirectoryState
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function getClientDirectoryState(profiles: ClientProfile[], stateSlug: string) {
  return getClientDirectory(profiles).find((state) => state.slug === stateSlug)
}

export function getClientDirectoryStateOrFlorida(profiles: ClientProfile[], stateSlug: string) {
  return getClientDirectoryState(profiles, stateSlug) ?? (stateSlug === "florida" ? emptyFloridaDirectoryState() : undefined)
}

export function getClientDirectoryCity(profiles: ClientProfile[], stateSlug: string, citySlug: string) {
  return getClientDirectoryState(profiles, stateSlug)?.cities.find((city) => city.slug === citySlug)
}

export function getClientDirectoryCityOrFloridaPlace(
  profiles: ClientProfile[],
  stateSlug: string,
  citySlug: string,
) {
  const directoryCity = getClientDirectoryCity(profiles, stateSlug, citySlug)
  if (directoryCity) {
    return {
      state: getClientDirectoryState(profiles, stateSlug),
      city: attachFloridaPlace(directoryCity),
      shouldIndex: true,
    }
  }

  if (stateSlug !== "florida") return undefined

  const place = getFloridaPlace(citySlug)
  if (!place) return undefined

  const state = getClientDirectoryStateOrFlorida(profiles, stateSlug) ?? emptyFloridaDirectoryState()
  const city: ClientDirectoryCity = {
    name: place.name,
    slug: place.slug,
    profileCount: 0,
    reportCount: 0,
    lastUpdated: new Date().toISOString(),
    profiles: [],
    floridaPlace: place,
    isEmptyOfficialLocation: true,
  }

  return {
    state,
    city,
    shouldIndex: false,
  }
}

export function getFloridaCountyDirectory(profiles: ClientProfile[]) {
  const floridaState = getClientDirectoryState(profiles, "florida") ?? emptyFloridaDirectoryState()
  const citiesBySlug = new Map(floridaState.cities.map((city) => [city.slug, attachFloridaPlace(city)]))

  return floridaCountyRecords.map((county) => {
    const places = floridaPlacesByCountySlug(county.slug)
    const profileCities = places
      .map((place) => citiesBySlug.get(place.slug))
      .filter((city): city is ClientDirectoryCity => Boolean(city))
    const countyProfiles = profileCities.flatMap((city) => city.profiles)

    return {
      name: county.name,
      slug: county.slug,
      profileCount: countyProfiles.length,
      reportCount: sumReports(countyProfiles),
      lastUpdated: countyProfiles.length > 0 ? latestUpdatedAt(countyProfiles) : new Date().toISOString(),
      profiles: sortProfiles(countyProfiles),
      places,
      profileCities,
      county,
    } satisfies ClientDirectoryCounty
  })
}

export function getFloridaCountyDirectoryEntry(profiles: ClientProfile[], countySlug: string) {
  const county = getFloridaCounty(countySlug)
  if (!county) return undefined

  return getFloridaCountyDirectory(profiles).find((entry) => entry.slug === county.slug)
}

export function isFloridaLocationPageIndexable(input: { profileCount: number }) {
  return input.profileCount > 0
}

function emptyFloridaDirectoryState(): ClientDirectoryState {
  return {
    code: "FL",
    name: "Florida",
    slug: "florida",
    profileCount: 0,
    reportCount: 0,
    lastUpdated: new Date().toISOString(),
    cities: [],
    profiles: [],
  }
}

function attachFloridaPlace(city: ClientDirectoryCity): ClientDirectoryCity {
  if (city.floridaPlace || city.slug === "") return city

  const place = getFloridaPlace(city.slug)

  return place ? { ...city, floridaPlace: place } : city
}

function sumReports(profiles: ClientProfile[]) {
  return profiles.reduce((total, profile) => total + profile.reportCount, 0)
}

function latestUpdatedAt(profiles: ClientProfile[]) {
  return profiles
    .map((profile) => profile.updatedAt)
    .sort()
    .at(-1) ?? new Date().toISOString()
}

function sortProfiles(profiles: ClientProfile[]) {
  return profiles
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || b.reportCount - a.reportCount)
}
