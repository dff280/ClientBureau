import type { Metadata } from "next"
import { ClipboardCheck, History, ShieldCheck, Signature } from "lucide-react"

import { AdminActionOutcomePanel } from "@/components/admin/admin-crm-ui"
import { AdminOpsExpansion } from "@/components/admin/admin-ops-expansion"
import {
  AdminPageHeader,
  DashboardSection,
  HeaderActionButton,
  StatCard,
} from "@/components/dashboard/dashboard-ui"
import {
  getAdminModerationCrmDataService,
  getAdminWorkspaceDataService,
  getContractorRiskOpsDataService,
} from "@/lib/repositories/client-bureau-service"

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
