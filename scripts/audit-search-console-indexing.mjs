import { existsSync, readFileSync } from "node:fs"
import path from "node:path"

const baseUrl = (process.env.SEO_BASE_URL || process.env.LIVE_BASE_URL || "https://clientbureau.com").replace(/\/$/, "")
const args = process.argv.slice(2)
const inputArg = args.find((arg) => arg.startsWith("--input="))
const inputPath = inputArg ? path.resolve(inputArg.slice("--input=".length)) : undefined

const checks = []

function add(level, url, classification, detail) {
  checks.push({ level, url, classification, detail })
}

function normalizePath(pathname) {
  return pathname.replace(/\/$/, "") || "/"
}

function matchesPrefix(pathname, prefix) {
  const normalized = normalizePath(pathname)
  const normalizedPrefix = normalizePath(prefix)

  return normalized === normalizedPrefix || normalized.startsWith(`${normalizedPrefix}/`)
}

function classifyPath(pathname) {
  if (["/admin", "/api", "/auth", "/contract", "/dashboard"].some((prefix) => matchesPrefix(pathname, prefix))) {
    return "robotsBlockedPrivate"
  }

  if (["/login", "/search", "/signup", "/submit-report"].some((prefix) => matchesPrefix(pathname, prefix))) {
    return "crawlableNoindexUtility"
  }

  return "publicIndexable"
}

function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ""
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]

    if (char === '"' && quoted && next === '"') {
      cell += '"'
      index += 1
      continue
    }

    if (char === '"') {
      quoted = !quoted
      continue
    }

    if (char === "," && !quoted) {
      row.push(cell)
      cell = ""
      continue
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1
      row.push(cell)
      if (row.some(Boolean)) rows.push(row)
      row = []
      cell = ""
      continue
    }

    cell += char
  }

  row.push(cell)
  if (row.some(Boolean)) rows.push(row)

  return rows
}

function urlsFromCsv(text) {
  return parseCsv(text)
    .flatMap((row) => row)
    .map((cell) => cell.trim())
    .filter((cell) => /^https?:\/\//i.test(cell))
}

async function read(pathname) {
  const response = await fetch(`${baseUrl}${pathname}`)
  const text = await response.text()

  return { response, text }
}

function sitemapLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1])
}

function metaContent(html, name) {
  const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) => match[0])
  const meta = metas.find((tag) => {
    const metaName = tag.match(/\bname=["']([^"']+)["']/i)?.[1] ?? ""

    return metaName.toLowerCase() === name.toLowerCase()
  })

  return meta?.match(/\bcontent=["']([^"']*)["']/i)?.[1]?.trim() ?? ""
}

function canonical(html) {
  return html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/is)?.[1]?.trim() ?? ""
}

function sameUrl(left, right) {
  return left.replace(/\/$/, "") === right.replace(/\/$/, "")
}

async function auditUrl(urlText, source = "search-console-export") {
  let url

  try {
    url = new URL(urlText, baseUrl)
  } catch {
    add("FAIL", urlText, "invalidUrl", "Could not parse URL.")
    return
  }

  const classification = classifyPath(url.pathname)

  if (url.origin !== baseUrl) {
    add("WARN", url.href, classification, `Different origin than ${baseUrl}; check preferred-domain canonicalization.`)
    return
  }

  if (classification === "robotsBlockedPrivate") {
    add("OK", url.href, classification, "Intentional private/internal route; it should stay out of the sitemap and Search results.")
    return
  }

  if (classification === "crawlableNoindexUtility") {
    const page = await read(`${url.pathname}${url.search}`)
    const robots = metaContent(page.text, "robots").toLowerCase()

    if (robots.includes("noindex") && robots.includes("follow") && !robots.includes("nofollow")) {
      add("OK", url.href, classification, "Crawlable noindex utility page.")
    } else {
      add("FAIL", url.href, classification, `Expected noindex,follow; found "${robots || "missing"}".`)
    }
    return
  }

  const page = await read(`${url.pathname}${url.search}`)
  const robots = metaContent(page.text, "robots").toLowerCase()
  const pageCanonical = canonical(page.text)

  if (!page.response.ok) {
    add("FAIL", url.href, classification, `Expected public page 200; got ${page.response.status}.`)
  } else if (robots.includes("noindex")) {
    add("FAIL", url.href, classification, `Public page is noindexed: "${robots}".`)
  } else if (pageCanonical && !sameUrl(pageCanonical, url.href)) {
    add("WARN", url.href, classification, `Alternate canonical points to ${pageCanonical}. Keep only the canonical URL in sitemap/internal links.`)
  } else {
    add("OK", url.href, classification, source === "sitemap" ? "Sitemap URL is public and self-canonical." : "Public page appears indexable.")
  }
}

if (inputPath) {
  if (!existsSync(inputPath)) {
    console.error(`Search Console CSV not found: ${inputPath}`)
    process.exit(1)
  }

  const urls = [...new Set(urlsFromCsv(readFileSync(inputPath, "utf8")))]
  if (urls.length === 0) {
    console.error(`No URLs found in ${inputPath}`)
    process.exit(1)
  }

  for (const url of urls) {
    await auditUrl(url)
  }
} else {
  const sitemap = await read("/sitemap.xml")
  if (!sitemap.response.ok) {
    add("FAIL", `${baseUrl}/sitemap.xml`, "sitemap", `Could not load sitemap: ${sitemap.response.status}.`)
  } else {
    for (const loc of sitemapLocs(sitemap.text)) {
      await auditUrl(loc, "sitemap")
    }
  }
}

for (const check of checks) {
  console.log(`${check.level} ${check.url} [${check.classification}] - ${check.detail}`)
}

if (checks.some((check) => check.level === "FAIL")) process.exit(1)
