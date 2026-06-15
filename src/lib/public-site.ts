export const publicSocialLinks = [
  { label: "Facebook", url: process.env.NEXT_PUBLIC_FACEBOOK_URL },
  { label: "X", url: process.env.NEXT_PUBLIC_X_URL },
  { label: "Instagram", url: process.env.NEXT_PUBLIC_INSTAGRAM_URL },
  { label: "YouTube", url: process.env.NEXT_PUBLIC_YOUTUBE_URL },
  { label: "LinkedIn", url: process.env.NEXT_PUBLIC_LINKEDIN_URL },
].filter((link): link is { label: string; url: string } => Boolean(link.url))

export const publicContactInfo = {
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE,
  street: process.env.NEXT_PUBLIC_CONTACT_STREET,
  city: process.env.NEXT_PUBLIC_CONTACT_CITY,
  state: process.env.NEXT_PUBLIC_CONTACT_STATE,
  zip: process.env.NEXT_PUBLIC_CONTACT_ZIP,
}

export type PublicDatabasePillarId = "clients" | "contractors" | "subcontractors"

export type PublicDatabaseTone = "client" | "contractor" | "subcontractor"

export type PublicDatabasePillar = {
  id: PublicDatabasePillarId
  label: string
  shortLabel: string
  description: string
  href: string
  cta: string
  tone: PublicDatabaseTone
  proofPoints: string[]
  privacyNote: string
}

export const publicDatabasePillars: PublicDatabasePillar[] = [
  {
    id: "clients",
    label: "Client Database",
    shortLabel: "Clients",
    description:
      "Check homeowners, customers, property owners, and businesses before you commit labor, materials, scheduling, deposits, or final payment terms.",
    href: "/clients",
    cta: "Browse Client Database",
    tone: "client",
    proofPoints: ["Reported experiences", "Moderated summaries", "Response and dispute paths"],
    privacyNote: "Raw emails, phones, street addresses, and private evidence stay hidden.",
  },
  {
    id: "contractors",
    label: "Contractor Database",
    shortLabel: "Contractors",
    description:
      "Review contractor and service-business profiles with verification context, service-area signals, public project records, and claim paths.",
    href: "/profiles/contractor",
    cta: "Browse Contractor Database",
    tone: "contractor",
    proofPoints: ["Business verification", "Service-area context", "Claim and correction paths"],
    privacyNote: "Public profiles show business-trust context, not private operational notes.",
  },
  {
    id: "subcontractors",
    label: "Subcontractor Database",
    shortLabel: "Subcontractors",
    description:
      "Inspect trade partners, specialty crews, installers, vendors, and payment-chain context with role-specific public profile records.",
    href: "/profiles/subcontractor",
    cta: "Browse Subcontractor Database",
    tone: "subcontractor",
    proofPoints: ["Trade specialization", "GC/sub relationship context", "Payment-chain signals"],
    privacyNote: "Scope notes, job addresses, private evidence, and staff notes stay sealed.",
  },
]
