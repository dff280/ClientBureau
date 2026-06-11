import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  AlertCircle,
  ArrowRight,
  CreditCard,
  FilePlus2,
  Gift,
  Landmark,
  PhoneCall,
  Search,
  Signature,
  UserCheck,
  Vault,
} from "lucide-react"

import { ClientDashboardShell } from "@/components/dashboard/client-dashboard-shell"
import { ContractorGrowthEngine } from "@/components/dashboard/contractor-growth-engine"
import { DashboardReports } from "@/components/dashboard/dashboard-reports"
import { DashboardSection, StatusBadge } from "@/components/dashboard/dashboard-ui"
import {
  RiskOpsWorkspace,
  type DashboardWorkspaceTab,
} from "@/components/dashboard/risk-ops-workspace"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getClientDashboardData } from "@/lib/dashboard-data"
import { getPlatformFeatureDataMode, getSiteUrl } from "@/lib/env"
import { getMockGrowthEngineData } from "@/lib/growth-engine"

export const dynamic = "force-dynamic"

type DashboardToolTab = DashboardWorkspaceTab | "growth"
type ToolOutcomeKey = DashboardToolTab | "alerts"

type DashboardToolConfig = {
  activeHref: string
  badge: string
  description: string
  explanations: {
    title: string
    text: string
  }[]
  nextActions: {
    detail: string
    href: string
    label: string
    primary?: boolean
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
  tab: DashboardToolTab
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
    primaryAction: { href: "/search", icon: Search, label: "Check a Client" },
    nextActions: [
      {
        detail: "Review the newest client work files, notes, and pipeline movement before starting the day.",
        href: "/dashboard/activity",
        label: "Review recent activity",
        primary: true,
      },
      {
        detail: "Check the next client before you send a proposal, schedule work, or order materials.",
        href: "/search",
        label: "Check a Client",
      },
      {
        detail: "Document a real client experience and send it to moderation when the job is complete.",
        href: "/submit-report",
        label: "Report a Client Experience",
      },
    ],
    tab: "activity",
    title: "Activity",
  },
  alerts: {
    activeHref: "/dashboard/alerts",
    badge: "Alerts",
    description: "Review watched-client changes, dispute updates, profile movement, and private-match signals before you commit to the next step.",
    explanations: [
      {
        title: "What this does",
        text: "Shows alert signals tied to watched clients, saved searches, profile changes, and items that may need follow-up.",
      },
      {
        title: "When to use it",
        text: "Use Alerts before scheduling, sending a contract, approving a change order, or following up on payment.",
      },
      {
        title: "What stays private",
        text: "Your watched clients, private-match signals, and alert history remain inside your account workspace.",
      },
    ],
    primaryAction: { href: "/search", icon: Search, label: "Check a Client" },
    secondaryAction: { href: "/dashboard/watchlist", icon: Search, label: "Open watchlist" },
    nextActions: [
      {
        detail: "Open unread alerts first, especially before accepting deposits, scheduling crews, or extending credit.",
        href: "/dashboard/alerts",
        label: "Review alert signals",
        primary: true,
      },
      {
        detail: "Run a fresh client check when an alert changes your decision context.",
        href: "/search",
        label: "Search again",
      },
      {
        detail: "Turn a client into a monitored record so future profile or response changes are easier to catch.",
        href: "/dashboard/watchlist",
        label: "Watch this client",
      },
    ],
    tab: "watchlist",
    title: "Alerts",
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
    nextActions: [
      {
        detail: "Review plan limits and verification status before onboarding a team or adding more reports.",
        href: "/dashboard/billing",
        label: "Review account status",
        primary: true,
      },
      {
        detail: "Strengthen your public business profile so reports and responses stay accountable.",
        href: "/claim-profile",
        label: "Claim profile",
      },
      {
        detail: "Invite trusted contractors when you are ready to build the network effect.",
        href: "/dashboard/growth",
        label: "Open Growth Engine",
      },
    ],
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
    nextActions: [
      {
        detail: "Create the agreement packet before scheduling work, ordering materials, or accepting scope changes.",
        href: "/dashboard/contracts",
        label: "Create agreement packet",
        primary: true,
      },
      {
        detail: "Check the client first so contract terms match the risk and payment context.",
        href: "/search",
        label: "Check a Client",
      },
      {
        detail: "Attach invoices, proposal screenshots, photos, and contract records to the private vault.",
        href: "/dashboard/evidence",
        label: "Organize evidence",
      },
    ],
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
    nextActions: [
      {
        detail: "Attach private documentation before submitting a report, recovery case, or lien service case.",
        href: "/dashboard/evidence",
        label: "Review evidence status",
        primary: true,
      },
      {
        detail: "Create or finish the report that the evidence supports.",
        href: "/submit-report",
        label: "Submit report",
      },
      {
        detail: "Open payment recovery when evidence supports overdue invoice follow-up.",
        href: "/dashboard/recovery",
        label: "Open recovery case",
      },
    ],
    tab: "evidence",
    title: "Evidence Vault",
  },
  growth: {
    activeHref: "/dashboard/growth",
    badge: "Growth",
    description: "Invite trusted contractors, earn platform credits, claim your business profile, and request client feedback after real jobs.",
    explanations: [
      {
        title: "What this does",
        text: "Turns referrals, business profile claiming, and client feedback requests into one simple growth loop.",
      },
      {
        title: "When to use it",
        text: "Use Growth after a completed job, when onboarding referral partners, or when strengthening your public business profile.",
      },
      {
        title: "What stays private",
        text: "Invite emails, credit details, and review-request drafts stay inside your private workspace.",
      },
    ],
    primaryAction: { href: "/dashboard/growth", icon: Gift, label: "Invite contractor" },
    secondaryAction: { href: "/claim-profile", icon: UserCheck, label: "Claim profile" },
    nextActions: [
      {
        detail: "Invite trusted contractors and service business owners who would benefit from checking clients first.",
        href: "/dashboard/growth",
        label: "Invite contractors",
        primary: true,
      },
      {
        detail: "Claim or improve your business profile so contractors and clients see accountable identity context.",
        href: "/claim-profile",
        label: "Claim profile",
      },
      {
        detail: "Request feedback after successful jobs to build positive client history.",
        href: "/dashboard/growth",
        label: "Request feedback",
      },
    ],
    tab: "growth",
    title: "Growth Engine",
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
    nextActions: [
      {
        detail: "Start the Florida case when deadline, property, contract, invoice, and authorization details are ready for review.",
        href: "/dashboard/lien-readiness",
        label: "Start Florida case",
        primary: true,
      },
      {
        detail: "Collect contracts, invoices, photos, notices, and communication records privately before staff review.",
        href: "/dashboard/evidence",
        label: "Prepare documents",
      },
      {
        detail: "Use Resolution Desk when a payment conversation may resolve the matter before filing steps continue.",
        href: "/dashboard/recovery",
        label: "Open recovery case",
      },
    ],
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
    nextActions: [
      {
        detail: "Open a managed recovery case when an invoice is overdue and private documentation supports follow-up.",
        href: "/dashboard/recovery",
        label: "Open recovery case",
        primary: true,
      },
      {
        detail: "Attach invoices, messages, contracts, photos, and payment records before staff review.",
        href: "/dashboard/evidence",
        label: "Prepare evidence",
      },
      {
        detail: "If the job is in Florida and deadlines matter, review lien service readiness as a separate private workflow.",
        href: "/dashboard/lien-readiness",
        label: "Review lien readiness",
      },
    ],
    tab: "recovery",
    title: "Payment Recovery",
  },
  reports: {
    activeHref: "/dashboard/reports",
    badge: "Reports",
    description: "Track draft, pending, approved, published, disputed, rejected, and needs-info client experience reports.",
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
    primaryAction: { href: "/submit-report", icon: FilePlus2, label: "Report a Client Experience" },
    secondaryAction: { href: "/dashboard/evidence", icon: Vault, label: "Evidence vault" },
    nextActions: [
      {
        detail: "Submit a documented positive, resolved, or concerning client experience for moderation.",
        href: "/submit-report",
        label: "Report a Client Experience",
        primary: true,
      },
      {
        detail: "Review drafts and evidence before submitting so moderation has clean context.",
        href: "/dashboard/reports",
        label: "Review report status",
      },
      {
        detail: "Use evidence vault when files need private organization before a report is submitted.",
        href: "/dashboard/evidence",
        label: "Organize evidence",
      },
    ],
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
    primaryAction: { href: "/search", icon: Search, label: "Check a Client" },
    nextActions: [
      {
        detail: "Search first when a lead, homeowner, property owner, or customer asks for work.",
        href: "/search",
        label: "Check a Client",
        primary: true,
      },
      {
        detail: "Save or watch clients you may work with again so changes are easier to spot.",
        href: "/dashboard/watchlist",
        label: "Review watched clients",
      },
      {
        detail: "Create a private contract packet after a client check and before scheduling work.",
        href: "/dashboard/contracts",
        label: "Create contract packet",
      },
    ],
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
  const featureDataMode = getPlatformFeatureDataMode()
  const liveBacked = featureDataMode === "supabase"

  if (!dashboard || !riskOps) {
    return (
      <ClientDashboardShell
        activeHref={config.activeHref}
        badge={config.badge}
        description="Your workspace is being prepared. You can still check clients or submit client experience reports while this tool finishes loading."
        primaryAction={{ href: "/search", label: "Check a Client", icon: Search }}
        secondaryAction={{ href: "/submit-report", label: "Report a Client Experience", icon: FilePlus2 }}
        title={config.title}
      >
        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardContent className="space-y-4 p-6">
            <AlertCircle className="size-8 text-amber-700" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-slate-950">This tool is getting ready.</h2>
            <p className="text-sm leading-6 text-slate-600">
              Refresh the page after account setup completes. Your core client-check and report tools are still available.
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

      <DashboardSection
        eyebrow="Next best actions"
        title="Start with the simplest next step"
        description={
          liveBacked
            ? "This workspace is connected to live account records. Actions here should persist after refresh."
            : "This workspace can still guide your workflow. Core search, reports, admin review, and public profiles remain available."
        }
      >
        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-amber-700">Workspace status</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {liveBacked ? "Live account records" : "Guided workspace"}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {liveBacked
                ? "Successful saves and updates should remain attached to your account after refresh."
                : "Use the guided steps here while permanent account records finish connecting."}
            </p>
            <div className="mt-3">
              <StatusBadge tone={liveBacked ? "emerald" : "amber"}>
                {liveBacked ? "Saving enabled" : "Guidance mode"}
              </StatusBadge>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {config.nextActions.map((action) => (
              <Link
                key={`${config.activeHref}-${action.href}-${action.label}`}
                href={action.href}
                className={
                  action.primary
                    ? "group rounded-md border border-slate-950 bg-slate-950 p-4 text-white shadow-sm transition hover:-translate-y-0.5"
                    : "group rounded-md border border-slate-200 bg-white p-4 text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300"
                }
              >
                <span
                  className={
                    action.primary
                      ? "text-xs font-semibold uppercase text-amber-300"
                      : "text-xs font-semibold uppercase text-amber-700"
                  }
                >
                  {action.primary ? "Recommended" : "Next option"}
                </span>
                <span className="mt-2 block font-semibold">{action.label}</span>
                <span className={action.primary ? "mt-2 block text-sm leading-6 text-slate-300" : "mt-2 block text-sm leading-6 text-slate-600"}>
                  {action.detail}
                </span>
                <span className={action.primary ? "mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-200" : "mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-700"}>
                  Continue
                  <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </DashboardSection>

      <ToolOutcomePanel
        liveBacked={liveBacked}
        outcomeKey={tool === "alerts" ? "alerts" : config.tab}
      />

      {config.tab === "growth" ? (
        <ContractorGrowthEngine data={getMockGrowthEngineData(dashboard.contractor, getSiteUrl())} />
      ) : null}

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
                  Check a Client
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/submit-report">
                  <FilePlus2 aria-hidden="true" />
                  Report a Client Experience
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

      {config.tab !== "growth" ? (
        <RiskOpsWorkspace
          clients={clientProfiles}
          focusTab={config.tab}
          riskOps={riskOps}
          subscription={dashboard.subscription}
        />
      ) : null}
    </ClientDashboardShell>
  )
}

function ToolOutcomePanel({
  liveBacked,
  outcomeKey,
}: {
  liveBacked: boolean
  outcomeKey: ToolOutcomeKey
}) {
  const outcomes = getToolOutcomeItems(outcomeKey)

  return (
    <DashboardSection
      eyebrow="What should happen"
      title="After you use this tool"
      description="Use this as a quick confidence check. If something saves successfully, refresh the page and make sure it still appears here."
    >
      <div className="grid gap-3 md:grid-cols-3">
        {outcomes.map((item) => (
          <div key={item.title} className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold uppercase text-amber-700">{item.label}</p>
              <StatusBadge tone={item.tone}>{item.status}</StatusBadge>
            </div>
            <h3 className="mt-3 font-semibold text-slate-950">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-md border border-slate-200 bg-white p-4">
        <p className="text-sm leading-6 text-slate-600">
          {liveBacked
            ? "This tool is using live account persistence. Successful records should remain visible after refresh and stay private unless you submit content for moderation."
            : "This tool is showing guided workflow support. Use Search, report submission, and public profiles for production records until account record saving is available here."}
        </p>
      </div>
    </DashboardSection>
  )
}

function getToolOutcomeItems(outcomeKey: ToolOutcomeKey) {
  const common = [
    {
      label: "Private by default",
      title: "Your workspace record stays sealed",
      detail: "Client names, evidence, contract details, staff notes, and private matching signals do not appear on public profiles.",
      status: "Private",
      tone: "slate" as const,
    },
    {
      label: "Refresh check",
      title: "Saved work should persist",
      detail: "After a successful save or update, refresh this page and confirm the record still appears in the correct section.",
      status: "Live",
      tone: "emerald" as const,
    },
  ]

  const specific: Record<ToolOutcomeKey, { label: string; title: string; detail: string; status: string; tone: "slate" | "amber" | "emerald" | "rose" | "blue" }[]> = {
    activity: [
      {
        label: "Daily review",
        title: "New work should feed activity",
        detail: "Reports, watched clients, contracts, recovery cases, and evidence changes should be easy to find in recent activity.",
        status: "Review",
        tone: "blue",
      },
    ],
    alerts: [
      {
        label: "Monitoring",
        title: "Watched-client changes create signals",
        detail: "Important watched-client updates should show as alerts without exposing why you are monitoring the profile.",
        status: "Monitor",
        tone: "amber",
      },
    ],
    billing: [
      {
        label: "Account",
        title: "Plan and verification stay understandable",
        detail: "Plan, usage, and verification status should be clear without developer or checkout-test language.",
        status: "Account",
        tone: "blue",
      },
    ],
    account: [
      {
        label: "Account",
        title: "Profile and plan updates stay account-only",
        detail: "Business verification, plan context, usage, and team details should stay visible inside your workspace only.",
        status: "Account",
        tone: "blue",
      },
    ],
    contracts: [
      {
        label: "Agreement packet",
        title: "Signing status becomes trackable",
        detail: "Created packets should show scope, payment terms, share status, viewed/signed state, and private audit context.",
        status: "Track",
        tone: "blue",
      },
    ],
    evidence: [
      {
        label: "Evidence Vault",
        title: "Files appear as private summaries",
        detail: "Invoices, contracts, photos, screenshots, and PDFs should show status labels, not raw storage paths or public file links.",
        status: "Sealed",
        tone: "emerald",
      },
    ],
    growth: [
      {
        label: "Referral loop",
        title: "Invites and profile actions should feel safe",
        detail: "Referral, profile-claim, and feedback-request actions should help grow the network without public accusations.",
        status: "Growth",
        tone: "amber",
      },
    ],
    "lien-readiness": [
      {
        label: "Florida service",
        title: "Case moves through review gates",
        detail: "Lien service cases should show fee, authorization, document readiness, vendor/attorney review, recording proof, and release state.",
        status: "Review",
        tone: "amber",
      },
    ],
    overview: [
      {
        label: "Command center",
        title: "Daily work stays easy to scan",
        detail: "Today’s alerts, recent activity, open reports, watched clients, and next actions should stay visible without hunting through every tool.",
        status: "Overview",
        tone: "blue",
      },
    ],
    pipeline: [
      {
        label: "Client pipeline",
        title: "Lead and job stages remain organized",
        detail: "Client work files should move through screening, contract pending, active job, payment follow-up, and closed stages without public exposure.",
        status: "Pipeline",
        tone: "emerald",
      },
    ],
    recovery: [
      {
        label: "Resolution Desk",
        title: "Follow-up is tracked privately",
        detail: "Recovery cases should show amount due, invoice age, contact attempts, response status, payment plan, and resolution state.",
        status: "Resolve",
        tone: "blue",
      },
    ],
    reports: [
      {
        label: "Moderation",
        title: "Submitted reports enter review",
        detail: "Positive and payment-issue reports should move into a clear status: draft, submitted, review, published, rejected, disputed, or resolved.",
        status: "Review",
        tone: "amber",
      },
    ],
    watchlist: [
      {
        label: "Client check",
        title: "Saved searches and watched clients stay visible",
        detail: "Searches and watched clients should remain available so you can review them before quotes, scheduling, deposits, or change orders.",
        status: "Watch",
        tone: "emerald",
      },
    ],
  }

  return [...specific[outcomeKey], ...common]
}
