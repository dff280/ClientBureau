import type { Metadata } from "next"
import { ClipboardCheck, FileText, ShieldCheck, Sparkles } from "lucide-react"

import { LegalNotice } from "@/components/client/legal-notice"
import { ReportSubmissionForm } from "@/components/forms/report-submission-form"
import { PremiumHero, PremiumProofStrip } from "@/components/marketing/premium-page-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { requireContractorAccess } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Report a Client Experience",
  description:
    "Report a documented client experience to Client Bureau, including positive context, payment status, job details, and private evidence for moderation.",
  alternates: {
    canonical: "/submit-report",
  },
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = "force-dynamic"

type SubmitReportSearchParams = Promise<
  Partial<Record<"firstName" | "lastName" | "city" | "state" | "businessName" | "intent" | "profileType" | "profileId", string>>
>

const proof = [
  { label: "Report types", value: "Positive + concern", text: "Document good clients, payment issues, disputes, and resolution context." },
  { label: "Visibility", value: "Pending first", text: "Submissions remain private until reviewed and approved." },
  { label: "Evidence", value: "Private", text: "Invoices, contracts, photos, PDFs, and screenshots stay in review workflows." },
  { label: "Public copy", value: "Moderated", text: "Approved summaries avoid private details and claims about motive." },
]

export default async function SubmitReportPage({
  searchParams,
}: {
  searchParams: SubmitReportSearchParams
}) {
  await requireContractorAccess()

  const defaults = await searchParams

  return (
    <main className="bg-slate-100">
      <PremiumHero
        eyebrow="Report a Client Experience"
        title="Document the client record while the details are still fresh."
        description="Submit positive experiences, payment concerns, dispute context, and project facts for moderation. Public summaries are reviewed before they can update a Client Bureau profile."
        aside={
          <div className="space-y-4 text-white">
            <Sparkles className="size-9 text-amber-300" aria-hidden="true" />
            <p className="text-xl font-semibold">Positive reports matter too.</p>
            <p className="text-sm leading-6 text-slate-300">
              A trustworthy platform should show paid-on-time, cooperative, resolved, and
              would-work-with-again client experiences alongside payment or dispute concerns.
            </p>
          </div>
        }
      />
      <PremiumProofStrip items={proof} dark />

      <section className="bureau-section">
        <div className="bureau-container grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold uppercase text-amber-700">Guided report intake</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
                Client identity, project details, payment timeline, evidence, and attestation.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Use factual project details and careful wording. Every report is reviewed for privacy,
                relevance, tone, evidence context, and whether the public summary can be presented fairly.
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
                  Before you submit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-slate-600">
                <p>Use project facts, dates, invoices, completion records, and communication history.</p>
                <p>Positive reports are supported for paid-on-time, cooperative, or would-work-with-again client experiences.</p>
                <p>Avoid personal attacks, private identifiers, or claims about motive.</p>
                <p>Approved reports can create or update an SEO-friendly public client profile.</p>
              </CardContent>
            </Card>
            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="size-5 text-amber-700" aria-hidden="true" />
                  Evidence stays private
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
    </main>
  )
}
