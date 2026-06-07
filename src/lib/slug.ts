import type { ClientProfile } from "@/lib/types"
import { normalizeCityName, normalizeStateCode } from "@/lib/locations"

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function buildClientSlug(input: Pick<ClientProfile, "firstName" | "lastName" | "city" | "state">) {
  return buildClientProfileSlug(input)
}

export function slugifyLocation(city: string, stateCode: string) {
  return slugify(`${normalizeCityName(city)} ${normalizeStateCode(stateCode).toLowerCase()}`)
}

export function buildClientProfileSlug(input: Pick<ClientProfile, "firstName" | "lastName" | "city" | "state">) {
  return slugify(
    `${input.firstName} ${input.lastName} ${normalizeCityName(input.city)} ${normalizeStateCode(input.state).toLowerCase()}`,
  )
}

export function ensureUniqueSlug(baseSlug: string, existingSlugs: string[]) {
  if (!existingSlugs.includes(baseSlug)) return baseSlug

  let suffix = 2
  let candidate = `${baseSlug}-${suffix}`

  while (existingSlugs.includes(candidate)) {
    suffix += 1
    candidate = `${baseSlug}-${suffix}`
  }

  return candidate
}
