import { z } from "zod"

import {
  businessTypes,
  clientTypes,
  companySizes,
  jobStatuses,
  normalizeCityName,
  normalizeStateCode,
  onboardingGoals,
  paymentDisputeStatuses,
  usStateCodes,
  yearsInBusinessOptions,
} from "@/lib/locations"
import {
  accountTypes,
  clientProfileSubtypes,
  contractorProfileSubtypes,
  isPositiveReportCategory,
  publicInquiryTopics,
  publicInquiryTypes,
  profileTypes,
  jobBillingRelationships,
  jobParticipantStatuses,
  projectJobPriorities,
  projectJobStatuses,
  projectJobTypes,
  projectProfileRoles,
  projectPropertyTypes,
  reportCategories,
  reportRelationshipTypes,
  riskLevels,
  subcontractorProfileSubtypes,
} from "@/lib/types"

export const discussionCategories = [
  "Contractor Experience",
  "Client Response",
  "Resolution Update",
  "Supporting Context",
  "Dispute / Correction",
  "Reference / Verification",
] as const

const requiredText = (label: string, min = 2) =>
  z
    .string()
    .trim()
    .min(min, `${label} is required.`)

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))

const stateCode = (label: string) =>
  z.preprocess(
    (value) => (typeof value === "string" ? normalizeStateCode(value) : value),
    z.enum(usStateCodes, { error: `${label} must be selected from the state list.` }),
  )

const cityText = (label: string) =>
  z
    .string()
    .trim()
    .transform(normalizeCityName)
    .pipe(z.string().min(2, `${label} is required.`).max(80, `${label} must be under 80 characters.`))

const optionalChoice = <T extends readonly [string, ...string[]]>(values: T) =>
  z.enum(values).optional().or(z.literal("")).transform((value) => value || undefined)

const checkbox = z.preprocess((value) => value === "on" || value === "true" || value === true, z.boolean())

const rawEmailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
const rawPhonePattern = /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/
const privateIdentifierPattern =
  /\b(?:ssn|social security|driver'?s license|bank account|routing number|credit card|card number|gate code|lockbox|password|passcode)\b/i
const evidenceUploadPattern =
  /\b(?:attached|attachment|upload|evidence file|invoice file|screenshot|photo evidence|storage\/v1\/object|report-evidence)\b/i

function hasGeneralInquirySensitiveDetails(value: string) {
  return (
    rawEmailPattern.test(value) ||
    rawPhonePattern.test(value) ||
    privateIdentifierPattern.test(value) ||
    evidenceUploadPattern.test(value)
  )
}

const money = (label: string) =>
  z.coerce
    .number({ error: `${label} must be a number.` })
    .min(0, `${label} cannot be negative.`)
    .max(10_000_000, `${label} is above the current review limit.`)

const optionalMoney = (label: string) =>
  z
    .union([z.literal(""), money(label)])
    .optional()
    .transform((value) => (value === "" ? undefined : value))

const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined)

export const businessRelationshipRoleOptions = [
  "Prime contractor / GC",
  "Subcontractor / trade partner",
  "Service business",
  "Project owner / customer",
  "Property manager",
  "Vendor / supplier",
  "Other",
] as const

export const scopeDocumentationStatusOptions = [
  "Signed contract",
  "Written proposal accepted",
  "Text/email approval",
  "Purchase order/work order",
  "Verbal agreement only",
  "No clear scope document",
] as const

export const workAuthorizationStatusOptions = [
  "Authorized before work started",
  "Change order authorized",
  "Emergency work authorization",
  "Authorization disputed",
  "Not sure",
] as const

function milestoneScheduleTotals(value?: string) {
  const lines = (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) return { valid: true, total: 0 }

  let total = 0

  for (const line of lines) {
    const [, amountPart] = line.split("|").map((part) => part.trim())
    const amount = Number((amountPart ?? "").replace(/[$,]/g, ""))

    if (!amountPart || !Number.isFinite(amount) || amount < 0) {
      return { valid: false, total: 0 }
    }

    total += amount
  }

  return { valid: true, total }
}

