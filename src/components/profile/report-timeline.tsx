import { CheckCircle2, Clock3, FileText, MessageSquareWarning, ShieldCheck } from "lucide-react"
import type { ComponentType } from "react"

import type { ReportTimelineEvent, TimelineEventType } from "@/lib/types"

const eventIcons: Record<TimelineEventType, ComponentType<{ className?: string }>> = {
  submitted: FileText,
  evidence_uploaded: FileText,
  moderation: Clock3,
  approved: CheckCircle2,
  published: ShieldCheck,
  disputed: MessageSquareWarning,
  response_received: MessageSquareWarning,
}

export function ReportTimeline({ events }: { events: ReportTimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-sm leading-6 text-slate-600">
        No public timeline events are published yet. Timeline entries appear only after moderation.
      </div>
    )
  }

  return (
    <ol className="relative space-y-4 before:absolute before:bottom-6 before:left-4 before:top-6 before:w-px before:bg-slate-200">
      {events.map((event) => {
        const Icon = eventIcons[event.type]
        const eventLabel = event.type.replaceAll("_", " ")

        return (
          <li key={event.id} className="relative grid grid-cols-[32px_1fr] gap-4">
            <span className="z-10 flex size-8 items-center justify-center rounded-md border border-amber-200 bg-amber-50 text-amber-800 shadow-sm">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">{event.title}</p>
                  <p className="mt-1 text-xs font-semibold uppercase text-slate-500">{eventLabel}</p>
                </div>
                <time className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600">
                  {new Intl.DateTimeFormat("en", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }).format(new Date(event.createdAt))}
                </time>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{event.description}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
