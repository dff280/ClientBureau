import type { Metadata } from "next"
import Link from "next/link"
import {
  AlertTriangle,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarClock,
  ClipboardCheck,
  LockKeyhole,
  Search,
  ShieldCheck,
  UserCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react"

import { AdminActionOutcomePanel, AdminFilterBar } from "@/components/admin/admin-crm-ui"
import { AdminContractorEditor } from "@/components/admin/admin-record-forms"
import {
  AdminPageHeader,
  DashboardSection,
  EmptyState,
  HeaderActionButton,
  StatCard,
  StatusBadge,
} from "@/components/dashboard/dashboard-ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getAdminWorkspaceDataService } from "@/lib/repositories/client-bureau-service"

export const metadata: Metadata = {
  title: "Admin Businesses / Users",
  description:
    "Internal Client Bureau workspace for reviewing business-owner accounts, user roles, verification status, profile completeness, and account health.",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

type AdminBusinessesSearchParams = Promise<{
  account?: string
  q?: string
  role?: string
  verification?: string
}>

export default async function AdminContractorsPage({ searchParams }: { searchParams: AdminBusinessesSearchParams }) {
  const params = await searchParams
  const data = await getAdminWorkspaceDataService()
  const query = params.q?.trim().toLowerCase() ?? ""
  const account = params.account ?? "all"
  const role = params.role ?? "all"
  const verification = params.verification ?? "all"
  const verified = data.contractors.filter((contractor) => contractor.verificationStatus === "verified").length
  const pending = data.contractors.filter((contractor) => contractor.verificationStatus === "pending").length
  const unverified = data.contractors.filter((contractor) => contractor.verificationStatus === "unverified").length
  const newUsers = data.users.filter((user) => isWithinDays(user.createdAt, 14)).length
  const adminUsers = data.users.filter((user) => user.role === "admin").length
  const clientAccounts = data.users.filter((user) => user.accountType === "client").length
  const businessAccounts = data.users.filter((user) => user.accountType !== "client").length
  const incompleteBusinessProfileCount = data.contractors.filter(hasBusinessProfileGaps).length
  const filteredContractors = data.contractors
    .filter((contractor) => {
      const text = [
        contractor.businessName,
        contractor.trade,
        contractor.businessType,
        contractor.city,
        contractor.state,
        contractor.licenseNumber,
        contractor.serviceArea,
        contractor.primaryGoal,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return (!query || text.includes(query)) && (verification === "all" || contractor.verificationStatus === verification)
    })
    .sort((a, b) => contractorPriority(b) - contractorPriority(a))
  const filteredUsers = data.users.filter((user) => {
    const text = [user.fullName, user.email, user.role].join(" ").toLowerCase()

    return (
      (!query || text.includes(query)) &&
      (role === "all" || user.role === role) &&
      (account === "all" ||
        (account === "client" ? user.accountType === "client" : user.accountType !== "client"))
    )
  })

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <AdminPageHeader
          eyebrow="Records"
          title="Businesses / Users"
          description="Review business-owner accounts, verification status, plans, account health, and admin notes without mixing this queue into the public product."
          actions={
            <>
              <HeaderActionButton href="/admin/profiles" variant="outline">
                <BadgeCheck aria-hidden="true" />
                Unified profiles
              </HeaderActionButton>
              <HeaderActionButton href="/admin/audit-log" variant="outline">
                <ClipboardCheck aria-hidden="true" />
                Audit log
              </HeaderActionButton>
            </>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Users" value={data.users.length} helper={`${newUsers} new in the last 14 days`} icon={UsersRound} tone="slate" />
          <StatCard label="Businesses" value={data.contractors.length} helper="Business-owner workspaces" icon={ShieldCheck} tone="blue" />
          <StatCard label="Verified" value={verified} helper="Accounts with verified business status" icon={UserCheck} tone="emerald" />
          <StatCard label="Pending verification" value={pending} helper="Accounts needing review" icon={ShieldCheck} tone={pending > 0 ? "amber" : "slate"} />
          <StatCard label="Profile gaps" value={incompleteBusinessProfileCount} helper="Missing operating details" icon={CalendarClock} tone={incompleteBusinessProfileCount > 0 ? "amber" : "slate"} />
        </div>

        <DashboardSection
          eyebrow="Account operations"
          title="Know which accounts need staff attention"
          description="Start with pending verification, incomplete business profiles, new accounts, and privileged admin access. Keep account details private unless a public business profile is intentionally published."
        >
          <div className="grid gap-3 md:grid-cols-4">
            <AccountWorkTile
              icon={UserCheck}
              label="Pending verification"
              value={pending}
              text="Business owners waiting for staff review before receiving verified status."
              tone={pending > 0 ? "amber" : "slate"}
            />
            <AccountWorkTile
              icon={AlertTriangle}
              label="Unverified"
              value={unverified}
              text="Accounts that may need onboarding, documentation, or verification follow-up."
              tone={unverified > 0 ? "amber" : "slate"}
            />
            <AccountWorkTile
              icon={BriefcaseBusiness}
              label="Profile gaps"
              value={incompleteBusinessProfileCount}
              text="Business profiles missing license, service area, company size, years, website, or platform goal."
              tone={incompleteBusinessProfileCount > 0 ? "amber" : "slate"}
            />
            <AccountWorkTile
              icon={LockKeyhole}
              label="Admin access"
              value={adminUsers}
              text="Privileged users should remain limited, intentional, and auditable."
              tone={adminUsers > 0 ? "emerald" : "slate"}
            />
          </div>
        </DashboardSection>

        <AdminActionOutcomePanel
          title="After updating a business or user record"
          description="Account edits should make the business workspace clearer without confusing roles, billing, verification, or public profile ownership."
          items={[
            {
              detail: "Role, account type, business profile, verification status, trade, city, state, and plan context should still make sense together.",
              label: "Account health",
              status: "Aligned",
              title: "The account should read correctly",
              tone: "blue",
            },
            {
              detail: "Business verification and profile edits should not publish private account email, billing details, internal notes, or raw documents publicly.",
              label: "Privacy",
              status: "Sealed",
              title: "Private account context should stay private",
              tone: "emerald",
            },
            {
              detail: "Verification, role, business identity, and account-health changes should include enough audit context for staff review.",
              label: "Audit",
              status: "Logged",
              title: "The update should be traceable",
              tone: "amber",
            },
          ]}
        />

        <AdminFilterBar
          title="Find an account"
          description="Search by business, owner, email, trade, city, state, or license number."
        >
          <form className="grid w-full gap-2 sm:w-auto sm:grid-cols-[220px_150px_150px_170px_auto]">
            <Input name="q" defaultValue={params.q} placeholder="Search accounts" aria-label="Search accounts" />
            <select name="role" defaultValue={role} className="h-10 rounded-md border border-input bg-white px-3 text-sm">
              <option value="all">All roles</option>
              <option value="contractor">Business user</option>
              <option value="admin">Admin</option>
            </select>
            <select name="account" defaultValue={account} className="h-10 rounded-md border border-input bg-white px-3 text-sm">
              <option value="all">All accounts</option>
              <option value="business">Business owners</option>
              <option value="client">Client accounts</option>
            </select>
            <select name="verification" defaultValue={verification} className="h-10 rounded-md border border-input bg-white px-3 text-sm">
              <option value="all">All verification</option>
              <option value="unverified">Unverified</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
            </select>
            <Button className="bg-slate-950 text-white hover:bg-slate-800">
              <Search aria-hidden="true" />
              Filter
            </Button>
          </form>
        </AdminFilterBar>

        <DashboardSection
          eyebrow="User access"
          title="Platform users"
          description={`${filteredUsers.length} visible user${filteredUsers.length === 1 ? "" : "s"} across ${businessAccounts} business-owner and ${clientAccounts} client account${clientAccounts === 1 ? "" : "s"}. Email addresses are masked in this scan view.`}
          actions={
            <Button asChild variant="outline">
              <Link href="/admin/audit-log">
                <ClipboardCheck aria-hidden="true" />
                Review account events
              </Link>
            </Button>
          }
        >
        <div className="grid gap-4 md:grid-cols-3">
          {filteredUsers.map((user) => (
            <div key={user.id} className="rounded-md border border-slate-200 bg-white p-4 text-sm shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-950">{user.fullName}</p>
                  <p className="mt-1 text-slate-600">{maskEmail(user.email)}</p>
                </div>
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold uppercase text-slate-600">
                  {ageLabel(user.createdAt)}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase">
                <StatusBadge tone={user.role === "admin" ? "amber" : "slate"}>{user.role}</StatusBadge>
                <StatusBadge tone={user.accountType === "client" ? "blue" : "slate"}>
                  {user.accountType === "client" ? "Client account" : "Business owner"}
                </StatusBadge>
                <StatusBadge tone="emerald">Account active</StatusBadge>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                User ID: {shortId(user.id)}. Full account details stay in authenticated admin systems and audit events.
              </p>
            </div>
          ))}
          {filteredUsers.length === 0 ? (
            <div className="md:col-span-3">
              <EmptyState
                icon={Search}
                title="No users match"
                description="Clear the filters or search another owner name, email, role, trade, city, or state."
              />
            </div>
          ) : null}
        </div>
        </DashboardSection>

        <DashboardSection
          eyebrow="Business profiles"
          title="Business-owner workspaces"
          description={`${filteredContractors.length} visible business profile${filteredContractors.length === 1 ? "" : "s"} sorted by verification urgency, profile completeness, operating details, and onboarding age.`}
        >
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredContractors.map((contractor) => (
            <AdminContractorEditor key={contractor.id} contractor={contractor} />
          ))}
          {filteredContractors.length === 0 ? (
            <div className="xl:col-span-2">
              <EmptyState
                icon={ShieldCheck}
                title="No business profiles match"
                description="Try another business name, trade, location, license number, or verification status."
              />
            </div>
          ) : null}
        </div>
        </DashboardSection>
      </div>
    </section>
  )
}

function contractorPriority(contractor: Awaited<ReturnType<typeof getAdminWorkspaceDataService>>["contractors"][number]) {
  let priority = 0
  if (contractor.verificationStatus === "pending") priority += 100
  if (contractor.verificationStatus === "unverified") priority += 50
  if (!contractor.licenseNumber) priority += 20
  if (!contractor.serviceArea) priority += 10
  if (!contractor.businessType) priority += 8
  if (!contractor.companySize) priority += 6
  if (!contractor.yearsInBusiness) priority += 6
  if (!contractor.primaryGoal) priority += 5
  if (!contractor.websiteUrl) priority += 3
  if (isWithinDays(contractor.createdAt, 14)) priority += 8
  return priority
}

function hasBusinessProfileGaps(contractor: Awaited<ReturnType<typeof getAdminWorkspaceDataService>>["contractors"][number]) {
  return !(
    contractor.licenseNumber &&
    contractor.serviceArea &&
    contractor.businessType &&
    contractor.companySize &&
    contractor.yearsInBusiness &&
    contractor.primaryGoal
  )
}

function isWithinDays(value: string, days: number) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  return Date.now() - date.getTime() <= days * 86_400_000
}

function ageLabel(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Date unavailable"

  const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86_400_000))
  if (days === 0) return "New today"
  if (days === 1) return "1 day"
  return `${days} days`
}

function maskEmail(email: string) {
  const [name, domain] = email.split("@")
  if (!name || !domain) return "Private email"
  const safeName = name.length <= 2 ? `${name[0] ?? "*"}*` : `${name.slice(0, 2)}***`
  return `${safeName}@${domain}`
}

function shortId(value: string) {
  return value.length <= 8 ? value : `${value.slice(0, 8)}...`
}

function AccountWorkTile({
  icon: Icon,
  label,
  text,
  tone = "slate",
  value,
}: {
  icon: LucideIcon
  label: string
  text: string
  tone?: "slate" | "amber" | "emerald"
  value: number | string
}) {
  const toneClass = {
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
  }[tone]

  return (
    <div className={`rounded-md border p-4 ${toneClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase opacity-70">{label}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white/80 text-slate-950 shadow-sm">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 opacity-80">{text}</p>
    </div>
  )
}
