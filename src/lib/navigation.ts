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
  { href: "/search", label: "Run Client Check", description: "Search client records before accepting work." },
  { href: "/profiles", label: "Public Databases", description: "Browse Client, Contractor, and Subcontractor databases." },
  { href: "/pricing", label: "Pricing", description: "Choose a business protection plan." },
  { href: "/resources", label: "Resources", description: "Policies, methodology, and contractor guides." },
]

export const contractorDashboardNav: NavigationItem[] = [
  { href: "/dashboard", label: "Overview", description: "Daily work queue, account health, and next actions." },
  { href: "/search", label: "Check a Client", description: "Check a client before taking the job." },
  { href: "/dashboard/reports", label: "Reports", description: "Draft, submit, and track client experience reports." },
  { href: "/dashboard/jobs", label: "Jobs", description: "Private job records, property details, scope, and role-specific participants." },
  { href: "/dashboard/watchlist", label: "Watchlist", description: "Monitor saved clients and private-match signals." },
  { href: "/dashboard/growth", label: "Growth", description: "Invite contractors, earn credits, claim your profile, and request client feedback." },
  { href: "/dashboard/contracts", label: "Contracts", description: "Signing links, agreement packets, change orders, and client invites." },
  { href: "/dashboard/recovery", label: "Payment Recovery", description: "Get help recovering payment, track Resolution Desk cases, and document invoice follow-up." },
  { href: "/dashboard/lien-readiness", label: "Florida Lien Service", description: "Private Florida notice, filing, recording proof, and release workflows." },
  { href: "/dashboard/evidence", label: "Evidence Vault", description: "Private invoices, screenshots, contracts, photos, PDFs, and review status." },
  { href: "/dashboard/alerts", label: "Alerts", description: "Watchlist changes, dispute updates, and rating movement." },
  { href: "/dashboard/billing", label: "Billing", description: "Plan, usage, invoices, and payment settings." },
  { href: "/dashboard/activity", label: "Activity", description: "Recent workspace actions, client files, and pipeline movement." },
]

export const contractorDashboardGroups: NavigationGroup[] = [
  {
    title: "Start",
    links: contractorDashboardNav.filter((item) => ["Overview", "Jobs"].includes(item.label)),
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
      { href: "/platform", label: "Platform Overview", description: "The complete Client Bureau system for checking clients and protecting jobs." },
      { href: "/score-methodology", label: "Client Rating Methodology", description: "How client ratings, risk levels, and confidence are presented." },
      { href: "/business-rating-methodology", label: "Business & Trade Ratings", description: "How public contractor and subcontractor profile ratings are calculated." },
      { href: "/pricing", label: "Pricing", description: "Plans for contractors, service businesses, teams, and enterprise review." },
      { href: "/mobile-app", label: "Mobile App", description: "Download the Android contractor app and review mobile workflows." },
      { href: "/enterprise", label: "Enterprise", description: "Team workflows, moderation controls, and account support." },
      { href: "/client-screening-for-contractors", label: "Client Screening", description: "Check clients before scheduling labor, materials, or deposits." },
      { href: "/contractor-verification", label: "Contractor Verification", description: "Understand public contractor trust profiles, claim status, and business verification context." },
      { href: "/subcontractor-payment-chain-documentation", label: "Subcontractor Payment Chain", description: "Document GC/sub relationships, scope, retainage, pay applications, and trade evidence." },
      { href: "/evidence-privacy-for-contractors", label: "Evidence Privacy", description: "Learn what evidence stays private and what public evidence labels can show." },
      { href: "/response-correction-rights", label: "Response and Correction Rights", description: "Review response, dispute, correction, claim, and resolution paths." },
      { href: "/contractor-contract-template", label: "Contract Templates", description: "Create agreement packets and e-signature workflows." },
      { href: "/florida-contractor-agreement-template", label: "Florida Agreement Starter", description: "Use a Florida-aware starter packet for scope, payments, change orders, and review prompts." },
      { href: "/change-order-template", label: "Change Orders", description: "Document scope changes before extra work starts." },
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
    title: "Databases and Records",
    links: [
      { href: "/clients", label: "Client Database", description: "Browse approved client, homeowner, property owner, and customer profiles." },
      { href: "/profiles/contractor", label: "Contractor Database", description: "Public contractor and service-business profile records." },
      { href: "/profiles/subcontractor", label: "Subcontractor Database", description: "Public subcontractor and trade professional records." },
      { href: "/reports/recent", label: "Recent Reports", description: "Approved public client-report context." },
      { href: "/reports/non-payment", label: "Non-Payment Reports", description: "Moderated reports involving payment issues." },
      { href: "/clients/florida", label: "Florida Profiles", description: "SEO-visible public profiles by market." },
      { href: "/clients/florida/orlando", label: "Orlando Profiles", description: "Approved public client profiles in the Orlando market." },
      { href: "/profiles", label: "All Public Databases", description: "Unified profile view across clients, contractors, and subcontractors." },
      { href: "/businesses", label: "Business Profiles", description: "Public contractor and service-business trust profiles." },
      { href: "/industries", label: "Industries and Trades", description: "Browse Client Bureau pages by audience, trade, and service category." },
      { href: "/industries/contractors", label: "Contractors", description: "Client Bureau for contractor workflows." },
      { href: "/industries/subcontractors", label: "Subcontractors", description: "Trade crews, payment-chain records, and contractor relationship context." },
      { href: "/industries/roofing", label: "Roofing", description: "Client checks and protection workflows for roofing contractors." },
      { href: "/industries/electrical", label: "Electrical", description: "Client checks and payment-chain context for electrical contractors." },
      { href: "/homeowner-wont-pay-contractor", label: "Homeowner Won't Pay Guide", description: "Private documentation and recovery steps for overdue invoices." },
    ],
  },
]

