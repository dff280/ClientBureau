"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

import { verifyAdminActionTokenFromForm } from "@/lib/admin-action-token"
import {
  adminClientUpdateSchema,
  adminContractorUpdateSchema,
  adminDeleteRecordSchema,
  adminDiscussionReviewSchema,
  adminProfileClaimReviewSchema,
  adminProfileMergeSchema,
  adminProfileRedactionSchema,
  adminReportReassignmentSchema,
  adminReviewSchema,
  adminSavedViewSchema,
  bulkAdminReviewSchema,
  bulkUploadImportSchema,
  clientPipelineItemSchema,
  clientReportSchema,
  clientResponseSchema,
  clientRiskRoomSchema,
  contractPacketSchema,
  contractShareLinkSchema,
  contractSignatureSchema,
  communityDiscussionSchema,
  contractWorkspaceItemSchema,
  deleteReportDraftSchema,
  floridaLienCaseSchema,
  intakeAssessmentSchema,
  linkEvidenceToServiceCaseSchema,
  lienFilingAuthorizationSchema,
  lienNoticeDraftSchema,
  adminLienCaseActionSchema,
  adminRecordLienFiledSchema,
  adminRecordLienReleaseSchema,
  adminUploadRecordingProofSchema,
  managedRecoveryCaseSchema,
  markServiceFeePaidSchema,
  markRecoveryResolvedSchema,
  deleteSavedClientSearchSchema,
  profileShareEventSchema,
  savedClientSearchSchema,
  searchAnalyticsEventSchema,
  signupSchema,
  profileClaimSchema,
  moderationCaseAssignmentSchema,
  moderationCaseUpdateSchema,
  moderationDecisionReasonSchema,
  paymentPlanSchema,
  paymentRecoveryAttemptSchema,
  paymentRecoveryCaseSchema,
  resolutionDeskContactSchema,
  reportDraftSchema,
  recoveryComplianceReviewSchema,
  serviceFeeCheckoutSchema,
  servicePrecheckSchema,
  updateClientPipelineStageSchema,
  updateContractPacketStatusSchema,
  updateEvidenceVaultStatusSchema,
  updateWatchlistItemSchema,
  watchlistItemSchema,
} from "@/lib/schemas/client-bureau"
import type {
  ActionResult,
  AdminReview,
  AdminSavedView,
  AuditLogEntry,
  CaseDocumentLink,
  ClientIntakeAssessment,
  ClientPipelineItem,
  ClientProfile,
  ClientResponse,
  ClientReport,
  ClientRiskRoom,
  CommunityDiscussion,
  ContractPacket,
  ContractWorkspaceItem,
  ContractorProfile,
  ContractorWatchlistItem,
  EvidenceVaultItem,
  FloridaLienCase,
  LienFilingRecord,
  LienReleaseRecord,
  LienNoticeDraft,
  ManagedRecoveryCase,
  ModerationCase,
  PaymentPlan,
  PaymentRecoveryCase,
  PaymentRecoveryAttempt,
  RecoveryComplianceReview,
  RecoveryCommunication,
  ReportDraft,
  ServiceFeeOrder,
  ServiceReadinessSummary,
  ProfileShareEvent,
  ProfileClaim,
  ProfileMergeEvent,
  ProfileRedactionEvent,
  ReportReassignmentEvent,
  SavedClientSearch,
  SearchAnalyticsEvent,
  User,
} from "@/lib/types"
import { isPositiveReportCategory, reportCategories } from "@/lib/types"
import { formDataToObject, fail, ok, zodFieldErrors } from "@/lib/actions/result"
import { getClientCityDirectoryHref, getClientStateDirectoryHref } from "@/lib/client-directory"
import {
  getAuthCookieDiagnostics,
  getCurrentUser,
  getPostSignupRedirectPath,
  requireContractorAccess,
} from "@/lib/auth"
import { getDataMode, getSiteUrl } from "@/lib/env"
import { normalizeCityName, normalizeStateCode } from "@/lib/locations"
import {
  deleteAdminRecordService,
  assignModerationCaseService,
  createContractWorkspaceItemService,
  createContractShareLinkService,
  createClientPipelineItemService,
  createClientRiskRoomService,
  createIntakeAssessmentService,
  createLienNoticeDraftService,
  createContractPacketService,
  createPaymentPlanService,
  createPaymentRecoveryCaseService,
  createServiceFeeOrderService,
  createWatchlistItemService,
  deleteSavedClientSearchService,
  deleteReportDraftService,
  getPublicClientProfileService,
  getPublicEntityProfileService,
  linkEvidenceToServiceCaseService,
  logPaymentRecoveryAttemptService,
  logResolutionDeskContactService,
  markServiceFeePaidService,
  markRecoveryResolvedService,
  signContractShareService,
  signLienFilingAuthorizationService,
  reviewRecoveryComplianceService,
  reviewCommunityDiscussionService,
  reviewReportService,
  reviewReportsBulkService,
  runFloridaLienPrecheckService,
  runRecoveryPrecheckService,
  recordProfileShareEventService,
  recordSearchEventService,
  saveAdminQueueViewService,
  saveClientSearchService,
  saveReportDraftService,
  setModerationDecisionReasonService,
  submitFloridaLienCaseService,
  submitManagedRecoveryCaseService,
  submitCommunityDiscussionService,
  submitClientReportService,
  submitClientResponseService,
  submitProfileClaimService,
  reviewProfileClaimService,
  mergeEntityProfilesService,
  reassignReportProfileService,
  redactEntityProfileFieldService,
  adminApproveLienFilingService,
  adminApproveLienNoticeService,
  adminRecordLienFiledService,
  adminRecordLienReleaseService,
  adminRequestLienMoreInfoService,
  adminUploadRecordingProofService,
  updateAdminClientRecordService,
  updateAdminContractorRecordService,
  updateClientPipelineStageService,
  updateContractPacketStatusService,
  updateEvidenceVaultStatusService,
  updateModerationCaseService,
  updateWatchlistItemService,
} from "@/lib/repositories/client-bureau-service"
import type { ClientReportInput } from "@/lib/schemas/client-bureau"
import { buildEntityProfileSlug } from "@/lib/entity-profiles"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"

