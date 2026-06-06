"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ClipboardCheck, Search, ShieldCheck, Signature } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { businessProtectionPromise } from "@/lib/product-positioning"

type WorkflowMode = {
  title: string
  eyebrow: string
  text: string
  cta: string
  href?: string
  tab?: string
  icon: LucideIcon
  tools: string[]
}

const workflowModes: WorkflowMode[] = [
  {
    title: "Screen & decide",
    eyebrow: "Before you accept work",
    text: "Search the client, review positive and concern reports, check private-match signals, and decide what contract or deposit controls are needed.",
    cta: "Check a Client",
    href: "/search",
    icon: Search,
    tools: ["Search", "Watchlist", "Intake assessment"],
  },
  {
    title: "Agree & sign",
    eyebrow: "Before you schedule",
    text: "Prepare a private agreement link the client can review and sign, then track invite, signature, deposit, milestone, and change-order status.",
    cta: "Open contracts / templates",
    tab: "contracts",
    icon: Signature,
    tools: ["Agreement templates", "Signing links", "Client invite"],
  },
  {
    title: "Document & resolve",
    eyebrow: "When a job needs records",
    text: "Keep evidence private, submit concern or positive reports, log respectful payment follow-up, and maintain readiness checklists for review.",
    cta: "Report a Client Experience",
    href: "/submit-report",
    icon: ClipboardCheck,
    tools: ["Evidence Vault", "Reports", "Payment Recovery", "Florida Lien Service"],
  },
]

const workspaceGuide = [
  {
    title: "Client pipeline",
    text: "A private list of leads and active jobs so you know which client needs screening, a contract, follow-up, or closeout.",
  },
  {
    title: "Watchlist",
    text: "Search profiles, check private matches, monitor alerts, and save both positive and concern context before accepting work.",
  },
  {
    title: "Client Work Files",
    text: "One private file per important client tying together searches, reports, evidence, payment follow-up, and agreement links.",
  },
  {
    title: "Contracts",
    text: "Agreement templates, change orders, and private signing links clients can review and sign before the job moves forward.",
  },
  {
    title: "Payment Recovery",
    text: "Open a managed Resolution Desk case for staff-assisted review and follow-up, or keep your own private invoice timeline and payment-plan records.",
  },
  {
    title: "Florida Lien Service",
    text: "Start a private Florida notice or claim-of-lien filing workflow with fee tracking, contractor authorization, attorney/vendor review, recording proof, and release tracking.",
  },
]

export function ContractorWorkspaceGuidance({
  onOpenTab,
}: {
  onOpenTab: (tab: string) => void
}) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase text-amber-700">Start here</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950">
            What do you need to do next?
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Client Bureau is organized around real contractor decisions: check a client before you
            accept the job, get terms signed before you schedule, and keep records ready if payment
            or scope needs follow-up.
          </p>
          <p className="mt-3 inline-flex rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-slate-900">
            {businessProtectionPromise}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/score-methodology">
            <ShieldCheck aria-hidden="true" />
            Review score method
          </Link>
        </Button>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {workflowModes.map((item) => {
          const Icon = item.icon

          return (
            <div key={item.title} className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-amber-700">{item.eyebrow}</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-950">{item.title}</h3>
                </div>
                <Icon className="size-5 shrink-0 text-amber-700" aria-hidden="true" />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.tools.map((tool) => (
                  <Badge key={tool} variant="outline" className="rounded-md bg-white">
                    {tool}
                  </Badge>
                ))}
              </div>
              {item.href ? (
                <Button asChild size="sm" variant="outline" className="mt-4 bg-white">
                  <Link href={item.href}>{item.cta}</Link>
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-4 bg-white"
                  onClick={() => item.tab && onOpenTab(item.tab)}
                >
                  {item.cta}
                </Button>
              )}
            </div>
          )
        })}
      </div>
      <Accordion type="single" collapsible className="mt-4">
        <AccordionItem value="tool-guide" className="rounded-md border border-slate-200 bg-white px-4">
          <AccordionTrigger className="py-3 text-sm font-semibold text-slate-950">
            What each tool does
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {workspaceGuide.map((item) => (
                <div key={item.title} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-950">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  )
}
