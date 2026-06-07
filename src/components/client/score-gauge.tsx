import { cn } from "@/lib/utils"

const widthClasses: Record<number, string> = {
  0: "w-0",
  5: "w-[5%]",
  10: "w-[10%]",
  15: "w-[15%]",
  20: "w-[20%]",
  25: "w-1/4",
  30: "w-[30%]",
  35: "w-[35%]",
  40: "w-[40%]",
  45: "w-[45%]",
  50: "w-1/2",
  55: "w-[55%]",
  60: "w-[60%]",
  65: "w-[65%]",
  70: "w-[70%]",
  75: "w-3/4",
  80: "w-4/5",
  85: "w-[85%]",
  90: "w-[90%]",
  95: "w-[95%]",
  100: "w-full",
}

export function ScoreGauge({
  score,
  label = "Client Bureau Rating",
  className,
}: {
  score: number
  label?: string
  className?: string
}) {
  const bucket = Math.max(0, Math.min(100, Math.round(score / 5) * 5))

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
        <div className={cn("h-full rounded-full bg-amber-500", widthClasses[bucket])} />
      </div>
    </div>
  )
}
