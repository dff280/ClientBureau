"use server"

import { revalidatePath } from "next/cache"

import {
  adminClientUpdateSchema,
  adminContractorUpdateSchema,
  adminDeleteRecordSchema,
  adminDiscussionReviewSchema,
  adminReviewSchema,
  bulkAdminReviewSchema,
  bulkUploadImportSchema,
  clientReportSchema,
  clientResponseSchema,
  communityDiscussionSchema,
  loginSchema,
  signupSchema,
} from "@/lib/schemas/client-bureau"
import type {
  ActionResult,
  AdminReview,
  AuditLogEntry,
  ClientProfile,
  ClientResponse,
  ClientReport,
  CommunityDiscussion,
  ContractorProfile,
  User,
} from "@/lib/types"
import { reportCategories } from "@/lib/types"
import { formDataToObject, fail, ok, zodFieldErrors } from "@/lib/actions/result"
import { getCurrentUser, requireAuthenticatedUser, requireContractorAccess } from "@/lib/auth"
import { getDataMode } from "@/lib/env"
import {
  deleteAdminRecordService,
  reviewCommunityDiscussionService,
  reviewReportService,
  reviewReportsBulkService,
  submitCommunityDiscussionService,
  submitClientReportService,
  submitClientResponseService,
  updateAdminClientRecordService,
  updateAdminContractorRecordService,
} from "@/lib/repositories/client-bureau-service"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"

function evidenceFilesFromForm(formData: FormData) {
  return formData
    .getAll("evidence")
    .filter((value): value is File => value instanceof File && value.size > 0)
}

export async function submitClientReportAction(
  _previousState: ActionResult<ClientReport>,
  formData: FormData,
): Promise<ActionResult<ClientReport>> {
  const parsed = clientReportSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Please correct the highlighted report fields.", zodFieldErrors(parsed.error))
  }

  const user = await requireContractorAccess()

  const report = await submitClientReportService(parsed.data, user.id, evidenceFilesFromForm(formData))

  revalidatePath("/dashboard")
  revalidatePath("/admin/reviews")
  revalidatePath("/admin/reports")

  return ok(report, "Report received. It is now queued for moderation review.")
}

export async function submitClientResponseAction(
  _previousState: ActionResult<ClientResponse>,
  formData: FormData,
): Promise<ActionResult<ClientResponse>> {
  const parsed = clientResponseSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Please correct the highlighted response fields.", zodFieldErrors(parsed.error))
  }

  await requireAuthenticatedUser()

  const response = await submitClientResponseService(parsed.data)

  revalidatePath("/admin/reviews")
  revalidatePath("/admin/reports")

  return ok(response, "Response received. It will appear after moderation review.")
}

export async function mockSignupAction(
  _previousState: ActionResult<User>,
  formData: FormData,
): Promise<ActionResult<User>> {
  const parsed = signupSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Please correct the highlighted account fields.", zodFieldErrors(parsed.error))
  }

  if (getDataMode() === "supabase") {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          full_name: parsed.data.fullName,
          business_name: parsed.data.businessName,
          trade: parsed.data.trade,
        },
      },
    })

    if (error) return fail(error.message)

    if (data.user) {
      const service = createServiceClient()
      const { error: userError } = await service.from("users").upsert({
        id: data.user.id,
        email: parsed.data.email,
        full_name: parsed.data.fullName,
        role: "contractor",
      })

      if (userError) return fail(userError.message)

      const { error: contractorError } = await service.from("contractor_profiles").upsert(
        {
          user_id: data.user.id,
          business_name: parsed.data.businessName,
          trade: parsed.data.trade,
          city: parsed.data.city,
          state: parsed.data.state.toUpperCase(),
          verification_status: "pending",
        },
        { onConflict: "user_id" },
      )

      if (contractorError) return fail(contractorError.message)
    }

    return ok(
      {
        id: data.user?.id ?? "pending-email-confirmation",
        email: parsed.data.email,
        fullName: parsed.data.fullName,
        role: "contractor",
        createdAt: data.user?.created_at ?? new Date().toISOString(),
      },
      data.user
        ? "Contractor account created. You can now use protected Client Bureau tools."
        : "Signup received. Check your email to confirm the account.",
    )
  }

  return ok(
    {
      id: "user_mock_signup",
      email: parsed.data.email,
      fullName: parsed.data.fullName,
      role: "contractor",
      createdAt: new Date().toISOString(),
    },
    "Contractor account created in mock mode.",
  )
}

export async function mockLoginAction(
  _previousState: ActionResult<User>,
  formData: FormData,
): Promise<ActionResult<User>> {
  const parsed = loginSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Please correct the highlighted login fields.", zodFieldErrors(parsed.error))
  }

  if (getDataMode() === "supabase") {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    })

    if (error) return fail(error.message)

    const user = await getCurrentUser()

    return ok(
      user ?? {
        id: "supabase-session",
        email: parsed.data.email,
        fullName: "Client Bureau user",
        role: "contractor",
        createdAt: new Date().toISOString(),
      },
      "Logged in.",
    )
  }

  return ok(
    {
      id: "user_mock_login",
      email: parsed.data.email,
      fullName: "Mock Contractor",
      role: "contractor",
      createdAt: new Date().toISOString(),
    },
    "Logged in with mock auth.",
  )
}

