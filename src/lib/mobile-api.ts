import { NextResponse } from "next/server"

import { getCurrentUser, getDemoUser, resolveAuthenticatedUserProfile } from "@/lib/auth"
import { getDataMode } from "@/lib/env"
import { noStoreHeaders } from "@/lib/http"
import type {
  ClientReport,
  ContractorProfile,
  ContractorRiskOpsData,
  ReportEvidence,
  SavedSearch,
  Subscription,
  User,
} from "@/lib/types"
import { hasSupabaseServiceConfig } from "@/lib/supabase/config"
import { createServiceClient } from "@/lib/supabase/service"

export type MobileAuthResult =
  | { ok: true; user: User }
  | { ok: false; status: number; message: string }

type MobileDashboardSource = {
  user: User
  contractor: ContractorProfile
  reports: ClientReport[]
  evidence: ReportEvidence[]
  savedSearches: SavedSearch[]
  subscription?: Subscription
}

export function mobileJson<T>(body: T, status = 200) {
  return NextResponse.json(body, { status, headers: noStoreHeaders })
}

export function mobileError(message: string, status = 400, fieldErrors?: Record<string, string[]>) {
  return mobileJson({ ok: false, message, fieldErrors }, status)
}

function bearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? ""
  const [scheme, token] = authorization.trim().split(/\s+/)

  return scheme?.toLowerCase() === "bearer" && token ? token : undefined
}

export async function getMobileAuthenticatedUser(request: Request): Promise<MobileAuthResult> {
  if (getDataMode() === "mock") {
    return { ok: true, user: getDemoUser("contractor") }
  }

  const token = bearerToken(request)

  if (!token) {
    return { ok: false, status: 401, message: "Missing Supabase bearer token." }
  }

  if (!hasSupabaseServiceConfig()) {
    return { ok: false, status: 503, message: "Mobile auth is not configured." }
  }

  const supabase = createServiceClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user) {
    return { ok: false, status: 401, message: "Invalid or expired Supabase bearer token." }
  }

  return { ok: true, user: await resolveAuthenticatedUserProfile(user, supabase) }
}

export async function getMobileDashboardUser(request: Request) {
  const bearerUser = await getMobileAuthenticatedUser(request)

  if (bearerUser.ok) return bearerUser

  const cookieUser = await getCurrentUser()

  if (cookieUser) return { ok: true as const, user: cookieUser }

  return bearerUser
}

export function sanitizeRiskOpsForMobile(riskOps: ContractorRiskOpsData) {
  return {
    counts: {
      watchlist: riskOps.watchlist.length,
      alerts: riskOps.watchlistAlerts.length,
      reportDrafts: riskOps.reportDrafts.length,
      managedRecoveryCases: riskOps.managedRecoveryCases.length,
      floridaLienCases: riskOps.floridaLienCases.length,
      contractPackets: riskOps.contractPackets.length,
      evidenceItems: riskOps.evidenceVault.length,
    },
    serviceReadiness: riskOps.serviceReadiness,
    managedRecoveryCases: riskOps.managedRecoveryCases.map((item) => ({
      id: item.id,
      clientName: item.clientName,
      clientEmailMasked: item.clientEmailMasked,
      city: item.city,
      state: item.state,
      amountDue: item.amountDue,
      invoiceAgeDays: item.invoiceAgeDays,
      preferredChannel: item.preferredChannel,
      status: item.status,
      priority: item.priority,
      readinessStatus: item.readinessStatus,
      readinessScore: item.readinessScore,
      feePaidAt: item.feePaidAt,
      submittedForReviewAt: item.submittedForReviewAt,
      nextAction: item.nextAction,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    })),
    floridaLienCases: riskOps.floridaLienCases.map((item) => ({
      id: item.id,
      workflowType: item.workflowType,
      clientName: item.clientName,
      ownerName: item.ownerName,
      propertyCounty: item.propertyCounty,
      propertyCity: item.propertyCity,
      state: item.state,
      projectType: item.projectType,
      contractAmount: item.contractAmount,
      amountDue: item.amountDue,
      lastWorkDate: item.lastWorkDate,
      filingDeadline: item.filingDeadline,
      status: item.status,
      attorneyVendorStatus: item.attorneyVendorStatus,
      contractorSignedAt: item.contractorSignedAt,
      readinessStatus: item.readinessStatus,
      readinessScore: item.readinessScore,
      feePaidAt: item.feePaidAt,
      submittedForReviewAt: item.submittedForReviewAt,
      nextAction: item.nextAction,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    })),
    evidenceVault: riskOps.evidenceVault.map((item) => ({
      id: item.id,
      clientName: item.clientName,
      label: item.label,
      fileCategory: item.fileCategory,
      status: item.status,
      publicSummary: item.publicSummary,
      uploadedAt: item.uploadedAt,
      updatedAt: item.updatedAt,
    })),
    serviceFeeOrders: riskOps.serviceFeeOrders.map((order) => ({
      id: order.id,
      kind: order.kind,
      entityId: order.entityId,
      status: order.status,
      clientBureauFeeCents: order.clientBureauFeeCents,
      passThroughFeeCents: order.passThroughFeeCents,
      currency: order.currency,
      paidAt: order.paidAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    })),
  }
}

export function sanitizeDashboardForMobile(dashboard: MobileDashboardSource) {
  return {
    contractor: {
      id: dashboard.contractor.id,
      businessName: dashboard.contractor.businessName,
      trade: dashboard.contractor.trade,
      city: dashboard.contractor.city,
      state: dashboard.contractor.state,
      verificationStatus: dashboard.contractor.verificationStatus,
    },
    stats: {
      reportsSubmitted: dashboard.reports.length,
      savedSearches: dashboard.savedSearches.length,
      evidenceItems: dashboard.evidence.length,
    },
    reports: dashboard.reports.map((report) => ({
      id: report.id,
      projectType: report.projectType,
      projectCity: report.projectCity,
      projectState: report.projectState,
      reportCategory: report.reportCategory,
      paymentStatus: report.paymentStatus,
      status: report.status,
      createdAt: report.createdAt,
    })),
    savedSearches: dashboard.savedSearches,
    subscription: dashboard.subscription,
  }
}
