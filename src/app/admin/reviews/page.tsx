import type { Metadata } from "next"

import { AdminReviewPanel } from "@/components/admin/admin-review-panel"
import { requireRole } from "@/lib/auth"
import { getPendingAdminReviewsService } from "@/lib/repositories/client-bureau-service"

export const metadata: Metadata = {
  title: "Admin Review Panel",
  description:
    "Client Bureau admin review panel for pending reports, evidence review, public summaries, approvals, rejections, and disputes.",
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = "force-dynamic"

export default async function AdminReviewsPage() {
  const admin = await requireRole("admin")
  const reviews = await getPendingAdminReviewsService()

  return (
    <section className="bureau-section bg-slate-100">
      <div className="bureau-container space-y-8">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase text-amber-700">Admin review</p>
          <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
            Pending reports and disputes.
          </h1>
          <p className="max-w-3xl leading-7 text-slate-600">
            Signed in as {admin.fullName}. This panel demonstrates role-based admin review,
            public summary edits, evidence visibility, and profile publishing decisions through
            the active Client Bureau data adapter.
          </p>
        </div>
        <AdminReviewPanel items={reviews} />
      </div>
    </section>
  )
}
