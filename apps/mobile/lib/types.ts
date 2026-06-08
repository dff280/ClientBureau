export type ApiResult<T> =
  | { ok: true; data: T; message: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> }

export type MobileUser = {
  id: string
  email: string
  fullName: string
  role: "contractor" | "admin"
  accountType?: "contractor" | "client"
  createdAt: string
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

export type MobileReport = {
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

export type MobileContractPacket = {
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
  signatureStatus?: string
  shareStatus?: string
  paymentMode?: string
  clientSignedAt?: string
  nextAction: string
  createdAt: string
  updatedAt: string
}

export type MobileEvidence = {
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

export type DashboardPayload = {
  dashboard: {
    contractor: {
      id: string
      businessName: string
      trade: string
      city: string
      state: string
      verificationStatus: string
    }
    stats: {
      reportsSubmitted: number
      savedSearches: number
      evidenceItems: number
    }
    reports: MobileReport[]
    savedSearches: Array<{
      id: string
      query: string
      city?: string
      state?: string
      resultCount: number
      createdAt: string
    }>
    subscription?: {
      tier: string
      status: string
      currentPeriodEnd?: string
    }
  }
  riskOps?: {
    counts: {
      watchlist: number
      alerts: number
      reportDrafts: number
      managedRecoveryCases: number
      floridaLienCases: number
      contractPackets: number
      evidenceItems: number
    }
    managedRecoveryCases: Array<Record<string, unknown>>
    floridaLienCases: Array<Record<string, unknown>>
    evidenceVault: MobileEvidence[]
    contractPackets: MobileContractPacket[]
  }
}
