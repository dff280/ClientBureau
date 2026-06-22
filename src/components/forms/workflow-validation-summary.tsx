import { AlertTriangle } from "lucide-react"

type WorkflowValidationSummaryProps = {
  errors?: Record<string, string[]>
  title?: string
}

function humanizeFieldName(field: string) {
  return field
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function WorkflowValidationSummary({
  errors,
  title = "Fields needing attention",
}: WorkflowValidationSummaryProps) {
  const entries = Object.entries(errors ?? {}).filter(([, messages]) => messages.length > 0)

  if (entries.length === 0) return null

  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-950">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-xs leading-5">
            Fix these fields and submit again. Private identifiers, raw evidence, and admin notes are still kept out of public pages.
          </p>
        </div>
      </div>
      <ul className="mt-3 grid gap-2 text-sm md:grid-cols-2">
        {entries.map(([field, messages]) => (
          <li key={field} className="rounded-md border border-amber-200 bg-white/70 px-3 py-2">
            <span className="block font-semibold">{humanizeFieldName(field)}</span>
            <span className="mt-1 block text-xs leading-5">{messages[0]}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
