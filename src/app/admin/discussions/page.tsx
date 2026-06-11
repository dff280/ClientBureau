import type { Metadata } from "next"
import { AlertTriangle, ClipboardCheck, FileText, MessageSquareText, ShieldCheck, UserCheck } from "lucide-react"

import { AdminActionOutcomePanel } from "@/components/admin/admin-crm-ui"
import { DiscussionModerationPanel } from "@/components/admin/discussion-moderation-panel"
import { AdminPageHeader, DashboardSection, HeaderActionButton, StatCard } from "@/components/dashboard/dashboard-ui"
import { getAdminWorkspaceDataService } from "@/lib/repositories/client-bureau-service"

export const metadata: Metadata = {
  title: "Admin Discussions",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function AdminDiscussionsPage() {
  const data = await getAdminWorkspaceDataService()
  const pending = data.discussions.filter((item) => item.status === "pending").length
  const approved = data.discussions.filter((item) => item.status === "approved").length
  const rejected = data.discussions.filter((item) => item.status === "rejected").length
  const verified = data.discussions.filter((item) => item.isVerified).length
  const attachments = data.discussions.filter((item) => item.attachmentUrl).length
  const stalePending = data.discussions.filter((item) => item.status === "pending" && isOlderThanDays(item.createdAt, 3)).length

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <AdminPageHeader
          eyebrow="Moderation"
          title="Review Discussions"
          description="Approve public-safe discussion entries, verify context, reject unsafe content, and keep pending or rejected submissions private."
          actions={
            <>
              <HeaderActionButton href="/admin/reports" variant="outline">
                <ClipboardCheck aria-hidden="true" />
                Review reports
              </HeaderActionButton>
              <HeaderActionButton href="/client-response" variant="outline">
                <ShieldCheck aria-hidden="true" />
                Response workflow
              </HeaderActionButton>
            </>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Pending" value={pending} helper="Waiting for moderation" icon={MessageSquareText} tone={pending > 0 ? "amber" : "emerald"} />
          <StatCard label="Approved" value={approved} helper="Visible after moderation" icon={ShieldCheck} tone="emerald" />
          <StatCard label="Verified" value={verified} helper="Entries with verification context" icon={UserCheck} tone="blue" />
          <StatCard label="Rejected hidden" value={rejected} helper="Not shown publicly" icon={ShieldCheck} tone="slate" />
        </div>
        <DashboardSection
          eyebrow="Queue health"
          title="Moderate response context without leaking private content"
          description="Start with older pending entries and submissions with attachments. Public pages should only show approved, neutral, response-aware discussion context."
        >
          <div className="grid gap-3 md:grid-cols-3">
            <QueueHealthTile
              icon={AlertTriangle}
              label="Stale pending"
              value={stalePending}
              text="Pending more than 3 days and still hidden from public profiles."
              tone={stalePending > 0 ? "amber" : "emerald"}
            />
            <QueueHealthTile
              icon={FileText}
              label="Attachments"
              value={attachments}
              text="Private links or files that need review before any public summary is approved."
              tone={attachments > 0 ? "blue" : "slate"}
            />
            <QueueHealthTile
              icon={ShieldCheck}
              label="Public safety"
              value="Approved only"
              text="Rejected, pending, raw evidence, emails, phones, and internal notes stay private."
              tone="emerald"
            />
          </div>
        </DashboardSection>
        <AdminActionOutcomePanel
          title="After moderating a discussion entry"
          description="Discussion decisions should protect response rights, avoid public accusations, and keep pending or rejected content private."
          items={[
            {
              detail: "Approved entries should show only moderated text, relationship context, verification labels, and public-safe profile/report links.",
              label: "Public display",
              status: "Safe",
              title: "Approved comments should be neutral",
              tone: "emerald",
            },
            {
              detail: "Rejected or disputed entries should stay out of public profiles, directories, schema, and search-facing surfaces.",
              label: "Privacy",
              status: "Hidden",
              title: "Rejected content should not leak",
              tone: "blue",
            },
            {
              detail: "The moderator decision should make clear whether the entry was verified, edited, rejected, or held for more context.",
              label: "Audit",
              status: "Logged",
              title: "The reason should be understandable",
              tone: "amber",
            },
          ]}
        />
        <DiscussionModerationPanel discussions={data.discussions} clients={data.clients} reports={data.reports} />
      </div>
    </section>
  )
}

function isOlderThanDays(value: string, days: number) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  return Date.now() - date.getTime() > days * 86_400_000
}

function QueueHealthTile({
  icon: Icon,
  label,
  text,
  tone = "slate",
  value,
}: {
  icon: typeof AlertTriangle
  label: string
  text: string
  tone?: "slate" | "amber" | "emerald" | "blue"
  value: number | string
}) {
  const toneClass = {
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    blue: "border-sky-200 bg-sky-50 text-sky-900",
  }[tone]

  return (
    <div className={`rounded-md border p-4 ${toneClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase opacity-70">{label}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white/80 text-slate-950 shadow-sm">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 opacity-80">{text}</p>
    </div>
  )
}
