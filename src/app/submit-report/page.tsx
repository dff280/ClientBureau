import type { Metadata } from "next"

import { LegalNotice } from "@/components/client/legal-notice"
import { ReportSubmissionForm } from "@/components/forms/report-submission-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { requireContractorAccess } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Submit Client Report",
  description:
    "Submit a documented Client Bureau report with project details, payment status, report category, and evidence for moderation.",
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = "force-dynamic"

type SubmitReportSearchParams = Promise<Partial<Record<"firstName" | "lastName" | "city" | "state" | "businessName", string>>>

export default async function SubmitReportPage({
  searchParams,
}: {
  searchParams: SubmitReportSearchParams
}) {
  await requireContractorAccess()

  const defaults = await searchParams

  return (
    <section className="bureau-section bg-slate-100">
      <div className="bureau-container grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase text-amber-700">Submit report</p>
            <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
              Document a client experience for admin review.
            </h1>
            <p className="max-w-3xl leading-7 text-slate-600">
              Reports stay pending until reviewed. Public summaries should describe verifiable
              project facts and reported experience without claims about intent.
            </p>
          </div>

          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Client and project details</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportSubmissionForm defaults={defaults} />
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-5">
          <LegalNotice />
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Moderation checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-slate-600">
              <p>Use project facts, dates, invoices, and completion records.</p>
              <p>Avoid personal attacks or claims about motive.</p>
              <p>Approved reports can create an SEO-friendly public client profile.</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  )
}
