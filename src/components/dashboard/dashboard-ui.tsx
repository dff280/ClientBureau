import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { ArrowRight, Inbox } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Tone = "slate" | "amber" | "emerald" | "rose" | "blue"

const toneClasses: Record<Tone, string> = {
  slate: "border-slate-200 bg-white text-slate-950",
  amber: "border-amber-200 bg-amber-50 text-amber-950",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-950",
  rose: "border-rose-200 bg-rose-50 text-rose-950",
  blue: "border-sky-200 bg-sky-50 text-sky-950",
}

const iconToneClasses: Record<Tone, string> = {
  slate: "bg-slate-950 text-white",
  amber: "bg-amber-500 text-slate-950",
  emerald: "bg-emerald-700 text-white",
  rose: "bg-rose-700 text-white",
  blue: "bg-sky-700 text-white",
}

export function DashboardShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn("bureau-paper min-h-screen px-4 py-6 sm:px-6 lg:px-8", className)}>
      <div className="mx-auto max-w-7xl space-y-6">{children}</div>
    </section>
  )
}

export function DashboardPageHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
  className,
}: {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
  meta?: ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        "rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:p-6",
        className,
      )}
    >
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-amber-700">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
          {meta ? <div className="mt-4">{meta}</div> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2 lg:justify-end">{actions}</div> : null}
      </div>
    </header>
  )
}

export function AdminPageHeader(props: Parameters<typeof DashboardPageHeader>[0]) {
  return <DashboardPageHeader {...props} />
}

export function DashboardSection({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn("min-w-0 rounded-md border border-slate-200 bg-white shadow-sm", className)}>
      <div className="flex min-w-0 flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-start">
        <div className="min-w-0">
          {eyebrow ? <p className="text-xs font-semibold uppercase text-amber-700">{eyebrow}</p> : null}
          <h2 className="mt-1 text-xl font-semibold tracking-normal text-slate-950">{title}</h2>
          {description ? <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div className="min-w-0 p-5">{children}</div>
    </section>
  )
}

