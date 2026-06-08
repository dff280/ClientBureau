import { fail, ok, zodFieldErrors } from "@/lib/actions/result"
import {
  getMobileDashboardUser,
  mobileJson,
  sanitizeDashboardForMobile,
  sanitizeSavedSearchForMobile,
} from "@/lib/mobile-api"
import {
  getContractorDashboardService,
  saveClientSearchService,
} from "@/lib/repositories/client-bureau-service"
import { savedClientSearchSchema } from "@/lib/schemas/client-bureau"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: Request) {
  const auth = await getMobileDashboardUser(request)

  if (!auth.ok) {
    return mobileJson(fail(auth.message), auth.status)
  }

  const dashboard = await getContractorDashboardService(auth.user.id)

  if (!dashboard) {
    return mobileJson(fail("Saved searches were not found."), 404)
  }

  return mobileJson(
    ok(
      {
        savedSearches: sanitizeDashboardForMobile(dashboard).savedSearches,
      },
      "Saved searches loaded.",
    ),
  )
}

export async function POST(request: Request) {
  const auth = await getMobileDashboardUser(request)

  if (!auth.ok) {
    return mobileJson(fail(auth.message), auth.status)
  }

  const body = await request.json().catch(() => null)
  const parsed = savedClientSearchSchema.safeParse(body)

  if (!parsed.success) {
    return mobileJson(fail("Please correct the saved search fields.", zodFieldErrors(parsed.error)), 400)
  }

  const savedSearch = await saveClientSearchService(auth.user.id, parsed.data)

  if (!savedSearch) {
    return mobileJson(fail("Saved search is temporarily unavailable."), 503)
  }

  return mobileJson(ok(sanitizeSavedSearchForMobile(savedSearch), "Search saved."), 201)
}
