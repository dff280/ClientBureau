import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { RiskLevel } from "@/lib/types"

const riskStyles: Record<RiskLevel, string> = {
  Low: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Moderate: "border-sky-200 bg-sky-50 text-sky-800",
  Elevated: "border-amber-200 bg-amber-50 text-amber-900",
  High: "border-red-200 bg-red-50 text-red-800",
}

export function RiskBadge({ riskLevel, className }: { riskLevel: RiskLevel; className?: string }) {
  return (
    <Badge variant="outline" className={cn("rounded-md px-2 py-1", riskStyles[riskLevel], className)}>
      {riskLevel} Risk
    </Badge>
  )
}
