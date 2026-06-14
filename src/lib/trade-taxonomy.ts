import type { ProfileType } from "@/lib/types"

export const tradeCategoryGroups = [
  "Building & Remodeling",
  "Exterior & Site Work",
  "Mechanical / Electrical / Plumbing",
  "Property Services",
  "Restoration & Maintenance",
  "Vendors & Suppliers",
  "Other",
] as const

export type TradeCategoryGroup = (typeof tradeCategoryGroups)[number]

export type TradeCategory = {
  aliases: readonly string[]
  group: TradeCategoryGroup
  label: string
  profileTypes: readonly ProfileType[]
  slug: string
}

export const otherTradeLabel = "Other specialty trade"

export const tradeCategories = [
  { label: "General contractor", slug: "general-contractor", group: "Building & Remodeling", profileTypes: ["contractor"], aliases: ["gc", "builder", "prime contractor"] },
  { label: "Residential remodeler", slug: "residential-remodeler", group: "Building & Remodeling", profileTypes: ["contractor"], aliases: ["remodeling", "remodeler", "home remodeler"] },
  { label: "Commercial contractor", slug: "commercial-contractor", group: "Building & Remodeling", profileTypes: ["contractor"], aliases: ["commercial construction", "tenant improvement"] },
  { label: "Handyman", slug: "handyman", group: "Property Services", profileTypes: ["contractor", "subcontractor"], aliases: ["home repair", "small repairs"] },
  { label: "Carpenter / framing", slug: "carpenter-framing", group: "Building & Remodeling", profileTypes: ["contractor", "subcontractor"], aliases: ["carpentry", "framing", "rough carpentry"] },
  { label: "Finish carpentry", slug: "finish-carpentry", group: "Building & Remodeling", profileTypes: ["contractor", "subcontractor"], aliases: ["trim carpentry", "trim carpenter"] },
  { label: "Cabinetry / millwork", slug: "cabinetry-millwork", group: "Building & Remodeling", profileTypes: ["contractor", "subcontractor"], aliases: ["cabinets", "millwork", "cabinet installer"] },
  { label: "Roofing", slug: "roofing", group: "Exterior & Site Work", profileTypes: ["contractor", "subcontractor"], aliases: ["roofer", "roof repair"] },
  { label: "Siding", slug: "siding", group: "Exterior & Site Work", profileTypes: ["contractor", "subcontractor"], aliases: ["exterior siding"] },
  { label: "Gutters", slug: "gutters", group: "Exterior & Site Work", profileTypes: ["contractor", "subcontractor"], aliases: ["gutter", "gutter installer"] },
  { label: "Windows and doors", slug: "windows-and-doors", group: "Exterior & Site Work", profileTypes: ["contractor", "subcontractor"], aliases: ["window installer", "door installer"] },
  { label: "Drywall", slug: "drywall", group: "Building & Remodeling", profileTypes: ["contractor", "subcontractor"], aliases: ["sheetrock", "gypsum board"] },
  { label: "Insulation", slug: "insulation", group: "Building & Remodeling", profileTypes: ["contractor", "subcontractor"], aliases: ["insulator"] },
  { label: "Painting", slug: "painting", group: "Building & Remodeling", profileTypes: ["contractor", "subcontractor"], aliases: ["painter", "paint", "interior painting", "exterior painting"] },
  { label: "Flooring", slug: "flooring", group: "Building & Remodeling", profileTypes: ["contractor", "subcontractor"], aliases: ["floor installer", "hardwood", "vinyl flooring", "carpet"] },
  { label: "Tile and stone", slug: "tile-and-stone", group: "Building & Remodeling", profileTypes: ["contractor", "subcontractor"], aliases: ["tile", "stone", "tile installer"] },
  { label: "Concrete", slug: "concrete", group: "Exterior & Site Work", profileTypes: ["contractor", "subcontractor"], aliases: ["concrete contractor", "flatwork"] },
  { label: "Masonry", slug: "masonry", group: "Exterior & Site Work", profileTypes: ["contractor", "subcontractor"], aliases: ["brick", "block", "stone masonry"] },
  { label: "Excavation / site prep", slug: "excavation-site-prep", group: "Exterior & Site Work", profileTypes: ["contractor", "subcontractor"], aliases: ["excavation", "site preparation", "grading"] },
  { label: "Foundation repair", slug: "foundation-repair", group: "Exterior & Site Work", profileTypes: ["contractor", "subcontractor"], aliases: ["foundation"] },
  { label: "Landscaping", slug: "landscaping", group: "Exterior & Site Work", profileTypes: ["contractor", "subcontractor"], aliases: ["landscape", "landscaper"] },
  { label: "Lawn care", slug: "lawn-care", group: "Property Services", profileTypes: ["contractor", "subcontractor"], aliases: ["lawn service", "mowing"] },
  { label: "Tree service", slug: "tree-service", group: "Exterior & Site Work", profileTypes: ["contractor", "subcontractor"], aliases: ["arborist", "tree removal"] },
  { label: "Irrigation", slug: "irrigation", group: "Exterior & Site Work", profileTypes: ["contractor", "subcontractor"], aliases: ["sprinklers", "sprinkler repair"] },
  { label: "Fencing", slug: "fencing", group: "Exterior & Site Work", profileTypes: ["contractor", "subcontractor"], aliases: ["fence", "fence installer"] },
  { label: "Decks / patios", slug: "decks-patios", group: "Exterior & Site Work", profileTypes: ["contractor", "subcontractor"], aliases: ["deck", "patio", "porch"] },
  { label: "Pool and spa service", slug: "pool-and-spa-service", group: "Property Services", profileTypes: ["contractor", "subcontractor"], aliases: ["pool", "spa", "pool contractor", "pool service"] },
  { label: "Plumbing", slug: "plumbing", group: "Mechanical / Electrical / Plumbing", profileTypes: ["contractor", "subcontractor"], aliases: ["plumber", "pipefitter", "sewer repair"] },
  { label: "Electrical", slug: "electrical", group: "Mechanical / Electrical / Plumbing", profileTypes: ["contractor", "subcontractor"], aliases: ["electrician", "electric", "electrical contractor"] },
  { label: "HVAC", slug: "hvac", group: "Mechanical / Electrical / Plumbing", profileTypes: ["contractor", "subcontractor"], aliases: ["air conditioning", "ac repair", "heating", "cooling"] },
  { label: "Solar installation", slug: "solar-installation", group: "Mechanical / Electrical / Plumbing", profileTypes: ["contractor", "subcontractor"], aliases: ["solar", "solar panels"] },
  { label: "Low-voltage / security", slug: "low-voltage-security", group: "Mechanical / Electrical / Plumbing", profileTypes: ["contractor", "subcontractor"], aliases: ["low voltage", "security system", "cameras", "alarm"] },
  { label: "Appliance repair", slug: "appliance-repair", group: "Property Services", profileTypes: ["contractor", "subcontractor"], aliases: ["appliance"] },
  { label: "Garage doors", slug: "garage-doors", group: "Property Services", profileTypes: ["contractor", "subcontractor"], aliases: ["garage door"] },
  { label: "Septic / sewer", slug: "septic-sewer", group: "Mechanical / Electrical / Plumbing", profileTypes: ["contractor", "subcontractor"], aliases: ["septic", "sewer"] },
  { label: "Water treatment", slug: "water-treatment", group: "Mechanical / Electrical / Plumbing", profileTypes: ["contractor", "subcontractor"], aliases: ["water softener", "water filtration"] },
  { label: "Pest control", slug: "pest-control", group: "Property Services", profileTypes: ["contractor"], aliases: ["exterminator", "termite"] },
  { label: "Cleaning / janitorial", slug: "cleaning-janitorial", group: "Property Services", profileTypes: ["contractor", "subcontractor"], aliases: ["cleaning", "janitorial", "maid service"] },
  { label: "Pressure washing", slug: "pressure-washing", group: "Property Services", profileTypes: ["contractor", "subcontractor"], aliases: ["pressure cleaning", "power washing"] },
  { label: "Restoration / water damage", slug: "restoration-water-damage", group: "Restoration & Maintenance", profileTypes: ["contractor", "subcontractor"], aliases: ["water damage", "restoration"] },
  { label: "Mold remediation", slug: "mold-remediation", group: "Restoration & Maintenance", profileTypes: ["contractor", "subcontractor"], aliases: ["mold"] },
  { label: "Fire damage restoration", slug: "fire-damage-restoration", group: "Restoration & Maintenance", profileTypes: ["contractor", "subcontractor"], aliases: ["fire restoration"] },
  { label: "Moving / hauling", slug: "moving-hauling", group: "Property Services", profileTypes: ["contractor"], aliases: ["moving", "hauling", "mover"] },
  { label: "Junk removal", slug: "junk-removal", group: "Property Services", profileTypes: ["contractor"], aliases: ["junk hauling"] },
  { label: "Property maintenance", slug: "property-maintenance", group: "Property Services", profileTypes: ["contractor", "subcontractor"], aliases: ["maintenance", "building maintenance"] },
  { label: "Property management service", slug: "property-management-service", group: "Property Services", profileTypes: ["contractor"], aliases: ["property management", "property manager service"] },
  { label: "Snow removal", slug: "snow-removal", group: "Property Services", profileTypes: ["contractor", "subcontractor"], aliases: ["plowing", "snow plowing"] },
  { label: "Locksmith", slug: "locksmith", group: "Property Services", profileTypes: ["contractor", "subcontractor"], aliases: ["locks"] },
  { label: "Glass / glazing", slug: "glass-glazing", group: "Building & Remodeling", profileTypes: ["contractor", "subcontractor"], aliases: ["glass", "glazing", "glazier"] },
  { label: "Welding / metalwork", slug: "welding-metalwork", group: "Building & Remodeling", profileTypes: ["contractor", "subcontractor"], aliases: ["welding", "metal fabrication"] },
  { label: "Equipment rental / vendor", slug: "equipment-rental-vendor", group: "Vendors & Suppliers", profileTypes: ["contractor", "subcontractor"], aliases: ["equipment rental", "tool rental"] },
  { label: "Material supplier", slug: "material-supplier", group: "Vendors & Suppliers", profileTypes: ["contractor", "subcontractor"], aliases: ["supplier", "materials", "building supply"] },
  { label: otherTradeLabel, slug: "other-specialty-trade", group: "Other", profileTypes: ["contractor", "subcontractor"], aliases: ["other", "not listed", "specialty trade"] },
] as const satisfies readonly TradeCategory[]

