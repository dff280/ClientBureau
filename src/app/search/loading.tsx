import { SearchCheck } from "lucide-react"

export default function SearchLoading() {
  return (
    <div className="bg-slate-100">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(245,158,11,0.22),transparent_34%),linear-gradient(135deg,#020617_0%,#0f172a_52%,#111827_100%)]" />
        <div className="bureau-container relative py-10">
          <div className="inline-flex items-center gap-2 rounded-md border border-amber-300/35 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-200">
            <SearchCheck className="size-4" aria-hidden="true" />
            Checking records
          </div>
          <div className="mt-5 h-12 max-w-2xl animate-pulse rounded-md bg-white/15" />
          <div className="mt-4 h-5 max-w-3xl animate-pulse rounded-md bg-white/10" />
        </div>
      </section>
      <section className="bureau-container grid gap-4 py-8">
        <div className="h-64 animate-pulse rounded-md border border-slate-200 bg-white shadow-sm" />
        <div className="h-40 animate-pulse rounded-md border border-slate-200 bg-white shadow-sm" />
        <div className="h-40 animate-pulse rounded-md border border-slate-200 bg-white shadow-sm" />
      </section>
    </div>
  )
}
