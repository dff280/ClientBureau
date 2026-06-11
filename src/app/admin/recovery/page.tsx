import type { Metadata } from "next"
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  FileCheck2,
  Landmark,
  PhoneCall,
  Receipt,
  ShieldCheck,
  UploadCloud,
  UserCheck,
} from "lucide-react"

import { AdminActionOutcomePanel } from "@/components/admin/admin-crm-ui"
import { AdminOpsExpansion } from "@/components/admin/admin-ops-expansion"
import {
  AdminPageHeader,
  DashboardSection,
  HeaderActionButton,
  StatCard,
  StatusBadge,
} from "@/components/dashboard/dashboard-ui"
import { countOpenRecoveryCases } from "@/lib/platform-features"
import {
  getAdminModerationCrmDataService,
  getAdminWorkspaceDataService,
  getContractorRiskOpsDataService,
} from "@/lib/repositories/client-bureau-service"
import type { FloridaLienCase, ManagedRecoveryCase } from "@/lib/types"

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
  const recoveryCases = riskOps?.managedRecoveryCases ?? []
  const floridaLienCases = riskOps?.floridaLienCases ?? []
  const serviceFeeOrders = riskOps?.serviceFeeOrders ?? []
  const readinessSummaries = riskOps?.serviceReadiness ?? []
  const caseAssignments = riskOps?.caseStaffAssignments ?? []
  const caseAuditEvents = riskOps?.caseAuditEvents ?? []
  const documentLinks = riskOps?.caseDocumentLinks ?? []
  const lienFilingRecords = riskOps?.lienFilingRecords ?? []
  const recoveryCommunications = riskOps?.recoveryCommunications ?? []
  const feeDueCount =
    recoveryCases.filter((item) => !item.feePaidAt).length +
    floridaLienCases.filter((item) => !item.feePaidAt).length
  const needsMoreInfoCount =
    recoveryCases.filter((item) => item.status === "needs_more_info").length +
    floridaLienCases.filter((item) => item.status === "needs_more_info").length
  const contactInProgressCount = recoveryCases.filter((item) =>
    ["contact_in_progress", "client_responded", "payment_plan_offered"].includes(item.status),
  ).length
  const authorizationRequiredCount = floridaLienCases.filter((item) =>
    item.status === "contractor_signature_required" || !item.contractorSignedAt,
  ).length
  const vendorReviewCount = floridaLienCases.filter((item) =>
    item.status === "attorney_vendor_review" || ["queued", "in_review"].includes(item.attorneyVendorStatus),
  ).length
  const readyForSendOrFileCount = floridaLienCases.filter((item) =>
    ["approved_to_send", "approved_to_file"].includes(item.status),
  ).length
  const recordingProofCount = floridaLienCases.filter((item) => {
    const filing = lienFilingRecords.find((record) => record.floridaLienCaseId === item.id)
    return item.status === "filed" && !filing?.recordingConfirmedAt
  }).length
  const releaseNeededCount = floridaLienCases.filter((item) => item.status === "release_pending").length
  const openAssignments = caseAssignments.filter((item) => item.status !== "closed").length
  const latestCaseEvents = caseAuditEvents.slice(0, 4)
  const priorityRecoveryCases = [...recoveryCases]
    .sort((a, b) => priorityRank(b.priority) - priorityRank(a.priority))
    .slice(0, 4)
  const priorityLienCases = [...floridaLienCases]
    .sort((a, b) => priorityRank(lienPriority(b)) - priorityRank(lienPriority(a)))
    .slice(0, 4)

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
          eyebrow="Daily service queue"
          title="What needs staff action today"
          description="A quick operations board for managed payment recovery and Florida lien service work. These are private service records, not public profile content."
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <ServiceLaneCard
              icon={Receipt}
              title="Fee or checkout gate"
              value={feeDueCount}
              detail="Cases that still need the Client Bureau service fee or pass-through cost state confirmed."
              tone={feeDueCount > 0 ? "amber" : "emerald"}
            />
            <ServiceLaneCard
              icon={PhoneCall}
              title="Resolution Desk"
              value={contactInProgressCount}
              detail="Recovery cases with contact, response, or payment-plan activity in progress."
              tone={contactInProgressCount > 0 ? "blue" : "slate"}
            />
            <ServiceLaneCard
              icon={UserCheck}
              title="Authorization needed"
              value={authorizationRequiredCount}
              detail="Florida lien cases that still need contractor signature or filing authorization."
              tone={authorizationRequiredCount > 0 ? "rose" : "emerald"}
            />
            <ServiceLaneCard
              icon={Landmark}
              title="Vendor / recording"
              value={vendorReviewCount + readyForSendOrFileCount + recordingProofCount + releaseNeededCount}
              detail="Attorney/vendor review, approved send/file steps, recording proof, or release work."
              tone={vendorReviewCount + readyForSendOrFileCount + recordingProofCount + releaseNeededCount > 0 ? "amber" : "slate"}
            />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <ServiceLaneCard
              icon={AlertTriangle}
              title="Needs more info"
              value={needsMoreInfoCount}
              detail="Cases waiting on clearer documents, contractor answers, or staff follow-up."
              tone={needsMoreInfoCount > 0 ? "rose" : "slate"}
              compact
            />
            <ServiceLaneCard
              icon={FileCheck2}
              title="Evidence linked"
              value={documentLinks.length}
              detail="Private documents mapped to recovery or lien service records."
              tone={documentLinks.length > 0 ? "blue" : "slate"}
              compact
            />
            <ServiceLaneCard
              icon={CalendarClock}
              title="Open assignments"
              value={openAssignments}
              detail="Staff assignments still open or in review across service cases."
              tone={openAssignments > 0 ? "amber" : "emerald"}
              compact
            />
          </div>
        </DashboardSection>

        <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
          <DashboardSection
            eyebrow="Resolution Desk"
            title="Managed recovery readiness"
            description="Staff should confirm fee status, evidence readiness, client-contact activity, and contractor-direct payment handling before closing a recovery case."
          >
            <div className="grid gap-3">
              {priorityRecoveryCases.map((item) => {
                const readiness = readinessSummaries.find(
                  (summary) => summary.entityType === "managed_recovery" && summary.entityId === item.id,
                )
                const feeOrder = serviceFeeOrders.find((order) => order.entityId === item.id)
                const communications = recoveryCommunications.filter((communication) => communication.managedRecoveryCaseId === item.id)

                return (
                  <RecoveryCaseCard
                    key={item.id}
                    caseItem={item}
                    readinessScore={readiness?.score}
                    readinessStatus={readiness?.status}
                    feeStatus={item.feePaidAt ? "paid" : feeOrder?.status ?? "fee due"}
                    communicationCount={communications.length}
                  />
                )
              })}
              {priorityRecoveryCases.length === 0 ? (
                <ServiceEmptyState
                  title="No managed recovery cases loaded"
                  description="Resolution Desk cases will appear here after contractors submit recovery requests."
                />
              ) : null}
            </div>
          </DashboardSection>

          <DashboardSection
            eyebrow="Florida lien service"
            title="Notice and filing readiness"
            description="Lien service work should show deadline context, authorization, fee state, attorney/vendor review, recording proof, and release needs."
          >
            <div className="grid gap-3">
              {priorityLienCases.map((item) => {
                const readiness = readinessSummaries.find(
                  (summary) => summary.entityType === "florida_lien" && summary.entityId === item.id,
                )
                const feeOrder = serviceFeeOrders.find((order) => order.entityId === item.id)
                const filing = lienFilingRecords.find((record) => record.floridaLienCaseId === item.id)

                return (
                  <LienCaseCard
                    key={item.id}
                    caseItem={item}
                    readinessScore={readiness?.score}
                    readinessStatus={readiness?.status}
                    feeStatus={item.feePaidAt ? "paid" : feeOrder?.status ?? "fee due"}
                    filingStatus={filing?.status}
                  />
                )
              })}
              {priorityLienCases.length === 0 ? (
                <ServiceEmptyState
                  title="No Florida lien service cases loaded"
                  description="Notice and filing cases will appear here after contractors start Florida lien service."
                />
              ) : null}
            </div>
          </DashboardSection>
        </div>

        {latestCaseEvents.length > 0 ? (
          <DashboardSection
            eyebrow="Recent private service activity"
            title="Case audit trail"
            description="Staff notes, vendor steps, fee changes, and filing/release activity should remain private and auditable."
          >
            <div className="grid gap-3 md:grid-cols-2">
              {latestCaseEvents.map((event) => (
                <div key={event.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge tone={event.entityType === "service_fee" ? "amber" : "blue"}>
                      {event.entityType.replaceAll("_", " ")}
                    </StatusBadge>
                    <StatusBadge tone="slate">{event.action.replaceAll("_", " ")}</StatusBadge>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-950">{event.actorName}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{event.summary}</p>
                  <p className="mt-2 text-xs text-slate-500">{formatServiceDate(event.createdAt)}</p>
                </div>
              ))}
            </div>
          </DashboardSection>
        ) : null}

        <DashboardSection
          eyebrow="How staff should use this page"
          title="Keep recovery private, factual, and documented."
          description="This workspace is for staff review, contractor authorization, fee status, evidence readiness, contact logs, and filing milestones. Public client profiles must not reveal recovery notes, lien drafts, raw evidence, or private contact details."
        >
          <div className="grid gap-3 text-sm leading-6 text-slate-600 md:grid-cols-3">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-950">1. Verify the case</p>
              <p className="mt-1">Check fee status, invoice age, documentation, and signed contractor authorization before any managed service step.</p>
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
        <AdminActionOutcomePanel
          title="After updating a recovery or lien service case"
          description="Managed service changes should move the case forward while preserving authorization, deadline, fee, and evidence safeguards."
          items={[
            {
              detail: "The case should show the current stage: fee due, under review, needs more information, contact in progress, approved to send/file, recorded, released, or closed.",
              label: "Case state",
              status: "Current",
              title: "The next action should be obvious",
              tone: "blue",
            },
            {
              detail: "Contractor authorization, Florida county, deadline risk, pass-through costs, vendor/attorney status, and recording proof should be visible to staff.",
              label: "Service gates",
              status: "Checked",
              title: "Required gates should be clear",
              tone: "amber",
            },
            {
              detail: "Recovery notes, lien drafts, contact details, filing records, and raw evidence must stay private and never appear on public client profile pages.",
              label: "Privacy",
              status: "Sealed",
              title: "Private case records should not publish",
              tone: "emerald",
            },
          ]}
        />

        {moderationCrm ? (
          <AdminOpsExpansion moderationCrm={moderationCrm} riskOps={riskOps} focus="recovery" />
        ) : null}
      </div>
    </section>
  )
}

