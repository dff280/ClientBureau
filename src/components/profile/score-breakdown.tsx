import Link from "next/link"
import { TrendingDown, TrendingUp } from "lucide-react"

import { Progress } from "@/components/ui/progress"
import type { ScoreFactor } from "@/lib/types"
import { cn } from "@/lib/utils"

export function ScoreBreakdown({ score, factors }: { score: number; factors: ScoreFactor[] }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="font-semibold text-slate-950">Rating confidence</span>
          <span className="font-medium text-slate-500">{score}/100</span>
        </div>
        <Progress value={score} className="h-2" />
        <Link href="/score-methodology" className="inline-flex text-xs font-semibold text-amber-700 hover:text-amber-800">
          How ratings are interpreted
        </Link>
      </div>
      <div className="grid gap-3">
        {factors.map((factor) => (
          <div key={factor.label} className="rounded-md border border-slate-200 bg-white p-3">
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 flex size-7 items-center justify-center rounded-md",
                  factor.tone === "positive"
                    ? "bg-emerald-50 text-emerald-700"
                    : factor.tone === "negative"
                      ? "bg-red-50 text-red-700"
                      : "bg-slate-100 text-slate-600",
                )}
              >
                {factor.impact < 0 ? (
                  <TrendingDown className="size-4" aria-hidden="true" />
                ) : (
                  <TrendingUp className="size-4" aria-hidden="true" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{factor.label}</p>
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      factor.impact < 0 ? "text-red-700" : "text-emerald-700",
                    )}
                  >
                    {factor.impact > 0 ? "+" : ""}
                    {factor.impact}
                  </p>
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-600">{factor.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
