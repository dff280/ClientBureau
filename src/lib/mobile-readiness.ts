export type MobileReadinessStatus = "ready" | "needs-adapter" | "web-only" | "planned"

export type MobileSurfaceCategory = "component" | "api" | "responsive" | "workflow"

export type MobileComponentAudit = {
  id: string
  component: string
  category: "component"
  status: MobileReadinessStatus
  mobileRisk: "low" | "medium" | "high"
  recommendation: string
}

export type MobileApiAudit = {
  id: string
  route: string
  method: "GET" | "POST"
  category: "api"
  auth: "public" | "session" | "bearer" | "admin" | "webhook"
  mobileUse: string
  status: MobileReadinessStatus
  notes: string
}

export type ResponsiveAudit = {
  id: string
  surface: string
  category: "responsive"
  status: MobileReadinessStatus
  mobileRisk: "low" | "medium" | "high"
  recommendation: string
}

export type MobileWorkflow = {
  id: string
  label: string
  category: "workflow"
  entryRoute: string
  primaryAction: string
  authRequired: boolean
  apiStrategy: string
  offlineRisk: "low" | "medium" | "high"
  status: MobileReadinessStatus
}

export type MobileReadinessItem =
  | MobileComponentAudit
  | MobileApiAudit
  | ResponsiveAudit
  | MobileWorkflow

export const mobileComponentAudit: MobileComponentAudit[] = [
  {
    id: "client-dashboard-shell",
    component: "ClientDashboardShell",
    category: "component",
    status: "ready",
    mobileRisk: "low",
    recommendation:
      "Keep desktop grouped navigation, but use the compact mobile tool rail as the native-app tab model.",
  },
  {
    id: "enterprise-dashboard-overview",
    component: "EnterpriseDashboardOverview",
    category: "component",
    status: "needs-adapter",
    mobileRisk: "medium",
    recommendation:
      "Convert dense KPI, trend, and activity sections into native cards with one primary action per screen.",
  },
  {
    id: "search-command-center",
    component: "SearchCommandCenter",
    category: "component",
    status: "ready",
    mobileRisk: "low",
    recommendation:
      "Use predictive suggestions and result previews as the mobile app home search experience.",
  },
  {
    id: "dashboard-reports",
    component: "DashboardReports",
    category: "component",
    status: "needs-adapter",
    mobileRisk: "medium",
    recommendation:
      "Keep report status tabs, but move report detail sheets into a native full-screen review view.",
  },
  {
    id: "risk-ops-workspace",
    component: "RiskOpsWorkspace",
    category: "component",
    status: "needs-adapter",
    mobileRisk: "high",
    recommendation:
      "Split recovery, lien, evidence, contracts, and watchlist modules into dedicated native routes.",
  },
  {
    id: "admin-shell",
    component: "AdminShell",
    category: "component",
    status: "web-only",
    mobileRisk: "medium",
    recommendation:
      "Keep full moderation CRM on web first; mobile admin can be a later limited approval queue.",
  },
]

