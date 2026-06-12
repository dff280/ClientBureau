import type { ContractTemplateType } from "@/lib/types"

export type ContractPacketTemplateFields = {
  templateType: ContractTemplateType
  projectType: string
  packetValue?: number
  depositRequired?: number
  milestoneCount: number
  requiredBeforeScheduling: boolean
  scopeSummary: string
  includedWork: string
  excludedWork: string
  paymentTerms: string
  milestoneSchedule: string
  changeOrderPolicy: string
  cancellationPolicy: string
  nextAction: string
}

export type ContractPacketTemplate = {
  id: string
  title: string
  shortLabel: string
  description: string
  jurisdiction: string
  useWhen: string[]
  reviewNotes: string[]
  fields: ContractPacketTemplateFields
}

export const floridaResidentialServiceAgreementTemplate: ContractPacketTemplate = {
  id: "florida_residential_service_agreement_starter",
  title: "Florida Residential Service Agreement Starter",
  shortLabel: "Florida service starter",
  jurisdiction: "Florida",
  description:
    "A cautious starter packet for Florida contractors and service businesses to document scope, payment timing, change orders, cancellation review, lien-notice review, and signature readiness before work is scheduled.",
  useWhen: [
    "Residential repair, installation, remodel, or trade-service work in Florida.",
    "Jobs where a written scope, exclusions, deposit, milestones, and client signature should be confirmed before scheduling.",
    "Projects that may later need change orders, private evidence, payment recovery records, or Florida lien service review.",
  ],
  reviewNotes: [
    "Attorney review is recommended before using this as a final contract.",
    "Florida construction lien, notice, cancellation, licensing, permit, roofing, and local-code requirements can vary by work type and transaction.",
    "This template is a business documentation workflow, not legal advice or a guarantee of payment, lien rights, priority, or enforceability.",
  ],
  fields: {
    templateType: "service_agreement",
    projectType: "Florida residential service / improvement project",
    milestoneCount: 3,
    requiredBeforeScheduling: true,
    scopeSummary:
      "Florida service agreement starter for the project described by the contractor and client. Before scheduling, confirm the service location, licensed scope, permit responsibility, access requirements, target dates, included work, excluded work, payment timing, and documentation plan.",
    includedWork:
      "Contractor will perform only the labor, materials, services, cleanup, and deliverables listed in the final approved scope.\n\nInclude: project location, work areas, material selections, labor tasks, access requirements, jobsite protection, cleanup expectations, permit responsibility, inspection coordination, and documentation to be uploaded to the private project record.",
    excludedWork:
      "Excluded unless added by written change order: hidden conditions, code upgrades, unrelated repairs, additional materials, client-requested upgrades, after-hours work, extra trips caused by access issues, work outside the stated project area, and any task not listed in the approved scope.",
    paymentTerms:
      "Payment terms should list the agreement value, deposit, progress payments, final payment trigger, due dates, accepted payment methods, and any payment-plan terms. Deposits and milestones should be tied to scheduling, materials, work stages, delivery, inspection, or completion events.\n\nIf Florida lien notice, notice of commencement, or other statutory payment documentation may apply, review those requirements before work begins.",
    milestoneSchedule:
      "Deposit / scheduling authorization | 0 | Before scheduling or ordering materials\nProgress payment / documented work stage | 0 | At agreed project milestone\nFinal payment / completion documentation | 0 | Upon completion or agreed final trigger",
    changeOrderPolicy:
      "Any added work, material substitution, hidden condition, schedule change, or client-requested change should be approved in writing before the added work begins. The change order should state the changed scope, added cost or credit, schedule impact, payment timing, and signatures or written approval.",
    cancellationPolicy:
      "Cancellation, pause, or rescheduling should be handled in writing and should address ordered materials, completed labor, access delays, deposits, refunds if applicable, and documented costs. If the transaction is a Florida home solicitation sale or another covered transaction, cancellation-right language and timing may be required and should be reviewed before use.",
    nextAction:
      "Replace all placeholder amounts, confirm Florida-specific requirements, attach project documents, and send the link only after attorney or qualified business review as needed.",
  },
}

export const contractPacketTemplates = [floridaResidentialServiceAgreementTemplate]
