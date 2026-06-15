import Link from "next/link"
import Image from "next/image"
import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  BriefcaseBusiness,
  CheckCircle2,
  CircleCheck,
  ClipboardCheck,
  HelpCircle,
  Inbox,
  Search,
  ShieldCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type PremiumCta = {
  href: string
  label: string
  icon?: LucideIcon
}

export function PremiumHero({
  eyebrow,
  title,
  description,
  primary,
  secondary,
  aside,
}: {
  eyebrow: string
  title: string
  description: string
  primary?: PremiumCta
  secondary?: PremiumCta
  aside?: ReactNode
}) {
  return (
    <section className="premium-hero-surface relative isolate overflow-hidden border-b border-slate-900 bg-slate-950 text-white">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(251,191,36,0.14),transparent_30%,rgba(15,23,42,0.65)_66%,rgba(2,6,23,1))]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-28 bg-[linear-gradient(180deg,transparent,#020617)]" />
      <div className="bureau-container grid gap-6 py-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-end lg:py-16">
        <div className="space-y-4 sm:space-y-5">
          <div className="inline-flex items-center gap-2 rounded-md border border-amber-300/35 bg-white/[0.07] px-3 py-2 text-sm font-semibold text-amber-200 shadow-lg shadow-slate-950/20 backdrop-blur">
            <ShieldCheck className="size-4" aria-hidden="true" />
            {eyebrow}
          </div>
          <h1 className="max-w-5xl text-3xl font-semibold leading-[1.05] tracking-normal text-balance sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">{description}</p>
          {(primary || secondary) ? (
            <div className="grid gap-3 sm:flex sm:flex-wrap">
              {primary ? <PremiumButton cta={primary} /> : null}
              {secondary ? <PremiumButton cta={secondary} variant="outline" /> : null}
            </div>
          ) : null}
        </div>
        {aside ? (
          <div className="premium-card-glow rounded-md border border-white/10 bg-white/[0.065] p-3 shadow-2xl shadow-slate-950/35 backdrop-blur sm:p-4">
            {aside}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export function PremiumButton({
  cta,
  variant = "primary",
}: {
  cta: PremiumCta
  variant?: "primary" | "outline"
}) {
  const Icon = cta.icon ?? ArrowRight

  return (
    <Button
      asChild
      variant={variant === "primary" ? "default" : "outline"}
      className={
        variant === "primary"
          ? "bureau-hover-lift min-h-11 w-full justify-center bg-amber-500 text-slate-950 shadow-lg shadow-amber-950/20 hover:bg-amber-400 sm:w-auto"
          : "bureau-hover-lift min-h-11 w-full justify-center border-white/20 bg-white/10 text-white hover:bg-white/15 sm:w-auto"
      }
    >
      <Link href={cta.href}>
        {cta.label}
        <Icon aria-hidden="true" />
      </Link>
    </Button>
  )
}

export function PremiumSectionHeader({
  eyebrow,
  title,
  description,
  dark = false,
}: {
  eyebrow: string
  title: string
  description: string
  dark?: boolean
}) {
  return (
    <div className="max-w-3xl space-y-3">
      <p className={dark ? "text-sm font-semibold uppercase tracking-[0.16em] text-amber-300" : "text-sm font-semibold uppercase tracking-[0.16em] text-amber-700"}>
        {eyebrow}
      </p>
      <h2 className={dark ? "text-2xl font-semibold tracking-normal text-balance text-white sm:text-4xl" : "text-2xl font-semibold tracking-normal text-balance text-slate-950 sm:text-4xl"}>
        {title}
      </h2>
      <p className={dark ? "text-sm leading-6 text-slate-300 sm:text-base sm:leading-7" : "text-sm leading-6 text-slate-600 sm:text-base sm:leading-7"}>
        {description}
      </p>
    </div>
  )
}

export function PremiumFeatureCard({
  icon: Icon,
  title,
  text,
  children,
  dark = false,
}: {
  icon: LucideIcon
  title: string
  text: string
  children?: ReactNode
  dark?: boolean
}) {
  return (
    <div className={dark ? "premium-card-glow rounded-md border border-white/10 bg-white/[0.06] p-4 sm:p-5" : "bureau-hover-lift rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:p-5"}>
      <span className={dark ? "flex size-11 items-center justify-center rounded-md bg-amber-300 text-slate-950" : "flex size-11 items-center justify-center rounded-md bg-slate-950 text-white"}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h3 className={dark ? "mt-4 text-xl font-semibold text-white" : "mt-4 text-xl font-semibold text-slate-950"}>
        {title}
      </h3>
      <p className={dark ? "mt-2 text-sm leading-6 text-slate-300" : "mt-2 text-sm leading-6 text-slate-600"}>
        {text}
      </p>
      {children}
    </div>
  )
}

export function PageProofStrip(props: Parameters<typeof PremiumProofStrip>[0]) {
  return <PremiumProofStrip {...props} />
}

export function PremiumProofStrip({
  items,
  dark = false,
}: {
  items: Array<{ label: string; value: string; text?: string }>
  dark?: boolean
}) {
  return (
    <div className={dark ? "border-y border-white/10 bg-slate-950 text-white" : "border-y border-slate-200 bg-white"}>
      <div className="bureau-container py-3 sm:py-4">
        <div className={dark ? "grid gap-2 rounded-md border border-white/10 bg-white/[0.04] p-2 sm:grid-cols-2 lg:grid-cols-4" : "grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-2 sm:grid-cols-2 lg:grid-cols-4"}>
        {items.map((item) => (
          <div key={item.label} className={dark ? "rounded-md border border-white/10 bg-slate-950/35 p-3" : "rounded-md border border-slate-200 bg-white p-3"}>
            <div className="flex items-baseline justify-between gap-3">
              <p className={dark ? "text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-400" : "text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-500"}>
                {item.label}
              </p>
              <p className={dark ? "text-lg font-semibold text-white" : "text-lg font-semibold text-slate-950"}>
                {item.value}
              </p>
            </div>
            {item.text ? (
              <p className={dark ? "mt-1 text-xs leading-5 text-slate-300" : "mt-1 text-xs leading-5 text-slate-600"}>
                {item.text}
              </p>
            ) : null}
          </div>
        ))}
        </div>
      </div>
    </div>
  )
}

export function PremiumChecklist({
  items,
  dark = false,
}: {
  items: string[]
  dark?: boolean
}) {
  return (
    <ul className="grid gap-3">
      {items.map((item) => (
        <li key={item} className={dark ? "flex gap-3 text-sm leading-6 text-slate-300" : "flex gap-3 text-sm leading-6 text-slate-600"}>
          <CheckCircle2 className="mt-1 size-4 shrink-0 text-amber-500" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function PremiumCtaBand({
  eyebrow,
  title,
  description,
  primary,
  secondary,
}: {
  eyebrow: string
  title: string
  description: string
  primary: PremiumCta
  secondary?: PremiumCta
}) {
  return (
    <section className="premium-hero-surface relative isolate overflow-hidden bg-slate-950 py-10 text-white sm:py-14 lg:py-16">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(251,191,36,0.13),transparent_32%,rgba(15,23,42,0.9))]" />
      <div className="bureau-container grid gap-6 lg:grid-cols-[1fr_0.58fr] lg:items-center">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">{eyebrow}</p>
          <h2 className="text-3xl font-semibold tracking-normal text-balance sm:text-4xl">{title}</h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-300">{description}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <PremiumButton cta={primary} />
          {secondary ? <PremiumButton cta={secondary} variant="outline" /> : null}
        </div>
      </div>
    </section>
  )
}

export function BureauPanel({
  children,
  className,
  dark = false,
}: {
  children: ReactNode
  className?: string
  dark?: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-md border p-4 shadow-sm sm:p-5",
        dark
          ? "premium-card-glow border-white/10 bg-white/[0.06] text-white"
          : "bureau-hover-lift border-slate-200 bg-white text-slate-950",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function BureauMetricCard({
  label,
  value,
  text,
  icon: Icon,
  dark = false,
}: {
  label: string
  value: ReactNode
  text?: string
  icon?: LucideIcon
  dark?: boolean
}) {
  return (
    <BureauPanel dark={dark}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={dark ? "text-xs font-semibold uppercase tracking-[0.14em] text-slate-400" : "text-xs font-semibold uppercase tracking-[0.14em] text-slate-500"}>
            {label}
          </p>
          <p className={dark ? "mt-3 text-2xl font-semibold text-white sm:text-3xl" : "mt-3 text-2xl font-semibold text-slate-950 sm:text-3xl"}>
            {value}
          </p>
        </div>
        {Icon ? (
          <span className={dark ? "flex size-10 shrink-0 items-center justify-center rounded-md bg-amber-300 text-slate-950" : "flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-950 text-white"}>
            <Icon className="size-5" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      {text ? <p className={dark ? "mt-3 text-sm leading-6 text-slate-300" : "mt-3 text-sm leading-6 text-slate-600"}>{text}</p> : null}
    </BureauPanel>
  )
}

export function TrustScorePanel({
  score,
  label = "Client Bureau Rating",
  caption,
  facts,
}: {
  score: number
  label?: string
  caption?: string
  facts?: Array<{ label: string; value: string }>
}) {
  const clampedScore = Math.max(0, Math.min(100, score))

  return (
    <BureauPanel className="overflow-hidden p-0">
      <div className="bg-slate-950 p-4 text-white sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">{label}</p>
        <div className="mt-4 flex items-end justify-between gap-4">
          <p className="text-5xl font-semibold leading-none sm:text-6xl">{clampedScore}</p>
          <p className="pb-2 text-sm font-semibold uppercase text-slate-300">/100</p>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-amber-400" style={{ width: `${clampedScore}%` }} />
        </div>
        {caption ? <p className="mt-4 text-sm leading-6 text-slate-300">{caption}</p> : null}
      </div>
      {facts?.length ? (
        <div className="grid gap-0 divide-y divide-slate-100">
          {facts.map((fact) => (
            <div key={fact.label} className="flex items-center justify-between gap-4 px-4 py-3 text-sm sm:px-5">
              <span className="text-slate-500">{fact.label}</span>
              <span className="text-right font-semibold text-slate-950">{fact.value}</span>
            </div>
          ))}
        </div>
      ) : null}
    </BureauPanel>
  )
}

export function ProductMockupFrame({
  imageSrc,
  imageAlt,
  eyebrow,
  title,
  description,
  points = [],
  dark = false,
}: {
  imageSrc?: string
  imageAlt?: string
  eyebrow: string
  title: string
  description: string
  points?: string[]
  dark?: boolean
}) {
  return (
    <BureauPanel dark={dark} className="overflow-hidden p-0">
      {imageSrc ? (
        <div className="relative aspect-[16/10] overflow-hidden border-b border-slate-200 bg-slate-950">
          <Image
            src={imageSrc}
            alt={imageAlt ?? title}
            fill
            sizes="(min-width: 1024px) 420px, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="space-y-4 p-4 sm:p-5">
        <div>
          <p className={dark ? "text-xs font-semibold uppercase tracking-[0.14em] text-amber-300" : "text-xs font-semibold uppercase tracking-[0.14em] text-amber-700"}>
            {eyebrow}
          </p>
          <h3 className={dark ? "mt-2 text-xl font-semibold text-white sm:text-2xl" : "mt-2 text-xl font-semibold text-slate-950 sm:text-2xl"}>
            {title}
          </h3>
          <p className={dark ? "mt-2 text-sm leading-6 text-slate-300" : "mt-2 text-sm leading-6 text-slate-600"}>
            {description}
          </p>
        </div>
        {points.length ? (
          <div className="grid gap-2">
            {points.map((point) => (
              <div key={point} className={dark ? "flex gap-2 text-sm text-slate-300" : "flex gap-2 text-sm text-slate-600"}>
                <CircleCheck className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden="true" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </BureauPanel>
  )
}

export function WorkflowTimeline({
  items,
  dark = false,
}: {
  items: Array<{
    phase?: string
    icon?: LucideIcon
    title: string
    text: string
    href?: string
    cta?: string
  }>
  dark?: boolean
}) {
  return (
    <div className={dark ? "overflow-hidden rounded-md border border-white/10 bg-white/[0.06]" : "overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm"}>
      {items.map((item, index) => {
        const Icon = item.icon ?? ShieldCheck
        const phase = item.phase ?? String(index + 1).padStart(2, "0")

        return (
          <div
            key={`${phase}-${item.title}`}
            className={cn(
              "grid gap-4 border-b p-4 last:border-b-0 sm:p-5 lg:grid-cols-[86px_54px_1fr_auto] lg:items-center",
              dark ? "border-white/10" : "border-slate-200",
            )}
          >
            <span className={dark ? "text-xl font-semibold text-white sm:text-2xl" : "text-xl font-semibold text-slate-950 sm:text-2xl"}>{phase}</span>
            <span className={dark ? "flex size-10 items-center justify-center rounded-md bg-amber-300 text-slate-950 sm:size-12" : "flex size-10 items-center justify-center rounded-md bg-slate-950 text-white sm:size-12"}>
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className={dark ? "text-lg font-semibold text-white sm:text-xl" : "text-lg font-semibold text-slate-950 sm:text-xl"}>{item.title}</h3>
              <p className={dark ? "mt-2 max-w-3xl text-sm leading-6 text-slate-300" : "mt-2 max-w-3xl text-sm leading-6 text-slate-600"}>{item.text}</p>
            </div>
            {item.href && item.cta ? (
              <Button asChild variant="outline" className={dark ? "w-full justify-center border-white/20 bg-white/10 text-white hover:bg-white/15 sm:w-auto lg:justify-self-end" : "w-full justify-center sm:w-auto lg:justify-self-end"}>
                <Link href={item.href}>
                  {item.cta}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export function PremiumEmptyState({
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
    <div className="grid place-items-center rounded-md border border-dashed border-slate-300 bg-white px-4 py-8 text-center shadow-sm sm:px-6 sm:py-10">
      <div className="flex size-12 items-center justify-center rounded-md bg-slate-950 text-amber-300">
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-950 sm:text-xl">{title}</h3>
      <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function GuidedActionPanel({
  eyebrow,
  title,
  description,
  primary,
  secondary,
  items,
}: {
  eyebrow: string
  title: string
  description: string
  primary: PremiumCta
  secondary?: PremiumCta
  items?: string[]
}) {
  return (
    <BureauPanel className="bg-slate-950 text-white">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">{eyebrow}</p>
      <h3 className="mt-3 text-xl font-semibold text-white sm:text-2xl">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
      {items?.length ? <PremiumChecklist items={items} dark /> : null}
      <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap">
        <PremiumButton cta={primary} />
        {secondary ? <PremiumButton cta={secondary} variant="outline" /> : null}
      </div>
    </BureauPanel>
  )
}

const publicJourneyItems: Array<{
  href: string
  label: string
  title: string
  text: string
  icon: LucideIcon
}> = [
  {
    href: "/search",
    label: "Check a Client",
    title: "Search before the job",
    text: "Check public context and private-match options before labor, materials, deposits, or scheduling.",
    icon: Search,
  },
  {
    href: "/contractor-contract-template",
    label: "Protect a Job",
    title: "Set terms and document",
    text: "Use agreement packets, change orders, evidence records, recovery, and Florida lien-service workflows.",
    icon: BriefcaseBusiness,
  },
  {
    href: "/profiles",
    label: "Browse Records",
    title: "Review public profiles",
    text: "Browse approved client, contractor, subcontractor, trade, city, and recent-report pages.",
    icon: BookOpenCheck,
  },
  {
    href: "/resources",
    label: "Get Help",
    title: "Understand the rules",
    text: "Find policies, rating methodology, response paths, contract guidance, and service workflow explainers.",
    icon: HelpCircle,
  },
]

export function PublicJourneyNav({
  eyebrow = "Choose your path",
  title = "Four simple ways to use Client Bureau.",
  description = "Every public page should make the next step obvious. Start with the path that matches what you need right now.",
  active,
  dark = false,
}: {
  eyebrow?: string
  title?: string
  description?: string
  active?: "check" | "protect" | "browse" | "help"
  dark?: boolean
}) {
  const activeMap = {
    check: "/search",
    protect: "/contractor-contract-template",
    browse: "/profiles",
    help: "/resources",
  } satisfies Record<NonNullable<typeof active>, string>
  const activeHref = active ? activeMap[active] : undefined

  return (
    <section className={dark ? "bg-slate-950 py-8 text-white sm:py-10" : "bg-white py-8 sm:py-10"}>
      <div className="bureau-container">
        <div className={dark ? "grid gap-5 rounded-md border border-white/10 bg-white/[0.04] p-4 sm:p-5 lg:grid-cols-[0.62fr_1.38fr] lg:items-start" : "grid gap-5 rounded-md border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-5 lg:grid-cols-[0.62fr_1.38fr] lg:items-start"}>
          <div className="max-w-xl">
            <p className={dark ? "text-xs font-semibold uppercase tracking-[0.16em] text-amber-300" : "text-xs font-semibold uppercase tracking-[0.16em] text-amber-700"}>
              {eyebrow}
            </p>
            <h2 className={dark ? "mt-2 text-2xl font-semibold tracking-normal text-balance text-white sm:text-3xl" : "mt-2 text-2xl font-semibold tracking-normal text-balance text-slate-950 sm:text-3xl"}>
              {title}
            </h2>
            <p className={dark ? "mt-2 text-sm leading-6 text-slate-300" : "mt-2 text-sm leading-6 text-slate-600"}>
              {description}
            </p>
          </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {publicJourneyItems.map((item) => {
            const Icon = item.icon
            const isActive = item.href === activeHref

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group rounded-md border p-3 transition hover:-translate-y-0.5 sm:p-4",
                  dark
                    ? "border-white/10 bg-white/[0.06] text-white hover:border-amber-300/50 hover:bg-white/[0.09]"
                    : "border-slate-200 bg-slate-50 text-slate-950 hover:border-amber-300 hover:bg-white",
                  isActive
                    ? dark
                      ? "border-amber-300/60 bg-amber-300/10"
                      : "border-amber-300 bg-amber-50"
                    : "",
                )}
              >
                <div className="flex items-start gap-3">
                  <span className={dark ? "flex size-10 shrink-0 items-center justify-center rounded-md bg-amber-300 text-slate-950" : "flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-950 text-amber-300"}>
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className={dark ? "text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-amber-300" : "text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-amber-700"}>
                      {item.label}
                    </p>
                    <h3 className={dark ? "mt-1 text-base font-semibold text-white sm:text-lg" : "mt-1 text-base font-semibold text-slate-950 sm:text-lg"}>
                      {item.title}
                    </h3>
                    <p className={dark ? "mt-1 text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6" : "mt-1 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6"}>
                      {item.text}
                    </p>
                  </div>
                  <ArrowRight className={dark ? "ml-auto size-4 shrink-0 text-slate-500 transition group-hover:text-amber-300" : "ml-auto size-4 shrink-0 text-slate-400 transition group-hover:text-amber-700"} aria-hidden="true" />
                </div>
              </Link>
            )
          })}
        </div>
        </div>
      </div>
    </section>
  )
}

export function NextBestStepCard({
  eyebrow = "Next best step",
  title,
  description,
  primary,
  secondary,
  points = [],
}: {
  eyebrow?: string
  title: string
  description: string
  primary: PremiumCta
  secondary?: PremiumCta
  points?: string[]
}) {
  return (
    <BureauPanel className="overflow-hidden p-0">
      <div className="grid gap-0 lg:grid-cols-[1fr_0.42fr]">
        <div className="p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">{eyebrow}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-normal text-balance text-slate-950 sm:text-3xl">{title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
          {points.length ? (
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {points.map((point) => (
                <div key={point} className="flex gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                  <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-700" aria-hidden="true" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className="grid content-center gap-3 border-t border-slate-200 bg-slate-950 p-5 sm:p-6 lg:border-l lg:border-t-0">
          <PremiumButton cta={primary} />
          {secondary ? <PremiumButton cta={secondary} variant="outline" /> : null}
        </div>
      </div>
    </BureauPanel>
  )
}

export function TrustGuardrailStrip({
  items = [
    "Moderated public summaries",
    "Private identifiers hidden",
    "Evidence reviewed privately",
    "Response and correction paths",
  ],
  dark = false,
}: {
  items?: string[]
  dark?: boolean
}) {
  return (
    <div className={dark ? "border-y border-white/10 bg-slate-950 text-white" : "border-y border-slate-200 bg-white"}>
      <div className="bureau-container py-3">
        <div className={dark ? "flex flex-wrap gap-2 rounded-md border border-white/10 bg-white/[0.035] p-2" : "flex flex-wrap gap-2 rounded-md border border-slate-200 bg-slate-50 p-2"}>
        {items.map((item) => (
          <div key={item} className={dark ? "flex flex-1 basis-full items-center gap-2 rounded-md border border-white/10 bg-slate-950/35 px-3 py-2 text-xs font-semibold text-slate-200 sm:basis-[calc(50%_-_0.25rem)] lg:basis-0" : "flex flex-1 basis-full items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 sm:basis-[calc(50%_-_0.25rem)] lg:basis-0"}>
            <ShieldCheck className="size-4 shrink-0 text-amber-500" aria-hidden="true" />
            <span>{item}</span>
          </div>
        ))}
        </div>
      </div>
    </div>
  )
}

export function ComparisonProofBlock({
  eyebrow = "Why it works",
  title,
  description,
  rows,
}: {
  eyebrow?: string
  title: string
  description: string
  rows: Array<{ label: string; before: string; after: string }>
}) {
  return (
    <BureauPanel className="overflow-hidden p-0">
      <div className="grid gap-0 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="bg-slate-950 p-5 text-white sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">{eyebrow}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-normal text-balance sm:text-3xl">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
        </div>
        <div className="divide-y divide-slate-100">
          {rows.map((row) => (
            <div key={row.label} className="grid gap-3 p-4 text-sm sm:grid-cols-[0.65fr_1fr_1fr] sm:p-5">
              <p className="font-semibold text-slate-950">{row.label}</p>
              <p className="rounded-md border border-slate-200 bg-slate-50 p-3 leading-6 text-slate-600">{row.before}</p>
              <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 leading-6 text-emerald-900">{row.after}</p>
            </div>
          ))}
        </div>
      </div>
    </BureauPanel>
  )
}

export function PublicPageChecklist({
  title = "What stays clear",
  items,
}: {
  title?: string
  items: string[]
}) {
  return (
    <BureauPanel>
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-950 text-amber-300">
          <ClipboardCheck className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <div key={item} className="flex gap-2 text-sm leading-6 text-slate-600">
                <BadgeCheck className="mt-1 size-4 shrink-0 text-emerald-700" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BureauPanel>
  )
}
