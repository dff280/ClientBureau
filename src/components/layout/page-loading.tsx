import { ShieldCheck } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"

export function PremiumRouteLoading({
  eyebrow = "Client Bureau",
  title = "Loading workspace",
}: {
  eyebrow?: string
  title?: string
}) {
  return (
    <section className="bureau-paper min-h-screen">
      <div className="premium-hero-surface border-b border-slate-900 bg-slate-950 text-white">
        <div className="bureau-container py-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-md border border-amber-300/30 bg-white/[0.07] px-3 py-2 text-sm font-semibold text-amber-200">
              <ShieldCheck className="size-4" aria-hidden="true" />
              {eyebrow}
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-normal text-white">{title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Preparing the latest moderated records, private workspace context, and next actions.
            </p>
          </div>
        </div>
      </div>
      <div className="bureau-container grid gap-5 py-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4 rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="grid gap-3 md:grid-cols-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-44" />
        </div>
        <div className="space-y-4 rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-32" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </section>
  )
}
