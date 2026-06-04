import Link from "next/link"
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

interface PolicyPageProps {
  eyebrow: string
  title: string
  description: string
  updatedAt?: string
  sections: {
    title: string
    body: string
    bullets?: string[]
  }[]
}

export function PolicyPage({ eyebrow, title, description, updatedAt = "June 4, 2026", sections }: PolicyPageProps) {
  return (
    <section className="bureau-section bg-slate-100">
      <div className="bureau-container grid gap-8 lg:grid-cols-[1fr_340px]">
        <article className="space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase text-amber-700">{eyebrow}</p>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
              {title}
            </h1>
            <p className="max-w-3xl leading-7 text-slate-600">{description}</p>
            <p className="text-sm font-semibold text-slate-500">Last updated: {updatedAt}</p>
          </div>

          <div className="grid gap-4">
            {sections.map((section) => (
              <Card key={section.title} className="rounded-md border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-3 p-6">
                  <h2 className="text-xl font-semibold text-slate-950">{section.title}</h2>
                  <p className="text-sm leading-6 text-slate-600">{section.body}</p>
                  {section.bullets?.length ? (
                    <ul className="grid gap-2 pt-1">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-2 text-sm leading-6 text-slate-600">
                          <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-700" aria-hidden="true" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </article>

        <aside className="space-y-4">
          <Card className="rounded-md border-amber-200 bg-amber-50 shadow-sm">
            <CardContent className="space-y-4 p-6 text-amber-950">
              <ShieldCheck className="size-8" aria-hidden="true" />
              <h2 className="text-xl font-semibold">Trust standard</h2>
              <p className="text-sm leading-6">
                Client Bureau is built around documented submissions, private matching, moderated
                public summaries, evidence reviewed privately, and a clear response and correction path.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-xl font-semibold text-slate-950">Related standards</h2>
              <div className="grid gap-3">
                {[
                  ["/report-policy", "Report Policy"],
                  ["/dispute-policy", "Dispute Policy"],
                  ["/moderation-policy", "Moderation Policy"],
                  ["/privacy", "Privacy Policy"],
                ].map(([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center justify-between rounded-md border border-slate-200 p-3 text-sm font-semibold text-slate-950 transition hover:border-amber-300 hover:bg-amber-50/50"
                  >
                    {label}
                    <ArrowRight className="size-4 text-slate-400" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  )
}
