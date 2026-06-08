import { fail, ok, zodFieldErrors } from "@/lib/actions/result"
import { getDataMode } from "@/lib/env"
import { mobileJson } from "@/lib/mobile-api"
import { signupSchema } from "@/lib/schemas/client-bureau"
import { createServiceClient } from "@/lib/supabase/service"
import { createClient } from "@/lib/supabase/server"
import type { User } from "@/lib/types"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

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
    message.includes("primary_goal")
  )
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = signupSchema.safeParse(body)

  if (!parsed.success) {
    return mobileJson(fail("Please correct the account fields.", zodFieldErrors(parsed.error)), 400)
  }

  if (getDataMode() !== "supabase") {
    return mobileJson(
      ok(
        {
          id: "user_local_mobile_signup",
          email: parsed.data.email,
          fullName: parsed.data.fullName,
          role: "contractor",
          accountType: parsed.data.accountType,
          createdAt: new Date().toISOString(),
        } satisfies User,
        "Account created for local mobile testing.",
      ),
      201,
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        business_name: parsed.data.businessName,
        trade: parsed.data.trade,
        account_type: parsed.data.accountType,
      },
    },
  })

  if (error) {
    return mobileJson(fail(error.message), 400)
  }

  if (data.user) {
    const service = createServiceClient()
    const { error: userError } = await service.from("users").upsert({
      id: data.user.id,
      email: parsed.data.email,
      full_name: parsed.data.fullName,
      role: "contractor",
    })

    if (userError) return mobileJson(fail(userError.message), 400)

    const { error: accountTypeError } = await service
      .from("users")
      .update({ account_type: parsed.data.accountType })
      .eq("id", data.user.id)

    if (accountTypeError && !isMissingOnboardingColumn(accountTypeError)) {
      return mobileJson(fail(accountTypeError.message), 400)
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

    if (contractorError) return mobileJson(fail(contractorError.message), 400)

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
        return mobileJson(fail(optionalProfileError.message), 400)
      }
    }
  }

  return mobileJson(
    ok(
      {
        id: data.user?.id ?? "pending-email-confirmation",
        email: parsed.data.email,
        fullName: parsed.data.fullName,
        role: "contractor",
        accountType: parsed.data.accountType,
        createdAt: data.user?.created_at ?? new Date().toISOString(),
      } satisfies User,
      data.user
        ? "Contractor account created. Log in to continue."
        : "Signup received. Check your email to confirm the account.",
    ),
    201,
  )
}
