import type { Metadata } from "next"
import Link from "next/link"
import { Building2, FileCheck2, ShieldCheck, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Enterprise Contractor Intelligence",
  description:
    "Client Bureau enterprise options for contractor teams, regional groups, franchises, moderation workflows, and audit visibility.",
  alternates: {
    canonical: "/enterprise",
  },
}

const capabilities = [
  {
    icon: Users,
    title: "Team workspaces",
    text: "Coordinate shared searches, report submissions, evidence tracking, and review status across offices or crews.",
  },
  {
    icon: FileCheck2,
    title: "Moderation workflow",
    text: "Support higher submission volume with clearer review queues, decision reasons, audit trails, and response handling.",
  },
  {
    icon: ShieldCheck,
    title: "Policy alignment",
    text: "Keep public summaries careful, private identifiers protected, and client response paths visible.",
  },
]

export default function EnterprisePage() {
  return (
    <section className="bureau-section bg-slate-100">
      <div className="bureau-container space-y-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase text-amber-700">Enterprise</p>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
              Client-risk intelligence for contractor teams and regional networks.
            </h1>
            <p className="max-w-3xl leading-7 text-slate-600">
              Bureau Team and Enterprise support contractors who need shared search, documented
              report workflows, evidence handling, moderation visibility, and stronger audit
              controls across multiple users.
            </p>
          </div>
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <Building2 className="size-8 text-slate-950" aria-hidden="true" />
              <h2 className="text-2xl font-semibold text-slate-950">Custom annual options</h2>
              <p className="text-sm leading-6 text-slate-600">
                Enterprise plans are scoped around seats, search volume, moderation needs, audit
                visibility, and onboarding support.
              </p>
              <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                <Link href="/contact">Contact Client Bureau</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {capabilities.map((item) => (
            <Card key={item.title} className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-4 p-5">
                <item.icon className="size-8 text-amber-700" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-slate-950">{item.title}</h2>
                <p className="text-sm leading-6 text-slate-600">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
