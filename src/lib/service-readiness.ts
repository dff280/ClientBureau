import type {
  CaseDocumentLink,
  EvidenceVaultItem,
  FloridaLienCase,
  ManagedRecoveryCase,
  ServiceFeeKind,
  ServiceFeeOrder,
  ServiceReadinessCheck,
  ServiceReadinessStatus,
  ServiceReadinessSummary,
} from "@/lib/types"

const readinessWeights = {
  identity: 15,
  amount: 15,
  timeline: 20,
  documents: 25,
  authorization: 15,
  fee: 10,
}

function matchingFeeOrder(
  entityId: string,
  kind: ServiceFeeKind | ServiceFeeKind[],
  serviceFeeOrders: ServiceFeeOrder[],
) {
  const kinds = Array.isArray(kind) ? kind : [kind]

  return serviceFeeOrders.find((order) => order.entityId === entityId && kinds.includes(order.kind))
}

function evidenceForIds(ids: string[], evidenceVault: EvidenceVaultItem[]) {
  const idSet = new Set(ids)

  return evidenceVault.filter((item) => idSet.has(item.id))
}

function check(id: string, label: string, complete: boolean, detail: string): ServiceReadinessCheck {
  return { id, label, complete, detail }
}

function scoreChecks(checks: ServiceReadinessCheck[]) {
  return checks.reduce((total, item) => {
    const weight = readinessWeights[item.id as keyof typeof readinessWeights] ?? 10
    return total + (item.complete ? weight : 0)
  }, 0)
}

function readinessStatus({
  checks,
  feeOrder,
  closed,
  blocked,
}: {
  checks: ServiceReadinessCheck[]
  feeOrder?: ServiceFeeOrder
  closed?: boolean
  blocked?: boolean
}): ServiceReadinessStatus {
  if (closed) return "closed"
  if (blocked) return "blocked"
  if (!checks.every((item) => item.complete)) return "incomplete"
  if (!feeOrder) return "ready_for_checkout"
  if (feeOrder.status === "paid" || feeOrder.status === "waived") return "submitted"
  return "fee_due"
}

export function buildRecoveryReadinessSummary({
  recoveryCase,
  evidenceVault,
  serviceFeeOrders,
  documentLinks = [],
}: {
  recoveryCase: ManagedRecoveryCase
  evidenceVault: EvidenceVaultItem[]
  serviceFeeOrders: ServiceFeeOrder[]
  documentLinks?: CaseDocumentLink[]
}): ServiceReadinessSummary {
  const linkedEvidence = evidenceForIds(recoveryCase.evidenceVaultItemIds, evidenceVault)
  const linkedDocuments = documentLinks.filter((item) => item.entityId === recoveryCase.id)
  const feeOrder = matchingFeeOrder(recoveryCase.id, "managed_recovery", serviceFeeOrders)
  const hasDocuments = linkedEvidence.length > 0 || linkedDocuments.length > 0
  const checks = [
    check("identity", "Client identity and location", Boolean(recoveryCase.clientName && recoveryCase.city && recoveryCase.state), "Name, city, and state are needed before staff review."),
    check("amount", "Amount due", recoveryCase.amountDue > 0, "A positive invoice balance is required for managed recovery."),
    check("timeline", "Invoice age and timeline", recoveryCase.invoiceAgeDays >= 1 && recoveryCase.summary.length >= 30, "Include invoice age and a factual project/payment timeline."),
    check("documents", "Evidence on file", hasDocuments, "Attach invoices, contracts, screenshots, completion records, or related private evidence."),
    check("authorization", "Contractor certification", recoveryCase.contractorDirectPayment && recoveryCase.complianceFlags.length > 0, "Contractor must certify factual records and contractor-direct payment."),
    check("fee", "Service fee status", feeOrder?.status === "paid" || feeOrder?.status === "waived", "Payment is required before staff outreach begins."),
  ]
  const score = scoreChecks(checks)
  const status = readinessStatus({
    checks: checks.filter((item) => item.id !== "fee"),
    feeOrder,
    closed: ["resolved", "closed"].includes(recoveryCase.status),
    blocked: recoveryCase.status === "paused",
  })

  return {
    entityType: "managed_recovery",
    entityId: recoveryCase.id,
    status,
    score,
    readyForCheckout: checks.filter((item) => item.id !== "fee").every((item) => item.complete),
    feePaid: checks.find((item) => item.id === "fee")?.complete ?? false,
    feeOrderId: feeOrder?.id,
    nextAction:
      status === "ready_for_checkout"
        ? "Case is ready for service fee checkout."
        : status === "fee_due"
          ? "Complete service fee payment before Resolution Desk outreach."
          : status === "submitted"
            ? recoveryCase.nextAction
            : "Complete the missing precheck items before checkout.",
    checks,
    publicSafeSummary: "Private managed recovery case. Public profiles do not show raw documents, staff notes, or client contact details.",
  }
}

