import { spawn } from "node:child_process"

const checks = [
  ["npm", ["run", "route:check"], "Route inventory, metadata, robots, and navigation"],
  ["npm", ["run", "workspace:check"], "Contractor dashboard and admin CRM quality"],
  ["npm", ["run", "lint"], "ESLint"],
  ["npm", ["test"], "Unit tests"],
  ["npm", ["run", "build"], "Production build"],
  ["npm", ["run", "seo:check:local"], "Local SEO crawl against the fresh standalone build"],
  ["npm", ["run", "mobile:check"], "Mobile readiness"],
]

function run(command, args, label) {
  return new Promise((resolve) => {
    console.log(`\n[verify:local] ${label}`)
    console.log(`[verify:local] > ${command} ${args.join(" ")}`)

    const child = spawn(command, args, {
      env: process.env,
      shell: process.platform === "win32",
      stdio: "inherit",
    })

    child.on("exit", (code, signal) => {
      if (signal) {
        resolve({ ok: false, detail: `${label} stopped by ${signal}` })
        return
      }

      resolve({
        ok: code === 0,
        detail: `${label} exited with ${code}`,
      })
    })

    child.on("error", (error) => {
      resolve({ ok: false, detail: `${label} failed to start: ${error.message}` })
    })
  })
}

const startedAt = Date.now()
const results = []

for (const [command, args, label] of checks) {
  const result = await run(command, args, label)
  results.push({ label, ...result })

  if (!result.ok) {
    console.error(`\n[verify:local] FAIL ${result.detail}`)
    console.error("[verify:local] Stopping before later gates so the first failure stays visible.")
    process.exit(1)
  }
}

const elapsedSeconds = Math.round((Date.now() - startedAt) / 1000)

console.log("\n[verify:local] Local release verification passed.")
for (const result of results) {
  console.log(`[verify:local] PASS ${result.label}`)
}
console.log(`[verify:local] Completed in ${elapsedSeconds}s.`)