export async function reviewReportAction(
  _previousState: ActionResult<AdminReview>,
  formData: FormData,
): Promise<ActionResult<AdminReview>> {
  const parsed = adminReviewSchema.safeParse({
    ...formDataToObject(formData),
    checklistEvidence: formData.has("checklistEvidence"),
    checklistNeutral: formData.has("checklistNeutral"),
    checklistPrivate: formData.has("checklistPrivate"),
  })

  if (!parsed.success) {
    return fail("Please complete the review checklist and summary.", zodFieldErrors(parsed.error))
  }

  if (
    parsed.data.decision === "approved" &&
    (!parsed.data.checklistEvidence || !parsed.data.checklistNeutral || !parsed.data.checklistPrivate)
  ) {
    return fail("Approval requires evidence, neutral summary, and private identifier checks.", {
      checklist: ["Complete all approval checks before publishing."],
    })
  }

  const admin = await getCurrentUser("admin")

  if (!admin || admin.role !== "admin") {
    return fail("Your admin session expired. Refresh, log in, and try the moderation action again.")
  }

  const review = await reviewReportService(
    parsed.data.reportId,
    parsed.data.decision,
    parsed.data.editedPublicSummary,
    admin.id,
  )

  revalidatePath("/admin/reviews")
  revalidatePath("/admin/reports")
  revalidatePath("/dashboard")
  revalidatePath("/search")
  revalidatePath("/sitemap.xml")

  if (review.publishedProfileSlug) {
    revalidatePath(`/client/${review.publishedProfileSlug}`)
  }

  return ok(
    review,
    parsed.data.decision === "approved"
      ? `Report approved. Public profile is live${review.publishedProfileUrl ? ` at ${review.publishedProfileUrl}` : ""}.`
      : "Report rejected and kept private.",
  )
}

export async function bulkReviewReportsAction(
  _previousState: ActionResult<{ updated: AdminReview[]; deletedIds: string[] }>,
  formData: FormData,
): Promise<ActionResult<{ updated: AdminReview[]; deletedIds: string[] }>> {
  const parsed = bulkAdminReviewSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Select reports before running a bulk moderation action.", zodFieldErrors(parsed.error))
  }

  const admin = await getCurrentUser("admin")

  if (!admin || admin.role !== "admin") {
    return fail("Your admin session expired. Refresh, log in, and try the bulk action again.")
  }

  const result = await reviewReportsBulkService(parsed.data.reportIds, parsed.data.decision, admin.id)

  revalidatePath("/admin")
  revalidatePath("/admin/reports")
  revalidatePath("/admin/reviews")
  revalidatePath("/admin/audit-log")
  revalidatePath("/search")
  revalidatePath("/sitemap.xml")

  return ok(
    result,
    parsed.data.decision === "deleted"
      ? `${result.deletedIds.length} report records deleted.`
      : `${result.updated.length} report records marked ${parsed.data.decision}.`,
  )
}

export async function submitCommunityDiscussionAction(
  _previousState: ActionResult<CommunityDiscussion>,
  formData: FormData,
): Promise<ActionResult<CommunityDiscussion>> {
  const parsed = communityDiscussionSchema.safeParse({
    ...formDataToObject(formData),
    truthfulCertification: formData.has("truthfulCertification"),
  })

  if (!parsed.success) {
    return fail("Please correct the highlighted discussion fields.", zodFieldErrors(parsed.error))
  }

  const discussion = await submitCommunityDiscussionService(parsed.data)

  revalidatePath("/admin/discussions")

  return ok(discussion, "Discussion submitted. It will appear publicly only after moderation approval.")
}

export async function adminDiscussionReviewAction(
  _previousState: ActionResult<CommunityDiscussion | undefined>,
  formData: FormData,
): Promise<ActionResult<CommunityDiscussion | undefined>> {
  const parsed = adminDiscussionReviewSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Review the discussion action fields.", zodFieldErrors(parsed.error))
  }

  const admin = await getCurrentUser("admin")

  if (!admin || admin.role !== "admin") {
    return fail("Your admin session expired. Refresh, log in, and try the discussion action again.")
  }

  const discussion = await reviewCommunityDiscussionService(
    parsed.data.discussionId,
    parsed.data.decision,
    parsed.data.moderatorNote,
    admin,
  )

  revalidatePath("/admin")
  revalidatePath("/admin/discussions")
  revalidatePath("/admin/audit-log")
  revalidatePath("/sitemap.xml")

  return ok(
    discussion,
    parsed.data.decision === "deleted"
      ? "Discussion deleted."
      : `Discussion marked ${parsed.data.decision}.`,
  )
}

