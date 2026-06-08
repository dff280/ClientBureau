import { fail, ok, zodFieldErrors } from "@/lib/actions/result"
import {
  getMobileDashboardUser,
  mobileJson,
  sanitizeDashboardForMobile,
  sanitizeReportForMobile,
} from "@/lib/mobile-api"
import {
  getContractorDashboardService,
  getContractorRiskOpsDataService,
  submitClientReportService,
} from "@/lib/repositories/client-bureau-service"
import { clientReportSchema } from "@/lib/schemas/client-bureau"

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
    return mobileJson(fail("Reports workspace was not found."), 404)
  }

  return mobileJson(
    ok(
      {
        reports: sanitizeDashboardForMobile(dashboard).reports,
        drafts: riskOps?.reportDrafts ?? [],
        evidenceSummaries: riskOps?.evidenceSummaries ?? [],
      },
      "Reports loaded.",
    ),
  )
}

export async function POST(request: Request) {
  const auth = await getMobileDashboardUser(request)

  if (!auth.ok) {
    return mobileJson(fail(auth.message), auth.status)
  }

  const body = await request.json().catch(() => null)
  const parsed = clientReportSchema.safeParse(body)

  if (!parsed.success) {
    return mobileJson(fail("Please correct the report fields.", zodFieldErrors(parsed.error)), 400)
  }

  try {
    const report = await submitClientReportService(parsed.data, auth.user.id)

    return mobileJson(ok(sanitizeReportForMobile(report), "Report submitted for moderation."), 201)
  } catch (error) {
    return mobileJson(
      fail(error instanceof Error ? error.message : "Report could not be submitted."),
      400,
    )
  }
}
