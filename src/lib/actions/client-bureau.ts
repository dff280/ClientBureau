"use server"

import { revalidatePath } from "next/cache"

import { verifyAdminActionTokenFromForm } from "@/lib/admin-action-token"
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
  deleteReportDraftSchema,
  intakeAssessmentSchema,
  signupSchema,
  moderationCaseAssignmentSchema,
  moderationCaseUpdateSchema,
  moderationDecisionReasonSchema,
  reportDraftSchema,
  updateWatchlistItemSchema,
  watchlistItemSchema,
} from "@/lib/schemas/client-bureau"
import type {
  ActionResult,
  AdminReview,
  AuditLogEntry,
  ClientIntakeAssessment,
  ClientProfile,
  ClientResponse,
  ClientReport,
  CommunityDiscussion,
  ContractorProfile,
  ContractorWatchlistItem,
  ModerationCase,
  ReportDraft,
  User,
} from "@/lib/types"
import { reportCategories } from "@/lib/types"
import { formDataToObject, fail, ok, zodFieldErrors } from "@/lib/actions/result"
import {
  getAuthCookieDiagnostics,
  getCurrentUser,
  requireContractorAccess,
} from "@/lib/auth"
import { getDataMode, getSiteUrl } from "@/lib/env"
import {
  deleteAdminRecordService,
  assignModerationCaseService,
  createIntakeAssessmentService,
  createWatchlistItemService,
  deleteReportDraftService,
  reviewCommunityDiscussionService,
  reviewReportService,
  reviewReportsBulkService,
  saveReportDraftService,
  setModerationDecisionReasonService,
  submitCommunityDiscussionService,
  submitClientReportService,
  submitClientResponseService,
  updateAdminClientRecordService,
  updateAdminContractorRecordService,
  updateModerationCaseService,
  updateWatchlistItemService,
} from "@/lib/repositories/client-bureau-service"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"

function evidenceFilesFromForm(formData: FormData) {
  return formData
    .getAll("evidence")
    .filter((value): value is File => value instanceof File && value.size > 0)
}

function actionErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return `${fallback} ${error.message}`
  }

  return fallback
}

async function getAdminMutationUser(context: string, formData: FormData) {
  const admin = await getCurrentUser("admin")

  if (admin?.role === "admin") {
    return { ok: true as const, admin }
  }

  const tokenResult = await verifyAdminActionTokenFromForm(formData)

  if (tokenResult.ok) {
    return { ok: true as const, admin: tokenResult.admin }
  }

  const diagnostics = await getAuthCookieDiagnostics()
  const hasReadableToken = diagnostics.supabaseAuthCookieHasAccessToken
  const cookieSummary = `cookies=${diagnostics.authCookieCount}, readableToken=${hasReadableToken ? "yes" : "no"}`
  const tokenSummary = `adminActionToken=${tokenResult.reason}`

  return {
    ok: false as const,
    message: hasReadableToken
      ? `Your admin profile could not be verified for this ${context} action. Refresh /admin, confirm /api/admin/session shows isAdmin=true, and try again. (${cookieSummary}; ${tokenSummary})`
      : `This ${context} action did not receive a readable Supabase admin session cookie. Refresh /admin and retry from clientbureau.com. (${cookieSummary}; ${tokenSummary})`,
  }
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

  const response = await submitClientResponseService(parsed.data)

  revalidatePath("/admin/reviews")
  revalidatePath("/admin/reports")
  revalidatePath("/admin/discussions")

  return ok(response, "Response received. It is queued for moderation and contact verification.")
}

