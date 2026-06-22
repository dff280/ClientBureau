import type { ContractPacket, ContractTemplateType } from "@/lib/types"

export type FloridaContractLawSourceId =
  | "fl_713_015_lien_notice"
  | "fl_489_126_deposit_permit_timing"
  | "fl_489_1425_recovery_fund"
  | "fl_558_005_construction_defect"
  | "fl_501_031_home_solicitation"

export type FloridaContractLawSource = {
  id: FloridaContractLawSourceId
  statute: string
  title: string
  officialUrl: string
  lastReviewed: string
  applicabilitySummary: string
  attorneyReviewWarning: string
  requiredNoticeText?: string
}

export type FloridaContractApplicabilityInput = {
  state?: string
  isFloridaJob?: boolean
  isResidentialRealProperty?: boolean
  isOneToFourFamilyDwelling?: boolean
  contractValue?: number
  depositRequired?: number
  permitRequired?: boolean
  homeSolicitationSale?: boolean
  includeConstructionDefectNotice?: boolean
}

export type FloridaContractNoticeChecklistItem = {
  sourceId: FloridaContractLawSourceId
  label: string
  status: "included" | "review" | "not_triggered"
  severity: "required" | "warning" | "review"
  summary: string
  requiredNoticeText?: string
  officialUrl: string
}

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
  templateType: ContractTemplateType
  useWhen: string[]
  reviewNotes: string[]
  legalSourceIds: FloridaContractLawSourceId[]
  requiredNotices: FloridaContractLawSourceId[]
  reviewWarnings: string[]
  defaultClauses: string[]
  fields: ContractPacketTemplateFields
}

export type ContractPackTemplateSummary = {
  id: string
  title: string
  templateType: ContractTemplateType
  description: string
  useWhen: string
  nextAction: string
}

const reviewDate = "2026-06-21"

