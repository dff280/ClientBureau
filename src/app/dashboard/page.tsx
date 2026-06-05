import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  AlertCircle,
  BellRing,
  Building2,
  CheckCircle2,
  CreditCard,
  DollarSign,
  FileCheck2,
  FilePlus2,
  Landmark,
  PhoneCall,
  Search,
  ShieldCheck,
  Signature,
  UploadCloud,
} from "lucide-react"

import { ClientDashboardShell } from "@/components/dashboard/client-dashboard-shell"
import {
  DashboardSection,
  QuickActionCard,
  StatCard,
  StatusBadge,
} from "@/components/dashboard/dashboard-ui"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { buildBusinessSlug } from "@/lib/business-rating"
import { getClientDashboardData } from "@/lib/dashboard-data"
import { buildTodaysWorkItems } from "@/lib/platform-features"

export const metadata: Metadata = {
  title: "Business Protection Dashboard",
  description:
    "Client Bureau dashboard for client searches, reports, contracts, evidence, payment recovery, watchlists, alerts, and billing.",
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = "force-dynamic"

const workspaceRedirects: Record<string, string> = {
  account: "/dashboard/billing",
  activity: "/dashboard/activity",
  alerts: "/dashboard/watchlist",
  billing: "/dashboard/billing",
  contracts: "/dashboard/contracts",
  evidence: "/dashboard/evidence",
  lien: "/dashboard/lien-readiness",
  "lien-readiness": "/dashboard/lien-readiness",
  "notice-readiness": "/dashboard/lien-readiness",
  payment: "/dashboard/recovery",
  "payment-recovery": "/dashboard/recovery",
  pipeline: "/dashboard/activity",
  recovery: "/dashboard/recovery",
  reports: "/dashboard/reports",
  watchlist: "/dashboard/watchlist",
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ workspace?: string | string[] }>
}) {
  const params = await searchParams
  const requestedWorkspace = Array.isArray(params.workspace) ? params.workspace[0] : params.workspace

  if (requestedWorkspace) {
    redirect(workspaceRedirects[requestedWorkspace] ?? "/dashboard")
  }

  const { dashboard, clientProfiles, riskOps } = await getClientDashboardData()

  if (!dashboard) {
    return (
      <DashboardSetupState
        title="Your dashboard workspace is being prepared."
        message="Your account is signed in, but Client Bureau could not load a business workspace yet. Start with a client search or refresh the dashboard after profile setup completes."
      />
    )
  }

  if (!riskOps) {
    return (
      <DashboardSetupState
        title="Your command center is being prepared."
        message="Your profile is active, but the operations workspace did not load. You can still search clients and submit documented reports while this feature workspace initializes."
      />
    )
  }

  const subscriptionTier = dashboard.subscription?.tier ?? "free"
  const subscriptionStatus =
    !dashboard.subscription || dashboard.subscription.status === "mock"
      ? "active"
      : dashboard.subscription.status.replace("_", " ")
  const businessProfileHref = `/business/${buildBusinessSlug(dashboard.contractor)}`
  const reportCounts = {
    pending: dashboard.reports.filter((report) => report.status === "pending").length,
    approved: dashboard.reports.filter((report) => report.status === "approved").length,
    rejected: dashboard.reports.filter((report) => report.status === "rejected").length,
    disputed: dashboard.reports.filter((report) => report.status === "disputed").length,
    published: dashboard.reports.filter((report) => {
      const client = clientProfiles.find((profile) => profile.id === report.clientId)
      return report.status === "approved" && Boolean(client?.isPublic)
    }).length,
    resolved: dashboard.reports.filter((report) =>
      ["Paid in full", "Settled", "Resolved", "Admin verified"].includes(report.resolutionStatus ?? ""),
    ).length,
    needsInfo: dashboard.reports.filter((report) =>
      report.moderationNote?.toLowerCase().includes("more info"),
    ).length,
  }
  const activeWatchlist = riskOps.watchlist.filter((item) => item.status === "active").length
  const unreadAlerts = riskOps.watchlistAlerts.filter((item) => !item.readAt).length
  const openRecoveryCases = riskOps.paymentRecoveryCases.filter(
    (item) => !["resolved", "paused"].includes(item.status),
  )
  const openBalance = openRecoveryCases.reduce((total, item) => total + item.amountDue, 0)
  const signedContracts = riskOps.contractPackets.filter(
    (item) => item.status === "signed" || item.signatureStatus === "fully_signed",
  ).length
  const evidenceNeedingReview = riskOps.evidenceVault.filter((item) =>
    ["uploaded", "review_pending", "needs_more_info"].includes(item.status),
  ).length
  const onboarding = [
    {
      label: "Verify business",
      complete: dashboard.contractor.verificationStatus === "verified",
      href: "/dashboard/billing",
      icon: ShieldCheck,
    },
    {
      label: "Search first client",
      complete: dashboard.savedSearches.length > 0,
      href: "/search",
      icon: Search,
    },
    {
      label: "Submit report",
      complete: dashboard.reports.length > 0,
      href: "/submit-report",
      icon: FilePlus2,
    },
    {
      label: "Upload evidence",
      complete: dashboard.evidence.length > 0 || riskOps.evidenceVault.length > 0,
      href: "/dashboard/evidence",
      icon: UploadCloud,
    },
    {
      label: "Choose plan",
      complete: subscriptionTier !== "free",
      href: "/dashboard/billing",
      icon: CreditCard,
    },
  ]
  const onboardingProgress = Math.round((onboarding.filter((item) => item.complete).length / onboarding.length) * 100)
  const todaysWork = buildTodaysWorkItems({
    alerts: riskOps.watchlistAlerts,
    contracts: riskOps.contractPackets,
    drafts: riskOps.reportDrafts,
    evidence: riskOps.evidenceVault,
    pipeline: riskOps.clientPipeline,
    recoveryCases: riskOps.paymentRecoveryCases,
  }).slice(0, 6)
  const recentReports = [...dashboard.reports]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3)
  const recentContracts = [...riskOps.contractPackets]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 3)
  const recentRecovery = [...riskOps.paymentRecoveryCases]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 3)

  return (
    <ClientDashboardShell
      activeHref="/dashboard"
      badge={`${subscriptionTier.replace("_", " ")} plan`}
      description="A simple private workspace for checking clients, tracking reports, sending agreement packets, organizing evidence, and following up on payment issues."
      primaryAction={{ href: "/search", label: "Search a client", icon: Search }}
      secondaryAction={{ href: "/submit-report", label: "Submit report", icon: FilePlus2 }}
      title={`${dashboard.contractor.businessName} Command Center`}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          href="/dashboard/billing"
          icon={CreditCard}
          label="Current plan"
          value={subscriptionTier.replace("_", " ")}
          helper={subscriptionStatus}
        />
        <StatCard
          href="/dashboard/billing"
          icon={ShieldCheck}
          label="Verification"
          value={dashboard.contractor.verificationStatus}
          helper={dashboard.contractor.verificationBadges?.join(", ") || "Business profile status"}
          tone={dashboard.contractor.verificationStatus === "verified" ? "emerald" : "amber"}
        />
        <StatCard
          href="/search"
          icon={Search}
          label="Searches this month"
          value={dashboard.savedSearches.length}
          helper="Saved searches available"
        />
        <StatCard
          href="/dashboard/reports"
          icon={FileCheck2}
          label="Reports submitted"
          value={dashboard.reports.length}
          helper={`${reportCounts.published} published, ${reportCounts.pending} pending`}
          tone="blue"
        />
        <StatCard
          href="/dashboard/reports"
          icon={FileCheck2}
          label="Published reports"
          value={reportCounts.published}
          helper={`${reportCounts.resolved} resolved records`}
          tone="emerald"
        />
        <StatCard
          href="/dashboard/reports"
          icon={AlertCircle}
          label="Pending reports"
          value={reportCounts.pending + reportCounts.needsInfo}
          helper={`${reportCounts.needsInfo} need more information`}
          tone={reportCounts.pending + reportCounts.needsInfo > 0 ? "amber" : "slate"}
        />
        <StatCard
          href="/dashboard/watchlist"
          icon={BellRing}
          label="Watched clients"
          value={activeWatchlist}
          helper={`${unreadAlerts} unread alerts`}
          tone={unreadAlerts > 0 ? "amber" : "slate"}
        />
        <StatCard
          href="/dashboard/recovery"
          icon={DollarSign}
          label="Open balances"
          value={formatCurrency(openBalance)}
          helper={`${openRecoveryCases.length} open recovery cases`}
          tone={openRecoveryCases.length > 0 ? "rose" : "emerald"}
        />
      </div>

      <DashboardSection
        eyebrow="Start here"
        title="What do you need to do today?"
        description="Choose one task. Each tool opens on its own page so the dashboard stays simple."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <QuickActionCard
            href="/search"
            icon={Search}
            title="Search a client"
            description="Check a client before taking the job."
            badge="Daily tool"
            primary
          />
          <QuickActionCard
            href="/submit-report"
            icon={FilePlus2}
            title="Submit a report"
            description="Document a positive or concerning experience for review."
          />
          <QuickActionCard
            href="/dashboard/contracts"
            icon={Signature}
            title="Create contract"
            description="Prepare an agreement packet and private signing link."
          />
          <QuickActionCard
            href="/dashboard/recovery"
            icon={PhoneCall}
            title="Payment recovery"
            description="Track invoices, follow-ups, payment plans, and resolution."
          />
          <QuickActionCard
            href="/dashboard/lien-readiness"
            icon={Landmark}
            title="Lien readiness"
            description="Keep a private deadline and document checklist."
          />
        </div>
      </DashboardSection>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardSection
          eyebrow="Today"
          title="Today’s work"
          description="Urgent alerts, drafts, contract tasks, evidence requests, and payment follow-up."
        >
          {todaysWork.length ? (
            <div className="grid gap-3">
              {todaysWork.map((item) => (
                <div key={item.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                    <div>
                      <p className="text-xs font-semibold uppercase text-amber-700">{item.label}</p>
                      <h3 className="mt-1 font-semibold text-slate-950">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
                    </div>
                    <StatusBadge tone={item.tone === "urgent" || item.tone === "high" ? "amber" : "slate"}>
                      {item.tone}
                    </StatusBadge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
              You are caught up. Start with a client search, agreement packet, or report draft when the next job comes in.
            </div>
          )}
        </DashboardSection>

        <DashboardSection
          eyebrow="Account"
          title="Business readiness"
          description="A quick setup checklist for a stronger working profile."
        >
          <div className="space-y-5">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">Setup progress</p>
                  <p className="mt-1 text-3xl font-semibold text-slate-950">{onboardingProgress}%</p>
                </div>
                <Button asChild variant="outline">
                  <Link href={businessProfileHref}>
                    <Building2 aria-hidden="true" />
                    Public profile
                  </Link>
                </Button>
              </div>
              <Progress value={onboardingProgress} className="mt-4" />
            </div>
            <div className="grid gap-3">
              {onboarding.map((item) => {
                const Icon = item.icon

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-3 transition hover:border-amber-300"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-md bg-slate-950 text-white">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="text-sm font-semibold text-slate-950">{item.label}</span>
                    </span>
                    {item.complete ? (
                      <StatusBadge tone="emerald">
                        <CheckCircle2 className="mr-1 size-3.5" aria-hidden="true" />
                        Complete
                      </StatusBadge>
                    ) : (
                      <StatusBadge tone="amber">Next</StatusBadge>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </DashboardSection>
      </div>

      <DashboardSection
        eyebrow="Recent"
        title="Recent work"
        description="A short snapshot of the records most contractors check when they start the day."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <RecentList
            emptyText="No reports yet."
            href="/dashboard/reports"
            title="Reports"
            items={recentReports.map((report) => ({
              id: report.id,
              label: report.reportCategory,
              text: report.reportSummary,
              meta: report.status,
            }))}
          />
          <RecentList
            emptyText="No contract packets yet."
            href="/dashboard/contracts"
            title="Contracts"
            items={recentContracts.map((contract) => ({
              id: contract.id,
              label: contract.clientName,
              text: contract.nextAction,
              meta: contract.signatureStatus?.replaceAll("_", " ") ?? contract.status.replaceAll("_", " "),
            }))}
          />
          <RecentList
            emptyText="No open recovery cases."
            href="/dashboard/recovery"
            title="Payment Recovery"
            items={recentRecovery.map((item) => ({
              id: item.id,
              label: item.clientName,
              text: item.nextAction,
              meta: formatCurrency(item.amountDue),
            }))}
          />
        </div>
      </DashboardSection>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase text-amber-700">Documents</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{signedContracts}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">Signed contracts are tracked privately with signing status and audit history.</p>
          </CardContent>
        </Card>
        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase text-amber-700">Evidence Vault</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{evidenceNeedingReview}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">Items uploaded or waiting for review stay private unless summarized after moderation.</p>
          </CardContent>
        </Card>
        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase text-amber-700">Alerts</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{unreadAlerts}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">Watchlist alerts help you review changes before scheduling or collecting deposits.</p>
          </CardContent>
        </Card>
      </div>
    </ClientDashboardShell>
  )
}

function RecentList({
  emptyText,
  href,
  items,
  title,
}: {
  emptyText: string
  href: string
  items: { id: string; label: string; meta: string; text: string }[]
  title: string
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-slate-950">{title}</h3>
        <Link href={href} className="text-sm font-semibold text-amber-700 hover:text-amber-800">
          Open
        </Link>
      </div>
      {items.length ? (
        <div className="mt-4 grid gap-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-md border border-slate-200 bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-slate-950">{item.label}</p>
                <StatusBadge>{item.meta}</StatusBadge>
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-md border border-dashed border-slate-300 bg-white p-4 text-sm leading-6 text-slate-600">
          {emptyText}
        </p>
      )}
    </div>
  )
}

function DashboardSetupState({ title, message }: { title: string; message: string }) {
  return (
    <section className="min-h-screen bg-slate-100">
      <div className="bureau-container py-12">
        <Card className="mx-auto max-w-3xl rounded-md border-slate-200 bg-white shadow-sm">
          <CardContent className="space-y-6 p-8">
            <div className="flex size-12 items-center justify-center rounded-md bg-amber-100 text-amber-800">
              <AlertCircle className="size-6" aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-normal text-slate-950">{title}</h1>
              <p className="text-sm leading-6 text-slate-600">{message}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                <Link href="/search">
                  <Search aria-hidden="true" />
                  Search a client
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/submit-report">
                  <FilePlus2 aria-hidden="true" />
                  Submit report
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/dashboard">Refresh dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  })
}
