import type { Metadata } from "next"
import Link from "next/link"
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  FilePlus2,
  Radar,
  Search,
  ShieldCheck,
  UploadCloud,
} from "lucide-react"

import { RiskBadge } from "@/components/client/risk-badge"
import { DashboardReports } from "@/components/dashboard/dashboard-reports"
import { RiskOpsWorkspace } from "@/components/dashboard/risk-ops-workspace"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { requireContractorAccess } from "@/lib/auth"
import {
  getContractorDashboardService,
  getContractorRiskOpsDataService,
  getPublicClientProfilesService,
} from "@/lib/repositories/client-bureau-service"

export const metadata: Metadata = {
  title: "Contractor Dashboard",
  description:
    "Client Bureau contractor dashboard for profile status, submitted reports, evidence uploads, saved searches, watchlist alerts, and intake assessment workflows.",
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const user = await requireContractorAccess()
  const [dashboard, clientProfiles, riskOps] = await Promise.all([
    getContractorDashboardService(user.id),
    getPublicClientProfilesService(),
    getContractorRiskOpsDataService(user.id),
  ])

  if (!dashboard) {
    return (
      <DashboardSetupState
        title="Your dashboard workspace is being prepared."
        message="Your account is signed in, but Client Bureau could not load a contractor workspace yet. Start with a client search or refresh the dashboard after profile setup completes."
      />
    )
  }

  if (!riskOps) {
    return (
      <DashboardSetupState
        title="Risk Ops is being prepared."
        message="Your contractor profile is active, but the operations workspace did not load. You can still search clients and submit documented reports while this feature workspace initializes."
      />
    )
  }

  const subscriptionTier = dashboard.subscription?.tier ?? "free"
  const subscriptionStatus =
    !dashboard.subscription || dashboard.subscription.status === "mock"
      ? "active"
      : dashboard.subscription.status.replace("_", " ")
  const reportCounts = {
    submitted: dashboard.reports.filter((report) => report.status === "pending").length,
    approved: dashboard.reports.filter((report) => report.status === "approved").length,
    published: dashboard.reports.filter((report) => {
      const client = clientProfiles.find((profile) => profile.id === report.clientId)
      return report.status === "approved" && Boolean(client?.isPublic)
    }).length,
    disputed: dashboard.reports.filter((report) => report.status === "disputed").length,
  }
  const onboarding = [
    {
      label: "Verify business",
      complete: dashboard.contractor.verificationStatus === "verified",
      href: "/dashboard",
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
      complete: dashboard.evidence.length > 0,
      href: "/submit-report",
      icon: UploadCloud,
    },
    {
      label: "Choose plan",
      complete: subscriptionTier !== "free",
      href: "/pricing",
      icon: CreditCard,
    },
  ]
  const onboardingProgress = Math.round((onboarding.filter((item) => item.complete).length / onboarding.length) * 100)

  return (
    <section className="bg-slate-100">
      <div className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="bureau-container grid gap-8 py-10 lg:grid-cols-[1fr_380px] lg:items-end">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-md border border-amber-300/30 bg-white/5 px-3 py-2 text-sm font-semibold text-amber-200">
              <Radar className="size-4" aria-hidden="true" />
              Contractor Risk Ops
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">
                {dashboard.contractor.businessName}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                Signed in as {dashboard.user.fullName}. Review client-risk signals, manage draft
                reports, send contract signing links, track evidence status, and keep project
                intake decisions documentable.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-amber-500 text-slate-950 hover:bg-amber-400">
                <Link href="/search">
                  <Search aria-hidden="true" />
                  Search clients
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
                <Link href="/submit-report">
                  <FilePlus2 aria-hidden="true" />
                  Submit report
                </Link>
              </Button>
            </div>
          </div>
          <Card className="rounded-md border-white/10 bg-white/5 text-white shadow-2xl">
            <CardContent className="space-y-5 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Account health</p>
                  <p className="mt-2 text-3xl font-semibold">{onboardingProgress}%</p>
                </div>
                <RiskBadge riskLevel={dashboard.contractor.verificationStatus === "verified" ? "Low" : "Moderate"} />
              </div>
              <Progress value={onboardingProgress} />
              <div className="grid gap-2 text-sm text-slate-300">
                <p>Plan: <span className="font-semibold text-white">{subscriptionTier.replace("_", " ")} / {subscriptionStatus}</span></p>
                <p>Trade: <span className="font-semibold text-white">{dashboard.contractor.trade}</span></p>
                <p>Market: <span className="font-semibold text-white">{dashboard.contractor.city}, {dashboard.contractor.state}</span></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bureau-container space-y-8 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {onboarding.map((item) => {
            const Icon = item.icon

            return (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-md border border-slate-200 bg-white p-4 shadow-sm transition hover:border-amber-300"
              >
                <div className="flex items-center justify-between gap-3">
                  <Icon className="size-5 text-amber-700" aria-hidden="true" />
                  {item.complete ? (
                    <CheckCircle2 className="size-5 text-emerald-700" aria-label="Complete" />
                  ) : (
                    <span className="rounded-full border border-slate-300 px-2 py-0.5 text-xs font-semibold text-slate-500">
                      Next
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-950">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {item.complete ? "Complete" : "Recommended account step"}
                </p>
              </Link>
            )
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Submitted" value={reportCounts.submitted} />
          <Metric label="Approved" value={reportCounts.approved} />
          <Metric label="Published" value={reportCounts.published} />
          <Metric label="Disputed" value={reportCounts.disputed} />
        </div>

        <RiskOpsWorkspace riskOps={riskOps} clients={clientProfiles} />

        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <div className="space-y-5">
            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ShieldCheck className="size-5 text-amber-700" aria-hidden="true" />
                  Profile status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <p>
                  Verification:{" "}
                  <span className="font-semibold capitalize text-slate-950">
                    {dashboard.contractor.verificationStatus}
                  </span>
                </p>
                <p>
                  License:{" "}
                  <span className="font-semibold text-slate-950">
                    {dashboard.contractor.licenseNumber ?? "Not provided"}
                  </span>
                </p>
                <div>
                  <p className="font-semibold text-slate-950">Verification badges</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(dashboard.contractor.verificationBadges?.length
                      ? dashboard.contractor.verificationBadges
                      : ["Verified email"]
                    ).map((badge) => (
                      <span key={badge} className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="font-semibold text-slate-950">Security controls</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Email verification, stronger sign-in controls, rate-limit hooks, duplicate
                    checks, and appeal paths are tracked in the account workflow.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Saved searches</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboard.savedSearches.map((search) => (
                  <Link
                    key={search.id}
                    href={`/search?q=${encodeURIComponent(search.query)}${search.state ? `&state=${search.state}` : ""}`}
                    className="block rounded-md border border-slate-200 p-3 text-sm transition hover:border-amber-300"
                  >
                    <p className="font-semibold text-slate-950">{search.query}</p>
                    <p className="text-slate-500">
                      {search.city}, {search.state}
                    </p>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>My reports</CardTitle>
            </CardHeader>
            <CardContent>
              <DashboardReports reports={dashboard.reports} clients={clientProfiles} evidence={dashboard.evidence} />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
    </div>
  )
}

function DashboardSetupState({ title, message }: { title: string; message: string }) {
  return (
    <section className="bg-slate-100">
      <div className="bureau-container py-12">
        <Card className="mx-auto max-w-3xl rounded-md border-slate-200 bg-white shadow-sm">
          <CardContent className="space-y-6 p-8">
            <div className="flex size-12 items-center justify-center rounded-md bg-amber-100 text-amber-800">
              <AlertCircle className="size-6" aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
                {title}
              </h1>
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