export const clientReportSchema = z
  .object({
    subjectProfileId: optionalText,
    subjectProfileType: z.enum(profileTypes).optional(),
    subjectProfileSubtype: z
      .enum([...clientProfileSubtypes, ...contractorProfileSubtypes, ...subcontractorProfileSubtypes] as [string, ...string[]])
      .optional()
      .or(z.literal(""))
      .transform((value) => value || undefined),
    relationshipType: z.enum(reportRelationshipTypes).optional(),
    clientType: z.enum(clientTypes).optional(),
    reportedBusinessRole: optionalChoice(businessRelationshipRoleOptions),
    counterpartyBusinessRole: optionalChoice(businessRelationshipRoleOptions),
    hiringPartyNamePrivate: z.string().trim().max(160, "Keep private hiring-party context under 160 characters.").optional().transform((value) => value || undefined),
    scopeDocumentationStatus: optionalChoice(scopeDocumentationStatusOptions),
    workAuthorizationStatus: optionalChoice(workAuthorizationStatusOptions),
    retainageAmount: optionalMoney("Retainage amount"),
    paymentApplicationReference: z.string().trim().max(120, "Keep payment application reference under 120 characters.").optional().transform((value) => value || undefined),
    licenseInsuranceContext: z.string().trim().max(400, "Keep license/insurance context under 400 characters.").optional().transform((value) => value || undefined),
    relationshipVerificationSummary: z.string().trim().max(900, "Keep relationship verification under 900 characters.").optional().transform((value) => value || undefined),
    firstName: requiredText("Client first name"),
    lastName: requiredText("Client last name"),
    businessName: optionalText,
    email: z.email("Enter a valid email for private matching.").optional().or(z.literal("")),
    phone: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value ? value : undefined)),
    city: cityText("Client city"),
    state: stateCode("Client state"),
    zip: z.string().trim().max(10, "Keep ZIP under 10 characters.").optional(),
    jobAddress: z.string().trim().max(160, "Keep private job address under 160 characters.").optional().transform((value) => value || undefined),
    tradeCategory: optionalText,
    otherTradeCategoryDetail: z.string().trim().max(80, "Keep other trade detail under 80 characters.").optional().transform((value) => value || undefined),
    jobType: optionalText,
    otherJobTypeDetail: z.string().trim().max(80, "Keep other job type detail under 80 characters.").optional().transform((value) => value || undefined),
    jobStartDate: optionalDate,
    jobCompletionDate: optionalDate,
    jobStatus: z.enum(jobStatuses).optional().or(z.literal("")).transform((value) => value || undefined),
    projectJobId: optionalText,
    projectJobTitle: z.string().trim().max(120, "Keep the project/job label under 120 characters.").optional().transform((value) => value || undefined),
    projectType: requiredText("Project type"),
    otherProjectTypeDetail: z.string().trim().max(80, "Keep other service detail under 80 characters.").optional().transform((value) => value || undefined),
    projectCity: cityText("Project city"),
    projectState: stateCode("Project state"),
    contractAmount: money("Contract amount"),
    depositRequested: optionalMoney("Deposit requested"),
    depositPaid: optionalMoney("Deposit paid"),
    finalInvoiceAmount: optionalMoney("Final invoice amount"),
    materialsPurchasedAmount: optionalMoney("Materials purchased amount"),
    amountUnpaid: money("Amount unpaid"),
    signedContract: z.coerce.boolean().optional(),
    writtenChangeOrder: z.coerce.boolean().optional(),
    reportCategory: z.enum(reportCategories),
    secondaryCategory: z.enum(reportCategories).optional().or(z.literal("")).transform((value) => value || undefined),
    paymentStatus: requiredText("Payment status"),
    disputeStatus: z.enum(paymentDisputeStatuses).optional().or(z.literal("")).transform((value) => value || undefined),
    amountDisputed: optionalMoney("Amount disputed"),
    daysOverdue: z.union([z.literal(""), z.coerce.number().min(0).max(3650)]).optional().transform((value) => value === "" ? undefined : value),
    clientResponded: z.coerce.boolean().optional(),
    issueResolved: z.coerce.boolean().optional(),
    resolutionSummary: z.string().trim().max(700, "Keep resolution summary under 700 characters.").optional().transform((value) => value || undefined),
    paymentReminderSent: z.coerce.boolean().optional(),
    demandLetterSent: z.coerce.boolean().optional(),
    lienNoticeStarted: z.coerce.boolean().optional(),
    reportSummary: requiredText("Public report summary", 20).max(
      600,
      "Keep the public summary under 600 characters.",
    ),
    detailedExperience: requiredText("Detailed experience", 40).max(
      3000,
      "Keep the detailed experience under 3,000 characters.",
    ),
    whatWasAgreed: z.string().trim().max(900, "Keep agreement details under 900 characters.").optional().transform((value) => value || undefined),
    workCompleted: z.string().trim().max(900, "Keep completed-work details under 900 characters.").optional().transform((value) => value || undefined),
    paymentIssue: z.string().trim().max(900, "Keep payment issue details under 900 characters.").optional().transform((value) => value || undefined),
    evidenceSupport: z.string().trim().max(900, "Keep evidence details under 900 characters.").optional().transform((value) => value || undefined),
    desiredResolution: z.string().trim().max(900, "Keep resolution details under 900 characters.").optional().transform((value) => value || undefined),
    evidenceAttached: z.coerce.boolean().optional(),
    truthfulCertification: z.coerce.boolean().optional(),
    documentationCertification: z.coerce.boolean().optional(),
    publicSummaryCertification: z.coerce.boolean().optional(),
    relationshipCertification: z.coerce.boolean().optional(),
    moderationCertification: z.coerce.boolean().optional(),
    evidencePrivacyCertification: z.coerce.boolean().optional(),
    responseRightCertification: z.coerce.boolean().optional(),
    noHarassmentCertification: z.coerce.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    const isBusinessProfile = value.subjectProfileType === "contractor" || value.subjectProfileType === "subcontractor"

    if (!isBusinessProfile) return

    const addIssue = (path: keyof typeof value, message: string) => {
      ctx.addIssue({ code: "custom", path: [path], message })
    }
    const hasText = (text?: string, min = 2) => Boolean(text && text.trim().length >= min)
    const isConcernReport = !isPositiveReportCategory(value.reportCategory)

    if (!value.subjectProfileSubtype) {
      addIssue("subjectProfileSubtype", "Choose the contractor or subcontractor profile subtype.")
    }

    if (!value.reportedBusinessRole) {
      addIssue("reportedBusinessRole", "Choose the reported party's business role.")
    }

    if (!value.counterpartyBusinessRole) {
      addIssue("counterpartyBusinessRole", "Choose your or the counterparty's role in the job.")
    }

    if (!value.relationshipType) {
      addIssue("relationshipType", "Choose the business relationship for this report.")
    }

    if (
      value.subjectProfileType === "contractor" &&
      value.relationshipType &&
      !["subcontractor_to_contractor", "client_to_contractor", "business_to_business"].includes(value.relationshipType)
    ) {
      addIssue(
        "relationshipType",
        "Reports about contractors should use subcontractor-to-contractor, client-to-contractor, or business-to-business context.",
      )
    }

    if (
      value.subjectProfileType === "subcontractor" &&
      value.relationshipType &&
      !["contractor_to_subcontractor", "business_to_business"].includes(value.relationshipType)
    ) {
      addIssue(
        "relationshipType",
        "Reports about subcontractors should use contractor-to-subcontractor or business-to-business context.",
      )
    }

    if (!hasText(value.businessName) && !(hasText(value.firstName) && hasText(value.lastName))) {
      addIssue("businessName", "Provide a business/display name or the reported party's first and last name.")
    }

    if (!hasText(value.tradeCategory)) {
      addIssue("tradeCategory", "Trade or service category is required for contractor and subcontractor reports.")
    }

    if (!hasText(value.jobType)) {
      addIssue("jobType", "Job type is required for contractor and subcontractor reports.")
    }

    if (!value.jobStatus) {
      addIssue("jobStatus", "Job status is required for contractor and subcontractor reports.")
    }

    if (!hasText(value.projectJobTitle)) {
      addIssue("projectJobTitle", "Project/job label is required for contractor and subcontractor reports.")
    }

    if (!value.scopeDocumentationStatus) {
      addIssue("scopeDocumentationStatus", "Choose how the scope or agreement was documented.")
    }

    if (!value.workAuthorizationStatus) {
      addIssue("workAuthorizationStatus", "Choose how the work was authorized.")
    }

    if (!hasText(value.relationshipVerificationSummary, 20)) {
      addIssue("relationshipVerificationSummary", "Explain how you know this business relationship and what documentation supports it.")
    }

    if (!hasText(value.whatWasAgreed, 20)) {
      addIssue("whatWasAgreed", "Describe the agreed scope, payment terms, or project responsibility.")
    }

    if (!hasText(value.workCompleted, 20)) {
      addIssue("workCompleted", "Describe the work, delivery, milestone, or business obligation completed.")
    }

    if (!hasText(value.evidenceSupport, 20)) {
      addIssue("evidenceSupport", "Describe the evidence available for moderator review.")
    }

    if (isConcernReport && !hasText(value.paymentIssue, 20)) {
      addIssue("paymentIssue", "Describe the payment, scope, retainage, or dispute issue in neutral terms.")
    }
  })
  .refine((value) => value.amountUnpaid <= value.contractAmount, {
    path: ["amountUnpaid"],
    message: "Amount unpaid cannot exceed the contract amount.",
  })
  .refine((value) => !isPositiveReportCategory(value.reportCategory) || value.amountUnpaid === 0, {
    path: ["amountUnpaid"],
    message: "Positive reports must use 0 for amount unpaid.",
  })
  .refine((value) => value.truthfulCertification === true, {
    path: ["truthfulCertification"],
    message: "Confirm that the report is truthful to the best of your knowledge.",
  })
  .refine((value) => value.documentationCertification === true, {
    path: ["documentationCertification"],
    message: "Confirm that documentation is available or accurately described.",
  })
  .refine((value) => value.publicSummaryCertification === true, {
    path: ["publicSummaryCertification"],
    message: "Confirm that the public summary avoids private or inflammatory claims.",
  })
  .refine((value) => value.relationshipCertification === true, {
    path: ["relationshipCertification"],
    message: "Confirm that you had a real commercial relationship with the reported party.",
  })
  .refine((value) => value.moderationCertification === true, {
    path: ["moderationCertification"],
    message: "Confirm that public summaries are moderated before publication.",
  })
  .refine((value) => value.evidencePrivacyCertification === true, {
    path: ["evidencePrivacyCertification"],
    message: "Confirm that private evidence is not automatically public.",
  })
  .refine((value) => value.responseRightCertification === true, {
    path: ["responseRightCertification"],
    message: "Confirm that reported parties may respond or request correction.",
  })
  .refine((value) => value.noHarassmentCertification === true, {
    path: ["noHarassmentCertification"],
    message: "Confirm that public summaries will not include threats, harassment, or sensitive personal information.",
  })

