import { spawn } from "node:child_process"

const baseUrl = (process.env.LIVE_BASE_URL || "https://clientbureau.com").replace(/\/$/, "")
const seoBaseUrl = (process.env.SEO_BASE_URL || baseUrl).replace(/\/$/, "")

const checks = [
  {
    args: ["run", "verify:live"],
    command: "npm",
    env: { LIVE_BASE_URL: baseUrl },
    label: "Live release identity, health, public routes, privacy, and crawl verification",
  },
  {
    args: ["run", "seo:check"],
    command: "npm",
    env: { SEO_BASE_URL: seoBaseUrl },
    label: "Live SEO, metadata, sitemap, schema, and public privacy verification",
  },
  {
    args: ["run", "verify:live:auth"],
    command: "npm",
    env: { LIVE_BASE_URL: baseUrl },
    hint:
      "Authenticated QA uses disposable credentials when available. Set REQUIRE_AUTH_QA=1 to fail this gate when credentials are missing.",
    label: "Authenticated contractor/admin workflow verification",
  },
]

function run(check) {
  return new Promise((resolve) => {
    console.log(`\n[verify:live:release-candidate] ${check.label}`)
    console.log(
      `[verify:live:release-candidate] > ${check.command} ${check.args.join(" ")}`,
    )

    const child = spawn(check.command, check.args, {
      env: {
        ...process.env,
        ...check.env,
      },
      shell: process.platform === "win32",
      stdio: "inherit",
    })

    child.on("exit", (code, signal) => {
      if (signal) {
        resolve({
          detail: `${check.label} stopped by ${signal}`,
          hint: check.hint,
          ok: false,
        })
        return
      }

      resolve({
        detail: `${check.label} exited with ${code}`,
        hint: check.hint,
        ok: code === 0,
      })
    })

    child.on("error", (error) => {
      resolve({
        detail: `${check.label} failed to start: ${error.message}`,
        hint: check.hint,
        ok: false,
      })
    })
  })
}

const startedAt = Date.now()
const results = []

console.log(`[verify:live:release-candidate] LIVE_BASE_URL=${baseUrl}`)
console.log(`[verify:live:release-candidate] SEO_BASE_URL=${seoBaseUrl}`)

for (const check of checks) {
  const result = await run(check)
  results.push({ label: check.label, ...result })

  if (!result.ok) {
    console.error(`\n[verify:live:release-candidate] FAIL ${result.detail}`)
    if (result.hint) console.error(`[verify:live:release-candidate] ${result.hint}`)
    console.error("[verify:live:release-candidate] Stopping before later gates.")
    process.exit(1)
  }
}

const elapsedSeconds = Math.round((Date.now() - startedAt) / 1000)

console.log("\n[verify:live:release-candidate] Live release-candidate verification passed.")
for (const result of results) {
  console.log(`[verify:live:release-candidate] PASS ${result.label}`)
}
console.log(`[verify:live:release-candidate] Completed in ${elapsedSeconds}s.`)
