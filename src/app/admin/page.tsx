import type { Metadata } from "next"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import {
  Activity,
  ClipboardCheck,
  Database,
  History,
  Landmark,
  MessageSquareText,
  PhoneCall,
  Search,
  Settings,
  ShieldCheck,
  Signature,
  UploadCloud,
  UserRound,
  UsersRound,
} from "lucide-react"

import { AdminQueueHeader } from "@/components/admin/admin-crm-ui"
import {
  DashboardPageHeader,
  DashboardSection,
  HeaderActionButton,
  QuickActionCard,
  StatCard,
  StatusBadge,
} from "@/components/dashboard/dashboard-ui"
import { Badge } from "@/components/ui/badge"
import {
  getAdminModerationCrmDataService,
  getAdminWorkspaceDataService,
  getContractorRiskOpsDataService,
} from "@/lib/repositories/client-bureau-service"
import { getLaunchHealth } from "@/lib/launch-health"
import { countOpenRecoveryCases } from "@/lib/platform-features"

export const metadata: Metadata = {
  title: "Admin Command Center",
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = "force-dynamic"

export default async function AdminHomePage() {
  const [data, moderationCrm, health] = await Promise.all([
    getAdminWorkspaceDataService(),
    getAdminModerationCrmDataService(),
    getLaunchHealth(),
  ])
  const firstContractorUserId =
    data.contractors[0]?.userId ?? data.users.find((item) => item.role === "contractor")?.id
  const riskOps = firstContractorUserId
    ? await getContractorRiskOpsDataService(firstContractorUserId)
    : undefined

  const pendingReports = data.reviews.filter((item) =>
    ["queued", "needs_dispute_review"].includes(item.review.status),
  ).length
  const pendingDiscussions = data.discussions.filter((item) => item.status === "pending").length
  const pendingResponses = data.responses.filter((item) => item.status === "pending").length
  const evidenceAwaitingReview = data.reviews.filter((item) =>
    ["queued", "needs_dispute_review"].includes(item.review.status) && item.evidence.length > 0,
  ).length
  const publicClients = data.clients.filter((item) => item.isPublic).length
  const privateClients = data.clients.length - publicClients
  const elevatedClients = data.clients.filter((item) => ["Elevated", "High"].includes(item.riskLevel)).length
  const averageRating =
    data.clients.length > 0
      ? Math.round(data.clients.reduce((total, item) => total + item.clientBureauScore, 0) / data.clients.length)
      : 0
  const verifiedBusinesses = data.contractors.filter((item) => item.verificationStatus === "verified").length
  const pendingBusinesses = data.contractors.filter((item) => item.verificationStatus === "pending").length
  const escalatedCases = moderationCrm?.cases.filter((item) => item.status === "escalated").length ?? 0
  const recoveryCases = riskOps
    ? countOpenRecoveryCases(riskOps.paymentRecoveryCases) +
      riskOps.managedRecoveryCases.filter((item) => !["resolved", "closed", "paused"].includes(item.status)).length
    : 0
  const lienCases = riskOps
    ? riskOps.lienNoticeDrafts.filter((item) => item.requiredReview).length +
      riskOps.floridaLienCases.filter((item) => !["released", "closed"].includes(item.status)).length
    : 0
  const contractPackets = riskOps?.contractPackets.filter((item) => item.status !== "archived").length ?? 0
  const signedPackets =
    riskOps?.contractPackets.filter((item) =>
      ["signed", "fully_signed", "completed"].includes(item.signatureStatus ?? item.shareStatus ?? item.status),
    ).length ?? 0
  const recentAudit = data.auditLog
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)
  const newUsers = data.users
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <DashboardPageHeader
          eyebrow="Admin Command Center"
          title="Today’s platform operations"
          description="Review public content, manage ratings and profiles, supervise private service workflows, and keep every admin action traceable."
          actions={
            <>
              <HeaderActionButton href="/admin/reports">
                <ClipboardCheck aria-hidden="true" />
                Review Reports
              </HeaderActionButton>
              <HeaderActionButton href="/admin/clients" variant="outline">
                <UserRound aria-hidden="true" />
                Manage Client Profiles
              </HeaderActionButton>
            </>
          }
          meta={
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-md bg-slate-50">Admin only</Badge>
              <Badge variant="outline" className="rounded-md bg-slate-50">{escalatedCases} escalations</Badge>
              <Badge variant="outline" className="rounded-md bg-slate-50">Feature mode: {health.platformFeatureDataMode}</Badge>
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Review Reports" value={pendingReports} helper="Queued reports and dispute reviews" icon={ClipboardCheck} tone={pendingReports > 0 ? "amber" : "emerald"} href="/admin/reports" />
          <StatCard label="Evidence Review" value={evidenceAwaitingReview} helper="Private evidence attached to reports" icon={UploadCloud} tone={evidenceAwaitingReview > 0 ? "blue" : "slate"} href="/admin/reports" />
          <StatCard label="Discussions / Responses" value={pendingDiscussions + pendingResponses} helper="Pending public comments, responses, or corrections" icon={MessageSquareText} tone={pendingDiscussions + pendingResponses > 0 ? "amber" : "slate"} href="/admin/discussions" />
          <StatCard label="Audit Events" value={data.auditLog.length} helper="Approvals, edits, imports, deletes, and status changes" icon={History} tone="slate" href="/admin/audit-log" />
        </div>

        <DashboardSection
          eyebrow="Start here"
          title="What needs action today?"
          description="The command center is grouped by work type so staff can move from review to records to private service operations without hunting through the app."
        >
          <div className="grid gap-4 lg:grid-cols-4">
            <QuickActionCard
              href="/admin/reports"
              icon={ShieldCheck}
              title="Review Reports"
              description="Approve, reject, request more information, edit public summaries, and publish profiles."
              badge={`${pendingReports} pending`}
              primary
            />
            <QuickActionCard
              href="/admin/clients"
              icon={UserRound}
              title="Manage Client Profiles"
              description="Edit identity, state, rating, risk level, visibility, public slug, and audit notes."
              badge={`${publicClients} public`}
            />
            <QuickActionCard
              href="/admin/recovery"
              icon={PhoneCall}
              title="Resolution Desk"
              description="Review managed recovery cases, fee readiness, staff follow-up, and private evidence."
              badge={`${recoveryCases} open`}
            />
            <QuickActionCard
              href="/admin/contracts"
              icon={Signature}
              title="Contracts"
              description="Track agreement packets, signing links, signature status, and payment-term readiness."
              badge={`${contractPackets} active`}
            />
          </div>
        </DashboardSection>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <DashboardSection
            eyebrow="Profile and rating health"
            title="Client Bureau records"
            description="Monitor public profile readiness, rating display, high-attention records, and business-owner verification."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <OpsFact icon={UserRound} label="Public client profiles" value={publicClients} helper={`${privateClients} private profiles remain hidden`} tone="emerald" />
              <OpsFact icon={Activity} label="Average Client Bureau Rating" value={`${averageRating}/100`} helper={`${elevatedClients} elevated or high risk profiles`} tone={elevatedClients > 0 ? "amber" : "slate"} />
              <OpsFact icon={UsersRound} label="Businesses / Users" value={data.users.length} helper={`${verifiedBusinesses} verified businesses, ${pendingBusinesses} pending`} tone="blue" />
              <OpsFact icon={Search} label="Public record surface" value={data.clients.length} helper="Client directory, profile pages, recent reports, and search previews" tone="slate" />
            </div>
          </DashboardSection>

          <DashboardSection
            eyebrow="Private service oversight"
            title="Recovery, liens, and contracts"
            description="These tools are private workflow records. They must not leak into public profiles unless converted into approved report context."
          >
            <div className="grid gap-3">
              <ServiceRow href="/admin/recovery" icon={PhoneCall} title="Resolution Desk" value={`${recoveryCases} open`} helper="Managed recovery, contact attempts, payment plan context, and case notes." tone={recoveryCases > 0 ? "amber" : "slate"} />
              <ServiceRow href="/admin/recovery" icon={Landmark} title="Florida Lien Service" value={`${lienCases} review`} helper="Notice, filing, recording proof, authorization, and release readiness." tone={lienCases > 0 ? "rose" : "slate"} />
              <ServiceRow href="/admin/contracts" icon={Signature} title="Contract packets" value={`${signedPackets}/${contractPackets} signed`} helper="Private signing links, snapshots, audit history, and payment terms." tone={contractPackets > 0 ? "blue" : "slate"} />
            </div>
          </DashboardSection>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <DashboardSection
            eyebrow="Recent users"
            title="New platform accounts"
            description="Review recent account type, role, and whether a business profile or response workflow may need follow-up."
          >
            <div className="grid gap-3">
              {newUsers.map((user) => (
                <Link key={user.id} href="/admin/contractors" className="rounded-md border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-950">{user.fullName}</p>
                      <p className="mt-1 text-sm text-slate-600">{user.email}</p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <StatusBadge tone={user.role === "admin" ? "amber" : "slate"}>{user.role}</StatusBadge>
                      <StatusBadge tone={user.accountType === "client" ? "blue" : "slate"}>
                        {user.accountType === "client" ? "Client account" : "Business owner"}
                      </StatusBadge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </DashboardSection>

          <DashboardSection
            eyebrow="Audit"
            title="Latest admin activity"
            description="Recent actions help staff confirm approvals, edits, deletes, imports, and visibility changes."
          >
            <div className="grid gap-3">
              {recentAudit.map((entry) => (
                <Link key={entry.id} href="/admin/audit-log" className="rounded-md border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <p className="font-semibold text-slate-950">{entry.summary}</p>
                      <p className="mt-1 text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString()}</p>
                    </div>
                    <StatusBadge tone={entry.action.toLowerCase().includes("reject") ? "rose" : "slate"}>
                      {entry.action}
                    </StatusBadge>
                  </div>
                </Link>
              ))}
            </div>
          </DashboardSection>
        </div>

        <LiveOpsReadinessPanel health={health} />
      </div>
    </section>
  )
}

function OpsFact({
  icon: Icon,
  label,
  value,
  helper,
  tone,
}: {
  icon: LucideIcon
  label: string
  value: string | number
  helper: string
  tone: "slate" | "amber" | "emerald" | "rose" | "blue"
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-md bg-slate-950 text-white">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-600">{helper}</p>
      <div className="mt-3">
        <StatusBadge tone={tone}>Operational</StatusBadge>
      </div>
    </div>
  )
}

function ServiceRow({
  href,
  icon: Icon,
  title,
  value,
  helper,
  tone,
}: {
  href: string
  icon: LucideIcon
  title: string
  value: string
  helper: string
  tone: "slate" | "amber" | "rose" | "blue"
}) {
  return (
    <Link href={href} className="rounded-md border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-950 text-white">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-slate-950">{title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{helper}</p>
          </div>
        </div>
        <StatusBadge tone={tone}>{value}</StatusBadge>
      </div>
    </Link>
  )
}

function LiveOpsReadinessPanel({ health }: { health: Awaited<ReturnType<typeof getLaunchHealth>> }) {
  const readiness = health.readiness

  return (
    <AdminQueueHeader
      eyebrow="Live Ops Readiness"
      title={readiness.platformCanUseSupabase ? "Advanced tools are ready for Supabase persistence." : "Advanced tools are staged behind a safety gate."}
      description={readiness.readinessMessage}
      icon={Database}
      badge={readiness.readinessLabel}
      actions={
        <HeaderActionButton href="/admin/settings" variant="outline">
          <Settings aria-hidden="true" />
          Review Settings
        </HeaderActionButton>
      }
    />
  )
}