const emptyStructuredReportFields = {
  clientType: undefined,
  jobAddress: undefined,
  tradeCategory: undefined,
  jobType: undefined,
  jobStartDate: undefined,
  jobCompletionDate: undefined,
  jobStatus: undefined,
  depositRequested: undefined,
  depositPaid: undefined,
  finalInvoiceAmount: undefined,
  materialsPurchasedAmount: undefined,
  signedContract: undefined,
  writtenChangeOrder: undefined,
  secondaryCategory: undefined,
  disputeStatus: undefined,
  amountDisputed: undefined,
  daysOverdue: undefined,
  clientResponded: undefined,
  issueResolved: undefined,
  resolutionSummary: undefined,
  paymentReminderSent: undefined,
  demandLetterSent: undefined,
  lienNoticeStarted: undefined,
  whatWasAgreed: undefined,
  workCompleted: undefined,
  paymentIssue: undefined,
  evidenceSupport: undefined,
  desiredResolution: undefined,
} satisfies Pick<
  ClientReportInput,
  | "clientType"
  | "jobAddress"
  | "tradeCategory"
  | "jobType"
  | "jobStartDate"
  | "jobCompletionDate"
  | "jobStatus"
  | "depositRequested"
  | "depositPaid"
  | "finalInvoiceAmount"
  | "materialsPurchasedAmount"
  | "signedContract"
  | "writtenChangeOrder"
  | "secondaryCategory"
  | "disputeStatus"
  | "amountDisputed"
  | "daysOverdue"
  | "clientResponded"
  | "issueResolved"
  | "resolutionSummary"
  | "paymentReminderSent"
  | "demandLetterSent"
  | "lienNoticeStarted"
  | "whatWasAgreed"
  | "workCompleted"
  | "paymentIssue"
  | "evidenceSupport"
  | "desiredResolution"
>

function evidenceFilesFromForm(formData: FormData) {
  return formData
    .getAll("evidence")
    .filter((value): value is File => value instanceof File && value.size > 0)
}

function actionErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    if (error.message.includes("Missing platform table")) {
      return `${fallback} This advanced workspace is temporarily in guided mode. Core account, reporting, search, and public profile tools remain available.`
    }

    if (
      error.message.includes("scope_summary") ||
      error.message.includes("milestone_schedule") ||
      error.message.includes("signed_snapshot")
    ) {
      return `${fallback} Contract signing is temporarily unavailable while this workspace is being prepared.`
    }

    return `${fallback} ${error.message}`
  }

  return fallback
}

function isMissingOnboardingColumn(error: { code?: string; message?: string } | null | undefined) {
  const message = error?.message?.toLowerCase() ?? ""

  return (
    error?.code === "42703" ||
    message.includes("business_type") ||
    message.includes("business_phone") ||
    message.includes("account_type") ||
    message.includes("website_url") ||
    message.includes("service_area") ||
    message.includes("company_size") ||
    message.includes("years_in_business") ||
    message.includes("primary_goal") ||
    message.includes("entity_profiles") ||
    message.includes("profile_type") ||
    message.includes("claimed_status") ||
    message.includes("schema cache")
  )
}

function yesNo(value?: boolean) {
  return value ? "Yes" : "No"
}

function reportDetailLine(label: string, value?: string | number | boolean) {
  if (value === undefined || value === null || value === "") return undefined

  return `${label}: ${typeof value === "boolean" ? yesNo(value) : value}`
}

function buildPrivateReportTimeline(input: ClientReportInput) {
  const lines = [
    reportDetailLine("Reported profile type", input.subjectProfileType),
    reportDetailLine("Reported profile subtype", input.subjectProfileSubtype),
    reportDetailLine("Relationship type", input.relationshipType),
    reportDetailLine("Project/job record", input.projectJobTitle),
    reportDetailLine("Existing project/job ID", input.projectJobId),
    reportDetailLine("Client type", input.clientType),
    reportDetailLine("Private job address provided", Boolean(input.jobAddress)),
    reportDetailLine("Trade or service category", input.tradeCategory),
    reportDetailLine("Job type", input.jobType),
    reportDetailLine("Job start date", input.jobStartDate),
    reportDetailLine("Job completion date", input.jobCompletionDate),
    reportDetailLine("Job status", input.jobStatus),
    reportDetailLine("Deposit requested", input.depositRequested),
    reportDetailLine("Deposit paid", input.depositPaid),
    reportDetailLine("Final invoice amount", input.finalInvoiceAmount),
    reportDetailLine("Materials purchased amount", input.materialsPurchasedAmount),
    reportDetailLine("Signed contract or proposal", input.signedContract),
    reportDetailLine("Written change order", input.writtenChangeOrder),
    reportDetailLine("Secondary category", input.secondaryCategory),
    reportDetailLine("Payment/dispute status", input.disputeStatus),
    reportDetailLine("Amount disputed", input.amountDisputed),
    reportDetailLine("Days overdue", input.daysOverdue),
    reportDetailLine("Client responded", input.clientResponded),
    reportDetailLine("Issue resolved", input.issueResolved),
    reportDetailLine("Payment reminder sent", input.paymentReminderSent),
    reportDetailLine("Demand letter sent", input.demandLetterSent),
    reportDetailLine("Lien notice or legal process started", input.lienNoticeStarted),
    reportDetailLine("Resolution summary", input.resolutionSummary),
    reportDetailLine("What was agreed", input.whatWasAgreed),
    reportDetailLine("What work was completed", input.workCompleted),
    reportDetailLine("What payment issue occurred", input.paymentIssue),
    reportDetailLine("Evidence support", input.evidenceSupport),
    reportDetailLine("What would resolve the issue", input.desiredResolution),
  ].filter(Boolean)

  if (lines.length === 0) return input

  return {
    ...input,
    detailedExperience: `${input.detailedExperience}\n\nStructured private intake details:\n${lines.join("\n")}`,
  }
}

function revalidatePublicProfileDirectories(profile?: Pick<ClientProfile, "city" | "state">) {
  revalidatePath("/clients")
  revalidatePath("/reports/recent")
  revalidatePath("/llms.txt")
  revalidatePath("/sitemap.xml")

  if (profile) {
    revalidatePath(getClientStateDirectoryHref(profile))
    revalidatePath(getClientCityDirectoryHref(profile))
  }
}

function revalidateGraphAdminPaths() {
  revalidatePath("/admin")
  revalidatePath("/admin/profiles")
  revalidatePath("/admin/reports")
  revalidatePath("/admin/audit-log")
  revalidatePath("/search")
  revalidatePath("/sitemap.xml")
  revalidatePath("/llms.txt")
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

  const report = await submitClientReportService(buildPrivateReportTimeline(parsed.data), user.id, evidenceFilesFromForm(formData))

  revalidatePath("/dashboard")
  revalidatePath("/admin/reviews")
  revalidatePath("/admin/reports")

  return ok(
    report,
    isPositiveReportCategory(parsed.data.reportCategory)
      ? "Positive client report received. It is now queued for moderation review."
      : "Report received. It is now queued for moderation review.",
  )
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

export async function saveClientSearchAction(
  _previousState: ActionResult<SavedClientSearch>,
  formData: FormData,
): Promise<ActionResult<SavedClientSearch>> {
  const parsed = savedClientSearchSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Please correct the saved search fields.", zodFieldErrors(parsed.error))
  }

  const user = await requireContractorAccess()
  const saved = await saveClientSearchService(user.id, parsed.data)

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/watchlist")

  if (!saved) {
    return ok(
      {
        id: parsed.data.searchId ?? `local_saved_${Date.now()}`,
        contractorId: user.id,
        query: parsed.data.query || "All public profiles",
        city: parsed.data.city,
        state: parsed.data.state?.toUpperCase(),
        riskLevel: parsed.data.riskLevel,
        category: parsed.data.category,
        resultCount: parsed.data.resultCount,
        source: "local",
        createdAt: new Date().toISOString(),
        lastRunAt: new Date().toISOString(),
      },
      "Search saved for this browser. Apply the optional search activation migration for account-level saved searches.",
    )
  }

  return ok(saved, "Search saved to your account.")
}

