import type { User as SupabaseAuthUser } from "@supabase/supabase-js"

import type { Database, Json } from "@/lib/database.types"
import { buildSignupEntityProfileSeed } from "@/lib/signup-profile-rating"
import { createServiceClient } from "@/lib/supabase/service"
import { normalizeTradeCategory } from "@/lib/trade-taxonomy"
import type { AccountType, ProfileType } from "@/lib/types"

type SignupProfileBootstrapInput = {
  userId: string
  email: string
  fullName: string
  accountType: AccountType
  businessName: string
  trade: string
  businessType?: string
  businessPhone?: string
  websiteUrl?: string
  serviceArea?: string
  companySize?: string
  yearsInBusiness?: string
  primaryGoal?: string
  city: string
  state: string
  licenseNumber?: string | null
}

type SignupMetadata = Record<string, unknown>

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function accountTypeFromMetadata(value: unknown): AccountType {
  return value === "subcontractor" || value === "client" ? value : "contractor"
}

function bootstrapProfileType(accountType: AccountType): ProfileType {
  return accountType === "client" ? "client" : accountType
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
    message.includes("primary_goal")
  )
}

export function signupBootstrapInputFromAuthUser(user: Pick<SupabaseAuthUser, "id" | "email" | "user_metadata">) {
  const metadata = (user.user_metadata ?? {}) as SignupMetadata
  const accountType = accountTypeFromMetadata(metadata.account_type)
  const fullName = optionalString(metadata.full_name) ?? optionalString(metadata.fullName) ?? "Client Bureau user"
  const businessName = optionalString(metadata.business_name) ?? optionalString(metadata.businessName) ?? fullName
  const trade = normalizeTradeCategory(
    optionalString(metadata.trade) ?? "Other specialty trade",
    optionalString(metadata.other_trade_detail) ?? optionalString(metadata.otherTradeDetail),
  )
  const city = optionalString(metadata.city) ?? "Orlando"
  const state = optionalString(metadata.state) ?? "FL"

  if (!user.email) return undefined

  return {
    userId: user.id,
    email: user.email,
    fullName,
    accountType,
    businessName,
    trade,
    businessType: optionalString(metadata.business_type) ?? optionalString(metadata.businessType),
    businessPhone: optionalString(metadata.business_phone) ?? optionalString(metadata.businessPhone),
    websiteUrl: optionalString(metadata.website_url) ?? optionalString(metadata.websiteUrl),
    serviceArea: optionalString(metadata.service_area) ?? optionalString(metadata.serviceArea),
    companySize: optionalString(metadata.company_size) ?? optionalString(metadata.companySize),
    yearsInBusiness: optionalString(metadata.years_in_business) ?? optionalString(metadata.yearsInBusiness),
    primaryGoal: optionalString(metadata.primary_goal) ?? optionalString(metadata.primaryGoal),
    city,
    state,
    licenseNumber: optionalString(metadata.license_number) ?? optionalString(metadata.licenseNumber) ?? null,
  } satisfies SignupProfileBootstrapInput
}

export async function bootstrapSignupProfile(input: SignupProfileBootstrapInput) {
  const service = createServiceClient()
  const { error: userError } = await service.from("users").upsert({
    id: input.userId,
    email: input.email,
    full_name: input.fullName,
    role: "contractor",
    account_type: input.accountType,
  })

  if (userError && !isMissingOnboardingColumn(userError)) throw new Error(userError.message)

  const { error: contractorError } = await service.from("contractor_profiles").upsert(
    {
      user_id: input.userId,
      business_name: input.businessName,
      trade: input.trade,
      city: input.city,
      state: input.state.toUpperCase(),
      license_number: input.licenseNumber ?? null,
      verification_status: "pending",
    },
    { onConflict: "user_id" },
  )

  if (contractorError) throw new Error(contractorError.message)

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
      .eq("user_id", input.userId)

    if (optionalProfileError && !isMissingOnboardingColumn(optionalProfileError)) {
      throw new Error(optionalProfileError.message)
    }
  }

  const { data: contractorProfileRow } = await service
    .from("contractor_profiles")
    .select("id")
    .eq("user_id", input.userId)
    .maybeSingle()

  const profileSeed = buildSignupEntityProfileSeed({
    userId: input.userId,
    contractorProfileId: contractorProfileRow?.id,
    accountType: bootstrapProfileType(input.accountType),
    fullName: input.fullName,
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
  const { error: entityProfileError } = await service
    .from("entity_profiles")
    .upsert(
      {
        ...profileSeed.payload,
        rating_factors: profileSeed.payload.rating_factors as Json,
      } as Database["public"]["Tables"]["entity_profiles"]["Insert"],
      { onConflict: "profile_type,slug" },
    )

  if (entityProfileError && !isMissingOnboardingColumn(entityProfileError)) {
    throw new Error(entityProfileError.message)
  }
}

export async function bootstrapSignupProfileFromAuthUser(
  user: Pick<SupabaseAuthUser, "id" | "email" | "user_metadata">,
) {
  const input = signupBootstrapInputFromAuthUser(user)

  if (!input) return

  await bootstrapSignupProfile(input)
}
