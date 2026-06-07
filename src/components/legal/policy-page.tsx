import Link from "next/link"
import { ArrowRight, CheckCircle2, FileCheck2, Scale, ShieldCheck } from "lucide-react"

import { PremiumCtaBand, PremiumHero, PremiumProofStrip } from "@/components/marketing/premium-page-shell"
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

const proofItems = [
  { label: "Public content", value: "Moderated", text: "Approved summaries only, with private records kept out of public profiles." },
  { label: "Evidence", value: "Private", text: "Files are reviewed privately and summarized only when appropriate." },
  { label: "Response path", value: "Available", text: "Clients can respond, dispute, correct, or document resolution." },
  { label: "Records", value: "Traceable", text: "Admin decisions and visibility changes are designed for auditability." },
]

export function PolicyPage({ eyebrow, title, description, updatedAt = "June 4, 2026", sections }: PolicyPageProps) {
  return (
    <main className="bg-slate-100">
      <PremiumHero
        eyebrow={eyebrow}
        title={title}
        description={description}
        primary={{ href: "/resources", label: "Resource center", icon: FileCheck2 }}
        secondary={{ href: "/contact", label: "Contact Client Bureau", icon: ShieldCheck }}
        aside={
          <div className="space-y-4 text-white">
            <Scale className="size-9 text-amber-300" aria-hidden="true" />
            <p className="text-xl font-semibold">Trust standard</p>
            <p className="text-sm leading-6 text-slate-300">
              Client Bureau is built around documented submissions, private matching, moderated
              public summaries, evidence reviewed privately, and a clear response and correction path.
            </p>
            <p className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300">
              Last updated: {updatedAt}
            </p>
          </div>
        }
      />

      <PremiumProofStrip items={proofItems} dark />

      <section className="bureau-section">
        <div className="bureau-container grid gap-8 lg:grid-cols-[1fr_340px]">
          <article className="space-y-5">
            {sections.map((section, index) => (
              <Card key={section.title} className="rounded-md border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-start gap-4">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-slate-950 text-sm font-semibold text-amber-300">
                      {index + 1}
                    </span>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-950">{section.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{section.body}</p>
                    </div>
                  </div>
                  {section.bullets?.length ? (
                    <ul className="grid gap-2 border-t border-slate-100 pt-4">
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
          </article>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
            <Card className="rounded-md border-amber-200 bg-amber-50 shadow-sm">
              <CardContent className="space-y-4 p-6 text-amber-950">
                <ShieldCheck className="size-8" aria-hidden="true" />
                <h2 className="text-xl font-semibold">Plain-English policy posture</h2>
                <p className="text-sm leading-6">
                  These standards are written so contractors, service businesses, clients, and
                  moderators can understand what is public, what is private, and how fair context is handled.
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
                    ["/terms", "Terms of Service"],
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

      <PremiumCtaBand
        eyebrow="Use Client Bureau responsibly"
        title="Search carefully, document clearly, and keep private records private."
        description="Client Bureau is designed to support better business decisions with moderated records, response paths, and privacy-aware workflows."
        primary={{ href: "/search", label: "Check a Client", icon: ShieldCheck }}
        secondary={{ href: "/resources", label: "View resources", icon: FileCheck2 }}
      />
    </main>
  )
}
