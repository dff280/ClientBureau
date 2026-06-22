export const savedSearchAccountSuccessMessage = "Search saved to your account."

export const savedSearchBrowserFallbackMessage =
  "Search saved in this browser. Account-level saved searches are temporarily unavailable."

export const contractPacketValidationBaseMessage =
  "Finish the required agreement fields before creating the packet."

export const contractPacketCreatedMessage =
  "Agreement packet created. Review it and create a private signing link when ready."

export const reportSubmissionValidationBaseMessage =
  "Finish the required report fields before submitting for moderation."

export const reportSubmissionConcernSuccessMessage =
  "Client experience report received. It is queued for moderation review."

export const reportSubmissionPositiveSuccessMessage =
  "Positive client experience received. It is queued for moderation review."

export const clientResponseValidationBaseMessage =
  "Finish the required response or correction fields before sending."

export const clientResponseSuccessMessage =
  "Response received. It is queued for moderation and contact verification."

export const profileClaimValidationBaseMessage =
  "Finish the required profile claim fields before sending verification."

export const profileClaimSuccessMessage =
  "Profile claim received. Client Bureau will verify the relationship before changing public ownership."

const agreementPolicyFields = new Set(["changeOrderPolicy", "cancellationPolicy"])

export function contractPacketValidationMessage(fieldErrors?: Record<string, string[]>) {
  if (!fieldErrors) return contractPacketValidationBaseMessage

  const hasPolicyError = Object.keys(fieldErrors).some(
    (field) => agreementPolicyFields.has(field) && fieldErrors[field]?.length,
  )

  if (!hasPolicyError) return contractPacketValidationBaseMessage

  return `${contractPacketValidationBaseMessage} Agreement policies need attention.`
}

const reportAttestationFields = new Set([
  "documentationCertification",
  "evidencePrivacyCertification",
  "moderationCertification",
  "noHarassmentCertification",
  "publicSummaryCertification",
  "relationshipCertification",
  "responseRightCertification",
  "truthfulCertification",
])

export function reportSubmissionValidationMessage(fieldErrors?: Record<string, string[]>) {
  if (!fieldErrors) return reportSubmissionValidationBaseMessage

  const fields = Object.keys(fieldErrors).filter((field) => fieldErrors[field]?.length)
  const hasAttestationError = fields.some((field) => reportAttestationFields.has(field))
  const hasPublicSummaryError = fields.includes("reportSummary")
  const hasRelationshipError = fields.some((field) =>
    ["relationshipType", "relationshipVerificationSummary", "subjectProfileType"].includes(field),
  )

  const addendum = [
    hasRelationshipError ? "Relationship context needs attention." : undefined,
    hasPublicSummaryError ? "Public summary needs safer factual detail." : undefined,
    hasAttestationError ? "Review attestations need confirmation." : undefined,
  ].filter(Boolean)

  return addendum.length > 0
    ? `${reportSubmissionValidationBaseMessage} ${addendum.join(" ")}`
    : reportSubmissionValidationBaseMessage
}

export function clientResponseValidationMessage(fieldErrors?: Record<string, string[]>) {
  if (!fieldErrors) return clientResponseValidationBaseMessage

  const fields = Object.keys(fieldErrors).filter((field) => fieldErrors[field]?.length)
  const needsProfile = fields.includes("profileUrl")
  const needsSummary = fields.includes("responseSummary")
  const needsCertification =
    fields.includes("contactCertification") || fields.includes("documentationCertification")

  const addendum = [
    needsProfile ? "Profile reference needs attention." : undefined,
    needsSummary ? "Response summary needs factual detail." : undefined,
    needsCertification ? "Certification checkboxes need confirmation." : undefined,
  ].filter(Boolean)

  return addendum.length > 0
    ? `${clientResponseValidationBaseMessage} ${addendum.join(" ")}`
    : clientResponseValidationBaseMessage
}

export function profileClaimValidationMessage(fieldErrors?: Record<string, string[]>) {
  if (!fieldErrors) return profileClaimValidationBaseMessage

  const fields = Object.keys(fieldErrors).filter((field) => fieldErrors[field]?.length)
  const needsTarget = fields.includes("profileSlug") || fields.includes("profileId")
  const needsVerification = fields.includes("verificationSummary") || fields.includes("relationshipToProfile")
  const needsCertification = fields.includes("truthfulCertification")

  const addendum = [
    needsTarget ? "Profile target needs attention." : undefined,
    needsVerification ? "Verification relationship needs more detail." : undefined,
    needsCertification ? "Accuracy certification needs confirmation." : undefined,
  ].filter(Boolean)

  return addendum.length > 0
    ? `${profileClaimValidationBaseMessage} ${addendum.join(" ")}`
    : profileClaimValidationBaseMessage
}
