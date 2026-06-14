import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getTradeCategory,
  otherTradeLabel,
  tradeCategoryGroups,
  tradeOptionsForProfileType,
} from "@/lib/trade-taxonomy"
import type { ProfileType } from "@/lib/types"
import { cn } from "@/lib/utils"

export function TradeCategorySelect({
  className,
  defaultValue,
  id,
  includeOtherDetail = true,
  label = "Trade or service category",
  name,
  otherName,
  profileType,
  required,
}: {
  className?: string
  defaultValue?: string | null
  id: string
  includeOtherDetail?: boolean
  label?: string
  name: string
  otherName?: string
  profileType?: ProfileType
  required?: boolean
}) {
  const options = tradeOptionsForProfileType(profileType)
  const defaultCategory = getTradeCategory(defaultValue)
  const defaultCanonical = defaultCategory?.label ?? defaultValue ?? ""
  const showLegacyValue = Boolean(defaultValue && !defaultCategory)

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        name={name}
        required={required}
        defaultValue={defaultCanonical}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-slate-700 outline-none transition focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <option value="">{required ? "Select trade or service" : "Select if applicable"}</option>
        {showLegacyValue ? (
          <optgroup label="Current value">
            <option value={defaultValue ?? ""}>{defaultValue}</option>
          </optgroup>
        ) : null}
        {tradeCategoryGroups.map((group) => {
          const groupOptions = options.filter((category) => category.group === group)
          if (groupOptions.length === 0) return null

          return (
            <optgroup key={group} label={group}>
              {groupOptions.map((category) => (
                <option key={category.slug} value={category.label}>
                  {category.label}
                </option>
              ))}
            </optgroup>
          )
        })}
      </select>
      {includeOtherDetail && otherName ? (
        <Input
          name={otherName}
          aria-label={`${label} details when not listed`}
          placeholder={`If ${otherTradeLabel}, describe the specialty`}
          className="bg-white"
          maxLength={80}
        />
      ) : null}
    </div>
  )
}
