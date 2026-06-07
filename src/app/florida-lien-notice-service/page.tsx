import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, FileCheck2, Landmark, Scale, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { JsonLd, getFaqSchema } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Florida Lien Notice Service for Contractors",
  description:
    "Create a private Florida lien notice workflow with document review, contractor authorization, delivery tracking, and attorney/vendor review.",
  alternates: {
    canonical: "/florida-lien-notice-service",
  },
}

const faqs = [
  {
    question: "Does Client Bureau send Florida lien notices automatically?",
    answer:
      "No. A contractor must submit the case, pay the service fee, provide documents, and sign authorization before any notice workflow moves forward.",
  },
  {
    question: "Is this legal advice?",
    answer:
      "No. Client Bureau provides a managed workflow and routes eligible filing work through attorney/vendor review. Contractors should consult qualified counsel for legal advice.",
  },
  {
    question: "Are notice packets public?",
    answer:
      "No. Notice records, property details, raw documents, staff notes, and delivery proof stay private.",
  },
]

const noticeSteps = [
  {
    icon: FileCheck2,
    title: "Submit case",
    text: "Enter owner, county, property city, role, project, amount due, and notice history.",
  },
  {
    icon: ShieldCheck,
    title: "Pay fee",
    text: "Client Bureau service fees and pass-through delivery/vendor costs are tracked separately.",
  },
  {
    icon: Scale,
    title: "Sign authorization",
    text: "Contractors certify accuracy and authorize attorney/vendor review before movement.",
  },
  {
    icon: Landmark,
    title: "Track delivery",
    text: "Delivery method, tracking number, proof summary, and delivery status stay private.",
  },
]

const noticeReadiness = [
  {
    title: "Information to gather before review",
    points: [
      "Property county, project city, owner/client name, role on the job, first furnishing date, and the work or materials provided.",
      "Contract, invoice, payment record, communications, delivery address context, and any prior notice or deadline history.",
      "A short explanation of why the notice workflow is needed and whether the balance is disputed, partially paid, or unresolved.",
    ],
  },
  {
    title: "What the dashboard tracks privately",
    points: [
      "Service fee status, pass-through delivery/vendor cost status, authorization status, vendor review, and delivery method.",
      "Tracking number, delivery proof summary, staff review notes, attorney/vendor comments, and next action deadlines.",
      "Whether a later claim-of-lien filing review, release, correction, or closure step may be needed.",
    ],
  },
]

export default function FloridaLienNoticeServicePage() {
  return (
    <section className="bg-slate-100">
      <JsonLd data={getFaqSchema(faqs)} />
      <div className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="bureau-container grid gap-8 py-14 lg:grid-cols-[1fr_380px] lg:items-end">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase text-amber-300">Florida lien notice workflow</p>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-normal sm:text-5xl">
              Prepare Florida lien notices with review, authorization, and delivery tracking.
            </h1>
            <p className="max-w-3xl text-base leading-7 text-slate-300">
              Client Bureau helps contractors organize Florida notice packets, review key project
              facts, collect required documents, route the case through attorney/vendor review, and
              track delivery proof in a private workflow.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-amber-500 text-slate-950 hover:bg-amber-400">
                <Link href="/dashboard/lien-readiness">
                  Start Florida notice case
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
                <Link href="/florida-lien-filing-service">View filing service</Link>
              </Button>
            </div>
          </div>
          <Card className="rounded-md border-white/10 bg-white/10 text-white shadow-none">
            <CardContent className="space-y-4 p-6">
              <Landmark className="size-8 text-amber-300" aria-hidden="true" />
              <p className="text-xl font-semibold">Private notice workflow.</p>
              <p className="text-sm leading-6 text-slate-300">
                Florida notice cases stay private and require contractor certification before staff or vendor action.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bureau-container grid gap-6 py-12 md:grid-cols-4">
        {noticeSteps.map((item) => {
          const Icon = item.icon

          return (
          <Card key={item.title} className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-3 p-5">
              <Icon className="size-7 text-amber-700" aria-hidden="true" />
              <h2 className="font-semibold text-slate-950">{item.title}</h2>
              <p className="text-sm leading-6 text-slate-600">{item.text}</p>
            </CardContent>
          </Card>
          )
        })}
      </div>

      <div className="bureau-container pb-14">
        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardContent className="grid gap-6 p-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase text-amber-700">Compliance posture</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">Florida first, review-gated, private by default.</h2>
            </div>
            <p className="leading-7 text-slate-600">
              Florida construction lien and notice requirements can depend on project type, role,
              deadlines, owner information, and documents. Client Bureau does not provide legal
              advice and does not guarantee lien rights, priority, enforceability, delivery result,
              payment, or outcome.
            </p>
            <p className="leading-7 text-slate-600">
              The goal is to make deadline risk visible early, keep contractor authorization
              clear, and preserve a clean private record of what was prepared, reviewed, sent, and
              confirmed.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bureau-container grid gap-4 pb-14 lg:grid-cols-2">
        {noticeReadiness.map((section) => (
          <Card key={section.title} className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-2xl font-semibold tracking-normal text-slate-950">{section.title}</h2>
              <ul className="grid gap-3">
                {section.points.map((point) => (
                  <li key={point} className="flex gap-3 text-sm leading-6 text-slate-600">
                    <ShieldCheck className="mt-1 size-4 shrink-0 text-emerald-700" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