export const clientResponseSchema = z.object({
  name: requiredText("Your name"),
  email: z.email("Enter a valid email for review contact."),
  phone: optionalText,
  profileUrl: requiredText("Profile URL", 6),
  reportId: optionalText,
  projectJobId: optionalText,
  requestType: z.enum(["Publish a response", "Dispute a report", "Request correction", "Resolution update"]),
  verificationMethod: z.enum(["Email verification", "Phone verification", "Business documentation"]).optional(),
  attachmentUrl: optionalText,
  responseSummary: requiredText("Response summary", 30).max(
    1800,
    "Keep the response summary under 1,800 characters.",
  ),
  contactCertification: z.coerce.boolean().optional(),
  documentationCertification: z.coerce.boolean().optional(),
}).refine((value) => value.contactCertification === true, {
  path: ["contactCertification"],
  message: "Confirm that your contact information is accurate for moderation follow-up.",
}).refine((value) => value.documentationCertification === true, {
  path: ["documentationCertification"],
  message: "Confirm that any submitted documentation is accurate and relevant.",
})

export const signupSchema = z.object({
  accountType: z.enum(accountTypes, { error: "Choose an account type." }),
  fullName: requiredText("Full name"),
  email: z.email("Enter a valid email."),
  password: requiredText("Password", 8),
  businessName: requiredText("Business or display name"),
  businessType: optionalChoice(businessTypes),
  trade: requiredText("Trade, service, or relationship context"),
  otherTradeDetail: z.string().trim().max(80, "Keep other trade detail under 80 characters.").optional().transform((value) => value || undefined),
  businessPhone: optionalText,
  websiteUrl: z.url("Enter a valid website URL.").optional().or(z.literal("")).transform((value) => value || undefined),
  licenseNumber: optionalText,
  yearsInBusiness: optionalChoice(yearsInBusinessOptions),
  companySize: optionalChoice(companySizes),
  serviceArea: z.string().trim().max(500, "Keep service areas under 500 characters.").optional().transform((value) => value || undefined),
  primaryGoal: optionalChoice(onboardingGoals),
  city: cityText("City"),
  state: stateCode("State"),
})

export const loginSchema = z.object({
  email: z.email("Enter a valid email."),
  password: requiredText("Password", 6),
})

export const adminReviewSchema = z.object({
  reportId: requiredText("Report ID"),
  decision: z.enum(["approved", "rejected"]),
  editedPublicSummary: requiredText("Edited public summary", 20).max(
    700,
    "Keep the edited public summary under 700 characters.",
  ),
  moderatorNote: z.string().trim().max(700, "Keep the moderator note under 700 characters.").optional(),
  checklistEvidence: z.coerce.boolean().optional(),
  checklistNeutral: z.coerce.boolean().optional(),
  checklistPrivate: z.coerce.boolean().optional(),
})

export const bulkAdminReviewSchema = z.object({
  reportIds: z
    .string()
    .trim()
    .min(1, "Select at least one report.")
    .transform((value) => value.split(",").map((item) => item.trim()).filter(Boolean)),
  decision: z.enum(["approved", "rejected", "deleted"]),
})

export const communityDiscussionSchema = z
  .object({
    profileSlug: requiredText("Profile", 3),
    reportId: optionalText,
    name: requiredText("Name"),
    email: z.email("Enter a valid email for moderation contact."),
    relationshipCategory: z.enum(discussionCategories),
    commentBody: requiredText("Comment", 30).max(
      1800,
      "Keep the public discussion comment under 1,800 characters.",
    ),
    attachmentUrl: optionalText,
    truthfulCertification: z.coerce.boolean().optional(),
  })
  .refine((value) => value.truthfulCertification === true, {
    path: ["truthfulCertification"],
    message: "Confirm that the submission is truthful to the best of your knowledge.",
  })

export const adminDiscussionReviewSchema = z.object({
  discussionId: requiredText("Discussion ID"),
  decision: z.enum(["approved", "rejected", "deleted", "verified"]),
  moderatorNote: z.string().trim().max(700).optional(),
})

export const adminClientUpdateSchema = z.object({
  clientId: requiredText("Client ID"),
  firstName: requiredText("First name"),
  lastName: requiredText("Last name"),
  businessName: optionalText,
  city: requiredText("City"),
  state: stateCode("State"),
  zip: z.string().trim().max(10, "Keep ZIP under 10 characters.").optional().transform((value) => value || undefined),
  riskLevel: z.enum(riskLevels),
  clientBureauScore: z.coerce.number().min(0).max(100),
  reportCount: z.coerce.number().int().min(0).max(999).optional(),
  isPublic: z.coerce.boolean().optional(),
  moderatorNote: z.string().trim().max(700).optional(),
})

export const adminContractorUpdateSchema = z.object({
  contractorId: requiredText("Contractor ID"),
  businessName: requiredText("Business name"),
  trade: requiredText("Trade"),
  otherTradeDetail: z.string().trim().max(80, "Keep other trade detail under 80 characters.").optional().transform((value) => value || undefined),
  businessType: optionalChoice(businessTypes),
  businessPhone: optionalText,
  websiteUrl: z.url("Enter a valid website URL.").optional().or(z.literal("")).transform((value) => value || undefined),
  serviceArea: z.string().trim().max(500, "Keep service areas under 500 characters.").optional().transform((value) => value || undefined),
  companySize: optionalChoice(companySizes),
  yearsInBusiness: optionalChoice(yearsInBusinessOptions),
  primaryGoal: optionalChoice(onboardingGoals),
  city: requiredText("City"),
  state: stateCode("State"),
  licenseNumber: optionalText,
  verificationStatus: z.enum(["unverified", "pending", "verified"]),
  moderatorNote: z.string().trim().max(700).optional(),
})

export const adminAccountClassificationSchema = z
  .object({
    contractorId: requiredText("Contractor ID"),
    primaryAccountType: z.enum(accountTypes),
    capabilityContractor: checkbox,
    capabilitySubcontractor: checkbox,
    capabilityClient: checkbox,
    profileSubtype: requiredText("Profile subtype").max(120, "Keep profile subtype under 120 characters."),
    tradeCategory: requiredText("Trade category").max(120, "Keep trade category under 120 characters."),
    isPublic: checkbox,
    verificationStatus: z.enum(["unverified", "pending", "verified"]),
    moderatorNote: requiredText("Moderator note", 8).max(700, "Keep moderator note under 700 characters."),
  })
  .transform((value) => {
    const accountCapabilities = [
      value.capabilityContractor ? "contractor" : undefined,
      value.capabilitySubcontractor ? "subcontractor" : undefined,
      value.capabilityClient ? "client" : undefined,
    ].filter(Boolean) as Array<(typeof profileTypes)[number]>

    return {
      ...value,
      accountCapabilities,
    }
  })
  .refine((value) => value.accountCapabilities.length > 0, {
    path: ["accountCapabilities"],
    message: "Select at least one public capability.",
  })
  .refine((value) => value.accountCapabilities.includes(value.primaryAccountType), {
    path: ["primaryAccountType"],
    message: "The public capabilities must include the primary account type.",
  })

