export const savedSearchAccountSuccessMessage = "Search saved to your account."

export const savedSearchBrowserFallbackMessage =
  "Search saved in this browser. Account-level saved searches are temporarily unavailable."

export const contractPacketValidationBaseMessage =
  "Finish the required agreement fields before creating the packet."

export const contractPacketCreatedMessage =
  "Agreement packet created. Review it and create a private signing link when ready."

const agreementPolicyFields = new Set(["changeOrderPolicy", "cancellationPolicy"])

export function contractPacketValidationMessage(fieldErrors?: Record<string, string[]>) {
  if (!fieldErrors) return contractPacketValidationBaseMessage

  const hasPolicyError = Object.keys(fieldErrors).some(
    (field) => agreementPolicyFields.has(field) && fieldErrors[field]?.length,
  )

  if (!hasPolicyError) return contractPacketValidationBaseMessage

  return `${contractPacketValidationBaseMessage} Agreement policies need attention.`
}
