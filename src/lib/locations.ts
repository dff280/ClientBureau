export const usStates = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
  { code: "DC", name: "District of Columbia" },
] as const

export const usStateCodes = usStates.map((state) => state.code) as [string, ...string[]]

const stateCodeSet = new Set<string>(usStateCodes)

export function normalizeStateCode(value?: string | null) {
  return value?.trim().toUpperCase() ?? ""
}

export function isValidStateCode(value?: string | null) {
  return stateCodeSet.has(normalizeStateCode(value))
}

export function getStateName(value?: string | null) {
  const code = normalizeStateCode(value)

  return usStates.find((state) => state.code === code)?.name
}

export function normalizeCityName(value?: string | null) {
  return (value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[<>]/g, "")
    .slice(0, 80)
}

export const businessTypes = [
  "General contractor",
  "Specialty trade contractor",
  "Home service business",
  "Professional service business",
  "Creative or digital service",
  "Supplier or vendor",
  "Other service business",
] as const

export const companySizes = [
  "Solo owner-operator",
  "2-5 team members",
  "6-15 team members",
  "16-50 team members",
  "51+ team members",
] as const

export const yearsInBusinessOptions = [
  "Less than 1 year",
  "1-2 years",
  "3-5 years",
  "6-10 years",
  "10+ years",
] as const

export const onboardingGoals = [
  "Check clients before accepting jobs",
  "Submit documented client reports",
  "Use contracts and e-signatures",
  "Track payment recovery",
  "Use Florida lien service",
  "Organize evidence and project records",
] as const

export const accountTypeOptions = [
  {
    value: "contractor",
    label: "Contractor / Service Business",
    description: "I perform work for clients and want to check client ratings, submit reports, and protect payment.",
  },
  {
    value: "client",
    label: "Client / Homeowner / Customer",
    description: "I want to respond to a report, request a correction, or manage my profile.",
  },
] as const

export const clientTypes = [
  "Individual",
  "Business",
  "Property Manager",
  "Other",
] as const

export const jobStatuses = [
  "Not started",
  "In progress",
  "Substantially complete",
  "Completed",
  "Paused",
  "Cancelled",
] as const

export const paymentDisputeStatuses = [
  "Paid",
  "Partially paid",
  "Unpaid",
  "Disputed",
  "Refunded",
  "Chargeback",
  "No payment issue",
] as const