export const adminDeleteRecordSchema = z.object({
  entityType: z.enum(["client", "contractor", "report", "discussion"]),
  entityId: requiredText("Record ID"),
})

export const bulkUploadImportSchema = z.object({
  rows: z.string().trim().min(2, "Upload preview rows before importing."),
})

export const searchSchema = z.object({
  query: z.string().trim().optional().default(""),
  state: stateCode("State").optional(),
  riskLevel: z.enum(riskLevels).optional(),
  category: z.enum(reportCategories).optional(),
  profileType: z.enum(profileTypes).optional(),
  tradeCategory: z.string().trim().max(120, "Keep trade category under 120 characters.").optional().transform((value) => value || undefined),
})

export const profileClaimSchema = z.object({
  profileId: optionalText,
  profileType: z.enum(profileTypes).optional(),
  profileSlug: optionalText,
  claimantName: requiredText("Your name"),
  claimantEmail: z.email("Enter a valid email for verification."),
  relationshipToProfile: requiredText("Relationship to profile"),
  verificationSummary: requiredText("Verification summary", 20).max(
    1200,
    "Keep verification summary under 1,200 characters.",
  ),
  truthfulCertification: z.coerce.boolean().optional(),
}).refine((value) => Boolean(value.profileId || (value.profileType && value.profileSlug)), {
  path: ["profileSlug"],
  message: "Choose a public profile before submitting a claim.",
}).refine((value) => value.truthfulCertification === true, {
  path: ["truthfulCertification"],
  message: "Confirm that the claim information is accurate.",
})

export const adminProfileClaimReviewSchema = z.object({
  claimId: requiredText("Claim ID"),
  decision: z.enum(["approved", "rejected", "disputed"]),
  moderatorNote: requiredText("Moderator note", 8).max(700, "Keep moderator note under 700 characters."),
})

export const adminProfileMergeSchema = z.object({
  sourceProfileId: requiredText("Source profile ID"),
  targetProfileId: requiredText("Target profile ID"),
  reason: requiredText("Merge reason", 12).max(700, "Keep the merge reason under 700 characters."),
  moveReports: z.coerce.boolean().optional(),
}).refine((value) => value.sourceProfileId !== value.targetProfileId, {
  path: ["targetProfileId"],
  message: "Choose two different profiles before merging.",
})

export const adminReportReassignmentSchema = z.object({
  reportId: requiredText("Report ID"),
  nextSubjectProfileId: optionalText,
  nextProjectJobId: optionalText,
  reason: requiredText("Reassignment reason", 12).max(700, "Keep the reassignment reason under 700 characters."),
}).refine((value) => Boolean(value.nextSubjectProfileId || value.nextProjectJobId), {
  path: ["nextSubjectProfileId"],
  message: "Choose a new profile, project/job, or both.",
})

export const adminProfileRedactionSchema = z.object({
  profileId: requiredText("Profile ID"),
  fieldName: z.enum(["display_name", "business_name", "public_summary", "city", "state", "slug"]),
  reason: requiredText("Redaction reason", 12).max(700, "Keep the redaction reason under 700 characters."),
  replacementValue: z.string().trim().max(240, "Keep the replacement value under 240 characters.").optional(),
})

export const savedClientSearchSchema = z.object({
  searchId: optionalText,
  query: z.string().trim().max(240, "Keep search text under 240 characters.").optional().default(""),
  city: optionalText,
  state: stateCode("State").optional(),
  riskLevel: z.enum(riskLevels).optional(),
  category: z.enum(reportCategories).optional(),
  profileType: z.enum(profileTypes).optional(),
  tradeCategory: z.string().trim().max(120, "Keep trade category under 120 characters.").optional().transform((value) => value || undefined),
  resultCount: z.coerce
    .number({ error: "Result count must be a number." })
    .int("Result count must be a whole number.")
    .min(0, "Result count cannot be negative.")
    .max(100000, "Result count is outside the expected range.")
    .default(0),
})

export const deleteSavedClientSearchSchema = z.object({
  searchId: requiredText("Saved search ID"),
})

export const searchAnalyticsEventSchema = z.object({
  query: z.string().trim().max(240).optional(),
  state: stateCode("State").optional(),
  riskLevel: z.enum(riskLevels).optional(),
  category: z.enum(reportCategories).optional(),
  profileType: z.enum(profileTypes).optional(),
  tradeCategory: z.string().trim().max(120).optional().transform((value) => value || undefined),
  resultCount: z.coerce.number().int().min(0).max(100000).optional(),
  eventType: z.enum([
    "search_submitted",
    "suggestion_clicked",
    "result_viewed",
    "save_search",
    "private_identifier_check",
    "no_result",
  ]),
  source: z.enum(["search_page", "profile_page", "directory", "dashboard"]).default("search_page"),
})

export const profileShareEventSchema = z.object({
  profileSlug: requiredText("Profile slug", 3).max(220),
  channel: z.enum(["copy_link", "profile_card", "referral_badge", "social"]),
  source: z.enum(["profile_page", "directory", "dashboard"]).default("profile_page"),
})

export const watchlistItemSchema = z.object({
  clientId: requiredText("Client ID"),
  watchReason: requiredText("Watch reason", 12).max(240, "Keep the watch reason under 240 characters."),
  alertLevel: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
})

export const updateWatchlistItemSchema = z.object({
  itemId: requiredText("Watchlist item ID"),
  status: z.enum(["active", "cleared"]),
})

export const reportDraftSchema = z.object({
  draftId: optionalText,
  clientId: optionalText,
  clientName: requiredText("Client name"),
  projectType: requiredText("Project type"),
  estimatedValue: money("Estimated project value"),
  amountAtRisk: money("Amount at risk"),
  summary: requiredText("Draft summary", 20).max(700, "Keep the draft summary under 700 characters."),
  nextStep: requiredText("Next step", 8).max(240, "Keep the next step under 240 characters."),
  status: z.enum(["draft", "ready_to_submit", "submitted"]).default("draft"),
}).refine((value) => value.amountAtRisk <= value.estimatedValue, {
  path: ["amountAtRisk"],
  message: "Amount at risk cannot exceed the estimated project value.",
})

export const deleteReportDraftSchema = z.object({
  draftId: requiredText("Draft ID"),
})

export const intakeAssessmentSchema = z.object({
  clientName: requiredText("Client name"),
  city: requiredText("City"),
  state: stateCode("State"),
  projectValue: money("Project value"),
  depositReceived: z.coerce.boolean().optional(),
  contractSigned: z.coerce.boolean().optional(),
  privateMatchConfirmed: z.coerce.boolean().optional(),
  notes: z.string().trim().max(700).optional(),
})

export const paymentRecoveryCaseSchema = z.object({
  clientName: requiredText("Client name"),
  city: requiredText("City"),
  state: stateCode("State"),
  amountDue: money("Amount due"),
  invoiceAgeDays: z.coerce
    .number({ error: "Invoice age must be a number." })
    .int("Invoice age must be a whole number.")
    .min(0, "Invoice age cannot be negative.")
    .max(3650, "Invoice age is above the current workflow limit."),
  preferredChannel: z.enum(["email", "phone", "letter", "client_portal"]),
  summary: requiredText("Recovery summary", 20).max(900, "Keep the recovery summary under 900 characters."),
  factualCertification: z.coerce.boolean().optional(),
}).refine((value) => value.factualCertification === true, {
  path: ["factualCertification"],
  message: "Confirm that the recovery record is based on accurate invoice and project documentation.",
})

