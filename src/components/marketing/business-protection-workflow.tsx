import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  businessProtectionPromise,
  protectionGuardrails,
  protectionWorkflowSteps,
} from "@/lib/product-positioning"
import { cn } from "@/lib/utils"

type BusinessProtectionWorkflowProps = {
  variant?: "light" | "dark"
  compact?: boolean
  showGuardrails?: boolean
  showCta?: boolean
  ctaHref?: string
  ctaLabel?: string
}

export function BusinessProtectionWorkflow({
  variant = "light",
  compact = false,
  showGuardrails = true,
  showCta = true,
  ctaHref = "/signup",
  ctaLabel = "Create account",
}: BusinessProtectionWorkflowProps) {
  const dark = variant === "dark"

  return (
    <section
      className={cn(
        "rounded-md border shadow-sm",
        dark ? "border-white/10 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-950",
        compact ? "p-4" : "p-6",
      )}
    >
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <p className={cn("text-xs font-semibold uppercase", dark ? "text-amber-300" : "text-amber-700")}>
            Business protection workflow
          </p>
          <h2 className={cn("mt-2 font-semibold tracking-normal", compact ? "text-2xl" : "text-3xl")}>
            {businessProtectionPromise}
          </h2>
          <p className={cn("mt-3 text-sm leading-6", dark ? "text-slate-300" : "text-slate-600")}>
            Client Bureau gives contractors and service businesses one operating path for client
            screening, contracts, project records, payment follow-up, and moderated resolution.
          </p>
        </div>
        {showCta ? (
          <Button asChild variant={dark ? "outline" : "default"} className={dark ? "border-white/20 bg-white/10 text-white hover:bg-white/15" : "bg-slate-950 text-white hover:bg-slate-800"}>
            <Link href={ctaHref}>
              {ctaLabel}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        ) : null}
      </div>

      <div className={cn("mt-6 grid gap-3", compact ? "lg:grid-cols-5" : "md:grid-cols-2 xl:grid-cols-5")}>
        {protectionWorkflowSteps.map((step, index) => {
          const Icon = step.icon

          return (
            <div
              key={step.id}
              className={cn(
                "rounded-md border p-4",
                dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={cn("text-xs font-semibold uppercase", dark ? "text-amber-200" : "text-slate-500")}>
                    {String(index + 1).padStart(2, "0")} / {step.phase}
                  </p>
                  <h3 className="mt-2 font-semibold">{step.title}</h3>
                </div>
                <Icon className={cn("size-5 shrink-0", dark ? "text-amber-300" : "text-amber-700")} aria-hidden="true" />
              </div>
              <p className={cn("mt-3 text-sm leading-6", dark ? "text-slate-300" : "text-slate-600")}>
                {step.text}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {step.tools.map((tool) => (
                  <Badge
                    key={tool}
                    variant="outline"
                    className={cn("rounded-md", dark ? "border-white/10 bg-white/5 text-slate-200" : "bg-white")}
                  >
                    {tool}
                  </Badge>
                ))}
              </div>
              {!compact ? (
                <Link
                  href={step.href}
                  className={cn(
                    "mt-4 inline-flex text-sm font-semibold",
                    dark ? "text-amber-200 hover:text-amber-100" : "text-amber-700 hover:text-amber-800",
                  )}
                >
                  {step.cta}
                  <ArrowRight className="ml-1 size-4" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
          )
        })}
      </div>

      {showGuardrails ? (
        <div className={cn("mt-4 grid gap-3", compact ? "lg:grid-cols-3" : "md:grid-cols-3")}>
          {protectionGuardrails.map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.title}
                className={cn(
                  "rounded-md border p-4",
                  dark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-white",
                )}
              >
                <Icon className={cn("size-5", dark ? "text-amber-300" : "text-amber-700")} aria-hidden="true" />
                <p className="mt-3 font-semibold">{item.title}</p>
                <p className={cn("mt-2 text-sm leading-6", dark ? "text-slate-300" : "text-slate-600")}>
                  {item.text}
                </p>
              </div>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}
