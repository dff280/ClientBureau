import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, CheckCircle2, FileText, PhoneCall, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { JsonLd, getFaqSchema } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Payment Recovery Service for Contractors",
  description:
    "Open a private managed payment recovery case. Client Bureau reviews documents, contacts the client, logs responses, and tracks contractor-direct resolution.",
  alternates: {
    canonical: "/payment-recovery-service",
  },
}

const steps = [
  "Submit invoice, contract, project timeline, and evidence-on-file summary.",
  "Pay the Client Bureau service fee for Resolution Desk review.",
  "Client Bureau staff reviews the private case and contacts the client with factual language.",
  "Responses, payment-plan offers, disputes, and resolution status are privately logged.",
]

const faqs = [
  {
    question: "Does Client Bureau collect or hold recovered payment?",
    answer:
      "No. Recovery payments remain contractor-direct in this workflow. Client Bureau charges a service fee for review, outreach, and documentation support.",
  },
  {
    question: "Is payment recovery guaranteed?",
    answer:
      "No. Client Bureau does not guarantee collection, payment timing, legal outcome, or dispute resolution.",
  },
  {
    question: "Will recovery case details appear on public client profiles?",
    answer:
      "No. Private recovery records, client contact details, evidence, staff notes, and payment records are not displayed on public profiles.",
  },
]

const highlights = [
  {
    icon: FileText,
    title: "Document review",
    text: "Invoices, contracts, completion records, and communication history are reviewed privately.",
  },
  {
    icon: ShieldCheck,
    title: "Careful communication",
    text: "Outreach should be factual, respectful, and logged with outcome and follow-up details.",
  },
  {
    icon: CheckCircle2,
    title: "Resolution tracking",
    text: "Payment promises, disputes, payment plans, and unresolved status stay organized.",
  },
]

export default function PaymentRecoveryServicePage() {
  return (
    <section className="bg-slate-100">
      <JsonLd data={getFaqSchema(faqs)} />
      <div className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="bureau-container grid gap-8 py-14 lg:grid-cols-[1fr_380px] lg:items-end">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase text-amber-300">Managed Resolution Desk</p>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-normal sm:text-5xl">
              Get help recovering payment without turning the dispute public.
            </h1>
            <p className="max-w-3xl text-base leading-7 text-slate-300">
              Open a private payment recovery case when an invoice is overdue and you need a documented,
              professional follow-up process. Client Bureau reviews your records, contacts the client,
              logs responses, and tracks contractor-direct resolution options.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-amber-500 text-slate-950 hover:bg-amber-400">
                <Link href="/dashboard/recovery">
                  Get help recovering payment
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
                <Link href="/pricing">View service plans</Link>
              </Button>
            </div>
          </div>
          <Card className="rounded-md border-white/10 bg-white/10 text-white shadow-none">
            <CardContent className="space-y-4 p-6">
              <PhoneCall className="size-8 text-amber-300" aria-hidden="true" />
              <p className="text-xl font-semibold">Private, documented, staff-assisted.</p>
              <p className="text-sm leading-6 text-slate-300">
                Use Resolution Desk for professional invoice follow-up, not public pressure. Client payments remain direct to your business.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bureau-container grid gap-8 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase text-amber-700">How It Works</p>
          <h2 className="text-3xl font-semibold tracking-normal text-slate-950">A managed workflow for overdue invoices.</h2>
          <p className="leading-7 text-slate-600">
            Recovery work should be factual, documented, and private. Client Bureau helps organize your
            records, conduct respectful outreach, and keep a clear timeline if the client responds,
            disputes, offers terms, or resolves the balance.
          </p>
          <Button asChild variant="outline">
            <Link href="/report-policy">Read report and moderation policy</Link>
          </Button>
        </div>
        <div className="grid gap-3">
          {steps.map((step, index) => (
            <div key={step} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-slate-950 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-slate-700">{step}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bureau-container grid gap-4 pb-14 md:grid-cols-3">
        {highlights.map((item) => {
          const Icon = item.icon

          return (
          <Card key={item.title} className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-3 p-5">
              <Icon className="size-7 text-amber-700" aria-hidden="true" />
              <h3 className="font-semibold text-slate-950">{item.title}</h3>
              <p className="text-sm leading-6 text-slate-600">{item.text}</p>
            </CardContent>
          </Card>
          )
        })}
      </div>
    </section>
  )
}
