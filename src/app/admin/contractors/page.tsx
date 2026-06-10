import type { Metadata } from "next"
import { Search, ShieldCheck, UserCheck, UsersRound } from "lucide-react"

import { AdminActionOutcomePanel, AdminFilterBar } from "@/components/admin/admin-crm-ui"
import { AdminContractorEditor } from "@/components/admin/admin-record-forms"
import {
  AdminPageHeader,
  EmptyState,
  StatCard,
  StatusBadge,
} from "@/components/dashboard/dashboard-ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getAdminWorkspaceDataService } from "@/lib/repositories/client-bureau-service"

export const metadata: Metadata = {
  title: "Admin Businesses / Users",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

type AdminBusinessesSearchParams = Promise<{
  q?: string
  verification?: string
}>

export default async function AdminContractorsPage({ searchParams }: { searchParams: AdminBusinessesSearchParams }) {
  const params = await searchParams
  const data = await getAdminWorkspaceDataService()
  const query = params.q?.trim().toLowerCase() ?? ""
  const verification = params.verification ?? "all"
  const verified = data.contractors.filter((contractor) => contractor.verificationStatus === "verified").length
  const pending = data.contractors.filter((contractor) => contractor.verificationStatus === "pending").length
  const filteredContractors = data.contractors.filter((contractor) => {
    const text = [contractor.businessName, contractor.trade, contractor.city, contractor.state, contractor.licenseNumber]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    return (!query || text.includes(query)) && (verification === "all" || contractor.verificationStatus === verification)
  })
  const filteredUsers = data.users.filter((user) => {
    const text = [user.fullName, user.email, user.role].join(" ").toLowerCase()

    return !query || text.includes(query)
  })

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <AdminPageHeader
          eyebrow="Records"
          title="Businesses / Users"
          description="Review business-owner accounts, verification status, plans, account health, and admin notes without mixing this queue into the public product."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Users" value={data.users.length} helper="All platform user records" icon={UsersRound} tone="slate" />
          <StatCard label="Businesses" value={data.contractors.length} helper="Business-owner workspaces" icon={ShieldCheck} tone="blue" />
          <StatCard label="Verified" value={verified} helper="Accounts with verified business status" icon={UserCheck} tone="emerald" />
          <StatCard label="Pending verification" value={pending} helper="Accounts needing review" icon={ShieldCheck} tone={pending > 0 ? "amber" : "slate"} />
        </div>
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
              detail: "Business verification and profile edits should not expose private account email, billing details, internal notes, or raw documents publicly.",
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
          <form className="grid w-full gap-2 sm:w-auto sm:grid-cols-[240px_170px_auto]">
            <Input name="q" defaultValue={params.q} placeholder="Search accounts" aria-label="Search accounts" />
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

        <div className="grid gap-4 md:grid-cols-3">
          {filteredUsers.map((user) => (
            <div key={user.id} className="rounded-md border border-slate-200 bg-white p-4 text-sm shadow-sm">
              <p className="font-semibold text-slate-950">{user.fullName}</p>
              <p className="mt-1 text-slate-600">{user.email}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase">
                <StatusBadge tone={user.role === "admin" ? "amber" : "slate"}>{user.role}</StatusBadge>
                <StatusBadge tone={user.accountType === "client" ? "blue" : "slate"}>
                  {user.accountType === "client" ? "Client account" : "Business owner"}
                </StatusBadge>
                <StatusBadge tone="emerald">Account active</StatusBadge>
              </div>
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
      </div>
    </section>
  )
}
