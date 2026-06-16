import { Search } from "lucide-react"

import { FloridaPlaceDatalist } from "@/components/forms/florida-place-datalist"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usStates } from "@/lib/locations"
import { reportCategories, riskLevels, type ReportCategory, type RiskLevel } from "@/lib/types"

interface ClientSearchFormProps {
  query?: string
  state?: string
  riskLevel?: RiskLevel
  category?: ReportCategory
}

export function ClientSearchForm({ query, state, riskLevel, category }: ClientSearchFormProps) {
  return (
    <form action="/search" className="grid gap-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm lg:grid-cols-[1fr_120px_160px_190px_auto]">
      <FloridaPlaceDatalist id="client-search-florida-place-options" />
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          name="q"
          defaultValue={query}
          placeholder="Name, city, phone, email"
          list="client-search-florida-place-options"
          className="h-11 pl-9"
        />
      </div>
      <select
        name="state"
        defaultValue={state ?? ""}
        aria-label="Filter by state"
        className="h-11 rounded-md border border-input bg-background px-3 text-sm text-slate-700 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <option value="">All states</option>
        {usStates.map((item) => (
          <option key={item.code} value={item.code}>
            {item.code}
          </option>
        ))}
      </select>
      <select
        name="risk"
        defaultValue={riskLevel ?? ""}
        className="h-11 rounded-md border border-input bg-background px-3 text-sm text-slate-700 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <option value="">All risk levels</option>
        {riskLevels.map((level) => (
          <option key={level} value={level}>
            {level}
          </option>
        ))}
      </select>
      <select
        name="category"
        defaultValue={category ?? ""}
        className="h-11 rounded-md border border-input bg-background px-3 text-sm text-slate-700 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <option value="">All categories</option>
        {reportCategories.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <Button className="h-11 bg-slate-950 text-white hover:bg-slate-800" type="submit">
        Search
      </Button>
    </form>
  )
}