export async function deleteSavedSearchAction(
  _previousState: ActionResult<boolean>,
  formData: FormData,
): Promise<ActionResult<boolean>> {
  const parsed = deleteSavedClientSearchSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Select a saved search to remove.", zodFieldErrors(parsed.error))
  }

  const user = await requireContractorAccess()
  const deleted = await deleteSavedClientSearchService(user.id, parsed.data.searchId)

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/watchlist")

  return ok(deleted, deleted ? "Saved search removed." : "Saved search removed from this browser.")
}

export async function recordSearchEventAction(
  _previousState: ActionResult<SearchAnalyticsEvent>,
  formData: FormData,
): Promise<ActionResult<SearchAnalyticsEvent>> {
  const parsed = searchAnalyticsEventSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Search event could not be recorded.", zodFieldErrors(parsed.error))
  }

  const user = await getCurrentUser().catch(() => undefined)
  const event = await recordSearchEventService(user?.id, parsed.data)

  if (!event) {
    return ok(
      {
        id: `local_search_event_${Date.now()}`,
        contractorId: user?.id,
        query: parsed.data.query,
        state: parsed.data.state?.toUpperCase(),
        riskLevel: parsed.data.riskLevel,
        category: parsed.data.category,
        resultCount: parsed.data.resultCount,
        eventType: parsed.data.eventType,
        source: parsed.data.source,
        createdAt: new Date().toISOString(),
      },
      "Search event tracked locally.",
    )
  }

  return ok(event, "Search event recorded.")
}

export async function recordProfileShareAction(
  _previousState: ActionResult<ProfileShareEvent>,
  formData: FormData,
): Promise<ActionResult<ProfileShareEvent>> {
  const parsed = profileShareEventSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Profile share could not be recorded.", zodFieldErrors(parsed.error))
  }

  const user = await getCurrentUser().catch(() => undefined)
  const event = await recordProfileShareEventService(user?.id, parsed.data)

  if (!event) {
    return ok(
      {
        id: `local_profile_share_${Date.now()}`,
        contractorId: user?.id,
        profileSlug: parsed.data.profileSlug,
        channel: parsed.data.channel,
        source: parsed.data.source,
        createdAt: new Date().toISOString(),
      },
      "Profile share tracked locally.",
    )
  }

  return ok(event, "Profile share recorded.")
}

export async function submitProfileClaimAction(
  _previousState: ActionResult<ProfileClaim>,
  formData: FormData,
): Promise<ActionResult<ProfileClaim>> {
  const parsed = profileClaimSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Please correct the highlighted claim fields.", zodFieldErrors(parsed.error))
  }

  let profileId = parsed.data.profileId

  if (!profileId && parsed.data.profileType && parsed.data.profileSlug) {
    const profile = await getPublicEntityProfileService(parsed.data.profileType, parsed.data.profileSlug).catch(() => undefined)
    profileId = profile?.id
  }

  if (!profileId) {
    return fail("We could not find the public profile connected to this claim request.", {
      profileSlug: ["Open the public profile again and retry the claim request."],
    })
  }

  const user = await getCurrentUser().catch(() => undefined)
  const claim = await submitProfileClaimService(user?.id, {
    ...parsed.data,
    profileId,
  })

  revalidatePath("/admin")
  revalidatePath("/admin/profiles")

  return ok(claim, "Profile claim received. Client Bureau will verify the relationship before changing public ownership.")
}

export async function reviewProfileClaimAction(
  _previousState: ActionResult<ProfileClaim>,
  formData: FormData,
): Promise<ActionResult<ProfileClaim>> {
  const parsed = adminProfileClaimReviewSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Complete the claim review decision and moderator note.", zodFieldErrors(parsed.error))
  }

  const adminResult = await getAdminMutationUser("profile claim review", formData)

  if (!adminResult.ok) return fail(adminResult.message)

  try {
    const claim = await reviewProfileClaimService(adminResult.admin.id, parsed.data)
    revalidateGraphAdminPaths()

    return ok(claim, `Profile claim ${parsed.data.decision}. Public profile status was updated when applicable.`)
  } catch (error) {
    return fail(actionErrorMessage(error, "Profile claim review could not be saved."))
  }
}

export async function mergeEntityProfilesAction(
  _previousState: ActionResult<ProfileMergeEvent>,
  formData: FormData,
): Promise<ActionResult<ProfileMergeEvent>> {
  const parsed = adminProfileMergeSchema.safeParse({
    ...formDataToObject(formData),
    moveReports: formData.has("moveReports"),
  })

  if (!parsed.success) {
    return fail("Complete the source profile, target profile, and merge reason.", zodFieldErrors(parsed.error))
  }

  const adminResult = await getAdminMutationUser("profile merge", formData)

  if (!adminResult.ok) return fail(adminResult.message)

  try {
    const event = await mergeEntityProfilesService(adminResult.admin.id, parsed.data)
    revalidateGraphAdminPaths()

    return ok(event, "Profile merge recorded. The source profile is hidden and audit history was preserved.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Profile merge could not be saved."))
  }
}

export async function reassignReportProfileAction(
  _previousState: ActionResult<ReportReassignmentEvent>,
  formData: FormData,
): Promise<ActionResult<ReportReassignmentEvent>> {
  const parsed = adminReportReassignmentSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Choose the report, reassignment target, and audit reason.", zodFieldErrors(parsed.error))
  }

  const adminResult = await getAdminMutationUser("report reassignment", formData)

  if (!adminResult.ok) return fail(adminResult.message)

  try {
    const event = await reassignReportProfileService(adminResult.admin.id, parsed.data)
    revalidateGraphAdminPaths()

    return ok(event, "Report reassignment recorded and connected profile/project context was updated.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Report reassignment could not be saved."))
  }
}

export async function redactEntityProfileFieldAction(
  _previousState: ActionResult<ProfileRedactionEvent>,
  formData: FormData,
): Promise<ActionResult<ProfileRedactionEvent>> {
  const parsed = adminProfileRedactionSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Choose the profile field and provide a redaction reason.", zodFieldErrors(parsed.error))
  }

  const adminResult = await getAdminMutationUser("profile redaction", formData)

  if (!adminResult.ok) return fail(adminResult.message)

  try {
    const event = await redactEntityProfileFieldService(adminResult.admin.id, parsed.data)
    revalidateGraphAdminPaths()

    return ok(event, "Profile redaction recorded. Public/private field handling and audit history were updated.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Profile redaction could not be saved."))
  }
}

