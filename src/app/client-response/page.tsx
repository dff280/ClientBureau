import type { Metadata } from "next"
import type { LucideIcon } from "lucide-react"
import { CheckCircle2, FileText, MessageSquareText, Scale, ShieldCheck } from "lucide-react"

import { ClientResponseForm } from "@/components/forms/client-response-form"
import { PremiumHero, PremiumProofStrip } from "@/components/marketing/premium-page-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Client Response and Dispute",
  description:
    "Submit a Client Bureau response, dispute, correction request, or resolution update for moderated review and public profile context.",
  alternates: {
    canonical: "/client-response",
  },
}

export const dynamic = "force-dynamic"

const proof = [
  { label: "Response types", value: "4 paths", text: "Response, dispute, correction request, or resolution update." },
  { label: "Review", value: "Moderated", text: "Submissions are verified before any public display." },
  { label: "Documents", value: "Private", text: "Raw files, identity details, and private notes are not shown publicly." },
  { label: "Outcome", value: "Context", text: "Approved updates can add fair public context without declaring a winner." },
]

const responsePaths = [
  {
    icon: MessageSquareText,
    title: "Publish a response",
    text: "Use this when you want a moderated public response attached to profile or report context.",
  },
  {
    icon: Scale,
    title: "Dispute a report",
    text: "Use this when you believe published context is incomplete, mismatched, or needs formal dispute labeling.",
  },
  {
    icon: FileText,
    title: "Request correction",
    text: "Use this for identity, date, location, project, payment, or factual-context corrections.",
  },
  {
    icon: CheckCircle2,
    title: "Resolution update",
    text: "Use this when payment, communication, project status, or a dispute has been resolved or materially changed.",
  },
]

const readinessChecks = [
  "The Client Bureau profile URL or report reference is included.",
  "Your name and review contact email are accurate.",
  "The summary explains what should be corrected, disputed, or added.",
  "Any documentation link is appropriate for private moderator review.",
]

type ClientResponsePageProps = {
  searchParams: Promise<{
    profile?: string
    reportId?: string
    projectJobId?: string
  }>
}

export default async function ClientResponsePage({ searchParams }: ClientResponsePageProps) {
  const params = await searchParams

  return (
    <main className="bg-slate-100">
      <PremiumHero
        eyebrow="Client response"
        title="Respond, dispute, correct, or update a Client Bureau profile."
        description="Client Bureau gives people named in public profiles a structured right-of-response path. Submissions are verified, moderated, and displayed only when they add relevant public context."
        aside={
          <div className="space-y-4 text-white">
            <MessageSquareText className="size-9 text-amber-300" aria-hidden="true" />
            <p className="text-xl font-semibold">Fairness is part of the product.</p>
            <p className="text-sm leading-6 text-slate-300">
              Active disputes are labeled carefully. Approved responses can appear beside report
              context without exposing raw documents, phone numbers, emails, or staff-only review notes.
            </p>
          </div>
        }
      />
      <PremiumProofStrip items={proof} dark />

      <section className="bureau-section">
        <div className="bureau-container grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold uppercase text-amber-700">Moderated response intake</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
                Share your side, request a correction, or document a resolution.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Use the form below to identify the profile, describe the request, and provide
                documentation for private review. Public updates use careful, neutral language.
              </p>
            </div>

            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Choose the right request type</CardTitle>
                <p className="text-sm leading-6 text-slate-600">
                  Pick the path that best matches what you need moderators to review. Every path stays private until approved.
                </p>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                {responsePaths.map((path) => (
                  <ResponsePathCard key={path.title} {...path} />
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Response request</CardTitle>
                <p className="text-sm leading-6 text-slate-600">
                  Complete the fields below so moderators can match the request to the right profile, verify contact,
                  and decide what public context, if any, should be shown.
                </p>
              </CardHeader>
              <CardContent>
                <ClientResponseForm
                  defaultProfileUrl={params.profile}
                  defaultProjectJobId={params.projectJobId}
                  defaultReportId={params.reportId}
                />
              </CardContent>
            </Card>

          </div>

          <aside className="space-y-5">
            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-4 p-6">
                <ShieldCheck className="size-8 text-slate-950" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-slate-950">Before you submit</h2>
                <div className="grid gap-3 text-sm leading-6 text-slate-600">
                  {readinessChecks.map((check) => (
                    <div key={check} className="flex gap-3">
                      <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-700" aria-hidden="true" />
                      <span>{check}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-4 p-6">
                <MessageSquareText className="size-8 text-slate-950" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-slate-950">Right of response</h2>
                <p className="text-sm leading-6 text-slate-600">
                  Approved responses, correction notes, and resolution updates can appear on public
                  profiles after moderation. Active disputes are labeled without declaring either side correct.
                </p>
                <p className="text-sm leading-6 text-slate-600">
                  Client Bureau does not publish raw identity documents, private evidence files,
                  phone numbers, emails, or staff-only review notes.
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-md border-amber-200 bg-amber-50 shadow-sm">
              <CardContent className="space-y-4 p-6 text-amber-950">
                <Scale className="size-8" aria-hidden="true" />
                <h2 className="text-xl font-semibold">Review standard</h2>
                <p className="text-sm leading-6">
                  Moderators review identity, profile match, documentation, privacy, relevance, and
                  tone before deciding what should be published.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </main>
  )
}

function ResponsePathCard({
  icon: Icon,
  text,
  title,
}: {
  icon: LucideIcon
  text: string
  title: string
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-950 text-amber-300">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h3 className="font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
        </div>
      </div>
    </div>
  )
}
