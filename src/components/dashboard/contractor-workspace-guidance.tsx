"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ClipboardCheck, Search, ShieldCheck, Signature } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

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
    text: "Search the client, review private-match signals, run an intake assessment, and decide what contract or deposit controls are needed.",
    cta: "Search a client",
    href: "/search",
    icon: Search,
    tools: ["Search", "Watchlist", "Intake assessment"],
  },
  {
    title: "Agree & sign",
    eyebrow: "Before you schedule",
    text: "Prepare a private agreement link the client can review and sign, then track invite, signature, deposit, and milestone status.",
    cta: "Open contracts",
    tab: "contracts",
    icon: Signature,
    tools: ["Agreement drafts", "Signing links", "Client invite"],
  },
  {
    title: "Document & resolve",
    eyebrow: "When a job needs records",
    text: "Keep evidence private, continue report drafts, log respectful payment follow-up, and maintain readiness checklists for review.",
    cta: "Submit a report",
    href: "/submit-report",
    icon: ClipboardCheck,
    tools: ["Evidence", "Reports", "Payment follow-up"],
  },
]

const workspaceGuide = [
  {
    title: "Client pipeline",
    text: "A private list of leads and active jobs so you know which client needs screening, a contract, follow-up, or closeout.",
  },
  {
    title: "Watchlist",
    text: "Search profiles, check private matches, save watchlist alerts, and decide what controls are needed before accepting work.",
  },
  {
    title: "Client Work Files",
    text: "One private file per important client tying together searches, reports, evidence, payment follow-up, and agreement links.",
  },
  {
    title: "Contract signing links",
    text: "Private links clients can review and sign. This is the start of the client invite and agreement management path.",
  },
  {
    title: "Payment follow-up",
    text: "A private record of invoice timelines, contact attempts, payment plans, and resolution status. It is not automated payment enforcement.",
  },
  {
    title: "Notice readiness",
    text: "Private checklists for state-specific review of deadlines, documents, and contract context before any sensitive notice is considered.",
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
            Choose the job workflow you need right now.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Client Bureau is organized around the contractor decision cycle: screen before you
            accept work, get the agreement signed before scheduling, and keep private records if
            a job needs documentation or resolution.
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