export async function signupAction(
  _previousState: ActionResult<User>,
  formData: FormData,
): Promise<ActionResult<User>> {
  const parsed = signupSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Please correct the highlighted account fields.", zodFieldErrors(parsed.error))
  }

  const redirectTo = getPostSignupRedirectPath(parsed.data.accountType, formData.get("next"))

  if (getDataMode() === "supabase") {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        data: {
          full_name: parsed.data.fullName,
          business_name: parsed.data.businessName,
          trade: parsed.data.trade,
          account_type: parsed.data.accountType,
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

      const { error: accountTypeError } = await service
        .from("users")
        .update({ account_type: parsed.data.accountType })
        .eq("id", data.user.id)

      if (accountTypeError && !isMissingOnboardingColumn(accountTypeError)) {
        return fail(accountTypeError.message)
      }

      const { error: contractorError } = await service.from("contractor_profiles").upsert(
        {
          user_id: data.user.id,
          business_name: parsed.data.businessName,
          trade: parsed.data.trade,
          city: parsed.data.city,
          state: parsed.data.state.toUpperCase(),
          license_number: parsed.data.licenseNumber ?? null,
          verification_status: "pending",
        },
        { onConflict: "user_id" },
      )

      if (contractorError) return fail(contractorError.message)

      const optionalProfileFields = {
        business_type: parsed.data.businessType ?? null,
        business_phone: parsed.data.businessPhone ?? null,
        website_url: parsed.data.websiteUrl || null,
        service_area: parsed.data.serviceArea || null,
        company_size: parsed.data.companySize ?? null,
        years_in_business: parsed.data.yearsInBusiness ?? null,
        primary_goal: parsed.data.primaryGoal ?? null,
      }
      const hasOptionalProfileFields = Object.values(optionalProfileFields).some(Boolean)

      if (hasOptionalProfileFields) {
        const { error: optionalProfileError } = await service
          .from("contractor_profiles")
          .update(optionalProfileFields)
          .eq("user_id", data.user.id)

        if (optionalProfileError && !isMissingOnboardingColumn(optionalProfileError)) {
          return fail(optionalProfileError.message)
        }
      }

      const { data: contractorProfileRow } = await service
        .from("contractor_profiles")
        .select("id")
        .eq("user_id", data.user.id)
        .maybeSingle()
      const profileType = parsed.data.accountType === "client" ? "client" : parsed.data.accountType
      const profileSlug = buildEntityProfileSlug({
        profileType,
        displayName: parsed.data.businessName,
        businessName: profileType === "client" ? undefined : parsed.data.businessName,
        city: parsed.data.city,
        state: parsed.data.state,
      })
      const { error: entityProfileError } = await service
        .from("entity_profiles")
        .upsert(
          {
            profile_type: profileType,
            display_name: parsed.data.businessName,
            legal_name_private: parsed.data.fullName,
            business_name: profileType === "client" ? null : parsed.data.businessName,
            city: parsed.data.city,
            state: parsed.data.state.toUpperCase(),
            slug: profileSlug,
            legacy_contractor_id: profileType === "client" ? null : (contractorProfileRow?.id ?? null),
            claimed_status: "claimed",
            owner_user_id: data.user.id,
            rating_score: profileType === "client" ? 70 : 76,
            rating_band: profileType === "client" ? "Moderate" : "Review Pending",
            public_summary:
              profileType === "client"
                ? "Claimed client/customer profile. Public content appears only after moderation approval."
                : "Business profile with verification context and moderated project activity.",
            is_public: profileType !== "client",
          },
          { onConflict: "profile_type,slug" },
        )

      if (entityProfileError && !isMissingOnboardingColumn(entityProfileError)) {
        return fail(entityProfileError.message)
      }
    }

    return ok(
      {
        id: data.user?.id ?? "pending-email-confirmation",
        email: parsed.data.email,
        fullName: parsed.data.fullName,
        role: "contractor",
        accountType: parsed.data.accountType,
        redirectTo,
        createdAt: data.user?.created_at ?? new Date().toISOString(),
      },
      data.user
        ? parsed.data.accountType === "client"
          ? "Client account created. You can respond, request correction, or claim a profile."
          : "Contractor account created. You can now use protected Client Bureau tools."
        : "Signup received. Check your email to confirm the account.",
    )
  }

  return ok(
      {
        id: "user_local_signup",
        email: parsed.data.email,
        fullName: parsed.data.fullName,
        role: "contractor",
        accountType: parsed.data.accountType,
        redirectTo,
        createdAt: new Date().toISOString(),
      },
    parsed.data.accountType === "client"
      ? "Client account created. You can respond, request correction, or claim a profile."
      : "Contractor account created. You can now continue with Client Bureau tools.",
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
      parsed.data.moderatorNote,
    )
  } catch (error) {
    return fail(actionErrorMessage(error, "Moderation could not be saved."))
  }

  revalidatePath("/admin/reviews")
  revalidatePath("/admin/reports")
  revalidatePath("/dashboard")
  revalidatePath("/search")

  if (review.publishedProfileSlug) {
    revalidatePath(`/client/${review.publishedProfileSlug}`)
    revalidatePath(`/profiles/client/${review.publishedProfileSlug}`)
    revalidatePath("/sitemap.xml")
    revalidatePath("/llms.txt")
    const publishedProfile = await getPublicClientProfileService(review.publishedProfileSlug).catch(() => undefined)

    revalidatePublicProfileDirectories(publishedProfile)
  } else {
    revalidatePublicProfileDirectories()
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
  revalidatePublicProfileDirectories()

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
  revalidatePublicProfileDirectories(client)

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
  revalidatePublicProfileDirectories()

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
    const city = normalizeCityName(String(row.city ?? ""))
    const state = normalizeStateCode(String(row.state ?? ""))

    if (!city || !state) {
      return fail(`CSV row for ${clientName || "unknown client"} must include a valid city and state.`)
    }

    try {
      await submitClientReportService(
        {
          ...emptyStructuredReportFields,
          subjectProfileId: undefined,
          subjectProfileType: "client",
          subjectProfileSubtype: "Business client",
          relationshipType: "contractor_to_client",
          projectJobId: undefined,
          projectJobTitle: `${reportType} import for ${clientName || "client"}`,
          firstName: firstName || "Unknown",
          lastName: lastParts.join(" ") || "Client",
          businessName: undefined,
          email: "",
          phone: undefined,
          city,
          state,
          projectType: reportType,
          projectCity: city,
          projectState: state,
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
    if (!item) return fail("Watchlist is temporarily unavailable.")

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/watchlist")
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

  const user = await requireContractorAccess()

  try {
    const item = await updateWatchlistItemService(user.id, parsed.data.itemId, parsed.data.status)
    if (!item) return fail("Watchlist is temporarily unavailable.")

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/watchlist")
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
    if (!draft) return fail("Report drafts are temporarily unavailable.")

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/reports")
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

  const user = await requireContractorAccess()

  try {
    const result = await deleteReportDraftService(user.id, parsed.data.draftId)
    if (!result) return fail("Report drafts are temporarily unavailable.")

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/reports")
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
    if (!assessment) return fail("Client intake assessments are temporarily unavailable.")

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/watchlist")
    return ok(assessment, `Intake assessment created. Recommendation: ${assessment.recommendation}.`)
  } catch (error) {
    return fail(actionErrorMessage(error, "Intake assessment could not be created."))
  }
}

export async function createPaymentRecoveryCaseAction(
  _previousState: ActionResult<PaymentRecoveryCase>,
  formData: FormData,
): Promise<ActionResult<PaymentRecoveryCase>> {
  const parsed = paymentRecoveryCaseSchema.safeParse({
    ...formDataToObject(formData),
    factualCertification: formData.has("factualCertification"),
  })

  if (!parsed.success) {
    return fail("Please correct the recovery case fields.", zodFieldErrors(parsed.error))
  }

  const user = await requireContractorAccess()

  try {
    const recoveryCase = await createPaymentRecoveryCaseService(user.id, parsed.data)
    if (!recoveryCase) return fail("Payment recovery cases are temporarily unavailable.")

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/recovery")
    return ok(recoveryCase, "Recovery case created with compliance safeguards.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Recovery case could not be created."))
  }
}

export async function submitManagedRecoveryCaseAction(
  _previousState: ActionResult<ManagedRecoveryCase>,
  formData: FormData,
): Promise<ActionResult<ManagedRecoveryCase>> {
  const parsed = managedRecoveryCaseSchema.safeParse({
    ...formDataToObject(formData),
    factualCertification: formData.has("factualCertification"),
    serviceTermsCertification: formData.has("serviceTermsCertification"),
  })

  if (!parsed.success) {
    return fail("Please correct the managed recovery case fields.", zodFieldErrors(parsed.error))
  }

  const user = await requireContractorAccess()

  try {
    const recoveryCase = await submitManagedRecoveryCaseService(user.id, parsed.data)
    if (!recoveryCase) return fail("Managed recovery cases are temporarily unavailable.")

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/recovery")
    revalidatePath("/admin")
    revalidatePath("/admin/settings")
    return ok(recoveryCase, "Managed recovery case submitted. Next step: pay the service fee and keep documents private.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Managed recovery case could not be submitted."))
  }
}

export async function createRecoveryServiceFeeCheckoutAction(
  _previousState: ActionResult<ServiceFeeOrder>,
  formData: FormData,
): Promise<ActionResult<ServiceFeeOrder>> {
  const parsed = serviceFeeCheckoutSchema.safeParse({
    ...formDataToObject(formData),
    kind: "managed_recovery",
  })

  if (!parsed.success) {
    return fail("Select a managed recovery case before starting checkout.", zodFieldErrors(parsed.error))
  }

  const user = await requireContractorAccess()

  try {
    const readiness = await runRecoveryPrecheckService(user.id, { caseId: parsed.data.entityId })
    if (!readiness.readyForCheckout) {
      return fail("Complete the recovery precheck before starting checkout.")
    }

    const order = await createServiceFeeOrderService(user.id, parsed.data)
    if (!order) return fail("Service fee checkout is temporarily unavailable.")

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/recovery")
    return ok(order, "Service fee checkout is ready. Client payments remain contractor-direct.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Service fee checkout could not be created."))
  }
}

export async function runRecoveryPrecheckAction(
  _previousState: ActionResult<ServiceReadinessSummary>,
  formData: FormData,
): Promise<ActionResult<ServiceReadinessSummary>> {
  const parsed = servicePrecheckSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Select a managed recovery case before running precheck.", zodFieldErrors(parsed.error))
  }

  const user = await requireContractorAccess()

  try {
    const summary = await runRecoveryPrecheckService(user.id, parsed.data)

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/recovery")
    revalidatePath("/admin")
    return ok(summary, summary.readyForCheckout ? "Recovery precheck passed. Checkout can begin." : "Recovery precheck needs more information.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Recovery precheck could not be completed."))
  }
}

