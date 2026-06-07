export type NavigationItem = {
  href: string
  label: string
  description?: string
}

export type NavigationGroup = {
  title: string
  links: NavigationItem[]
}

export const publicPrimaryNav: NavigationItem[] = [
  { href: "/search", label: "Check a Client", description: "Search client history before accepting work." },
  { href: "/how-it-works", label: "How It Works", description: "See the protection workflow." },
  { href: "/pricing", label: "Pricing", description: "Choose a business protection plan." },
  { href: "/resources", label: "Resources", description: "Policies, methodology, and contractor guides." },
  { href: "/about", label: "About", description: "Learn how Client Bureau works." },
  { href: "/contact", label: "Contact", description: "Reach Client Bureau support and policy teams." },
]

export const contractorDashboardNav: NavigationItem[] = [
  { href: "/dashboard", label: "Overview", description: "Daily work queue, account health, and next actions." },
  { href: "/search", label: "Check a Client", description: "Check a client before taking the job." },
  { href: "/dashboard/reports", label: "Reports", description: "Draft, submit, and track client experience reports." },
  { href: "/dashboard/watchlist", label: "Watchlist", description: "Monitor saved clients and private-match signals." },
  { href: "/dashboard/growth", label: "Growth", description: "Invite contractors, earn credits, claim your profile, and request client feedback." },
  { href: "/dashboard/contracts", label: "Contracts", description: "Signing links, agreement packets, change orders, and client invites." },
  { href: "/dashboard/recovery", label: "Payment Recovery", description: "Get help recovering payment, track Resolution Desk cases, and document invoice follow-up." },
  { href: "/dashboard/lien-readiness", label: "Florida Lien Service", description: "Private Florida notice, filing, recording proof, and release workflows." },
  { href: "/dashboard/evidence", label: "Evidence Vault", description: "Private invoices, screenshots, contracts, photos, PDFs, and review status." },
  { href: "/dashboard/watchlist", label: "Alerts", description: "Watchlist changes, dispute updates, and rating movement." },
  { href: "/dashboard/billing", label: "Billing", description: "Plan, usage, invoices, and payment settings." },
  { href: "/dashboard/activity", label: "Activity", description: "Recent workspace actions, client files, and pipeline movement." },
]

export const contractorDashboardGroups: NavigationGroup[] = [
  {
    title: "Start",
    links: contractorDashboardNav.filter((item) => ["Overview"].includes(item.label)),
  },
  {
    title: "Find Clients",
    links: contractorDashboardNav.filter((item) =>
      ["Check a Client", "Watchlist", "Alerts"].includes(item.label),
    ),
  },
  {
    title: "Reports",
    links: [
      ...contractorDashboardNav.filter((item) => ["Reports"].includes(item.label)),
      { href: "/submit-report", label: "Report a Client Experience", description: "Document a client experience for moderation." },
    ],
  },
  {
    title: "Documents",
    links: contractorDashboardNav.filter((item) =>
      ["Contracts", "Evidence Vault"].includes(item.label),
    ),
  },
  {
    title: "Services",
    links: contractorDashboardNav.filter((item) =>
      ["Payment Recovery", "Florida Lien Service"].includes(item.label),
    ),
  },
  {
    title: "Account",
    links: contractorDashboardNav.filter((item) => ["Growth", "Billing", "Activity"].includes(item.label)),
  },
]

export const contractorPrimaryNav = contractorDashboardNav

export const resourceNavigationGroups: NavigationGroup[] = [
  {
    title: "Learn the Platform",
    links: [
      { href: "/how-it-works", label: "How It Works", description: "Search, decide, document, and resolve." },
      { href: "/score-methodology", label: "Rating Methodology", description: "How ratings, risk levels, and confidence are presented." },
      { href: "/business-rating-methodology", label: "Business Rating", description: "How public contractor and service-business ratings are calculated." },
      { href: "/pricing", label: "Pricing", description: "Plans for contractors, service businesses, teams, and enterprise review." },
      { href: "/enterprise", label: "Enterprise", description: "Team workflows, moderation controls, and account support." },
    ],
  },
  {
    title: "Report and Response Rules",
    links: [
      { href: "/report-policy", label: "Report Policy", description: "Standards for contractor-submitted public summaries." },
      { href: "/dispute-policy", label: "Dispute Policy", description: "Client response, correction, and resolution paths." },
      { href: "/moderation-policy", label: "Moderation Policy", description: "How approved public content is reviewed." },
      { href: "/client-response", label: "Client Response", description: "Submit a response, dispute, correction, or resolution update." },
    ],
  },
  {
    title: "Public Research",
    links: [
      { href: "/clients", label: "Client Directory", description: "Browse approved public profiles by state and city." },
      { href: "/reports/recent", label: "Recent Reports", description: "Approved public client-report context." },
      { href: "/reports/non-payment", label: "Non-Payment Reports", description: "Moderated reports involving payment issues." },
      { href: "/clients/florida", label: "Florida Profiles", description: "SEO-visible public profiles by market." },
      { href: "/businesses", label: "Business Profiles", description: "Public contractor and service-business trust profiles." },
      { href: "/industries/contractors", label: "Contractors", description: "Client Bureau for contractor workflows." },
    ],
  },
]

