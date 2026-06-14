import { Label } from "@/components/ui/label"
import { floridaCounties, isFloridaCounty } from "@/lib/florida-counties"
import { cn } from "@/lib/utils"

export function FloridaCountySelect({
  className,
  defaultValue,
  id,
  label = "Florida county",
  labelClassName,
  name,
  required = true,
}: {
  className?: string
  defaultValue?: string | null
  id: string
  label?: string
  labelClassName?: string
  name: string
  required?: boolean
}) {
  const value = defaultValue?.trim() ?? ""
  const showLegacyValue = Boolean(value && !isFloridaCounty(value))

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className={labelClassName}>{label}</Label>
      <select
        id={id}
        name={name}
        required={required}
        defaultValue={value}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-slate-700 outline-none transition focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <option value="">{required ? "Select Florida county" : "Select county if applicable"}</option>
        {showLegacyValue ? (
          <optgroup label="Current value">
            <option value={value}>{value}</option>
          </optgroup>
        ) : null}
        {floridaCounties.map((county) => (
          <option key={county} value={county}>
            {county}
          </option>
        ))}
      </select>
    </div>
  )
}
