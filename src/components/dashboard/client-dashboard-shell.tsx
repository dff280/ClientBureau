import Link from "next/link"
import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import {
  Activity,
  BellRing,
  BriefcaseBusiness,
  ClipboardCheck,
  CreditCard,
  FilePlus2,
  Gift,
  Landmark,
  LayoutDashboard,
  PhoneCall,
  Search,
  ShieldCheck,
  Signature,
  Vault,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { contractorDashboardGroups } from "@/lib/navigation"
import { cn } from "@/lib/utils"

const navIcons: Record<string, LucideIcon> = {
  Overview: LayoutDashboard,
  Jobs: BriefcaseBusiness,
  "Check a Client": Search,
  "Report a Client Experience": FilePlus2,
  Reports: ClipboardCheck,
  Watchlist: BellRing,
  Growth: Gift,
  Contracts: Signature,
  "Payment Recovery": PhoneCall,
  "Florida Lien Service": Landmark,
  "Evidence Vault": Vault,
  Alerts: BellRing,
  Billing: CreditCard,
  Activity,
}

const mobileDashboardLinks = contractorDashboardGroups
  .flatMap((group) => group.links)
  .filter(
    (item, index, links) =>
      links.findIndex((candidate) => candidate.href === item.href && candidate.label === item.label) ===
      index,
  )

export function ClientDashboardShell({
  activeHref,
  badge,
  children,
  description,
  primaryAction,
  secondaryAction,
  title,
}: {
  activeHref: string
  badge?: string
  children: ReactNode
  description: string
  primaryAction?: {
    href: string
    label: string
    icon?: LucideIcon
  }
  secondaryAction?: {
    href: string
    label: string
    icon?: LucideIcon
  }
  title: string
}) {
  const PrimaryIcon = primaryAction?.icon
  const SecondaryIcon = secondaryAction?.icon

  return (
    <section className="bureau-paper min-h-screen">
      <div className="premium-hero-surface relative isolate overflow-hidden border-b border-slate-900 bg-slate-950 text-white">
        <div className="bureau-container flex flex-col justify-between gap-5 py-6 sm:py-7 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-md bg-amber-500 text-slate-950">
                {badge ?? "Client Bureau Dashboard"}
              </Badge>
              <Badge variant="outline" className="rounded-md border-white/15 bg-white/5 text-slate-200">
                Private workspace
              </Badge>
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-normal sm:text-4xl">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
          </div>
          {(primaryAction || secondaryAction) ? (
            <div className="grid gap-3 sm:flex sm:flex-wrap">
              {primaryAction ? (
                <Button asChild className="w-full justify-center bg-amber-500 text-slate-950 hover:bg-amber-400 sm:w-auto">
                  <Link href={primaryAction.href}>
                    {PrimaryIcon ? <PrimaryIcon aria-hidden="true" /> : null}
                    {primaryAction.label}
                  </Link>
                </Button>
              ) : null}
              {secondaryAction ? (
                <Button asChild variant="outline" className="w-full justify-center border-white/20 bg-white/10 text-white hover:bg-white/15 sm:w-auto">
                  <Link href={secondaryAction.href}>
                    {SecondaryIcon ? <SecondaryIcon aria-hidden="true" /> : null}
                    {secondaryAction.label}
                  </Link>
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-b border-slate-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="bureau-container py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-amber-700">Tools</p>
              <p className="text-sm text-slate-600">Jump to the task you need now.</p>
            </div>
            <Badge variant="outline" className="rounded-md border-slate-200 bg-slate-50 text-slate-700">
              Private
            </Badge>
          </div>
          <nav
            aria-label="Mobile dashboard tools"
            className="mobile-scrollbar -mx-4 mt-3 flex max-w-[calc(100%+2rem)] snap-x gap-2 overflow-x-auto overscroll-x-contain px-4 pb-1"
          >
            {mobileDashboardLinks.map((item) => {
              const Icon = navIcons[item.label] ?? ShieldCheck
              const active = item.href === activeHref

              return (
                <Link
                  key={`mobile-${item.href}-${item.label}`}
                  href={item.href}
                  className={cn(
                    "inline-flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium shadow-sm transition",
                    active
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:text-slate-950",
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    className={cn("size-4 shrink-0", active ? "text-amber-300" : "text-amber-700")}
                  />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      <div className="bureau-container grid gap-5 py-4 sm:gap-6 sm:py-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden h-fit rounded-md border border-slate-200 bg-white p-3 shadow-lg shadow-slate-950/5 lg:sticky lg:top-4 lg:block">
          <div className="mb-3 rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-amber-700">Tools</p>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              Pick the job you are trying to handle.
            </p>
          </div>
          <nav className="space-y-4" aria-label="Contractor dashboard">
            {contractorDashboardGroups.map((group) => (
              <div key={group.title}>
                <p className="px-2 text-xs font-semibold uppercase text-slate-500">{group.title}</p>
                <div className="mt-2 grid gap-1">
                  {group.links.map((item) => {
                    const Icon = navIcons[item.label] ?? ShieldCheck
                    const active = item.href === activeHref

                    return (
                      <Link
                        key={`${group.title}-${item.href}-${item.label}`}
                        href={item.href}
                        className={cn(
                          "flex items-start gap-2 rounded-md px-2 py-2 text-sm transition",
                          active
                            ? "bg-slate-950 font-semibold text-white shadow-sm"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-950",
                        )}
                      >
                        <Icon className={cn("mt-0.5 size-4 shrink-0", active ? "text-amber-300" : "text-amber-700")} aria-hidden="true" />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 space-y-5 sm:space-y-6">{children}</main>
      </div>
    </section>
  )
}
