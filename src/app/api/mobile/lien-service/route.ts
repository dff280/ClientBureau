import { fail, ok, zodFieldErrors } from "@/lib/actions/result"
import { getMobileDashboardUser, mobileError, mobileJson, sanitizeRiskOpsForMobile } from "@/lib/mobile-api"
import {
  getContractorRiskOpsDataService,
  submitFloridaLienCaseService,
} from "@/lib/repositories/client-bureau-service"
import { floridaLienCaseSchema } from "@/lib/schemas/client-bureau"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: Request) {
  const auth = await getMobileDashboardUser(request)

  if (!auth.ok) {
    return mobileError(auth.message, auth.status)
  }

  const riskOps = await getContractorRiskOpsDataService(auth.user.id)

  if (!riskOps) {
    return mobileError("Florida lien service workspace was not found.", 404)
  }

  const mobileRiskOps = sanitizeRiskOpsForMobile(riskOps)

  return mobileJson({
    ok: true,
    message: "Florida lien service cases loaded.",
    data: {
      floridaLienCases: mobileRiskOps.floridaLienCases,
      serviceReadiness: mobileRiskOps.serviceReadiness.filter((item) => item.entityType === "florida_lien"),
      serviceFeeOrders: mobileRiskOps.serviceFeeOrders.filter((item) =>
        ["florida_lien_notice", "florida_lien_filing"].includes(item.kind)
      ),
    },
  })
}

export async function POST(request: Request) {
  const auth = await getMobileDashboardUser(request)

  if (!auth.ok) {
    return mobileError(auth.message, auth.status)
  }

  const body = await request.json().catch(() => null)
  const parsed = floridaLienCaseSchema.safeParse(body)

  if (!parsed.success) {
    return mobileJson(fail("Please correct the Florida lien service fields.", zodFieldErrors(parsed.error)), 400)
  }

  try {
    const lienCase = await submitFloridaLienCaseService(auth.user.id, parsed.data)

    if (!lienCase) {
      return mobileError("Florida lien service is temporarily unavailable.", 503)
    }

    return mobileJson(ok(lienCase, "Florida lien service case submitted."), 201)
  } catch (error) {
    return mobileError(error instanceof Error ? error.message : "Florida lien service case could not be submitted.", 400)
  }
}
