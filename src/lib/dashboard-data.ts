import { requireContractorAccess } from "@/lib/auth"
import {
  getContractorDashboardService,
  getContractorRiskOpsDataService,
  getPublicClientProfilesService,
} from "@/lib/repositories/client-bureau-service"

export async function getClientDashboardData() {
  const user = await requireContractorAccess()
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
