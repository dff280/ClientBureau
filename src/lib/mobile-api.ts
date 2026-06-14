import { NextResponse } from "next/server"

import { getCurrentUser, getDemoUser, resolveAuthenticatedUserProfile } from "@/lib/auth"
import { getDataMode } from "@/lib/env"
import { noStoreHeaders } from "@/lib/http"
import type {
  ClientSearchResult,
  ContractPacket,
  ClientReport,
  ContractorProfile,
  ContractorRiskOpsData,
  EvidenceVaultItem,
  ReportEvidence,
  SavedSearch,
  SavedClientSearch,
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

export type MobileSearchResult = {
  id: string
  displayName: string
  businessName?: string
  city: string
  state: string
  publicSlug: string
  score: number
  riskLevel: string
  reportCount: number
  matchedBy: string
  matchScore: number
  latestCategory?: string
  latestSummary?: string
  positiveSignalCount: number
  openDisputeCount: number
  resolvedReportCount: number
  evidenceOnFile: boolean
  paymentContextLabel: string
}

export type MobileSavedSearch = {
  id: string
  query: string
  city?: string
  state?: string
  riskLevel?: string
  category?: string
  profileType?: string
  tradeCategory?: string
  resultCount: number
  createdAt: string
  lastRunAt?: string
}

export type MobileReportSummary = {
  id: string
  clientId: string
  projectType: string
  projectCity: string
  projectState: string
  reportCategory: string
  paymentStatus: string
  status: string
  resolutionStatus?: string
  amountUnpaid: number
  contractAmount: number
  evidenceAttached: boolean
  createdAt: string
  approvedAt?: string
}

export type MobileContractPacketSummary = {
  id: string
  clientName: string
  projectType: string
  templateType: string
  status: string
  packetValue: number
  depositRequired: number
  milestoneCount: number
  requiredBeforeScheduling: boolean
  shareUrl?: string
  clientEmailMasked?: string
  clientInviteStatus?: string
  signatureStatus?: string
  shareStatus?: string
  paymentMode?: string
  clientSignedAt?: string
  nextAction: string
  createdAt: string
  updatedAt: string
}

export type MobileEvidenceSummary = {
  id: string
  reportId?: string
  clientName?: string
  label: string
  fileCategory?: string
  fileName?: string
  fileType?: string
  status?: string
  publicSummary?: string
  uploadedAt: string
  updatedAt?: string
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
    evidenceVault: riskOps.evidenceVault.map(sanitizeEvidenceVaultForMobile),
    contractPackets: riskOps.contractPackets.map(sanitizeContractPacketForMobile),
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
    reports: dashboard.reports.map(sanitizeReportForMobile),
    savedSearches: dashboard.savedSearches.map(sanitizeSavedSearchForMobile),
    subscription: dashboard.subscription
      ? {
          tier: dashboard.subscription.tier,
          status: dashboard.subscription.status,
          currentPeriodEnd: dashboard.subscription.currentPeriodEnd,
        }
      : undefined,
  }
}

export function sanitizeSearchResultForMobile(result: ClientSearchResult): MobileSearchResult {
  return {
    id: result.id,
    displayName: `${result.firstName} ${result.lastName}`.trim(),
    businessName: result.businessName,
    city: result.city,
    state: result.state,
    publicSlug: result.publicSlug,
    score: result.clientBureauScore,
    riskLevel: result.riskLevel,
    reportCount: result.reportCount,
    matchedBy: result.matchedBy,
    matchScore: result.matchScore,
    latestCategory: result.latestCategory,
    latestSummary: result.latestSummary,
    positiveSignalCount: result.positiveSignalCount ?? 0,
    openDisputeCount: result.openDisputeCount ?? 0,
    resolvedReportCount: result.resolvedReportCount ?? 0,
    evidenceOnFile: Boolean(result.evidenceOnFile),
    paymentContextLabel: result.paymentContextLabel ?? "Moderated report context available",
  }
}

export function sanitizeSavedSearchForMobile(search: SavedSearch | SavedClientSearch): MobileSavedSearch {
  return {
    id: search.id,
    query: search.query,
    city: search.city,
    state: search.state,
    riskLevel: "riskLevel" in search ? search.riskLevel : undefined,
    category: "category" in search ? search.category : undefined,
    profileType: "profileType" in search ? search.profileType : undefined,
    tradeCategory: "tradeCategory" in search ? search.tradeCategory : undefined,
    resultCount: ("resultCount" in search ? search.resultCount : undefined) ?? 0,
    createdAt: search.createdAt,
    lastRunAt: "lastRunAt" in search ? search.lastRunAt : undefined,
  }
}

export function sanitizeReportForMobile(report: ClientReport): MobileReportSummary {
  return {
    id: report.id,
    clientId: report.clientId,
    projectType: report.projectType,
    projectCity: report.projectCity,
    projectState: report.projectState,
    reportCategory: report.reportCategory,
    paymentStatus: report.paymentStatus,
    status: report.status,
    resolutionStatus: report.resolutionStatus,
    amountUnpaid: report.amountUnpaid,
    contractAmount: report.contractAmount,
    evidenceAttached: report.evidenceAttached,
    createdAt: report.createdAt,
    approvedAt: report.approvedAt,
  }
}

export function sanitizeContractPacketForMobile(packet: ContractPacket): MobileContractPacketSummary {
  return {
    id: packet.id,
    clientName: packet.clientName,
    projectType: packet.projectType,
    templateType: packet.templateType,
    status: packet.status,
    packetValue: packet.packetValue,
    depositRequired: packet.depositRequired,
    milestoneCount: packet.milestoneCount,
    requiredBeforeScheduling: packet.requiredBeforeScheduling,
    shareUrl: packet.shareUrl,
    clientEmailMasked: packet.clientEmailMasked,
    clientInviteStatus: packet.clientInviteStatus,
    signatureStatus: packet.signatureStatus,
    shareStatus: packet.shareStatus,
    paymentMode: packet.paymentMode,
    clientSignedAt: packet.clientSignedAt,
    nextAction: packet.nextAction,
    createdAt: packet.createdAt,
    updatedAt: packet.updatedAt,
  }
}

export function sanitizeEvidenceVaultForMobile(item: EvidenceVaultItem): MobileEvidenceSummary {
  return {
    id: item.id,
    reportId: item.reportId,
    clientName: item.clientName,
    label: item.label,
    fileCategory: item.fileCategory,
    status: item.status,
    publicSummary: item.publicSummary,
    uploadedAt: item.uploadedAt,
    updatedAt: item.updatedAt,
  }
}

export function sanitizeReportEvidenceForMobile(item: ReportEvidence): MobileEvidenceSummary {
  return {
    id: item.id,
    reportId: item.reportId,
    label: item.fileName,
    fileName: item.fileName,
    fileType: item.fileType,
    status: "uploaded",
    publicSummary: "Private evidence is on file and never shown publicly without moderation.",
    uploadedAt: item.uploadedAt,
  }
}
