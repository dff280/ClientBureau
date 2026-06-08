import { fail, ok, zodFieldErrors } from "@/lib/actions/result"
import {
  getMobileDashboardUser,
  mobileJson,
  sanitizeContractPacketForMobile,
  sanitizeRiskOpsForMobile,
} from "@/lib/mobile-api"
import {
  createContractPacketService,
  getContractorRiskOpsDataService,
} from "@/lib/repositories/client-bureau-service"
import { contractPacketSchema } from "@/lib/schemas/client-bureau"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: Request) {
  const auth = await getMobileDashboardUser(request)

  if (!auth.ok) {
    return mobileJson(fail(auth.message), auth.status)
  }

  const riskOps = await getContractorRiskOpsDataService(auth.user.id)

  if (!riskOps) {
    return mobileJson(fail("Contract workspace was not found."), 404)
  }

  return mobileJson(
    ok(
      {
        contractPackets: sanitizeRiskOpsForMobile(riskOps).contractPackets,
      },
      "Contracts loaded.",
    ),
  )
}

export async function POST(request: Request) {
  const auth = await getMobileDashboardUser(request)

  if (!auth.ok) {
    return mobileJson(fail(auth.message), auth.status)
  }

  const body = await request.json().catch(() => null)
  const parsed = contractPacketSchema.safeParse(body)

  if (!parsed.success) {
    return mobileJson(fail("Please correct the contract packet fields.", zodFieldErrors(parsed.error)), 400)
  }

  try {
    const packet = await createContractPacketService(auth.user.id, parsed.data)

    return mobileJson(ok(sanitizeContractPacketForMobile(packet), "Contract packet created."), 201)
  } catch (error) {
    return mobileJson(
      fail(error instanceof Error ? error.message : "Contract packet could not be created."),
      400,
    )
  }
}