export async function runFloridaLienPrecheckAction(
  _previousState: ActionResult<ServiceReadinessSummary>,
  formData: FormData,
): Promise<ActionResult<ServiceReadinessSummary>> {
  const parsed = servicePrecheckSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Select a Florida lien service case before running precheck.", zodFieldErrors(parsed.error))
  }

  const user = await requireContractorAccess()

  try {
    const summary = await runFloridaLienPrecheckService(user.id, parsed.data)

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/lien-readiness")
    revalidatePath("/admin")
    return ok(summary, summary.readyForCheckout ? "Florida lien precheck passed. Checkout can begin." : "Florida lien precheck needs more information.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Florida lien precheck could not be completed."))
  }
}

export async function linkEvidenceToServiceCaseAction(
  _previousState: ActionResult<CaseDocumentLink>,
  formData: FormData,
): Promise<ActionResult<CaseDocumentLink>> {
  const parsed = linkEvidenceToServiceCaseSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Please correct the evidence link fields.", zodFieldErrors(parsed.error))
  }

  const user = await requireContractorAccess()

  try {
    const link = await linkEvidenceToServiceCaseService(user.id, parsed.data)

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/recovery")
    revalidatePath("/dashboard/lien-readiness")
    revalidatePath("/admin")
    return ok(link, "Private evidence linked to the service case.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Private evidence could not be linked."))
  }
}

export async function markServiceFeePaidAction(
  _previousState: ActionResult<ServiceFeeOrder>,
  formData: FormData,
): Promise<ActionResult<ServiceFeeOrder>> {
  const parsed = markServiceFeePaidSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Select a service fee order before marking it paid.", zodFieldErrors(parsed.error))
  }

  const adminResult = await getAdminMutationUser("service fee payment", formData)
  if (!adminResult.ok) return fail(adminResult.message)

  try {
    const order = await markServiceFeePaidService(adminResult.admin, parsed.data)

    revalidatePath("/admin")
    revalidatePath("/dashboard/recovery")
    revalidatePath("/dashboard/lien-readiness")
    return ok(order, "Service fee marked paid and case moved forward.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Service fee could not be marked paid."))
  }
}

export async function logResolutionDeskContactAction(
  _previousState: ActionResult<RecoveryCommunication>,
  formData: FormData,
): Promise<ActionResult<RecoveryCommunication>> {
  const parsed = resolutionDeskContactSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Please correct the Resolution Desk contact fields.", zodFieldErrors(parsed.error))
  }

  const adminResult = await getAdminMutationUser("Resolution Desk", formData)
  if (!adminResult.ok) return fail(adminResult.message)

  try {
    const contact = await logResolutionDeskContactService(adminResult.admin, parsed.data)
    if (!contact) return fail("Resolution Desk contact logging is temporarily unavailable.")

    revalidatePath("/admin")
    revalidatePath("/admin/settings")
    revalidatePath("/dashboard/recovery")
    return ok(contact, "Resolution Desk contact logged.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Resolution Desk contact could not be logged."))
  }
}

