import { fail, ok, zodFieldErrors } from "@/lib/actions/result"
import { getDataMode, getSiteUrl } from "@/lib/env"
import { mobileJson } from "@/lib/mobile-api"
import { signupSchema } from "@/lib/schemas/client-bureau"
import { bootstrapSignupProfile } from "@/lib/signup-profile-bootstrap"
import { createClient } from "@/lib/supabase/server"
import { normalizeTradeCategory } from "@/lib/trade-taxonomy"
import type { User } from "@/lib/types"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

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
    const message =
      input.planInterest && input.planInterest !== "free"
        ? "Account created. Plan interest was saved for billing review."
        : "Account created."

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
        message,
      ),
      201,
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent("/dashboard")}`,
      data: {
        full_name: input.fullName,
        business_name: input.businessName,
        trade: input.trade,
        other_trade_detail: input.otherTradeDetail,
        account_type: input.accountType,
        plan_interest: input.planInterest ?? "free",
        business_type: input.businessType,
        business_phone: input.businessPhone,
        website_url: input.websiteUrl,
        service_area: input.serviceArea,
        company_size: input.companySize,
        years_in_business: input.yearsInBusiness,
        primary_goal: input.primaryGoal,
        city: input.city,
        state: input.state,
        license_number: input.licenseNumber,
      },
    },
  })

  if (error) {
    return mobileJson(fail(error.message), 400)
  }

  if (data.user) {
    try {
      await bootstrapSignupProfile({
        userId: data.user.id,
        email: input.email,
        fullName: input.fullName,
        accountType: input.accountType,
        businessName: input.businessName,
        trade: input.trade,
        businessType: input.businessType,
        businessPhone: input.businessPhone,
        websiteUrl: input.websiteUrl,
        serviceArea: input.serviceArea,
        companySize: input.companySize,
        yearsInBusiness: input.yearsInBusiness,
        primaryGoal: input.primaryGoal,
        city: input.city,
        state: input.state,
        licenseNumber: input.licenseNumber,
      })
    } catch (bootstrapError) {
      return mobileJson(
        fail(bootstrapError instanceof Error ? bootstrapError.message : "Account was created, but profile setup needs attention."),
        400,
      )
    }
  }

  const emailConfirmationRequired = !data.session

  return mobileJson(
    ok(
      {
        id: data.user?.id ?? "pending-email-confirmation",
        email: input.email,
        fullName: input.fullName,
        role: "contractor",
        accountType: input.accountType,
        emailConfirmationRequired,
        createdAt: data.user?.created_at ?? new Date().toISOString(),
      } satisfies User,
      emailConfirmationRequired
        ? "Account created. Check your email to confirm your account, then return to the app and sign in."
        : data.user
          ? input.planInterest && input.planInterest !== "free"
            ? "Contractor account created. Plan interest was saved for billing review."
            : "Contractor account created. Log in to continue."
          : "Signup received. Check your email to confirm the account.",
    ),
    201,
  )
}
