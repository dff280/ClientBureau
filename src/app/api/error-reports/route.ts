import { NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth"
import { noStoreHeaders } from "@/lib/http"
import { createSiteErrorReportService } from "@/lib/repositories/client-bureau-service"
import { siteErrorReportSchema } from "@/lib/schemas/client-bureau"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, message: "Send a valid error report payload." },
      { status: 400, headers: noStoreHeaders },
    )
  }

  const parsed = siteErrorReportSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Review the error report details.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400, headers: noStoreHeaders },
    )
  }

  const user = await getCurrentUser().catch(() => null)
  const report = await createSiteErrorReportService(parsed.data, user?.id, user?.role)

  return NextResponse.json(
    {
      ok: true,
      data: { id: report.id, status: report.status },
      message: "Issue report received. Client Bureau admins can review it in the admin error log.",
    },
    { headers: noStoreHeaders },
  )
}