export function buildFloridaLienReadinessSummary({
  lienCase,
  evidenceVault,
  serviceFeeOrders,
  documentLinks = [],
}: {
  lienCase: FloridaLienCase
  evidenceVault: EvidenceVaultItem[]
  serviceFeeOrders: ServiceFeeOrder[]
  documentLinks?: CaseDocumentLink[]
}): ServiceReadinessSummary {
  const linkedDocuments = documentLinks.filter((item) => item.entityId === lienCase.id)
  const feeKind = lienCase.workflowType === "notice_packet" ? "florida_lien_notice" : "florida_lien_filing"
  const feeOrder = matchingFeeOrder(lienCase.id, feeKind, serviceFeeOrders)
  const likelyDocuments = evidenceVault.filter((item) => item.clientName.toLowerCase() === lienCase.clientName.toLowerCase())
  const hasDocuments = linkedDocuments.length > 0 || likelyDocuments.length > 0
  const checks = [
    check("identity", "Owner, client, and Florida property", Boolean(lienCase.clientName && lienCase.ownerName && lienCase.propertyCounty && lienCase.propertyCity && lienCase.state === "FL"), "Florida lien service requires property and owner details."),
    check("amount", "Contract and unpaid amount", lienCase.contractAmount > 0 && lienCase.amountDue > 0 && lienCase.amountDue <= lienCase.contractAmount, "Amount due must be positive and cannot exceed contract amount."),
    check("timeline", "Work dates and deadline context", Boolean(lienCase.lastWorkDate && lienCase.noticeHistory.length >= 20), "Work dates and notice/payment history are required for attorney/vendor review."),
    check("documents", "Private documents on file", hasDocuments, "Attach agreement, invoice, completion records, property details, and communication history."),
    check("authorization", "Contractor authorization", Boolean(lienCase.contractorSignedAt), "Contractor must certify accuracy before filing/vendor review."),
    check("fee", "Service fee status", feeOrder?.status === "paid" || feeOrder?.status === "waived", "Service and pass-through fees must be tracked before staff/vendor work."),
  ]
  const score = scoreChecks(checks)
  const status = readinessStatus({
    checks: checks.filter((item) => item.id !== "fee"),
    feeOrder,
    closed: ["released", "closed"].includes(lienCase.status),
    blocked: lienCase.status === "blocked",
  })

  return {
    entityType: "florida_lien",
    entityId: lienCase.id,
    status,
    score,
    readyForCheckout: checks.filter((item) => item.id !== "fee").every((item) => item.complete),
    feePaid: checks.find((item) => item.id === "fee")?.complete ?? false,
    feeOrderId: feeOrder?.id,
    nextAction:
      status === "ready_for_checkout"
        ? "Case is ready for Florida service fee checkout."
        : status === "fee_due"
          ? "Complete service fee payment before attorney/vendor review."
          : status === "submitted"
            ? lienCase.nextAction
            : "Complete the missing Florida lien precheck items before checkout.",
    checks,
    publicSafeSummary: "Private Florida lien service case. Public pages do not show filings, legal descriptions, documents, staff notes, or client contact details.",
  }
}

export function buildServiceReadinessSummaries({
  managedRecoveryCases,
  floridaLienCases,
  evidenceVault,
  serviceFeeOrders,
  documentLinks = [],
}: {
  managedRecoveryCases: ManagedRecoveryCase[]
  floridaLienCases: FloridaLienCase[]
  evidenceVault: EvidenceVaultItem[]
  serviceFeeOrders: ServiceFeeOrder[]
  documentLinks?: CaseDocumentLink[]
}) {
  return [
    ...managedRecoveryCases.map((recoveryCase) =>
      buildRecoveryReadinessSummary({
        recoveryCase,
        evidenceVault,
        serviceFeeOrders,
        documentLinks,
      }),
    ),
    ...floridaLienCases.map((lienCase) =>
      buildFloridaLienReadinessSummary({
        lienCase,
        evidenceVault,
        serviceFeeOrders,
        documentLinks,
      }),
    ),
  ]
}

