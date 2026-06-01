import { AdminAppShell } from "@/components/admin/admin-app-shell"
import { createAdminActionToken } from "@/lib/admin-action-token"
import { requireRole } from "@/lib/auth"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await requireRole("admin", "/admin")
  const adminActionToken = await createAdminActionToken(admin)

  return (
    <AdminAppShell adminName={admin.fullName} adminActionToken={adminActionToken}>
      {children}
    </AdminAppShell>
  )
}
