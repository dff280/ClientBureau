import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  AlertCircle,
  CreditCard,
  FilePlus2,
  Landmark,
  PhoneCall,
  Search,
  Signature,
  Vault,
} from "lucide-react"

import { ClientDashboardShell } from "@/components/dashboard/client-dashboard-shell"
import { DashboardReports } from "@/components/dashboard/dashboard-reports"
import { DashboardSection, StatusBadge } from "@/components/dashboard/dashboard-ui"
import {
  RiskOpsWorkspace,
  type DashboardWorkspaceTab,
} from "@/components/dashboard/risk-ops-workspace"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getClientDashboardData } from "@/lib/dashboard-data"

export const dynamic = "force-dynamic"

type DashboardToolConfig = {
  activeHref: string
  badge: string
  description: string
  explanations: {
    title: string
    text: string
  }[]
  primaryAction?: {
    href: string
    icon: typeof Search
    label: string
  }
  secondaryAction?: {
    href: string
    icon: typeof Search
    label: string
  }
  tab: DashboardWorkspaceTab
  title: string
}

const dashboardToolConfigs: Record<string, DashboardToolConfig> = {
  activity: {
    activeHref: "/dashboard/activity",
    badge: "Activity",
    description: "Review recent workspace actions, client pipeline movement, and private work file history.",
    explanations: [
      {
        title: "What this does",
        text: "Shows the activity trail that helps you remember what happened on each client and project.",
      },
      {
        title: "When to use it",
        text: "Open this at the start or end of a workday to review open tasks, client files, and next actions.",
      },
      {
        title: "What stays private",
        text: "Client work files, notes, and pipeline context do not appear on public client profile pages.",
      },
    ],
    primaryAction: { href: "/search", icon: Search, label: "Search a client" },
    tab: "activity",
    title: "Activity",
  },
  billing: {
    activeHref: "/dashboard/billing",
    badge: "Account",
    description: "Review plan status, usage, limits, billing readiness, and account verification.",
    explanations: [
      {
        title: "What this does",
        text: "Keeps your plan, account status, verification, and usage limits in one plain-English place.",
      },
      {
        title: "When to use it",
        text: "Use Billing when you need to review plan limits, upgrade, or check verification readiness.",
      },
      {
        title: "What stays private",
        text: "Billing and verification details stay inside your account workspace.",
      },
    ],
    primaryAction: { href: "/pricing", icon: CreditCard, label: "View plans" },
    tab: "billing",
    title: "Billing and Account",
  },
  contracts: {
    activeHref: "/dashboard/contracts",
    badge: "Contracts",
    description: "Create private agreement packets, generate signing links, and track client signature status.",
    explanations: [
      {
        title: "What this does",
        text: "Builds a private agreement packet with scope, payment terms, change-order terms, and signature tracking.",
      },
      {
        title: "When to use it",
        text: "Use Contracts before scheduling work, ordering materials, accepting a deposit, or approving a change order.",
      },
      {
        title: "What stays private",
        text: "Contract details, signing links, client emails, and signed snapshots are private account records.",
      },
    ],
    primaryAction: { href: "/dashboard/contracts", icon: Signature, label: "Create agreement" },
    secondaryAction: { href: "/search", icon: Search, label: "Search first" },
    tab: "contracts",
    title: "Contracts",
  },
  evidence: {
    activeHref: "/dashboard/evidence",
    badge: "Documents",
    description: "Track invoices, screenshots, contracts, photos, PDFs, and their private review status.",
    explanations: [
      {
        title: "What this does",
        text: "Keeps evidence organized by client, report, category, and review status.",
      },
      {
        title: "When to use it",
        text: "Use Evidence Vault before submitting a report, disputing a response, or documenting payment follow-up.",
      },
      {
        title: "What stays private",
        text: "Raw files and storage paths stay private. Public profiles may only show moderated evidence summaries.",
      },
    ],
    primaryAction: { href: "/submit-report", icon: FilePlus2, label: "Attach to report" },
    tab: "evidence",
    title: "Evidence Vault",
  },
  "lien-readiness": {
    activeHref: "/dashboard/lien-readiness",
    badge: "Florida service",
    description: "Start a private Florida notice or claim-of-lien filing case with fee, authorization, attorney/vendor review, recording proof, and release tracking.",
    explanations: [
      {
        title: "What this service does",
        text: "Routes Florida notice and claim-of-lien cases through a managed review workflow before sending or filing.",
      },
      {
        title: "When to use it",
        text: "Use it when a Florida project has unpaid invoices and deadline, property, contract, and notice details need review.",
      },
      {
        title: "What stays private",
        text: "Property details, raw evidence, filing drafts, receipts, staff notes, and releases stay private.",
      },
    ],
    primaryAction: { href: "/dashboard/lien-readiness", icon: Landmark, label: "Start Florida case" },
    tab: "lien-readiness",
    title: "Florida Lien Service",
  },
  recovery: {
    activeHref: "/dashboard/recovery",
    badge: "Payments",
    description: "Get help recovering overdue payment through a private Resolution Desk case, staff review, client outreach, and contractor-direct resolution tracking.",
    explanations: [
      {
        title: "What this service does",
        text: "Client Bureau staff reviews private records, contacts the client, logs responses, and tracks resolution options.",
      },
      {
        title: "When to use it",
        text: "Use it after invoices age, payment promises change, or a dispute needs organized contractor-direct resolution work.",
      },
      {
        title: "What stays private",
        text: "Private evidence, contact details, staff notes, and payment records are not shown on public profiles.",
      },
    ],
    primaryAction: { href: "/dashboard/recovery", icon: PhoneCall, label: "Get help recovering payment" },
    tab: "recovery",
    title: "Payment Recovery",
  },
  reports: {
    activeHref: "/dashboard/reports",
    badge: "Reports",
    description: "Track draft, pending, approved, published, disputed, rejected, and needs-info reports.",
    explanations: [
      {
        title: "What this does",
        text: "Shows submitted reports, saved drafts, moderation status, evidence readiness, and next documentation steps.",
      },
      {
        title: "When to use it",
        text: "Use Reports when you need to finish a draft, respond to moderation, or review what is published.",
      },
      {
        title: "What stays private",
        text: "Pending, rejected, and needs-info reports stay private and do not appear publicly.",
      },
    ],
    primaryAction: { href: "/submit-report", icon: FilePlus2, label: "Submit report" },
    secondaryAction: { href: "/dashboard/evidence", icon: Vault, label: "Evidence vault" },
    tab: "reports",
    title: "Reports",
  },
  watchlist: {
    activeHref: "/dashboard/watchlist",
    badge: "Find Clients",
    description: "Watch clients, review saved searches, and see private-match alerts before accepting work.",
    explanations: [
      {
        title: "What this does",
        text: "Keeps watched clients, alerts, saved searches, and monitoring signals together.",
      },
      {
        title: "When to use it",
        text: "Use Watchlist for clients you are considering, clients with active projects, or repeat-client monitoring.",
      },
      {
        title: "What stays private",
        text: "Private-match signals and your watchlist choices are never exposed on public profile pages.",
      },
    ],
    primaryAction: { href: "/search", icon: Search, label: "Search a client" },
    tab: "watchlist",
    title: "Watchlist and Alerts",
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string }>
}): Promise<Metadata> {
  const { tool } = await params
  const config = dashboardToolConfigs[tool]

  if (!config) {
    return {
      title: "Dashboard",
      robots: { index: false, follow: false },
    }
  }

  return {
    title: `${config.title} Dashboard`,
    description: config.description,
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function DashboardToolPage({
  params,
}: {
  params: Promise<{ tool: string }>
}) {
  const { tool } = await params
  const config = dashboardToolConfigs[tool]

  if (!config) notFound()

  const { dashboard, clientProfiles, riskOps } = await getClientDashboardData()

  if (!dashboard || !riskOps) {
    return (
      <ClientDashboardShell
        activeHref={config.activeHref}
        badge={config.badge}
        description="Your workspace is being prepared. You can still search clients or submit reports while this tool finishes loading."
        primaryAction={{ href: "/search", label: "Search a client", icon: Search }}
        secondaryAction={{ href: "/submit-report", label: "Submit report", icon: FilePlus2 }}
        title={config.title}
      >
        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardContent className="space-y-4 p-6">
            <AlertCircle className="size-8 text-amber-700" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-slate-950">This tool is getting ready.</h2>
            <p className="text-sm leading-6 text-slate-600">
              Refresh the page after account setup completes. Your core search and report tools are still available.
            </p>
          </CardContent>
        </Card>
      </ClientDashboardShell>
    )
  }

  return (
    <ClientDashboardShell
      activeHref={config.activeHref}
      badge={config.badge}
      description={config.description}
      primaryAction={config.primaryAction}
      secondaryAction={config.secondaryAction}
      title={config.title}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {config.explanations.map((item) => (
          <Card key={item.title} className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase text-amber-700">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {config.tab === "reports" ? (
        <DashboardSection
          eyebrow="Report status"
          title="Submitted reports"
          description="Track submitted records by moderation and publication status. Drafts and evidence readiness appear below."
        >
          <DashboardReports reports={dashboard.reports} clients={clientProfiles} evidence={dashboard.evidence} />
        </DashboardSection>
      ) : null}

      {config.tab === "watchlist" ? (
        <DashboardSection
          eyebrow="Find Clients"
          title="Search, saved searches, and alerts"
          description="Use search for a fresh client check, then watch clients you may work with again."
        >
          <div className="grid gap-4 xl:grid-cols-[280px_1fr_1fr]">
            <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
              <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                <Link href="/search">
                  <Search aria-hidden="true" />
                  Search a client
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/submit-report">
                  <FilePlus2 aria-hidden="true" />
                  Submit a report
                </Link>
              </Button>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-semibold text-slate-950">Recent saved searches</h3>
              <div className="mt-3 grid gap-2">
                {dashboard.savedSearches.slice(0, 4).map((savedSearch) => (
                  <Link
                    key={savedSearch.id}
                    href={`/search?q=${encodeURIComponent(savedSearch.query)}${savedSearch.state ? `&state=${savedSearch.state}` : ""}`}
                    className="rounded-md border border-slate-200 bg-white p-3 text-sm transition hover:border-amber-300"
                  >
                    <span className="font-semibold text-slate-950">{savedSearch.query}</span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {savedSearch.city}, {savedSearch.state}
                    </span>
                  </Link>
                ))}
                {dashboard.savedSearches.length === 0 ? (
                  <p className="rounded-md border border-dashed border-slate-300 bg-white p-3 text-sm leading-6 text-slate-600">
                    Saved searches appear after you search a client.
                  </p>
                ) : null}
              </div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-semibold text-slate-950">Latest alerts</h3>
              <div className="mt-3 grid gap-2">
                {riskOps.watchlistAlerts.slice(0, 4).map((alert) => (
                  <div key={alert.id} className="rounded-md border border-slate-200 bg-white p-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-semibold text-slate-950">{alert.title}</span>
                      <StatusBadge tone={alert.severity === "urgent" || alert.severity === "high" ? "amber" : "slate"}>
                        {alert.severity}
                      </StatusBadge>
                    </div>
                    <p className="mt-1 line-clamp-2 leading-6 text-slate-600">{alert.description}</p>
                  </div>
                ))}
                {riskOps.watchlistAlerts.length === 0 ? (
                  <p className="rounded-md border border-dashed border-slate-300 bg-white p-3 text-sm leading-6 text-slate-600">
                    Alerts appear after you watch a client profile.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </DashboardSection>
      ) : null}

      <RiskOpsWorkspace
        clients={clientProfiles}
        focusTab={config.tab}
        riskOps={riskOps}
        subscription={dashboard.subscription}
      />
    </ClientDashboardShell>
  )
}
