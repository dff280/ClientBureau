import { getMobileDashboardUser, mobileError, mobileJson } from "@/lib/mobile-api"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: Request) {
  const auth = await getMobileDashboardUser(request)

  if (!auth.ok) {
    return mobileError(auth.message, auth.status)
  }

  return mobileJson({
    ok: true,
    message: "Mobile session ready.",
    data: {
      id: auth.user.id,
      email: auth.user.email,
      fullName: auth.user.fullName,
      role: auth.user.role,
      createdAt: auth.user.createdAt,
    },
  })
}