export const mobileApiAudit: MobileApiAudit[] = [
  {
    id: "session",
    route: "/api/session",
    method: "GET",
    category: "api",
    auth: "session",
    mobileUse: "Current account, role, plan, and route-entry state.",
    status: "needs-adapter",
    notes: "Add a mobile BFF variant with stable JSON and token-based Supabase session handling.",
  },
  {
    id: "mobile-me",
    route: "/api/mobile/me",
    method: "GET",
    category: "api",
    auth: "bearer",
    mobileUse: "Current mobile account, role, and identity payload.",
    status: "ready",
    notes: "Uses Supabase bearer-token auth with a cookie fallback for local browser QA.",
  },
  {
    id: "mobile-dashboard",
    route: "/api/mobile/dashboard",
    method: "GET",
    category: "api",
    auth: "bearer",
    mobileUse: "Contractor dashboard summary, counts, report statuses, and private ops summaries.",
    status: "ready",
    notes: "Returns product-shaped payloads and strips private evidence storage paths.",
  },
  {
    id: "mobile-recovery-list",
    route: "/api/mobile/recovery",
    method: "GET",
    category: "api",
    auth: "bearer",
    mobileUse: "Managed recovery cases, readiness, and service-fee status.",
    status: "ready",
    notes: "No internal staff notes or private evidence paths are exposed.",
  },
  {
    id: "mobile-recovery-create",
    route: "/api/mobile/recovery",
    method: "POST",
    category: "api",
    auth: "bearer",
    mobileUse: "Create a managed recovery case using the same validation as web.",
    status: "ready",
    notes: "Uses the shared managed recovery schema and repository service.",
  },
  {
    id: "mobile-lien-list",
    route: "/api/mobile/lien-service",
    method: "GET",
    category: "api",
    auth: "bearer",
    mobileUse: "Florida lien service cases, readiness, authorization, and service-fee state.",
    status: "ready",
    notes: "Returns status summaries without raw filings, receipts, or private evidence files.",
  },
  {
    id: "mobile-lien-create",
    route: "/api/mobile/lien-service",
    method: "POST",
    category: "api",
    auth: "bearer",
    mobileUse: "Create a Florida lien service case using shared validation.",
    status: "ready",
    notes: "Florida-only case creation remains routed through attorney/vendor review language.",
  },
  {
    id: "auth-login",
    route: "/api/auth/login",
    method: "POST",
    category: "api",
    auth: "public",
    mobileUse: "Credential login bridge for web. Native apps should prefer Supabase Auth SDK.",
    status: "web-only",
    notes: "Keep current cookie login for web and define native auth separately.",
  },
  {
    id: "auth-logout",
    route: "/api/auth/logout",
    method: "POST",
    category: "api",
    auth: "session",
    mobileUse: "Web logout bridge.",
    status: "web-only",
    notes: "Native apps should clear Supabase sessions locally and call a mobile logout endpoint if needed.",
  },
  {
    id: "health",
    route: "/api/health",
    method: "GET",
    category: "api",
    auth: "public",
    mobileUse: "App release readiness, support diagnostics, and uptime checks.",
    status: "ready",
    notes: "Already returns non-secret configured state.",
  },
  {
    id: "stripe-checkout",
    route: "/api/stripe/checkout",
    method: "POST",
    category: "api",
    auth: "session",
    mobileUse: "Mobile subscription upgrade handoff.",
    status: "needs-adapter",
    notes: "Mobile apps should open hosted checkout or use platform-compliant in-app purchase rules by offer type.",
  },
  {
    id: "mobile-search",
    route: "/api/mobile/search",
    method: "GET",
    category: "api",
    auth: "bearer",
    mobileUse: "Predictive client search, result previews, private-match messaging, and search analytics.",
    status: "ready",
    notes: "Uses existing search repository and returns mobile-safe result DTOs.",
  },
  {
    id: "mobile-saved-searches",
    route: "/api/mobile/saved-searches",
    method: "POST",
    category: "api",
    auth: "bearer",
    mobileUse: "Save client searches from the mobile search workflow.",
    status: "ready",
    notes: "Uses existing saved-search validation and strips private identifiers.",
  },
  {
    id: "mobile-reports",
    route: "/api/mobile/reports",
    method: "POST",
    category: "api",
    auth: "bearer",
    mobileUse: "Submit contractor-submitted reports from native step flows.",
    status: "ready",
    notes: "Uses shared report validation and returns mobile-safe report summaries.",
  },
  {
    id: "mobile-contracts",
    route: "/api/mobile/contracts",
    method: "POST",
    category: "api",
    auth: "bearer",
    mobileUse: "Create agreement packets and list private contract packet state.",
    status: "ready",
    notes: "Does not expose private signed snapshots or raw client email.",
  },
  {
    id: "mobile-evidence",
    route: "/api/mobile/evidence",
    method: "GET",
    category: "api",
    auth: "bearer",
    mobileUse: "Private evidence summaries and evidence-vault status updates.",
    status: "ready",
    notes: "No raw storage paths are returned.",
  },
  {
    id: "mobile-watchlist",
    route: "/api/mobile/watchlist",
    method: "POST",
    category: "api",
    auth: "bearer",
    mobileUse: "Add watched clients and load private alert counts.",
    status: "ready",
    notes: "Watchlist records remain private to the contractor workspace.",
  },
  {
    id: "service-fee-checkout",
    route: "/api/stripe/service-fee/checkout",
    method: "POST",
    category: "api",
    auth: "session",
    mobileUse: "Managed recovery and lien service fee checkout.",
    status: "needs-adapter",
    notes: "Use hosted checkout handoff with a return-to-app URL scheme later.",
  },
  {
    id: "stripe-webhook",
    route: "/api/stripe/webhook",
    method: "POST",
    category: "api",
    auth: "webhook",
    mobileUse: "Server-to-server billing updates only.",
    status: "web-only",
    notes: "Never called directly by mobile apps.",
  },
  {
    id: "admin-session",
    route: "/api/admin/session",
    method: "GET",
    category: "api",
    auth: "admin",
    mobileUse: "Internal admin diagnostics.",
    status: "web-only",
    notes: "Keep admin diagnostics web-only unless a limited staff app is scoped later.",
  },
]