export function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "slate",
  href,
}: {
  label: string
  value: ReactNode
  helper?: string
  icon?: LucideIcon
  tone?: Tone
  href?: string
}) {
  const content = (
    <div className={cn("bureau-hover-lift h-full rounded-md border p-4 shadow-sm", toneClasses[tone])}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase opacity-70">{label}</p>
          <p className="mt-2 truncate text-3xl font-semibold">{value}</p>
        </div>
        {Icon ? (
          <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-md", iconToneClasses[tone])}>
            <Icon className="size-5" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      {helper ? <p className="mt-2 text-xs leading-5 opacity-70">{helper}</p> : null}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block h-full transition hover:-translate-y-0.5">
        {content}
      </Link>
    )
  }

  return content
}

export function QuickActionCard({
  href,
  icon: Icon,
  title,
  description,
  badge,
  primary = false,
}: {
  href: string
  icon: LucideIcon
  title: string
  description: string
  badge?: string
  primary?: boolean
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={cn(
        "bureau-hover-lift group flex h-full flex-col justify-between rounded-md border p-4 shadow-sm",
        primary
          ? "border-slate-950 bg-slate-950 text-white"
          : "border-slate-200 bg-white text-slate-950 hover:border-amber-300",
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "flex size-10 items-center justify-center rounded-md",
              primary ? "bg-amber-500 text-slate-950" : "bg-slate-950 text-white",
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
          </span>
          {badge ? (
            <Badge
              variant="outline"
              className={cn("rounded-md", primary ? "border-white/20 text-white" : "bg-white")}
            >
              {badge}
            </Badge>
          ) : null}
        </div>
        <h3 className="mt-4 font-semibold">{title}</h3>
        <p className={cn("mt-2 text-sm leading-6", primary ? "text-slate-300" : "text-slate-600")}>
          {description}
        </p>
      </div>
      <span className={cn("mt-4 inline-flex items-center gap-2 text-sm font-semibold", primary ? "text-amber-200" : "text-amber-700")}>
        Open tool
        <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  )
}

export function GuidedActionPanel({
  cta,
  description,
  href,
  icon: Icon,
  label,
  steps,
  title,
  tone = "slate",
}: {
  cta: string
  description: string
  href: string
  icon: LucideIcon
  label: string
  steps: string[]
  title: string
  tone?: Tone
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={cn(
        "bureau-hover-lift group block h-full rounded-md border p-5 shadow-sm",
        toneClasses[tone],
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase opacity-70">{label}</p>
          <h3 className="mt-2 text-lg font-semibold tracking-normal">{title}</h3>
          <p className="mt-2 text-sm leading-6 opacity-75">{description}</p>
        </div>
        <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-md", iconToneClasses[tone])}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-5 grid gap-2">
        {steps.map((step, index) => (
          <div key={step} className="flex items-start gap-2 text-sm leading-6 opacity-80">
            <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-semibold">
              {index + 1}
            </span>
            <span>{step}</span>
          </div>
        ))}
      </div>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-amber-700 group-hover:text-amber-800">
        {cta}
        <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  )
}

export function DashboardActionRail({
  actions,
  className,
}: {
  actions: {
    detail?: string
    href: string
    label: string
    primary?: boolean
  }[]
  className?: string
}) {
  return (
    <div className={cn("grid gap-3 md:grid-cols-3", className)}>
      {actions.map((action) => (
        <Link
          key={`${action.href}-${action.label}`}
          href={action.href}
          prefetch={false}
          className={cn(
            "group rounded-md border p-4 shadow-sm transition hover:-translate-y-0.5",
            action.primary
              ? "border-slate-950 bg-slate-950 text-white"
              : "border-slate-200 bg-white text-slate-950 hover:border-amber-300",
          )}
        >
          <span
            className={cn(
              "text-xs font-semibold uppercase",
              action.primary ? "text-amber-300" : "text-amber-700",
            )}
          >
            {action.primary ? "Start here" : "Next option"}
          </span>
          <span className="mt-2 block font-semibold">{action.label}</span>
          {action.detail ? (
            <span
              className={cn(
                "mt-2 block text-sm leading-6",
                action.primary ? "text-slate-300" : "text-slate-600",
              )}
            >
              {action.detail}
            </span>
          ) : null}
          <span
            className={cn(
              "mt-4 inline-flex items-center gap-2 text-sm font-semibold",
              action.primary ? "text-amber-200" : "text-amber-700",
            )}
          >
            Continue
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </Link>
      ))}
    </div>
  )
}

export function ToolQuickStart({
  actions,
  className,
  description,
  details,
  eyebrow = "Quick start",
  statusDescription,
  statusLabel,
  statusTone = "emerald",
  title,
}: {
  actions: {
    detail?: string
    href: string
    label: string
    primary?: boolean
  }[]
  className?: string
  description: string
  details: {
    label: string
    text: string
  }[]
  eyebrow?: string
  statusDescription: string
  statusLabel: string
  statusTone?: Tone
  title: string
}) {
  return (
    <section className={cn("rounded-md border border-slate-200 bg-white shadow-sm", className)}>
      <div className="grid gap-0 lg:grid-cols-[1fr_280px]">
        <div className="p-5">
          <p className="text-xs font-semibold uppercase text-amber-700">{eyebrow}</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
          <details className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
            <summary className="cursor-pointer text-sm font-semibold text-slate-950">
              What this tool does, when to use it, and what stays private
            </summary>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {details.map((item) => (
                <div key={item.label} className="rounded-md border border-slate-200 bg-white p-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">{item.label}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
          </details>
        </div>
        <aside className="border-t border-slate-200 bg-slate-950 p-5 text-white lg:border-l lg:border-t-0">
          <p className="text-xs font-semibold uppercase text-amber-300">Private workspace</p>
          <h3 className="mt-2 text-xl font-semibold">{statusLabel}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{statusDescription}</p>
          <StatusBadge tone={statusTone} className="mt-4 bg-white">
            Account-only
          </StatusBadge>
        </aside>
      </div>
      <div className="border-t border-slate-100 p-5">
        <DashboardActionRail actions={actions} />
      </div>
    </section>
  )
}

export function StatusBadge({
  children,
  tone = "slate",
  className,
}: {
  children: ReactNode
  tone?: Tone
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold capitalize",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
}: {
  title: string
  description: string
  action?: ReactNode
  icon?: LucideIcon
}) {
  return (
    <div className="grid place-items-center rounded-md border border-dashed border-slate-300 bg-white px-6 py-10 text-center shadow-sm">
      <div className="flex size-12 items-center justify-center rounded-md bg-slate-950 text-amber-300 shadow-sm">
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <h3 className="mt-4 font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

export function DataTableToolbar({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: ReactNode
}) {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
      <div>
        <h2 className="font-semibold text-slate-950">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </div>
  )
}

export function ActionPanel({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <aside className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-semibold text-slate-950">{title}</h3>
      {description ? <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p> : null}
      <div className="mt-4 grid gap-2">{children}</div>
    </aside>
  )
}

export function HeaderActionButton({
  href,
  children,
  variant = "default",
}: {
  href: string
  children: ReactNode
  variant?: "default" | "outline"
}) {
  return (
    <Button
      asChild
      variant={variant}
      className={variant === "default" ? "bg-slate-950 text-white hover:bg-slate-800" : undefined}
    >
      <Link href={href} prefetch={false}>
        {children}
      </Link>
    </Button>
  )
}
