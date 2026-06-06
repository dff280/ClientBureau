import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BookOpenCheck, FileText, Scale, Search, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { resourceNavigationGroups } from "@/lib/navigation"
import { JsonLd, getFaqSchema } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Contractor Resources",
  description:
    "Client Bureau resources for client search, score methodology, report policies, moderation standards, and client response workflows.",
  alternates: {
    canonical: "/resources",
  },
}

const overview = [
  {
    icon: Search,
    title: "Check clients before the job",
    text: "Use private matching, approved public summaries, and client response context before accepting work or scheduling crews.",
  },
  {
    icon: ShieldCheck,
    title: "Understand moderated records",
    text: "Public profiles are built from admin-approved summaries. Private identifiers, evidence files, and pending content stay private.",
  },
  {
    icon: Scale,
    title: "Keep reports fair",
    text: "Client Bureau uses documented, cautious language and gives clients a clear response, correction, and dispute path.",
  },
]

const faqs = [
  {
    question: "What should contractors read first?",
    answer:
      "Start with How It Works, Score Methodology, and Report Policy to understand search, scoring, moderation, and public reporting standards.",
  },
  {
    question: "Can clients respond to a public profile?",
    answer:
      "Yes. Clients can submit a response, dispute, correction request, or resolution update for moderation before public display.",
  },
  {
    question: "Are private emails, phone numbers, and evidence files public?",
    answer:
      "No. Public pages do not display private contact identifiers, street addresses, internal notes, or raw evidence files.",
  },
]

export default function ResourcesPage() {
  return (
    <section className="bg-slate-100">
      <JsonLd data={getFaqSchema(faqs)} />
      <div className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="bureau-container grid gap-8 py-14 lg:grid-cols-[1fr_360px] lg:items-end">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase text-amber-300">Resources</p>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-normal sm:text-5xl">
              Clear guidance for using Client Bureau responsibly.
            </h1>
            <p className="max-w-3xl text-base leading-7 text-slate-300">
              Learn how client search, public reports, score methodology, private evidence
              handling, moderation, and response paths work together for contractors and clients.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-amber-500 text-slate-950 hover:bg-amber-400">
                <Link href="/search">
                  Check a Client
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
                <Link href="/how-it-works">How It Works</Link>
              </Button>
            </div>
          </div>
          <Card className="rounded-md border-white/10 bg-white/5 text-white shadow-2xl">
            <CardContent className="space-y-4 p-5">
              <div className="flex size-11 items-center justify-center rounded-md bg-amber-400 text-slate-950">
                <BookOpenCheck className="size-5" aria-hidden="true" />
              </div>
              <p className="text-lg font-semibold">Start with the standards.</p>
              <p className="text-sm leading-6 text-slate-300">
                The most useful Client Bureau records are factual, documented, moderated, and
                response-aware. These resources explain that standard in plain language.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bureau-container space-y-10 py-10">
        <div className="grid gap-4 md:grid-cols-3">
          {overview.map((item) => {
            const Icon = item.icon

            return (
              <Card key={item.title} className="rounded-md border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-4 p-5">
                  <Icon className="size-7 text-amber-700" aria-hidden="true" />
                  <h2 className="text-xl font-semibold text-slate-950">{item.title}</h2>
                  <p className="text-sm leading-6 text-slate-600">{item.text}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {resourceNavigationGroups.map((group) => (
            <Card key={group.title} className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center gap-2">
                  <FileText className="size-5 text-amber-700" aria-hidden="true" />
                  <h2 className="text-xl font-semibold text-slate-950">{group.title}</h2>
                </div>
                <div className="grid gap-3">
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-md border border-slate-200 p-3 transition hover:border-amber-300 hover:bg-amber-50/40"
                    >
                      <span className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-950">
                        {link.label}
                        <ArrowRight className="size-4 text-slate-400" aria-hidden="true" />
                      </span>
                      {link.description ? (
                        <span className="mt-1 block text-xs leading-5 text-slate-500">{link.description}</span>
                      ) : null}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardContent className="grid gap-5 p-6 lg:grid-cols-[1fr_280px] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase text-amber-700">Responsible use</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
                Built for documented business decisions, not public shaming.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Contractors can document positive experiences, payment concerns, dispute context,
                and resolution history. Public records stay limited to approved summaries and
                neutral response paths.
              </p>
            </div>
            <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
              <Link href="/report-policy">
                Review report standards
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
