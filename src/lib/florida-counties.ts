import { floridaCountyRecords } from "@/lib/florida-geography"

export const floridaCounties = floridaCountyRecords.map((county) => county.name)

const floridaCountySet = new Set(floridaCounties.map((county) => county.toLowerCase()))

export function isFloridaCounty(value?: string | null) {
  return floridaCountySet.has((value ?? "").trim().toLowerCase())
}
