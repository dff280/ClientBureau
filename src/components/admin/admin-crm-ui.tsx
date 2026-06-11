import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type AdminOutcomeTone = "slate" | "amber" | "emerald" | "rose" | "blue"

const adminOutcomeToneClasses: Record<AdminOutcomeTone, string> = {
  slate: "border-slate-200 bg-slate-50 text-slate-700",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
  rose: "border-rose-200 bg-rose-50 text-rose-800",
  blue: "border-sky-200 bg-sky-50 text-sky-800",
}

export function AdminActionOutcomePanel({
  description,
  eyebrow = "Action confidence",
  footer = "Every admin action should leave the queue clearer, preserve private records, and be traceable in audit history.",
  items,
  title,
}: {
  description: string
  eyebrow?: string
  footer?: string
  items: Array<{
    detail: string
    label: string
    status: string
    title: string
    tone?: AdminOutcomeTone
  }>
  title: string
}) {
  return (
    <section className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <p className="text-xs font-semibold uppercase text-amber-700">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-semibold tracking-normal text-slate-950">{title}</h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
      </div>
      <div className="grid gap-3 p-5 md:grid-cols-3">
        {items.map((item) => (
          <article key={item.title} className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold uppercase text-amber-700">{item.label}</p>
              <span
                className={cn(
                  "shrink-0 rounded-md border px-2 py-1 text-xs font-semibold uppercase",
                  adminOutcomeToneClasses[item.tone ?? "slate"],
                )}
              >
                {item.status}
              </span>
            </div>
            <h3 className="mt-3 font-semibold text-slate-950">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
          </article>
        ))}
      </div>
      <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
        <p className="text-sm leading-6 text-slate-600">{footer}</p>
      </div>
    </section>
  )
}

export function AdminQueueHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  badge,
  actions,
}: {
  eyebrow: string
  title: string
  description: string
  icon?: LucideIcon
  badge?: string
  actions?: ReactNode
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="flex min-w-0 gap-4">
          {Icon ? (
            <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-slate-950 text-white">
              <Icon className="size-5" aria-hidden="true" />
            </span>
          ) : null}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase text-amber-700">{eyebrow}</p>
              {badge ? (
                <Badge variant="outline" className="rounded-md bg-slate-50">
                  {badge}
                </Badge>
              ) : null}
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">{title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
          </div>
        </div>
        {actions ? <div className="flex flex-wrap gap-2 lg:justify-end">{actions}</div> : null}
      </div>
    </div>
  )
}

export function AdminFilterBar({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase text-amber-700">Filters</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}

export function AdminProfileHealthCard({
  title,
  subtitle,
  badge,
  tone = "slate",
  facts,
  actions,
  children,
}: {
  title: string
  subtitle: string
  badge: string
  tone?: "slate" | "amber" | "emerald" | "rose" | "blue"
  facts: Array<{ label: string; value: ReactNode }>
  actions?: ReactNode
  children?: ReactNode
}) {
  const badgeTone = {
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
    rose: "border-rose-200 bg-rose-50 text-rose-800",
    blue: "border-sky-200 bg-sky-50 text-sky-800",
  }[tone]

  return (
    <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-slate-950">{title}</p>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        </div>
        <span className={cn("shrink-0 rounded-md border px-2 py-1 text-xs font-semibold uppercase", badgeTone)}>
          {badge}
        </span>
      </div>
      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        {facts.map((fact) => (
          <div key={fact.label} className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <dt className="text-xs font-semibold uppercase text-slate-500">{fact.label}</dt>
            <dd className="mt-1 break-words text-sm font-semibold text-slate-950">{fact.value}</dd>
          </div>
        ))}
      </dl>
      {children ? <div className="mt-4">{children}</div> : null}
      {actions ? <div className="mt-5 flex flex-wrap gap-2">{actions}</div> : null}
    </article>
  )
}

export function AdminDecisionPanel({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <aside className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase text-amber-700">Decision panel</p>
      <h3 className="mt-1 font-semibold text-slate-950">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-4 grid gap-3">{children}</div>
    </aside>
  )
}
