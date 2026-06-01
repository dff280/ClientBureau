import { z } from "zod"

import { reportCategories, riskLevels } from "@/lib/types"

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

const money = (label: string) =>
  z.coerce
    .number({ error: `${label} must be a number.` })
    .min(0, `${label} cannot be negative.`)
    .max(10_000_000, `${label} is above the MVP review limit.`)

export const clientReportSchema = z
  .object({
    firstName: requiredText("Client first name"),
    lastName: requiredText("Client last name"),
    businessName: optionalText,
    email: z.email("Enter a valid email for private matching.").optional().or(z.literal("")),
    phone: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value ? value : undefined)),
    city: requiredText("Client city"),
    state: requiredText("Client state", 2).max(2, "Use a two-letter state abbreviation."),
    projectType: requiredText("Project type"),
    projectCity: requiredText("Project city"),
    projectState: requiredText("Project state", 2).max(2, "Use a two-letter state abbreviation."),
    contractAmount: money("Contract amount"),
    amountUnpaid: money("Amount unpaid"),
    reportCategory: z.enum(reportCategories),
    paymentStatus: requiredText("Payment status"),
    reportSummary: requiredText("Public report summary", 20).max(
      600,
      "Keep the public summary under 600 characters.",
    ),
    detailedExperience: requiredText("Detailed experience", 40).max(
      3000,
      "Keep the detailed experience under 3,000 characters.",
    ),
    evidenceAttached: z.coerce.boolean().optional(),
  })
  .refine((value) => value.amountUnpaid <= value.contractAmount, {
    path: ["amountUnpaid"],
    message: "Amount unpaid cannot exceed the contract amount.",
  })

export const clientResponseSchema = z.object({
  name: requiredText("Your name"),
  email: z.email("Enter a valid email for review contact."),
  profileUrl: requiredText("Profile URL", 6),
  requestType: z.enum(["Publish a response", "Dispute a report", "Request correction"]),
  responseSummary: requiredText("Response summary", 30).max(
    1800,
    "Keep the response summary under 1,800 characters.",
  ),
})

export const signupSchema = z.object({
  fullName: requiredText("Full name"),
  email: z.email("Enter a valid email."),
  password: requiredText("Password", 8),
  businessName: requiredText("Business name"),
  trade: requiredText("Trade"),
  city: requiredText("City"),
  state: requiredText("State", 2).max(2, "Use a two-letter state abbreviation."),
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
  state: requiredText("State", 2).max(2, "Use a two-letter state abbreviation."),
  riskLevel: z.enum(riskLevels),
  clientBureauScore: z.coerce.number().min(0).max(100),
  isPublic: z.coerce.boolean().optional(),
  moderatorNote: z.string().trim().max(700).optional(),
})

export const adminContractorUpdateSchema = z.object({
  contractorId: requiredText("Contractor ID"),
  businessName: requiredText("Business name"),
  trade: requiredText("Trade"),
  city: requiredText("City"),
  state: requiredText("State", 2).max(2, "Use a two-letter state abbreviation."),
  verificationStatus: z.enum(["unverified", "pending", "verified"]),
  moderatorNote: z.string().trim().max(700).optional(),
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
  state: z.string().trim().max(2).optional(),
  riskLevel: z.enum(riskLevels).optional(),
  category: z.enum(reportCategories).optional(),
})

export type ClientReportInput = z.infer<typeof clientReportSchema>
export type ClientResponseInput = z.infer<typeof clientResponseSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type AdminReviewInput = z.infer<typeof adminReviewSchema>
export type CommunityDiscussionInput = z.infer<typeof communityDiscussionSchema>
