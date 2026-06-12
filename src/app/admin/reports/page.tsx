import type { Metadata } from "next"
import type { LucideIcon } from "lucide-react"
import { AlertTriangle, BadgeCheck, ClipboardCheck, FileText, History, MessageSquareText, ShieldCheck, UploadCloud } from "lucide-react"

import { AdminActionOutcomePanel } from "@/components/admin/admin-crm-ui"
import { AdminModerationCrm } from "@/components/admin/admin-moderation-crm"
import { AdminReviewPanel } from "@/components/admin/admin-review-panel"
import { AdminPageHeader, DashboardSection, HeaderActionButton, StatCard } from "@/components/dashboard/dashboard-ui"
import {
  getAdminModerationCrmDataService,
  getAdminWorkspaceDataService,
  getPendingAdminReviewsService,
} from "@/lib/repositories/client-bureau-service"

export const metadata: Metadata = {
  title: "Admin Report Queue",
  description:
    "Client Bureau admin report queue for approvals, rejections, bulk moderation, evidence review, and public profile publication.",
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = "force-dynamic"

export default async function AdminReportsPage() {
  const [reviews, workspace, moderationCrm] = await Promise.all([
    getPendingAdminReviewsService(),
    getAdminWorkspaceDataService(),
    getAdminModerationCrmDataService(),
  ])
  const pending = reviews.filter((item) => ["queued", "needs_dispute_review"].includes(item.review.status)).length
  const published = reviews.filter((item) => item.review.status === "approved").length
  const evidence = reviews.filter((item) => item.evidence.length > 0).length
  const discussions = workspace.discussions.filter((item) => item.status === "pending").length
  const disputeReviews = reviews.filter((item) => item.review.status === "needs_dispute_review").length
  const highValueReviews = reviews.filter((item) => (item.report?.amountUnpaid ?? 0) >= 5000).length
  const positiveReviews = reviews.filter((item) =>
    ["Positive experience", "Would work with again"].includes(item.report?.reportCategory ?? ""),
  ).length
  const needsMoreInfoReviews = reviews.filter((item) =>
    (item.review.notes ?? "").toLowerCase().includes("needs more information") ||
    (item.review.notes ?? "").toLowerCase().includes("needs-more-info"),
  ).length

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <AdminPageHeader
          eyebrow="Moderation"
          title="Review Reports"
          description="Approve documented public summaries, reject records that need policy action, and keep private evidence out of public pages."
          actions={
            <>
              <HeaderActionButton href="/admin/discussions" variant="outline">
                <MessageSquareText aria-hidden="true" />
                Discussion queue
              </HeaderActionButton>
              <HeaderActionButton href="/admin/audit-log" variant="outline">
                <History aria-hidden="true" />
                Audit log
              </HeaderActionButton>
            </>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Needs review" value={pending} helper="Queued reports and dispute reviews" icon={ClipboardCheck} tone={pending > 0 ? "amber" : "emerald"} />
          <StatCard label="Evidence attached" value={evidence} helper="Private files available for moderator review" icon={UploadCloud} tone="blue" />
          <StatCard label="Published" value={published} helper="Approved report review records" icon={ClipboardCheck} tone="emerald" />
          <StatCard label="Discussion queue" value={discussions} helper="Related community entries waiting" icon={MessageSquareText} tone={discussions > 0 ? "amber" : "slate"} href="/admin/discussions" />
        </div>
        <DashboardSection
          eyebrow="Queue lanes"
          title="Triage by decision risk before opening a record"
          description="Use these lanes to prioritize high-value payment issues, dispute context, positive reports, evidence-backed records, and hold notes."
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <QueueLane
              icon={AlertTriangle}
              label="High value"
              value={highValueReviews}
              detail="Reports with $5,000 or more listed as unpaid."
              tone={highValueReviews > 0 ? "amber" : "slate"}
            />
            <QueueLane
              icon={MessageSquareText}
              label="Dispute review"
              value={disputeReviews}
              detail="Reports with dispute or response context needing careful review."
              tone={disputeReviews > 0 ? "rose" : "slate"}
            />
            <QueueLane
              icon={BadgeCheck}
              label="Positive reports"
              value={positiveReviews}
              detail="Positive client experiences should publish without unpaid-dollar framing."
              tone={positiveReviews > 0 ? "emerald" : "slate"}
            />
            <QueueLane
              icon={UploadCloud}
              label="Evidence-backed"
              value={evidence}
              detail="Private evidence available for moderator confidence."
              tone={evidence > 0 ? "blue" : "slate"}
            />
            <QueueLane
              icon={FileText}
              label="Needs more info"
              value={needsMoreInfoReviews}
              detail="Records with hold or information-request notes."
              tone={needsMoreInfoReviews > 0 ? "amber" : "slate"}
            />
          </div>
        </DashboardSection>
        <DashboardSection
          eyebrow="Approval standard"
          title="Publish only what is safe, documented, and moderated"
          description="Use this checklist before every approve, reject, delete, or needs-more-information decision."
        >
          <div className="grid gap-3 md:grid-cols-3">
            <ReviewStandard
              icon={ShieldCheck}
              title="Public-safe identity"
              text="Confirm profile name, business, city, and state are accurate enough for public display. Keep phone, email, addresses, and private identifiers hidden."
            />
            <ReviewStandard
              icon={UploadCloud}
              title="Evidence reviewed privately"
              text="Evidence can support moderation, but raw files and storage paths must not appear in summaries, profile cards, directories, or public schema."
            />
            <ReviewStandard
              icon={FileText}
              title="Neutral public summary"
              text="Use contractor-submitted, reported experience, response-aware language. Avoid accusations, labels, or legal conclusions."
            />
          </div>
        </DashboardSection>
        <AdminActionOutcomePanel
          title="After an approve, reject, delete, or needs-more-information decision"
          description="Use this to confirm the moderation action worked and did not leave stale cards, unsafe public content, or missing audit context."
          items={[
            {
              detail: "Approved, rejected, or deleted cards should leave the active review queue immediately so staff do not review the same item twice.",
              label: "Queue state",
              status: "Updated",
              title: "The queue should change",
              tone: "emerald",
            },
            {
              detail: "Approved reports should refresh the public profile, sitemap surfaces, recent reports, and directory links without exposing raw evidence.",
              label: "Publication",
              status: "Public-safe",
              title: "Public output should stay clean",
              tone: "blue",
            },
            {
              detail: "Every decision needs a clear moderator note or system audit event that explains why the report was approved, rejected, held, or deleted.",
              label: "Audit",
              status: "Traceable",
              title: "The decision should be explainable",
              tone: "amber",
            },
          ]}
        />
        {moderationCrm ? <AdminModerationCrm data={moderationCrm} users={workspace.users} /> : null}
        <AdminReviewPanel items={reviews} />
      </div>
    </section>
  )
}

function QueueLane({
  detail,
  icon: Icon,
  label,
  tone,
  value,
}: {
  detail: string
  icon: LucideIcon
  label: string
  tone: "slate" | "amber" | "emerald" | "rose" | "blue"
  value: number
}) {
  const toneClass = {
    slate: "border-slate-200 bg-slate-50 text-slate-950",
    amber: "border-amber-200 bg-amber-50 text-amber-950",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-950",
    rose: "border-rose-200 bg-rose-50 text-rose-950",
    blue: "border-sky-200 bg-sky-50 text-sky-950",
  }[tone]

  return (
    <article className={`rounded-md border p-4 ${toneClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase opacity-70">{label}</p>
          <p className="mt-2 text-3xl font-semibold">{value}</p>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white/70">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 opacity-75">{detail}</p>
    </article>
  )
}

function ReviewStandard({
  icon: Icon,
  text,
  title,
}: {
  icon: LucideIcon
  text: string
  title: string
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <span className="flex size-10 items-center justify-center rounded-md bg-slate-950 text-amber-300">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  )
}
