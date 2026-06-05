import { fail, ok, zodFieldErrors } from "@/lib/actions/result"
import { getMobileDashboardUser, mobileError, mobileJson, sanitizeRiskOpsForMobile } from "@/lib/mobile-api"
import {
  getContractorRiskOpsDataService,
  submitManagedRecoveryCaseService,
} from "@/lib/repositories/client-bureau-service"
import { managedRecoveryCaseSchema } from "@/lib/schemas/client-bureau"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: Request) {
  const auth = await getMobileDashboardUser(request)

  if (!auth.ok) {
    return mobileError(auth.message, auth.status)
  }

  const riskOps = await getContractorRiskOpsDataService(auth.user.id)

  if (!riskOps) {
    return mobileError("Recovery workspace was not found.", 404)
  }

  const mobileRiskOps = sanitizeRiskOpsForMobile(riskOps)

  return mobileJson({
    ok: true,
    message: "Recovery cases loaded.",
    data: {
      managedRecoveryCases: mobileRiskOps.managedRecoveryCases,
      serviceReadiness: mobileRiskOps.serviceReadiness.filter((item) => item.entityType === "managed_recovery"),
      serviceFeeOrders: mobileRiskOps.serviceFeeOrders.filter((item) => item.kind === "managed_recovery"),
    },
  })
}

export async function POST(request: Request) {
  const auth = await getMobileDashboardUser(request)

  if (!auth.ok) {
    return mobileError(auth.message, auth.status)
  }

  const body = await request.json().catch(() => null)
  const parsed = managedRecoveryCaseSchema.safeParse(body)

  if (!parsed.success) {
    return mobileJson(fail("Please correct the managed recovery case fields.", zodFieldErrors(parsed.error)), 400)
  }

  try {
    const recoveryCase = await submitManagedRecoveryCaseService(auth.user.id, parsed.data)

    if (!recoveryCase) {
      return mobileError("Managed recovery is temporarily unavailable.", 503)
    }

    return mobileJson(ok(recoveryCase, "Managed recovery case submitted."), 201)
  } catch (error) {
    return mobileError(error instanceof Error ? error.message : "Managed recovery case could not be submitted.", 400)
  }
}
