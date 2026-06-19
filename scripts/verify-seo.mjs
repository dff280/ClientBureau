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

function warn(name, detail = "") {
  checks.push({ ok: true, warning: true, name, detail })
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

function entityProfileLinks(html, profileType) {
  return [...html.matchAll(new RegExp(`href=["']([^"']*\\/profiles\\/${profileType}\\/[^"']+)["']`, "gi"))]
    .map((match) => {
      try {
        return new URL(match[1], expectedSiteUrl).pathname
      } catch {
        return ""
      }
    })
    .filter(Boolean)
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

function pageLinks(html) {
  return [...html.matchAll(/href=["']([^"']+)["']/gi)]
    .map((match) => {
      try {
        return new URL(decodeHtmlAttribute(match[1]), expectedSiteUrl)
      } catch {
        return null
      }
    })
    .filter(Boolean)
}

function hasLinkWithParams(html, pathname, expectedParams) {
  return pageLinks(html).some((url) => {
    if (url.pathname !== pathname) return false

    return Object.entries(expectedParams).every(([key, value]) => url.searchParams.get(key) === value)
  })
}

function hasSignupNextWithParams(html, nextPathname, expectedParams) {
  return pageLinks(html).some((url) => {
    if (url.pathname !== "/signup") return false

    const next = url.searchParams.get("next")
    if (!next) return false

    try {
      const nextUrl = new URL(next, expectedSiteUrl)
      if (nextUrl.pathname !== nextPathname) return false

      return Object.entries(expectedParams).every(([key, value]) => nextUrl.searchParams.get(key) === value)
    } catch {
      return false
    }
  })
}

function hiddenInputValue(html, name) {
  const inputs = [...html.matchAll(/<input\b[^>]*>/gi)].map((match) => match[0])
  const input = inputs.find((tag) => {
    const inputName = extract(tag, /\bname=["']([^"']+)["']/i)

    return inputName === name
  })

  return input ? decodeHtmlAttribute(extract(input, /\bvalue=["']([^"']*)["']/i)) : ""
}

function sitemapProfilePath(xml) {
  const match = xml.match(/<loc>https?:\/\/[^<]+(\/client\/[^<]+)<\/loc>/i)

  return match?.[1] ?? ""
}

function sitemapLocs(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/gi)].map((match) => match[1])
}

function normalizePath(pathname) {
  return pathname.replace(/\/$/, "") || "/"
}

function isRobotsBlockedPath(pathname) {
  const normalized = normalizePath(pathname)

  return ["/admin", "/api", "/auth", "/contract", "/dashboard"].some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  )
}

function canonicalMatches(actual, expected) {
  const normalizedActual = actual.replace(/\/$/, "")
  const normalizedExpected = expected.replace(/\/$/, "")

  return normalizedActual === normalizedExpected
}

function sitemapEntry(xml, loc) {
  const escapedLoc = loc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const match = xml.match(new RegExp(`<url>\\s*<loc>${escapedLoc}<\\/loc>([\\s\\S]*?)<\\/url>`, "i"))

  return match?.[1] ?? ""
}