export const responsiveAudit: ResponsiveAudit[] = [
  {
    id: "dashboard-mobile-entry",
    surface: "/dashboard and /dashboard/[tool]",
    category: "responsive",
    status: "ready",
    mobileRisk: "low",
    recommendation:
      "Use the mobile tool rail for fast switching and keep the long grouped sidebar desktop-only.",
  },
  {
    id: "public-profile",
    surface: "/client/[slug]",
    category: "responsive",
    status: "ready",
    mobileRisk: "low",
    recommendation:
      "Keep profile score, trust signals, timeline, and response CTA visible without exposing private data.",
  },
  {
    id: "search",
    surface: "/search",
    category: "responsive",
    status: "ready",
    mobileRisk: "low",
    recommendation:
      "Treat predictive search as the mobile app's primary entry point.",
  },
  {
    id: "submit-report",
    surface: "/submit-report",
    category: "responsive",
    status: "needs-adapter",
    mobileRisk: "medium",
    recommendation:
      "Convert the guided report workflow into native steps with resumable drafts and camera upload.",
  },
  {
    id: "contract-signing",
    surface: "/contract/[token]",
    category: "responsive",
    status: "needs-adapter",
    mobileRisk: "medium",
    recommendation:
      "Preserve noindex private signing, then add native deep links for client review and typed signature.",
  },
]

export const mobileWorkflows: MobileWorkflow[] = [
  {
    id: "search-client",
    label: "Check a Client",
    category: "workflow",
    entryRoute: "/search",
    primaryAction: "Search by name, business, city, state, phone, or email.",
    authRequired: true,
    apiStrategy: "Add /api/mobile/search backed by the existing search repository.",
    offlineRisk: "low",
    status: "ready",
  },
  {
    id: "dashboard-overview",
    label: "Daily dashboard",
    category: "workflow",
    entryRoute: "/dashboard",
    primaryAction: "Review today's work, alerts, plan, and recent activity.",
    authRequired: true,
    apiStrategy: "Add /api/mobile/dashboard as a stable summary payload.",
    offlineRisk: "low",
    status: "ready",
  },
  {
    id: "submit-report",
    label: "Report a Client Experience",
    category: "workflow",
    entryRoute: "/submit-report",
    primaryAction: "Create a documented contractor-submitted report with private evidence.",
    authRequired: true,
    apiStrategy: "Add /api/mobile/reports with draft, submit, and evidence attachment endpoints.",
    offlineRisk: "medium",
    status: "ready",
  },
  {
    id: "contract-packets",
    label: "Contracts and e-signatures",
    category: "workflow",
    entryRoute: "/dashboard/contracts",
    primaryAction: "Create agreement packets, share links, and track signature state.",
    authRequired: true,
    apiStrategy: "Add /api/mobile/contracts with packet, share, and signature status endpoints.",
    offlineRisk: "medium",
    status: "ready",
  },
  {
    id: "managed-recovery",
    label: "Managed payment recovery",
    category: "workflow",
    entryRoute: "/dashboard/recovery",
    primaryAction: "Open Resolution Desk cases and track contractor-direct payment outcomes.",
    authRequired: true,
    apiStrategy: "Add /api/mobile/recovery with service fee checkout handoff.",
    offlineRisk: "medium",
    status: "ready",
  },
  {
    id: "florida-lien-service",
    label: "Florida lien service",
    category: "workflow",
    entryRoute: "/dashboard/lien-readiness",
    primaryAction: "Submit Florida lien service cases, authorization, and filing status.",
    authRequired: true,
    apiStrategy: "Add /api/mobile/lien-service with strict private-data response shaping.",
    offlineRisk: "high",
    status: "ready",
  },
  {
    id: "client-response",
    label: "Client response and dispute",
    category: "workflow",
    entryRoute: "/client-response",
    primaryAction: "Submit response, correction, dispute, or resolution updates for moderation.",
    authRequired: false,
    apiStrategy: "Add /api/mobile/client-response for public submissions and upload tokens.",
    offlineRisk: "low",
    status: "needs-adapter",
  },
]

export function getMobileReadinessItems(): MobileReadinessItem[] {
  return [
    ...mobileComponentAudit,
    ...mobileApiAudit,
    ...responsiveAudit,
    ...mobileWorkflows,
  ]
}

export function getMobileReadinessSummary() {
  const items = getMobileReadinessItems()
  const scoredItems = items.filter((item) => item.status !== "web-only")
  const ready = items.filter((item) => item.status === "ready").length
  const needsAdapter = items.filter((item) => item.status === "needs-adapter").length
  const planned = items.filter((item) => item.status === "planned").length
  const webOnly = items.filter((item) => item.status === "web-only").length
  const categoryCounts = items.reduce<Record<MobileSurfaceCategory, number>>(
    (counts, item) => {
      counts[item.category] += 1
      return counts
    },
    { api: 0, component: 0, responsive: 0, workflow: 0 },
  )

  const readinessScore =
    scoredItems.length === 0
      ? 0
      : Math.round(
          ((ready + needsAdapter * 0.5 + planned * 0.25) / scoredItems.length) * 100,
        )

  return {
    total: items.length,
    ready,
    needsAdapter,
    planned,
    webOnly,
    categoryCounts,
    readinessScore,
  }
}

export function getMobileFirstWorkflows() {
  return mobileWorkflows
}

export function getMobileAppApiBacklog() {
  return mobileApiAudit.filter((item) => item.status === "needs-adapter")
}
