import { fail, ok, zodFieldErrors } from "@/lib/actions/result"
import {
  getMobileDashboardUser,
  mobileJson,
  sanitizeSearchResultForMobile,
} from "@/lib/mobile-api"
import {
  recordSearchEventService,
  searchClientsService,
} from "@/lib/repositories/client-bureau-service"
import { searchSchema } from "@/lib/schemas/client-bureau"
import {
  buildSearchExperienceStats,
  buildSearchSuggestions,
  toSearchPreviewProfile,
} from "@/lib/search-experience"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: Request) {
  const auth = await getMobileDashboardUser(request)

  if (!auth.ok) {
    return mobileJson(fail(auth.message), auth.status)
  }

  const url = new URL(request.url)
  const parsed = searchSchema.safeParse({
    query: url.searchParams.get("q") ?? url.searchParams.get("query") ?? "",
    state: url.searchParams.get("state") || undefined,
    riskLevel: url.searchParams.get("risk") ?? url.searchParams.get("riskLevel") ?? undefined,
    category: url.searchParams.get("category") ?? undefined,
    profileType: url.searchParams.get("profileType") ?? undefined,
    tradeCategory: url.searchParams.get("tradeCategory") ?? undefined,
  })

  if (!parsed.success) {
    return mobileJson(fail("Please correct the search filters.", zodFieldErrors(parsed.error)), 400)
  }

  const filters = {
    state: parsed.data.state,
    riskLevel: parsed.data.riskLevel,
    category: parsed.data.category,
    profileType: parsed.data.profileType,
    tradeCategory: parsed.data.tradeCategory,
  }
  const results = await searchClientsService(parsed.data.query, filters)
  const previews = results.map(toSearchPreviewProfile)
  const suggestions = buildSearchSuggestions(previews, parsed.data.query, parsed.data.state)

  await recordSearchEventService(auth.user.id, {
    query: parsed.data.query,
    state: parsed.data.state,
    riskLevel: parsed.data.riskLevel,
    category: parsed.data.category,
    profileType: parsed.data.profileType,
    tradeCategory: parsed.data.tradeCategory,
    resultCount: results.length,
    eventType: results.length ? "search_submitted" : "no_result",
    source: "search_page",
  }).catch(() => undefined)

  return mobileJson(
    ok(
      {
        query: parsed.data.query,
        filters,
        results: results.slice(0, 25).map(sanitizeSearchResultForMobile),
        suggestions,
        stats: buildSearchExperienceStats(previews),
        privacyNote:
          "Phone and email searches use private matching. Raw identifiers are never shown in mobile results.",
      },
      "Search results loaded.",
    ),
  )
}
