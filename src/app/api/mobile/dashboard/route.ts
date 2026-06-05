import {
  getMobileDashboardUser,
  mobileError,
  mobileJson,
  sanitizeDashboardForMobile,
  sanitizeRiskOpsForMobile,
} from "@/lib/mobile-api"
import {
  getContractorDashboardService,
  getContractorRiskOpsDataService,
} from "@/lib/repositories/client-bureau-service"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: Request) {
  const auth = await getMobileDashboardUser(request)

  if (!auth.ok) {
    return mobileError(auth.message, auth.status)
  }

  const [dashboard, riskOps] = await Promise.all([
    getContractorDashboardService(auth.user.id),
    getContractorRiskOpsDataService(auth.user.id),
  ])

  if (!dashboard) {
    return mobileError("Contractor dashboard was not found.", 404)
  }

  return mobileJson({
    ok: true,
    message: "Dashboard loaded.",
    data: {
      dashboard: sanitizeDashboardForMobile(dashboard),
      riskOps: riskOps ? sanitizeRiskOpsForMobile(riskOps) : undefined,
    },
  })
}
