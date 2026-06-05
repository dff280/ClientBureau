import { createHash } from "node:crypto"

import type { ContractPacketInput, ContractSignatureInput } from "@/lib/schemas/client-bureau"
import type { ContractMilestone, ContractPacket, SignedContractSnapshot } from "@/lib/types"

export type ContractSignatureAuditInput = {
  ipAddress?: string
  userAgent?: string
  signedAt?: string
}

export function hashContractValue(value?: string) {
  const normalized = (value ?? "").trim().toLowerCase()

  if (!normalized) return undefined

  return `sha256:${createHash("sha256").update(normalized).digest("hex")}`
}

export function parseMilestoneSchedule(input: {
  milestoneSchedule?: string
  packetValue: number
  milestoneCount: number
}): ContractMilestone[] {
  const lines = (input.milestoneSchedule ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length > 0) {
    return lines.map((line, index) => {
      const [labelPart, amountPart, duePart] = line.split("|").map((part) => part?.trim())
      const amount = amountPart ? Number(amountPart.replace(/[$,]/g, "")) : 0

      return {
        id: `milestone_${index + 1}`,
        label: labelPart || `Milestone ${index + 1}`,
        amount: Number.isFinite(amount) && amount > 0 ? amount : 0,
        due: duePart || undefined,
      }
    })
  }

  if (input.milestoneCount <= 0) return []

  const amount = Math.round(input.packetValue / input.milestoneCount)

  return Array.from({ length: input.milestoneCount }, (_, index) => ({
    id: `milestone_${index + 1}`,
    label: `Milestone ${index + 1}`,
    amount: index === input.milestoneCount - 1
      ? input.packetValue - amount * (input.milestoneCount - 1)
      : amount,
  }))
}

export function normalizeMilestoneSchedule(value: unknown): ContractMilestone[] {
  if (!Array.isArray(value)) return []

  const milestones: ContractMilestone[] = []

  value.forEach((item, index) => {
      if (!item || typeof item !== "object") return undefined

      const record = item as Record<string, unknown>
      const amount = Number(record.amount ?? 0)

      milestones.push({
        id: String(record.id ?? `milestone_${index + 1}`),
        label: String(record.label ?? `Milestone ${index + 1}`),
        amount: Number.isFinite(amount) ? amount : 0,
        due: record.due ? String(record.due) : undefined,
      })
    })

  return milestones
}

export function normalizeSignedSnapshot(value: unknown): SignedContractSnapshot | undefined {
  if (!value || typeof value !== "object") return undefined

  const record = value as Partial<SignedContractSnapshot>

  if (!record.packetId || !record.signerName || !record.signedAt) return undefined

  return {
    packetId: String(record.packetId),
    clientName: String(record.clientName ?? ""),
    clientLegalName: record.clientLegalName,
    contractorLegalName: record.contractorLegalName,
    projectType: String(record.projectType ?? ""),
    templateType: record.templateType ?? "service_agreement",
    packetValue: Number(record.packetValue ?? 0),
    depositRequired: Number(record.depositRequired ?? 0),
    paymentMode: record.paymentMode ?? "none",
    paymentSummary: record.paymentSummary,
    scopeSummary: String(record.scopeSummary ?? ""),
    includedWork: String(record.includedWork ?? ""),
    excludedWork: String(record.excludedWork ?? ""),
    paymentTerms: String(record.paymentTerms ?? ""),
    milestoneSchedule: normalizeMilestoneSchedule(record.milestoneSchedule),
    changeOrderPolicy: String(record.changeOrderPolicy ?? ""),
    cancellationPolicy: String(record.cancellationPolicy ?? ""),
    projectStartDate: record.projectStartDate,
    projectEndDate: record.projectEndDate,
    signerName: String(record.signerName),
    signatureNameHash: record.signatureNameHash,
    signerEmailHash: record.signerEmailHash,
    signerIpHash: record.signerIpHash,
    signerUserAgentHash: record.signerUserAgentHash,
    signedAt: String(record.signedAt),
    attestations: Array.isArray(record.attestations) ? record.attestations.map(String) : [],
  }
}

export function agreementDefaults(input: ContractPacketInput) {
  const scopeSummary = input.scopeSummary || `${input.projectType} agreement packet prepared for ${input.clientName}.`
  const includedWork = input.includedWork || "Contractor will perform the work described in the approved scope and agreement packet."
  const excludedWork = input.excludedWork || "Work not described in the approved agreement packet requires a written change order."
  const paymentTerms =
    input.paymentTerms ||
    `Agreement value is $${input.packetValue.toLocaleString()} with a $${input.depositRequired.toLocaleString()} deposit and documented milestone/payment timing.`
  const changeOrderPolicy =
    input.changeOrderPolicy ||
    "Scope changes, material changes, added work, or schedule changes should be approved in writing before the added work begins."
  const cancellationPolicy =
    input.cancellationPolicy ||
    "Cancellation, pause, or rescheduling terms should be handled in writing and tied to documented work, materials, deposits, and completed milestones."

  return {
    scopeSummary,
    includedWork,
    excludedWork,
    paymentTerms,
    milestoneSchedule: parseMilestoneSchedule(input),
    changeOrderPolicy,
    cancellationPolicy,
  }
}

export function buildSignedContractSnapshot(
  packet: ContractPacket,
  input: ContractSignatureInput,
  audit: ContractSignatureAuditInput = {},
) {
  const signedAt = audit.signedAt ?? new Date().toISOString()
  const signedSnapshot: SignedContractSnapshot = {
    packetId: packet.id,
    clientName: packet.clientName,
    clientLegalName: packet.clientLegalName,
    contractorLegalName: packet.contractorLegalName,
    projectType: packet.projectType,
    templateType: packet.templateType,
    packetValue: packet.packetValue,
    depositRequired: packet.depositRequired,
    paymentMode: packet.paymentMode ?? "none",
    paymentSummary: packet.paymentSummary,
    scopeSummary: packet.scopeSummary,
    includedWork: packet.includedWork,
    excludedWork: packet.excludedWork,
    paymentTerms: packet.paymentTerms,
    milestoneSchedule: packet.milestoneSchedule,
    changeOrderPolicy: packet.changeOrderPolicy,
    cancellationPolicy: packet.cancellationPolicy,
    projectStartDate: packet.projectStartDate,
    projectEndDate: packet.projectEndDate,
    signerName: input.signerName,
    signatureNameHash: hashContractValue(input.signatureName),
    signerEmailHash: hashContractValue(input.signerEmail),
    signerIpHash: hashContractValue(audit.ipAddress),
    signerUserAgentHash: hashContractValue(audit.userAgent),
    signedAt,
    attestations: [
      "scope_review",
      "payment_terms_review",
      "electronic_signature_consent",
      "authority_certification",
      "records_certification",
    ],
  }
  const signedDigest = `sha256:${createHash("sha256").update(JSON.stringify(signedSnapshot)).digest("hex")}`

  return {
    signerName: input.signerName,
    signatureNameHash: signedSnapshot.signatureNameHash,
    signerEmailHash: signedSnapshot.signerEmailHash,
    signerIpHash: signedSnapshot.signerIpHash,
    signerUserAgentHash: signedSnapshot.signerUserAgentHash,
    signedSnapshot,
    signedDigest,
    signedRecordAt: signedAt,
  }
}
