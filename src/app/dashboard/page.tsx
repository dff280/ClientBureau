import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2, CreditCard, FilePlus2, Search, ShieldCheck, UploadCloud } from "lucide-react"

import { RiskBadge } from "@/components/client/risk-badge"
import { DashboardReports } from "@/components/dashboard/dashboard-reports"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { requireContractorAccess } from "@/lib/auth"
import {
  getContractorDashboardService,
  getPublicClientProfilesService,
} from "@/lib/repositories/client-bureau-service"

export const metadata: Metadata = {
  title: "Contractor Dashboard",
  description:
    "Client Bureau contractor dashboard for profile status, submitted reports, evidence uploads, saved searches, and subscription state.",
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const user = await requireContractorAccess()
  const [dashboard, clientProfiles] = await Promise.all([
    getContractorDashboardService(user.id),
    getPublicClientProfilesService(),
  ])

  if (!dashboard) return null

  const counts = {
    Draft: 0,
    Submitted: dashboard.reports.filter((report) => report.status === "pending").length,
    "In Review": dashboard.reports.filter((report) => report.status === "pending").length,
    "Needs More Info": 0,
    Approved: dashboard.reports.filter((report) => report.status === "approved").length,
    Rejected: dashboard.reports.filter((report) => report.status === "rejected").length,
    Published: dashboard.reports.filter((report) => {
      const client = clientProfiles.find((profile) => profile.id === report.clientId)
      return report.status === "approved" && Boolean(client?.isPublic)
    }).length,
    Disputed: dashboard.reports.filter((report) => report.status === "disputed").length,
    Resolved: dashboard.reports.filter((report) =>
      ["resolved", "paid"].some((term) => report.paymentStatus.toLowerCase().includes(term)),
    ).length,
  } satisfies Record<string, number>
  const subscriptionTier = dashboard.subscription?.tier ?? "free"
  const subscriptionStatus =
    !dashboard.subscription || dashboard.subscription.status === "mock"
      ? "active"
      : dashboard.subscription.status.replace("_", " ")
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

  return (
    <section className="bureau-section bg-slate-100">
      <div className="bureau-container space-y-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase text-amber-700">Contractor dashboard</p>
            <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
              {dashboard.contractor.businessName}
            </h1>
            <p className="leading-7 text-slate-600">
              Signed in as {dashboard.user.fullName}. Track submitted reports, evidence, saved
              searches, profile verification, and public profile publication status.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/search">
                <Search aria-hidden="true" />
                Search clients
              </Link>
            </Button>
            <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
              <Link href="/submit-report">
                <FilePlus2 aria-hidden="true" />
                Submit new report
              </Link>
            </Button>
          </div>
        </div>

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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-9">
          {Object.entries(counts).map(([status, count]) => (
            <Card key={status} className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase text-slate-500">{status}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
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
                  Trade: <span className="font-semibold text-slate-950">{dashboard.contractor.trade}</span>
                </p>
                <p>
                  Location:{" "}
                  <span className="font-semibold text-slate-950">
                    {dashboard.contractor.city}, {dashboard.contractor.state}
                  </span>
                </p>
                <p>
                  Verification:{" "}
                  <span className="font-semibold capitalize text-slate-950">
                    {dashboard.contractor.verificationStatus}
                  </span>
                </p>
                <p>
                  Subscription:{" "}
                  <span className="font-semibold text-slate-950">
                    {subscriptionTier.replace("_", " ")} / {subscriptionStatus}
                  </span>
                </p>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="font-semibold text-slate-950">Security controls</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Email verification, stronger sign-in controls, rate-limit hooks, duplicate
                    report checks, and appeal paths are tracked in the account workflow.
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
                  <div key={search.id} className="rounded-md border border-slate-200 p-3 text-sm">
                    <p className="font-semibold text-slate-950">{search.query}</p>
                    <p className="text-slate-500">
                      {search.city}, {search.state}
                    </p>
                  </div>
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

        <div className="grid gap-5 md:grid-cols-3">
          {clientProfiles
            .filter((profile) => profile.isPublic)
            .slice(0, 3)
            .map((profile) => (
              <Card key={profile.id} className="rounded-md border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-semibold text-slate-950">
                      {profile.firstName} {profile.lastName}
                    </h2>
                    <RiskBadge riskLevel={profile.riskLevel} />
                  </div>
                  <p className="text-sm text-slate-600">
                    {profile.city}, {profile.state} | Score {profile.clientBureauScore}
                  </p>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </section>
  )
}
