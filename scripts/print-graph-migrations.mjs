import { readFileSync } from "node:fs"
import { join } from "node:path"

const migrationFiles = [
  "0014_multi_profile_schema.sql",
  "0015_multi_profile_backfill.sql",
  "0016_project_job_reputation_graph.sql",
  "0017_project_job_graph_backfill.sql",
  "0018_response_graph_links.sql",
]

const root = process.cwd()
const migrationsDir = join(root, "supabase", "migrations")

console.log("-- Client Bureau manual Supabase graph migration bundle")
console.log("-- Run this in Supabase SQL Editor after migrations 0001 through 0013.")
console.log("-- Safe to re-run: migrations use idempotent create/add-if-not-exists patterns where possible.")
console.log("")

for (const file of migrationFiles) {
  console.log("")
  console.log(`-- ============================================================`)
  console.log(`-- ${file}`)
  console.log(`-- ============================================================`)
  console.log("")
  console.log(readFileSync(join(migrationsDir, file), "utf8").trim())
  console.log("")
}
