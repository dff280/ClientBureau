export type PageAsset = {
  src: string
  alt: string
  title: string
  description: string
  points: string[]
}

export const pageAssets = {
  searchDossier: {
    src: "/images/search-dossier-console.webp",
    alt: "Client Bureau search dossier interface showing an approved public profile preview, rating context, and private evidence indicators.",
    title: "Search dossier",
    description: "A premium client-check view for public context, private matching, evidence labels, and next-best actions.",
    points: ["Approved public summaries", "Private identifier matching", "Saved searches and watchlists"],
  },
  floridaAgreementPacket: {
    src: "/images/florida-agreement-packet.webp",
    alt: "Client Bureau Florida agreement packet visual showing scope prompts, payment terms, milestone fields, and private signing readiness.",
    title: "Florida agreement packet",
    description: "A private starter packet for scope, exclusions, deposits, milestones, Florida review prompts, and signing links.",
    points: ["Scope and exclusions", "Deposit and milestones", "Florida-specific review prompts"],
  },
  adminOpsCrm: {
    src: "/images/admin-ops-crm-console.webp",
    alt: "Client Bureau admin operations CRM showing pending reports, evidence review, disputes, profile edits, and audit-ready moderation queues.",
    title: "Admin Ops CRM",
    description: "An internal moderation command center for reports, profiles, evidence, claims, recovery, lien service, and audit notes.",
    points: ["Queue priorities", "Decision notes", "Private-data safeguards"],
  },
  mobileFieldApp: {
    src: "/images/mobile-field-app-console.webp",
    alt: "Client Bureau mobile field app visual showing Check a Client, daily actions, reports, contracts, and lien service tools.",
    title: "Mobile field app",
    description: "A field-ready command center for search, reports, contracts, evidence, recovery, and Florida lien service.",
    points: ["Check a Client first", "Job-stage tools", "Secure mobile session"],
  },
  evidenceVault: {
    src: "/images/evidence-vault-console.webp",
    alt: "Client Bureau evidence vault showing private invoices, photos, contracts, and document review status.",
    title: "Evidence Vault",
    description: "Private evidence records keep invoices, contracts, photos, approvals, screenshots, and PDFs organized.",
    points: ["Private by default", "Evidence-on-file summaries", "Review status tracking"],
  },
  resolutionDesk: {
    src: "/images/resolution-desk-console.webp",
    alt: "Client Bureau Resolution Desk visual showing overdue invoice status, contact attempts, payment plan context, and case actions.",
    title: "Resolution Desk",
    description: "A managed workflow for payment recovery, factual outreach, offer tracking, and resolution status.",
    points: ["Invoice timeline", "Logged contact attempts", "Contractor-direct resolution"],
  },
  platformHero: {
    src: "/images/client-bureau-platform-hero-bright.webp",
    alt: "Client Bureau premium platform preview for contractors and service businesses.",
    title: "Client Bureau platform",
    description: "Search, contract, document, recover, and monitor from one contractor business-protection workspace.",
    points: ["Search before the job", "Document during the job", "Protect payment after"],
  },
} satisfies Record<string, PageAsset>

export type PageAssetKey = keyof typeof pageAssets
