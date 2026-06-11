import { requireContractorAccess } from "@/lib/auth"
import {
  getContractorDashboardService,
  getContractorRiskOpsDataService,
  getPublicClientProfilesService,
} from "@/lib/repositories/client-bureau-service"

export async function getClientDashboardData(next = "/dashboard") {
  const user = await requireContractorAccess(next)
  const [dashboard, clientProfiles, riskOps] = await Promise.all([
    getContractorDashboardService(user.id),
    getPublicClientProfilesService(),
    getContractorRiskOpsDataService(user.id),
  ])

  return {
    user,
    dashboard,
    clientProfiles,
    riskOps,
  }
}
