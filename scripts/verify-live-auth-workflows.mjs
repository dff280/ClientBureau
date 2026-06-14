const baseUrl = (process.env.LIVE_BASE_URL || "https://clientbureau.com").replace(/\/$/, "")

const accounts = [
  {
    kind: "contractor",
    email: process.env.CONTRACTOR_QA_EMAIL,
    password: process.env.CONTRACTOR_QA_PASSWORD,
    next: "/dashboard",
    sessionPath: "/api/session",
    expectedRole: "contractor",
    routes: [
      "/dashboard",
      "/dashboard/jobs",
      "/dashboard/reports",
      "/dashboard/watchlist",
      "/dashboard/alerts",
      "/dashboard/growth",
      "/dashboard/contracts",
      "/dashboard/recovery",
      "/dashboard/lien-readiness",
      "/dashboard/evidence",
      "/dashboard/billing",
      "/dashboard/activity",
    ],
  },
  {
    kind: "admin",
    email: process.env.ADMIN_QA_EMAIL,
    password: process.env.ADMIN_QA_PASSWORD,
    next: "/admin",
    sessionPath: "/api/admin/session",
    expectedRole: "admin",
    routes: [
      "/admin",
      "/admin/reports",
      "/admin/profiles",
      "/admin/clients",
      "/admin/contractors",
      "/admin/discussions",
      "/admin/uploads",
      "/admin/contracts",
      "/admin/recovery",
      "/admin/audit-log",
      "/admin/reviews",
      "/admin/settings",
    ],
  },
]

const checks = []

function pass(name, detail = "") {
  checks.push({ ok: true, level: "PASS", name, detail })
}

function skip(name, detail = "") {
  checks.push({ ok: true, level: "SKIP", name, detail })
}

function fail(name, detail = "") {
  checks.push({ ok: false, level: "FAIL", name, detail })
}

function maskEmail(email = "") {
  const [local, domain] = email.split("@")
  if (!local || !domain) return "configured account"

  return `${local.slice(0, 2)}***@${domain}`
}

function splitSetCookieHeader(value) {
  if (!value) return []

  const cookies = []
  let start = 0
  let inExpires = false

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]
    const chunk = value.slice(Math.max(0, index - 8), index + 1).toLowerCase()

    if (chunk.endsWith("expires=")) inExpires = true
    if (inExpires && char === ";") inExpires = false

    if (!inExpires && char === "," && /\s*[A-Za-z0-9_\-.]+=/.test(value.slice(index + 1, index + 80))) {
      cookies.push(value.slice(start, index).trim())
      start = index + 1
    }
  }

  cookies.push(value.slice(start).trim())

  return cookies.filter(Boolean)
}

function getSetCookies(headers) {
  if (typeof headers.getSetCookie === "function") return headers.getSetCookie()

  return splitSetCookieHeader(headers.get("set-cookie") ?? "")
}

function updateCookieJar(jar, response) {
  for (const setCookie of getSetCookies(response.headers)) {
    const [pair] = setCookie.split(";")
    const equalsIndex = pair.indexOf("=")
    if (equalsIndex <= 0) continue

    const name = pair.slice(0, equalsIndex).trim()
    const value = pair.slice(equalsIndex + 1).trim()

    if (value) jar.set(name, value)
    else jar.delete(name)
  }
}

function cookieHeader(jar) {
  return [...jar.entries()].map(([name, value]) => `${name}=${value}`).join("; ")
}

async function request(path, options = {}, jar = new Map()) {
  const headers = new Headers(options.headers ?? {})
  headers.set("User-Agent", "ClientBureauAuthenticatedWorkflowVerifier/1.0")

  const cookies = cookieHeader(jar)
  if (cookies) headers.set("Cookie", cookies)

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
    redirect: options.redirect ?? "manual",
  })
  updateCookieJar(jar, response)
  const text = await response.text()

  return { response, text }
}

function hasNoStoreHeader(response) {
  return /no-store/i.test(response.headers.get("cache-control") ?? "")
}

function streamedRedirectTarget(html) {
  const digestMatch = html.match(/NEXT_REDIRECT;replace;([^;]+);(?:30[2378]);/i)
  if (digestMatch?.[1]) return digestMatch[1]

  const refreshMatch = html.match(/http-equiv=["']refresh["'][^>]+content=["'][^"']*url=([^"']+)["']/i)
  if (refreshMatch?.[1]) return refreshMatch[1]

  return ""
}

function looksRedirectedToLogin(result) {
  const location = result.response.headers.get("location") ?? streamedRedirectTarget(result.text)

  return /\/login(?:\?|$)/.test(location) || /Login to Client Bureau/i.test(result.text)
}

