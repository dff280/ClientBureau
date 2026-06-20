import type { SiteErrorReport } from "@/lib/types"
import type { SiteErrorReportInput } from "@/lib/schemas/client-bureau"

const sensitivePatterns: [RegExp, string][] = [
  [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]"],
  [/\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g, "[redacted-phone]"],
  [/\b(?:password|passcode|access token|bearer token|service role|secret key|api key|private key)\s*[:=]\s*\S+/gi, "[redacted-secret]"],
  [/\b(?:storage\/v1\/object|report-evidence|private evidence|signed_snapshot|private_access_code)\S*/gi, "[redacted-private-path]"],
]

export function redactSiteErrorText(value?: string) {
  if (!value) return undefined

  return sensitivePatterns.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value.trim())
}

export function safeSiteErrorRoute(value?: string) {
  if (!value) return "/"

  const trimmed = value.trim()
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("\\") || /[\u0000-\u001f]/.test(trimmed)) {
    return "/"
  }

  return trimmed.slice(0, 180)
}

export function sanitizeSiteErrorMetadata(metadata?: SiteErrorReportInput["metadata"]): SiteErrorReport["metadata"] {
  if (!metadata) return {}

  return Object.fromEntries(
    Object.entries(metadata)
      .slice(0, 12)
      .map(([key, value]) => [key.slice(0, 60), typeof value === "string" ? redactSiteErrorText(value)?.slice(0, 180) ?? "" : value]),
  )
}

export function sanitizeSiteErrorReportInput(input: SiteErrorReportInput): SiteErrorReportInput {
  return {
    ...input,
    route: safeSiteErrorRoute(input.route),
    pageTitle: redactSiteErrorText(input.pageTitle)?.slice(0, 160),
    message: redactSiteErrorText(input.message)?.slice(0, 700) ?? "Site issue reported.",
    notes: redactSiteErrorText(input.notes)?.slice(0, 1200),
    userAgent: redactSiteErrorText(input.userAgent)?.slice(0, 240),
    browserLanguage: redactSiteErrorText(input.browserLanguage)?.slice(0, 40),
    metadata: sanitizeSiteErrorMetadata(input.metadata),
  }
}
