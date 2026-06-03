import type { Metadata } from "next"
import { ClipboardCheck, FileText, ShieldCheck } from "lucide-react"

import { LegalNotice } from "@/components/client/legal-notice"
import { ReportSubmissionForm } from "@/components/forms/report-submission-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { requireContractorAccess } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Submit Client Report",
  description:
    "Submit a documented Client Bureau report, including positive client experiences, payment context, and private evidence for moderation.",
  alternates: {
    canonical: "/submit-report",
  },
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = "force-dynamic"

type SubmitReportSearchParams = Promise<Partial<Record<"firstName" | "lastName" | "city" | "state" | "businessName" | "intent", string>>>

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
              Submit concern reports or positive client recommendations. Every report stays pending
              until reviewed, and public summaries must describe verifiable project facts without
              private details or claims about intent.
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
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="size-5 text-amber-700" aria-hidden="true" />
                Moderation checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-slate-600">
              <p>Use project facts, dates, invoices, and completion records.</p>
              <p>Positive reports are supported for paid-on-time, cooperative, or would-work-with-again client experiences.</p>
              <p>Avoid personal attacks or claims about motive.</p>
              <p>Approved reports can create an SEO-friendly public client profile.</p>
            </CardContent>
          </Card>
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5 text-amber-700" aria-hidden="true" />
                Evidence status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-slate-600">
              <p>Invoices, contracts, photos, PDFs, and screenshots stay private for moderator review.</p>
              <p>Public pages show only evidence summaries, such as documents reviewed or invoices reviewed.</p>
            </CardContent>
          </Card>
          <Card className="rounded-md border-slate-200 bg-slate-950 text-white shadow-sm">
            <CardContent className="space-y-3 p-5">
              <ShieldCheck className="size-6 text-amber-300" aria-hidden="true" />
              <h2 className="font-semibold">Need more time?</h2>
              <p className="text-sm leading-6 text-slate-300">
                Use the dashboard draft workflow to keep intake notes, evidence status, and next steps organized before final submission.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  )
}