export async function adminUpdateClientAction(
  _previousState: ActionResult<ClientProfile>,
  formData: FormData,
): Promise<ActionResult<ClientProfile>> {
  const parsed = adminClientUpdateSchema.safeParse({
    ...formDataToObject(formData),
    isPublic: formData.has("isPublic"),
  })

  if (!parsed.success) {
    return fail("Please correct the highlighted client fields.", zodFieldErrors(parsed.error))
  }

  const admin = await getCurrentUser("admin")

  if (!admin || admin.role !== "admin") {
    return fail("Your admin session expired. Refresh, log in, and try editing again.")
  }

  const client = await updateAdminClientRecordService({ ...parsed.data, reviewer: admin })

  revalidatePath("/admin/clients")
  revalidatePath("/admin/audit-log")
  revalidatePath("/search")
  revalidatePath(`/client/${client.publicSlug}`)
  revalidatePath("/sitemap.xml")

  return ok(client, "Client profile updated.")
}

export async function adminUpdateContractorAction(
  _previousState: ActionResult<ContractorProfile>,
  formData: FormData,
): Promise<ActionResult<ContractorProfile>> {
  const parsed = adminContractorUpdateSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Please correct the highlighted contractor fields.", zodFieldErrors(parsed.error))
  }

  const admin = await getCurrentUser("admin")

  if (!admin || admin.role !== "admin") {
    return fail("Your admin session expired. Refresh, log in, and try editing again.")
  }

  const contractor = await updateAdminContractorRecordService({ ...parsed.data, reviewer: admin })

  revalidatePath("/admin/contractors")
  revalidatePath("/admin/audit-log")

  return ok(contractor, "Contractor profile updated.")
}

export async function adminDeleteRecordAction(
  _previousState: ActionResult<AuditLogEntry | boolean>,
  formData: FormData,
): Promise<ActionResult<AuditLogEntry | boolean>> {
  const parsed = adminDeleteRecordSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Select a record before deleting.", zodFieldErrors(parsed.error))
  }

  const admin = await getCurrentUser("admin")

  if (!admin || admin.role !== "admin") {
    return fail("Your admin session expired. Refresh, log in, and try deleting again.")
  }

  const result = await deleteAdminRecordService(parsed.data.entityType, parsed.data.entityId, admin)

  revalidatePath("/admin")
  revalidatePath(`/admin/${parsed.data.entityType}s`)
  revalidatePath("/admin/audit-log")
  revalidatePath("/search")
  revalidatePath("/sitemap.xml")

  return ok(result, "Record deleted and audit entry created.")
}

export async function bulkUploadImportAction(
  _previousState: ActionResult<{ imported: number }>,
  formData: FormData,
): Promise<ActionResult<{ imported: number }>> {
  const parsed = bulkUploadImportSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Preview and select valid rows before importing.", zodFieldErrors(parsed.error))
  }

  const admin = await getCurrentUser("admin")

  if (!admin || admin.role !== "admin") {
    return fail("Your admin session expired. Refresh, log in, and try importing again.")
  }

  let rows: Array<Record<string, unknown>>

  try {
    rows = JSON.parse(parsed.data.rows) as Array<Record<string, unknown>>
  } catch {
    return fail("The selected CSV rows could not be parsed. Preview the upload again.")
  }

  for (const row of rows) {
    const clientName = String(row.clientName ?? "").trim()
    const [firstName, ...lastParts] = clientName.split(/\s+/)
    const reportType = String(row.reportType ?? "Other")
    const reportCategory = reportCategories.includes(reportType as (typeof reportCategories)[number])
      ? (reportType as (typeof reportCategories)[number])
      : "Other"
    const amount = Number(row.amount ?? 0)

    await submitClientReportService(
      {
        firstName: firstName || "Unknown",
        lastName: lastParts.join(" ") || "Client",
        businessName: undefined,
        email: "",
        phone: undefined,
        city: String(row.city ?? "Unknown"),
        state: String(row.state ?? "NA").slice(0, 2).toUpperCase(),
        projectType: reportType,
        projectCity: String(row.city ?? "Unknown"),
        projectState: String(row.state ?? "NA").slice(0, 2).toUpperCase(),
        contractAmount: amount,
        amountUnpaid: amount,
        reportCategory,
        paymentStatus: String(row.status ?? "Pending admin import"),
        reportSummary: String(row.summary ?? ""),
        detailedExperience: String(row.notes ?? row.summary ?? ""),
        evidenceAttached: false,
      },
      admin.id,
    )
  }

  revalidatePath("/admin")
  revalidatePath("/admin/uploads")
  revalidatePath("/admin/reports")
  revalidatePath("/admin/audit-log")

  return ok({ imported: rows.length }, `${rows.length} CSV rows imported as pending report records.`)
}
