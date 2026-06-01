import type { Metadata } from "next"

import { AdminClientEditor } from "@/components/admin/admin-record-forms"
import { requireRole } from "@/lib/auth"
import { getAdminWorkspaceDataService } from "@/lib/repositories/client-bureau-service"

export const metadata: Metadata = {
  title: "Admin Clients",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function AdminClientsPage() {
  await requireRole("admin")
  const data = await getAdminWorkspaceDataService()

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Header title="Client profiles" text="Edit identity fields, score, risk, and public visibility. Private email and phone hashes stay hidden." />
        <div className="grid gap-4">
          {data.clients.map((client) => (
            <AdminClientEditor key={client.id} client={client} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Header({ title, text }: { title: string; text: string }) {
  return (
    <header className="border-b border-slate-200 pb-6">
      <p className="text-sm font-semibold uppercase text-amber-700">Record management</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{text}</p>
    </header>
  )
}