export async function markRecoveryResolvedAction(
  _previousState: ActionResult<ManagedRecoveryCase>,
  formData: FormData,
): Promise<ActionResult<ManagedRecoveryCase>> {
  const parsed = markRecoveryResolvedSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Please correct the resolution fields.", zodFieldErrors(parsed.error))
  }

  const adminResult = await getAdminMutationUser("recovery resolution", formData)
  if (!adminResult.ok) return fail(adminResult.message)

  try {
    const recoveryCase = await markRecoveryResolvedService(adminResult.admin, parsed.data)
    if (!recoveryCase) return fail("Managed recovery cases are temporarily unavailable.")

    revalidatePath("/admin")
    revalidatePath("/admin/settings")
    revalidatePath("/dashboard/recovery")
    return ok(recoveryCase, "Managed recovery case marked resolved.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Managed recovery case could not be resolved."))
  }
}

export async function createLienNoticeDraftAction(
  _previousState: ActionResult<LienNoticeDraft>,
  formData: FormData,
): Promise<ActionResult<LienNoticeDraft>> {
  const parsed = lienNoticeDraftSchema.safeParse({
    ...formDataToObject(formData),
    reviewCertification: formData.has("reviewCertification"),
  })

  if (!parsed.success) {
    return fail("Please correct the lien packet fields.", zodFieldErrors(parsed.error))
  }

  const user = await requireContractorAccess()

  try {
    const noticeDraft = await createLienNoticeDraftService(user.id, parsed.data)
    if (!noticeDraft) return fail("Lien readiness packets are temporarily unavailable.")

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/lien-readiness")
    return ok(noticeDraft, "Lien packet created for state-specific review.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Lien packet could not be created."))
  }
}

export async function submitFloridaLienCaseAction(
  _previousState: ActionResult<FloridaLienCase>,
  formData: FormData,
): Promise<ActionResult<FloridaLienCase>> {
  const parsed = floridaLienCaseSchema.safeParse({
    ...formDataToObject(formData),
    accuracyCertification: formData.has("accuracyCertification"),
    filingTermsCertification: formData.has("filingTermsCertification"),
  })

  if (!parsed.success) {
    return fail("Please correct the Florida lien service fields.", zodFieldErrors(parsed.error))
  }

  const user = await requireContractorAccess()

  try {
    const lienCase = await submitFloridaLienCaseService(user.id, parsed.data)
    if (!lienCase) return fail("Florida lien service is temporarily unavailable.")

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/lien-readiness")
    revalidatePath("/admin")
    revalidatePath("/admin/settings")
    return ok(lienCase, "Florida lien service case submitted. Next step: pay the service fee and sign authorization.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Florida lien service case could not be submitted."))
  }
}

export async function createLienServiceFeeCheckoutAction(
  _previousState: ActionResult<ServiceFeeOrder>,
  formData: FormData,
): Promise<ActionResult<ServiceFeeOrder>> {
  const parsed = serviceFeeCheckoutSchema.safeParse({
    ...formDataToObject(formData),
    kind: formData.get("kind") || "florida_lien_filing",
  })

  if (!parsed.success) {
    return fail("Select a Florida lien case before starting checkout.", zodFieldErrors(parsed.error))
  }

  const user = await requireContractorAccess()

  try {
    const readiness = await runFloridaLienPrecheckService(user.id, { caseId: parsed.data.entityId })
    if (!readiness.readyForCheckout) {
      return fail("Complete the Florida lien precheck before starting checkout.")
    }

    const order = await createServiceFeeOrderService(user.id, parsed.data)
    if (!order) return fail("Florida lien service checkout is temporarily unavailable.")

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/lien-readiness")
    return ok(order, "Florida lien service checkout is ready with pass-through filing costs tracked separately.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Florida lien service checkout could not be created."))
  }
}

export async function signLienFilingAuthorizationAction(
  _previousState: ActionResult<FloridaLienCase>,
  formData: FormData,
): Promise<ActionResult<FloridaLienCase>> {
  const parsed = lienFilingAuthorizationSchema.safeParse({
    ...formDataToObject(formData),
    accuracyCertification: formData.has("accuracyCertification"),
    authorityCertification: formData.has("authorityCertification"),
    vendorReviewCertification: formData.has("vendorReviewCertification"),
  })

  if (!parsed.success) {
    return fail("Please complete the authorization fields.", zodFieldErrors(parsed.error))
  }

  const user = await requireContractorAccess()

  try {
    const lienCase = await signLienFilingAuthorizationService(user.id, parsed.data)
    if (!lienCase) return fail("Florida lien service is temporarily unavailable.")

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/lien-readiness")
    revalidatePath("/admin")
    revalidatePath("/admin/settings")
    return ok(lienCase, "Authorization recorded. The case can move to attorney/vendor review.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Florida lien authorization could not be recorded."))
  }
}

export async function adminRequestLienMoreInfoAction(
  _previousState: ActionResult<FloridaLienCase>,
  formData: FormData,
): Promise<ActionResult<FloridaLienCase>> {
  const parsed = adminLienCaseActionSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Add a clear note before requesting more information.", zodFieldErrors(parsed.error))
  }

  const adminResult = await getAdminMutationUser("Florida lien review", formData)
  if (!adminResult.ok) return fail(adminResult.message)

  try {
    const lienCase = await adminRequestLienMoreInfoService(adminResult.admin, parsed.data)
    revalidatePath("/admin")
    revalidatePath("/admin/settings")
    revalidatePath("/dashboard/lien-readiness")
    return ok(lienCase, "More information requested for this Florida lien case.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Florida lien case could not be updated."))
  }
}

export async function adminApproveLienNoticeAction(
  _previousState: ActionResult<FloridaLienCase>,
  formData: FormData,
): Promise<ActionResult<FloridaLienCase>> {
  const parsed = adminLienCaseActionSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Add a review note before approving the notice packet.", zodFieldErrors(parsed.error))
  }

  const adminResult = await getAdminMutationUser("Florida notice approval", formData)
  if (!adminResult.ok) return fail(adminResult.message)

  try {
    const lienCase = await adminApproveLienNoticeService(adminResult.admin, parsed.data)
    revalidatePath("/admin")
    revalidatePath("/admin/settings")
    revalidatePath("/dashboard/lien-readiness")
    return ok(lienCase, "Notice packet approved to send.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Florida notice packet could not be approved."))
  }
}

export async function adminApproveLienFilingAction(
  _previousState: ActionResult<FloridaLienCase>,
  formData: FormData,
): Promise<ActionResult<FloridaLienCase>> {
  const parsed = adminLienCaseActionSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Add a review note before approving filing.", zodFieldErrors(parsed.error))
  }

  const adminResult = await getAdminMutationUser("Florida lien filing approval", formData)
  if (!adminResult.ok) return fail(adminResult.message)

  try {
    const lienCase = await adminApproveLienFilingService(adminResult.admin, parsed.data)
    revalidatePath("/admin")
    revalidatePath("/admin/settings")
    revalidatePath("/dashboard/lien-readiness")
    return ok(lienCase, "Claim of lien approved for attorney/vendor filing.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Florida lien filing could not be approved."))
  }
}

