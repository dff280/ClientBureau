import { execSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { findProductionCopyLeaks, visiblePageText } from "./public-copy-safety.mjs"

const baseUrl = (process.env.LIVE_BASE_URL || process.env.SEO_BASE_URL || "https://clientbureau.com").replace(/\/$/, "")
const expectedSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL || baseUrl).replace(/\/$/, "")
const skipReleaseIdentityCheck = process.env.SKIP_RELEASE_IDENTITY_CHECK === "1"

function readLocalPackageVersion() {
  try {
    return JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version || ""
  } catch {
    return ""
  }
}

function readLocalGitCommit() {
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim()
  } catch {
    return ""
  }
}

function readMobileReleaseConfig() {
  try {
    const config = JSON.parse(readFileSync(new URL("../apps/mobile/app.json", import.meta.url), "utf8"))

    return {
      version: config?.expo?.version ? String(config.expo.version) : "",
      androidBuild: config?.expo?.android?.versionCode ? String(config.expo.android.versionCode) : "",
    }
  } catch {
    return { version: "", androidBuild: "" }
  }
}

const expectedAppVersion = skipReleaseIdentityCheck
  ? ""
  : process.env.EXPECTED_APP_VERSION || process.env.RELEASE_VERSION || readLocalPackageVersion()
const expectedCommit = skipReleaseIdentityCheck
  ? ""
  : process.env.EXPECTED_GIT_COMMIT || process.env.GIT_COMMIT_SHA || readLocalGitCommit()
const expectedMobileRelease = readMobileReleaseConfig()

const checks = []
const staleReleaseDetails = []

function record(level, name, detail = "") {
  checks.push({ level, name, detail })
}

function pass(name, detail = "") {
  record("PASS", name, detail)
}

function warn(name, detail = "") {
  record("WARN", name, detail)
}

function fail(name, detail = "") {
  record("FAIL", name, detail)
}

async function read(path, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 15000)

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: { "User-Agent": "ClientBureauReleaseVerifier/1.0" },
      redirect: options.redirect ?? "follow",
      signal: controller.signal,
    })
    const text = await response.text()

    return { response, text }
  } catch (error) {
    return {
      response: { ok: false, status: "request_failed" },
      text: "",
      error: error instanceof Error ? error.message : String(error),
    }
  } finally {
    clearTimeout(timeout)
  }
}

