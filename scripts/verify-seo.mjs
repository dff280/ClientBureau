import { readFileSync } from "node:fs"
import { findProductionCopyLeaks, findPublicPrivateDataLeaks, visiblePageText } from "./public-copy-safety.mjs"

const baseUrl = (process.env.SEO_BASE_URL || "http://localhost:4000").replace(/\/$/, "")
const expectedSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://clientbureau.com").replace(/\/$/, "")
const mobileConfig = JSON.parse(readFileSync(new URL("../apps/mobile/app.json", import.meta.url), "utf8"))

const checks = []

function pass(name, detail = "") {
  checks.push({ ok: true, name, detail })
}

function fail(name, detail = "") {
  checks.push({ ok: false, name, detail })
}

async function read(path) {
  const response = await fetch(`${baseUrl}${path}`)
  const text = await response.text()

  return { response, text }
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

function metaContent(html, name) {
  const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) => match[0])
  const meta = metas.find((tag) => {
    const metaName = extract(tag, /\bname=["']([^"']+)["']/i)

    return metaName.toLowerCase() === name.toLowerCase()
  })

  return meta ? decodeHtmlAttribute(extract(meta, /\bcontent=["']([^"']*)["']/i)) : ""
}

function wordCount(html) {
  const text = visiblePageText(html)

  return text ? text.split(/\s+/).length : 0
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

function sitemapProfilePath(xml) {
  const match = xml.match(/<loc>https?:\/\/[^<]+(\/client\/[^<]+)<\/loc>/i)

  return match?.[1] ?? ""
}

const home = await read("/")
if (home.response.ok) pass("Homepage returns 200")
else fail("Homepage returns 200", String(home.response.status))

const title = extract(home.text, /<title>(.*?)<\/title>/is)
if (title.length >= 50 && title.length <= 60) pass("Homepage title length", `${title.length}: ${title}`)
else fail("Homepage title length", `${title.length}: ${title}`)

const description = extract(
  home.text,
  /<meta\s+name=["']description["']\s+content=["']([^"']+)["'][^>]*>/is,
)
if (description.length >= 120 && description.length <= 160) {
  pass("Homepage meta description length", `${description.length} characters`)
} else {
  fail("Homepage meta description length", `${description.length}: ${description}`)
}

const canonical = extract(home.text, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/is)
if (canonical === `${expectedSiteUrl}/` || canonical === expectedSiteUrl) pass("Homepage canonical", canonical)
else fail("Homepage canonical", canonical)

const homeCopyLeaks = findProductionCopyLeaks(home.text)
if (homeCopyLeaks.length === 0) pass("Homepage production copy safety")
else fail("Homepage production copy safety", homeCopyLeaks.join(", "))

for (const type of ["Organization", "WebSite", "SoftwareApplication", "FAQPage"]) {
  if (home.text.includes(`"@type":"${type}"`) || home.text.includes(`"@type": "${type}"`)) {
    pass(`${type} schema present`)
  } else {
    fail(`${type} schema present`)
  }
}

for (const path of ["/llms.txt", "/robots.txt", "/sitemap.xml", "/ai-index.json", "/.well-known/security.txt"]) {
  const result = await read(path)
  if (result.response.ok) pass(`${path} returns 200`)
  else fail(`${path} returns 200`, String(result.response.status))
}

const publicContentPages = [
  "/terms",
  "/privacy",
  "/report-policy",
  "/dispute-policy",
  "/moderation-policy",
  "/clients",
  "/clients/orlando-fl",
  "/clients/florida/orlando",
  "/reports/non-payment",
  "/industries/contractors",
  "/payment-recovery-service",
  "/florida-lien-notice-service",
  "/florida-lien-filing-service",
  "/contractor-contract-template",
  "/change-order-template",
  "/homeowner-wont-pay-contractor",
  "/client-screening-for-contractors",
  "/mobile-app",
]

const corePublicPages = [
  "/pricing",
  "/how-it-works",
  "/about",
  "/contact",
  "/enterprise",
  "/resources",
  "/claim-profile",
  "/score-methodology",
  "/business-rating-methodology",
  "/businesses",
  "/reports/recent",
  "/reports/high-risk",
  "/industries/service-businesses",
]

async function verifyPublicPage(path, options = {}) {
  const { requireSubstantialContent = false, requireFaq = false } = options
  const page = await read(path)

  if (!page.response.ok) {
    fail(`${path} returns 200`, String(page.response.status))
    return
  }

  pass(`${path} returns 200`)

  const pageTitle = extract(page.text, /<title>(.*?)<\/title>/is)
  const pageDescription = extract(
    page.text,
    /<meta\s+name=["']description["']\s+content=["']([^"']+)["'][^>]*>/is,
  )
  const pageCanonical = extract(page.text, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/is)
  const count = wordCount(page.text)

  if (pageTitle.length > 0) pass(`${path} title present`, pageTitle)
  else fail(`${path} title present`)

  if (pageDescription.length >= 90 && pageDescription.length <= 170) {
    pass(`${path} meta description length`, `${pageDescription.length} characters`)
  } else {
    fail(`${path} meta description length`, `${pageDescription.length}: ${pageDescription}`)
  }

  if (pageCanonical === `${expectedSiteUrl}${path}`) pass(`${path} canonical`, pageCanonical)
  else fail(`${path} canonical`, pageCanonical)

  if (requireSubstantialContent) {
    if (count >= 450) pass(`${path} substantial content`, `${count} words`)
    else fail(`${path} substantial content`, `${count} words`)
  }

  if (requireFaq) {
    if (page.text.includes(`"@type":"FAQPage"`) || page.text.includes(`"@type": "FAQPage"`)) {
      pass(`${path} FAQ schema present`)
    } else {
      fail(`${path} FAQ schema present`)
    }
  }

  const productionCopyLeaks = findProductionCopyLeaks(page.text)
  if (productionCopyLeaks.length === 0) {
    pass(`${path} production copy safety`)
  } else {
    fail(`${path} production copy safety`, productionCopyLeaks.join(", "))
  }

  const privateDataLeaks = findPublicPrivateDataLeaks(page.text)
  if (privateDataLeaks.length === 0) {
    pass(`${path} public private-data safety`)
  } else {
    fail(`${path} public private-data safety`, privateDataLeaks.join(", "))
  }
}

async function verifyNoindexWorkflowPage(path, options = {}) {
  const { requestPath = path, requiredText = [] } = options
  const page = await read(requestPath)

  if (!page.response.ok) {
    fail(`${path} returns 200`, String(page.response.status))
    return
  }

  pass(`${path} returns 200`)

  const pageTitle = extract(page.text, /<title>(.*?)<\/title>/is)
  const pageDescription = metaContent(page.text, "description")
  const pageCanonical = extract(page.text, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/is)
  const pageRobots = metaContent(page.text, "robots").toLowerCase()

  if (pageTitle.length > 0) pass(`${path} title present`, pageTitle)
  else fail(`${path} title present`)

  if (pageDescription.length >= 90 && pageDescription.length <= 170) {
    pass(`${path} meta description length`, `${pageDescription.length} characters`)
  } else {
    fail(`${path} meta description length`, `${pageDescription.length}: ${pageDescription}`)
  }

  if (pageCanonical === `${expectedSiteUrl}${path}`) pass(`${path} canonical`, pageCanonical)
  else fail(`${path} canonical`, pageCanonical || "missing")

  if (pageRobots.includes("noindex") && pageRobots.includes("nofollow")) {
    pass(`${path} noindex/nofollow`, pageRobots)
  } else {
    fail(`${path} noindex/nofollow`, pageRobots || "missing")
  }

  const visibleText = visiblePageText(page.text)
  for (const text of requiredText) {
    if (visibleText.includes(text)) pass(`${path} visible copy ${text.slice(0, 60)}`)
    else fail(`${path} visible copy ${text.slice(0, 60)}`, "missing")
  }

  const productionCopyLeaks = findProductionCopyLeaks(page.text)
  if (productionCopyLeaks.length === 0) {
    pass(`${path} production copy safety`)
  } else {
    fail(`${path} production copy safety`, productionCopyLeaks.join(", "))
  }

  const privateDataLeaks = findPublicPrivateDataLeaks(page.text)
  if (privateDataLeaks.length === 0) {
    pass(`${path} private-data marker safety`)
  } else {
    fail(`${path} private-data marker safety`, privateDataLeaks.join(", "))
  }
}

const publicPageChecks = new Map()

for (const path of corePublicPages) {
  publicPageChecks.set(path, { requireSubstantialContent: false, requireFaq: false })
}

for (const path of publicContentPages) {
  publicPageChecks.set(path, { requireSubstantialContent: true, requireFaq: true })
}

for (const [path, options] of publicPageChecks.entries()) {
  await verifyPublicPage(path, options)
}

await verifyNoindexWorkflowPage("/login", {
  requestPath: "/login?next=%2Fdashboard%2Freports",
  requiredText: ["Secure account access", "Return to your business protection workspace.", "Sign in to Client Bureau"],
})
await verifyNoindexWorkflowPage("/signup", {
  requestPath: "/signup?next=%2Fsearch%3Fq%3DJohn%26state%3DFL",
  requiredText: ["Business protection account", "Create the account that helps protect your next job.", "Create your Client Bureau account"],
})
await verifyNoindexWorkflowPage("/search", {
  requestPath: "/search?q=John&state=FL",
  requiredText: ["Check a Client Before You Take the Job.", "Server-verified results", "Search decision guide"],
})
await verifyNoindexWorkflowPage("/client-response", {
  requiredText: ["Client response", "Respond, dispute, correct, or update a Client Bureau profile.", "Fairness is part of the product."],
})

const mobileAppPage = await read("/mobile-app")
if (mobileAppPage.response.ok) {
  const mobileAppVisibleText = visiblePageText(mobileAppPage.text)
  const expectedMobileVersion = mobileConfig.expo.version
  const expectedAndroidBuild = String(mobileConfig.expo.android.versionCode)

  if (mobileAppVisibleText.includes(expectedMobileVersion)) {
    pass("/mobile-app current app version", expectedMobileVersion)
  } else {
    fail("/mobile-app current app version", expectedMobileVersion)
  }

  if (mobileAppVisibleText.includes(`Release build: ${expectedAndroidBuild}`)) {
    pass("/mobile-app current Android build", expectedAndroidBuild)
  } else {
    fail("/mobile-app current Android build", expectedAndroidBuild)
  }

  const staleMobileMarkers = [
    "vg42czKjtB79CQnxdg3JBr.apk",
    "pQPHajdAPswqN8UikHR5e8.aab",
    "0.3.6",
    "versionCode 7",
  ]
  const staleMobileMarkersFound = staleMobileMarkers.filter((marker) => mobileAppPage.text.includes(marker))

  if (staleMobileMarkersFound.length === 0) {
    pass("/mobile-app avoids stale Android release artifacts")
  } else {
    fail("/mobile-app avoids stale Android release artifacts", staleMobileMarkersFound.join(", "))
  }
}

const publicLinkPages = [
  "/reports/recent",
  "/reports/non-payment",
  "/reports/high-risk",
  "/industries/contractors",
  "/industries/service-businesses",
]
const checkedProfileLinks = new Map()

for (const path of publicLinkPages) {
  const page = await read(path)
  if (!page.response.ok) continue

  for (const profilePath of new Set(clientProfileLinks(page.text))) {
    if (!checkedProfileLinks.has(profilePath)) {
      const linkedProfile = await read(profilePath)
      const ok = linkedProfile.response.ok && !linkedProfile.text.includes("Client Profile Not Found")
      checkedProfileLinks.set(profilePath, ok)
    }
  }
}

const brokenProfileLinks = [...checkedProfileLinks.entries()]
  .filter(([, ok]) => !ok)
  .map(([path]) => path)

if (brokenProfileLinks.length === 0) {
  pass("Public landing pages link only to available client profiles", `${checkedProfileLinks.size} checked`)
} else {
  fail("Public landing pages link only to available client profiles", brokenProfileLinks.join(", "))
}

const sitemap = await read("/sitemap.xml")
const profilePath = sitemapProfilePath(sitemap.text)

if (profilePath) pass("Sitemap includes at least one public client profile", profilePath)
else fail("Sitemap includes at least one public client profile")

const publicProfile = profilePath ? await read(profilePath) : { response: { ok: false, status: "missing" }, text: "" }
if (publicProfile.response.ok) {
  const profilePrivateDataLeaks = findPublicPrivateDataLeaks(publicProfile.text, { includeContactIdentifiers: true })
  const hasEmail = /raw email address/.test(profilePrivateDataLeaks.join(", "))
  const hasPhone = /raw phone number/.test(profilePrivateDataLeaks.join(", "))

  if (!hasEmail && !hasPhone) pass("Public profile hides raw email and phone")
  else fail("Public profile hides raw email and phone")

  if (!publicProfile.text.includes("Loading public client profile")) {
    pass("Public profile initial HTML is not a loading shell")
  } else {
    fail("Public profile initial HTML is not a loading shell")
  }

  for (const type of ["WebPage", "Person", "BreadcrumbList", "ItemList"]) {
    if (publicProfile.text.includes(`"@type":"${type}"`) || publicProfile.text.includes(`"@type": "${type}"`)) {
      pass(`Public profile ${type} schema present`)
    } else {
      fail(`Public profile ${type} schema present`)
    }
  }

  if (
    !publicProfile.text.includes("AggregateRating") &&
    !publicProfile.text.includes("\"Review\"") &&
    !publicProfile.text.includes("ratingValue")
  ) {
    pass("Public profile avoids rating-rich-result markup")
  } else {
    fail("Public profile avoids rating-rich-result markup")
  }

  const publicProfileCopyLeaks = findProductionCopyLeaks(publicProfile.text)
  if (publicProfileCopyLeaks.length === 0) {
    pass("Public profile production copy safety")
  } else {
    fail("Public profile production copy safety", publicProfileCopyLeaks.join(", "))
  }

  const profileNonContactPrivateLeaks = profilePrivateDataLeaks.filter(
    (leak) => !leak.startsWith("raw email address") && !leak.startsWith("raw phone number"),
  )
  if (profileNonContactPrivateLeaks.length === 0) {
    pass("Public profile private-data marker safety")
  } else {
    fail("Public profile private-data marker safety", profileNonContactPrivateLeaks.join(", "))
  }
} else {
  fail("Public profile returns 200", String(publicProfile.response.status))
}

for (const check of checks) {
  const marker = check.ok ? "PASS" : "FAIL"
  console.log(`${marker} ${check.name}${check.detail ? ` - ${check.detail}` : ""}`)
}

if (checks.some((check) => !check.ok)) {
  process.exit(1)
}
