export type SeoIndexability = "indexable" | "noindexFollow" | "robotsBlocked"

export const robotsBlockedPathPrefixes = [
  "/admin",
  "/api",
  "/auth",
  "/contract",
  "/dashboard",
] as const

export const crawlableNoindexPathPrefixes = [
  "/forgot-password",
  "/login",
  "/reset-password",
  "/search",
  "/signup",
  "/submit-report",
] as const

export const indexableTrustWorkflowPaths = [
  "/claim-profile",
  "/client-response",
] as const

function normalizedPathname(pathname: string) {
  if (!pathname) return "/"

  try {
    return new URL(pathname, "https://clientbureau.com").pathname.replace(/\/$/, "") || "/"
  } catch {
    return pathname.split("?")[0]?.replace(/\/$/, "") || "/"
  }
}

function matchesPathPrefix(pathname: string, prefix: string) {
  const normalized = normalizedPathname(pathname)
  const normalizedPrefix = normalizedPathname(prefix)

  return normalized === normalizedPrefix || normalized.startsWith(`${normalizedPrefix}/`)
}

export function isRobotsBlockedPath(pathname: string) {
  return robotsBlockedPathPrefixes.some((prefix) => matchesPathPrefix(pathname, prefix))
}

export function isCrawlableNoindexPath(pathname: string) {
  return crawlableNoindexPathPrefixes.some((prefix) => matchesPathPrefix(pathname, prefix))
}

export function seoIndexabilityForPath(pathname: string): SeoIndexability {
  if (isRobotsBlockedPath(pathname)) return "robotsBlocked"
  if (isCrawlableNoindexPath(pathname)) return "noindexFollow"

  return "indexable"
}

export function isSitemapIndexablePath(pathname: string) {
  return seoIndexabilityForPath(pathname) === "indexable"
}
