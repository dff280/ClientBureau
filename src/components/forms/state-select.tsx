import { usStates } from "@/lib/locations"
import { cn } from "@/lib/utils"

interface StateSelectProps {
  id: string
  name: string
  defaultValue?: string
  className?: string
  required?: boolean
  ariaLabel?: string
}

export function StateSelect({
  id,
  name,
  defaultValue,
  className,
  required = true,
  ariaLabel,
}: StateSelectProps) {
  return (
    <select
      id={id}
      name={name}
      defaultValue={defaultValue?.toUpperCase() ?? ""}
      required={required}
      aria-label={ariaLabel}
      className={cn(
        "h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-slate-700 outline-none transition focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <option value="" disabled>
        Select state
      </option>
      {usStates.map((state) => (
        <option key={state.code} value={state.code}>
          {state.code} - {state.name}
        </option>
      ))}
    </select>
  )
}
