import { createHash } from "node:crypto"

export function normalizeInquiryEmail(email: string) {
  return email.trim().toLowerCase()
}

export function hashInquiryEmail(email: string) {
  return `sha256:${createHash("sha256").update(normalizeInquiryEmail(email)).digest("hex")}`
}

export function maskInquiryEmail(email: string) {
  const normalized = normalizeInquiryEmail(email)
  const [local = "", domain = ""] = normalized.split("@")

  if (!local || !domain) return "private email"

  const visibleLocal =
    local.length <= 2
      ? `${local.at(0) ?? ""}*`
      : `${local.slice(0, 2)}${"*".repeat(Math.min(local.length - 2, 5))}`
  const [domainName = "", ...domainParts] = domain.split(".")
  const visibleDomain = domainName.length <= 2 ? `${domainName.at(0) ?? ""}*` : `${domainName.slice(0, 2)}***`
  const suffix = domainParts.length > 0 ? `.${domainParts.at(-1)}` : ""

  return `${visibleLocal}@${visibleDomain}${suffix}`
}

export function publicInquiryTopicLabel(topic: string) {
  switch (topic) {
    case "account_help":
      return "Account help"
    case "report_or_moderation":
      return "Report or moderation"
    case "client_response_or_correction":
      return "Client response or correction"
    case "profile_claim_or_verification":
      return "Profile claim or verification"
    case "enterprise_or_team_review":
      return "Enterprise or team review"
    case "privacy_or_policy":
      return "Privacy or policy"
    default:
      return "Other"
  }
}

export function publicInquiryTypeLabel(type: string) {
  return type === "enterprise" ? "Enterprise inquiry" : "Support inquiry"
}