export const footerNavigationGroups: NavigationGroup[] = [
  {
    title: "Platform",
    links: [
      { href: "/search", label: "Check a Client" },
      { href: "/how-it-works", label: "How It Works" },
      { href: "/pricing", label: "Pricing" },
      { href: "/resources", label: "Resources" },
      { href: "/clients", label: "Client Directory" },
      { href: "/enterprise", label: "Enterprise" },
      { href: "/score-methodology", label: "Rating Methodology" },
      { href: "/business-rating-methodology", label: "Business Rating" },
    ],
  },
  {
    title: "Contractor Tools",
    links: [
      { href: "/businesses", label: "Business Profiles" },
      { href: "/submit-report", label: "Report a Client Experience" },
      { href: "/dashboard/contracts", label: "Contracts" },
      { href: "/dashboard/growth", label: "Growth Engine" },
      { href: "/dashboard/recovery", label: "Payment Recovery" },
      { href: "/dashboard/lien-readiness", label: "Florida Lien Service" },
      { href: "/payment-recovery-service", label: "Recovery Service" },
      { href: "/florida-lien-filing-service", label: "Florida Lien Filing" },
      { href: "/dashboard/evidence", label: "Evidence Vault" },
      { href: "/dashboard/billing", label: "Billing" },
    ],
  },
  {
    title: "Public Records",
    links: [
      { href: "/client-response", label: "Client Response" },
      { href: "/clients", label: "Client Directory" },
      { href: "/reports/recent", label: "Recent Reports" },
      { href: "/clients/florida", label: "Florida Profiles" },
      { href: "/industries/contractors", label: "Contractors" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
  {
    title: "Policies",
    links: [
      { href: "/report-policy", label: "Report Policy" },
      { href: "/dispute-policy", label: "Disputes" },
      { href: "/moderation-policy", label: "Moderation" },
    ],
  },
]

export const adminNavigationGroups: NavigationGroup[] = [
  {
    title: "Command Center",
    links: [
      { href: "/admin", label: "Overview", description: "Platform health, urgent queues, and daily operating view." },
    ],
  },
  {
    title: "Moderation",
    links: [
      { href: "/admin/reports", label: "Review Reports", description: "Approve, reject, edit summaries, and bulk moderate reports." },
      { href: "/admin/discussions", label: "Review Discussions", description: "Moderate discussion entries, responses, and corrections." },
      { href: "/admin/discussions?view=responses", label: "Client Responses", description: "Review client responses, disputes, corrections, and resolution updates." },
    ],
  },
  {
    title: "Records",
    links: [
      { href: "/admin/clients", label: "Manage Client Profiles", description: "Manage client profiles, public visibility, and SEO-safe fields." },
      { href: "/admin/contractors", label: "Businesses / Users", description: "Review business profiles, user accounts, verification, and account health." },
      { href: "/admin/reports?view=all", label: "All Reports", description: "Review report records across statuses." },
    ],
  },
  {
    title: "Tools",
    links: [
      { href: "/admin/uploads", label: "CSV Intake", description: "Review CSV batches, duplicate signals, validation errors, and staged imports." },
      { href: "/admin/recovery", label: "Recovery Cases", description: "Review payment follow-up cases, call logs, and lien packets." },
      { href: "/admin/contracts", label: "Contracts", description: "Oversee agreement packets, signing links, client invites, and contract workflow rules." },
    ],
  },
  {
    title: "Platform",
    links: [
      { href: "/admin/audit-log", label: "Audit Log", description: "Track admin actions, status changes, and publication decisions." },
      { href: "/admin/settings", label: "Settings", description: "Configure moderation, publication, evidence privacy, and workflow defaults." },
    ],
  },
]
