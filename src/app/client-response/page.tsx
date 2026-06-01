import type { Metadata } from "next"
import { MessageSquareText, Scale } from "lucide-react"

import { ClientResponseForm } from "@/components/forms/client-response-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Client Response and Dispute",
  description:
    "Submit a Client Bureau response, dispute, correction request, or resolution update for moderated review.",
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = "force-dynamic"

export default async function ClientResponsePage() {
  return (
    <section className="bureau-section bg-slate-100">
      <div className="bureau-container grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase text-amber-700">Client response</p>
            <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
              Respond, dispute, correct, or update a public profile.
            </h1>
            <p className="max-w-3xl leading-7 text-slate-600">
              Client Bureau provides a right-of-response path for people named in public profiles.
              Submissions are verified, moderated, and displayed only when they add relevant public
              context without exposing private information.
            </p>
          </div>

          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Response request</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientResponseForm />
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <MessageSquareText className="size-8 text-slate-950" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-slate-950">Right of response</h2>
              <p className="text-sm leading-6 text-slate-600">
                Approved responses, correction notes, and resolution updates can appear on public
                profiles after moderation. Active disputes are labeled without declaring either
                side correct.
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
  )
}
