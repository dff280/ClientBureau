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
  { href: "/how-it-works", label: "Platform", description: "See the protection workflow." },
  { href: "/reports/recent", label: "Reports", description: "Browse approved public report context." },
  { href: "/pricing", label: "Pricing", description: "Choose a contractor protection plan." },
  { href: "/about", label: "About", description: "Learn how Client Bureau works." },
]

export const contractorPrimaryNav: NavigationItem[] = [
  { href: "/dashboard", label: "Dashboard", description: "Business protection workspace." },
  { href: "/search", label: "Search", description: "Client risk intelligence." },
  { href: "/dashboard?workspace=contracts", label: "Contracts", description: "Templates, signing links, and change orders." },
  { href: "/dashboard?workspace=evidence", label: "Evidence", description: "Private project documents." },
  { href: "/dashboard?workspace=recovery", label: "Payment", description: "Payment follow-up and readiness tracking." },
  { href: "/submit-report", label: "Reports", description: "Submit concern or positive reports." },
]

export const footerNavigationGroups: NavigationGroup[] = [
  {
    title: "Platform",
    links: [
      { href: "/search", label: "Search Clients" },
      { href: "/how-it-works", label: "How It Works" },
      { href: "/pricing", label: "Pricing" },
      { href: "/enterprise", label: "Enterprise" },
      { href: "/score-methodology", label: "Score Methodology" },
    ],
  },
  {
    title: "Workflows",
    links: [
      { href: "/submit-report", label: "Submit Report" },
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
