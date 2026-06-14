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
  const url = /^https?:\/\//i.test(path) ? path : `${baseUrl}${path}`

  try {
    const response = await fetch(url, {
      method: options.method ?? "GET",
      headers: {
        "User-Agent": "ClientBureauReleaseVerifier/1.0",
        ...(options.headers ?? {}),
      },
      body: options.body,
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

function metaContent(html, name) {
  const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) => match[0])
  const meta = metas.find((tag) => {
    const metaName = extract(tag, /\bname=["']([^"']+)["']/i)

    return metaName.toLowerCase() === name.toLowerCase()
  })

  return meta ? decodeHtmlAttribute(extract(meta, /\bcontent=["']([^"']*)["']/i)) : ""
}

function linkParamValues(html, pathname, paramName) {
  const anchors = [...html.matchAll(/<a\b[^>]*>/gi)].map((match) => match[0])

  return anchors
    .map((tag) => decodeHtmlAttribute(extract(tag, /\bhref=["']([^"']+)["']/i)))
    .map((value) => {
      try {
        return new URL(value, expectedSiteUrl)
      } catch {
        return null
      }
    })
    .filter((url) => url?.pathname === pathname)
    .map((url) => url?.searchParams.get(paramName) ?? "")
    .filter(Boolean)
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

function businessProfileLinks(html) {
  return [...html.matchAll(/href=["']([^"']*\/business\/[^"']+)["']/gi)]
    .map((match) => {
      try {
        return new URL(match[1], expectedSiteUrl).pathname
      } catch {
        return ""
      }
    })
    .filter((path) => path && path !== "/businesses")
}

function claimProfileLinks(html) {
  return [...html.matchAll(/href=["']([^"']*\/claim-profile\?[^"']+)["']/gi)]
    .map((match) => {
      try {
        return new URL(decodeHtmlAttribute(match[1]), expectedSiteUrl)
      } catch {
        return null
      }
    })
    .filter(Boolean)
}

function sitemapProfilePaths(xml) {
  return [...xml.matchAll(/<loc>https?:\/\/[^<]+(\/client\/[^<]+)<\/loc>/gi)].map((match) => match[1])
}

function sitemapEntityProfilePaths(xml) {
  return [...xml.matchAll(/<loc>https?:\/\/[^<]+(\/profiles\/(?:client|contractor|subcontractor)\/[^<\/]+)<\/loc>/gi)].map((match) => match[1])
}

function sitemapLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1])
}

function isPrivateCrawlPath(pathname) {
  return [
    "/admin",
    "/api",
    "/auth",
    "/dashboard",
    "/login",
    "/signup",
    "/search",
    "/submit-report",
    "/client-response",
    "/contract/",
  ].some((prefix) => pathname === prefix || pathname.startsWith(prefix))
}

function hasNoStoreHeader(response) {
  const cacheControl = response.headers?.get?.("cache-control") ?? ""

  return /no-store/i.test(cacheControl)
}

function headerContains(response, headerName, expectedValue) {
  const value = response.headers?.get?.(headerName) ?? ""

  return value.toLowerCase().includes(expectedValue.toLowerCase())
}

function hasHeader(response, headerName) {
  return Boolean(response.headers?.get?.(headerName))
}

function isRedirectResponse(response) {
  const status = Number(response.status)

  return status >= 300 && status < 400
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

function containsPrivateDataMarker(html) {
  const visible = visibleHtml(html)

  return /storage\/v1\/object|report-evidence|signed_snapshot|internal admin note/i.test(visible)
}

function assertProductionCopySafety(path, html) {
  const leaks = findProductionCopyLeaks(html)

  if (leaks.length === 0) {
    pass(`${path} production copy safety`)
  } else {
    fail(`${path} production copy safety`, leaks.join(", "))
  }
}

function assertPublicIndexablePage(path, html, requiredTexts) {
  assertProductionCopySafety(path, html)

  const robots = metaContent(html, "robots").toLowerCase()
  if (robots.includes("index") && robots.includes("follow") && !robots.includes("noindex") && !robots.includes("nofollow")) {
    pass(`${path} index/follow robots metadata`, robots)
  } else {
    fail(`${path} index/follow robots metadata`, robots || "missing")
  }

  const pageCanonical = canonical(html)
  if (pageCanonical === `${expectedSiteUrl}${path}`) {
    pass(`${path} canonical`, pageCanonical)
  } else {
    fail(`${path} canonical`, pageCanonical || "missing")
  }

  const visibleText = visiblePageText(html)
  for (const requiredText of requiredTexts) {
    if (visibleText.includes(requiredText)) {
      pass(`${path} server-visible content ${requiredText.slice(0, 60)}`)
    } else {
      fail(`${path} server-visible content ${requiredText.slice(0, 60)}`, "missing")
    }
  }

  if (containsPrivateIdentifier(html)) {
    fail(`${path} public privacy scan`, "private identifier or evidence marker found")
  } else {
    pass(`${path} public privacy scan`)
  }
}

function assertNoindexPage(path, html, requiredTexts) {
  assertProductionCopySafety(path, html)

  const robots = metaContent(html, "robots").toLowerCase()
  if (robots.includes("noindex") && robots.includes("nofollow")) {
    pass(`${path} noindex/nofollow robots metadata`, robots)
  } else {
    fail(`${path} noindex/nofollow robots metadata`, robots || "missing")
  }

  const pageCanonical = canonical(html)
  if (pageCanonical === `${expectedSiteUrl}${path}`) {
    pass(`${path} canonical`, pageCanonical)
  } else {
    fail(`${path} canonical`, pageCanonical || "missing")
  }

  const visibleText = visiblePageText(html)
  for (const requiredText of requiredTexts) {
    if (visibleText.includes(requiredText)) {
      pass(`${path} server-visible content ${requiredText.slice(0, 60)}`)
    } else {
      fail(`${path} server-visible content ${requiredText.slice(0, 60)}`, "missing")
    }
  }

  if (containsPrivateDataMarker(html)) {
    fail(`${path} private-data marker scan`, "private evidence or internal marker found")
  } else {
    pass(`${path} private-data marker scan`)
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

const authTransitionChecks = [
  {
    name: "/api/auth/login invalid credentials",
    path: "/api/auth/login",
    method: "POST",
    body: new URLSearchParams({
      email: "release-verifier@example.invalid",
      password: "invalid-release-verifier-password",
      next: "/dashboard",
    }),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  },
  {
    name: "/api/auth/logout",
    path: "/api/auth/logout",
    method: "GET",
  },
]

for (const check of authTransitionChecks) {
  const result = await read(check.path, {
    method: check.method,
    headers: check.headers,
    body: check.body,
    redirect: "manual",
  })

  if (isRedirectResponse(result.response)) {
    pass(`${check.name} redirects safely`, result.response.headers?.get?.("location") ?? "redirect")
  } else {
    fail(
      `${check.name} redirects safely`,
      `status=${result.response.status}; location=${result.response.headers?.get?.("location") ?? "none"}`,
    )
  }

  if (hasNoStoreHeader(result.response)) {
    pass(`${check.name} no-store cache header`)
  } else {
    fail(`${check.name} no-store cache header`, result.response.headers?.get?.("cache-control") || "missing")
  }
}

const mobilePrivatePaths = [
  "/api/mobile/me",
  "/api/mobile/dashboard",
  "/api/mobile/search",
  "/api/mobile/saved-searches",
  "/api/mobile/reports",
  "/api/mobile/contracts",
  "/api/mobile/recovery",
  "/api/mobile/lien-service",
  "/api/mobile/evidence",
  "/api/mobile/watchlist",
]

for (const path of mobilePrivatePaths) {
  const result = await read(path)

  if (result.response.status === 401) {
    pass(`${path} bearer-token protection`, "401 without mobile token")
  } else {
    fail(`${path} bearer-token protection`, `expected 401, got ${result.response.status}`)
  }

  if (hasNoStoreHeader(result.response)) {
    pass(`${path} mobile no-store cache header`)
  } else {
    fail(`${path} mobile no-store cache header`, result.response.headers?.get?.("cache-control") || "missing")
  }
}

const mobilePrivateMutationPaths = [
  "/api/mobile/saved-searches",
  "/api/mobile/reports",
  "/api/mobile/contracts",
  "/api/mobile/recovery",
  "/api/mobile/lien-service",
  "/api/mobile/evidence",
  "/api/mobile/watchlist",
]

for (const path of mobilePrivateMutationPaths) {
  const result = await read(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  })

  if (result.response.status === 401) {
    pass(`${path} mobile mutation bearer-token protection`, "401 without mobile token")
  } else {
    fail(`${path} mobile mutation bearer-token protection`, `expected 401, got ${result.response.status}`)
  }

  if (hasNoStoreHeader(result.response)) {
    pass(`${path} mobile mutation no-store cache header`)
  } else {
    fail(`${path} mobile mutation no-store cache header`, result.response.headers?.get?.("cache-control") || "missing")
  }
}

for (const path of ["/", "/robots.txt", "/sitemap.xml", "/llms.txt", "/ai-index.json"]) {
  const result = await read(path)
  if (result.response.ok) pass(`${path} returns 200`)
  else fail(`${path} returns 200`, result.error || String(result.response.status))
}

const robots = await read("/robots.txt")
if (robots.response.ok) {
  const robotsRequiredRules = [
    "User-Agent: *",
    "Allow: /",
    "Allow: /client/",
    "Allow: /clients",
    "Allow: /business/",
    "Allow: /businesses",
    "Allow: /profiles",
    "Disallow: /dashboard",
    "Disallow: /submit-report",
    "Disallow: /client-response",
    "Disallow: /login",
    "Disallow: /signup",
    "Disallow: /admin/",
    "Disallow: /search",
    `Sitemap: ${expectedSiteUrl}/sitemap.xml`,
  ]

  for (const rule of robotsRequiredRules) {
    if (robots.text.includes(rule)) {
      pass(`/robots.txt rule ${rule}`)
    } else {
      fail(`/robots.txt rule ${rule}`, "missing")
    }
  }
} else {
  fail("/robots.txt content checks", robots.error || String(robots.response.status))
}

const sitemapForCrawlRules = await read("/sitemap.xml")
if (sitemapForCrawlRules.response.ok) {
  const locs = sitemapLocs(sitemapForCrawlRules.text)
  const nonCanonicalLocs = locs.filter((loc) => !loc.startsWith(expectedSiteUrl))
  const privateLocs = locs.filter((loc) => {
    try {
      const pathname = new URL(loc).pathname

      return isPrivateCrawlPath(pathname)
    } catch {
      return true
    }
  })

  if (locs.length > 0) {
    pass("/sitemap.xml loc entries", `${locs.length} URL(s)`)
  } else {
    fail("/sitemap.xml loc entries", "no URLs found")
  }

  if (nonCanonicalLocs.length === 0) {
    pass("/sitemap.xml canonical host URLs")
  } else {
    fail("/sitemap.xml canonical host URLs", nonCanonicalLocs.slice(0, 5).join(", "))
  }

  if (privateLocs.length === 0) {
    pass("/sitemap.xml excludes private routes")
  } else {
    fail("/sitemap.xml excludes private routes", privateLocs.slice(0, 5).join(", "))
  }
} else {
  fail("/sitemap.xml crawl privacy checks", sitemapForCrawlRules.error || String(sitemapForCrawlRules.response.status))
}

const llmsTxt = await read("/llms.txt")
if (llmsTxt.response.ok) {
  if (headerContains(llmsTxt.response, "content-type", "text/plain")) {
    pass("/llms.txt content type", llmsTxt.response.headers?.get?.("content-type") ?? "")
  } else {
    fail("/llms.txt content type", llmsTxt.response.headers?.get?.("content-type") || "missing")
  }

  const llmsRequiredTexts = [
    "# Client Bureau",
    "Check the client before you take the job.",
    `${expectedSiteUrl}/pricing`,
    `${expectedSiteUrl}/how-it-works`,
    `${expectedSiteUrl}/clients`,
    `${expectedSiteUrl}/profiles`,
    `${expectedSiteUrl}/profiles/contractor`,
    `${expectedSiteUrl}/mobile-app`,
    `${expectedSiteUrl}/payment-recovery-service`,
    `${expectedSiteUrl}/florida-lien-filing-service`,
    "documented contractor and business-owner experiences",
    "private phone numbers, emails, street addresses, raw evidence files, internal admin notes, or unapproved submissions",
  ]

  for (const expectedText of llmsRequiredTexts) {
    if (llmsTxt.text.includes(expectedText)) {
      pass(`/llms.txt content ${expectedText.slice(0, 60)}`)
    } else {
      fail(`/llms.txt content ${expectedText.slice(0, 60)}`, "missing")
    }
  }

  const privateLlmsLinks = [...llmsTxt.text.matchAll(/https:\/\/clientbureau\.com([^\s)]+)/g)]
    .map((match) => match[1])
    .filter((pathname) => isPrivateCrawlPath(pathname))

  if (privateLlmsLinks.length === 0) {
    pass("/llms.txt excludes private links")
  } else {
    fail("/llms.txt excludes private links", privateLlmsLinks.slice(0, 5).join(", "))
  }
} else {
  fail("/llms.txt content checks", llmsTxt.error || String(llmsTxt.response.status))
}

const aiIndex = await readJson("/ai-index.json")
if (aiIndex.response.ok && aiIndex.json) {
  pass("/ai-index.json parses as JSON")

  if (headerContains(aiIndex.response, "content-type", "application/json")) {
    pass("/ai-index.json content type", aiIndex.response.headers?.get?.("content-type") ?? "")
  } else {
    fail("/ai-index.json content type", aiIndex.response.headers?.get?.("content-type") || "missing")
  }

  const aiPublicPages = Array.isArray(aiIndex.json.publicPages) ? aiIndex.json.publicPages : []
  const aiUrls = aiPublicPages.map((page) => String(page?.url ?? "")).filter(Boolean)

  const aiRequiredFields = [
    ["name", "Client Bureau"],
    ["url", expectedSiteUrl],
    ["positioning", "Check the client before you take the job."],
  ]

  for (const [field, expectedValue] of aiRequiredFields) {
    if (aiIndex.json[field] === expectedValue) {
      pass(`/ai-index.json field ${field}`, expectedValue)
    } else {
      fail(`/ai-index.json field ${field}`, `expected ${expectedValue}, got ${aiIndex.json[field] ?? "missing"}`)
    }
  }

  for (const requiredPhrase of ["documented contractor experiences", "moderated summaries", "evidence reviewed privately"]) {
    if (aiIndex.json.safeLanguage?.includes?.(requiredPhrase)) {
      pass(`/ai-index.json safe language ${requiredPhrase}`)
    } else {
      fail(`/ai-index.json safe language ${requiredPhrase}`, "missing")
    }
  }

  const privacyRulesText = Array.isArray(aiIndex.json.privacyRules) ? aiIndex.json.privacyRules.join(" ") : ""
  for (const requiredPhrase of ["raw emails", "phone numbers", "private addresses", "raw evidence files", "pending reports", "internal admin notes"]) {
    if (privacyRulesText.includes(requiredPhrase)) {
      pass(`/ai-index.json privacy rule ${requiredPhrase}`)
    } else {
      fail(`/ai-index.json privacy rule ${requiredPhrase}`, "missing")
    }
  }

  for (const requiredUrl of [`${expectedSiteUrl}/`, `${expectedSiteUrl}/pricing`, `${expectedSiteUrl}/clients`, `${expectedSiteUrl}/mobile-app`]) {
    if (aiUrls.includes(requiredUrl)) {
      pass(`/ai-index.json public page ${requiredUrl}`)
    } else {
      fail(`/ai-index.json public page ${requiredUrl}`, "missing")
    }
  }

  const nonCanonicalAiUrls = aiUrls.filter((url) => !url.startsWith(expectedSiteUrl))
  const privateAiUrls = aiPublicPages.filter((page) => {
    try {
      const pathname = new URL(String(page?.url ?? "")).pathname

      if (pathname === "/search" && page?.indexable === false) return false

      return isPrivateCrawlPath(pathname)
    } catch {
      return true
    }
  })

  if (nonCanonicalAiUrls.length === 0) {
    pass("/ai-index.json canonical host URLs")
  } else {
    fail("/ai-index.json canonical host URLs", nonCanonicalAiUrls.slice(0, 5).join(", "))
  }

  if (privateAiUrls.length === 0) {
    pass("/ai-index.json excludes private indexed pages")
  } else {
    fail("/ai-index.json excludes private indexed pages", privateAiUrls.slice(0, 5).map((page) => page.url).join(", "))
  }
} else {
  fail("/ai-index.json parses as JSON", aiIndex.error || String(aiIndex.response.status))
}

const securityTxt = await read("/.well-known/security.txt")
if (securityTxt.response.ok) {
  pass("/.well-known/security.txt returns 200")

  if (headerContains(securityTxt.response, "content-type", "text/plain")) {
    pass("/.well-known/security.txt content type", securityTxt.response.headers?.get?.("content-type") ?? "")
  } else {
    fail(
      "/.well-known/security.txt content type",
      securityTxt.response.headers?.get?.("content-type") || "missing",
    )
  }

  const securityTxtChecks = [
    ["security contact email", "Contact: mailto:admin@clientbureau.com"],
    ["security contact page", `Contact: ${expectedSiteUrl}/contact`],
    ["security preferred language", "Preferred-Languages: en"],
    ["security canonical", `Canonical: ${expectedSiteUrl}/.well-known/security.txt`],
    ["security policy", `Policy: ${expectedSiteUrl}/privacy`],
  ]

  for (const [label, expectedText] of securityTxtChecks) {
    if (securityTxt.text.includes(expectedText)) {
      pass(`/.well-known/security.txt ${label}`)
    } else {
      fail(`/.well-known/security.txt ${label}`, `${expectedText} missing`)
    }
  }

  const expiresText = extract(securityTxt.text, /^Expires:\s*(.+)$/im)
  const expiresTime = Date.parse(expiresText)
  if (expiresText && Number.isFinite(expiresTime) && expiresTime > Date.now()) {
    pass("/.well-known/security.txt future expiry", expiresText)
  } else {
    fail("/.well-known/security.txt future expiry", expiresText || "missing")
  }

  if (headerContains(securityTxt.response, "cache-control", "max-age=86400")) {
    pass("/.well-known/security.txt cache policy", securityTxt.response.headers?.get?.("cache-control") ?? "")
  } else {
    fail(
      "/.well-known/security.txt cache policy",
      securityTxt.response.headers?.get?.("cache-control") || "missing",
    )
  }
} else {
  fail("/.well-known/security.txt returns 200", securityTxt.error || String(securityTxt.response.status))
}

const homepageForHeaders = await read("/")
if (homepageForHeaders.response.ok) {
  const securityHeaderChecks = [
    ["Strict-Transport-Security", "max-age=31536000"],
    ["Strict-Transport-Security", "includeSubDomains"],
    ["Strict-Transport-Security", "preload"],
    ["Content-Security-Policy", "default-src 'self'"],
    ["Content-Security-Policy", "frame-ancestors 'none'"],
    ["Content-Security-Policy", "object-src 'none'"],
    ["X-Content-Type-Options", "nosniff"],
    ["X-Frame-Options", "DENY"],
    ["Referrer-Policy", "strict-origin-when-cross-origin"],
    ["Permissions-Policy", "camera=()"],
    ["Permissions-Policy", "microphone=()"],
    ["Permissions-Policy", "geolocation=()"],
    ["Permissions-Policy", "payment=()"],
    ["Permissions-Policy", "usb=()"],
    ["Cross-Origin-Opener-Policy", "same-origin-allow-popups"],
    ["Cross-Origin-Resource-Policy", "same-origin"],
    ["X-Permitted-Cross-Domain-Policies", "none"],
  ]

  for (const [headerName, expectedValue] of securityHeaderChecks) {
    if (headerContains(homepageForHeaders.response, headerName, expectedValue)) {
      pass(`Security header ${headerName}`, expectedValue)
    } else {
      fail(
        `Security header ${headerName}`,
        `${expectedValue} missing from ${homepageForHeaders.response.headers?.get?.(headerName) || "missing"}`,
      )
    }
  }

  for (const headerName of ["Server", "X-Powered-By"]) {
    if (hasHeader(homepageForHeaders.response, headerName)) {
      fail(`Sensitive header ${headerName}`, homepageForHeaders.response.headers?.get?.(headerName) ?? "present")
    } else {
      pass(`Sensitive header ${headerName}`, "not exposed")
    }
  }
} else {
  fail("Security header source page", homepageForHeaders.error || String(homepageForHeaders.response.status))
}

const siteUrlForRedirects = new URL(expectedSiteUrl)
if (siteUrlForRedirects.protocol === "https:" && siteUrlForRedirects.hostname === "clientbureau.com") {
  const wwwRedirectPath = "/search?q=John"
  const wwwRedirect = await read(`https://www.clientbureau.com${wwwRedirectPath}`, { redirect: "manual" })
  const location = wwwRedirect.response.headers?.get?.("location") ?? ""

  if (isRedirectResponse(wwwRedirect.response) && location === `${expectedSiteUrl}${wwwRedirectPath}`) {
    pass("Canonical www redirect", location)
  } else {
    fail(
      "Canonical www redirect",
      `status=${wwwRedirect.response.status}; location=${location || "missing"}`,
    )
  }
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

const loginSafeNext = "/dashboard/reports"
const loginWithSafeNext = await read(`/login?next=${encodeURIComponent(loginSafeNext)}`)
if (loginWithSafeNext.response.ok) {
  assertNoindexPage("/login", loginWithSafeNext.text, [
    "Secure account access",
    "Return to your business protection workspace.",
    "Sign in to Client Bureau",
  ])

  const nextValue = hiddenInputValue(loginWithSafeNext.text, "next")
  const signupNextValues = linkParamValues(loginWithSafeNext.text, "/signup", "next")

  if (nextValue === loginSafeNext) {
    pass("/login preserves safe return path", nextValue)
  } else {
    fail("/login preserves safe return path", `expected ${loginSafeNext}, got ${nextValue || "missing"}`)
  }

  if (signupNextValues.includes(loginSafeNext)) {
    pass("/login create-account link preserves return path", loginSafeNext)
  } else {
    fail(
      "/login create-account link preserves return path",
      `expected ${loginSafeNext}, got ${signupNextValues.length > 0 ? signupNextValues.join(", ") : "missing"}`,
    )
  }
} else {
  fail("/login preserves safe return path", loginWithSafeNext.error || String(loginWithSafeNext.response.status))
}

const loginWithUnsafeNext = await read(`/login?next=${encodeURIComponent("https://evil.example/dashboard")}`)
if (loginWithUnsafeNext.response.ok) {
  const nextValue = hiddenInputValue(loginWithUnsafeNext.text, "next")
  const signupNextValues = linkParamValues(loginWithUnsafeNext.text, "/signup", "next")

  if (!nextValue && signupNextValues.length === 0) {
    pass("/login blocks unsafe return path", "no hidden next or signup next preserved")
  } else {
    fail(
      "/login blocks unsafe return path",
      `hidden=${nextValue || "missing"}; signup=${signupNextValues.length > 0 ? signupNextValues.join(", ") : "missing"}`,
    )
  }
} else {
  fail("/login blocks unsafe return path", loginWithUnsafeNext.error || String(loginWithUnsafeNext.response.status))
}

const signupSafeNext = "/search?q=John&state=FL"
const signupWithSafeNext = await read(`/signup?next=${encodeURIComponent(signupSafeNext)}`)
if (signupWithSafeNext.response.ok) {
  assertNoindexPage("/signup", signupWithSafeNext.text, [
    "Business protection account",
    "Create the account that helps protect your next job.",
    "Create your Client Bureau account",
  ])

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

  if (!nextValue) {
    pass("/signup blocks privileged return path", "no hidden next preserved")
  } else {
    fail("/signup blocks privileged return path", `expected no hidden next, got ${nextValue}`)
  }
} else {
  fail("/signup blocks privileged return path", signupWithAdminNext.error || String(signupWithAdminNext.response.status))
}

const clientResponse = await read("/client-response")
if (clientResponse.response.ok) {
  pass("/client-response returns 200")
  assertNoindexPage("/client-response", clientResponse.text, [
    "Client response",
    "Respond, dispute, correct, or update a Client Bureau profile.",
    "Fairness is part of the product.",
  ])
} else {
  fail("/client-response returns 200", clientResponse.error || String(clientResponse.response.status))
}

const searchPath = "/search?q=John&state=FL"
const searchPage = await read(searchPath)
if (searchPage.response.ok) {
  pass("/search returns 200")
  assertProductionCopySafety("/search", searchPage.text)

  const searchRobots = metaContent(searchPage.text, "robots").toLowerCase()
  if (searchRobots.includes("noindex") && searchRobots.includes("nofollow")) {
    pass("/search noindex/nofollow robots metadata", searchRobots)
  } else {
    fail("/search noindex/nofollow robots metadata", searchRobots || "missing")
  }

  const searchCanonical = canonical(searchPage.text)
  if (searchCanonical === `${expectedSiteUrl}/search`) {
    pass("/search canonical", searchCanonical)
  } else {
    fail("/search canonical", searchCanonical || "missing")
  }

  const visibleSearch = visiblePageText(searchPage.text)
  const requiredSearchTexts = [
    "Check a Client Before You Take the Job.",
    "Server-verified results",
    "Client check guide",
    "Public results show approved context only",
    "Report a Client Experience",
  ]

  for (const requiredText of requiredSearchTexts) {
    if (visibleSearch.includes(requiredText)) {
      pass(`/search server-visible content ${requiredText.slice(0, 60)}`)
    } else {
      fail(`/search server-visible content ${requiredText.slice(0, 60)}`, "missing")
    }
  }

  const searchSignupNextValues = linkParamValues(searchPage.text, "/signup", "next")
  if (searchSignupNextValues.includes(searchPath)) {
    pass("/search create-account link preserves query", searchPath)
  } else {
    fail(
      "/search create-account link preserves query",
      searchSignupNextValues.length > 0 ? searchSignupNextValues.join(", ") : "missing",
    )
  }

  if (containsPrivateIdentifier(searchPage.text)) {
    fail("/search public privacy scan", "private identifier or evidence marker found")
  } else {
    pass("/search public privacy scan")
  }
} else {
  fail("/search returns 200", searchPage.error || String(searchPage.response.status))
}

const mobileApp = await read("/mobile-app")
if (mobileApp.response.ok) {
  pass("/mobile-app returns 200")
  assertPublicIndexablePage("/mobile-app", mobileApp.text, [
    "Client Bureau Android",
    "Client checks and job-protection tools from the field.",
    "Release access is routed through Client Bureau support",
  ])

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

const publicIndexablePages = [
  {
    path: "/clients",
    requiredTexts: [
      "Public client directory",
      "Browse approved Client Bureau profiles by state and city.",
      "Pending, rejected, private evidence, raw email, phone",
    ],
  },
  {
    path: "/clients/florida/orlando",
    requiredTexts: [
      "City client directory",
      "Orlando, FL Client Bureau profiles",
      "Public pages show moderated contractor-submitted reports",
    ],
  },
  {
    path: "/reports/recent",
    requiredTexts: [
      "Recent moderated client reports",
      "Private identifiers, raw evidence files, and unapproved submissions are not displayed.",
      "Approved Only",
    ],
  },
  {
    path: "/reports/non-payment",
    requiredTexts: [
      "Reported non-payment client reports",
      "approved public summaries",
      "Approved Only",
    ],
  },
  {
    path: "/businesses",
    requiredTexts: [
      "Business trust profiles",
      "Find verified contractors and service business owners.",
      "not customer star reviews or guarantees",
    ],
  },
  {
    path: "/profiles",
    requiredTexts: [
      "Unified profile directory",
      "Search public profiles for clients, contractors, and subcontractors.",
      "All public profiles",
    ],
  },
  {
    path: "/profiles/contractor",
    requiredTexts: [
      "Contractor profiles",
      "Find contractor and service business profiles.",
      "Contractors and service businesses",
    ],
  },
  {
    path: "/profiles/subcontractor",
    requiredTexts: [
      "Subcontractor profiles",
      "Find subcontractor and trade professional profiles.",
      "Subcontractors and trade pros",
    ],
  },
  {
    path: "/payment-recovery-service",
    requiredTexts: [
      "Managed Resolution Desk",
      "Get help recovering payment without turning the dispute public.",
      "Contractor-direct payment tracking",
    ],
  },
  {
    path: "/florida-lien-notice-service",
    requiredTexts: [
      "Florida lien notice workflow",
      "Prepare Florida lien notices with review, authorization, and delivery tracking.",
      "Delivery proof tracking",
    ],
  },
  {
    path: "/florida-lien-filing-service",
    requiredTexts: [
      "Florida claim of lien filing",
      "File Florida lien cases through a managed, review-gated workflow.",
      "Attorney/vendor review",
    ],
  },
  {
    path: "/contractor-contract-template",
    requiredTexts: [
      "Agreement packets",
      "Contractor Contract Template and E-Signature Workflow",
      "scope, payment terms, exclusions",
    ],
  },
  {
    path: "/change-order-template",
    requiredTexts: [
      "Scope protection",
      "Contractor Change Order Template",
      "Scope changes are where many jobs become payment disputes.",
    ],
  },
  {
    path: "/mobile-app",
    requiredTexts: [
      "Client Bureau Android",
      "Client checks and job-protection tools from the field.",
      "Current mobile release",
    ],
  },
  {
    path: "/claim-profile",
    requiredTexts: [
      "Business profile claiming",
      "Claim your Client Bureau business profile.",
      "Business verification status",
    ],
  },
]

for (const page of publicIndexablePages) {
  const result = await read(page.path)

  if (result.response.ok) {
    pass(`${page.path} returns 200`)
    assertPublicIndexablePage(page.path, result.text, page.requiredTexts)
  } else {
    fail(`${page.path} returns 200`, result.error || String(result.response.status))
  }
}

const sitemap = await read("/sitemap.xml")
const profiles = sitemap.response.ok ? sitemapProfilePaths(sitemap.text) : []
const entityProfiles = sitemap.response.ok ? sitemapEntityProfilePaths(sitemap.text) : []
const sitemapPublicLocs = sitemap.response.ok ? sitemapLocs(sitemap.text) : []
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

for (const page of publicIndexablePages) {
  const expectedLoc = `${expectedSiteUrl}${page.path}`

  if (sitemapPublicLocs.includes(expectedLoc)) {
    pass(`Sitemap includes ${page.path}`, expectedLoc)
  } else {
    fail(`Sitemap includes ${page.path}`, "missing")
  }
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

const businessesPageForClaim = await read("/businesses")

if (!businessesPageForClaim.response.ok) {
  fail("/businesses claim-link source returns 200", businessesPageForClaim.error || String(businessesPageForClaim.response.status))
} else {
  const businessPaths = [...new Set(businessProfileLinks(businessesPageForClaim.text))]
  const businessPath = businessPaths[0]

  if (!businessPath) {
    fail("Business directory exposes at least one public business profile link")
  } else {
    const businessProfile = await read(businessPath)

    if (!businessProfile.response.ok) {
      fail(`${businessPath} returns 200 for claim-link verification`, businessProfile.error || String(businessProfile.response.status))
    } else {
      const directClaimLinks = claimProfileLinks(businessProfile.text)
        .filter((url) => url.searchParams.get("profileType") === "contractor" && Boolean(url.searchParams.get("profileSlug")))
      const claimLink = directClaimLinks[0]

      if (claimLink) {
        pass("Business profile claim links preserve profile target", `${claimLink.pathname}${claimLink.search}`)
        const claimPage = await read(`${claimLink.pathname}${claimLink.search}`)

        if (!claimPage.response.ok) {
          fail("Direct business claim page returns 200", claimPage.error || String(claimPage.response.status))
        } else {
          pass("Direct business claim page returns 200")

          const slug = claimLink.searchParams.get("profileSlug") ?? ""
          const profileType = claimLink.searchParams.get("profileType") ?? ""
          const hiddenSlug = hiddenInputValue(claimPage.text, "profileSlug")
          const hiddenType = hiddenInputValue(claimPage.text, "profileType")
          const visibleText = visiblePageText(claimPage.text)

          if (visibleText.includes("Verify your relationship to this profile.") && visibleText.includes("Claim target")) {
            pass("Direct business claim page renders verification workflow")
          } else {
            fail("Direct business claim page renders verification workflow", "missing direct-claim copy")
          }

          if (hiddenSlug === slug && hiddenType === profileType) {
            pass("Direct business claim form preserves hidden profile target", `${hiddenType}/${hiddenSlug}`)
          } else {
            fail("Direct business claim form preserves hidden profile target", `expected ${profileType}/${slug}, got ${hiddenType}/${hiddenSlug}`)
          }
        }
      } else {
        fail("Business profile claim links preserve profile target", "missing profileType=contractor and profileSlug")
      }
    }
  }
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
