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
        description: "Search client context before sending an agreement.",
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
      "Start a Florida contractor agreement packet with scope, payment terms, change orders, lien-review prompts, and private e-signature records.",
    heroCopy:
      "Florida jobs deserve clearer records before labor, materials, scheduling, or deposits are committed. Client Bureau gives contractors a private starter packet for scope, exclusions, payment timing, change-order approvals, cancellation review, lien-notice review, and client signature readiness.",
    primaryCta: {
      label: "Use the Florida starter",
      href: "/dashboard/contracts",
    },
    secondaryCta: {
      label: "Read contract workflow",
      href: "/contractor-contract-template",
    },
    proofLabel: "First template",
    proofValue: "Florida-ready review structure",
    proofDetail:
      "The starter helps organize the issues Florida contractors often need reviewed before sending a client signing link.",
    useCases: [
      "Florida residential repair, remodel, installation, and trade-service work that needs a written scope before scheduling.",
      "Projects where deposits, progress payments, final payment triggers, and change orders should be visible to the client before work begins.",
      "Jobs where lien-notice, notice-of-commencement, permit, licensing, cancellation, roofing, or local-code review may matter.",
    ],
    workflow: [
      "Open Contracts in the dashboard and choose the Florida starter inside the agreement packet form.",
      "Replace starter language with project-specific scope, exclusions, payment terms, dates, and contractor/client legal names.",
      "Review Florida-specific requirements with qualified counsel or a qualified business advisor when needed.",
      "Generate a private signing link only after the packet is complete and ready for client review.",
    ],
    trustPoints: [
      "The template stays private in the contractor workspace and does not publish contract content to public profiles.",
      "Client Bureau does not provide legal advice, guarantee enforceability, or guarantee lien rights, priority, payment, or collection.",
      "The starter is built around cautious review prompts for Florida construction lien, cancellation, licensing, permit, and local-practice issues.",
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
        label: "Florida lien filing service",
        href: "/florida-lien-filing-service",
        description: "Review Florida lien filing workflow gates and private records.",
      },
    ],
    faqs: [
      {
        question: "Is this a Florida legal contract?",
        answer:
          "No. It is a private business workflow starter for organizing agreement fields, review prompts, signatures, and audit records. Contractors should get attorney review before relying on it as a legal contract.",
      },
      {
        question: "Why does the starter mention lien and cancellation review?",
        answer:
          "Florida construction lien, home-solicitation, licensing, permit, roofing, and local requirements can depend on the work type and transaction. The template prompts review instead of pretending one generic agreement covers every job.",
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
    proofValue: "Search before you sign",
    proofDetail:
      "Use Client Bureau before committing crews, labor, materials, custom orders, scheduling, deposits, or extended payment terms.",
    useCases: [
      "A new client requests a quote, contract, appointment, or deposit arrangement.",
      "You want to review payment-risk signals and positive experience context before saying yes.",
      "You need to save a search, monitor a client, or document your own project experience.",
    ],
    workflow: [
      "Search by name, business, city, state, phone, email, or private identifier intent.",
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
          "It is a pre-job review process where contractors search for approved client profile context, reported experiences, response information, and private match signals before accepting work.",
      },
      {
        question: "Can I search by phone or email?",
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
]

export function getAcquisitionPage(slug: string) {
  return acquisitionPages.find((page) => page.slug === slug)
}
