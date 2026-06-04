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
  { href: "/search", label: "Search", description: "Check clients before accepting work." },
  { href: "/how-it-works", label: "How It Works", description: "See the protection workflow." },
  { href: "/pricing", label: "Pricing", description: "Choose a contractor protection plan." },
  { href: "/resources", label: "Resources", description: "Policies, methodology, and contractor guides." },
  { href: "/about", label: "About", description: "Learn how Client Bureau works." },
  { href: "/contact", label: "Contact", description: "Reach Client Bureau support and policy teams." },
]

export const contractorDashboardNav: NavigationItem[] = [
  { href: "/dashboard", label: "Overview", description: "Daily work queue, account health, and next actions." },
  { href: "/search", label: "Search Clients", description: "Check a client before taking the job." },
  { href: "/dashboard?workspace=reports", label: "Reports", description: "Draft, submit, and track client reports." },
  { href: "/dashboard?workspace=watchlist", label: "Watchlist", description: "Monitor saved clients and private-match signals." },
  { href: "/dashboard?workspace=contracts", label: "Contracts", description: "Signing links, agreement packets, and change orders." },
  { href: "/dashboard?workspace=recovery", label: "Payment Recovery", description: "Invoice timelines, call logs, and resolution tracking." },
  { href: "/dashboard?workspace=lien-readiness", label: "Lien Readiness", description: "Private deadline and document readiness checklists." },
  { href: "/dashboard?workspace=evidence", label: "Evidence Vault", description: "Private invoices, screenshots, contracts, photos, and PDFs." },
  { href: "/dashboard?workspace=alerts", label: "Alerts", description: "Watchlist changes, dispute updates, and score movement." },
  { href: "/dashboard?workspace=billing", label: "Billing", description: "Plan, usage, invoices, and payment settings." },
]

export const contractorDashboardGroups: NavigationGroup[] = [
  {
    title: "Before the Job",
    links: contractorDashboardNav.filter((item) =>
      ["Overview", "Search Clients", "Watchlist", "Alerts"].includes(item.label),
    ),
  },
  {
    title: "Agreement and Records",
    links: contractorDashboardNav.filter((item) =>
      ["Contracts", "Evidence Vault", "Reports"].includes(item.label),
    ),
  },
  {
    title: "After the Invoice",
    links: contractorDashboardNav.filter((item) =>
      ["Payment Recovery", "Lien Readiness"].includes(item.label),
    ),
  },
  {
    title: "Account",
    links: contractorDashboardNav.filter((item) => ["Billing"].includes(item.label)),
  },
]

export const contractorPrimaryNav = contractorDashboardNav

export const resourceNavigationGroups: NavigationGroup[] = [
  {
    title: "Learn the Platform",
    links: [
      { href: "/how-it-works", label: "How It Works", description: "Search, decide, document, and resolve." },
      { href: "/score-methodology", label: "Score Methodology", description: "How scores, risk levels, and confidence are presented." },
      { href: "/pricing", label: "Pricing", description: "Plans for contractors, teams, and enterprise review." },
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
      { href: "/reports/recent", label: "Recent Reports", description: "Approved public client-report context." },
      { href: "/reports/non-payment", label: "Non-Payment Reports", description: "Moderated reports involving payment issues." },
      { href: "/clients/florida", label: "Florida Profiles", description: "SEO-visible public profiles by market." },
      { href: "/industries/contractors", label: "Contractors", description: "Client Bureau for contractor workflows." },
    ],
  },
]

export const footerNavigationGroups: NavigationGroup[] = [
  {
    title: "Platform",
    links: [
      { href: "/search", label: "Search Clients" },
      { href: "/how-it-works", label: "How It Works" },
      { href: "/pricing", label: "Pricing" },
      { href: "/resources", label: "Resources" },
      { href: "/enterprise", label: "Enterprise" },
      { href: "/score-methodology", label: "Score Methodology" },
    ],
  },
  {
    title: "Contractor Tools",
    links: [
      { href: "/submit-report", label: "Submit Report" },
      { href: "/dashboard?workspace=contracts", label: "Contracts" },
      { href: "/dashboard?workspace=recovery", label: "Payment Recovery" },
      { href: "/dashboard?workspace=lien-readiness", label: "Lien Readiness" },
      { href: "/dashboard?workspace=evidence", label: "Evidence Vault" },
      { href: "/dashboard?workspace=billing", label: "Billing" },
    ],
  },
  {
    title: "Public Records",
    links: [
      { href: "/client-response", label: "Client Response" },
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
    title: "Moderation",
    links: [
      { href: "/admin", label: "Command Center" },
      { href: "/admin/reports", label: "Report Queue" },
      { href: "/admin/discussions", label: "Responses" },
      { href: "/admin/uploads", label: "Bulk Uploads" },
    ],
  },
  {
    title: "Records",
    links: [
      { href: "/admin/clients", label: "Client Profiles" },
      { href: "/admin/contractors", label: "Contractors" },
      { href: "/admin/audit-log", label: "Audit Log" },
      { href: "/admin/settings", label: "Rules" },
    ],
  },
]
