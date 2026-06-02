const baseUrl = (process.env.SEO_BASE_URL || "http://localhost:4000").replace(/\/$/, "")
const expectedSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://clientbureau.com").replace(/\/$/, "")

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

for (const type of ["Organization", "WebSite", "SoftwareApplication", "FAQPage"]) {
  if (home.text.includes(`"@type":"${type}"`) || home.text.includes(`"@type": "${type}"`)) {
    pass(`${type} schema present`)
  } else {
    fail(`${type} schema present`)
  }
}

for (const path of ["/llms.txt", "/robots.txt", "/sitemap.xml"]) {
  const result = await read(path)
  if (result.response.ok) pass(`${path} returns 200`)
  else fail(`${path} returns 200`, String(result.response.status))
}

const publicProfile = await read("/client/john-smith-orlando-fl")
if (publicProfile.response.ok) {
  const visibleText = publicProfile.text.replace(/<script[\s\S]*?<\/script>/g, "")
  const hasEmail = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(visibleText)
  const hasPhone = /\b\d{3}[-.)\s]?\d{3}[-.\s]?\d{4}\b/.test(visibleText)

  if (!hasEmail && !hasPhone) pass("Public profile hides raw email and phone")
  else fail("Public profile hides raw email and phone")
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