export const managedRecoveryCaseSchema = z.object({
  clientName: requiredText("Client name"),
  clientEmail: z.email("Enter a valid client email.").optional().or(z.literal("")),
  city: requiredText("City"),
  state: stateCode("State"),
  amountDue: money("Amount due"),
  invoiceAgeDays: z.coerce
    .number({ error: "Invoice age must be a number." })
    .int("Invoice age must be a whole number.")
    .min(0, "Invoice age cannot be negative.")
    .max(3650, "Invoice age is above the current workflow limit."),
  preferredChannel: z.enum(["email", "phone", "letter", "client_portal"]),
  evidenceVaultItemIds: z.string().trim().max(800).optional(),
  summary: requiredText("Case summary", 30).max(1200, "Keep the case summary under 1,200 characters."),
  factualCertification: z.coerce.boolean().optional(),
  serviceTermsCertification: z.coerce.boolean().optional(),
}).refine((value) => value.factualCertification === true, {
  path: ["factualCertification"],
  message: "Confirm the recovery case is based on accurate invoice, project, and communication records.",
}).refine((value) => value.serviceTermsCertification === true, {
  path: ["serviceTermsCertification"],
  message: "Confirm Client Bureau may review the case and contact the client to seek a contractor-direct resolution.",
})

export const serviceFeeCheckoutSchema = z.object({
  entityId: requiredText("Case ID"),
  kind: z.enum(["managed_recovery", "florida_lien_notice", "florida_lien_filing"]),
})

export const servicePrecheckSchema = z.object({
  caseId: requiredText("Case ID"),
})

export const linkEvidenceToServiceCaseSchema = z.object({
  entityType: z.enum(["managed_recovery", "florida_lien"]),
  entityId: requiredText("Case ID"),
  evidenceVaultItemId: requiredText("Evidence item ID"),
  documentLabel: requiredText("Document label", 3).max(140, "Keep the document label under 140 characters."),
  documentCategory: z.enum(["invoice", "screenshot", "contract", "photo", "pdf", "other"]),
  publicSummary: z.string().trim().max(240, "Keep the evidence summary under 240 characters.").optional(),
})

export const markServiceFeePaidSchema = z.object({
  orderId: requiredText("Service fee order ID"),
})

export const resolutionDeskContactSchema = z.object({
  caseId: requiredText("Managed recovery case ID"),
  channel: z.enum(["email", "phone", "letter", "client_portal"]),
  direction: z.enum(["outbound", "inbound", "internal"]).default("outbound"),
  subject: requiredText("Subject", 3).max(160, "Keep the subject under 160 characters."),
  note: requiredText("Contact note", 12).max(900, "Keep the contact note under 900 characters."),
  outcome: z.enum([
    "no_response",
    "client_responded",
    "payment_promised",
    "payment_received",
    "dispute_raised",
    "needs_follow_up",
  ]),
  contactedAt: requiredText("Contact date", 8),
})

export const markRecoveryResolvedSchema = z.object({
  caseId: requiredText("Managed recovery case ID"),
  amountResolved: money("Resolved amount"),
  resolutionSummary: requiredText("Resolution summary", 12).max(900, "Keep the resolution summary under 900 characters."),
})

export const lienNoticeDraftSchema = z.object({
  clientName: requiredText("Client name"),
  projectType: requiredText("Project type"),
  otherProjectTypeDetail: z.string().trim().max(80, "Keep other project type detail under 80 characters.").optional().transform((value) => value || undefined),
  propertyCity: requiredText("Property city"),
  state: stateCode("State"),
  amountDue: money("Amount due"),
  lastWorkDate: requiredText("Last work date", 8),
  targetSendDate: optionalText,
  reviewCertification: z.coerce.boolean().optional(),
}).refine((value) => value.reviewCertification === true, {
  path: ["reviewCertification"],
  message: "Confirm that state-specific lien and notice requirements will be reviewed before sending.",
})

export const floridaLienCaseSchema = z.object({
  workflowType: z.enum(["notice_packet", "claim_of_lien_filing"]),
  clientName: requiredText("Client name"),
  ownerName: requiredText("Owner name"),
  propertyCounty: requiredText("Florida county"),
  propertyCity: requiredText("Property city"),
  state: z.literal("FL", { error: "Florida lien service is currently available only for Florida properties." }),
  parcelNumber: optionalText,
  legalDescription: z.string().trim().max(1800, "Keep the legal description under 1,800 characters.").optional(),
  contractorRole: z.enum(["direct_contractor", "subcontractor", "supplier", "laborer", "other"]),
  projectType: requiredText("Project type"),
  otherProjectTypeDetail: z.string().trim().max(80, "Keep other project type detail under 80 characters.").optional().transform((value) => value || undefined),
  contractAmount: money("Contract amount"),
  amountDue: money("Amount due"),
  firstWorkDate: optionalText,
  lastWorkDate: requiredText("Last work date", 8),
  noticeHistory: requiredText("Notice history", 12).max(1200, "Keep notice history under 1,200 characters."),
  filingDeadline: optionalText,
  targetSendDate: optionalText,
  deliveryMethod: z.enum(["certified_mail", "process_server", "e_recording_vendor", "attorney_vendor", "manual_admin"]).default("certified_mail"),
  filingMethod: z.enum(["attorney_vendor", "e_recording_vendor", "county_clerk_manual"]).default("attorney_vendor"),
  recordingVendor: z.string().trim().max(120).optional(),
  privateSummary: requiredText("Private case summary", 30).max(1200, "Keep the private summary under 1,200 characters."),
  accuracyCertification: z.coerce.boolean().optional(),
  filingTermsCertification: z.coerce.boolean().optional(),
}).refine((value) => value.amountDue <= value.contractAmount, {
  path: ["amountDue"],
  message: "Amount due cannot exceed the contract amount.",
}).refine((value) => !value.firstWorkDate || value.firstWorkDate <= value.lastWorkDate, {
  path: ["lastWorkDate"],
  message: "Last work date cannot be before first work date.",
}).refine((value) => value.accuracyCertification === true, {
  path: ["accuracyCertification"],
  message: "Confirm the lien case information is accurate to the best of your knowledge.",
}).refine((value) => value.filingTermsCertification === true, {
  path: ["filingTermsCertification"],
  message: "Confirm Client Bureau may route this Florida lien case through attorney/vendor review.",
})

export const lienFilingAuthorizationSchema = z.object({
  caseId: requiredText("Florida lien case ID"),
  signerName: requiredText("Signer name"),
  authorityTitle: requiredText("Authority/title", 2).max(120, "Keep the authority/title under 120 characters."),
  signatureName: requiredText("Typed signature"),
  accuracyCertification: z.coerce.boolean().optional(),
  authorityCertification: z.coerce.boolean().optional(),
  vendorReviewCertification: z.coerce.boolean().optional(),
}).refine((value) => value.signatureName.toLowerCase() === value.signerName.toLowerCase(), {
  path: ["signatureName"],
  message: "Typed signature must match signer name.",
}).refine((value) => value.accuracyCertification === true, {
  path: ["accuracyCertification"],
  message: "Confirm the filing information is accurate.",
}).refine((value) => value.authorityCertification === true, {
  path: ["authorityCertification"],
  message: "Confirm you are authorized to sign for the contractor.",
}).refine((value) => value.vendorReviewCertification === true, {
  path: ["vendorReviewCertification"],
  message: "Confirm filing proceeds through attorney/e-recording vendor review.",
})

