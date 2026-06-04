import type { Metadata } from "next"
import { ClipboardCheck, History, MessageSquareText, UploadCloud } from "lucide-react"

import { AdminModerationCrm } from "@/components/admin/admin-moderation-crm"
import { AdminReviewPanel } from "@/components/admin/admin-review-panel"
import { AdminPageHeader, HeaderActionButton, StatCard } from "@/components/dashboard/dashboard-ui"
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
        {moderationCrm ? <AdminModerationCrm data={moderationCrm} users={workspace.users} /> : null}
        <AdminReviewPanel items={reviews} />
      </div>
    </section>
  )
}
