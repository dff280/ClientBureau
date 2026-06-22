import type { Metadata } from "next"
import {
  AlertTriangle,
  CalendarClock,
  ClipboardCheck,
  FileCheck2,
  History,
  Link2,
  LockKeyhole,
  Receipt,
  Send,
  ShieldCheck,
  Signature,
  UserCheck,
  type LucideIcon,
} from "lucide-react"

import { AdminActionOutcomePanel } from "@/components/admin/admin-crm-ui"
import { AdminOpsExpansion } from "@/components/admin/admin-ops-expansion"
import {
  AdminPageHeader,
  DashboardSection,
  EmptyState,
  HeaderActionButton,
  StatCard,
  StatusBadge,
} from "@/components/dashboard/dashboard-ui"
import {
  getAdminModerationCrmDataService,
  getAdminWorkspaceDataService,
  getContractorRiskOpsDataService,
} from "@/lib/repositories/client-bureau-service"
import { contractTemplateLegalWarnings } from "@/lib/contract-templates"
import type { ContractPacket } from "@/lib/types"

export const metadata: Metadata = {
  title: "Admin Contracts",
  description:
    "Client Bureau admin contract workspace for private agreement packets, signing links, signature status, payment terms, and audit history.",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function AdminContractsPage() {
  const [workspace, moderationCrm] = await Promise.all([
    getAdminWorkspaceDataService(),
    getAdminModerationCrmDataService(),
  ])
  const firstContractorUserId =
    workspace.contractors[0]?.userId ?? workspace.users.find((user) => user.role === "contractor")?.id
  const riskOps = firstContractorUserId
    ? await getContractorRiskOpsDataService(firstContractorUserId)
    : undefined
  const packets = riskOps?.contractPackets ?? []
  const activePackets = packets.filter((packet) => packet.status !== "archived").length
  const sentPackets = packets.filter((packet) =>
    ["sent", "viewed", "client_joined"].includes(packet.shareStatus ?? ""),
  ).length
  const signedPackets = packets.filter(
    (packet) =>
      packet.status === "signed" ||
      packet.signatureStatus === "fully_signed" ||
      packet.shareStatus === "signed" ||
      packet.shareStatus === "completed",
  ).length
  const paymentTermsPending = packets.filter(
    (packet) =>
      packet.shareStatus === "payment_pending" ||
      (packet.paymentMode !== undefined && packet.paymentMode !== "none" && packet.status === "sent"),
  ).length
  const draftOrReviewCount = packets.filter((packet) =>
    ["draft", "review_ready"].includes(packet.status),
  ).length
  const inviteNeededCount = packets.filter((packet) =>
    packet.clientInviteStatus === "not_invited" || packet.signatureStatus === "not_sent",
  ).length
  const signatureInProgressCount = packets.filter((packet) =>
    ["sent", "viewed", "client_joined"].includes(packet.shareStatus ?? "") ||
    ["awaiting_client", "client_signed", "contractor_signed"].includes(packet.signatureStatus ?? ""),
  ).length
  const auditGapCount = packets.filter((packet) =>
    isPacketSigned(packet) && (!packet.signedDigest || !packet.signedRecordAt || !packet.signedSnapshot),
  ).length
  const staleDraftCount = packets.filter((packet) =>
    ["draft", "review_ready"].includes(packet.status) && daysSince(packet.updatedAt) >= 10,
  ).length
  const privateLinkCount = packets.filter((packet) => packet.shareToken || packet.shareUrl).length
  const milestonePacketCount = packets.filter((packet) => packet.paymentMode === "milestone_schedule").length
  const packetsNeedingAttention = [...packets]
    .filter((packet) =>
      packet.status === "review_ready" ||
      packet.status === "draft" ||
      packet.shareStatus === "payment_pending" ||
      ["awaiting_client", "client_signed", "contractor_signed"].includes(packet.signatureStatus ?? "") ||
      (isPacketSigned(packet) && (!packet.signedDigest || !packet.signedRecordAt)),
    )
    .sort((a, b) => contractPriority(b) - contractPriority(a))
    .slice(0, 5)

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <AdminPageHeader
          eyebrow="Private operations"
          title="Contracts"
          description="Oversee private agreement packets, signing links, signature state, payment terms, client invite status, and audit history. Contract content stays private and noindexed."
          actions={
            <>
              <HeaderActionButton href="/dashboard/contracts" variant="outline">
                <Signature aria-hidden="true" />
                Contractor view
              </HeaderActionButton>
              <HeaderActionButton href="/admin/audit-log" variant="outline">
                <History aria-hidden="true" />
                Audit log
              </HeaderActionButton>
            </>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Active packets"
            value={activePackets}
            helper="Agreement packets not archived"
            icon={Signature}
            tone={activePackets > 0 ? "blue" : "slate"}
          />
          <StatCard
            label="Sent or viewed"
            value={sentPackets}
            helper="Private links sent to clients"
            icon={ClipboardCheck}
            tone={sentPackets > 0 ? "amber" : "slate"}
          />
          <StatCard
            label="Signed"
            value={signedPackets}
            helper="Packets with completed signature records"
            icon={ShieldCheck}
            tone={signedPackets > 0 ? "emerald" : "slate"}
          />
          <StatCard
            label="Payment terms pending"
            value={paymentTermsPending}
            helper="Packets waiting on payment-term confirmation"
            icon={History}
            tone={paymentTermsPending > 0 ? "amber" : "slate"}
          />
        </div>

        <DashboardSection
          eyebrow="Daily contract desk"
          title="What needs staff attention today"
          description="A compact operations board for private agreement packets. Staff can see readiness, invite state, signing progress, payment-term context, and audit gaps without exposing contract content publicly."
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <ContractLaneCard
              icon={FileCheck2}
              title="Draft or review"
              value={draftOrReviewCount}
              detail="Packets that still need scope, terms, or staff review before sending."
              tone={draftOrReviewCount > 0 ? "amber" : "slate"}
            />
            <ContractLaneCard
              icon={Send}
              title="Invite needed"
              value={inviteNeededCount}
              detail="Packets without a client invite or signature request in motion."
              tone={inviteNeededCount > 0 ? "blue" : "slate"}
            />
            <ContractLaneCard
              icon={Signature}
              title="Signing in progress"
              value={signatureInProgressCount}
              detail="Sent, viewed, joined, or partially signed packets waiting on completion."
              tone={signatureInProgressCount > 0 ? "amber" : "emerald"}
            />
            <ContractLaneCard
              icon={AlertTriangle}
              title="Audit gaps"
              value={auditGapCount}
              detail="Signed packets missing digest, snapshot, or recorded signature metadata."
              tone={auditGapCount > 0 ? "rose" : "emerald"}
            />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <ContractLaneCard
              icon={Receipt}
              title="Payment terms"
              value={paymentTermsPending}
              detail="Packets waiting on deposit, milestone, or payment-term confirmation."
              tone={paymentTermsPending > 0 ? "amber" : "slate"}
              compact
            />
            <ContractLaneCard
              icon={Link2}
              title="Private links"
              value={privateLinkCount}
              detail="Tokenized contract links that must remain noindexed and account-bound."
              tone={privateLinkCount > 0 ? "blue" : "slate"}
              compact
            />
            <ContractLaneCard
              icon={CalendarClock}
              title="Stale drafts"
              value={staleDraftCount}
              detail="Draft or review-ready packets with no update in ten or more days."
              tone={staleDraftCount > 0 ? "amber" : "emerald"}
              compact
            />
          </div>
        </DashboardSection>

        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <DashboardSection
            eyebrow="Packet queue"
            title="Agreement packets needing review"
            description="Prioritize packets with review-ready scope, payment-term gates, active signing, or missing signature audit records."
          >
            <div className="grid gap-3">
              {packetsNeedingAttention.map((packet) => (
                <ContractPacketCard key={packet.id} packet={packet} />
              ))}
              {packetsNeedingAttention.length === 0 ? (
                <EmptyState
                  icon={ShieldCheck}
                  title="No contract packets need attention"
                  description="Review-ready, payment-pending, partially signed, or audit-gap packets will appear here."
                />
              ) : null}
            </div>
          </DashboardSection>

          <DashboardSection
            eyebrow="Contract health"
            title="Private signing system"
            description="A staff view of the controls that keep agreement packets useful, private, and traceable."
          >
            <div className="grid gap-3">
              <ContractHealthCard
                icon={LockKeyhole}
                title="Private by design"
                value={`${privateLinkCount}/${packets.length || 0}`}
                detail="Packets with tokenized private links. Contract pages stay noindexed and should never appear in public directories."
                tone={privateLinkCount > 0 ? "blue" : "slate"}
              />
              <ContractHealthCard
                icon={Receipt}
                title="Milestone billing context"
                value={milestonePacketCount}
                detail="Packets documenting deposits, milestone schedules, or payment terms without processing or holding funds."
                tone={milestonePacketCount > 0 ? "amber" : "slate"}
              />
              <ContractHealthCard
                icon={UserCheck}
                title="Completed signatures"
                value={signedPackets}
                detail="Fully signed packets should have signed snapshots, digest records, and timestamped signature state."
                tone={signedPackets > 0 ? "emerald" : "slate"}
              />
              <ContractHealthCard
                icon={ClipboardCheck}
                title="Florida review"
                value="5"
                detail="Legal review prompts are available for lien notice, Recovery Fund notice, deposit / permit timing, Chapter 558, and home-solicitation context."
                tone="amber"
              />
            </div>
          </DashboardSection>
        </div>

        <DashboardSection
          eyebrow="Contract oversight"
          title="Treat every agreement packet as a private business record."
          description="Staff can review readiness, share status, signature status, and audit history. Client Bureau does not provide legal advice, escrow, automatic payment enforcement, or public contract exposure in this workflow."
        >
          <div className="grid gap-3 text-sm leading-6 text-slate-600 md:grid-cols-3">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-950">1. Confirm readiness</p>
              <p className="mt-1">Scope, payment terms, client contact, and contractor business details should be complete before sharing.</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-950">2. Track signature state</p>
              <p className="mt-1">Review sent, viewed, signed, expired, archived, and payment-term statuses from one place.</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-950">3. Keep an audit trail</p>
              <p className="mt-1">Signed snapshots, signature status, and staff changes should remain private and traceable.</p>
            </div>
          </div>
        </DashboardSection>
        <AdminActionOutcomePanel
          title="After reviewing a contract packet"
          description="Contract oversight should help staff confirm readiness, signing status, and audit history without making private agreement content public."
          items={[
            {
              detail: "Packet status should reflect draft, sent, viewed, signed, payment-terms pending, expired, complete, or archived in the contractor workspace.",
              label: "Status",
              status: "Synced",
              title: "The packet state should match reality",
              tone: "blue",
            },
            {
              detail: "Scope, payment terms, signer details, signed snapshots, and private share links must remain noindexed and account-only.",
              label: "Privacy",
              status: "Private",
              title: "Contract content should stay sealed",
              tone: "emerald",
            },
            {
              detail: "Signature, share-link, payment-term, and staff review changes should leave a traceable private record.",
              label: "Audit",
              status: "Traceable",
              title: "The change should be reviewable later",
              tone: "amber",
            },
          ]}
        />

        {moderationCrm ? (
          <AdminOpsExpansion moderationCrm={moderationCrm} riskOps={riskOps} focus="contracts" />
        ) : null}
      </div>
    </section>
  )
}

function ContractLaneCard({
  icon: Icon,
  title,
  value,
  detail,
  tone,
  compact = false,
}: {
  icon: LucideIcon
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

function ContractPacketCard({ packet }: { packet: ContractPacket }) {
  const depositPercent = packet.packetValue > 0 ? Math.round((packet.depositRequired / packet.packetValue) * 100) : 0
  const legalWarnings = contractTemplateLegalWarnings(packet)

  return (
    <article className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={statusTone(packet.status)}>{formatStatus(packet.status)}</StatusBadge>
            <StatusBadge tone={signatureTone(packet.signatureStatus)}>{formatStatus(packet.signatureStatus ?? "not_sent")}</StatusBadge>
            {packet.shareStatus ? (
              <StatusBadge tone={shareTone(packet.shareStatus)}>{formatStatus(packet.shareStatus)}</StatusBadge>
            ) : null}
            {legalWarnings.length > 0 ? (
              <StatusBadge tone="amber">Florida review</StatusBadge>
            ) : null}
          </div>
          <h3 className="mt-3 font-semibold text-slate-950">{packet.clientName}</h3>
          <p className="mt-1 text-sm text-slate-600">
            {packet.projectType} / {formatStatus(packet.templateType)}
          </p>
        </div>
        <StatusBadge tone={packet.clientInviteStatus === "joined" ? "emerald" : "amber"}>
          {formatStatus(packet.clientInviteStatus ?? "not_invited")}
        </StatusBadge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <ContractFact label="Packet value" value={money(packet.packetValue)} />
        <ContractFact label="Deposit" value={`${money(packet.depositRequired)} (${depositPercent}%)`} />
        <ContractFact label="Milestones" value={packet.milestoneCount} />
      </div>

      <div className="mt-4 rounded-md border border-white bg-white p-3">
        <p className="text-xs font-semibold uppercase text-slate-500">Next action</p>
        <p className="mt-1 text-sm leading-6 text-slate-700">{packet.nextAction}</p>
      </div>

      <AdminContractReviewChecklist packet={packet} legalWarningCount={legalWarnings.length} />

      {legalWarnings.length > 0 ? (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">
          <p className="font-semibold">Florida legal review prompts</p>
          <ul className="mt-2 grid gap-1">
            {legalWarnings.map((warning) => (
              <li key={warning.sourceId}>
                {warning.label} - {warning.status === "included" ? "include notice after review" : "review before sending"}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase">
        {packet.paymentMode ? <StatusBadge tone="blue">{formatStatus(packet.paymentMode)}</StatusBadge> : null}
        {packet.clientEmailMasked ? <StatusBadge tone="slate">Masked client contact</StatusBadge> : null}
        {packet.signedDigest ? <StatusBadge tone="emerald">Signed digest</StatusBadge> : null}
        {packet.signedRecordAt ? <StatusBadge tone="emerald">Recorded {formatContractDate(packet.signedRecordAt)}</StatusBadge> : null}
      </div>
    </article>
  )
}

function AdminContractReviewChecklist({
  legalWarningCount,
  packet,
}: {
  legalWarningCount: number
  packet: ContractPacket
}) {
  const items = [
    {
      label: "Scope",
      ok: Boolean(packet.scopeSummary && packet.includedWork),
      text: "Scope summary and included work are present.",
    },
    {
      label: "Payment",
      ok: Boolean(packet.paymentTerms && packet.packetValue >= packet.depositRequired),
      text: "Payment terms and deposit relationship are reviewable.",
    },
    {
      label: "Signing link",
      ok: Boolean(packet.shareToken || packet.shareUrl),
      text: "A private tokenized client signing link exists.",
    },
    {
      label: "Legal review",
      ok: legalWarningCount === 0 || packet.status !== "draft",
      text: legalWarningCount > 0
        ? `${legalWarningCount} Florida prompt(s) need review before sending.`
        : "No Florida prompt was detected from the packet fields.",
    },
  ]

  return (
    <div className="mt-3 grid gap-2 rounded-md border border-slate-200 bg-white p-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase text-slate-500">{item.label}</p>
            <StatusBadge tone={item.ok ? "emerald" : "amber"}>{item.ok ? "Ready" : "Check"}</StatusBadge>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-600">{item.text}</p>
        </div>
      ))}
    </div>
  )
}

function ContractHealthCard({
  icon: Icon,
  title,
  value,
  detail,
  tone,
}: {
  icon: LucideIcon
  title: string
  value: number | string
  detail: string
  tone: "slate" | "amber" | "emerald" | "blue"
}) {
  const toneClass = {
    slate: "border-slate-200 bg-slate-50 text-slate-950",
    amber: "border-amber-200 bg-amber-50 text-amber-950",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-950",
    blue: "border-sky-200 bg-sky-50 text-sky-950",
  }[tone]

  return (
    <article className={`rounded-md border p-4 ${toneClass}`}>
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white/70">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase opacity-70">{title}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
          <p className="mt-2 text-sm leading-6 opacity-75">{detail}</p>
        </div>
      </div>
    </article>
  )
}

function ContractFact({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-white bg-white p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
    </div>
  )
}

function isPacketSigned(packet: ContractPacket) {
  return (
    packet.status === "signed" ||
    packet.signatureStatus === "fully_signed" ||
    packet.shareStatus === "signed" ||
    packet.shareStatus === "completed"
  )
}

function contractPriority(packet: ContractPacket) {
  let score = 0
  if (packet.status === "review_ready") score += 10
  if (packet.status === "draft") score += 5
  if (packet.shareStatus === "payment_pending") score += 8
  if (packet.signatureStatus === "client_signed" || packet.signatureStatus === "contractor_signed") score += 7
  if (packet.signatureStatus === "awaiting_client") score += 4
  if (isPacketSigned(packet) && (!packet.signedDigest || !packet.signedRecordAt)) score += 12
  if (daysSince(packet.updatedAt) >= 10) score += 3
  return score
}

function statusTone(status: ContractPacket["status"]) {
  return {
    draft: "slate",
    review_ready: "amber",
    sent: "blue",
    signed: "emerald",
    expired: "rose",
    archived: "slate",
  }[status] as "slate" | "amber" | "blue" | "emerald" | "rose"
}

function signatureTone(status: ContractPacket["signatureStatus"]) {
  if (status === "fully_signed") return "emerald"
  if (status === "declined") return "rose"
  if (status === "client_signed" || status === "contractor_signed" || status === "awaiting_client") return "amber"
  return "slate"
}

function shareTone(status: ContractPacket["shareStatus"]) {
  if (status === "completed" || status === "signed") return "emerald"
  if (status === "expired") return "rose"
  if (status === "payment_pending" || status === "viewed" || status === "client_joined") return "amber"
  if (status === "sent") return "blue"
  return "slate"
}

function daysSince(value: string) {
  const time = new Date(value).getTime()
  if (Number.isNaN(time)) return 0
  return Math.floor((Date.now() - time) / 86_400_000)
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value)
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ")
}

function formatContractDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(new Date(value))
}