export const adminLienCaseActionSchema = z.object({
  caseId: requiredText("Florida lien case ID"),
  decisionNote: requiredText("Decision note", 8).max(700, "Keep the decision note under 700 characters."),
})

export const adminRecordLienFiledSchema = z.object({
  caseId: requiredText("Florida lien case ID"),
  filingMethod: z.enum(["attorney_vendor", "e_recording_vendor", "county_clerk_manual"]),
  recordingVendor: z.string().trim().max(120).optional(),
  clerkCounty: requiredText("Clerk county"),
  clerkReference: z.string().trim().max(120).optional(),
  officialRecordBook: z.string().trim().max(80).optional(),
  officialRecordPage: z.string().trim().max(80).optional(),
  instrumentNumber: z.string().trim().max(120).optional(),
  filedAt: requiredText("Filed date", 8),
  filingReceiptPath: z.string().trim().max(500).optional(),
})

export const adminUploadRecordingProofSchema = z.object({
  filingRecordId: requiredText("Filing record ID"),
  recordingConfirmedAt: requiredText("Recording confirmed date", 8),
  officialRecordBook: z.string().trim().max(80).optional(),
  officialRecordPage: z.string().trim().max(80).optional(),
  instrumentNumber: requiredText("Instrument number", 3).max(120, "Keep the instrument number under 120 characters."),
  proofSummary: requiredText("Proof summary", 8).max(700, "Keep the proof summary under 700 characters."),
})

export const adminRecordLienReleaseSchema = z.object({
  caseId: requiredText("Florida lien case ID"),
  releaseReason: z.enum(["paid", "settled", "expired", "withdrawn", "error_correction"]),
  releaseStatus: z.enum(["draft", "sent_for_signature", "recorded", "blocked"]),
  releaseRecordedAt: optionalText,
  releaseInstrumentNumber: z.string().trim().max(120).optional(),
  notes: requiredText("Release notes", 8).max(700, "Keep release notes under 700 characters."),
})

export const contractWorkspaceItemSchema = z.object({
  clientName: requiredText("Client name"),
  projectType: requiredText("Project type"),
  otherProjectTypeDetail: z.string().trim().max(80, "Keep other project type detail under 80 characters.").optional().transform((value) => value || undefined),
  templateType: z.enum([
    "service_agreement",
    "change_order",
    "payment_plan",
    "completion_certificate",
    "notice_of_nonpayment",
  ]),
  contractValue: money("Contract value"),
  depositRequired: money("Deposit required"),
  milestoneBilling: z.coerce.boolean().optional(),
  summary: requiredText("Contract summary", 20).max(900, "Keep the contract summary under 900 characters."),
}).refine((value) => value.depositRequired <= value.contractValue, {
  path: ["depositRequired"],
  message: "Deposit required cannot exceed the contract value.",
})

export const clientPipelineItemSchema = z.object({
  clientId: optionalText,
  clientName: requiredText("Client name"),
  city: requiredText("City"),
  state: stateCode("State"),
  stage: z.enum(["new_lead", "screening", "contract_pending", "active_job", "payment_follow_up", "closed"]),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  estimatedValue: money("Estimated value"),
  nextAction: requiredText("Next action", 8).max(240, "Keep the next action under 240 characters."),
  dueAt: optionalText,
  privateMatch: z.coerce.boolean().optional(),
})

export const updateClientPipelineStageSchema = z.object({
  itemId: requiredText("Pipeline item ID"),
  stage: z.enum(["new_lead", "screening", "contract_pending", "active_job", "payment_follow_up", "closed"]),
})

export const clientRiskRoomSchema = z.object({
  clientId: optionalText,
  clientName: requiredText("Client name"),
  city: requiredText("City"),
  state: stateCode("State"),
  headline: requiredText("Client work file headline", 8).max(160, "Keep the headline under 160 characters."),
  summary: requiredText("Client work file summary", 20).max(900, "Keep the summary under 900 characters."),
})

export const projectJobSchema = z.object({
  jobNumber: z.string().trim().max(80, "Keep job number under 80 characters.").optional().transform((value) => value || undefined),
  title: requiredText("Job name", 3).max(140, "Keep job name under 140 characters."),
  jobType: z.enum(projectJobTypes),
  projectType: requiredText("Service type", 2).max(120, "Keep service type under 120 characters."),
  otherProjectTypeDetail: z.string().trim().max(80, "Keep other service detail under 80 characters.").optional().transform((value) => value || undefined),
  tradeCategory: z.string().trim().max(120, "Keep trade category under 120 characters.").optional().transform((value) => value || undefined),
  otherTradeCategoryDetail: z.string().trim().max(80, "Keep other trade detail under 80 characters.").optional().transform((value) => value || undefined),
  status: z.enum(projectJobStatuses).default("lead"),
  priority: z.enum(projectJobPriorities).default("normal"),
  shortDescription: requiredText("Short description", 10).max(500, "Keep short description under 500 characters."),
  detailedScopeOfWork: z.string().trim().max(2500, "Keep scope of work under 2,500 characters.").optional().transform((value) => value || undefined),
  addressLine1: z.string().trim().max(160, "Keep address line 1 under 160 characters.").optional().transform((value) => value || undefined),
  addressLine2: z.string().trim().max(160, "Keep address line 2 under 160 characters.").optional().transform((value) => value || undefined),
  city: cityText("Job city"),
  state: stateCode("Job state"),
  postalCode: z.string().trim().max(12, "Keep postal code under 12 characters.").optional().transform((value) => value || undefined),
  county: z.string().trim().max(80, "Keep county under 80 characters.").optional().transform((value) => value || undefined),
  propertyType: z.enum(projectPropertyTypes).optional().or(z.literal("")).transform((value) => value || undefined),
  accessInstructions: z.string().trim().max(700, "Keep access instructions under 700 characters.").optional().transform((value) => value || undefined),
  privateAccessCode: z.string().trim().max(120, "Keep private access code under 120 characters.").optional().transform((value) => value || undefined),
  parkingInstructions: z.string().trim().max(500, "Keep parking instructions under 500 characters.").optional().transform((value) => value || undefined),
  siteWarnings: z.string().trim().max(700, "Keep site warnings under 700 characters.").optional().transform((value) => value || undefined),
  startDate: optionalDate,
  targetCompletionDate: optionalDate,
  completionDate: optionalDate,
  contractAmount: money("Contract value"),
  amountDue: optionalMoney("Amount due"),
  customerFacingNotes: z.string().trim().max(900, "Keep customer-facing notes under 900 characters.").optional().transform((value) => value || undefined),
  privateNotes: z.string().trim().max(1200, "Keep private notes under 1,200 characters.").optional().transform((value) => value || undefined),
}).superRefine((value, ctx) => {
  if (value.jobType !== "internal_project" && !value.addressLine1 && !value.shortDescription) {
    ctx.addIssue({
      code: "custom",
      path: ["addressLine1"],
      message: "Add a job address or clear location description for non-internal jobs.",
    })
  }

  if (value.completionDate && value.startDate && value.completionDate < value.startDate) {
    ctx.addIssue({
      code: "custom",
      path: ["completionDate"],
      message: "Completed date cannot be before the start date.",
    })
  }
})

export const updateProjectJobSchema = projectJobSchema.extend({
  jobId: requiredText("Job ID"),
})