export async function adminRecordLienFiledAction(
  _previousState: ActionResult<LienFilingRecord>,
  formData: FormData,
): Promise<ActionResult<LienFilingRecord>> {
  const parsed = adminRecordLienFiledSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Please correct the filing record fields.", zodFieldErrors(parsed.error))
  }

  const adminResult = await getAdminMutationUser("Florida lien filing record", formData)
  if (!adminResult.ok) return fail(adminResult.message)

  try {
    const record = await adminRecordLienFiledService(adminResult.admin, parsed.data)
    revalidatePath("/admin")
    revalidatePath("/admin/settings")
    revalidatePath("/dashboard/lien-readiness")
    return ok(record, "Lien filing record captured.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Lien filing record could not be captured."))
  }
}

export async function adminUploadRecordingProofAction(
  _previousState: ActionResult<LienFilingRecord>,
  formData: FormData,
): Promise<ActionResult<LienFilingRecord>> {
  const parsed = adminUploadRecordingProofSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Please correct the recording proof fields.", zodFieldErrors(parsed.error))
  }

  const adminResult = await getAdminMutationUser("recording proof", formData)
  if (!adminResult.ok) return fail(adminResult.message)

  try {
    const record = await adminUploadRecordingProofService(adminResult.admin, parsed.data)
    revalidatePath("/admin")
    revalidatePath("/admin/settings")
    revalidatePath("/dashboard/lien-readiness")
    return ok(record, "Recording proof captured.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Recording proof could not be captured."))
  }
}

export async function adminRecordLienReleaseAction(
  _previousState: ActionResult<LienReleaseRecord>,
  formData: FormData,
): Promise<ActionResult<LienReleaseRecord>> {
  const parsed = adminRecordLienReleaseSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Please correct the release record fields.", zodFieldErrors(parsed.error))
  }

  const adminResult = await getAdminMutationUser("lien release", formData)
  if (!adminResult.ok) return fail(adminResult.message)

  try {
    const record = await adminRecordLienReleaseService(adminResult.admin, parsed.data)
    revalidatePath("/admin")
    revalidatePath("/admin/settings")
    revalidatePath("/dashboard/lien-readiness")
    return ok(record, "Lien release record captured.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Lien release record could not be captured."))
  }
}

export async function createContractWorkspaceItemAction(
  _previousState: ActionResult<ContractWorkspaceItem>,
  formData: FormData,
): Promise<ActionResult<ContractWorkspaceItem>> {
  const parsed = contractWorkspaceItemSchema.safeParse({
    ...formDataToObject(formData),
    milestoneBilling: formData.has("milestoneBilling"),
  })

  if (!parsed.success) {
    return fail("Please correct the contract workspace fields.", zodFieldErrors(parsed.error))
  }

  const user = await requireContractorAccess()

  try {
    const contractItem = await createContractWorkspaceItemService(user.id, parsed.data)
    if (!contractItem) return fail("Contract workspace is temporarily unavailable.")

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/contracts")
    return ok(contractItem, "Agreement draft created.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Agreement draft could not be created."))
  }
}

export async function createClientPipelineItemAction(
  _previousState: ActionResult<ClientPipelineItem>,
  formData: FormData,
): Promise<ActionResult<ClientPipelineItem>> {
  const parsed = clientPipelineItemSchema.safeParse({
    ...formDataToObject(formData),
    privateMatch: formData.has("privateMatch"),
  })

  if (!parsed.success) {
    return fail("Please correct the pipeline fields.", zodFieldErrors(parsed.error))
  }

  const user = await requireContractorAccess()

  try {
    const item = await createClientPipelineItemService(user.id, parsed.data)
    if (!item) return fail("Client pipeline is temporarily unavailable.")

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/activity")
    return ok(item, "Client pipeline item created.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Client pipeline item could not be created."))
  }
}

export async function updateClientPipelineStageAction(
  _previousState: ActionResult<ClientPipelineItem>,
  formData: FormData,
): Promise<ActionResult<ClientPipelineItem>> {
  const parsed = updateClientPipelineStageSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Select a pipeline record and stage.", zodFieldErrors(parsed.error))
  }

  const user = await requireContractorAccess()

  try {
    const item = await updateClientPipelineStageService(user.id, parsed.data)
    if (!item) return fail("Client pipeline is temporarily unavailable.")

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/activity")
    return ok(item, `Pipeline stage updated to ${parsed.data.stage.replaceAll("_", " ")}.`)
  } catch (error) {
    return fail(actionErrorMessage(error, "Pipeline stage could not be updated."))
  }
}

export async function createRiskRoomAction(
  _previousState: ActionResult<ClientRiskRoom>,
  formData: FormData,
): Promise<ActionResult<ClientRiskRoom>> {
  const parsed = clientRiskRoomSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Please correct the client work file fields.", zodFieldErrors(parsed.error))
  }

  const user = await requireContractorAccess()

  try {
    const room = await createClientRiskRoomService(user.id, parsed.data)
    if (!room) return fail("Client work files are temporarily unavailable.")

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/activity")
    return ok(room, "Private client work file created.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Client work file could not be created."))
  }
}

export async function logPaymentRecoveryAttemptAction(
  _previousState: ActionResult<PaymentRecoveryAttempt>,
  formData: FormData,
): Promise<ActionResult<PaymentRecoveryAttempt>> {
  const parsed = paymentRecoveryAttemptSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Please correct the recovery attempt fields.", zodFieldErrors(parsed.error))
  }

  const user = await requireContractorAccess()

  try {
    const attempt = await logPaymentRecoveryAttemptService(user.id, parsed.data)
    if (!attempt) return fail("Payment recovery attempts are temporarily unavailable.")

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/recovery")
    return ok(attempt, "Recovery case attempt logged.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Recovery attempt could not be logged."))
  }
}

export async function createPaymentPlanAction(
  _previousState: ActionResult<PaymentPlan>,
  formData: FormData,
): Promise<ActionResult<PaymentPlan>> {
  const parsed = paymentPlanSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Please correct the payment plan fields.", zodFieldErrors(parsed.error))
  }

  const user = await requireContractorAccess()

  try {
    const plan = await createPaymentPlanService(user.id, parsed.data)
    if (!plan) return fail("Payment plans are temporarily unavailable.")

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/recovery")
    return ok(plan, "Payment plan created for private recovery tracking.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Payment plan could not be created."))
  }
}

