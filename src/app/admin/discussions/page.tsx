import type { Metadata } from "next"
import { ClipboardCheck, MessageSquareText, ShieldCheck, UserCheck } from "lucide-react"

import { DiscussionModerationPanel } from "@/components/admin/discussion-moderation-panel"
import { AdminPageHeader, HeaderActionButton, StatCard } from "@/components/dashboard/dashboard-ui"
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
  const verified = data.discussions.filter((item) => item.isVerified).length

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
          <StatCard label="Total entries" value={data.discussions.length} helper="All discussion records" icon={MessageSquareText} tone="slate" />
        </div>
        <DiscussionModerationPanel discussions={data.discussions} clients={data.clients} reports={data.reports} />
      </div>
    </section>
  )
}