function ServiceLaneCard({
  icon: Icon,
  title,
  value,
  detail,
  tone,
  compact = false,
}: {
  icon: typeof Receipt
  title: string
  value: number
  detail: string
  tone: "slate" | "amber" | "emerald" | "rose" | "blue"
  compact?: boolean
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
          <p className="text-xs font-semibold uppercase opacity-70">{title}</p>
          <p className={compact ? "mt-2 text-2xl font-semibold" : "mt-2 text-3xl font-semibold"}>{value}</p>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white/70">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 opacity-75">{detail}</p>
    </article>
  )
}

function RecoveryCaseCard({
  caseItem,
  readinessScore,
  readinessStatus,
  feeStatus,
  communicationCount,
}: {
  caseItem: ManagedRecoveryCase
  readinessScore?: number
  readinessStatus?: string
  feeStatus: string
  communicationCount: number
}) {
  return (
    <article className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={statusTone(caseItem.status)}>{caseItem.status.replaceAll("_", " ")}</StatusBadge>
            <StatusBadge tone={priorityTone(caseItem.priority)}>{caseItem.priority}</StatusBadge>
          </div>
          <h3 className="mt-3 font-semibold text-slate-950">{caseItem.clientName}</h3>
          <p className="mt-1 text-sm text-slate-600">
            {money(caseItem.amountDue)} due / {caseItem.invoiceAgeDays} days / {caseItem.city}, {caseItem.state}
          </p>
        </div>
        <StatusBadge tone={feeStatus === "paid" ? "emerald" : "amber"}>{feeStatus.replaceAll("_", " ")}</StatusBadge>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{caseItem.nextAction}</p>
      <div className="mt-4 grid gap-2 text-xs sm:grid-cols-3">
        <MiniFact label="Readiness" value={readinessScore === undefined ? "Not checked" : `${readinessScore}%`} tone={readinessTone(readinessStatus)} />
        <MiniFact label="Contact logs" value={communicationCount} tone={communicationCount > 0 ? "blue" : "slate"} />
        <MiniFact label="Payment" value={caseItem.contractorDirectPayment ? "Contractor-direct" : "Review"} tone="slate" />
      </div>
    </article>
  )
}

