import { getSiteUrl } from "@/lib/env"

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim()
}

function isInternalDockerHost(host: string) {
  const normalized = host.toLowerCase()

  return (
    normalized === "0.0.0.0" ||
    normalized.startsWith("0.0.0.0:") ||
    normalized === "client-bureau" ||
    normalized.startsWith("client-bureau:") ||
    normalized === "0"
  )
}

function safeProtocol(value: string | undefined, fallback: string) {
  return value === "http" || value === "https" ? value : fallback
}

export function getRequestOrigin(request: Request) {
  const requestUrl = new URL(request.url)
  const forwardedHost = firstHeaderValue(request.headers.get("x-forwarded-host"))
  const forwardedProto = firstHeaderValue(request.headers.get("x-forwarded-proto"))
  const host = forwardedHost || firstHeaderValue(request.headers.get("host")) || requestUrl.host

  if (host && !isInternalDockerHost(host)) {
    const protocol = safeProtocol(forwardedProto, requestUrl.protocol.replace(":", ""))

    return `${protocol}://${host}`
  }

  return getSiteUrl()
}

export function getInternalRedirectUrl(path: string, request: Request) {
  const safePath = path.startsWith("/") && !path.startsWith("//") ? path : "/"

  return new URL(safePath, `${getRequestOrigin(request)}/`)
}