export type TradeCategoryLabel = (typeof tradeCategories)[number]["label"]

const normalizedTradeMap = new Map<string, TradeCategory>()

for (const category of tradeCategories) {
  normalizedTradeMap.set(normalizeTradeText(category.label), category)
  normalizedTradeMap.set(normalizeTradeText(category.slug), category)
  for (const alias of category.aliases) {
    normalizedTradeMap.set(normalizeTradeText(alias), category)
  }
}

export function normalizeTradeText(value?: string | null) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function getTradeBySlug(slug?: string | null) {
  const normalized = normalizeTradeText(slug)

  return tradeCategories.find((category) => normalizeTradeText(category.slug) === normalized)
}

export function getTradeCategory(value?: string | null) {
  return normalizedTradeMap.get(normalizeTradeText(value))
}

export function tradeOptionsForProfileType(profileType?: ProfileType | null) {
  if (!profileType || profileType === "client") return tradeCategories

  return tradeCategories.filter((category) => category.profileTypes.some((type) => type === profileType))
}

export function tradeSearchAliases(value?: string | null) {
  const category = getTradeCategory(value)
  if (!category) return []

  return [category.label, category.slug, ...category.aliases]
}

export function normalizeTradeCategory(value?: string | null, otherDetail?: string | null) {
  const rawValue = (value ?? "").trim()
  const detail = (otherDetail ?? "").trim().replace(/\s+/g, " ").slice(0, 80)
  const category = getTradeCategory(rawValue)

  if (category?.label === otherTradeLabel) {
    return detail ? `${otherTradeLabel}: ${detail}` : otherTradeLabel
  }

  if (category) return category.label

  return rawValue
}

export function tradeCategoryMatches(value: string | undefined, selected?: string | null) {
  const selectedCategory = getTradeCategory(selected)
  if (!selectedCategory) return true

  const haystack = normalizeTradeText(value)
  const terms = tradeSearchAliases(selectedCategory.label).map(normalizeTradeText)

  return terms.some((term) => term && haystack.includes(term))
}
