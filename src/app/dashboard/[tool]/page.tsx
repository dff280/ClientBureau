import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  AlertCircle,
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
import { DashboardSection, StatusBadge, ToolQuickStart } from "@/components/dashboard/dashboard-ui"
import {
  RiskOpsWorkspace,
  type DashboardJobContext,
  type DashboardWorkspaceTab,
} from "@/components/dashboard/risk-ops-workspace"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getBillingAvailability } from "@/lib/billing-availability"
import { getClientDashboardData } from "@/lib/dashboard-data"
import {
  buildDashboardToolConfidence,
  dashboardToolRouteChecklist,
  type DashboardToolSlug,
} from "@/lib/dashboard-tool-confidence"
import { getPlatformFeatureDataMode, getSiteUrl } from "@/lib/env"
import { getMockGrowthEngineData } from "@/lib/growth-engine"

export const dynamic = "force-dynamic"

type DashboardToolTab = DashboardWorkspaceTab | "growth"

type DashboardToolSearchParams = Promise<Record<string, string | string[] | undefined>>

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

const dashboardToolSlugs = new Set<string>(dashboardToolRouteChecklist.map((item) => item.slug))

function firstSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function savedSearchSourceLabel(source?: string) {
  if (source === "local") return "Browser saved"
  if (source === "supabase" || source === "mock") return "Account saved"

  return undefined
}

function getJobContext(searchParams: Awaited<DashboardToolSearchParams>): DashboardJobContext | null {
  const jobId = firstSearchValue(searchParams.jobId)
  const jobTitle = firstSearchValue(searchParams.jobTitle)

  if (!jobId && !jobTitle) return null

  return {
    city: firstSearchValue(searchParams.city),
    jobId,
    jobTitle,
    state: firstSearchValue(searchParams.state),
    tradeCategory: firstSearchValue(searchParams.tradeCategory),
  }
}

function JobContextBanner({
  context,
  toolTitle,
}: {
  context: NonNullable<ReturnType<typeof getJobContext>>
  toolTitle: string
}) {
  const location = [context.city, context.state].filter(Boolean).join(", ")

  return (
    <section className="rounded-md border border-amber-200 bg-amber-50 p-4 shadow-sm">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase text-amber-700">Private job context</p>
          <h2 className="mt-1 text-lg font-semibold text-amber-950">
            {context.jobTitle ?? "This tool"} is linked to this {toolTitle.toLowerCase()} workflow.
          </h2>
          <p className="mt-1 text-sm leading-6 text-amber-900">
            {[
              location ? `Location: ${location}` : null,
              context.tradeCategory ? `Trade: ${context.tradeCategory}` : null,
            ]
              .filter(Boolean)
              .join(" / ") || "The job ID is preserved in this private dashboard session."}
          </p>
        </div>
        {context.jobId ? (
          <Button asChild variant="outline" className="border-amber-300 bg-white text-amber-950 hover:bg-amber-100">
            <Link href={`/dashboard/jobs/${context.jobId}`}>Back to job file</Link>
          </Button>
        ) : null}
      </div>
    </section>
  )
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
    secondaryAction: { href: "/search", icon: Search, label: "Check first" },
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
        label: "Report a client experience",
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
        text: "Private-match signals and your watchlist choices are never shown on public profile pages.",
      },
    ],
    primaryAction: { href: "/search", icon: Search, label: "Check a Client" },
    nextActions: [
      {
        detail: "Check first when a lead, homeowner, property owner, or customer asks for work.",
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
  searchParams,
}: {
  params: Promise<{ tool: string }>
  searchParams: DashboardToolSearchParams
}) {
  const { tool } = await params
  const rawSearchParams = await searchParams
  const config = dashboardToolConfigs[tool]

  if (!config) notFound()

  const { dashboard, clientProfiles, riskOps } = await getClientDashboardData(`/dashboard/${tool}`)
  const featureDataMode = getPlatformFeatureDataMode()
  const liveBacked = featureDataMode === "supabase"
  const jobContext = getJobContext(rawSearchParams)
  const billingAvailability = getBillingAvailability()

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
      <ToolQuickStart
        title="Start with the next practical step"
        description={config.description}
        details={config.explanations.map((item) => ({
          label: item.title.replace("What this service does", "Service").replace("What this does", "Purpose"),
          text: item.text,
        }))}
        actions={config.nextActions}
        statusLabel={liveBacked ? "Saving to your account" : "Ready for account setup"}
        statusDescription={
          liveBacked
            ? "Records created here should remain visible after refresh and stay private unless you submit content for moderation."
            : "Search and report tools are available now while account records finish connecting."
        }
        statusTone={liveBacked ? "emerald" : "amber"}
      />

      {jobContext ? <JobContextBanner context={jobContext} toolTitle={config.title} /> : null}

      {dashboardToolSlugs.has(tool) ? (
        <ToolStateConfidencePanel
          confidence={buildDashboardToolConfidence({
            reports: dashboard.reports,
            riskOps,
            savedSearchCount: dashboard.savedSearches.length,
            subscription: dashboard.subscription,
            tool: tool as DashboardToolSlug,
          })}
        />
      ) : null}

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
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-950">{savedSearch.query}</span>
                      {savedSearchSourceLabel(savedSearch.source) ? (
                        <StatusBadge tone={savedSearch.source === "local" ? "amber" : "emerald"}>
                          {savedSearchSourceLabel(savedSearch.source)}
                        </StatusBadge>
                      ) : null}
                    </span>
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
          billingAvailability={billingAvailability}
          jobContext={jobContext}
        />
      ) : null}
    </ClientDashboardShell>
  )
}

function ToolStateConfidencePanel({
  confidence,
}: {
  confidence: ReturnType<typeof buildDashboardToolConfidence>
}) {
  return (
    <DashboardSection
      eyebrow="Current records"
      title="What is saved in this tool right now"
      description="Use this quick check before opening a create panel. It helps confirm whether your last action saved and what still needs review."
    >
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Saved records</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{confidence.recordCount}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{confidence.recordLabel}</p>
        </div>
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase text-amber-700">Needs attention</p>
          <p className="mt-2 text-3xl font-semibold text-amber-950">{confidence.attentionCount}</p>
          <p className="mt-1 text-sm leading-6 text-amber-900">{confidence.attentionLabel}</p>
        </div>
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-semibold uppercase text-emerald-700">Verify after saving</p>
          <p className="mt-2 text-sm leading-6 text-emerald-950">{confidence.verifyAfterSave}</p>
        </div>
      </div>
      {confidence.recordCount === 0 ? (
        <div className="mt-3 rounded-md border border-dashed border-slate-300 bg-white p-4 text-sm leading-6 text-slate-600">
          <span className="font-semibold text-slate-950">{confidence.emptyTitle}:</span> {confidence.emptyDetail}
        </div>
      ) : null}
    </DashboardSection>
  )
}
