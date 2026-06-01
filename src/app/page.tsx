import Link from "next/link"
import type { Metadata } from "next"
import {
  ArrowRight,
  BadgeCheck,
  FileCheck2,
  FilePlus2,
  FileSearch,
  LockKeyhole,
  Scale,
  Search,
  ShieldCheck,
} from "lucide-react"

import { LegalNotice } from "@/components/client/legal-notice"
import { RiskBadge } from "@/components/client/risk-badge"
import { ScoreGauge } from "@/components/client/score-gauge"
import { PricingCard } from "@/components/pricing/pricing-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { pricingTiers } from "@/lib/stripe/pricing"

export const metadata: Metadata = {
  title: "Search Before You Sign",
  description:
    "Client Bureau helps contractors search moderated client-risk intelligence, submit documented reports, and review evidence-on-file summaries before accepting work.",
  alternates: {
    canonical: "/",
  },
}

const features = [
  {
    icon: FileSearch,
    title: "Private matching",
    text: "Search by name, location, business, phone, or email while private identifiers stay protected from public pages.",
  },
  {
    icon: FileCheck2,
    title: "Documented experiences",
    text: "Capture project facts, payment timeline, dispute context, and supporting evidence for moderator review.",
  },
  {
    icon: Scale,
    title: "Fair public summaries",
    text: "Published profiles use admin-approved summaries, evidence-on-file language, and client right-of-response.",
  },
]

const steps = ["Search", "Review", "Report", "Protect"]

export default function Home() {
  return (
    <>
      <section className="bg-slate-950 text-white">
        <div className="bureau-container grid min-h-[620px] gap-10 py-12 md:grid-cols-[1.05fr_0.95fr] md:items-center lg:py-16">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-md border border-amber-300/30 bg-white/5 px-3 py-2 text-sm font-medium text-amber-200">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Contractor-first client intelligence
            </div>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-normal sm:text-6xl">
                Search before you sign.
              </h1>
              <p className="max-w-2xl text-xl leading-8 text-slate-200">
                Know who you&apos;re working with before the job starts.
              </p>
              <p className="max-w-2xl text-base leading-7 text-slate-300">
                Client Bureau gives contractors moderated client-risk intelligence: private
                matching, evidence-on-file summaries, documented contractor experiences, and
                client response paths in one restrained trust platform.
              </p>
            </div>
            <form action="/search" className="grid max-w-3xl gap-3 rounded-md border border-white/10 bg-white p-2 shadow-2xl sm:grid-cols-[1fr_auto]">
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
              <Button asChild variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                <Link href="/submit-report">
                  <FilePlus2 aria-hidden="true" />
                  Submit a documented report
                </Link>
              </Button>
            </div>
            <div className="grid gap-4 text-sm text-slate-300 sm:grid-cols-3">
              <span>Admin-approved public summaries</span>
              <span>Private phone and email matching</span>
              <span>Client right-of-response</span>
            </div>
          </div>
          <div className="rounded-md border border-white/10 bg-white p-5 text-slate-950 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Example profile</p>
                <h2 className="text-2xl font-semibold">John Smith</h2>
                <p className="text-sm text-slate-600">Orlando, FL</p>
              </div>
              <RiskBadge riskLevel="Elevated" />
            </div>
            <ScoreGauge score={48} />
            <div className="mt-6 grid gap-3">
              {[
                ["Report count", "2 approved reports"],
                ["Payment reliability", "Payment concerns reported"],
                ["Moderation", "Evidence reviewed privately"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-md border border-slate-200 p-3">
                  <span className="text-sm font-medium text-slate-500">{label}</span>
                  <span className="text-sm font-semibold text-slate-950">{value}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-600">
              A contractor-submitted report states that a final invoice remained partially unpaid
              after documented completion of a kitchen remodel.
            </p>
          </div>
        </div>
      </section>

      <section className="bureau-section bg-white">
        <div className="bureau-container grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase text-amber-700">Search before you sign</p>
            <h2 className="text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
              Client risk intelligence should be factual, moderated, and easy to check.
            </h2>
            <p className="leading-7 text-slate-600">
              Client Bureau helps your team review documented payment patterns, dispute context,
              and client responses before labor, materials, and scheduling risk are already committed.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
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
        <div className="bureau-container grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase text-slate-500">Problem</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              Contractors often learn about client risk after labor, materials, and time are already spent.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Unpaid invoices and slow final payments",
              "Undocumented scope changes",
              "Chargebacks after completion",
              "No-show access windows and cancellations",
            ].map((problem) => (
              <div key={problem} className="rounded-md border border-slate-200 bg-white p-5 text-sm font-medium text-slate-700 shadow-sm">
                {problem}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bureau-section bg-white">
        <div className="bureau-container space-y-10">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase text-amber-700">How it works</p>
              <h2 className="text-3xl font-semibold text-slate-950">Search, review, report, protect.</h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/how-it-works">
                View workflow
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                <span className="text-sm font-semibold text-amber-700">0{index + 1}</span>
                <h3 className="mt-3 text-xl font-semibold text-slate-950">{step}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {step === "Search"
                    ? "Check a client profile using name, location, or private matching identifiers."
                    : step === "Review"
                      ? "Read approved summaries, score signals, dispute context, and client responses."
                      : step === "Report"
                        ? "Submit project facts, payment status, and evidence for moderation."
                        : "Use documented history to make stronger intake and contract decisions."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bureau-section bg-slate-950 text-white">
        <div className="bureau-container grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase text-amber-300">Pricing preview</p>
            <h2 className="text-3xl font-semibold tracking-normal">Built for solo contractors and teams.</h2>
            <p className="leading-7 text-slate-300">
              Start with basic client checks, then upgrade for deeper search, evidence workflows,
              report tracking, and team-level review controls.
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
        <div className="bureau-container grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <LegalNotice />
          <div className="rounded-md border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <BadgeCheck className="size-10 text-amber-300" aria-hidden="true" />
            <h2 className="mt-4 text-3xl font-semibold tracking-normal">
              Create your contractor account.
            </h2>
            <p className="mt-3 leading-7 text-slate-300">
              Start with a contractor profile, submit documented reports, and keep your search
              history organized before the next contract is signed.
            </p>
            <Button asChild className="mt-6 bg-amber-500 text-slate-950 hover:bg-amber-400">
              <Link href="/signup">
                Create account
                <LockKeyhole aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