export const floridaContractLawSources: Record<FloridaContractLawSourceId, FloridaContractLawSource> = {
  fl_713_015_lien_notice: {
    id: "fl_713_015_lien_notice",
    statute: "Fla. Stat. 713.015",
    title: "Mandatory construction lien notice for certain direct residential contracts",
    officialUrl:
      "https://www.leg.state.fl.us/Statutes/index.cfm?App_mode=Display_Statute&URL=0700-0799/0713/Sections/0713.015.html",
    lastReviewed: reviewDate,
    applicabilitySummary:
      "Direct contracts over $2,500 between an owner and contractor for improvements to single or multiple family dwellings up to four units need review for this notice.",
    attorneyReviewWarning:
      "Confirm the owner/contractor relationship, dwelling type, value threshold, 12-point bold capitalized formatting, owner signature, and date requirements.",
    requiredNoticeText:
      "ACCORDING TO FLORIDA'S CONSTRUCTION LIEN LAW (SECTIONS 713.001-713.37, FLORIDA STATUTES), THOSE WHO WORK ON YOUR PROPERTY OR PROVIDE MATERIALS AND SERVICES AND ARE NOT PAID IN FULL HAVE A RIGHT TO ENFORCE THEIR CLAIM FOR PAYMENT AGAINST YOUR PROPERTY. THIS CLAIM IS KNOWN AS A CONSTRUCTION LIEN.\n\nIF YOUR CONTRACTOR OR A SUBCONTRACTOR FAILS TO PAY SUBCONTRACTORS, SUB-SUBCONTRACTORS, OR MATERIAL SUPPLIERS, THOSE PEOPLE WHO ARE OWED MONEY MAY LOOK TO YOUR PROPERTY FOR PAYMENT, EVEN IF YOU HAVE ALREADY PAID YOUR CONTRACTOR IN FULL. IF YOU FAIL TO PAY YOUR CONTRACTOR, YOUR CONTRACTOR MAY ALSO HAVE A LIEN ON YOUR PROPERTY.\n\nTHIS MEANS IF A LIEN IS FILED YOUR PROPERTY COULD BE SOLD AGAINST YOUR WILL TO PAY FOR LABOR, MATERIALS, OR OTHER SERVICES THAT YOUR CONTRACTOR OR A SUBCONTRACTOR MAY HAVE FAILED TO PAY.\n\nTO PROTECT YOURSELF, YOU SHOULD STIPULATE IN THIS CONTRACT THAT BEFORE ANY PAYMENT IS MADE, YOUR CONTRACTOR IS REQUIRED TO PROVIDE YOU WITH A WRITTEN RELEASE OF LIEN FROM ANY PERSON OR COMPANY THAT HAS PROVIDED TO YOU A \"NOTICE TO OWNER.\" FLORIDA'S CONSTRUCTION LIEN LAW IS COMPLEX, AND IT IS RECOMMENDED THAT YOU CONSULT AN ATTORNEY.",
  },
  fl_489_126_deposit_permit_timing: {
    id: "fl_489_126_deposit_permit_timing",
    statute: "Fla. Stat. 489.126",
    title: "Residential deposits, permits, and start-work timing",
    officialUrl:
      "https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0400-0499/0489/Sections/0489.126.html",
    lastReviewed: reviewDate,
    applicabilitySummary:
      "Residential contractors receiving more than 10% upfront should review permit application and work-start timing obligations.",
    attorneyReviewWarning:
      "Confirm whether permits are required, who applies, and whether deposit timing language matches the job facts.",
  },
  fl_489_1425_recovery_fund: {
    id: "fl_489_1425_recovery_fund",
    statute: "Fla. Stat. 489.1425",
    title: "Construction Industries Recovery Fund notice",
    officialUrl:
      "https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0400-0499/0489/Sections/0489.1425.html",
    lastReviewed: reviewDate,
    applicabilitySummary:
      "Certain residential construction, repair, restoration, or improvement contracts over $2,500 need review for the recovery fund statement.",
    attorneyReviewWarning:
      "Confirm board address/phone requirements and whether the contract is exempt because all labor and materials do not exceed $2,500.",
    requiredNoticeText:
      "FLORIDA HOMEOWNERS' CONSTRUCTION RECOVERY FUND\n\nPAYMENT, UP TO A LIMITED AMOUNT, MAY BE AVAILABLE FROM THE FLORIDA HOMEOWNERS' CONSTRUCTION RECOVERY FUND IF YOU LOSE MONEY ON A PROJECT PERFORMED UNDER CONTRACT, WHERE THE LOSS RESULTS FROM SPECIFIED VIOLATIONS OF FLORIDA LAW BY A LICENSED CONTRACTOR. FOR INFORMATION ABOUT THE RECOVERY FUND AND FILING A CLAIM, CONTACT THE FLORIDA CONSTRUCTION INDUSTRY LICENSING BOARD AT THE FOLLOWING TELEPHONE NUMBER AND ADDRESS:",
  },
  fl_558_005_construction_defect: {
    id: "fl_558_005_construction_defect",
    statute: "Fla. Stat. 558.005",
    title: "Chapter 558 construction defect notice",
    officialUrl:
      "https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599/0558/Sections/0558.005.html",
    lastReviewed: reviewDate,
    applicabilitySummary:
      "Construction contracts should be reviewed for the statutory Chapter 558 notice unless the parties validly opt out where allowed.",
    attorneyReviewWarning:
      "Confirm whether Chapter 558 applies to the project type and whether any opt-out language is valid.",
    requiredNoticeText:
      "CHAPTER 558 NOTICE OF CLAIM: Chapter 558, Florida Statutes, contains important requirements you must follow before you may bring any legal action for an alleged construction defect.",
  },
  fl_501_031_home_solicitation: {
    id: "fl_501_031_home_solicitation",
    statute: "Fla. Stat. 501.031",
    title: "Home solicitation sale cancellation notice",
    officialUrl:
      "https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599/0501/Sections/0501.031.html",
    lastReviewed: reviewDate,
    applicabilitySummary:
      "In-home or covered home-solicitation transactions need review for written agreement and cancellation-notice requirements.",
    attorneyReviewWarning:
      "Confirm whether the sale is a covered home solicitation sale and whether the correct cancellation form/timing applies.",
    requiredNoticeText:
      "Buyer may have a right to cancel a covered home solicitation sale by written notice through midnight of the third business day after signing.",
  },
}

