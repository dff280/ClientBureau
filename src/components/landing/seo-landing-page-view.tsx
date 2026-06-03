import Link from "next/link"
import { ArrowRight, FilePlus2, LockKeyhole, Search, ShieldCheck } from "lucide-react"

import { RiskBadge } from "@/components/client/risk-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { SeoLandingPage } from "@/lib/seo-landing-pages"
import type { PublicClientProfile } from "@/lib/types"

export function SeoLandingPageView({
  page,
  profiles,
}: {
  page: SeoLandingPage
  profiles: PublicClientProfile[]
}) {
  const reports = profiles
    .flatMap((profile) => profile.reports.map((report) => ({ profile, report })))
    .sort((a, b) =>
      new Date(b.report.approvedAt ?? b.report.createdAt).getTime() -
      new Date(a.report.approvedAt ?? a.report.createdAt).getTime(),
    )
  const totalUnpaid = profiles.reduce((total, profile) => total + profile.balanceSummary.totalReportedUnpaid, 0)
  const openDisputes = profiles.reduce((total, profile) => total + profile.balanceSummary.openDisputeCount, 0)

  return (
    <section className="bg-slate-100">
      <div className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="bureau-container grid gap-8 py-12 lg:grid-cols-[1fr_360px] lg:items-end">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-md border border-amber-300/30 bg-white/5 px-3 py-2 text-sm font-semibold text-amber-200">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Moderated client-risk intelligence
            </div>
            <div>
              <h1 className="max-w-4xl text-4xl font-semibold tracking-normal sm:text-5xl">
                {page.h1}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">{page.intro}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-amber-500 text-slate-950 hover:bg-amber-400">
                <Link href="/search">
                  <Search aria-hidden="true" />
                  {page.primaryCta}
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
                <Link href="/submit-report">
                  <FilePlus2 aria-hidden="true" />
                  {page.secondaryCta}
                </Link>
              </Button>
            </div>
          </div>
          <Card className="rounded-md border-white/10 bg-white/5 text-white shadow-sm">
            <CardContent className="grid gap-4 p-5">
              <Metric label="Matched public profiles" value={profiles.length.toLocaleString()} />
              <Metric label="Published reports" value={reports.length.toLocaleString()} />
              <Metric label="Reported unpaid balances" value={formatCurrency(totalUnpaid)} />
              <Metric label="Open dispute context" value={openDisputes.toLocaleString()} />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bureau-container space-y-8 py-10">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <p className="text-sm font-semibold uppercase text-amber-700">Who this helps</p>
              <h2 className="text-2xl font-semibold text-slate-950">Built for pre-client decisions.</h2>
              <p className="text-sm leading-6 text-slate-600">{page.audience}</p>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Public pages show approved summaries, reported experience context, score factors,
                client response information, and evidence-on-file labels. Private phone numbers,
                emails, street addresses, raw files, and pending content are not displayed.
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <p className="text-sm font-semibold uppercase text-amber-700">Search first workflow</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {["Search public profile context", "Review score factors and balances", "Check response or dispute context", "Document your own experience"].map((step, index) => (
                  <div key={step} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">Step {index + 1}</p>
                    <p className="mt-1 font-semibold text-slate-950">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-amber-700">Public profiles</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">Approved client profile matches</h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/signup">
                Create account
                <LockKeyhole aria-hidden="true" />
              </Link>
            </Button>
          </div>
          {profiles.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {profiles.map((profile) => (
                <Card key={profile.id} className="rounded-md border-slate-200 bg-white shadow-sm">
                  <CardContent className="space-y-5 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-950">
                          {profile.firstName} {profile.lastName}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {profile.city}, {profile.state}
                        </p>
                      </div>
                      <RiskBadge riskLevel={profile.riskLevel} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <ProfileFact label="Score" value={`${profile.clientBureauScore}/100`} />
                      <ProfileFact label="Reports" value={String(profile.reports.length)} />
                      <ProfileFact label="Reported unpaid" value={formatCurrency(profile.balanceSummary.totalReportedUnpaid)} />
                    </div>
                    <Button asChild variant="outline">
                      <Link href={`/client/${profile.publicSlug}`}>
                        View profile
                        <ArrowRight aria-hidden="true" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-semibold text-slate-950">No approved public profiles match this page yet.</h3>
                <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Client Bureau publishes profiles only after admin approval. Search privately or submit a documented report for moderation.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                    <Link href="/search">Search a client</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/submit-report">Submit a report</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase text-amber-700">Report context</p>
          <div className="grid gap-4 lg:grid-cols-3">
            {reports.slice(0, 6).map(({ profile, report }) => (
              <Card key={report.id} className="rounded-md border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-3 p-5">
                  <p className="text-xs font-semibold uppercase text-slate-500">{report.reportCategory}</p>
                  <h3 className="font-semibold text-slate-950">
                    {profile.firstName} {profile.lastName} / {profile.city}, {profile.state}
                  </h3>
                  <p className="text-sm leading-6 text-slate-600">{report.publicSummary}</p>
                  <p className="text-sm font-semibold text-slate-950">
                    Reported unpaid: {formatCurrency(report.amountUnpaid)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  )
}

function ProfileFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
    </div>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}
