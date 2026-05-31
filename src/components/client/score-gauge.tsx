import { cn } from "@/lib/utils"

export function ScoreGauge({
  score,
  label = "Client Bureau Score",
  className,
}: {
  score: number
  label?: string
  className?: string
}) {
  const width = `${Math.max(0, Math.min(100, score))}%`

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
          <p className="text-4xl font-semibold text-slate-950">{score}</p>
        </div>
        <span className="text-sm font-medium text-slate-500">out of 100</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-amber-500" style={{ width }} />
      </div>
    </div>
  )
}
