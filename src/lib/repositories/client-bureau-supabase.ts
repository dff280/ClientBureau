import { createHash } from "node:crypto"

import type { Database } from "@/lib/database.types"
import { calculateClientBureauScore, disputeHistoryLabel, getScoreFactors, paymentReliabilityLabel } from "@/lib/scoring"
import { buildClientSlug, ensureUniqueSlug } from "@/lib/slug"
import { createServiceClient } from "@/lib/supabase/service"
import type { ClientReportInput, ClientResponseInput } from "@/lib/schemas/client-bureau"
import type {
  AdminReview,
  ClientProfile,
  ClientReport,
  ClientResponse,
  ClientSearchResult,
  ContractorProfile,
  PublicClientProfile,
  ReportEvidence,
  ReportTimelineEvent,
  ReviewChecklistItem,
  ReviewChecklistStatus,
  SavedSearch,
  SearchFilters,
  Subscription,
  User,
} from "@/lib/types"

type Tables = Database["public"]["Tables"]
type UserRow = Tables["users"]["Row"]
type ContractorProfileRow = Tables["contractor_profiles"]["Row"]
type ClientProfileRow = Tables["client_profiles"]["Row"]
type ClientReportRow = Tables["client_reports"]["Row"]
type ReportEvidenceRow = Tables["report_evidence"]["Row"]
type ClientResponseRow = Tables["client_responses"]["Row"]
type SubscriptionRow = Tables["subscriptions"]["Row"]
type AdminReviewRow = Tables["admin_reviews"]["Row"]

const emptyHash = "sha256:empty-private"

function mapUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    createdAt: row.created_at,
  }
}

function mapContractorProfile(row: ContractorProfileRow): ContractorProfile {
  return {
    id: row.id,
    userId: row.user_id,
    businessName: row.business_name,
    trade: row.trade,
    city: row.city,
    state: row.state,
    licenseNumber: row.license_number ?? undefined,
    verificationStatus: row.verification_status,
    createdAt: row.created_at,
  }
}

function mapClientProfile(row: ClientProfileRow): ClientProfile {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    businessName: row.business_name ?? undefined,
    city: row.city,
    state: row.state,
    zip: row.zip ?? undefined,
    phoneHash: row.phone_hash,
    emailHash: row.email_hash,
    publicSlug: row.public_slug,
    clientBureauScore: row.client_bureau_score,
    riskLevel: row.risk_level,
    reportCount: row.report_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isPublic: row.is_public,
  }
}

function mapClientReport(row: ClientReportRow): ClientReport {
  return {
    id: row.id,
    contractorId: row.contractor_id,
    clientId: row.client_id,
    projectType: row.project_type,
    projectCity: row.project_city,
    projectState: row.project_state,
    contractAmount: row.contract_amount,
    amountUnpaid: row.amount_unpaid,
    reportCategory: row.report_category,
    paymentStatus: row.payment_status,
    reportSummary: row.report_summary,
    detailedExperience: row.detailed_experience,
    publicSummary: row.public_summary,
    evidenceAttached: row.evidence_attached,
    status: row.status,
    moderationNote: row.moderation_note ?? undefined,
    createdAt: row.created_at,
    approvedAt: row.approved_at ?? undefined,
  }
}

function mapEvidence(row: ReportEvidenceRow): ReportEvidence {
  return {
    id: row.id,
    reportId: row.report_id,
    fileName: row.file_name,
    fileType: row.file_type,
    storagePath: row.storage_path,
    uploadedAt: row.uploaded_at,
  }
}

function mapResponse(row: ClientResponseRow): ClientResponse {
  return {
    id: row.id,
    clientId: row.client_id,
    reportId: row.report_id ?? undefined,
    responseSummary: row.response_summary,
    status: row.status,
    createdAt: row.created_at,
    publishedAt: row.published_at ?? undefined,
  }
}

