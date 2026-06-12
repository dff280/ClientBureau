import packageJson from "../../../../package.json"
import { NextResponse } from "next/server"

import { noStoreHeaders } from "@/lib/http"
import { getReleaseLastModifiedIso } from "@/lib/release"

export const dynamic = "force-dynamic"

function readFirstEnv(keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]
    if (value) return value
  }

  return null
}

export async function GET() {
  return NextResponse.json(
    {
      name: packageJson.name,
      version: packageJson.version,
      commit: readFirstEnv(["GIT_COMMIT_SHA", "SOURCE_VERSION", "NEXT_PUBLIC_GIT_COMMIT_SHA", "VERCEL_GIT_COMMIT_SHA"]),
      branch: readFirstEnv(["GIT_BRANCH", "VERCEL_GIT_COMMIT_REF"]),
      releaseDate: getReleaseLastModifiedIso(),
      dataMode: process.env.DATA_MODE ?? "mock",
      platformFeatureDataMode: process.env.PLATFORM_FEATURE_DATA_MODE ?? "mock",
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? null,
      nodeEnv: process.env.NODE_ENV ?? null,
      timestamp: new Date().toISOString(),
    },
    { headers: noStoreHeaders },
  )
}
