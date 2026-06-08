import { fail, ok, zodFieldErrors } from "@/lib/actions/result"
import { getMobileDashboardUser, mobileJson, sanitizeRiskOpsForMobile } from "@/lib/mobile-api"
import {
  createWatchlistItemService,
  getContractorRiskOpsDataService,
} from "@/lib/repositories/client-bureau-service"
import { watchlistItemSchema } from "@/lib/schemas/client-bureau"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: Request) {
  const auth = await getMobileDashboardUser(request)

  if (!auth.ok) {
    return mobileJson(fail(auth.message), auth.status)
  }

  const riskOps = await getContractorRiskOpsDataService(auth.user.id)

  if (!riskOps) {
    return mobileJson(fail("Watchlist workspace was not found."), 404)
  }

  return mobileJson(
    ok(
      {
        watchlist: riskOps.watchlist.map((item) => ({
          id: item.id,
          clientId: item.clientId,
          status: item.status,
          watchReason: item.watchReason,
          alertLevel: item.alertLevel,
          lastSignal: item.lastSignal,
          privateMatch: item.privateMatch,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
        alerts: sanitizeRiskOpsForMobile(riskOps).counts.alerts,
      },
      "Watchlist loaded.",
    ),
  )
}

export async function POST(request: Request) {
  const auth = await getMobileDashboardUser(request)

  if (!auth.ok) {
    return mobileJson(fail(auth.message), auth.status)
  }

  const body = await request.json().catch(() => null)
  const parsed = watchlistItemSchema.safeParse(body)

  if (!parsed.success) {
    return mobileJson(fail("Please correct the watchlist fields.", zodFieldErrors(parsed.error)), 400)
  }

  try {
    const item = await createWatchlistItemService(auth.user.id, parsed.data)

    return mobileJson(
      ok(
        {
          id: item.id,
          clientId: item.clientId,
          status: item.status,
          watchReason: item.watchReason,
          alertLevel: item.alertLevel,
          lastSignal: item.lastSignal,
          privateMatch: item.privateMatch,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        },
        "Client added to watchlist.",
      ),
      201,
    )
  } catch (error) {
    return mobileJson(
      fail(error instanceof Error ? error.message : "Watchlist item could not be created."),
      400,
    )
  }
}