function sitemapLastmod(xml, loc) {
  const entry = sitemapEntry(xml, loc)

  return extract(entry, /<lastmod>(.*?)<\/lastmod>/is)
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

const homepageDecorativeProfileLinks = [
  ...new Set([
    ...clientProfileLinks(home.text),
    ...businessProfileLinks(home.text),
    ...entityProfileLinks(home.text, "contractor"),
    ...entityProfileLinks(home.text, "subcontractor"),
  ]),
]
if (homepageDecorativeProfileLinks.length === 0) {
  pass("Homepage avoids decorative real profile links")
} else {
  fail("Homepage avoids decorative real profile links", homepageDecorativeProfileLinks.slice(0, 5).join(", "))
}

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

const launchAssets = [
  "/images/search-dossier-console.webp",
  "/images/florida-agreement-packet.webp",
  "/images/admin-ops-crm-console.webp",
  "/images/mobile-field-app-console.webp",
]

for (const path of launchAssets) {
  const response = await fetch(`${baseUrl}${path}`)
  const contentType = response.headers.get("content-type") ?? ""

  if (response.ok && contentType.includes("image/")) pass(`${path} launch image available`, contentType)
  else fail(`${path} launch image available`, `${response.status} ${contentType}`)
}

const publicContentPages = [
  "/terms",
  "/privacy",
  "/report-policy",
  "/dispute-policy",
  "/moderation-policy",
  "/clients",
  "/clients/florida/counties",
  "/profiles",
  "/profiles/client",
  "/profiles/contractor",
  "/profiles/subcontractor",
  "/clients/florida/orlando",
  "/reports/non-payment",
  "/industries",
  "/industries/contractors",
  "/industries/subcontractors",
  "/industries/roofing",
  "/industries/electrical",
  "/industries/hvac",
  "/payment-recovery-service",
  "/florida-lien-notice-service",
  "/florida-lien-filing-service",
  "/contractor-contract-template",
  "/contractor-verification",
  "/florida-contractor-agreement-template",
  "/change-order-template",
  "/homeowner-wont-pay-contractor",
  "/client-screening-for-contractors",
  "/subcontractor-payment-chain-documentation",
  "/evidence-privacy-for-contractors",
  "/response-correction-rights",
  "/mobile-app",
]

const corePublicPages = [
  "/platform",
  "/pricing",
  "/how-it-works",
  "/about",
  "/contact",
  "/enterprise",
  "/resources",
  "/client-response",
  "/claim-profile",
  "/score-methodology",
  "/business-rating-methodology",
  "/businesses",
  "/reports/recent",
  "/reports/high-risk",
  "/industries",
  "/industries/service-businesses",
  "/industries/painting",
  "/industries/plumbing",
  "/industries/landscaping",
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

async function verifyPublicInquirySurface(path, requiredTexts) {
  const page = await read(path)

  if (!page.response.ok) {
    fail(`${path} inquiry surface returns 200`, String(page.response.status))
    return
  }

  const visibleText = visiblePageText(page.text)
  for (const text of requiredTexts) {
    if (visibleText.includes(text)) pass(`${path} inquiry copy ${text.slice(0, 60)}`)
    else fail(`${path} inquiry copy ${text.slice(0, 60)}`, "missing")
  }

  if (page.text.includes('name="inquiryType"') && page.text.includes('name="privacyCertification"')) {
    pass(`${path} inquiry form fields present`)
  } else {
    fail(`${path} inquiry form fields present`, "missing inquiryType or privacyCertification")
  }
}

async function verifyNoindexWorkflowPage(path, options = {}) {
  const { requestPath = path, requiredText = [], expectedFollow = true } = options
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

  const hasExpectedFollow = expectedFollow ? pageRobots.includes("follow") && !pageRobots.includes("nofollow") : pageRobots.includes("nofollow")

  if (pageRobots.includes("noindex") && hasExpectedFollow) {
    pass(`${path} ${expectedFollow ? "noindex/follow" : "noindex/nofollow"}`, pageRobots)
  } else {
    fail(`${path} ${expectedFollow ? "noindex/follow" : "noindex/nofollow"}`, pageRobots || "missing")
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

async function verifyCanonicalAlias(path, canonicalPath) {
  const page = await read(path)

  if (!page.response.ok) {
    fail(`${path} alias returns 200`, String(page.response.status))
    return
  }

  pass(`${path} alias returns 200`)

  const pageCanonical = extract(page.text, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/is)
  const expectedCanonical = `${expectedSiteUrl}${canonicalPath}`

  if (canonicalMatches(pageCanonical, expectedCanonical)) {
    pass(`${path} aliases canonical page`, pageCanonical)
  } else {
    fail(`${path} aliases canonical page`, `${pageCanonical || "missing"} expected ${expectedCanonical}`)
  }

  const productionCopyLeaks = findProductionCopyLeaks(page.text)
  if (productionCopyLeaks.length === 0) {
    pass(`${path} alias production copy safety`)
  } else {
    fail(`${path} alias production copy safety`, productionCopyLeaks.join(", "))
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

await verifyPublicInquirySurface("/contact", [
  "Send support inquiry",
  "General inquiry only",
  "Do not paste raw evidence",
])
await verifyPublicInquirySurface("/enterprise", [
  "Enterprise inquiry",
  "Send enterprise inquiry",
  "Do not submit case evidence",
])

await verifyCanonicalAlias("/clients/orlando-fl", "/clients/florida/orlando")

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
  requiredText: ["Check a Client Before You Take the Job.", "Server-verified results", "Client check guide"],
})
await verifyNoindexWorkflowPage("/clients/florida/winter-park", {
  requiredText: ["Official Florida market", "No approved public profiles are listed here yet", "Client Database"],
})

const pricingBillingPage = await read("/pricing")
if (pricingBillingPage.response.ok) {
  const pricingVisibleText = visiblePageText(pricingBillingPage.text)

  if (pricingVisibleText.includes("Paid plan activation is reviewed before any billing is collected")) {
    pass("/pricing explains deferred paid-plan activation")
  } else {
    fail("/pricing explains deferred paid-plan activation", "missing billing-review language")
  }

  if (pricingBillingPage.text.includes("/signup?plan=pro")) {
    pass("/pricing routes paid plan interest through signup")
  } else {
    fail("/pricing routes paid plan interest through signup", "missing /signup?plan=pro")
  }

  if (pricingBillingPage.text.includes("/api/stripe/checkout")) {
    fail("/pricing avoids direct checkout form", "/api/stripe/checkout found")
  } else {
    pass("/pricing avoids direct checkout form")
  }

  const technicalBillingMarkers = ["Stripe not configured", "test mode", "webhook pending", "checkout broken"]
  const technicalBillingMarkersFound = technicalBillingMarkers.filter((marker) => pricingVisibleText.includes(marker))

  if (technicalBillingMarkersFound.length === 0) {
    pass("/pricing avoids technical billing markers")
  } else {
    fail("/pricing avoids technical billing markers", technicalBillingMarkersFound.join(", "))
  }
} else {
  fail("/pricing billing truth check", String(pricingBillingPage.response.status))
}

const subcontractorTradeSearch = await read("/search?q=NoSuchClientBureau987&profileType=subcontractor&tradeCategory=Electrical")
if (subcontractorTradeSearch.response.ok) {
  pass("/search preserves subcontractor trade request", "profileType=subcontractor&tradeCategory=Electrical")

  if (hasLinkWithParams(subcontractorTradeSearch.text, "/search", { profileType: "subcontractor", tradeCategory: "Electrical" })) {
    pass("/search subcontractor trade filter remains active in result navigation")
  } else {
    fail("/search subcontractor trade filter remains active in result navigation", "missing profileType/tradeCategory search link")
  }

  if (hasSignupNextWithParams(subcontractorTradeSearch.text, "/search", { profileType: "subcontractor", tradeCategory: "Electrical" })) {
    pass("/search signup handoff preserves subcontractor trade filters")
  } else if (hasLinkWithParams(subcontractorTradeSearch.text, "/dashboard/watchlist", {})) {
    warn(
      "/search signup handoff preserves subcontractor trade filters",
      "Skipped because this environment rendered authenticated watchlist actions instead of logged-out signup CTAs.",
    )
  } else {
    fail("/search signup handoff preserves subcontractor trade filters", "missing signup next profileType/tradeCategory")
  }

  if (hasLinkWithParams(subcontractorTradeSearch.text, "/submit-report", { profileType: "subcontractor", tradeCategory: "Electrical" })) {
    pass("/search report handoff preserves subcontractor trade filters")
  } else {
    fail("/search report handoff preserves subcontractor trade filters", "missing submit-report profileType/tradeCategory")
  }
} else {
  fail("/search preserves subcontractor trade request", String(subcontractorTradeSearch.response.status))
}

const privateIdentifierSearch = await read("/search?q=person%40example.com&state=FL&profileType=client")
if (privateIdentifierSearch.response.ok) {
  const finalUrl = new URL(privateIdentifierSearch.response.url)
  const visiblePrivateSearch = visiblePageText(privateIdentifierSearch.text)

  if (finalUrl.pathname === "/search" && finalUrl.searchParams.get("privateMatch") === "1" && !finalUrl.searchParams.has("q")) {
    pass("/search private identifier redirects to safe private-match URL", `${finalUrl.pathname}${finalUrl.search}`)
  } else {
    fail("/search private identifier redirects to safe private-match URL", `${finalUrl.pathname}${finalUrl.search}`)
  }

  if (!privateIdentifierSearch.text.includes("person@example.com") && !privateIdentifierSearch.text.includes("person%40example.com")) {
    pass("/search private identifier not rendered in HTML")
  } else {
    fail("/search private identifier not rendered in HTML", "raw email found")
  }

  if (
    visiblePrivateSearch.includes("Private identifier checks stay inside secure accounts") &&
    visiblePrivateSearch.includes("not a clearance signal")
  ) {
    pass("/search private identifier no-result copy is safety-scoped")
  } else {
    fail("/search private identifier no-result copy is safety-scoped", "missing private-match safety copy")
  }
} else {
  fail("/search private identifier returns 200 after safe redirect", String(privateIdentifierSearch.response.status))
}

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
  "/industries",
  "/industries/contractors",
  "/industries/service-businesses",
  "/industries/roofing",
  "/industries/electrical",
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

const businessesPageForClaim = await read("/businesses")
if (businessesPageForClaim.response.ok) {
  const businessPath = [...new Set([...entityProfileLinks(businessesPageForClaim.text, "contractor"), ...businessProfileLinks(businessesPageForClaim.text)])][0]

  if (businessPath) {
    const businessProfile = await read(businessPath)

    if (businessProfile.response.ok) {
      const claimLink = claimProfileLinks(businessProfile.text)
        .find((url) => url.searchParams.get("profileType") === "contractor" && Boolean(url.searchParams.get("profileSlug")))

      if (claimLink) {
        pass("Business profile claim links preserve profile target", `${claimLink.pathname}${claimLink.search}`)
        const claimPage = await read(`${claimLink.pathname}${claimLink.search}`)
        const slug = claimLink.searchParams.get("profileSlug") ?? ""
        const profileType = claimLink.searchParams.get("profileType") ?? ""
        const visibleText = visiblePageText(claimPage.text)

        if (claimPage.response.ok) pass("Direct business claim page returns 200")
        else fail("Direct business claim page returns 200", String(claimPage.response.status))

        if (visibleText.includes("Verify your relationship to this profile.") && visibleText.includes("Claim target")) {
          pass("Direct business claim page renders verification workflow")
        } else {
          fail("Direct business claim page renders verification workflow", "missing direct-claim copy")
        }

        if (hiddenInputValue(claimPage.text, "profileSlug") === slug && hiddenInputValue(claimPage.text, "profileType") === profileType) {
          pass("Direct business claim form preserves hidden profile target", `${profileType}/${slug}`)
        } else {
          fail("Direct business claim form preserves hidden profile target", `${profileType}/${slug}`)
        }
      } else {
        fail("Business profile claim links preserve profile target", "missing profileType=contractor and profileSlug")
      }
    } else {
      fail(`${businessPath} returns 200 for claim-link verification`, String(businessProfile.response.status))
    }
  } else {
    fail("Business directory exposes at least one public business profile link")
  }
} else {
  fail("/businesses claim-link source returns 200", String(businessesPageForClaim.response.status))
}

const sitemap = await read("/sitemap.xml")
const versionInfo = await read("/api/version")
const profilePath = sitemapProfilePath(sitemap.text)
const sitemapPublicLocs = sitemap.response.ok ? sitemapLocs(sitemap.text) : []
let versionJson = null

try {
  versionJson = versionInfo.response.ok ? JSON.parse(versionInfo.text) : null
} catch {
  versionJson = null
}

if (versionInfo.response.ok && versionJson?.releaseDate) {
  pass("/api/version release date present", versionJson.releaseDate)
} else {
  fail("/api/version release date present", versionInfo.response.ok ? "missing releaseDate" : String(versionInfo.response.status))
}

if (sitemap.response.ok && versionJson?.releaseDate) {
  const homepageLastmod = sitemapLastmod(sitemap.text, expectedSiteUrl)
  const expectedLastmod = versionJson.releaseDate.slice(0, 10)

  if (homepageLastmod.startsWith(expectedLastmod)) {
    pass("Sitemap homepage lastmod matches release date", homepageLastmod)
  } else {
    fail("Sitemap homepage lastmod matches release date", `${homepageLastmod || "missing"} expected ${expectedLastmod}`)
  }
}

if (profilePath) pass("Sitemap includes at least one public client profile", profilePath)
else fail("Sitemap includes at least one public client profile")

if (sitemap.response.ok) {
  const sitemapRobotsBlockedLocs = sitemapPublicLocs.filter((loc) => {
    try {
      return isRobotsBlockedPath(new URL(loc).pathname)
    } catch {
      return true
    }
  })

  if (sitemapRobotsBlockedLocs.length === 0) {
    pass("Sitemap excludes robots-blocked URLs")
  } else {
    fail("Sitemap excludes robots-blocked URLs", sitemapRobotsBlockedLocs.slice(0, 5).join(", "))
  }

  const sitemapNoindexLocs = []
  const sitemapCanonicalMismatches = []

  for (const loc of sitemapPublicLocs) {
    const url = new URL(loc)
    const page = await read(`${url.pathname}${url.search}`)
    if (!page.response.ok) continue

    const pageRobots = metaContent(page.text, "robots").toLowerCase()
    if (pageRobots.includes("noindex")) sitemapNoindexLocs.push(loc)

    const pageCanonical = extract(page.text, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/is)
    if (pageCanonical && !canonicalMatches(pageCanonical, loc)) {
      sitemapCanonicalMismatches.push(`${loc} -> ${pageCanonical}`)
    }
  }

  if (sitemapNoindexLocs.length === 0) {
    pass("Sitemap excludes noindex URLs")
  } else {
    fail("Sitemap excludes noindex URLs", sitemapNoindexLocs.slice(0, 5).join(", "))
  }

  if (sitemapCanonicalMismatches.length === 0) {
    pass("Sitemap URLs are self-canonical")
  } else {
    fail("Sitemap URLs are self-canonical", sitemapCanonicalMismatches.slice(0, 5).join(", "))
  }
}

for (const path of publicPageChecks.keys()) {
  const expectedLoc = `${expectedSiteUrl}${path}`

  if (sitemapPublicLocs.includes(expectedLoc)) pass(`Sitemap includes audited public page ${path}`, expectedLoc)
  else fail(`Sitemap includes audited public page ${path}`, "missing")
}

async function verifyEntityProfileDetail(profileType) {
  const directoryPage = await read(`/profiles/${profileType}`)

  if (!directoryPage.response.ok) {
    fail(`/profiles/${profileType} detail source returns 200`, String(directoryPage.response.status))
    return
  }

  const profilePath = [...new Set(entityProfileLinks(directoryPage.text, profileType))][0]

  if (!profilePath) {
    if (profileType === "subcontractor") {
      warn(
        `/profiles/${profileType} exposes a profile detail link`,
        "No public subcontractor profile is published yet. Publish a verified real subcontractor profile before acquisition campaigns.",
      )
    } else {
      fail(`/profiles/${profileType} exposes a profile detail link`, "missing")
    }
    return
  }

  const profilePage = await read(profilePath)

  if (!profilePage.response.ok) {
    fail(`${profilePath} returns 200`, String(profilePage.response.status))
    return
  }

  pass(`${profilePath} returns 200`)

  if (profileType === "subcontractor") {
    const verifiedTradeContext = [
      "Verification context reviewed",
      "Claimed profile",
      "Verified business",
      "Business verified",
      "Claim or Verify Trade Profile",
    ].some((text) => profilePage.text.includes(text))
    const tradeDossierContext = [
      "Trade partner dossier",
      "Scope, relationship, and payment-chain context",
      "GC/sub relationship",
      "payment-chain",
    ].some((text) => profilePage.text.includes(text))

    if (verifiedTradeContext && tradeDossierContext) {
      pass(`${profilePath} verified subcontractor launch context`, "verified trade/profile signals present")
    } else {
      warn(
        `${profilePath} verified subcontractor launch context`,
        "A subcontractor detail page exists, but verified trade/profile launch signals were not detected. Publish only real verified trade records before acquisition campaigns.",
      )
    }
  }

  for (const type of ["WebPage", "ProfilePage", "Organization", "BreadcrumbList", "ItemList"]) {
    if (profilePage.text.includes(`"@type":"${type}"`) || profilePage.text.includes(`"@type": "${type}"`)) {
      pass(`${profilePath} ${type} schema present`)
    } else {
      fail(`${profilePath} ${type} schema present`)
    }
  }

  if (
    !profilePage.text.includes("AggregateRating") &&
    !profilePage.text.includes("\"Review\"") &&
    !profilePage.text.includes("ratingValue")
  ) {
    pass(`${profilePath} avoids rating-rich-result markup`)
  } else {
    fail(`${profilePath} avoids rating-rich-result markup`)
  }

  const privateDataLeaks = findPublicPrivateDataLeaks(profilePage.text, { includeContactIdentifiers: true })
  if (privateDataLeaks.length === 0) {
    pass(`${profilePath} public private-data safety`)
  } else {
    fail(`${profilePath} public private-data safety`, privateDataLeaks.join(", "))
  }
}

await verifyEntityProfileDetail("contractor")
await verifyEntityProfileDetail("subcontractor")

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
  const marker = check.warning ? "WARN" : check.ok ? "PASS" : "FAIL"
  console.log(`${marker} ${check.name}${check.detail ? ` - ${check.detail}` : ""}`)
}

if (checks.some((check) => !check.ok)) {
  process.exit(1)
}
