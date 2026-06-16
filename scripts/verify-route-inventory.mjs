import { existsSync, readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const appDir = path.join(rootDir, "src", "app")
const navigationFile = path.join(rootDir, "src", "lib", "navigation.ts")

const checks = []

function pass(name, detail = "") {
  checks.push({ ok: true, name, detail })
}

function fail(name, detail = "") {
  checks.push({ ok: false, name, detail })
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(fullPath)
    return fullPath
  })
}

function routeFromPageFile(filePath) {
  const relative = path.relative(appDir, path.dirname(filePath)).replaceAll(path.sep, "/")

  return relative === "" ? "/" : `/${relative}`
}

function hasPageMetadata(source) {
  return /export\s+(?:async\s+)?function\s+generateMetadata\b/.test(source) || /export\s+const\s+metadata\b/.test(source)
}

function hasNoindexRobots(source) {
  return /robots\s*:/.test(source) && /index\s*:\s*false/.test(source) && /follow\s*:\s*false/.test(source)
}

function hasNoindexFollowRobots(source) {
  return /robots\s*:/.test(source) && /index\s*:\s*false/.test(source) && /follow\s*:\s*true/.test(source)
}

function navigationHrefs(source) {
  return new Set([...source.matchAll(/\bhref\s*:\s*["']([^"']+)["']/g)].map((match) => match[1]))
}

function normalizeHrefPath(href) {
  try {
    return new URL(href, "https://clientbureau.com").pathname.replace(/\/$/, "") || "/"
  } catch {
    return href.split("?")[0].replace(/\/$/, "") || "/"
  }
}

function routePatternToRegExp(route) {
  const escaped = route
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\\\[\.{3}[^\\\]]+\\\]/g, ".+")
    .replace(/\\\[[^\\\]]+\\\]/g, "[^/]+")

  return new RegExp(`^${escaped}$`)
}

const privateNoindexRoutes = new Set([
  "/admin",
  "/admin/audit-log",
  "/admin/clients",
  "/admin/contractors",
  "/admin/contracts",
  "/admin/discussions",
  "/admin/profiles",
  "/admin/recovery",
  "/admin/reports",
  "/admin/reviews",
  "/admin/settings",
  "/admin/uploads",
  "/contract/[token]",
  "/dashboard",
  "/dashboard/[tool]",
  "/dashboard/jobs",
  "/dashboard/jobs/[jobId]",
])

const crawlableNoindexRoutes = new Set([
  "/login",
  "/search",
  "/signup",
  "/submit-report",
])

const publicNavigationHrefs = new Set([
  "/",
  "/about",
  "/business-rating-methodology",
  "/businesses",
  "/change-order-template",
  "/claim-profile",
  "/client-response",
  "/client-screening-for-contractors",
  "/clients",
  "/clients/florida",
  "/clients/florida/orlando",
  "/contact",
  "/contractor-contract-template",
  "/enterprise",
  "/florida-contractor-agreement-template",
  "/florida-lien-filing-service",
  "/florida-lien-notice-service",
  "/homeowner-wont-pay-contractor",
  "/how-it-works",
  "/industries",
  "/industries/contractors",
  "/mobile-app",
  "/payment-recovery-service",
  "/platform",
  "/pricing",
  "/profiles",
  "/profiles/contractor",
  "/profiles/subcontractor",
  "/report-policy",
  "/reports/non-payment",
  "/reports/recent",
  "/resources",
  "/score-methodology",
  "/search",
  "/terms",
  "/privacy",
])

const dashboardNavigationHrefs = new Set([
  "/dashboard",
  "/search",
  "/dashboard/jobs",
  "/dashboard/reports",
  "/submit-report",
  "/dashboard/watchlist",
  "/dashboard/growth",
  "/dashboard/contracts",
  "/dashboard/recovery",
  "/dashboard/lien-readiness",
  "/dashboard/evidence",
  "/dashboard/alerts",
  "/dashboard/billing",
  "/dashboard/activity",
])

const adminNavigationHrefs = new Set([
  "/admin",
  "/admin/reports",
  "/admin/profiles",
  "/admin/clients",
  "/admin/contractors",
  "/admin/discussions",
  "/admin/discussions?view=responses",
  "/admin/reports?view=all",
  "/admin/uploads",
  "/admin/recovery",
  "/admin/contracts",
  "/admin/audit-log",
  "/admin/settings",
])

const publicIndexableRoutes = new Set([
  "/",
  "/about",
  "/business/[slug]",
  "/businesses",
  "/business-rating-methodology",
  "/change-order-template",
  "/claim-profile",
  "/client-response",
  "/client/[slug]",
  "/client-screening-for-contractors",
  "/clients",
  "/clients/[market]",
  "/clients/[market]/[city]",
  "/clients/[market]/counties",
  "/clients/[market]/counties/[county]",
  "/contact",
  "/contractor-contract-template",
  "/dispute-policy",
  "/enterprise",
  "/florida-contractor-agreement-template",
  "/florida-lien-filing-service",
  "/florida-lien-notice-service",
  "/homeowner-wont-pay-contractor",
  "/how-it-works",
  "/industries",
  "/industries/[industry]",
  "/mobile-app",
  "/moderation-policy",
  "/payment-recovery-service",
  "/platform",
  "/pricing",
  "/privacy",
  "/profiles",
  "/profiles/[profileType]",
  "/profiles/[profileType]/[slug]",
  "/report-policy",
  "/reports/[type]",
  "/resources",
  "/score-methodology",
  "/terms",
])

