import type { Metadata } from "next"
import { Landmark, PhoneCall, ShieldCheck, UploadCloud } from "lucide-react"

import { AdminOpsExpansion } from "@/components/admin/admin-ops-expansion"
import {
  AdminPageHeader,
  DashboardSection,
  HeaderActionButton,
  StatCard,
} from "@/components/dashboard/dashboard-ui"
import { countOpenRecoveryCases } from "@/lib/platform-features"
import {
  getAdminModerationCrmDataService,
  getAdminWorkspaceDataService,
  getContractorRiskOpsDataService,
} from "@/lib/repositories/client-bureau-service"

export const metadata: Metadata = {
  title: "Admin Recovery Cases",
  description:
    "Client Bureau admin recovery workspace for Resolution Desk cases, Florida lien service review, fee status, and private evidence safeguards.",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function AdminRecoveryPage() {
  const [workspace, moderationCrm] = await Promise.all([
    getAdminWorkspaceDataService(),
    getAdminModerationCrmDataService(),
  ])
  const firstContractorUserId =
    workspace.contractors[0]?.userId ?? workspace.users.find((user) => user.role === "contractor")?.id
  const riskOps = firstContractorUserId
    ? await getContractorRiskOpsDataService(firstContractorUserId)
    : undefined
  const openRecoveryCases = riskOps
    ? countOpenRecoveryCases(riskOps.paymentRecoveryCases) +
      riskOps.managedRecoveryCases.filter((item) => !["resolved", "closed", "paused"].includes(item.status)).length
    : 0
  const lienCases =
    riskOps?.floridaLienCases.filter((item) => !["released", "closed"].includes(item.status)).length ?? 0
  const lienPackets = riskOps?.lienNoticeDrafts.filter((item) => item.requiredReview).length ?? 0
  const evidencePending =
    riskOps?.evidenceVault.filter((item) => ["review_pending", "needs_more_info"].includes(item.status)).length ?? 0

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <AdminPageHeader
          eyebrow="Private operations"
          title="Recovery Cases"
          description="Review managed payment recovery, Florida lien service cases, fee readiness, contractor authorization, vendor status, and private evidence without exposing sensitive records publicly."
          actions={
            <>
              <HeaderActionButton href="/admin/reports" variant="outline">
                <ShieldCheck aria-hidden="true" />
                Review reports
              </HeaderActionButton>
              <HeaderActionButton href="/admin/audit-log" variant="outline">
                <UploadCloud aria-hidden="true" />
                Audit log
              </HeaderActionButton>
            </>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Open recovery"
            value={openRecoveryCases}
            helper="Resolution Desk and private follow-up cases"
            icon={PhoneCall}
            tone={openRecoveryCases > 0 ? "amber" : "emerald"}
          />
          <StatCard
            label="Florida lien cases"
            value={lienCases}
            helper="Notice, filing, recording proof, and release workflows"
            icon={Landmark}
            tone={lienCases > 0 ? "rose" : "slate"}
          />
          <StatCard
            label="Lien packets"
            value={lienPackets}
            helper="Packets that require review before staff action"
            icon={ShieldCheck}
            tone={lienPackets > 0 ? "amber" : "slate"}
          />
          <StatCard
            label="Evidence review"
            value={evidencePending}
            helper="Private files needing review or more information"
            icon={UploadCloud}
            tone={evidencePending > 0 ? "blue" : "slate"}
          />
        </div>

        <DashboardSection
          eyebrow="How staff should use this page"
          title="Keep recovery private, factual, and documented."
          description="This workspace is for staff review, contractor authorization, fee status, evidence readiness, contact logs, and filing milestones. Public client profiles must not reveal recovery notes, lien drafts, raw evidence, or private contact details."
        >
          <div className="grid gap-3 text-sm leading-6 text-slate-600 md:grid-cols-3">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-950">1. Verify the case</p>
              <p className="mt-1">Check fee status, invoice age, documentation, and the contractor’s signed authorization before any managed service step.</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-950">2. Record factual activity</p>
              <p className="mt-1">Log contact attempts, client responses, vendor updates, and internal decision notes in the case history.</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-950">3. Protect private records</p>
              <p className="mt-1">Keep evidence, filing drafts, contact details, and staff notes out of all indexable public surfaces.</p>
            </div>
          </div>
        </DashboardSection>

        {moderationCrm ? (
          <AdminOpsExpansion moderationCrm={moderationCrm} riskOps={riskOps} focus="recovery" />
        ) : null}
      </div>
    </section>
  )
}
