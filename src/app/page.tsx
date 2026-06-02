import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  FileCheck2,
  FilePlus2,
  FileSearch,
  LockKeyhole,
  MessageSquareText,
  Scale,
  Search,
  ShieldCheck,
} from "lucide-react"

import { LegalNotice } from "@/components/client/legal-notice"
import { PricingCard } from "@/components/pricing/pricing-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { pricingTiers } from "@/lib/stripe/pricing"
import {
  getFaqSchema,
  getLocalBusinessSchema,
  getOrganizationSchema,
  getSoftwareApplicationSchema,
  getWebSiteSchema,
  JsonLd,
} from "@/lib/seo"

export const metadata: Metadata = {
  title: "Client Bureau | Search Client Reports Before You Sign",
  description:
    "Search Client Bureau before accepting work. Review moderated client reports, private matching, evidence-on-file summaries, and response context.",
  alternates: {
    canonical: "/",
  },
}

const trustSignals = [
  "Admin-approved public summaries",
  "Private phone and email matching",
  "Evidence reviewed privately",
  "Client response and correction path",
]

const features = [
  {
    icon: FileSearch,
    title: "Private matching",
    text: "Search by name, business, city, state, phone, or email. Sensitive identifiers support matching but are not displayed on public profiles.",
  },
  {
    icon: FileCheck2,
    title: "Documented reports",
    text: "Contractors submit project facts, payment timeline, dispute context, public-summary wording, and evidence for moderation.",
  },
  {
    icon: Scale,
    title: "Moderated summaries",
    text: "Public pages use restrained reported-experience language, avoid private details, and show only approved profile context.",
  },
  {
    icon: MessageSquareText,
    title: "Right of response",
    text: "Clients can submit responses, corrections, disputes, and resolution updates that are reviewed before publication.",
  },
]

const processSteps = [
  {
    title: "Search",
    text: "Check a client before accepting work, ordering materials, or opening your calendar. Searches can use public identity fields and private matching signals.",
  },
  {
    title: "Review",
    text: "Read Client Bureau Score context, report count, dispute history, evidence-on-file summaries, and approved contractor-submitted experiences.",
  },
  {
    title: "Report",
    text: "If your documented experience should help other contractors, submit a report with project facts, timeline, payment status, and private evidence.",
  },
  {
    title: "Protect",
    text: "Use moderated client-risk intelligence to make stronger intake, contract, deposit, scheduling, and documentation decisions.",
  },
]

const useCases = [
  "Final payment review before scheduling closeout work",
  "Pre-contract intake for remodels, roofing, trades, and service work",
  "Team review before assigning crews, materials, and subcontractors",
  "Documented resolution updates after payment, correction, or dispute context changes",
]

const faqs = [
  {
    question: "What is Client Bureau not?",
    answer:
      "Client Bureau is not a public accusation board. It is a moderated client-risk intelligence platform for documented contractor experiences, private matching, evidence-on-file summaries, and client response context.",
  },
  {
    question: "Are phone numbers and emails public?",
    answer:
      "No. Phone numbers and emails are used for private matching and are not displayed on public client profile pages.",
  },
  {
    question: "What appears on a public profile?",
    answer:
      "Public profiles show non-sensitive identity fields, Client Bureau Score context, approved report summaries, evidence-on-file summaries, dispute context, and approved client responses.",
  },
  {
    question: "Can a client respond or request a correction?",
    answer:
      "Yes. Client Bureau provides a response, dispute, correction, and resolution-update workflow. Submissions are reviewed before public display.",
  },
]

