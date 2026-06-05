import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import process from "node:process"

const root = process.cwd()

const checks = [
  {
    label: "mobile readiness document exists",
    pass: existsSync(join(root, "docs", "MOBILE_APP_READINESS.md")),
  },
  {
    label: "typed mobile readiness model exists",
    pass: existsSync(join(root, "src", "lib", "mobile-readiness.ts")),
  },
]

function readProjectFile(...parts) {
  return readFileSync(join(root, ...parts), "utf8")
}

const doc = checks[0].pass ? readProjectFile("docs", "MOBILE_APP_READINESS.md") : ""
const shell = readProjectFile("src", "components", "dashboard", "client-dashboard-shell.tsx")
const model = checks[1].pass ? readProjectFile("src", "lib", "mobile-readiness.ts") : ""

checks.push(
  {
    label: "mobile document covers component audit",
    pass: /## Component Audit/.test(doc),
  },
  {
    label: "mobile document covers API backlog",
    pass: /## Mobile API Backlog/.test(doc) && /\/api\/mobile\/dashboard/.test(doc),
  },
  {
    label: "mobile document covers workflow map",
    pass: /## Mobile-First Workflow Map/.test(doc),
  },
  {
    label: "dashboard has mobile tool navigation",
    pass: /aria-label="Mobile dashboard tools"/.test(shell) && /lg:hidden/.test(shell),
  },
  {
    label: "desktop dashboard sidebar is hidden on mobile",
    pass: /hidden h-fit[\s\S]*lg:block/.test(shell),
  },
  {
    label: "mobile readiness model covers component, api, responsive, and workflow categories",
    pass:
      /mobileComponentAudit/.test(model) &&
      /mobileApiAudit/.test(model) &&
      /responsiveAudit/.test(model) &&
      /mobileWorkflows/.test(model),
  },
  {
    label: "mobile readiness model defines future BFF strategy",
    pass:
      /\/api\/mobile\/search/.test(model) &&
      /\/api\/mobile\/contracts/.test(model) &&
      /\/api\/mobile\/lien-service/.test(model),
  },
)

const failed = checks.filter((check) => !check.pass)

for (const check of checks) {
  console.log(`${check.pass ? "PASS" : "FAIL"} ${check.label}`)
}

if (failed.length > 0) {
  console.error(`\nMobile readiness verification failed: ${failed.length} check(s).`)
  process.exit(1)
}

console.log("\nMobile readiness verification passed.")

