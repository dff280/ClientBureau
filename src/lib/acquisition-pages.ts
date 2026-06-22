export type AcquisitionPageKind = "service" | "tool" | "guide"

export type AcquisitionPage = {
  slug: string
  path: string
  kind: AcquisitionPageKind
  visualAssetKey?: "searchDossier" | "floridaAgreementPacket" | "resolutionDesk" | "evidenceVault" | "mobileFieldApp"
  eyebrow: string
  title: string
  h1: string
  description: string
  heroCopy: string
  primaryCta: {
    label: string
    href: string
  }
  secondaryCta: {
    label: string
    href: string
  }
  proofLabel: string
  proofValue: string
  proofDetail: string
  useCases: string[]
  workflow: string[]
  trustPoints: string[]
  relatedLinks: {
    label: string
    href: string
    description: string
  }[]
  faqs: {
    question: string
    answer: string
  }[]
}

export const acquisitionPages: AcquisitionPage[] = [
  {
    slug: "contractor-contract-template",
    path: "/contractor-contract-template",
    kind: "tool",
    visualAssetKey: "floridaAgreementPacket",
    eyebrow: "Agreement packets",
    title: "Contractor Contract Template and E-Signature Workflow",
    h1: "Contractor Contract Template and E-Signature Workflow",
    description:
      "Create contractor agreement packets with scope, payment terms, change-order policy, client signatures, and private audit history.",
    heroCopy:
      "Build a clear agreement before work starts. Client Bureau helps contractors and service businesses document scope, payment terms, exclusions, project dates, change-order rules, and client approval in one private signing packet.",
    primaryCta: {
      label: "Create an agreement packet",
      href: "/dashboard/contracts",
    },
    secondaryCta: {
      label: "See pricing",
      href: "/pricing",
    },
    proofLabel: "Best used before",
    proofValue: "Labor, materials, or deposits",
    proofDetail:
      "A signed packet helps reduce confusion about what is included, what costs extra, and when payment is due.",
    useCases: [
      "Residential remodel, repair, installation, or service jobs with defined scope.",
      "Projects where deposits, milestones, or final payment terms should be clear before scheduling.",
      "Jobs that may need change orders, completion certificates, or payment-plan documentation later.",
    ],
    workflow: [
      "Add contractor and client legal names, project address context, and scope summary.",
      "Define included work, excluded work, payment terms, milestone dates, and cancellation rules.",
      "Generate a private signing link and invite the client to review the packet.",
      "Store signature status, timestamp, signed snapshot, and tamper-evidence digest privately.",
    ],
    trustPoints: [
      "Contract packets are private and are not shown on public client profiles.",
      "Client Bureau does not provide legal advice or guarantee enforceability.",
      "The workflow is designed for clear records, not automatic payment enforcement.",
    ],
    relatedLinks: [
      {
        label: "Florida agreement starter",
        href: "/florida-contractor-agreement-template",
        description: "Start from a Florida-aware agreement packet structure before attorney review.",
      },
      {
        label: "Change order template",
        href: "/change-order-template",
        description: "Document scope changes before extra work begins.",
      },
      {
        label: "Payment recovery service",
        href: "/payment-recovery-service",
        description: "Organize overdue invoice follow-up if payment becomes an issue.",
      },
      {
        label: "Check a client",
        href: "/search",
        description: "Check client context before sending an agreement.",
      },
    ],
    faqs: [
      {
        question: "Is this a legal contract service?",
        answer:
          "Client Bureau provides a business workflow for agreement packets, signatures, payment terms, and private records. It does not replace attorney review or provide legal advice.",
      },
      {
        question: "Can the client sign online?",
        answer:
          "Yes. Contractors can generate a private signing link, and the client can review the agreement packet and complete the electronic signature workflow.",
      },
      {
        question: "Will contract details appear publicly?",
        answer:
          "No. Contract content, signatures, client contact details, and private project records are not displayed on public Client Bureau profiles.",
      },
    ],
  },
  {
    slug: "florida-contractor-agreement-template",
    path: "/florida-contractor-agreement-template",
    kind: "tool",
    visualAssetKey: "floridaAgreementPacket",
    eyebrow: "Florida agreement starter",
    title: "Florida Contractor Agreement Starter Template",
    h1: "Florida Contractor Agreement Starter Template",
    description:
      "Create a Florida contractor agreement packet with scope, payment terms, statutory review prompts, change orders, and private e-signature records.",
    heroCopy:
      "Florida jobs deserve clearer records before labor, materials, scheduling, or deposits are committed. Client Bureau gives contractors a private Florida Contract Pack for scope, exclusions, payment timing, change-order approvals, cancellation review, lien-law prompts, recovery-fund prompts, Chapter 558 review, and client signature readiness.",
    primaryCta: {
      label: "Use the Florida starter",
      href: "/dashboard/contracts",
    },
    secondaryCta: {
      label: "Read contract workflow",
      href: "/contractor-contract-template",
    },
    proofLabel: "First template",
    proofValue: "Florida source-aware review structure",
    proofDetail:
      "The starter organizes common Florida statutory review prompts and keeps the final contract packet private until the contractor sends a signing link.",
    useCases: [
      "Florida residential repair, remodel, installation, and trade-service work that needs a written scope and legal review before scheduling.",
      "Projects where deposits, progress payments, final payment triggers, and change orders should be visible to the client before work begins.",
      "Jobs where lien notice, recovery fund, deposit timing, construction defect notice, cancellation, permit, licensing, or local-code review may matter.",
    ],
    workflow: [
      "Open Contracts in the dashboard and choose the Florida Contract Pack inside the agreement packet form.",
      "Answer the Florida applicability questions for property type, contract value, deposit, permit review, home-solicitation context, and Chapter 558 notice review.",
      "Replace starter language with project-specific scope, exclusions, payment terms, dates, and contractor/client legal names.",
      "Review triggered Florida notices with qualified counsel or a qualified business advisor before sending.",
      "Generate a private signing link only after the packet is complete and ready for client review.",
    ],
    trustPoints: [
      "The template stays private in the contractor workspace and does not publish contract content to public profiles.",
      "Client Bureau does not provide legal advice, guarantee enforceability, or guarantee lien rights, priority, payment, or collection.",
      "The pack references official Florida sources for lien notice, recovery fund, deposit timing, Chapter 558, and cancellation review prompts.",
    ],
    relatedLinks: [
      {
        label: "Contractor contract template",
        href: "/contractor-contract-template",
        description: "See the broader agreement packet and e-signature workflow.",
      },
      {
        label: "Change order template",
        href: "/change-order-template",
        description: "Document changed scope, added cost, and schedule impact.",
      },
      {
        label: "Business rating methodology",
        href: "/business-rating-methodology",
        description: "See how Client Bureau keeps public trust signals separate from private contract records.",
      },
      {
        label: "Florida lien filing service",
        href: "/florida-lien-filing-service",
        description: "Review Florida lien filing workflow gates and private records.",
      },
    ],
    faqs: [
      {
        question: "Is this a Florida legal contract?",
        answer:
          "No. It is a private business workflow starter for organizing agreement fields, Florida review prompts, signatures, and audit records. Contractors should get attorney review before relying on it as a legal contract.",
      },
      {
        question: "Which Florida issues does the pack help contractors review?",
        answer:
          "The pack prompts review for Florida lien notice, recovery fund language, deposit and permit timing, Chapter 558 construction defect notice, home-solicitation cancellation, licensing, permits, and local-practice issues.",
      },
      {
        question: "Can clients sign the packet online?",
        answer:
          "Yes. After the contractor edits and reviews the packet, Client Bureau can generate a private client signing link with signature status, signed snapshot, and private audit history.",
      },
    ],
  },
  {
    slug: "change-order-template",
    path: "/change-order-template",
    kind: "tool",
    visualAssetKey: "floridaAgreementPacket",
    eyebrow: "Scope protection",
    title: "Contractor Change Order Template",
    h1: "Contractor Change Order Template",
    description:
      "Create change orders for contractors with scope changes, added cost, schedule impact, client approval, and private project records.",
    heroCopy:
      "Scope changes are where many jobs become payment disputes. Client Bureau helps you document what changed, why it changed, how much it costs, how the schedule moves, and who approved it before the extra work continues.",
    primaryCta: {
      label: "Create a change order",
      href: "/dashboard/contracts",
    },
    secondaryCta: {
      label: "Create contract packet first",
      href: "/contractor-contract-template",
    },
    proofLabel: "Common trigger",
    proofValue: "Extra work requests",
    proofDetail:
      "Use a change order when the client asks for additional work, materials change, conditions differ, or schedule impact needs approval.",
    useCases: [
      "The client asks for additional work after the original agreement is signed.",
      "Hidden job conditions require different labor, materials, price, or timeline.",
      "A verbal approval needs to become a signed private record before invoicing.",
    ],
    workflow: [
      "Reference the original agreement packet or project file.",
      "Describe the changed scope, reason for change, added cost, and schedule impact.",
      "Send the change order for client review and signature.",
      "Attach the signed record to the project file, invoice timeline, and evidence vault.",
    ],
    trustPoints: [
      "Change orders stay private unless later summarized in an approved public report.",
      "Signed records help explain invoices without using inflammatory language.",
      "Client Bureau does not guarantee payment or legal enforceability.",
    ],
    relatedLinks: [
      {
        label: "Contractor contract template",
        href: "/contractor-contract-template",
        description: "Create the original agreement packet before work starts.",
      },
      {
        label: "Evidence vault",
        href: "/dashboard/evidence",
        description: "Store signed approvals and project documents privately.",
      },
      {
        label: "Report a client experience",
        href: "/submit-report",
        description: "Submit a documented experience for moderation if an issue develops.",
      },
    ],
    faqs: [
      {
        question: "When should I use a change order?",
        answer:
          "Use one whenever scope, price, materials, timeline, or client expectations change after the original agreement is approved.",
      },
      {
        question: "Can a change order help with payment disputes?",
        answer:
          "It can help document what was requested and approved. It does not guarantee payment, but it creates a clearer private record.",
      },
      {
        question: "Are change orders public?",
        answer:
          "No. Change-order records are private contractor workspace documents and are not published on client profiles.",
      },
    ],
  },
  {
    slug: "homeowner-wont-pay-contractor",
    path: "/homeowner-wont-pay-contractor",
    kind: "guide",
    visualAssetKey: "resolutionDesk",
    eyebrow: "Payment problem guide",
    title: "What to Do When a Homeowner Won't Pay a Contractor",
    h1: "What to Do When a Homeowner Won't Pay a Contractor",
    description:
      "A practical contractor guide for overdue invoices, evidence organization, client communication, payment recovery, and Florida lien review.",
    heroCopy:
      "When a homeowner or project client does not pay, the first move should be calm documentation. Client Bureau helps contractors organize the invoice, agreement, proof of completion, communication timeline, response context, and next steps before escalation.",
    primaryCta: {
      label: "Start a recovery case",
      href: "/dashboard/recovery",
    },
    secondaryCta: {
      label: "Read recovery service",
      href: "/payment-recovery-service",
    },
    proofLabel: "Private workflow",
    proofValue: "Document, contact, resolve",
    proofDetail:
      "Keep the case factual and private while you organize records, request payment, and track response or dispute context.",
    useCases: [
      "Final invoice is overdue after completed work.",
      "Client disputes scope, quality, timing, or amount due.",
      "You need a clean record before payment recovery, lien review, or attorney/vendor escalation.",
    ],
    workflow: [
      "Collect the signed agreement, invoice, change orders, photos, messages, and completion proof.",
      "Build a timeline with due dates, reminders, client responses, and any dispute details.",
      "Send professional follow-up or open a managed Client Bureau Resolution Desk case.",
      "If the job is in Florida and lien timing matters, create a Florida lien service case for review.",
    ],
    trustPoints: [
      "Recovery records, raw evidence, and client contact details stay private.",
      "Client Bureau does not guarantee collection or legal outcome.",
      "Public reporting should remain moderated, factual, and response-aware.",
    ],
    relatedLinks: [
      {
        label: "Payment recovery service",
        href: "/payment-recovery-service",
        description: "Managed private follow-up for overdue invoices.",
      },
      {
        label: "Florida lien filing service",
        href: "/florida-lien-filing-service",
        description: "Review-gated Florida lien filing workflow.",
      },
      {
        label: "Report a client experience",
        href: "/submit-report",
        description: "Submit a documented contractor experience for moderation.",
      },
    ],
    faqs: [
      {
        question: "Should I make the payment issue public immediately?",
        answer:
          "No. Start with private documentation, direct communication, and a clear timeline. Public Client Bureau reports are moderated and should be based on documented contractor experiences.",
      },
      {
        question: "Can Client Bureau contact the client?",
        answer:
          "For managed recovery cases, Client Bureau can support a private Resolution Desk workflow with factual outreach, logged responses, and resolution tracking.",
      },
      {
        question: "Does this replace legal advice?",
        answer:
          "No. Contractors should consult qualified counsel for legal advice, lien enforcement, litigation, or state-specific requirements.",
      },
    ],
  },
  {
    slug: "client-screening-for-contractors",
    path: "/client-screening-for-contractors",
    kind: "service",
    visualAssetKey: "searchDossier",
    eyebrow: "Client screening",
    title: "Client Screening for Contractors",
    h1: "Client Screening for Contractors",
    description:
      "Search client profiles, reported payment issues, dispute context, positive reports, and private matching before accepting work.",
    heroCopy:
      "Contractors have had to rely on instinct for too long. Client Bureau gives business owners a structured way to check a client, review moderated public context, save searches, watch profiles, and document the project before risk grows.",
    primaryCta: {
      label: "Check a client",
      href: "/search",
    },
    secondaryCta: {
      label: "Create free account",
      href: "/signup",
    },
    proofLabel: "Core action",
    proofValue: "Check before the job",
    proofDetail:
      "Use Client Bureau before committing crews, labor, materials, custom orders, scheduling, deposits, or extended payment terms.",
    useCases: [
      "A new client requests a quote, contract, appointment, or deposit arrangement.",
      "You want to review payment-risk signals and positive experience context before saying yes.",
      "You need to save a search, monitor a client, or document your own project experience.",
    ],
    workflow: [
      "Check by name, business, city, state, or private matching context.",
      "Review approved public profiles, rating context, evidence-on-file labels, and response status.",
      "Save the search, add the client to your watchlist, or create a private project file.",
      "Use contracts, evidence, recovery, and report tools if the project moves forward.",
    ],
    trustPoints: [
      "Public pages show only approved summaries and non-sensitive identity fields.",
      "Phone and email matching stays private and is never displayed publicly.",
      "Clients have response, dispute, correction, and resolution paths.",
    ],
    relatedLinks: [
      {
        label: "Client directory",
        href: "/clients",
        description: "Browse approved public profiles by state and city.",
      },
      {
        label: "Recent reports",
        href: "/reports/recent",
        description: "Review recently published public report context.",
      },
      {
        label: "Rating methodology",
        href: "/score-methodology",
        description: "Understand score factors, confidence, and limits.",
      },
    ],
    faqs: [
      {
        question: "What is client screening for contractors?",
        answer:
          "It is a pre-job review process where contractors check approved client profile context, reported experiences, response information, and private match signals before accepting work.",
      },
      {
        question: "Can I check by phone or email?",
        answer:
          "Yes, but raw phone numbers and emails should be used only as private matching signals. Client Bureau does not display those identifiers publicly.",
      },
      {
        question: "What if there is no profile yet?",
        answer:
          "You can save the search, watch the client, create a private project file, or submit a documented client experience after a real contractor-client interaction.",
      },
    ],
  },
  {
    slug: "contractor-verification",
    path: "/contractor-verification",
    kind: "guide",
    visualAssetKey: "searchDossier",
    eyebrow: "Contractor Database",
    title: "Contractor Verification and Business Trust Profiles",
    h1: "Contractor Verification and Business Trust Profiles",
    description:
      "Understand how contractor and service-business profiles show verification, trade context, public readiness, and correction rights.",
    heroCopy:
      "The Contractor Database helps service businesses show they are real, organized, and ready to work. Public profiles should make business identity, trade category, service area, verification status, public report context, and claim or correction paths easy to understand.",
    primaryCta: {
      label: "Browse Contractor Database",
      href: "/profiles/contractor",
    },
    secondaryCta: {
      label: "Claim a profile",
      href: "/claim-profile",
    },
    proofLabel: "Public trust",
    proofValue: "Verify before you hire or partner",
    proofDetail:
      "A useful contractor profile gives visitors enough public-safe context to understand the business while keeping private identifiers and unreviewed records out of public display.",
    useCases: [
      "A contractor wants to claim and improve a public business profile.",
      "A service business wants public trust signals without publishing private contact or job details.",
      "A customer, contractor, or trade partner wants to understand verification and response context before relying on a profile.",
    ],
    workflow: [
      "Confirm the business name, trade category, city, state, and service area.",
      "Review public verification status, profile claim state, rating context, and public report history.",
      "Use claim, correction, or response paths when profile details need review.",
      "Keep private records, evidence, job addresses, and staff-only review notes out of public display.",
    ],
    trustPoints: [
      "Contractor ratings are business trust indicators, not guarantees, legal findings, credit scores, or star reviews.",
      "Public profiles should show approved summaries, verification context, and response rights only.",
      "One business can be visible as a contractor, subcontractor, or both when real work history supports it.",
    ],
    relatedLinks: [
      {
        label: "Contractor Database",
        href: "/profiles/contractor",
        description: "Browse contractor and service-business profiles.",
      },
      {
        label: "Business and trade ratings",
        href: "/business-rating-methodology",
        description: "See how contractor and subcontractor ratings are explained.",
      },
      {
        label: "Claim a profile",
        href: "/claim-profile",
        description: "Start a verification, claim, correction, or profile update request.",
      },
    ],
    faqs: [
      {
        question: "What does contractor verification mean?",
        answer:
          "It means Client Bureau has profile information or review context that helps identify the business and its public profile status. It is not a guarantee of licensing, quality, payment, or future performance.",
      },
      {
        question: "Can a contractor correct a profile?",
        answer:
          "Yes. Contractors can claim, verify, correct, or dispute public profile details through the profile claim and moderation process.",
      },
      {
        question: "Does the Contractor Database publish private contact information?",
        answer:
          "No. Public contractor profiles should not show raw emails, phone numbers, street addresses, private job records, evidence files, or staff-only review notes.",
      },
    ],
  },
  {
    slug: "subcontractor-payment-chain-documentation",
    path: "/subcontractor-payment-chain-documentation",
    kind: "guide",
    visualAssetKey: "evidenceVault",
    eyebrow: "Subcontractor Database",
    title: "Subcontractor Payment-Chain Documentation",
    h1: "Subcontractor Payment-Chain Documentation",
    description:
      "A subcontractor guide for documenting GC/sub relationships, scope, retainage, pay applications, evidence, and payment-chain context.",
    heroCopy:
      "Subcontractors often work through a payment chain, not directly with the end customer. Client Bureau helps trade professionals document who hired them, what scope was assigned, what was completed, what was billed, what was retained, and what evidence supports the record.",
    primaryCta: {
      label: "Browse Subcontractor Database",
      href: "/profiles/subcontractor",
    },
    secondaryCta: {
      label: "Report a trade relationship",
      href: "/submit-report?subjectProfileType=contractor",
    },
    proofLabel: "Trade context",
    proofValue: "Scope, payment chain, evidence",
    proofDetail:
      "Subcontractor records should explain the work relationship while keeping private project details out of public display.",
    useCases: [
      "A subcontractor needs to document work performed under a contractor or project manager.",
      "Retainage, pay applications, draws, or unpaid invoices need a clean private timeline.",
      "A trade professional wants public profile context that reflects specialty trade reliability and documentation discipline.",
    ],
    workflow: [
      "Identify the hiring contractor, property owner/client context, trade category, and role on the job.",
      "Document assigned scope, work authorization, invoices, retainage, pay applications, and payment timeline.",
      "Attach contracts, messages, photos, completion proof, and payment requests in private evidence records.",
      "Use moderated reports or profile updates only when public context is factual, approved, and privacy-safe.",
    ],
    trustPoints: [
      "Subcontractor profiles focus on trade scope, GC/sub relationship context, payment-chain signals, and evidence readiness.",
      "Private job addresses, access notes, raw evidence, and participant notes do not belong on public pages.",
      "Payment-chain context should be factual and careful, not written as a guaranteed legal conclusion.",
    ],
    relatedLinks: [
      {
        label: "Subcontractor Database",
        href: "/profiles/subcontractor",
        description: "Browse trade-partner and subcontractor profiles.",
      },
      {
        label: "Business and trade ratings",
        href: "/business-rating-methodology",
        description: "Understand Trade Partner Reliability context.",
      },
      {
        label: "Evidence privacy",
        href: "/evidence-privacy-for-contractors",
        description: "Learn what evidence stays private and what public summaries can show.",
      },
    ],
    faqs: [
      {
        question: "How is a subcontractor profile different from a contractor profile?",
        answer:
          "A subcontractor profile focuses on trade scope, crew role, GC/sub relationships, documentation readiness, retainage or pay-application context, and payment-chain signals.",
      },
      {
        question: "Can subcontractors report contractor experiences?",
        answer:
          "Yes. A subcontractor can submit a documented trade relationship or payment-chain experience for moderation when the record is factual and tied to real work.",
      },
      {
        question: "Are retainage and pay-application records public?",
        answer:
          "Raw records stay private. Public pages may show cautious approved summaries and evidence-on-file labels only after moderation.",
      },
    ],
  },
  {
    slug: "evidence-privacy-for-contractors",
    path: "/evidence-privacy-for-contractors",
    kind: "guide",
    visualAssetKey: "evidenceVault",
    eyebrow: "Evidence privacy",
    title: "Evidence Privacy for Contractors",
    h1: "Evidence Privacy for Contractors",
    description:
      "Learn what evidence contractors can organize privately and what public Client Bureau profiles may safely summarize after moderation.",
    heroCopy:
      "Evidence is powerful because it can clarify what happened, but it must be handled carefully. Client Bureau keeps raw files private while allowing public pages to show limited evidence-on-file labels when a report or profile has been moderated.",
    primaryCta: {
      label: "Open Evidence Vault",
      href: "/dashboard/evidence",
    },
    secondaryCta: {
      label: "Review report policy",
      href: "/report-policy",
    },
    proofLabel: "Privacy rule",
    proofValue: "Raw files stay private",
    proofDetail:
      "Invoices, contracts, messages, photos, receipts, screenshots, signed packets, and job notes should stay in private workspaces unless reviewed into a public-safe summary.",
    useCases: [
      "A contractor wants to attach invoices, contracts, messages, and photos to a private job or report.",
      "A report needs evidence confidence without showing raw documents publicly.",
      "An admin needs to review whether a public summary is supported by private documentation.",
    ],
    workflow: [
      "Upload or label evidence inside the private workspace.",
      "Connect evidence to a report, job, contract, recovery case, or lien service case.",
      "Use public-safe evidence labels such as invoice reviewed, contract reviewed, photo reviewed, or messages reviewed.",
      "Never publish raw files, storage paths, private contact details, staff-only review notes, or unmoderated evidence.",
    ],
    trustPoints: [
      "Public pages can say evidence is on file without showing the evidence file.",
      "Evidence labels should support careful summaries, not inflammatory or unsupported claims.",
      "Admins should redact private identifiers before any public summary is approved.",
    ],
    relatedLinks: [
      {
        label: "Report policy",
        href: "/report-policy",
        description: "Review standards for public reports and evidence-supported summaries.",
      },
      {
        label: "Moderation policy",
        href: "/moderation-policy",
        description: "See how public content is reviewed before display.",
      },
      {
        label: "Submit a report",
        href: "/submit-report",
        description: "Submit a documented client, contractor, or subcontractor experience for moderation.",
      },
    ],
    faqs: [
      {
        question: "What evidence can a contractor store?",
        answer:
          "Contracts, invoices, receipts, messages, photos, completion proof, change orders, signed packets, payment requests, and timeline notes can be organized privately.",
      },
      {
        question: "What evidence appears publicly?",
        answer:
          "Public pages should show only limited labels or moderated summaries. Raw files, private addresses, phone numbers, emails, evidence paths, and staff-only review notes stay private.",
      },
      {
        question: "Can evidence be used in recovery or lien workflows?",
        answer:
          "Yes. Evidence can support private payment recovery, Florida lien service review, contracts, jobs, and reports, but legal review may still be needed for legal rights or filings.",
      },
    ],
  },
  {
    slug: "response-correction-rights",
    path: "/response-correction-rights",
    kind: "guide",
    visualAssetKey: "searchDossier",
    eyebrow: "Fair records",
    title: "Response and Correction Rights",
    h1: "Response and Correction Rights",
    description:
      "How clients, contractors, and subcontractors can respond, dispute, correct, claim, or add resolution context to Client Bureau records.",
    heroCopy:
      "A serious trust platform needs a fair path for people and businesses connected to a record. Client Bureau gives clients, contractors, and subcontractors ways to respond, request correction, dispute context, claim a profile, or submit resolution updates for moderation.",
    primaryCta: {
      label: "Respond or correct a record",
      href: "/client-response",
    },
    secondaryCta: {
      label: "Claim a profile",
      href: "/claim-profile",
    },
    proofLabel: "Fairness layer",
    proofValue: "Respond, correct, resolve",
    proofDetail:
      "Response rights keep the databases useful, balanced, and careful while still protecting private evidence and moderation notes.",
    useCases: [
      "A client wants to respond to a public client profile or report summary.",
      "A contractor or subcontractor wants to claim, verify, or correct a business/trade profile.",
      "A record has been resolved, partially resolved, disputed, or updated and needs moderation review.",
    ],
    workflow: [
      "Find the public profile or report connected to the record.",
      "Submit a response, correction, dispute, claim, or resolution update with verification context.",
      "Moderators review the request, evidence, identity context, and public-safe wording.",
      "Approved response or correction context can update the public record while keeping private identifiers hidden.",
    ],
    trustPoints: [
      "Responses, disputes, corrections, and resolution updates are moderated before public display.",
      "Private evidence, contact details, and staff-only review notes remain private during review.",
      "Public pages should show balanced context without claiming legal conclusions or guaranteed outcomes.",
    ],
    relatedLinks: [
      {
        label: "Client response",
        href: "/client-response",
        description: "Submit a response, dispute, correction, or resolution update.",
      },
      {
        label: "Claim profile",
        href: "/claim-profile",
        description: "Start a profile claim or correction workflow.",
      },
      {
        label: "Dispute policy",
        href: "/dispute-policy",
        description: "Review how dispute and response requests are handled.",
      },
    ],
    faqs: [
      {
        question: "Who can request a correction?",
        answer:
          "Clients, contractors, subcontractors, service businesses, and trade professionals can submit correction or claim requests when they are connected to a public record.",
      },
      {
        question: "Are responses published automatically?",
        answer:
          "No. Responses, disputes, corrections, and resolution updates are reviewed before any public display.",
      },
      {
        question: "Can a resolved issue be updated?",
        answer:
          "Yes. Resolution context can be submitted for moderation so public profiles reflect resolved or partially resolved status where appropriate.",
      },
    ],
  },
]

export function getAcquisitionPage(slug: string) {
  return acquisitionPages.find((page) => page.slug === slug)
}
