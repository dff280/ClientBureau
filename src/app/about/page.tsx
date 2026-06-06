import type { Metadata } from "next"
import Link from "next/link"
import { BadgeCheck, FileSearch, Scale, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "About Client Bureau",
  description:
    "Client Bureau is a moderated client intelligence platform helping contractors and service businesses check clients, document jobs, and submit client reports.",
  alternates: {
    canonical: "/about",
  },
}

const principles = [
  {
    icon: FileSearch,
    title: "Business-owner client intelligence",
    text: "Contractors and service businesses need better pre-job information before accepting work, assigning crews, ordering materials, and extending credit-like trust.",
  },
  {
    icon: Scale,
    title: "Moderated and fair",
    text: "Client Bureau uses reported-experience language, admin review, evidence-on-file summaries, and a visible right-of-response path.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    text: "Phone numbers, emails, raw evidence, private addresses, and internal moderation notes do not appear on public client profiles.",
  },
]

export default function AboutPage() {
  return (
    <section className="bureau-section bg-slate-100">
      <div className="bureau-container space-y-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase text-amber-700">About Client Bureau</p>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
              A trust platform for contractors and service businesses who need to know more before the job starts.
            </h1>
            <p className="max-w-3xl leading-7 text-slate-600">
              Client Bureau helps contractors and service businesses search client profiles,
              review moderated contractor-submitted reports, submit documented experiences, and
              understand response or dispute context before accepting work from a homeowner, customer,
              property owner, lead, or project client.
            </p>
          </div>
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-3 p-6">
              <BadgeCheck className="size-8 text-amber-700" aria-hidden="true" />
              <p className="text-xl font-semibold text-slate-950">Not a public accusation board.</p>
              <p className="text-sm leading-6 text-slate-600">
                Client Bureau is built around documentation, moderation, and fairness. Public
                content is framed as reported contractor experience and reviewed profile context.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {principles.map((principle) => (
            <Card key={principle.title} className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-4 p-5">
                <principle.icon className="size-8 text-slate-950" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-slate-950">{principle.title}</h2>
                <p className="text-sm leading-6 text-slate-600">{principle.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">What Client Bureau publishes</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Public profiles show non-sensitive client identity fields, approved report summaries,
            score context, evidence-on-file summaries, response or dispute context, and public
            moderation status. They do not show raw evidence files, private identifiers, private
            addresses, or unapproved submissions.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
              <Link href="/search">Search a client</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/score-methodology">Review score methodology</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