export const footerNavigationGroups: NavigationGroup[] = [
  {
    title: "Public Databases",
    links: [
      { href: "/", label: "Home" },
      { href: "/search", label: "Check a Client" },
      { href: "/clients", label: "Client Database" },
      { href: "/profiles/contractor", label: "Contractor Database" },
      { href: "/profiles/subcontractor", label: "Subcontractor Database" },
      { href: "/profiles", label: "All Public Databases" },
      { href: "/reports/recent", label: "Recent Reports" },
    ],
  },
  {
    title: "Platform",
    links: [
      { href: "/platform", label: "Platform" },
      { href: "/how-it-works", label: "How It Works" },
      { href: "/pricing", label: "Pricing" },
      { href: "/resources", label: "Resources" },
      { href: "/mobile-app", label: "Mobile App" },
      { href: "/enterprise", label: "Enterprise" },
      { href: "/client-screening-for-contractors", label: "Client Screening" },
      { href: "/contractor-verification", label: "Contractor Verification" },
      { href: "/subcontractor-payment-chain-documentation", label: "Subcontractor Payment Chain" },
      { href: "/evidence-privacy-for-contractors", label: "Evidence Privacy" },
      { href: "/response-correction-rights", label: "Response Rights" },
      { href: "/submit-report", label: "Report a Client Experience" },
    ],
  },
  {
    title: "Tools and Services",
    links: [
      { href: "/platform", label: "Jobs" },
      { href: "/contractor-contract-template", label: "Contracts & Templates" },
      { href: "/florida-contractor-agreement-template", label: "Florida Agreement Starter" },
      { href: "/change-order-template", label: "Change Orders" },
      { href: "/payment-recovery-service", label: "Payment Recovery" },
      { href: "/florida-lien-filing-service", label: "Florida Lien Filing" },
      { href: "/florida-lien-notice-service", label: "Florida Notice to Owner" },
      { href: "/homeowner-wont-pay-contractor", label: "Unpaid Invoice Guide" },
      { href: "/report-policy", label: "Evidence Vault" },
    ],
  },
  {
    title: "Company and Rules",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/claim-profile", label: "Claim a Profile" },
      { href: "/client-response", label: "Client Response" },
      { href: "/response-correction-rights", label: "Response and Correction Rights" },
      { href: "/score-methodology", label: "Client Ratings" },
      { href: "/business-rating-methodology", label: "Business & Trade Ratings" },
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
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
      { href: "/admin/profiles", label: "Unified Profiles", description: "Manage clients, contractors, subcontractors, claims, visibility, and duplicate signals." },
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
