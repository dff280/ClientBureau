import { spawn } from "node:child_process"
import { cpSync, existsSync } from "node:fs"
import net from "node:net"

const standaloneServer = ".next/standalone/server.js"
const standalonePublic = ".next/standalone/public"
const standaloneStatic = ".next/standalone/.next/static"
const host = process.env.SEO_LOCAL_HOST || "127.0.0.1"
const preferredPort = Number(process.env.SEO_LOCAL_PORT || process.env.PORT || 4100)

function log(message) {
  console.log(`[seo:check:local] ${message}`)
}

function findAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    const tryPort = (port) => {
      const server = net.createServer()

      server.once("error", (error) => {
        if (error.code === "EADDRINUSE") {
          tryPort(port + 1)
          return
        }

        reject(error)
      })

      server.once("listening", () => {
        server.close(() => resolve(port))
      })

      server.listen(port, host)
    }

    tryPort(startPort)
  })
}

async function waitForServer(url, timeoutMs = 20000) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, { method: "HEAD" })

      if (response.ok || response.status < 500) return
    } catch {
      // Keep polling until the standalone server is ready.
    }

    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  throw new Error(`Timed out waiting for ${url}`)
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      shell: false,
      stdio: "inherit",
      ...options,
    })

    child.once("error", reject)
    child.once("exit", (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${command} ${args.join(" ")} exited with ${code}`))
      }
    })
  })
}

if (!existsSync(standaloneServer)) {
  console.error(
    `[seo:check:local] Missing ${standaloneServer}. Run "npm run build" before "npm run seo:check:local".`,
  )
  process.exit(1)
}

if (existsSync("public")) {
  cpSync("public", standalonePublic, { recursive: true, force: true })
}

if (existsSync(".next/static")) {
  cpSync(".next/static", standaloneStatic, { recursive: true, force: true })
}

const port = await findAvailablePort(preferredPort)
const baseUrl = `http://${host}:${port}`
const server = spawn(process.execPath, [standaloneServer], {
  env: {
    ...process.env,
    PORT: String(port),
    HOSTNAME: host,
  },
  shell: false,
  stdio: ["ignore", "pipe", "pipe"],
})

let serverOutput = ""
server.stdout.on("data", (chunk) => {
  serverOutput += chunk.toString()
})
server.stderr.on("data", (chunk) => {
  serverOutput += chunk.toString()
})

try {
  log(`starting standalone server at ${baseUrl}`)
  await waitForServer(baseUrl)
  log("server ready; running SEO verification")
  await run(process.execPath, ["scripts/verify-seo.mjs"], {
    env: {
      ...process.env,
      SEO_BASE_URL: baseUrl,
    },
  })
  log("SEO verification passed")
} catch (error) {
  if (serverOutput.trim()) {
    console.error("[seo:check:local] standalone server output:")
    console.error(serverOutput.trim())
  }

  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
} finally {
  if (!server.killed) server.kill()
}