function LienCaseCard({
  caseItem,
  readinessScore,
  readinessStatus,
  feeStatus,
  filingStatus,
}: {
  caseItem: FloridaLienCase
  readinessScore?: number
  readinessStatus?: string
  feeStatus: string
  filingStatus?: string
}) {
  return (
    <article className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={statusTone(caseItem.status)}>{caseItem.status.replaceAll("_", " ")}</StatusBadge>
            <StatusBadge tone="blue">{caseItem.workflowType.replaceAll("_", " ")}</StatusBadge>
          </div>
          <h3 className="mt-3 font-semibold text-slate-950">{caseItem.clientName}</h3>
          <p className="mt-1 text-sm text-slate-600">
            {caseItem.propertyCounty} County / {money(caseItem.amountDue)} due / last work {formatServiceDate(caseItem.lastWorkDate)}
          </p>
        </div>
        <StatusBadge tone={feeStatus === "paid" ? "emerald" : "amber"}>{feeStatus.replaceAll("_", " ")}</StatusBadge>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{caseItem.nextAction}</p>
      <div className="mt-4 grid gap-2 text-xs sm:grid-cols-3">
        <MiniFact label="Readiness" value={readinessScore === undefined ? "Not checked" : `${readinessScore}%`} tone={readinessTone(readinessStatus)} />
        <MiniFact label="Signature" value={caseItem.contractorSignedAt ? "Received" : "Required"} tone={caseItem.contractorSignedAt ? "emerald" : "amber"} />
        <MiniFact label="Filing" value={filingStatus?.replaceAll("_", " ") ?? caseItem.attorneyVendorStatus.replaceAll("_", " ")} tone={filingStatus ? "blue" : "slate"} />
      </div>
      <div className="mt-3 rounded-md border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-600">
        <span className="font-semibold text-slate-900">Deadline:</span> {caseItem.filingDeadline ?? "Needs staff review"}
      </div>
    </article>
  )
}

