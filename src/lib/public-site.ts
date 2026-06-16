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
  audience: string
  primaryIntent: string
  authorityTitle: string
  authorityDescription: string
  publicSignals: string[]
  recordsExplained: string[]
  internalLinks: Array<{
    label: string
    href: string
    description: string
  }>
  faqs: Array<{
    question: string
    answer: string
  }>
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
    audience: "Contractors, subcontractors, service businesses, and trade professionals checking a client before work begins.",
    primaryIntent: "Screen a client, homeowner, customer, property owner, or business before labor, materials, scheduling, deposits, or payment terms are committed.",
    authorityTitle: "The Client Database is built for pre-job client screening.",
    authorityDescription:
      "Use it to understand approved public profile context before you quote, schedule, order materials, send contract terms, or extend payment windows. The record is one business-intake signal, not a guarantee or legal finding.",
    publicSignals: [
      "Client Bureau Context Rating and confidence label",
      "Approved positive and concern report mix",
      "Evidence-on-file and response/dispute indicators",
      "State and city directory placement",
    ],
    recordsExplained: [
      "Approved public reports are moderated summaries of reported experiences.",
      "Positive experiences and resolved context matter alongside payment issues.",
      "Private identifiers, raw files, pending reports, rejected reports, and admin notes are not public.",
    ],
    internalLinks: [
      {
        label: "Search the Client Database",
        href: "/search?profileType=client",
        description: "Run a private-safe client check by name, business, city, or state.",
      },
      {
        label: "Browse recent reports",
        href: "/reports/recent",
        description: "Review recently approved public report summaries and profile links.",
      },
      {
        label: "Understand client ratings",
        href: "/score-methodology",
        description: "See how Client Bureau presents client context and confidence carefully.",
      },
      {
        label: "Respond or correct a record",
        href: "/client-response",
        description: "Clients can submit a response, dispute, correction, or resolution update.",
      },
    ],
    faqs: [
      {
        question: "What is the Client Database used for?",
        answer:
          "It helps contractors and service businesses review approved public client profile context before accepting work, scheduling crews, ordering materials, or extending payment terms.",
      },
      {
        question: "Does a Client Database profile prove someone is risky?",
        answer:
          "No. Profiles are context signals based on moderated public summaries, confidence labels, evidence indicators, and response paths. They are not guarantees, legal findings, or credit reports.",
      },
    ],
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
    audience: "Business owners, clients, contractors, subcontractors, and staff reviewing customer-facing service businesses.",
    primaryIntent: "Inspect contractor and service-business legitimacy, verification posture, profile status, service area, and public project context.",
    authorityTitle: "The Contractor Database is built for business trust and verification.",
    authorityDescription:
      "Use it to understand whether a contractor or service business has a public profile, what type of business it is, where it operates, whether it is claimed or verified, and what public-safe project context is available.",
    publicSignals: [
      "Business Reliability Rating and confidence",
      "Claimed or verified profile status",
      "Service area, trade category, and business subtype",
      "Approved project/report context and correction paths",
    ],
    recordsExplained: [
      "Contractor profiles focus on customer-facing business readiness and project responsibility.",
      "A business may also have subcontractor capability when it works under another contractor.",
      "Private verification phone, raw evidence, internal notes, and private job data stay sealed.",
    ],
    internalLinks: [
      {
        label: "Search contractor profiles",
        href: "/search?profileType=contractor",
        description: "Find contractor and service-business profiles by trade, location, or name.",
      },
      {
        label: "Claim a business profile",
        href: "/claim-profile?profileType=contractor",
        description: "Claim, verify, correct, or strengthen a contractor profile.",
      },
      {
        label: "Business rating methodology",
        href: "/business-rating-methodology",
        description: "See how contractor business reliability signals are explained.",
      },
      {
        label: "Browse subcontractors",
        href: "/profiles/subcontractor",
        description: "Review trade partner records when a business works under another contractor.",
      },
    ],
    faqs: [
      {
        question: "Who appears in the Contractor Database?",
        answer:
          "The Contractor Database includes contractor, service-business, and customer-facing business profiles that are approved for public display.",
      },
      {
        question: "Can one company appear as both contractor and subcontractor?",
        answer:
          "Yes. Account capabilities can support both public views when a real business operates as a customer-facing contractor on some jobs and as a trade partner on others.",
      },
    ],
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
    audience: "General contractors, trade businesses, subcontractors, vendors, suppliers, and project partners reviewing trade relationships.",
    primaryIntent: "Evaluate trade scope, crew role, GC/sub relationship context, documentation readiness, and payment-chain signals.",
    authorityTitle: "The Subcontractor Database is built for trade-partner context.",
    authorityDescription:
      "Use it when the important question is not only who the business is, but what trade role it played, who hired whom, what scope was documented, and whether payment-chain context exists.",
    publicSignals: [
      "Trade Partner Reliability Rating and confidence",
      "Trade category, subtype, crew, or vendor context",
      "GC/sub relationship and scope documentation signals",
      "Evidence-on-file, retainage, payment, and resolution indicators",
    ],
    recordsExplained: [
      "Subcontractor profiles separate trade-partner records from customer-facing contractor records.",
      "Reports may involve subcontractor-to-contractor or contractor-to-subcontractor experiences.",
      "Raw contracts, invoices, photos, messages, job addresses, and staff notes stay private.",
    ],
    internalLinks: [
      {
        label: "Search subcontractor profiles",
        href: "/search?profileType=subcontractor",
        description: "Find trade partner profiles by name, trade category, city, or state.",
      },
      {
        label: "Claim a trade profile",
        href: "/claim-profile?profileType=subcontractor",
        description: "Claim, verify, correct, or strengthen a subcontractor profile.",
      },
      {
        label: "Trade rating methodology",
        href: "/business-rating-methodology",
        description: "Learn how Trade Partner Reliability Rating factors are presented.",
      },
      {
        label: "Report a trade relationship",
        href: "/submit-report?profileType=subcontractor",
        description: "Submit a documented GC/sub or trade-partner experience for moderation.",
      },
    ],
    faqs: [
      {
        question: "How is the Subcontractor Database different from the Contractor Database?",
        answer:
          "Subcontractor profiles focus on trade scope, crew role, GC/sub relationship context, payment-chain documentation, and trade partner reliability rather than only customer-facing business readiness.",
      },
      {
        question: "Does the Subcontractor Database publish private job details?",
        answer:
          "No. Public pages may show trade category, approved summaries, and evidence-on-file labels, but they do not publish raw files, job addresses, access notes, private evidence, or staff notes.",
      },
    ],
  },
]

export function getPublicDatabasePillar(id: PublicDatabasePillarId) {
  return publicDatabasePillars.find((pillar) => pillar.id === id)
}
