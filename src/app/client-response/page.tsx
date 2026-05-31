import type { Metadata } from "next"
import { MessageSquareText, Scale } from "lucide-react"

import { ClientResponseForm } from "@/components/forms/client-response-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { requireAuthenticatedUser } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Client Response and Dispute",
  description:
    "Client Bureau response and dispute intake for clients who want to respond to a contractor-submitted report or public profile.",
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = "force-dynamic"

export default async function ClientResponsePage() {
  await requireAuthenticatedUser()

  return (
    <section className="bureau-section bg-slate-100">
      <div className="bureau-container grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase text-amber-700">Client response</p>
            <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
              Respond to or dispute a public Client Bureau profile.
            </h1>
            <p className="max-w-3xl leading-7 text-slate-600">
              Clients may submit context for a published profile or report. Responses are reviewed
              before publication and displayed with relevant report context.
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
                Approved client responses appear on public profiles after moderation. Disputed
                reports remain labeled with relevant review context.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-md border-amber-200 bg-amber-50 shadow-sm">
            <CardContent className="space-y-4 p-6 text-amber-950">
              <Scale className="size-8" aria-hidden="true" />
              <h2 className="text-xl font-semibold">Review standard</h2>
              <p className="text-sm leading-6">
                Client Bureau may edit response summaries for clarity, relevance, privacy, and
                legally safer public presentation.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  )
}