const defaultFloridaApplicability: Required<FloridaContractApplicabilityInput> = {
  state: "FL",
  isFloridaJob: true,
  isResidentialRealProperty: true,
  isOneToFourFamilyDwelling: true,
  contractValue: 12000,
  depositRequired: 2500,
  permitRequired: true,
  homeSolicitationSale: false,
  includeConstructionDefectNotice: true,
}

function numeric(value: number | undefined, fallback = 0) {
  return Number.isFinite(value) ? Number(value) : fallback
}

export function normalizedFloridaContractApplicability(
  input: FloridaContractApplicabilityInput = {},
): Required<FloridaContractApplicabilityInput> {
  const state = (input.state ?? defaultFloridaApplicability.state).trim().toUpperCase()
  const contractValue = numeric(input.contractValue, defaultFloridaApplicability.contractValue)
  const depositRequired = numeric(input.depositRequired, defaultFloridaApplicability.depositRequired)

  return {
    ...defaultFloridaApplicability,
    ...input,
    state,
    isFloridaJob: input.isFloridaJob ?? state === "FL",
    contractValue,
    depositRequired,
  }
}

export function floridaContractNoticeChecklist(
  input: FloridaContractApplicabilityInput = {},
): FloridaContractNoticeChecklistItem[] {
  const value = normalizedFloridaContractApplicability(input)
  const isFlorida = value.isFloridaJob && value.state === "FL"
  const residentialOverThreshold = isFlorida && value.isResidentialRealProperty && value.contractValue > 2500
  const directResidentialLienNotice =
    residentialOverThreshold && value.isOneToFourFamilyDwelling
  const depositPercent = value.contractValue > 0 ? (value.depositRequired / value.contractValue) * 100 : 0
  const highDeposit = residentialOverThreshold && depositPercent > 10

  const item = (
    sourceId: FloridaContractLawSourceId,
    status: FloridaContractNoticeChecklistItem["status"],
    severity: FloridaContractNoticeChecklistItem["severity"],
    summary: string,
  ): FloridaContractNoticeChecklistItem => {
    const source = floridaContractLawSources[sourceId]

    return {
      sourceId,
      label: `${source.statute}: ${source.title}`,
      status,
      severity,
      summary,
      requiredNoticeText: status === "included" || status === "review" ? source.requiredNoticeText : undefined,
      officialUrl: source.officialUrl,
    }
  }

  return [
    item(
      "fl_713_015_lien_notice",
      directResidentialLienNotice ? "included" : "not_triggered",
      "required",
      directResidentialLienNotice
        ? "Likely triggered: Florida direct residential contract over $2,500 for a one-to-four-unit dwelling. Include the statutory lien-law notice after legal review."
        : "Not triggered by the current checklist answers. Recheck if the job is a direct Florida residential contract over $2,500.",
    ),
    item(
      "fl_489_1425_recovery_fund",
      residentialOverThreshold ? "review" : "not_triggered",
      "required",
      residentialOverThreshold
        ? "Review required recovery-fund statement and current board contact information before sending."
        : "Not triggered by current value/property answers. Recheck for covered Florida residential contracts over $2,500.",
    ),
    item(
      "fl_489_126_deposit_permit_timing",
      highDeposit ? "review" : "not_triggered",
      "warning",
      highDeposit
        ? "Deposit is more than 10% of contract value. Confirm permit application and start-work timing obligations."
        : "Deposit is not above 10% based on the current values.",
    ),
    item(
      "fl_558_005_construction_defect",
      isFlorida && value.includeConstructionDefectNotice ? "included" : "not_triggered",
      "review",
      isFlorida && value.includeConstructionDefectNotice
        ? "Include or review the Chapter 558 construction defect notice unless counsel confirms it does not apply."
        : "Not included based on current answers.",
    ),
    item(
      "fl_501_031_home_solicitation",
      isFlorida && value.homeSolicitationSale ? "review" : "not_triggered",
      "required",
      isFlorida && value.homeSolicitationSale
        ? "Covered home-solicitation context selected. Review three-business-day cancellation notice and form requirements."
        : "Not triggered unless this is a covered home-solicitation sale.",
    ),
  ]
}

