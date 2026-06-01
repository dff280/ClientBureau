import { AdminAppShell } from "@/components/admin/admin-app-shell"
import { requireRole } from "@/lib/auth"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await requireRole("admin", "/admin")

  return <AdminAppShell adminName={admin.fullName}>{children}</AdminAppShell>
}
