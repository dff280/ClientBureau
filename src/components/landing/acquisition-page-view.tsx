import Link from "next/link"
import { ArrowRight, CheckCircle2, FileText, LockKeyhole, Search, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { AcquisitionPage } from "@/lib/acquisition-pages"
import { getSiteUrl } from "@/lib/env"
import { JsonLd, getFaqSchema } from "@/lib/seo"

export function AcquisitionPageView({ page }: { page: AcquisitionPage }) {
  const siteUrl = getSiteUrl()
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${siteUrl}${page.path}#webpage`,
        url: `${siteUrl}${page.path}`,
        name: page.title,
        description: page.description,
        isPartOf: {
          "@id": `${siteUrl}/#website`,
        },
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
        breadcrumb: {
          "@id": `${siteUrl}${page.path}#breadcrumb`,
        },
        mainEntity: {
          "@id": `${siteUrl}${page.path}#main-service`,
        },
      },
      {
        "@type": page.kind === "guide" ? "Article" : "Service",
        "@id": `${siteUrl}${page.path}#main-service`,
        name: page.title,
        description: page.description,
        provider: {
          "@id": `${siteUrl}/#organization`,
        },
        areaServed: "United States",
        audience: {
          "@type": "Audience",
          audienceType: "Contractors and service business owners",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteUrl}${page.path}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Client Bureau",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Resources",
            item: `${siteUrl}/resources`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: page.title,
            item: `${siteUrl}${page.path}`,
          },
        ],
      },
    ],
  }

  return (
    <section className="bg-slate-100">
      <JsonLd data={structuredData} />
      <JsonLd data={getFaqSchema(page.faqs)} />
      <div className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="bureau-container grid gap-8 py-14 lg:grid-cols-[1fr_380px] lg:items-end">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-md border border-amber-300/30 bg-white/5 px-3 py-2 text-sm font-semibold text-amber-200">
              <ShieldCheck className="size-4" aria-hidden="true" />
              {page.eyebrow}
            </div>
            <div>
              <h1 className="max-w-4xl text-4xl font-semibold tracking-normal sm:text-5xl">
                {page.h1}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">{page.heroCopy}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-amber-500 text-slate-950 hover:bg-amber-400">
                <Link href={page.primaryCta.href}>
                  {page.primaryCta.label}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
                <Link href={page.secondaryCta.href}>{page.secondaryCta.label}</Link>
              </Button>
            </div>
          </div>
          <Card className="rounded-md border-white/10 bg-white/10 text-white shadow-none">
            <CardContent className="space-y-4 p-6">
              <LockKeyhole className="size-8 text-amber-300" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold uppercase text-slate-300">{page.proofLabel}</p>
                <p className="mt-1 text-2xl font-semibold">{page.proofValue}</p>
              </div>
              <p className="text-sm leading-6 text-slate-300">{page.proofDetail}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bureau-container space-y-10 py-10">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <p className="text-sm font-semibold uppercase text-amber-700">When to use this</p>
              <h2 className="text-2xl font-semibold tracking-normal text-slate-950">
                Built for practical contractor decisions.
              </h2>
              <div className="grid gap-3">
                {page.useCases.map((item) => (
                  <div key={item} className="flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                    <Search className="mt-1 size-4 shrink-0 text-amber-700" aria-hidden="true" />
                    <p className="text-sm leading-6 text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <p className="text-sm font-semibold uppercase text-amber-700">Workflow</p>
              <h2 className="text-2xl font-semibold tracking-normal text-slate-950">
                The clean path from risk to record.
              </h2>
              <div className="grid gap-3">
                {page.workflow.map((step, index) => (
                  <div key={step} className="flex gap-3 rounded-md border border-slate-200 bg-white p-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-slate-950 text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-6 text-slate-600">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {page.trustPoints.map((point) => (
            <Card key={point} className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardContent className="flex gap-3 p-5">
                <CheckCircle2 className="mt-1 size-5 shrink-0 text-emerald-700" aria-hidden="true" />
                <p className="text-sm leading-6 text-slate-600">{point}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardContent className="space-y-5 p-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_260px] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase text-amber-700">Related Client Bureau tools</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
                  Keep the next step close.
                </h2>
              </div>
              <Button asChild variant="outline">
                <Link href="/resources">Browse resources</Link>
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {page.relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md border border-slate-200 bg-slate-50 p-4 transition hover:border-amber-300 hover:bg-white"
                >
                  <span className="flex items-center justify-between gap-3 font-semibold text-slate-950">
                    {link.label}
                    <ArrowRight className="size-4 text-slate-400" aria-hidden="true" />
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-slate-600">{link.description}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center gap-2">
              <FileText className="size-5 text-amber-700" aria-hidden="true" />
              <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Questions contractors ask</h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {page.faqs.map((faq) => (
                <div key={faq.question} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-semibold text-slate-950">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