async function readJson(path) {
  const result = await read(path)

  if (!result.response.ok) {
    return { ...result, json: null }
  }

  try {
    return { ...result, json: JSON.parse(result.text) }
  } catch (error) {
    return {
      ...result,
      json: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

function extract(html, pattern) {
  const match = html.match(pattern)

  return match?.[1]?.trim() ?? ""
}

function decodeHtmlAttribute(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
}

function hiddenInputValue(html, name) {
  const inputs = [...html.matchAll(/<input\b[^>]*>/gi)].map((match) => match[0])
  const input = inputs.find((tag) => {
    const inputName = extract(tag, /\bname=["']([^"']+)["']/i)

    return inputName === name
  })

  return input ? decodeHtmlAttribute(extract(input, /\bvalue=["']([^"']*)["']/i)) : ""
}

function canonical(html) {
  return extract(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/is)
}

function clientProfileLinks(html) {
  return [...html.matchAll(/href=["']([^"']*\/client\/[^"']+)["']/gi)]
    .map((match) => {
      try {
        return new URL(match[1], expectedSiteUrl).pathname
      } catch {
        return ""
      }
    })
    .filter(Boolean)
}

function sitemapProfilePaths(xml) {
  return [...xml.matchAll(/<loc>https?:\/\/[^<]+(\/client\/[^<]+)<\/loc>/gi)].map((match) => match[1])
}

function sitemapEntityProfilePaths(xml) {
  return [...xml.matchAll(/<loc>https?:\/\/[^<]+(\/profiles\/[^<]+)<\/loc>/gi)].map((match) => match[1])
}

function hasNoStoreHeader(response) {
  const cacheControl = response.headers?.get?.("cache-control") ?? ""

  return /no-store/i.test(cacheControl)
}

function streamedRedirectTarget(html) {
  const digestMatch = html.match(/NEXT_REDIRECT;replace;([^;]+);(?:30[2378]);/i)
  if (digestMatch?.[1]) return digestMatch[1]

  const refreshMatch = html.match(/http-equiv=["']refresh["'][^>]+content=["'][^"']*url=([^"']+)["']/i)
  if (refreshMatch?.[1]) return refreshMatch[1]

  return ""
}

function isSafeLoginRedirect(value) {
  if (!value) return false

  try {
    const target = new URL(value, expectedSiteUrl)

    if (target.origin !== expectedSiteUrl) return false
    if (target.pathname !== "/login") return false

    const next = target.searchParams.get("next")

    return !next || (next.startsWith("/") && !next.startsWith("//"))
  } catch {
    return false
  }
}

function loginRedirectNext(value) {
  if (!value) return ""

  try {
    const target = new URL(value, expectedSiteUrl)

    return target.searchParams.get("next") ?? ""
  } catch {
    return ""
  }
}

function protectedRouteRedirectDetail(result) {
  const status = Number(result.response.status)
  const location = result.response.headers?.get?.("location") ?? ""

  if ([301, 302, 303, 307, 308].includes(status)) {
    return isSafeLoginRedirect(location) ? location : ""
  }

  if (status === 200) {
    const target = streamedRedirectTarget(result.text)

    return isSafeLoginRedirect(target) ? target : ""
  }

  return ""
}

function visibleHtml(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")
}

function containsPrivateIdentifier(html) {
  const visible = visibleHtml(html)

  return (
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(visible) ||
    /\b\d{3}[-.)\s]?\d{3}[-.\s]?\d{4}\b/.test(visible) ||
    /storage\/v1\/object|report-evidence|signed_snapshot|internal admin note/i.test(visible)
  )
}

function assertProductionCopySafety(path, html) {
  const leaks = findProductionCopyLeaks(html)

  if (leaks.length === 0) {
    pass(`${path} production copy safety`)
  } else {
    fail(`${path} production copy safety`, leaks.join(", "))
  }
}

const version = await readJson("/api/version")
if (version.response.ok && version.json?.version) {
  pass("/api/version release identity", `${version.json.version}${version.json.commit ? ` @ ${version.json.commit}` : ""}`)

  if (expectedAppVersion) {
    if (version.json.version === expectedAppVersion) {
      pass("Expected app version", expectedAppVersion)
    } else {
      fail("Expected app version", `expected ${expectedAppVersion}, got ${version.json.version}`)
      staleReleaseDetails.push(`version ${version.json.version} is live; ${expectedAppVersion} is expected`)
    }
  }

  if (expectedCommit) {
    if (version.json.commit === expectedCommit) {
      pass("Expected Git commit", expectedCommit)
    } else {
      fail("Expected Git commit", `expected ${expectedCommit}, got ${version.json.commit || "not reported"}`)
      staleReleaseDetails.push(`commit ${version.json.commit || "not reported"} is live; ${expectedCommit} is expected`)
    }
  }
} else {
  fail("/api/version release identity", version.error || String(version.response.status))
}

const health = await readJson("/api/health")
if (health.response.ok && health.json?.status === "ok") {
  pass("/api/health status", health.json.status)
} else {
  fail("/api/health status", health.error || String(health.response.status))
}

if (health.json?.readiness?.coreLiveReady) {
  pass("Core Supabase live readiness", "coreLiveReady=true")
} else {
  fail("Core Supabase live readiness", JSON.stringify(health.json?.readiness ?? null))
}

if (health.json?.readiness?.platformCanUseSupabase) {
  pass("Advanced platform Supabase readiness", "platformCanUseSupabase=true")
} else {
  warn(
    "Advanced platform Supabase readiness",
    health.json?.readiness?.readinessMessage || "Keep PLATFORM_FEATURE_DATA_MODE=mock until migrations are complete.",
  )
}

if (health.json?.stripeConfigured && health.json?.stripeWebhookConfigured) {
  pass("Stripe test/live configuration", "secret and webhook configured")
} else {
  warn("Stripe test/live configuration", "Stripe secret or webhook is not configured yet.")
}

const diagnosticPaths = ["/api/version", "/api/health", "/api/session", "/api/admin/session"]

for (const path of diagnosticPaths) {
  const diagnostic = await read(path)

  if (!diagnostic.response.ok) {
    fail(`${path} diagnostic endpoint`, diagnostic.error || String(diagnostic.response.status))
    continue
  }

  if (hasNoStoreHeader(diagnostic.response)) {
    pass(`${path} no-store cache header`)
  } else {
    fail(`${path} no-store cache header`, diagnostic.response.headers?.get?.("cache-control") || "missing")
  }
}

for (const path of ["/", "/robots.txt", "/sitemap.xml", "/llms.txt", "/ai-index.json"]) {
  const result = await read(path)
  if (result.response.ok) pass(`${path} returns 200`)
  else fail(`${path} returns 200`, result.error || String(result.response.status))
}

const protectedRoutes = [
  { path: "/dashboard", expectedNext: "/dashboard" },
  { path: "/dashboard/reports", expectedNext: "/dashboard/reports" },
  { path: "/dashboard/contracts", expectedNext: "/dashboard/contracts" },
  { path: "/dashboard/recovery", expectedNext: "/dashboard/recovery" },
  { path: "/submit-report", expectedNext: "/submit-report" },
  { path: "/admin", expectedNext: "/admin" },
  { path: "/admin/reports", expectedNext: "/admin" },
]

for (const { path, expectedNext } of protectedRoutes) {
  const result = await read(path, { redirect: "manual" })
  const detail = protectedRouteRedirectDetail(result)

  if (detail) {
    pass(`${path} logged-out protection`, detail)

    const next = loginRedirectNext(detail)
    if (next === expectedNext) {
      pass(`${path} logged-out return path`, next)
    } else {
      fail(`${path} logged-out return path`, `expected ${expectedNext}, got ${next || "missing"}`)
    }
  } else {
    fail(
      `${path} logged-out protection`,
      `status=${result.response.status}; location=${result.response.headers?.get?.("location") ?? "none"}`,
    )
  }

  if (hasNoStoreHeader(result.response)) {
    pass(`${path} protected no-store cache header`)
  } else {
    fail(`${path} protected no-store cache header`, result.response.headers?.get?.("cache-control") || "missing")
  }
}

const signupSafeNext = "/search?q=John&state=FL"
const signupWithSafeNext = await read(`/signup?next=${encodeURIComponent(signupSafeNext)}`)
if (signupWithSafeNext.response.ok) {
  const nextValue = hiddenInputValue(signupWithSafeNext.text, "next")

  if (nextValue === signupSafeNext) {
    pass("/signup preserves safe product return path", nextValue)
  } else {
    fail("/signup preserves safe product return path", `expected ${signupSafeNext}, got ${nextValue || "missing"}`)
  }
} else {
  fail("/signup preserves safe product return path", signupWithSafeNext.error || String(signupWithSafeNext.response.status))
}

const signupWithAdminNext = await read(`/signup?next=${encodeURIComponent("/admin/reports")}`)
if (signupWithAdminNext.response.ok) {
  const nextValue = hiddenInputValue(signupWithAdminNext.text, "next")

  if (nextValue === "/dashboard") {
    pass("/signup blocks privileged return path", nextValue)
  } else {
    fail("/signup blocks privileged return path", `expected /dashboard, got ${nextValue || "missing"}`)
  }
} else {
  fail("/signup blocks privileged return path", signupWithAdminNext.error || String(signupWithAdminNext.response.status))
}

const mobileApp = await read("/mobile-app")
if (mobileApp.response.ok) {
  pass("/mobile-app returns 200")
  assertProductionCopySafety("/mobile-app", mobileApp.text)

  const mobileVisible = visiblePageText(mobileApp.text)

  if (expectedMobileRelease.version) {
    if (mobileVisible.includes(expectedMobileRelease.version)) {
      pass("/mobile-app current mobile version", expectedMobileRelease.version)
    } else {
      fail("/mobile-app current mobile version", expectedMobileRelease.version)
    }
  } else {
    warn("/mobile-app current mobile version", "local mobile release metadata could not be read")
  }

  if (expectedMobileRelease.androidBuild) {
    const expectedBuildLabel = `Release build: ${expectedMobileRelease.androidBuild}`

    if (mobileVisible.includes(expectedBuildLabel)) {
      pass("/mobile-app current Android build", expectedMobileRelease.androidBuild)
    } else {
      fail("/mobile-app current Android build", expectedBuildLabel)
    }
  } else {
    warn("/mobile-app current Android build", "local Android build metadata could not be read")
  }

  const staleMobileMarkers = [
    "vg42czKjtB79CQnxdg3JBr.apk",
    "pQPHajdAPswqN8UikHR5e8.aab",
    "0.3.6",
    "versionCode 7",
  ]
  const staleMobileMarkersFound = staleMobileMarkers.filter((marker) => mobileApp.text.includes(marker))

  if (staleMobileMarkersFound.length === 0) {
    pass("/mobile-app avoids stale Android release artifacts")
  } else {
    fail("/mobile-app avoids stale Android release artifacts", staleMobileMarkersFound.join(", "))
  }
} else {
  fail("/mobile-app returns 200", mobileApp.error || String(mobileApp.response.status))
}

const home = await read("/")
if (home.response.ok) {
  assertProductionCopySafety("/", home.text)

  const homeCanonical = canonical(home.text)
  if (homeCanonical === expectedSiteUrl || homeCanonical === `${expectedSiteUrl}/`) {
    pass("Homepage canonical", homeCanonical)
  } else {
    fail("Homepage canonical", homeCanonical)
  }
}

const sitemap = await read("/sitemap.xml")
const profiles = sitemap.response.ok ? sitemapProfilePaths(sitemap.text) : []
const entityProfiles = sitemap.response.ok ? sitemapEntityProfilePaths(sitemap.text) : []
if (profiles.length > 0) {
  pass("Sitemap includes public profiles", `${profiles.length} profile URL(s)`)
} else {
  fail("Sitemap includes public profiles")
}

if (entityProfiles.length > 0) {
  pass("Sitemap includes unified profile graph routes", `${entityProfiles.length} graph profile URL(s)`)
} else {
  fail("Sitemap includes unified profile graph routes")
}

for (const profilePath of profiles.slice(0, 5)) {
  const profile = await read(profilePath)

  if (!profile.response.ok) {
    fail(`${profilePath} returns 200`, profile.error || String(profile.response.status))
    continue
  }

  pass(`${profilePath} returns 200`)

  if (profile.text.includes("Client Profile Not Found")) {
    fail(`${profilePath} renders real profile`, "Client Profile Not Found")
  } else {
    pass(`${profilePath} renders real profile`)
  }

  if (profile.text.includes("Loading public client profile")) {
    fail(`${profilePath} initial HTML`, "loading shell found")
  } else {
    pass(`${profilePath} initial HTML`, "profile content is server-visible")
  }

  if (containsPrivateIdentifier(profile.text)) {
    fail(`${profilePath} public privacy scan`, "private identifier or evidence marker found")
  } else {
    pass(`${profilePath} public privacy scan`)
  }

  assertProductionCopySafety(profilePath, profile.text)

  const profileCanonical = canonical(profile.text)
  if (profileCanonical === `${expectedSiteUrl}${profilePath}`) {
    pass(`${profilePath} canonical`, profileCanonical)
  } else {
    fail(`${profilePath} canonical`, profileCanonical)
  }
}

for (const profilePath of entityProfiles.slice(0, 5)) {
  const profile = await read(profilePath)

  if (!profile.response.ok) {
    fail(`${profilePath} returns 200`, profile.error || String(profile.response.status))
    continue
  }

  pass(`${profilePath} returns 200`)

  if (profile.text.includes("Loading public") || profile.text.includes("Profile Not Found")) {
    fail(`${profilePath} renders real unified profile`, "loading shell or not-found text found")
  } else {
    pass(`${profilePath} renders real unified profile`)
  }

  if (containsPrivateIdentifier(profile.text)) {
    fail(`${profilePath} public privacy scan`, "private identifier or evidence marker found")
  } else {
    pass(`${profilePath} public privacy scan`)
  }

  assertProductionCopySafety(profilePath, profile.text)

  const profileCanonical = canonical(profile.text)
  if (profileCanonical === `${expectedSiteUrl}${profilePath}`) {
    pass(`${profilePath} canonical`, profileCanonical)
  } else {
    fail(`${profilePath} canonical`, profileCanonical)
  }
}

const linkSources = [
  "/clients",
  "/reports/recent",
  "/reports/non-payment",
  "/reports/high-risk",
  "/industries/contractors",
  "/industries/service-businesses",
]
const checkedProfileLinks = new Map()

for (const sourcePath of linkSources) {
  const source = await read(sourcePath)
  if (!source.response.ok) {
    fail(`${sourcePath} returns 200`, source.error || String(source.response.status))
    continue
  }

  for (const profilePath of new Set(clientProfileLinks(source.text))) {
    if (checkedProfileLinks.has(profilePath)) continue

    const linkedProfile = await read(profilePath)
    const ok =
      linkedProfile.response.ok &&
      !linkedProfile.text.includes("Client Profile Not Found") &&
      !linkedProfile.text.includes("Loading public client profile")

    checkedProfileLinks.set(profilePath, ok)
  }
}

const brokenProfileLinks = [...checkedProfileLinks.entries()]
  .filter(([, ok]) => !ok)
  .map(([path]) => path)

if (brokenProfileLinks.length === 0) {
  pass("Public landing pages link only to available profiles", `${checkedProfileLinks.size} profile link(s) checked`)
} else {
  fail("Public landing pages link only to available profiles", brokenProfileLinks.join(", "))
}

for (const check of checks) {
  console.log(`${check.level} ${check.name}${check.detail ? ` - ${check.detail}` : ""}`)
}

if (checks.some((check) => check.level === "FAIL")) {
  if (staleReleaseDetails.length > 0) {
    console.log("")
    console.log("STALE RELEASE DETECTED")
    for (const detail of staleReleaseDetails) {
      console.log(`- ${detail}`)
    }
    console.log("")
    console.log("Run this on the VPS:")
    console.log("  curl -fsSL https://raw.githubusercontent.com/dff280/ClientBureau/main/scripts/vps-deploy.sh | bash")
    console.log("")
    console.log("Then rerun locally:")
    console.log("  npm run verify:live")
  }

  process.exit(1)
}