export default function Home() {
  const localBusinessSchema = getLocalBusinessSchema()

  return (
    <>
      <JsonLd data={getOrganizationSchema()} />
      <JsonLd data={getWebSiteSchema()} />
      <JsonLd data={getSoftwareApplicationSchema()} />
      <JsonLd data={getFaqSchema(faqs)} />
      {localBusinessSchema ? <JsonLd data={localBusinessSchema} /> : null}

      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <Image
          src="/images/client-bureau-platform-hero-bright.webp"
          alt="Client Bureau dashboard showing client search, score context, moderated summaries, and evidence-on-file review."
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 z-0 object-cover object-[68%_center] opacity-100"
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950/95 via-slate-950/55 to-slate-950/0" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/15" />
        <div className="bureau-container relative z-20 flex min-h-[720px] items-end py-12 lg:py-16">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-md border border-amber-300/30 bg-white/5 px-3 py-2 text-sm font-medium text-amber-200">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Moderated client-risk intelligence for contractors
            </div>
            <div className="space-y-5">
              <h1 className="text-5xl font-semibold leading-tight tracking-normal sm:text-6xl lg:text-7xl">
                Search before you sign.
              </h1>
              <p className="max-w-2xl text-xl leading-8 text-slate-100">
                Know who you&apos;re working with before the job starts.
              </p>
              <p className="max-w-3xl text-base leading-7 text-slate-300">
                Client Bureau helps contractors evaluate documented client experiences before
                committing labor, materials, deposits, and schedule capacity. Search profiles,
                review moderated summaries, submit documented reports, and preserve a fair
                response path for clients.
              </p>
            </div>
            <form action="/search" className="grid max-w-3xl gap-3 rounded-md border border-white/15 bg-white p-2 shadow-2xl sm:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                <Input
                  name="q"
                  placeholder="Search by client name, business, city, phone, or email"
                  className="h-12 border-0 pl-10 text-slate-950 shadow-none focus-visible:ring-0"
                />
              </div>
              <Button className="h-12 bg-amber-500 px-6 text-slate-950 hover:bg-amber-400">
                Search a client
              </Button>
            </form>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
                <Link href="/submit-report">
                  <FilePlus2 aria-hidden="true" />
                  Submit a documented report
                </Link>
              </Button>
              <Button asChild variant="ghost" className="text-white hover:bg-white/10">
                <Link href="/how-it-works">
                  See how moderation works
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {trustSignals.map((signal) => (
              <div key={signal} className="flex items-center gap-3 rounded-md border border-white/15 bg-slate-950/55 p-3 text-sm text-slate-100 shadow-lg backdrop-blur">
                <CheckCircle2 className="size-4 text-amber-300" aria-hidden="true" />
                {signal}
              </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bureau-section bg-white">
        <div className="bureau-container grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase text-amber-700">Contractor-first review</p>
            <h2 className="text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
              Client risk intelligence should be factual, moderated, and fair.
            </h2>
            <p className="leading-7 text-slate-600">
              Contractors are often asked to invest time, trust, labor, and materials before a
              client relationship has been tested. Client Bureau creates a more careful intake
              layer: documented contractor experiences are reviewed, private identifiers stay
              private, and public profile summaries are written for clarity rather than conflict.
            </p>
            <p className="leading-7 text-slate-600">
              The goal is not to label people. The goal is to help contractors evaluate reported
              payment reliability, dispute context, documentation history, and resolution signals
              before a project begins.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature) => (
              <Card key={feature.title} className="rounded-md border-slate-200 shadow-sm">
                <CardContent className="space-y-4 p-5">
                  <feature.icon className="size-8 text-slate-950" aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-slate-950">{feature.title}</h3>
                  <p className="text-sm leading-6 text-slate-600">{feature.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bureau-section bg-slate-100">
        <div className="bureau-container grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase text-slate-500">Why it matters</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              A contractor&apos;s biggest risk can start before the contract is signed.
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Slow final payments, unclear scope expectations, repeated access issues, disputed
              completion records, and post-project chargebacks can strain crews and cash flow.
              Client Bureau gives contractors a serious place to check reported experience before
              those risks are already locked into the schedule.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {useCases.map((useCase) => (
              <div key={useCase} className="rounded-md border border-slate-200 bg-white p-5 text-sm font-medium leading-6 text-slate-700 shadow-sm">
                {useCase}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bureau-section bg-white">
        <div className="bureau-container space-y-10">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase text-amber-700">Trust process</p>
              <h2 className="text-3xl font-semibold text-slate-950">
                Search, review, report, protect.
              </h2>
              <p className="max-w-3xl text-sm leading-6 text-slate-600">
                Client Bureau separates intake search, contractor documentation, moderation review,
                public profile publication, and client response into a workflow that can scale
                without becoming messy or inflammatory.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/how-it-works">
                View workflow
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {processSteps.map((step, index) => (
              <div key={step.title} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                <span className="text-sm font-semibold text-amber-700">0{index + 1}</span>
                <h3 className="mt-3 text-xl font-semibold text-slate-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bureau-section bg-slate-950 text-white">
        <div className="bureau-container grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase text-amber-300">Pricing</p>
            <h2 className="text-3xl font-semibold tracking-normal">
              Built for solo contractors, offices, and regional teams.
            </h2>
            <p className="leading-7 text-slate-300">
              Start with basic client checks, then upgrade for deeper search, evidence workflows,
              report tracking, team visibility, and priority moderation. Every plan keeps private
              identifiers off public pages and preserves a response path.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {pricingTiers.map((tier) => (
              <PricingCard key={tier.id} tier={tier} />
            ))}
          </div>
        </div>
      </section>

      <section className="bureau-section bg-white">
        <div className="bureau-container grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <LegalNotice />
          <div className="grid gap-4 sm:grid-cols-2">
            {faqs.map((item) => (
              <Card key={item.question} className="rounded-md border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-2 p-5">
                  <h3 className="font-semibold text-slate-950">{item.question}</h3>
                  <p className="text-sm leading-6 text-slate-600">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bureau-section bg-slate-100">
        <div className="bureau-container grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase text-amber-700">Ready for better intake?</p>
            <h2 className="text-3xl font-semibold tracking-normal text-slate-950">
              Create your contractor account and search before the next contract is signed.
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Client Bureau helps your team make more informed decisions with documented contractor
              experiences, moderated public profiles, evidence-on-file summaries, and a fair
              client response workflow.
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <BadgeCheck className="size-10 text-amber-300" aria-hidden="true" />
            <h3 className="mt-4 text-2xl font-semibold tracking-normal">
              Join the contractor intelligence bureau.
            </h3>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild className="bg-amber-500 text-slate-950 hover:bg-amber-400">
                <Link href="/signup">
                  Create account
                  <LockKeyhole aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                <Link href="/contact">
                  Contact Client Bureau
                  <Building2 aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
