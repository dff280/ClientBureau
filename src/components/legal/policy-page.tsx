import { ShieldCheck } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

interface PolicyPageProps {
  eyebrow: string
  title: string
  description: string
  sections: {
    title: string
    body: string
  }[]
}

export function PolicyPage({ eyebrow, title, description, sections }: PolicyPageProps) {
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
          </div>

          <div className="grid gap-4">
            {sections.map((section) => (
              <Card key={section.title} className="rounded-md border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-3 p-6">
                  <h2 className="text-xl font-semibold text-slate-950">{section.title}</h2>
                  <p className="text-sm leading-6 text-slate-600">{section.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </article>

        <aside>
          <Card className="rounded-md border-amber-200 bg-amber-50 shadow-sm">
            <CardContent className="space-y-4 p-6 text-amber-950">
              <ShieldCheck className="size-8" aria-hidden="true" />
              <h2 className="text-xl font-semibold">Launch note</h2>
              <p className="text-sm leading-6">
                This page is operational policy copy for the MVP. Final legal terms should be
                reviewed by qualified counsel before onboarding customers or indexing real reports.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  )
}
