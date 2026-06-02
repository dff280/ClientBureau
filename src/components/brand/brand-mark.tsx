import Link from "next/link"
import { ShieldCheck } from "lucide-react"

import { cn } from "@/lib/utils"

export function BrandMark({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="Client Bureau home" className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex size-9 items-center justify-center rounded-md border border-amber-300/30 bg-slate-950 text-amber-300 shadow-sm">
        <ShieldCheck className="size-5" aria-hidden="true" />
      </span>
      <span className="leading-none">
        <span className="block text-sm font-semibold tracking-normal text-slate-950">
          Client Bureau
        </span>
        <span className="sr-only"> - </span>
        <span className="hidden text-[11px] font-medium uppercase tracking-normal text-slate-500 sm:block">
          Contractor Intelligence
        </span>
      </span>
    </Link>
  )
}
