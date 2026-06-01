import type { Metadata } from "next"
import Link from "next/link"
import { FilePlus2, Search, ShieldCheck } from "lucide-react"

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
    pending: dashboard.reports.filter((report) => report.status === "pending").length,
    approved: dashboard.reports.filter((report) => report.status === "approved").length,
    rejected: dashboard.reports.filter((report) => report.status === "rejected").length,
    disputed: dashboard.reports.filter((report) => report.status === "disputed").length,
  }

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
              Signed in as {dashboard.user.fullName}. Reports, evidence, and subscription status are
              loaded through the active Client Bureau data adapter.
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

        <div className="grid gap-5 md:grid-cols-4">
          {Object.entries(counts).map(([status, count]) => (
            <Card key={status} className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm font-semibold uppercase text-slate-500">{status}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{count}</p>
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
                    {dashboard.subscription?.tier ?? "free"} / {dashboard.subscription?.status ?? "mock"}
                  </span>
                </p>
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
