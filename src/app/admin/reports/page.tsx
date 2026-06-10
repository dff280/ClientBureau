import type { Metadata } from "next"
import type { LucideIcon } from "lucide-react"
import { ClipboardCheck, FileText, History, MessageSquareText, ShieldCheck, UploadCloud } from "lucide-react"

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
        {moderationCrm ? <AdminModerationCrm data={moderationCrm} users={workspace.users} /> : null}
        <AdminReviewPanel items={reviews} />
      </div>
    </section>
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