export async function createContractPacketAction(
  _previousState: ActionResult<ContractPacket>,
  formData: FormData,
): Promise<ActionResult<ContractPacket>> {
  const parsed = contractPacketSchema.safeParse({
    ...formDataToObject(formData),
    requiredBeforeScheduling: formData.has("requiredBeforeScheduling"),
  })

  if (!parsed.success) {
    return fail("Please correct the contract link fields.", zodFieldErrors(parsed.error))
  }

  const user = await requireContractorAccess()

  try {
    const packet = await createContractPacketService(user.id, parsed.data)
    if (!packet) return fail("Contract links are temporarily unavailable.")

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/contracts")
    return ok(packet, "Contract signing link workspace created.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Contract signing link could not be created."))
  }
}

export async function updateContractPacketStatusAction(
  _previousState: ActionResult<ContractPacket>,
  formData: FormData,
): Promise<ActionResult<ContractPacket>> {
  const parsed = updateContractPacketStatusSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Select a contract link and status.", zodFieldErrors(parsed.error))
  }

  const user = await requireContractorAccess()

  try {
    const packet = await updateContractPacketStatusService(user.id, parsed.data)
    if (!packet) return fail("Contract links are temporarily unavailable.")

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/contracts")
    return ok(packet, `Contract link marked ${packet.status.replaceAll("_", " ")}.`)
  } catch (error) {
    return fail(actionErrorMessage(error, "Contract link status could not be updated."))
  }
}

export async function createContractShareLinkAction(
  _previousState: ActionResult<ContractPacket>,
  formData: FormData,
): Promise<ActionResult<ContractPacket>> {
  const parsed = contractShareLinkSchema.safeParse({
    ...formDataToObject(formData),
    inviteClient: formData.has("inviteClient"),
  })

  if (!parsed.success) {
    return fail("Please correct the private signing link fields.", zodFieldErrors(parsed.error))
  }

  const user = await requireContractorAccess()

  try {
    const packet = await createContractShareLinkService(user.id, parsed.data)
    if (!packet) return fail("Contract signing links are temporarily unavailable.")

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/contracts")
    if (packet.shareUrl) revalidatePath(packet.shareUrl)

    return ok(packet, "Private contract signing link is ready to share with the client.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Contract signing link could not be prepared."))
  }
}

export async function signContractShareAction(
  _previousState: ActionResult<ContractPacket>,
  formData: FormData,
): Promise<ActionResult<ContractPacket>> {
  const parsed = contractSignatureSchema.safeParse({
    ...formDataToObject(formData),
    scopeReviewCertification: formData.has("scopeReviewCertification"),
    paymentTermsCertification: formData.has("paymentTermsCertification"),
    consentToElectronicSignature: formData.has("consentToElectronicSignature"),
    authorityCertification: formData.has("authorityCertification"),
    recordsCertification: formData.has("recordsCertification"),
  })

  if (!parsed.success) {
    return fail("Please complete the signing fields and certifications.", zodFieldErrors(parsed.error))
  }

  try {
    const headerList = await headers()
    const forwardedFor = headerList.get("x-forwarded-for")?.split(",")[0]?.trim()
    const ipAddress = forwardedFor || headerList.get("x-real-ip") || undefined
    const userAgent = headerList.get("user-agent") || undefined
    const packet = await signContractShareService(parsed.data, { ipAddress, userAgent })
    if (!packet) return fail("Contract signing links are temporarily unavailable.")

    revalidatePath(`/contract/${parsed.data.shareToken}`)
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/contracts")
    revalidatePath("/admin")
    revalidatePath("/admin/settings")

    return ok(packet, "Signature recorded. The contractor can countersign and confirm payment timing.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Contract signature could not be recorded."))
  }
}

export async function updateEvidenceVaultStatusAction(
  _previousState: ActionResult<EvidenceVaultItem>,
  formData: FormData,
): Promise<ActionResult<EvidenceVaultItem>> {
  const parsed = updateEvidenceVaultStatusSchema.safeParse(formDataToObject(formData))

  if (!parsed.success) {
    return fail("Select evidence and a status.", zodFieldErrors(parsed.error))
  }

  const user = await requireContractorAccess()

  try {
    const evidence = await updateEvidenceVaultStatusService(user.id, parsed.data)
    if (!evidence) return fail("Evidence Vault is temporarily unavailable.")

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/evidence")
    return ok(evidence, `Evidence marked ${evidence.status.replaceAll("_", " ")}.`)
  } catch (error) {
    return fail(actionErrorMessage(error, "Evidence status could not be updated."))
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
    if (!caseItem) return fail("Moderation cases are temporarily unavailable.")

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
      adminResult.admin,
      parsed.data.priority,
      parsed.data.status,
      parsed.data.escalationNote,
    )
    if (!caseItem) return fail("Moderation cases are temporarily unavailable.")

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
      adminResult.admin,
      parsed.data.decisionReason,
      parsed.data.moderatorNote,
    )
    if (!caseItem) return fail("Moderation cases are temporarily unavailable.")

    revalidatePath("/admin")
    revalidatePath("/admin/reports")
    return ok(caseItem, "Decision reason saved.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Decision reason could not be saved."))
  }
}

export async function saveAdminQueueViewAction(
  _previousState: ActionResult<AdminSavedView>,
  formData: FormData,
): Promise<ActionResult<AdminSavedView>> {
  const parsed = adminSavedViewSchema.safeParse({
    ...formDataToObject(formData),
    isDefault: formData.has("isDefault"),
  })

  if (!parsed.success) {
    return fail("Please correct the saved view fields.", zodFieldErrors(parsed.error))
  }

  const adminResult = await getAdminMutationUser("saved view", formData)
  if (!adminResult.ok) return fail(adminResult.message)

  try {
    const view = await saveAdminQueueViewService(adminResult.admin, parsed.data)
    if (!view) return fail("Admin saved views are temporarily unavailable.")

    revalidatePath("/admin")
    revalidatePath("/admin/reports")
    return ok(view, "Admin queue view saved.")
  } catch (error) {
    return fail(actionErrorMessage(error, "Admin queue view could not be saved."))
  }
}

export async function reviewRecoveryComplianceAction(
  _previousState: ActionResult<RecoveryComplianceReview>,
  formData: FormData,
): Promise<ActionResult<RecoveryComplianceReview>> {
  const parsed = recoveryComplianceReviewSchema.safeParse({
    ...formDataToObject(formData),
    publicVisibilityAllowed: formData.has("publicVisibilityAllowed"),
  })

  if (!parsed.success) {
    return fail("Please correct the compliance review fields.", zodFieldErrors(parsed.error))
  }

  const adminResult = await getAdminMutationUser("recovery compliance", formData)
  if (!adminResult.ok) return fail(adminResult.message)

  try {
    const review = await reviewRecoveryComplianceService(adminResult.admin, parsed.data)
    if (!review) return fail("Recovery compliance reviews are temporarily unavailable.")

    revalidatePath("/admin")
    revalidatePath("/admin/settings")
    revalidatePath("/admin/audit-log")
    return ok(review, `Compliance review marked ${review.status.replaceAll("_", " ")}.`)
  } catch (error) {
    return fail(actionErrorMessage(error, "Recovery compliance review could not be saved."))
  }
}