const conditionalPublicNoindexRoutes = new Set([
  "/clients/[market]/[city]",
  "/clients/[market]/counties/[county]",
])

if (!existsSync(appDir)) {
  fail("App route directory exists", appDir)
} else {
  pass("App route directory exists", appDir)
}

const pageFiles = existsSync(appDir) ? walk(appDir).filter((file) => path.basename(file) === "page.tsx").sort() : []
const navigationSource = existsSync(navigationFile) ? readFileSync(navigationFile, "utf8") : ""
const navigationHrefSet = navigationHrefs(navigationSource)
const routes = pageFiles.map((filePath) => {
  const route = routeFromPageFile(filePath)
  const source = readFileSync(filePath, "utf8")

  return { filePath, route, source }
})

if (routes.length >= 50) pass("App page route inventory", `${routes.length} page route(s)`)
else fail("App page route inventory", `${routes.length} page route(s)`)

if (existsSync(navigationFile)) pass("Navigation registry exists", navigationFile)
else fail("Navigation registry exists", "src/lib/navigation.ts missing")

const routeSet = new Set(routes.map((item) => item.route))
const classifiedRoutes = new Set([...privateNoindexRoutes, ...crawlableNoindexRoutes, ...publicIndexableRoutes])
const routePatterns = [...routeSet].map((route) => ({ route, pattern: routePatternToRegExp(route) }))

for (const route of [...classifiedRoutes].sort()) {
  if (routeSet.has(route)) pass(`Classified route exists ${route}`)
  else fail(`Classified route exists ${route}`, "missing page.tsx")
}

for (const { route } of routes) {
  if (classifiedRoutes.has(route)) pass(`Route is intentionally classified ${route}`)
  else fail(`Route is intentionally classified ${route}`, "add to publicIndexableRoutes or privateNoindexRoutes")
}

for (const { route, source } of routes) {
  if (hasPageMetadata(source)) pass(`${route} declares page metadata`)
  else fail(`${route} declares page metadata`, "missing metadata or generateMetadata export")
}

for (const { route, source } of routes.filter((item) => privateNoindexRoutes.has(item.route))) {
  if (hasNoindexRobots(source)) pass(`${route} declares noindex/nofollow robots`)
  else fail(`${route} declares noindex/nofollow robots`, "private routes must not be indexable")
}

for (const { route, source } of routes.filter((item) => crawlableNoindexRoutes.has(item.route))) {
  if (hasNoindexFollowRobots(source)) pass(`${route} declares noindex/follow robots`)
  else fail(`${route} declares noindex/follow robots`, "crawlable utility routes should not be robots-blocked or nofollowed")
}

for (const { route, source } of routes.filter((item) => publicIndexableRoutes.has(item.route))) {
  if (conditionalPublicNoindexRoutes.has(route)) {
    pass(`${route} may conditionally noindex empty public pages`)
  } else if (!hasNoindexRobots(source) && !hasNoindexFollowRobots(source)) pass(`${route} is not statically noindexed`)
  else fail(`${route} is not statically noindexed`, "public routes should remain indexable unless intentionally reclassified")
}

for (const href of [...publicNavigationHrefs].sort()) {
  if (navigationHrefSet.has(href)) pass(`Public navigation exposes ${href}`)
  else fail(`Public navigation exposes ${href}`, "add the page to primary, resource, or footer navigation")
}

for (const href of [...dashboardNavigationHrefs].sort()) {
  if (navigationHrefSet.has(href)) pass(`Dashboard navigation exposes ${href}`)
  else fail(`Dashboard navigation exposes ${href}`, "dashboard users need a discoverable path to this tool")
}

for (const href of [...adminNavigationHrefs].sort()) {
  if (navigationHrefSet.has(href)) pass(`Admin navigation exposes ${href}`)
  else fail(`Admin navigation exposes ${href}`, "admin CRM pages and saved views need a discoverable path")
}

for (const href of [...navigationHrefSet].sort()) {
  if (/^https?:\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:")) {
    pass(`Navigation href is external ${href}`)
    continue
  }

  const hrefPath = normalizeHrefPath(href)
  const matchedRoute = routeSet.has(hrefPath)
    ? { route: hrefPath }
    : routePatterns.find((item) => item.pattern.test(hrefPath))

  if (matchedRoute) pass(`Navigation href resolves ${href}`, matchedRoute.route)
  else fail(`Navigation href resolves ${href}`, "no matching App Router page")
}

for (const check of checks) {
  const marker = check.ok ? "PASS" : "FAIL"
  console.log(`${marker} ${check.name}${check.detail ? ` - ${check.detail}` : ""}`)
}

if (checks.some((check) => !check.ok)) {
  process.exit(1)
}