async function login(account) {
  const jar = new Map()
  const form = new FormData()
  form.set("email", account.email)
  form.set("password", account.password)
  form.set("next", account.next)

  const result = await request(
    "/api/auth/login",
    {
      body: form,
      method: "POST",
    },
    jar,
  )
  const location = result.response.headers.get("location") ?? ""

  if (![303, 307].includes(result.response.status)) {
    fail(`${account.kind} login redirects after POST`, `status=${result.response.status}`)
    return { jar, ok: false }
  }

  if (location.includes("/login")) {
    fail(`${account.kind} login accepted`, `redirected back to login: ${location}`)
    return { jar, ok: false }
  }

  if (location.endsWith(account.next) || location === account.next || location.includes(account.next)) {
    pass(`${account.kind} login return path`, account.next)
  } else {
    fail(`${account.kind} login return path`, `expected ${account.next}, got ${location || "missing"}`)
  }

  if (jar.size > 0) {
    pass(`${account.kind} auth cookies received`, `${jar.size} cookie(s)`)
  } else {
    fail(`${account.kind} auth cookies received`, "no Set-Cookie headers")
  }

  return { jar, ok: jar.size > 0 && !location.includes("/login") }
}

async function verifySession(account, jar) {
  const result = await request(account.sessionPath, {}, jar)

  if (!result.response.ok) {
    fail(`${account.kind} session endpoint`, `status=${result.response.status}`)
    return
  }

  if (hasNoStoreHeader(result.response)) {
    pass(`${account.kind} session no-store header`)
  } else {
    fail(`${account.kind} session no-store header`, result.response.headers.get("cache-control") ?? "missing")
  }

  let json = null
  try {
    json = JSON.parse(result.text)
  } catch {
    fail(`${account.kind} session JSON`, "could not parse response")
    return
  }

  if (json.authenticated === true) {
    pass(`${account.kind} session authenticated`, maskEmail(json.email ?? account.email))
  } else {
    fail(`${account.kind} session authenticated`, result.text)
  }

  if (json.role === account.expectedRole || (account.kind === "contractor" && json.role === "admin")) {
    pass(`${account.kind} session role`, json.role)
  } else {
    fail(`${account.kind} session role`, `expected ${account.expectedRole}, got ${json.role ?? "missing"}`)
  }

  if (account.kind === "admin") {
    if (json.isAdmin === true) pass("admin session isAdmin", "true")
    else fail("admin session isAdmin", result.text)
  }
}

async function verifyRoutes(account, jar) {
  for (const route of account.routes) {
    const result = await request(route, {}, jar)

    if (result.response.ok) {
      pass(`${account.kind} ${route} returns 200`)
    } else {
      fail(`${account.kind} ${route} returns 200`, `status=${result.response.status}`)
    }

    if (hasNoStoreHeader(result.response)) {
      pass(`${account.kind} ${route} no-store header`)
    } else {
      fail(`${account.kind} ${route} no-store header`, result.response.headers.get("cache-control") ?? "missing")
    }

    if (!looksRedirectedToLogin(result)) {
      pass(`${account.kind} ${route} stays authenticated`)
    } else {
      fail(`${account.kind} ${route} stays authenticated`, "login redirect or login page found")
    }
  }
}

async function verifyContractorCannotAccessAdmin(jar) {
  const result = await request("/admin", {}, jar)
  const location = result.response.headers.get("location") ?? streamedRedirectTarget(result.text)

  if (location === "/dashboard" || location.endsWith("/dashboard")) {
    pass("contractor denied admin area", location)
  } else if (looksRedirectedToLogin(result)) {
    pass("contractor denied admin area", "login required")
  } else {
    fail("contractor denied admin area", `status=${result.response.status}; location=${location || "none"}`)
  }
}

let contractorJar = null

for (const account of accounts) {
  if (!account.email || !account.password) {
    skip(
      `${account.kind} authenticated workflow`,
      `set ${account.kind.toUpperCase()}_QA_EMAIL and ${account.kind.toUpperCase()}_QA_PASSWORD to enable`,
    )
    continue
  }

  const loginResult = await login(account)
  if (!loginResult.ok) continue

  if (account.kind === "contractor") contractorJar = loginResult.jar

  await verifySession(account, loginResult.jar)
  await verifyRoutes(account, loginResult.jar)
}

if (contractorJar) {
  await verifyContractorCannotAccessAdmin(contractorJar)
}

for (const check of checks) {
  console.log(`${check.level} ${check.name}${check.detail ? ` - ${check.detail}` : ""}`)
}

if (checks.some((check) => !check.ok)) {
  process.exit(1)
}
