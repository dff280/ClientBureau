import { getSiteUrl } from "@/lib/env"

export const dynamic = "force-static"

export async function GET() {
  const siteUrl = getSiteUrl()
  const expires = new Date()
  expires.setUTCFullYear(expires.getUTCFullYear() + 1)

  const body = [
    `Contact: mailto:admin@clientbureau.com`,
    `Contact: ${siteUrl}/contact`,
    `Expires: ${expires.toISOString()}`,
    `Preferred-Languages: en`,
    `Canonical: ${siteUrl}/.well-known/security.txt`,
    `Policy: ${siteUrl}/privacy`,
    "",
  ].join("\n")

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  })
}