export const projectJobParticipantSchema = z.object({
  jobId: requiredText("Job ID"),
  accountId: requiredText("Account"),
  roleOnJob: z.enum(projectProfileRoles),
  hiredByAccountId: optionalText,
  reportsToParticipantId: optionalText,
  billingRelationship: z.enum(jobBillingRelationships).optional().or(z.literal("")).transform((value) => value || undefined),
  participantStatus: z.enum(jobParticipantStatuses).default("active"),
  scopeAssigned: z.string().trim().max(900, "Keep assigned scope under 900 characters.").optional().transform((value) => value || undefined),
  contractAmount: optionalMoney("Participant contract amount"),
  notes: z.string().trim().max(900, "Keep participant notes under 900 characters.").optional().transform((value) => value || undefined),
})

export const updateProjectJobParticipantSchema = projectJobParticipantSchema.extend({
  participantId: requiredText("Participant ID"),
})

export const removeProjectJobParticipantSchema = z.object({
  jobId: requiredText("Job ID"),
  participantId: requiredText("Participant ID"),
})

export const paymentRecoveryAttemptSchema = z.object({
  recoveryCaseId: requiredText("Recovery case ID"),
  channel: z.enum(["email", "phone", "letter", "client_portal"]),
  attemptedAt: requiredText("Attempt date", 8),
  outcome: z.enum([
    "no_response",
    "client_responded",
    "payment_promised",
    "payment_received",
    "dispute_raised",
    "needs_follow_up",
  ]),
  note: requiredText("Attempt note", 12).max(700, "Keep the attempt note under 700 characters."),
  nextFollowUpAt: optionalText,
})

export const paymentPlanSchema = z.object({
  recoveryCaseId: requiredText("Recovery case ID"),
  totalAmount: money("Total amount"),
  installmentAmount: money("Installment amount"),
  dueDay: z.coerce
    .number({ error: "Due day must be a number." })
    .int("Due day must be a whole number.")
    .min(1, "Due day must be between 1 and 31.")
    .max(31, "Due day must be between 1 and 31."),
  status: z.enum(["proposed", "accepted", "active", "completed", "missed", "paused"]).default("proposed"),
  nextDueDate: optionalText,
  notes: requiredText("Payment plan notes", 12).max(700, "Keep the notes under 700 characters."),
}).refine((value) => value.installmentAmount <= value.totalAmount, {
  path: ["installmentAmount"],
  message: "Installment amount cannot exceed the total amount.",
})

export const contractPacketSchema = z.object({
  clientName: requiredText("Client name"),
  clientLegalName: optionalText,
  contractorLegalName: optionalText,
  projectType: requiredText("Project type"),
  templateType: z.enum([
    "service_agreement",
    "change_order",
    "payment_plan",
    "completion_certificate",
    "notice_of_nonpayment",
  ]),
  packetValue: money("Agreement value"),
  depositRequired: money("Deposit required"),
  milestoneCount: z.coerce
    .number({ error: "Milestone count must be a number." })
    .int("Milestone count must be a whole number.")
    .min(0, "Milestone count cannot be negative.")
    .max(24, "Milestone count is above the current workflow limit."),
  requiredBeforeScheduling: z.coerce.boolean().optional(),
  scopeSummary: requiredText("Scope summary", 20).max(1200, "Keep the scope summary under 1,200 characters."),
  includedWork: requiredText("Included work", 12).max(1600, "Keep included work under 1,600 characters."),
  excludedWork: z.string().trim().max(1200, "Keep excluded work under 1,200 characters.").optional(),
  paymentTerms: requiredText("Payment terms", 20).max(1600, "Keep payment terms under 1,600 characters."),
  milestoneSchedule: z.string().trim().max(2000, "Keep milestone schedule under 2,000 characters.").optional(),
  changeOrderPolicy: requiredText("Change-order policy", 20).max(1200, "Keep the change-order policy under 1,200 characters."),
  cancellationPolicy: requiredText("Cancellation policy", 20).max(1200, "Keep the cancellation policy under 1,200 characters."),
  projectStartDate: optionalText,
  projectEndDate: optionalText,
  nextAction: requiredText("Next action", 8).max(240, "Keep the next action under 240 characters."),
  }).refine((value) => value.depositRequired <= value.packetValue, {
    path: ["depositRequired"],
    message: "Deposit required cannot exceed the agreement value.",
  }).refine((value) => milestoneScheduleTotals(value.milestoneSchedule).valid, {
    path: ["milestoneSchedule"],
    message: "Use one milestone per line with label, amount, and optional due date separated by |.",
  }).refine((value) => milestoneScheduleTotals(value.milestoneSchedule).total <= value.packetValue, {
    path: ["milestoneSchedule"],
    message: "Milestone amounts cannot exceed the agreement value.",
  }).refine((value) => {
  if (!value.projectStartDate || !value.projectEndDate) return true

  return value.projectEndDate >= value.projectStartDate
}, {
  path: ["projectEndDate"],
  message: "Projected end date cannot be before the start date.",
})

export const updateContractPacketStatusSchema = z.object({
  packetId: requiredText("Contract link ID"),
  status: z.enum(["draft", "review_ready", "sent", "signed", "expired", "archived"]),
})

export const contractShareLinkSchema = z.object({
  packetId: requiredText("Contract link ID"),
  clientEmail: z.email("Enter a valid client email for the private signing link."),
  clientMessage: z.string().trim().max(700, "Keep the client message under 700 characters.").optional(),
  paymentMode: z.enum(["none", "deposit_request", "milestone_schedule", "platform_review"]).default("none"),
  paymentSummary: z.string().trim().max(700, "Keep the payment summary under 700 characters.").optional(),
  inviteClient: z.coerce.boolean().optional(),
})

export const contractSignatureSchema = z.object({
  shareToken: requiredText("Signing link token"),
  signerName: requiredText("Signer name"),
  signerEmail: z.email("Enter a valid email for signature verification."),
  signatureName: requiredText("Typed signature"),
  scopeReviewCertification: z.coerce.boolean().optional(),
  paymentTermsCertification: z.coerce.boolean().optional(),
  consentToElectronicSignature: z.coerce.boolean().optional(),
  authorityCertification: z.coerce.boolean().optional(),
  recordsCertification: z.coerce.boolean().optional(),
}).refine((value) => value.scopeReviewCertification === true, {
  path: ["scopeReviewCertification"],
  message: "Confirm you reviewed the scope, included work, and excluded work.",
}).refine((value) => value.paymentTermsCertification === true, {
  path: ["paymentTermsCertification"],
  message: "Confirm you reviewed the payment terms and milestone schedule.",
}).refine((value) => value.consentToElectronicSignature === true, {
  path: ["consentToElectronicSignature"],
  message: "Confirm consent to use electronic records and signatures for this agreement.",
}).refine((value) => value.authorityCertification === true, {
  path: ["authorityCertification"],
  message: "Confirm you are authorized to sign this agreement.",
}).refine((value) => value.recordsCertification === true, {
  path: ["recordsCertification"],
  message: "Confirm you can access and retain the agreement records electronically.",
})

export const updateEvidenceVaultStatusSchema = z.object({
  evidenceId: requiredText("Evidence ID"),
  status: z.enum(["uploaded", "mapped", "review_pending", "reviewed", "needs_more_info", "archived"]),
})

