import { fail, ok, zodFieldErrors } from "@/lib/actions/result"
import { getDataMode } from "@/lib/env"
import { mobileJson } from "@/lib/mobile-api"
import { signupSchema } from "@/lib/schemas/client-bureau"
import { createServiceClient } from "@/lib/supabase/service"
import { createClient } from "@/lib/supabase/server"
import { normalizeTradeCategory } from "@/lib/trade-taxonomy"
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
  const input = {
    ...parsed.data,
    trade: normalizeTradeCategory(parsed.data.trade, parsed.data.otherTradeDetail),
  }

  if (getDataMode() !== "supabase") {
    return mobileJson(
      ok(
        {
          id: "user_local_mobile_signup",
          email: input.email,
          fullName: input.fullName,
          role: "contractor",
          accountType: input.accountType,
          createdAt: new Date().toISOString(),
        } satisfies User,
        "Account created.",
      ),
      201,
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
        business_name: input.businessName,
        trade: input.trade,
        account_type: input.accountType,
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
      email: input.email,
      full_name: input.fullName,
      role: "contractor",
    })

    if (userError) return mobileJson(fail(userError.message), 400)

    const { error: accountTypeError } = await service
      .from("users")
      .update({ account_type: input.accountType })
      .eq("id", data.user.id)

    if (accountTypeError && !isMissingOnboardingColumn(accountTypeError)) {
      return mobileJson(fail(accountTypeError.message), 400)
    }

    const { error: contractorError } = await service.from("contractor_profiles").upsert(
      {
        user_id: data.user.id,
        business_name: input.businessName,
        trade: input.trade,
        city: input.city,
        state: input.state.toUpperCase(),
        license_number: input.licenseNumber ?? null,
        verification_status: "pending",
      },
      { onConflict: "user_id" },
    )

    if (contractorError) return mobileJson(fail(contractorError.message), 400)

    const optionalProfileFields = {
      business_type: input.businessType ?? null,
      business_phone: input.businessPhone ?? null,
      website_url: input.websiteUrl || null,
      service_area: input.serviceArea || null,
      company_size: input.companySize ?? null,
      years_in_business: input.yearsInBusiness ?? null,
      primary_goal: input.primaryGoal ?? null,
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
        email: input.email,
        fullName: input.fullName,
        role: "contractor",
        accountType: input.accountType,
        createdAt: data.user?.created_at ?? new Date().toISOString(),
      } satisfies User,
      data.user
        ? "Contractor account created. Log in to continue."
        : "Signup received. Check your email to confirm the account.",
    ),
    201,
  )
}
