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
    return <p className="text-sm leading-6 text-slate-600">No report timeline is published yet.</p>
  }

  return (
    <ol className="space-y-3">
      {events.map((event) => {
        const Icon = eventIcons[event.type]

        return (
          <li key={event.id} className="grid grid-cols-[32px_1fr] gap-3">
            <span className="flex size-8 items-center justify-center rounded-md border border-amber-200 bg-amber-50 text-amber-800">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="rounded-md border border-slate-200 bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-950">{event.title}</p>
                <time className="text-xs font-medium text-slate-500">
                  {new Intl.DateTimeFormat("en", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }).format(new Date(event.createdAt))}
                </time>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-600">{event.description}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