function triggeredFloridaNoticeSummary(input: FloridaContractApplicabilityInput) {
  return floridaContractNoticeChecklist(input)
    .filter((item) => item.status !== "not_triggered")
    .map((item) => `${item.label} (${item.status === "included" ? "include" : "review"})`)
}

export function buildFloridaContractPacketDefaults(
  input: FloridaContractApplicabilityInput = {},
): ContractPacketTemplateFields {
  const value = normalizedFloridaContractApplicability(input)
  const notices = triggeredFloridaNoticeSummary(value)
  const legalReviewLine = notices.length > 0
    ? `Florida legal review checklist triggered: ${notices.join("; ")}.`
    : "Florida legal review checklist: no state-specific notices were triggered by the current answers, but contractor review is still recommended."

  return {
    templateType: "service_agreement",
    projectType: "Florida residential service / improvement project",
    packetValue: value.contractValue,
    depositRequired: value.depositRequired,
    milestoneCount: 3,
    requiredBeforeScheduling: true,
    scopeSummary:
      "Florida residential contractor agreement packet prepared for client review before scheduling. Confirm property location, licensed scope, permits, access, target dates, included work, excluded work, payment timing, and private documentation plan.",
    includedWork:
      "Contractor will perform only the labor, materials, cleanup, and deliverables listed in the final approved scope. Include project location, work areas, material selections, labor tasks, jobsite protection, permit responsibility, inspection coordination, and records to be kept in the private project file.",
    excludedWork:
      "Excluded unless added by written change order: hidden conditions, code upgrades, unrelated repairs, added materials, client-requested upgrades, after-hours work, extra trips caused by access issues, work outside the stated project area, and any task not listed in the approved scope.",
    paymentTerms:
      `Agreement value is $${value.contractValue.toLocaleString()} with a $${value.depositRequired.toLocaleString()} deposit. Payment terms should list due dates, accepted payment methods, progress milestones, final payment trigger, and documentation required before collection. ${legalReviewLine}`,
    milestoneSchedule:
      `Deposit / scheduling authorization | ${value.depositRequired} | Before scheduling or ordering materials\nProgress payment / documented work stage | 0 | At agreed project milestone\nFinal payment / completion documentation | 0 | Upon completion or agreed final trigger`,
    changeOrderPolicy:
      "Any added work, material substitution, hidden condition, schedule change, or client-requested change should be approved in writing before added work begins. The change order should state the changed scope, added cost or credit, schedule impact, payment timing, and signatures or written approval.",
    cancellationPolicy:
      "Cancellation, pause, or rescheduling should be handled in writing and should address ordered materials, completed labor, access delays, deposits, refunds if applicable, and documented costs. If this is a covered Florida home solicitation sale or another covered transaction, review the required cancellation notice before use.",
    nextAction:
      "Review Florida legal checklist, replace placeholders, attach required notices, then send the private signing link.",
  }
}

export function contractTemplateLegalWarnings(
  templateOrPacket: ContractPacketTemplate | Pick<ContractPacket, "projectType" | "packetValue" | "depositRequired">,
  input: FloridaContractApplicabilityInput = {},
) {
  const projectType = "projectType" in templateOrPacket ? templateOrPacket.projectType : ""
  const packetValue = "packetValue" in templateOrPacket ? templateOrPacket.packetValue : undefined
  const depositRequired = "depositRequired" in templateOrPacket ? templateOrPacket.depositRequired : undefined
  const isFloridaProject = /florida|\bfl\b/i.test(projectType) || input.isFloridaJob === true || input.state === "FL"

  if (!isFloridaProject) return []

  return floridaContractNoticeChecklist({
    ...input,
    state: "FL",
    isFloridaJob: true,
    contractValue: packetValue ?? input.contractValue,
    depositRequired: depositRequired ?? input.depositRequired,
  }).filter((item) => item.status !== "not_triggered")
}

