import { existsSync, readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const appDir = path.join(rootDir, "src", "app")

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
  "/client-response",
  "/contract/[token]",
  "/dashboard",
  "/dashboard/[tool]",
  "/dashboard/jobs",
  "/dashboard/jobs/[jobId]",
  "/login",
  "/search",
  "/signup",
  "/submit-report",
])

const publicIndexableRoutes = new Set([
  "/",
  "/about",
  "/business/[slug]",
  "/businesses",
  "/business-rating-methodology",
  "/change-order-template",
  "/claim-profile",
  "/client/[slug]",
  "/client-screening-for-contractors",
  "/clients",
  "/clients/[market]",
  "/clients/[market]/[city]",
  "/contact",
  "/contractor-contract-template",
  "/dispute-policy",
  "/enterprise",
  "/florida-contractor-agreement-template",
  "/florida-lien-filing-service",
  "/florida-lien-notice-service",
  "/homeowner-wont-pay-contractor",
  "/how-it-works",
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

if (!existsSync(appDir)) {
  fail("App route directory exists", appDir)
} else {
  pass("App route directory exists", appDir)
}

const pageFiles = existsSync(appDir) ? walk(appDir).filter((file) => path.basename(file) === "page.tsx").sort() : []
const routes = pageFiles.map((filePath) => {
  const route = routeFromPageFile(filePath)
  const source = readFileSync(filePath, "utf8")

  return { filePath, route, source }
})

if (routes.length >= 50) pass("App page route inventory", `${routes.length} page route(s)`)
else fail("App page route inventory", `${routes.length} page route(s)`)

const routeSet = new Set(routes.map((item) => item.route))
const classifiedRoutes = new Set([...privateNoindexRoutes, ...publicIndexableRoutes])

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

for (const { route, source } of routes.filter((item) => publicIndexableRoutes.has(item.route))) {
  if (!hasNoindexRobots(source)) pass(`${route} is not statically noindexed`)
  else fail(`${route} is not statically noindexed`, "public routes should remain indexable unless intentionally reclassified")
}

for (const check of checks) {
  const marker = check.ok ? "PASS" : "FAIL"
  console.log(`${marker} ${check.name}${check.detail ? ` - ${check.detail}` : ""}`)
}

if (checks.some((check) => !check.ok)) {
  process.exit(1)
}
