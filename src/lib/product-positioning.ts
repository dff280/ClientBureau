import {
  FileCheck2,
  FolderKanban,
  Handshake,
  MessageSquareText,
  ReceiptText,
  Search,
  ShieldCheck,
  Signature,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export const businessProtectionPromise =
  "Check the client. Set the terms. Document the job. Protect payment. Resolve issues."

export const corePositioning = "Check the client before you take the job."

export type ProtectionWorkflowStep = {
  id: "check" | "terms" | "document" | "payment" | "resolve"
  phase: string
  title: string
  text: string
  tools: string[]
  href: string
  cta: string
  icon: LucideIcon
}

export const protectionWorkflowSteps: ProtectionWorkflowStep[] = [
  {
    id: "check",
    phase: "Before the estimate",
    title: "Check the client",
    text: "Search public profiles, private-match signals, positive reports, payment context, and watchlist alerts before accepting work.",
    tools: ["Client search", "Private matching", "Watchlists"],
    href: "/search",
    cta: "Search a client",
    icon: Search,
  },
  {
    id: "terms",
    phase: "Before scheduling",
    title: "Set the terms",
    text: "Create a clear agreement path with contract packets, signing links, deposits, milestones, and change-order controls.",
    tools: ["Contracts", "Signing links", "Client invite"],
    href: "/dashboard",
    cta: "Open contracts",
    icon: Signature,
  },
  {
    id: "document",
    phase: "During the job",
    title: "Document the job",
    text: "Keep project notes, evidence, invoices, screenshots, photos, approvals, and completion records organized privately.",
    tools: ["Evidence vault", "Work files", "Draft reports"],
    href: "/dashboard",
    cta: "Open evidence",
    icon: FolderKanban,
  },
  {
    id: "payment",
    phase: "After invoicing",
    title: "Protect payment",
    text: "Track invoice timing, payment promises, follow-up attempts, payment plans, and notice-readiness checkpoints.",
    tools: ["Payment follow-up", "Plans", "Notice readiness"],
    href: "/dashboard",
    cta: "Open payment tools",
    icon: ReceiptText,
  },
  {
    id: "resolve",
    phase: "If there is a dispute",
    title: "Resolve fairly",
    text: "Support moderated reports, client responses, correction requests, resolution updates, and neutral public summaries.",
    tools: ["Reports", "Client response", "Moderation"],
    href: "/client-response",
    cta: "View response path",
    icon: MessageSquareText,
  },
]

export const protectionGuardrails = [
  {
    title: "Private by default",
    text: "Raw evidence, private identifiers, street addresses, internal notes, and unapproved content stay out of public profiles.",
    icon: ShieldCheck,
  },
  {
    title: "Contracts stay controlled",
    text: "Agreement links help contractors and clients review terms, signatures, deposits, milestones, and change orders in one record.",
    icon: Handshake,
  },
  {
    title: "Recovery is documentation-first",
    text: "Payment follow-up, call logs, payment plans, and notice-readiness tools are private workflow records, not automated enforcement.",
    icon: FileCheck2,
  },
]