function mapSubscriptionStatus(status: string): Subscription["status"] {
  if (["trialing", "active", "past_due", "canceled", "mock"].includes(status)) {
    return status as Subscription["status"]
  }

  if (["unpaid", "incomplete", "incomplete_expired"].includes(status)) return "past_due"

  return "active"
}

function mapSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    contractorId: row.contractor_id,
    tier: row.tier,
    status: mapSubscriptionStatus(row.status),
    stripeCustomerId: row.stripe_customer_id ?? undefined,
    stripeSubscriptionId: row.stripe_subscription_id ?? undefined,
    stripePriceId: row.stripe_price_id ?? undefined,
    currentPeriodEnd: row.current_period_end ?? undefined,
  }
}

function mapAdminReview(row: AdminReviewRow): AdminReview {
  return {
    id: row.id,
    reportId: row.report_id,
    reviewerId: row.reviewer_id ?? undefined,
    status: row.status,
    editedPublicSummary: row.edited_public_summary ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function hashIdentifier(value?: string, type: "email" | "phone" = "email") {
  const normalized =
    type === "phone"
      ? (value ?? "").replace(/\D/g, "")
      : (value ?? "").trim().toLowerCase()

  if (!normalized) return emptyHash

  return `sha256:${createHash("sha256").update(normalized).digest("hex")}`
}

function reportTimeline(report: ClientReport): ReportTimelineEvent[] {
  const events: ReportTimelineEvent[] = [
    {
      id: `${report.id}_submitted`,
      reportId: report.id,
      type: "submitted",
      title: "Report submitted",
      description: "Contractor submitted project facts and payment context for moderation.",
      createdAt: report.createdAt,
    },
  ]

  if (report.evidenceAttached) {
    events.push({
      id: `${report.id}_evidence`,
      reportId: report.id,
      type: "evidence_uploaded",
      title: "Evidence attached",
      description: "Supporting files were attached for admin-only review.",
      createdAt: report.createdAt,
    })
  }

  if (report.approvedAt || report.status === "approved") {
    events.push({
      id: `${report.id}_approved`,
      reportId: report.id,
      type: "approved",
      title: "Summary approved",
      description: "Public summary passed moderation and became eligible for the client profile.",
      createdAt: report.approvedAt ?? report.createdAt,
    })
  }

  if (report.status === "disputed") {
    events.push({
      id: `${report.id}_disputed`,
      reportId: report.id,
      type: "disputed",
      title: "Dispute context received",
      description: "A client response or dispute is attached and visible with the report context.",
      createdAt: report.createdAt,
    })
  }

  return events
}

async function getApprovedReportsForClient(clientId: string) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("client_reports")
    .select("*")
    .eq("client_id", clientId)
    .in("status", ["approved", "disputed"])
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map(mapClientReport)
}

async function getExistingSlugs(exceptClientId?: string) {
  const supabase = createServiceClient()
  const { data, error } = await supabase.from("client_profiles").select("id, public_slug")

  if (error) throw new Error(error.message)

  return (data ?? [])
    .filter((row) => row.id !== exceptClientId)
    .map((row) => row.public_slug)
}

async function findOrCreateClientProfile(input: ClientReportInput) {
  const supabase = createServiceClient()
  const phoneHash = hashIdentifier(input.phone, "phone")
  const emailHash = hashIdentifier(input.email, "email")
  const baseSlug = buildClientSlug({
    firstName: input.firstName,
    lastName: input.lastName,
    city: input.city,
    state: input.state.toUpperCase(),
  })

  const filters = [
    phoneHash !== emptyHash ? `phone_hash.eq.${phoneHash}` : undefined,
    emailHash !== emptyHash ? `email_hash.eq.${emailHash}` : undefined,
  ].filter(Boolean)

  if (filters.length > 0) {
    const { data, error } = await supabase
      .from("client_profiles")
      .select("*")
      .or(filters.join(","))
      .limit(1)
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (data) return data
  }

  const { data: existingBySlug, error: slugError } = await supabase
    .from("client_profiles")
    .select("*")
    .eq("public_slug", baseSlug)
    .maybeSingle()

  if (slugError) throw new Error(slugError.message)
  if (existingBySlug) return existingBySlug

  const publicSlug = ensureUniqueSlug(baseSlug, await getExistingSlugs())
  const { data, error } = await supabase
    .from("client_profiles")
    .insert({
      first_name: input.firstName,
      last_name: input.lastName,
      business_name: input.businessName ?? null,
      city: input.city,
      state: input.state.toUpperCase(),
      phone_hash: phoneHash,
      email_hash: emailHash,
      public_slug: publicSlug,
      is_public: false,
    })
    .select("*")
    .single()

  if (error) throw new Error(error.message)

  return data
}

export async function getPublicClientProfilesSupabase() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("client_profiles")
    .select("*")
    .eq("is_public", true)
    .order("updated_at", { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map(mapClientProfile)
}

export async function getPublicClientProfileSupabase(slug: string): Promise<PublicClientProfile | undefined> {
  const supabase = createServiceClient()
  const { data: profileRow, error: profileError } = await supabase
    .from("client_profiles")
    .select("*")
    .eq("public_slug", slug)
    .eq("is_public", true)
    .maybeSingle()

  if (profileError) throw new Error(profileError.message)
  if (!profileRow) return undefined

  const profile = mapClientProfile(profileRow)
  const reports = await getApprovedReportsForClient(profile.id)
  const reportIds = reports.map((report) => report.id)

  const [{ data: responseRows, error: responseError }, evidenceResult] = await Promise.all([
    supabase
      .from("client_responses")
      .select("*")
      .eq("client_id", profile.id)
      .eq("status", "published")
      .order("created_at", { ascending: false }),
    reportIds.length > 0
      ? supabase.from("report_evidence").select("*").in("report_id", reportIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (responseError) throw new Error(responseError.message)
  if (evidenceResult.error) throw new Error(evidenceResult.error.message)

  const positiveReports = reports.filter((report) =>
    ["Positive experience", "Would work with again"].includes(report.reportCategory),
  )

  return {
    ...profile,
    reports,
    positiveReports,
    clientResponses: (responseRows ?? []).map(mapResponse),
    evidence: (evidenceResult.data ?? []).map(mapEvidence),
    timeline: reports
      .flatMap(reportTimeline)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    scoreFactors: getScoreFactors(reports),
    paymentReliability: paymentReliabilityLabel(profile.clientBureauScore),
    disputeHistory: disputeHistoryLabel(reports),
  }
}

export async function searchClientsSupabase(
  query = "",
  filters: SearchFilters = {},
): Promise<ClientSearchResult[]> {
  const supabase = createServiceClient()
  const normalizedQuery = query.trim().toLowerCase()
  let builder = supabase.from("client_profiles").select("*").eq("is_public", true)

  if (filters.state) builder = builder.eq("state", filters.state)
  if (filters.riskLevel) builder = builder.eq("risk_level", filters.riskLevel)

  const { data, error } = await builder.order("updated_at", { ascending: false })

  if (error) throw new Error(error.message)

  const profiles = (data ?? []).map(mapClientProfile)
  const results = await Promise.all(
    profiles.map(async (client) => {
      const reports = await getApprovedReportsForClient(client.id)
      const latestReport = reports[0]
      const nameLocation = [
        client.firstName,
        client.lastName,
        client.businessName,
        client.city,
        client.state,
        client.zip,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      const privateIdentifiers = [client.phoneHash, client.emailHash].join(" ").toLowerCase()
      const searchable = `${nameLocation} ${privateIdentifiers}`
      const privateIntent = normalizedQuery.includes("@") || /\d{7,}/.test(normalizedQuery)
      const exactNameMatch = normalizedQuery.length > 0 && nameLocation.includes(normalizedQuery)
      const privateMatch = privateIntent && privateIdentifiers.includes(normalizedQuery)
      const reportMatch = reports.some((report) =>
        [report.reportCategory, report.paymentStatus, report.publicSummary]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      )
      const matchScore =
        (exactNameMatch ? 50 : 0) +
        (privateMatch ? 45 : 0) +
        (reportMatch ? 25 : 0) +
        (filters.state && client.state === filters.state ? 10 : 0) +
        (client.riskLevel === "High" ? 8 : client.riskLevel === "Elevated" ? 5 : 2)

      return {
        ...client,
        matchedBy: privateIntent
          ? "Private identifier checked"
          : reportMatch
            ? "Report context match"
            : "Name and location match",
        matchScore,
        latestCategory: latestReport?.reportCategory,
        latestSummary: latestReport?.publicSummary,
        searchable,
        reports,
      }
    }),
  )

  return results
    .filter((client) => {
      const matchesQuery = normalizedQuery.length === 0 || client.searchable.includes(normalizedQuery)
      const matchesCategory =
        !filters.category ||
        client.reports.some((report) => report.reportCategory === filters.category)

      return matchesQuery && matchesCategory
    })
    .sort((a, b) => b.matchScore - a.matchScore || b.reportCount - a.reportCount)
    .map((client) => {
      const { searchable, reports, ...result } = client

      void searchable
      void reports

      return result
    })
}

export async function getContractorDashboardSupabase(userId: string) {
  const supabase = createServiceClient()
  const { data: userRow, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single()

  if (userError) throw new Error(userError.message)

  const { data: contractorRow, error: contractorError } = await supabase
    .from("contractor_profiles")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (contractorError) throw new Error(contractorError.message)

  const { data: reportRows, error: reportError } = await supabase
    .from("client_reports")
    .select("*")
    .eq("contractor_id", contractorRow.id)
    .order("created_at", { ascending: false })

  if (reportError) throw new Error(reportError.message)

  const reports = (reportRows ?? []).map(mapClientReport)
  const reportIds = reports.map((report) => report.id)
  const [{ data: evidenceRows, error: evidenceError }, { data: subscriptionRow, error: subscriptionError }] =
    await Promise.all([
      reportIds.length > 0
        ? supabase.from("report_evidence").select("*").in("report_id", reportIds)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("subscriptions")
        .select("*")
        .eq("contractor_id", contractorRow.id)
        .maybeSingle(),
    ])

  if (evidenceError) throw new Error(evidenceError.message)
  if (subscriptionError) throw new Error(subscriptionError.message)

  return {
    user: mapUser(userRow),
    contractor: mapContractorProfile(contractorRow),
    reports,
    evidence: (evidenceRows ?? []).map(mapEvidence),
    savedSearches: [] satisfies SavedSearch[],
    subscription: subscriptionRow ? mapSubscription(subscriptionRow) : undefined,
  }
}

export async function getPendingAdminReviewsSupabase() {
  const supabase = createServiceClient()
  const { data: reviewRows, error: reviewError } = await supabase
    .from("admin_reviews")
    .select("*")
    .order("created_at", { ascending: false })

  if (reviewError) throw new Error(reviewError.message)

  return Promise.all(
    (reviewRows ?? []).map(async (reviewRow) => {
      const review = mapAdminReview(reviewRow)
      const { data: reportRow, error: reportError } = await supabase
        .from("client_reports")
        .select("*")
        .eq("id", review.reportId)
        .maybeSingle()

      if (reportError) throw new Error(reportError.message)

      const report = reportRow ? mapClientReport(reportRow) : undefined
      const [{ data: clientRow, error: clientError }, { data: evidenceRows, error: evidenceError }] =
        await Promise.all([
          reportRow
            ? supabase.from("client_profiles").select("*").eq("id", reportRow.client_id).maybeSingle()
            : Promise.resolve({ data: null, error: null }),
          reportRow
            ? supabase.from("report_evidence").select("*").eq("report_id", reportRow.id)
            : Promise.resolve({ data: [], error: null }),
        ])

      if (clientError) throw new Error(clientError.message)
      if (evidenceError) throw new Error(evidenceError.message)

      const checklist: ReviewChecklistItem[] = report
        ? [
            {
              id: `${review.id}_evidence`,
              reportId: report.id,
              label: "Evidence reviewed",
              description: report.evidenceAttached
                ? "Evidence is attached and available for admin-only review."
                : "No evidence is attached; approve only if the summary is otherwise supportable.",
              status: (report.evidenceAttached ? "pass" : "warning") satisfies ReviewChecklistStatus,
            },
            {
              id: `${review.id}_neutral`,
              reportId: report.id,
              label: "Neutral public summary",
              description: "Summary uses reported-experience language and avoids motive claims.",
              status: "pending" satisfies ReviewChecklistStatus,
            },
            {
              id: `${review.id}_private`,
              reportId: report.id,
              label: "Private identifiers hidden",
              description: "Phone and email remain hashed/private and are not included publicly.",
              status: "pass" satisfies ReviewChecklistStatus,
            },
          ]
        : []

      return {
        review,
        report,
        client: clientRow ? mapClientProfile(clientRow) : undefined,
        evidence: (evidenceRows ?? []).map(mapEvidence),
        checklist,
      }
    }),
  )
}

export async function submitClientReportSupabase(
  input: ClientReportInput,
  userId: string,
  evidenceFiles: File[] = [],
) {
  const supabase = createServiceClient()
  const { data: contractorRow, error: contractorError } = await supabase
    .from("contractor_profiles")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (contractorError) throw new Error(contractorError.message)

  const clientRow = await findOrCreateClientProfile(input)
  const { data: reportRow, error: reportError } = await supabase
    .from("client_reports")
    .insert({
      contractor_id: contractorRow.id,
      client_id: clientRow.id,
      project_type: input.projectType,
      project_city: input.projectCity,
      project_state: input.projectState.toUpperCase(),
      contract_amount: input.contractAmount,
      amount_unpaid: input.amountUnpaid,
      report_category: input.reportCategory,
      payment_status: input.paymentStatus,
      report_summary: input.reportSummary,
      detailed_experience: input.detailedExperience,
      public_summary: input.reportSummary,
      evidence_attached: Boolean(input.evidenceAttached || evidenceFiles.length > 0),
      status: "pending",
      moderation_note: "Queued for Client Bureau moderation.",
    })
    .select("*")
    .single()

  if (reportError) throw new Error(reportError.message)

  const validFiles = evidenceFiles.filter((file) => file.size > 0)

  if (validFiles.length > 0) {
    await Promise.all(
      validFiles.map(async (file) => {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-")
        const storagePath = `report-evidence/${reportRow.id}/${Date.now()}-${safeName}`
        const { error: uploadError } = await supabase.storage
          .from("report-evidence")
          .upload(storagePath, file, {
            contentType: file.type || "application/octet-stream",
            upsert: false,
          })

        if (uploadError) throw new Error(uploadError.message)

        const { error: evidenceError } = await supabase.from("report_evidence").insert({
          report_id: reportRow.id,
          file_name: file.name,
          file_type: file.type || "application/octet-stream",
          storage_path: storagePath,
        })

        if (evidenceError) throw new Error(evidenceError.message)
      }),
    )
  }

  const { error: reviewError } = await supabase.from("admin_reviews").insert({
    report_id: reportRow.id,
    status: "queued",
    notes: "New contractor-submitted report queued for policy review.",
  })

  if (reviewError) throw new Error(reviewError.message)

  return mapClientReport(reportRow)
}

function extractSlugFromProfileUrl(profileUrl: string) {
  try {
    const parsed = new URL(profileUrl)
    const segments = parsed.pathname.split("/").filter(Boolean)
    const clientIndex = segments.indexOf("client")

    return clientIndex >= 0 ? segments[clientIndex + 1] : segments.at(-1)
  } catch {
    const segments = profileUrl.split("/").filter(Boolean)
    const clientIndex = segments.indexOf("client")

    return clientIndex >= 0 ? segments[clientIndex + 1] : segments.at(-1)
  }
}

export async function submitClientResponseSupabase(input: ClientResponseInput) {
  const supabase = createServiceClient()
  const slug = extractSlugFromProfileUrl(input.profileUrl)

  if (!slug) {
    throw new Error("A valid public profile URL is required.")
  }

  const { data: clientRow, error: clientError } = await supabase
    .from("client_profiles")
    .select("*")
    .eq("public_slug", slug)
    .maybeSingle()

  if (clientError) throw new Error(clientError.message)
  if (!clientRow) throw new Error("No Client Bureau profile was found for that URL.")

  const { data, error } = await supabase
    .from("client_responses")
    .insert({
      client_id: clientRow.id,
      response_summary: `${input.requestType}: ${input.responseSummary}`,
      status: "pending",
    })
    .select("*")
    .single()

  if (error) throw new Error(error.message)

  return mapResponse(data)
}

export async function reviewReportSupabase(
  reportId: string,
  decision: "approved" | "rejected",
  editedPublicSummary?: string,
  reviewerId?: string,
) {
  const supabase = createServiceClient()
  const now = new Date().toISOString()
  const nextReportStatus = decision === "approved" ? "approved" : "rejected"
  const { data: reportRow, error: reportError } = await supabase
    .from("client_reports")
    .update({
      status: nextReportStatus,
      public_summary: editedPublicSummary ?? "",
      approved_at: decision === "approved" ? now : null,
      moderation_note:
        decision === "approved"
          ? "Approved public summary after admin review."
          : "Rejected during Client Bureau moderation.",
    })
    .eq("id", reportId)
    .select("*")
    .single()

  if (reportError) throw new Error(reportError.message)

  const { data: existingReview, error: existingReviewError } = await supabase
    .from("admin_reviews")
    .select("*")
    .eq("report_id", reportId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingReviewError) throw new Error(existingReviewError.message)

  let publishedProfile: ClientProfile | undefined

  if (decision === "approved") {
    const reports = await getApprovedReportsForClient(reportRow.client_id)
    const calculated = calculateClientBureauScore(reports)

    const { data: profileRow, error: profileUpdateError } = await supabase
      .from("client_profiles")
      .update({
        is_public: true,
        client_bureau_score: calculated.score,
        risk_level: calculated.riskLevel,
        report_count: calculated.reportCount,
        updated_at: now,
      })
      .eq("id", reportRow.client_id)
      .select("*")
      .single()

    if (profileUpdateError) throw new Error(profileUpdateError.message)

    publishedProfile = mapClientProfile(profileRow)
  }

  const reviewPayload = {
    reviewer_id: reviewerId ?? null,
    status: decision,
    edited_public_summary: editedPublicSummary ?? null,
    notes:
      decision === "approved" && publishedProfile
        ? `Approved report published at /client/${publishedProfile.publicSlug}.`
        : "Rejected report remains private.",
    updated_at: now,
  }

  const reviewMutation = existingReview
    ? supabase.from("admin_reviews").update(reviewPayload).eq("id", existingReview.id).select("*").single()
    : supabase
        .from("admin_reviews")
        .insert({ report_id: reportId, ...reviewPayload })
        .select("*")
        .single()

  const { data: reviewRow, error: reviewError } = await reviewMutation

  if (reviewError) throw new Error(reviewError.message)

  return {
    ...mapAdminReview(reviewRow),
    publishedProfileSlug: publishedProfile?.publicSlug,
    publishedProfileUrl: publishedProfile ? `/client/${publishedProfile.publicSlug}` : undefined,
  }
}
