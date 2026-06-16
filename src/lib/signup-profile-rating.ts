import {
  BUSINESS_RATING_VERSION,
  businessRatingModelForProfileType,
  calculateBusinessRating,
} from "@/lib/business-rating"
import { buildEntityProfileSlug } from "@/lib/entity-profiles"
import { normalizeStateCode } from "@/lib/locations"
import type {
  ContractorProfile,
  ProfileType,
} from "@/lib/types"

export interface SignupProfileRatingInput {
  userId: string
  contractorProfileId?: string | null
  accountType: ProfileType
  fullName: string
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
  now?: string
}

export function buildSignupContractorRatingProfile(input: SignupProfileRatingInput): ContractorProfile {
  return {
    id: input.contractorProfileId ?? "signup-profile",
    userId: input.userId,
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
    state: normalizeStateCode(input.state),
    licenseNumber: input.licenseNumber ?? undefined,
    verificationStatus: "pending",
    createdAt: input.now ?? new Date().toISOString(),
  }
}

export function buildSignupEntityProfileSeed(input: SignupProfileRatingInput) {
  const profileType = input.accountType === "client" ? "client" : input.accountType
  const profileSlug = buildEntityProfileSlug({
    profileType,
    displayName: input.businessName,
    businessName: profileType === "client" ? undefined : input.businessName,
    city: input.city,
    state: input.state,
  })
  const now = input.now ?? new Date().toISOString()

  if (profileType === "client") {
    return {
      profileType,
      profileSlug,
      rating: undefined,
      payload: {
        profile_type: profileType,
        display_name: input.businessName,
        legal_name_private: input.fullName,
        business_name: null,
        city: input.city,
        state: normalizeStateCode(input.state),
        slug: profileSlug,
        legacy_contractor_id: null,
        claimed_status: "claimed",
        owner_user_id: input.userId,
        account_capabilities: [profileType],
        rating_score: 70,
        rating_band: "Moderate",
        rating_model: "client_risk",
        rating_version: "client-risk-v1",
        rating_confidence: "Basic",
        rating_factors: [],
        rating_public_note: "Claimed client/customer profile. Public content appears only after moderation approval.",
        rating_last_calculated_at: now,
        public_summary: "Claimed client/customer profile. Public content appears only after moderation approval.",
        is_public: false,
      },
    }
  }

  const contractor = buildSignupContractorRatingProfile(input)
  const rating = calculateBusinessRating({ contractor, reports: [], evidence: [] })

  return {
    profileType,
    profileSlug,
    rating,
    payload: {
      profile_type: profileType,
      profile_subtype: profileType === "subcontractor" ? input.businessType ?? "Individual trade professional" : input.businessType ?? "Service business",
      account_capabilities: [profileType],
      display_name: input.businessName,
      legal_name_private: input.fullName,
      business_name: input.businessName,
      city: input.city,
      state: normalizeStateCode(input.state),
      slug: profileSlug,
      legacy_contractor_id: input.contractorProfileId ?? null,
      claimed_status: "claimed",
      owner_user_id: input.userId,
      verification_level: "email_verified",
      verification_badges: ["Verified email"],
      rating_score: rating.score,
      rating_band: rating.grade,
      rating_model: businessRatingModelForProfileType(profileType, rating.profileKind),
      rating_version: BUSINESS_RATING_VERSION,
      rating_confidence: rating.confidence,
      rating_factors: rating.factors,
      rating_public_note: rating.summary,
      rating_last_calculated_at: now,
      public_summary:
        profileType === "subcontractor"
          ? "Trade partner profile with verification context, documented scope signals, and moderated payment-chain activity."
          : "Business profile with verification context and moderated project activity.",
      is_public: true,
    },
  }
}
