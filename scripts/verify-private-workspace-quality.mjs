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

function routePatternToRegExp(route) {
  const escaped = route
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\\\[\.{3}[^\\\]]+\\\]/g, ".+")
    .replace(/\\\[[^\\\]]+\\\]/g, "[^/]+")

  return new RegExp(`^${escaped}$`)
}

function sourceHasMetadata(source) {
  return /export\s+(?:async\s+)?function\s+generateMetadata\b/.test(source) || /export\s+const\s+metadata\b/.test(source)
}

function sourceHasMetadataDescription(source) {
  return /export\s+(?:async\s+)?function\s+generateMetadata\b/.test(source) || /description\s*:/.test(source)
}

function sourceHasNoindex(source) {
  return /robots\s*:/.test(source) && /index\s*:\s*false/.test(source) && /follow\s*:\s*false/.test(source)
}

function navigationHrefs(source) {
  return [...source.matchAll(/\bhref\s*:\s*["']([^"']+)["']/g)].map((match) => match[1])
}

function normalizeHrefPath(href) {
  try {
    return new URL(href, "https://clientbureau.com").pathname.replace(/\/$/, "") || "/"
  } catch {
    return href.split("?")[0].replace(/\/$/, "") || "/"
  }
}

const workspaceDirs = ["admin", "dashboard"]
const workspacePages = workspaceDirs.flatMap((segment) => {
  const dir = path.join(appDir, segment)
  if (!existsSync(dir)) return []

  return walk(dir)
    .filter((file) => path.basename(file) === "page.tsx")
    .map((filePath) => ({
      filePath,
      route: routeFromPageFile(filePath),
      source: readFileSync(filePath, "utf8"),
      workspace: segment,
    }))
})

const routeSet = new Set(workspacePages.map((page) => page.route))
const routePatterns = [...routeSet].map((route) => ({ route, pattern: routePatternToRegExp(route) }))

if (workspacePages.filter((page) => page.workspace === "dashboard").length >= 4) {
  pass("Contractor dashboard route coverage", `${workspacePages.filter((page) => page.workspace === "dashboard").length} page(s)`)
} else {
  fail("Contractor dashboard route coverage", "Expected dashboard overview, tool, jobs, and job detail pages")
}

if (workspacePages.filter((page) => page.workspace === "admin").length >= 10) {
  pass("Admin CRM route coverage", `${workspacePages.filter((page) => page.workspace === "admin").length} page(s)`)
} else {
  fail("Admin CRM route coverage", "Expected command center plus admin queue pages")
}

for (const page of workspacePages.sort((a, b) => a.route.localeCompare(b.route))) {
  const isRedirectOnly = /redirect\(["'][^"']+["']\)/.test(page.source)
  const hasDashboardShell = /ClientDashboardShell/.test(page.source)
  const hasAdminHeader = /AdminPageHeader|AdminQueueHeader|DashboardPageHeader/.test(page.source)
  const hasPrimaryAction = /primaryAction|HeaderActionButton|DashboardActionRail|Button\s+asChild|AdminActionOutcomePanel/.test(page.source)
  const hasEmptyState =
    /EmptyState|ServiceEmptyState|AuditEmptyState|SetupState|This tool is getting ready|No [a-z]/i.test(page.source) ||
    /AdminReviewPanel|DiscussionModerationPanel|JobsWorkspace|JobDetailWorkspace/.test(page.source)

  if (sourceHasMetadata(page.source)) pass(`${page.route} declares metadata`)
  else fail(`${page.route} declares metadata`)

  if (sourceHasMetadataDescription(page.source)) pass(`${page.route} has metadata description`)
  else fail(`${page.route} has metadata description`, "Add page-specific description copy")

  if (sourceHasNoindex(page.source)) pass(`${page.route} is noindex/nofollow`)
  else fail(`${page.route} is noindex/nofollow`, "Private workspace pages must stay out of search")

  if (isRedirectOnly || hasDashboardShell || hasAdminHeader) {
    pass(`${page.route} has a professional page shell`)
  } else {
    fail(`${page.route} has a professional page shell`, "Use ClientDashboardShell, AdminPageHeader, AdminQueueHeader, or DashboardPageHeader")
  }

  if (isRedirectOnly || hasPrimaryAction) {
    pass(`${page.route} exposes an operator action path`)
  } else {
    fail(`${page.route} exposes an operator action path`, "Add a clear primary or secondary action")
  }

  if (isRedirectOnly || hasEmptyState) {
    pass(`${page.route} has empty/setup-state handling`)
  } else {
    fail(`${page.route} has empty/setup-state handling`, "Add an explicit empty, setup, or no-record state")
  }
}

if (!existsSync(navigationFile)) {
  fail("Navigation registry exists", "src/lib/navigation.ts missing")
} else {
  const navigationSource = readFileSync(navigationFile, "utf8")
  const navHrefs = navigationHrefs(navigationSource).filter((href) => href.startsWith("/admin") || href.startsWith("/dashboard"))

  for (const href of [...new Set(navHrefs)].sort()) {
    const hrefPath = normalizeHrefPath(href)
    const matchedRoute = routeSet.has(hrefPath)
      ? { route: hrefPath }
      : routePatterns.find((item) => item.pattern.test(hrefPath))

    if (matchedRoute) pass(`Private navigation resolves ${href}`, matchedRoute.route)
    else fail(`Private navigation resolves ${href}`, "No dashboard/admin route matches this navigation href")
  }
}

const dashboardToolPage = workspacePages.find((page) => page.route === "/dashboard/[tool]")
if (dashboardToolPage) {
  for (const tool of ["reports", "contracts", "recovery", "lien-readiness", "evidence", "watchlist", "billing", "activity", "growth", "alerts"]) {
    if (dashboardToolPage.source.includes(`${tool}:`) || dashboardToolPage.source.includes(`"${tool}":`)) {
      pass(`Dashboard tool config exists ${tool}`)
    } else {
      fail(`Dashboard tool config exists ${tool}`, "Add focused tool config or dedicated route")
    }
  }
}

for (const check of checks) {
  const marker = check.ok ? "PASS" : "FAIL"
  console.log(`${marker} ${check.name}${check.detail ? ` - ${check.detail}` : ""}`)
}

if (checks.some((check) => !check.ok)) {
  process.exit(1)
}