function MiniFact({
  label,
  value,
  tone,
}: {
  label: string
  value: string | number
  tone: "slate" | "amber" | "emerald" | "rose" | "blue"
}) {
  const toneClass = {
    slate: "border-slate-200 bg-white text-slate-700",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    rose: "border-rose-200 bg-rose-50 text-rose-900",
    blue: "border-sky-200 bg-sky-50 text-sky-900",
  }[tone]

  return (
    <div className={`rounded-md border p-3 ${toneClass}`}>
      <p className="font-semibold uppercase opacity-70">{label}</p>
      <p className="mt-1 font-semibold capitalize">{value}</p>
    </div>
  )
}

function ServiceEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <div className="mx-auto flex size-11 items-center justify-center rounded-md bg-slate-950 text-amber-300">
        <CheckCircle2 className="size-5" aria-hidden="true" />
      </div>
      <h3 className="mt-4 font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  )
}

function money(value: number) {
  return `$${value.toLocaleString()}`
}

function formatServiceDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function priorityRank(priority: "low" | "normal" | "high" | "urgent") {
  return { low: 0, normal: 1, high: 2, urgent: 3 }[priority]
}

function lienPriority(caseItem: FloridaLienCase): "low" | "normal" | "high" | "urgent" {
  if (["blocked", "needs_more_info", "contractor_signature_required"].includes(caseItem.status)) return "urgent"
  if (["attorney_vendor_review", "approved_to_file", "filed", "release_pending"].includes(caseItem.status)) return "high"
  if (["document_review", "approved_to_send", "notice_sent"].includes(caseItem.status)) return "normal"
  return "low"
}

function priorityTone(priority: "low" | "normal" | "high" | "urgent"): "slate" | "amber" | "emerald" | "rose" | "blue" {
  if (priority === "urgent") return "rose"
  if (priority === "high") return "amber"
  if (priority === "normal") return "blue"
  return "slate"
}

function statusTone(status: string): "slate" | "amber" | "emerald" | "rose" | "blue" {
  if (["resolved", "closed", "released", "recording_confirmed", "filed", "notice_sent"].includes(status)) return "emerald"
  if (["needs_more_info", "blocked", "contractor_signature_required", "fee_due"].includes(status)) return "rose"
  if (["under_review", "document_review", "contact_in_progress", "attorney_vendor_review", "approved_to_file", "approved_to_send", "release_pending"].includes(status)) return "amber"
  if (["client_responded", "payment_plan_offered", "submitted", "approved_to_send"].includes(status)) return "blue"
  return "slate"
}

function readinessTone(status?: string): "slate" | "amber" | "emerald" | "rose" | "blue" {
  if (!status) return "slate"
  if (status === "ready") return "emerald"
  if (status === "blocked") return "rose"
  if (status === "needs_more_info") return "amber"
  return "blue"
}
