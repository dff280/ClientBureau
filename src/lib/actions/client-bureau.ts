"use server"

import {
  adminReviewSchema,
  clientReportSchema,
  clientResponseSchema,
  loginSchema,
  signupSchema,
} from "@/lib/schemas/client-bureau"
import type { ActionResult, AdminReview, ClientResponse, ClientReport, User } from "@/lib/types"
import { formDataToObject, fail, ok, zodFieldErrors } from "@/lib/actions/result"
import { getCurrentUser, requireAuthenticatedUser, requireRole } from "@/lib/auth"
import { getDataMode } from "@/lib/env"
import {
  reviewReportService,
  submitClientReportService,
  submitClientResponseService,
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

  const user = await requireRole("contractor")

  return ok(
    await submitClientReportService(parsed.data, user.id, evidenceFilesFromForm(formData)),
    "Report received. It is now queued for moderation review.",
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

  await requireAuthenticatedUser()

  return ok(
    await submitClientResponseService(parsed.data),
    "Response received. It will appear after moderation review.",
  )
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

  const admin = await requireRole("admin")

  return ok(
    await reviewReportService(
      parsed.data.reportId,
      parsed.data.decision,
      parsed.data.editedPublicSummary,
      admin.id,
    ),
    parsed.data.decision === "approved"
      ? "Report approved. Publication audit is ready."
      : "Report rejected and kept private.",
  )
}
