import { fail, ok, zodFieldErrors } from "@/lib/actions/result"
import {
  getMobileDashboardUser,
  mobileJson,
  sanitizeEvidenceVaultForMobile,
  sanitizeReportEvidenceForMobile,
  sanitizeRiskOpsForMobile,
} from "@/lib/mobile-api"
import {
  getContractorDashboardService,
  getContractorRiskOpsDataService,
  updateEvidenceVaultStatusService,
} from "@/lib/repositories/client-bureau-service"
import { updateEvidenceVaultStatusSchema } from "@/lib/schemas/client-bureau"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: Request) {
  const auth = await getMobileDashboardUser(request)

  if (!auth.ok) {
    return mobileJson(fail(auth.message), auth.status)
  }

  const [dashboard, riskOps] = await Promise.all([
    getContractorDashboardService(auth.user.id),
    getContractorRiskOpsDataService(auth.user.id),
  ])

  if (!dashboard) {
    return mobileJson(fail("Evidence workspace was not found."), 404)
  }

  return mobileJson(
    ok(
      {
        evidenceVault: riskOps ? sanitizeRiskOpsForMobile(riskOps).evidenceVault : [],
        reportEvidence: dashboard.evidence.map(sanitizeReportEvidenceForMobile),
        privacyNote:
          "Evidence files are private by default. Mobile responses show summaries, not storage paths.",
      },
      "Evidence loaded.",
    ),
  )
}

export async function POST(request: Request) {
  const auth = await getMobileDashboardUser(request)

  if (!auth.ok) {
    return mobileJson(fail(auth.message), auth.status)
  }

  const body = await request.json().catch(() => null)
  const parsed = updateEvidenceVaultStatusSchema.safeParse(body)

  if (!parsed.success) {
    return mobileJson(fail("Please correct the evidence fields.", zodFieldErrors(parsed.error)), 400)
  }

  try {
    const evidence = await updateEvidenceVaultStatusService(auth.user.id, parsed.data)

    return mobileJson(ok(sanitizeEvidenceVaultForMobile(evidence), "Evidence status updated."), 200)
  } catch (error) {
    return mobileJson(
      fail(error instanceof Error ? error.message : "Evidence status could not be updated."),
      400,
    )
  }
}