export const adminSavedViewSchema = z.object({
  scope: z.enum(["reports", "clients", "contractors", "discussions", "uploads", "recovery", "contracts", "audit"]),
  name: requiredText("Saved view name", 3).max(80, "Keep the view name under 80 characters."),
  filterSummary: requiredText("Filter summary", 3).max(240, "Keep the filter summary under 240 characters."),
  isDefault: z.coerce.boolean().optional(),
})

export const recoveryComplianceReviewSchema = z.object({
  recoveryCaseId: optionalText,
  lienNoticeDraftId: optionalText,
  contractPacketId: optionalText,
  status: z.enum(["pending", "approved", "needs_changes", "blocked"]),
  decisionReason: requiredText("Decision reason", 8).max(240, "Keep the decision reason under 240 characters."),
  requiredChanges: z.string().trim().max(700).optional(),
  publicVisibilityAllowed: z.coerce.boolean().optional(),
}).refine(
  (value) => Boolean(value.recoveryCaseId || value.lienNoticeDraftId || value.contractPacketId),
  {
    path: ["recoveryCaseId"],
    message: "Select a recovery, lien, or contract record.",
  },
)

export const publicInquirySchema = z.object({
  inquiryType: z.enum(publicInquiryTypes),
  topic: z.enum(publicInquiryTopics),
  fullName: requiredText("Name", 2).max(100, "Keep your name under 100 characters."),
  businessName: z.string().trim().max(140, "Keep the business name under 140 characters.").optional().transform((value) => value || undefined),
  email: z.email("Enter a valid email address.").max(180, "Keep the email under 180 characters."),
  message: requiredText("Message", 20)
    .max(1200, "Keep the message under 1,200 characters.")
    .refine((value) => !hasGeneralInquirySensitiveDetails(value), {
      message:
        "Do not paste raw emails, phone numbers, evidence details, private access codes, banking details, or attachment references into this general inquiry.",
    }),
  sourcePath: z.string().trim().max(180).optional().transform((value) => value || undefined),
  privacyCertification: checkbox.refine((value) => value === true, {
    message: "Confirm you understand this inquiry is not for raw evidence or sensitive identifiers.",
  }),
  website: z.string().trim().max(0, "Leave this field blank.").optional(),
})

export const moderationCaseAssignmentSchema = z.object({
  caseId: requiredText("Case ID"),
  assignedTo: requiredText("Reviewer ID"),
})

export const moderationCaseUpdateSchema = z.object({
  caseId: requiredText("Case ID"),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  status: z.enum(["unassigned", "assigned", "escalated", "closed"]),
  escalationNote: z.string().trim().max(700).optional(),
})

export const moderationDecisionReasonSchema = z.object({
  caseId: requiredText("Case ID"),
  decisionReason: z.enum([
    "approved_with_edits",
    "insufficient_evidence",
    "private_information",
    "neutrality_issue",
    "duplicate_report",
    "policy_rejection",
  ]),
  moderatorNote: z.string().trim().max(700).optional(),
})

export type ClientReportInput = z.infer<typeof clientReportSchema>
export type ClientResponseInput = z.infer<typeof clientResponseSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type AdminAccountClassificationInput = z.infer<typeof adminAccountClassificationSchema>
export type ProfileClaimInput = z.infer<typeof profileClaimSchema>
export type AdminProfileClaimReviewInput = z.infer<typeof adminProfileClaimReviewSchema>
export type AdminProfileMergeInput = z.infer<typeof adminProfileMergeSchema>
export type AdminReportReassignmentInput = z.infer<typeof adminReportReassignmentSchema>
export type AdminProfileRedactionInput = z.infer<typeof adminProfileRedactionSchema>
export type AdminReviewInput = z.infer<typeof adminReviewSchema>
export type CommunityDiscussionInput = z.infer<typeof communityDiscussionSchema>
export type WatchlistItemInput = z.infer<typeof watchlistItemSchema>
export type ReportDraftInput = z.infer<typeof reportDraftSchema>
export type IntakeAssessmentInput = z.infer<typeof intakeAssessmentSchema>
export type PaymentRecoveryCaseInput = z.infer<typeof paymentRecoveryCaseSchema>
export type ManagedRecoveryCaseInput = z.infer<typeof managedRecoveryCaseSchema>
export type ServiceFeeCheckoutInput = z.infer<typeof serviceFeeCheckoutSchema>
export type ServicePrecheckInput = z.infer<typeof servicePrecheckSchema>
export type LinkEvidenceToServiceCaseInput = z.infer<typeof linkEvidenceToServiceCaseSchema>
export type MarkServiceFeePaidInput = z.infer<typeof markServiceFeePaidSchema>
export type ResolutionDeskContactInput = z.infer<typeof resolutionDeskContactSchema>
export type MarkRecoveryResolvedInput = z.infer<typeof markRecoveryResolvedSchema>
export type LienNoticeDraftInput = z.infer<typeof lienNoticeDraftSchema>
export type FloridaLienCaseInput = z.infer<typeof floridaLienCaseSchema>
export type LienFilingAuthorizationInput = z.infer<typeof lienFilingAuthorizationSchema>
export type AdminLienCaseActionInput = z.infer<typeof adminLienCaseActionSchema>
export type AdminRecordLienFiledInput = z.infer<typeof adminRecordLienFiledSchema>
export type AdminUploadRecordingProofInput = z.infer<typeof adminUploadRecordingProofSchema>
export type AdminRecordLienReleaseInput = z.infer<typeof adminRecordLienReleaseSchema>
export type ContractWorkspaceItemInput = z.infer<typeof contractWorkspaceItemSchema>
export type ClientPipelineItemInput = z.infer<typeof clientPipelineItemSchema>
export type UpdateClientPipelineStageInput = z.infer<typeof updateClientPipelineStageSchema>
export type ClientRiskRoomInput = z.infer<typeof clientRiskRoomSchema>
export type ProjectJobInput = z.infer<typeof projectJobSchema>
export type UpdateProjectJobInput = z.infer<typeof updateProjectJobSchema>
export type ProjectJobParticipantInput = z.infer<typeof projectJobParticipantSchema>
export type UpdateProjectJobParticipantInput = z.infer<typeof updateProjectJobParticipantSchema>
export type RemoveProjectJobParticipantInput = z.infer<typeof removeProjectJobParticipantSchema>
export type PaymentRecoveryAttemptInput = z.infer<typeof paymentRecoveryAttemptSchema>
export type PaymentPlanInput = z.infer<typeof paymentPlanSchema>
export type ContractPacketInput = z.infer<typeof contractPacketSchema>
export type UpdateContractPacketStatusInput = z.infer<typeof updateContractPacketStatusSchema>
export type ContractShareLinkInput = z.infer<typeof contractShareLinkSchema>
export type ContractSignatureInput = z.infer<typeof contractSignatureSchema>
export type UpdateEvidenceVaultStatusInput = z.infer<typeof updateEvidenceVaultStatusSchema>
export type AdminSavedViewInput = z.infer<typeof adminSavedViewSchema>
export type RecoveryComplianceReviewInput = z.infer<typeof recoveryComplianceReviewSchema>
export type PublicInquiryInput = z.infer<typeof publicInquirySchema>
export type SavedClientSearchInput = z.infer<typeof savedClientSearchSchema>
export type SearchAnalyticsEventInput = z.infer<typeof searchAnalyticsEventSchema>
export type ProfileShareEventInput = z.infer<typeof profileShareEventSchema>