export async function signupAction(
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
        emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/dashboard`,
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
        id: "user_local_signup",
        email: parsed.data.email,
        fullName: parsed.data.fullName,
        role: "contractor",
        createdAt: new Date().toISOString(),
      },
    "Contractor account created. You can now continue with Client Bureau tools.",
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

  const adminResult = await getAdminMutationUser("moderation", formData)

  if (!adminResult.ok) {
    return fail(adminResult.message)
  }

  const { admin } = adminResult
  let review: AdminReview

  try {
    review = await reviewReportService(
      parsed.data.reportId,
      parsed.data.decision,
      parsed.data.editedPublicSummary,
      admin.id,
    )
  } catch (error) {
    return fail(actionErrorMessage(error, "Moderation could not be saved."))
  }

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

  const adminResult = await getAdminMutationUser("bulk moderation", formData)

  if (!adminResult.ok) {
    return fail(adminResult.message)
  }

  const { admin } = adminResult
  let result: { updated: AdminReview[]; deletedIds: string[] }

  try {
    result = await reviewReportsBulkService(parsed.data.reportIds, parsed.data.decision, admin.id)
  } catch (error) {
    return fail(actionErrorMessage(error, "Bulk moderation could not be saved."))
  }

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

  const adminResult = await getAdminMutationUser("discussion moderation", formData)

  if (!adminResult.ok) {
    return fail(adminResult.message)
  }

  const { admin } = adminResult
  let discussion: CommunityDiscussion | undefined

  try {
    discussion = await reviewCommunityDiscussionService(
      parsed.data.discussionId,
      parsed.data.decision,
      parsed.data.moderatorNote,
      admin,
    )
  } catch (error) {
    return fail(actionErrorMessage(error, "Discussion moderation could not be saved."))
  }

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

  const adminResult = await getAdminMutationUser("client edit", formData)

  if (!adminResult.ok) {
    return fail(adminResult.message)
  }

  const { admin } = adminResult
  let client: ClientProfile

  try {
    client = await updateAdminClientRecordService({ ...parsed.data, reviewer: admin })
  } catch (error) {
    return fail(actionErrorMessage(error, "Client profile could not be updated."))
  }

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

  const adminResult = await getAdminMutationUser("contractor edit", formData)

  if (!adminResult.ok) {
    return fail(adminResult.message)
  }

  const { admin } = adminResult
  let contractor: ContractorProfile

  try {
    contractor = await updateAdminContractorRecordService({ ...parsed.data, reviewer: admin })
  } catch (error) {
    return fail(actionErrorMessage(error, "Contractor profile could not be updated."))
  }

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

  const adminResult = await getAdminMutationUser("delete", formData)

  if (!adminResult.ok) {
    return fail(adminResult.message)
  }

  const { admin } = adminResult
  let result: AuditLogEntry | boolean

  try {
    result = await deleteAdminRecordService(parsed.data.entityType, parsed.data.entityId, admin)
  } catch (error) {
    return fail(actionErrorMessage(error, "Record could not be deleted."))
  }

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

  const adminResult = await getAdminMutationUser("bulk import", formData)

  if (!adminResult.ok) {
    return fail(adminResult.message)
  }

  const { admin } = adminResult
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

    try {
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
    } catch (error) {
      return fail(actionErrorMessage(error, `CSV row for ${clientName || "unknown client"} could not be imported.`))
    }
  }

  revalidatePath("/admin")
  revalidatePath("/admin/uploads")
  revalidatePath("/admin/reports")
  revalidatePath("/admin/audit-log")

  return ok({ imported: rows.length }, `${rows.length} CSV rows imported as pending report records.`)
}

export async function createWatchlistItemAction(
  _previousState: ActionResult<ContractorWatchlistItem>,
  formData: FormData,
): Promise<ActionResult<ContractorWatchlistItem>> {
  const parsed = watchlistItemSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Please correct the watchlist fields.", zodFieldErrors(parsed.error))
  }

  const user = await requireContractorAccess()

  try {
    const item = await createWatchlistItemService(user.id, parsed.data)
    if (!item) return fail("Watchlist feature data is not available yet.")

    revalidatePath("/dashboard")
    return ok(item, "Client added to the contractor watchlist.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Watchlist item could not be created."))
  }
}

export async function updateWatchlistItemAction(
  _previousState: ActionResult<ContractorWatchlistItem>,
  formData: FormData,
): Promise<ActionResult<ContractorWatchlistItem>> {
  const parsed = updateWatchlistItemSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Select a watchlist item before updating it.", zodFieldErrors(parsed.error))
  }

  await requireContractorAccess()

  try {
    const item = await updateWatchlistItemService(parsed.data.itemId, parsed.data.status)
    if (!item) return fail("Watchlist feature data is not available yet.")

    revalidatePath("/dashboard")
    return ok(item, parsed.data.status === "cleared" ? "Watchlist alert cleared." : "Watchlist alert restored.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Watchlist item could not be updated."))
  }
}

export async function saveReportDraftAction(
  _previousState: ActionResult<ReportDraft>,
  formData: FormData,
): Promise<ActionResult<ReportDraft>> {
  const parsed = reportDraftSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Please correct the draft fields.", zodFieldErrors(parsed.error))
  }

  const user = await requireContractorAccess()

  try {
    const draft = await saveReportDraftService(user.id, parsed.data)
    if (!draft) return fail("Report draft feature data is not available yet.")

    revalidatePath("/dashboard")
    return ok(draft, "Report draft saved.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Report draft could not be saved."))
  }
}

export async function deleteReportDraftAction(
  _previousState: ActionResult<AuditLogEntry | boolean>,
  formData: FormData,
): Promise<ActionResult<AuditLogEntry | boolean>> {
  const parsed = deleteReportDraftSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Select a draft before deleting.", zodFieldErrors(parsed.error))
  }

  await requireContractorAccess()

  try {
    const result = await deleteReportDraftService(parsed.data.draftId)
    if (!result) return fail("Report draft feature data is not available yet.")

    revalidatePath("/dashboard")
    return ok(result, "Report draft deleted.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Report draft could not be deleted."))
  }
}

export async function createIntakeAssessmentAction(
  _previousState: ActionResult<ClientIntakeAssessment>,
  formData: FormData,
): Promise<ActionResult<ClientIntakeAssessment>> {
  const parsed = intakeAssessmentSchema.safeParse({
    ...formDataToObject(formData),
    depositReceived: formData.has("depositReceived"),
    contractSigned: formData.has("contractSigned"),
    privateMatchConfirmed: formData.has("privateMatchConfirmed"),
  })

  if (!parsed.success) {
    return fail("Please correct the intake assessment fields.", zodFieldErrors(parsed.error))
  }

  const user = await requireContractorAccess()

  try {
    const assessment = await createIntakeAssessmentService(user.id, parsed.data)
    if (!assessment) return fail("Intake assessment feature data is not available yet.")

    revalidatePath("/dashboard")
    return ok(assessment, `Intake assessment created. Recommendation: ${assessment.recommendation}.`)
  } catch (error) {
    return fail(actionErrorMessage(error, "Intake assessment could not be created."))
  }
}

export async function assignModerationCaseAction(
  _previousState: ActionResult<ModerationCase>,
  formData: FormData,
): Promise<ActionResult<ModerationCase>> {
  const parsed = moderationCaseAssignmentSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Select a moderation case and reviewer.", zodFieldErrors(parsed.error))
  }

  const adminResult = await getAdminMutationUser("case assignment", formData)
  if (!adminResult.ok) return fail(adminResult.message)

  try {
    const caseItem = await assignModerationCaseService(parsed.data.caseId, adminResult.admin, parsed.data.assignedTo)
    if (!caseItem) return fail("Moderation case feature data is not available yet.")

    revalidatePath("/admin")
    revalidatePath("/admin/reports")
    return ok(caseItem, "Moderation case assigned.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Moderation case could not be assigned."))
  }
}

export async function updateModerationCaseAction(
  _previousState: ActionResult<ModerationCase>,
  formData: FormData,
): Promise<ActionResult<ModerationCase>> {
  const parsed = moderationCaseUpdateSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Please correct the moderation case fields.", zodFieldErrors(parsed.error))
  }

  const adminResult = await getAdminMutationUser("case update", formData)
  if (!adminResult.ok) return fail(adminResult.message)

  try {
    const caseItem = await updateModerationCaseService(
      parsed.data.caseId,
      parsed.data.priority,
      parsed.data.status,
      parsed.data.escalationNote,
    )
    if (!caseItem) return fail("Moderation case feature data is not available yet.")

    revalidatePath("/admin")
    revalidatePath("/admin/reports")
    return ok(caseItem, "Moderation case updated.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Moderation case could not be updated."))
  }
}

export async function setModerationDecisionReasonAction(
  _previousState: ActionResult<ModerationCase>,
  formData: FormData,
): Promise<ActionResult<ModerationCase>> {
  const parsed = moderationDecisionReasonSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Select a valid decision reason.", zodFieldErrors(parsed.error))
  }

  const adminResult = await getAdminMutationUser("decision reason", formData)
  if (!adminResult.ok) return fail(adminResult.message)

  try {
    const caseItem = await setModerationDecisionReasonService(
      parsed.data.caseId,
      parsed.data.decisionReason,
      parsed.data.moderatorNote,
    )
    if (!caseItem) return fail("Moderation case feature data is not available yet.")

    revalidatePath("/admin")
    revalidatePath("/admin/reports")
    return ok(caseItem, "Decision reason saved.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Decision reason could not be saved."))
  }
}