export const floridaResidentialServiceAgreementTemplate: ContractPacketTemplate = {
  id: "florida_residential_service_agreement_starter",
  title: "Florida Residential Contractor Agreement",
  shortLabel: "Florida agreement",
  jurisdiction: "Florida",
  templateType: "service_agreement",
  description:
    "A cautious Florida agreement packet for contractors to document scope, payment timing, change orders, cancellation review, statutory notice prompts, and signature readiness before work is scheduled.",
  useWhen: [
    "Residential repair, installation, remodel, or trade-service work in Florida.",
    "Jobs where a written scope, exclusions, deposit, milestones, and client signature should be confirmed before scheduling.",
    "Projects that may later need change orders, private evidence, payment recovery records, or Florida lien service review.",
  ],
  reviewNotes: [
    "Attorney review is recommended before relying on this as a final contract.",
    "Florida lien, recovery-fund, cancellation, licensing, permit, roofing, and local-code requirements can vary by work type and transaction.",
    "This template is a business documentation workflow, not legal advice or a guarantee of payment, lien rights, priority, or enforceability.",
  ],
  legalSourceIds: [
    "fl_713_015_lien_notice",
    "fl_489_126_deposit_permit_timing",
    "fl_489_1425_recovery_fund",
    "fl_558_005_construction_defect",
    "fl_501_031_home_solicitation",
  ],
  requiredNotices: ["fl_713_015_lien_notice", "fl_489_1425_recovery_fund"],
  reviewWarnings: [
    "Confirm whether the job is a direct contract with an owner for a Florida residential property.",
    "Confirm whether permits are required before accepting or spending a deposit.",
    "Confirm whether home-solicitation cancellation language applies.",
  ],
  defaultClauses: [
    "Scope, included work, excluded work, payment terms, milestones, change orders, cancellation, permits, inspections, owner access, and private recordkeeping.",
    "Florida legal review checklist generated from contract value, property type, deposit amount, permit status, home-solicitation context, and Chapter 558 review.",
  ],
  fields: buildFloridaContractPacketDefaults(defaultFloridaApplicability),
}

export const floridaContractPackTemplates: ContractPackTemplateSummary[] = [
  {
    id: "florida_residential_service_agreement",
    title: "Florida Residential Contractor Agreement",
    templateType: "service_agreement",
    description: "Primary agreement packet for scope, payment terms, statutory notice review, and signing.",
    useWhen: "Use before scheduling residential Florida work.",
    nextAction: "Create the agreement packet, then attach the signed snapshot to the job file.",
  },
  {
    id: "florida_change_order",
    title: "Florida Change Order",
    templateType: "change_order",
    description: "Documents changed scope, added cost or credit, schedule impact, and written approval.",
    useWhen: "Use before doing added work or substituting materials.",
    nextAction: "Reference the original packet and send for private approval.",
  },
  {
    id: "florida_completion_certificate",
    title: "Completion Certificate / Punch List",
    templateType: "completion_certificate",
    description: "Captures completion status, remaining punch items, photos, and final-payment trigger.",
    useWhen: "Use near completion or before final invoice follow-up.",
    nextAction: "Attach completion evidence and final payment timing.",
  },
  {
    id: "florida_payment_plan",
    title: "Payment Plan / Settlement Starter",
    templateType: "payment_plan",
    description: "Documents installment timing, payment promises, and private recovery context.",
    useWhen: "Use when a client needs structured repayment or resolution terms.",
    nextAction: "Connect the payment plan to Payment Recovery if payment remains unresolved.",
  },
  {
    id: "florida_notice_of_nonpayment",
    title: "Notice of Nonpayment / Payment Reminder",
    templateType: "notice_of_nonpayment",
    description: "Provides a careful business reminder with invoice context and no inflammatory claims.",
    useWhen: "Use before escalating to recovery or lien-readiness review.",
    nextAction: "Open a Florida lien service review if deadlines or notices may matter.",
  },
  {
    id: "florida_subcontractor_work_order",
    title: "Subcontractor Work Order / Trade Scope",
    templateType: "service_agreement",
    description: "Defines trade scope, GC/sub relationship, documentation, insurance/license prompts, and payment-chain context.",
    useWhen: "Use when hiring a trade partner or crew under a larger job file.",
    nextAction: "Attach the work order to the Job file and Evidence Vault.",
  },
]

export const contractPacketTemplates = [floridaResidentialServiceAgreementTemplate]
