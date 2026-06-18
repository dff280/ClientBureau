"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { useActionState, useEffect } from "react"
import {
  BadgeCheck,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileCheck2,
  LockKeyhole,
  Pencil,
  ShieldCheck,
  Trash2,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

import { AdminProfileHealthCard } from "@/components/admin/admin-crm-ui"
import { AdminActionTokenInput } from "@/components/admin/admin-action-token-context"
import { FieldError } from "@/components/forms/field-error"
import { FloridaPlaceDatalist } from "@/components/forms/florida-place-datalist"
import { PendingSubmitButton } from "@/components/forms/pending-submit-button"
import { StateSelect } from "@/components/forms/state-select"
import { TradeCategorySelect } from "@/components/forms/trade-category-select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import {
  adminDeleteRecordAction,
  adminUpdateAccountClassificationAction,
  adminUpdateClientAction,
  adminUpdateContractorAction,
} from "@/lib/actions/client-bureau"
import { buildBusinessSlug } from "@/lib/business-rating"
import { clientRatingBand } from "@/lib/client-rating"
import { businessTypes, companySizes, onboardingGoals, yearsInBusinessOptions } from "@/lib/locations"
import type { AccountType, ActionResult, AuditLogEntry, ClientProfile, ContractorProfile, ProfileType } from "@/lib/types"
import { accountTypes, profileTypes, riskLevels } from "@/lib/types"
import { cn } from "@/lib/utils"

const clientState: ActionResult<ClientProfile> = { ok: false, message: "" }
const contractorState: ActionResult<ContractorProfile> = { ok: false, message: "" }
const classificationState: ActionResult<ContractorProfile> = { ok: false, message: "" }
const deleteState: ActionResult<AuditLogEntry | boolean> = { ok: false, message: "" }

export type ClientProfileReportMetrics = {
  approved: number
  disputed: number
  evidence: number
  lastReportAt?: string
  pending: number
  positive: number
  rejected: number
  resolved: number
  total: number
}

export function AdminClientEditor({
  client,
  metrics = emptyClientMetrics,
}: {
  client: ClientProfile
  metrics?: ClientProfileReportMetrics
}) {
  const [state, action] = useActionState(adminUpdateClientAction, clientState)
  const [deleteResult, deleteAction] = useActionState(adminDeleteRecordAction, deleteState)
  const name = `${client.firstName} ${client.lastName}`
  const ratingBand = clientRatingBand(client.clientBureauScore, client.reportCount)
  const publicationState = getPublicationState(client, metrics)
  const readiness = getClientProfileReadiness(client, metrics)

  useEffect(() => {
    if (state.message) toast[state.ok ? "success" : "error"](state.message)
  }, [state])

  useEffect(() => {
    if (deleteResult.message) toast[deleteResult.ok ? "success" : "error"](deleteResult.message)
  }, [deleteResult])

  return (
    <Sheet>
      <AdminProfileHealthCard
        title={name}
        subtitle={`${client.city}, ${client.state}${client.businessName ? ` / ${client.businessName}` : ""}`}
        badge={client.isPublic ? "Public" : "Private"}
        tone={client.isPublic ? "emerald" : "slate"}
        facts={[
          { label: "Client Bureau Rating", value: `${client.clientBureauScore}/100` },
          { label: "Rating band", value: ratingBand },
          { label: "Risk level", value: client.riskLevel },
          { label: "ZIP / directory", value: client.zip ?? "Not provided" },
          { label: "Approved / total reports", value: `${metrics.approved} / ${metrics.total}` },
          { label: "Pending / disputed", value: `${metrics.pending} pending / ${metrics.disputed} disputed` },
          { label: "Evidence status", value: metrics.evidence > 0 ? `${metrics.evidence} evidence-backed report${metrics.evidence === 1 ? "" : "s"}` : "No evidence label yet" },
          { label: "Public readiness", value: `${readiness.score}/100 - ${readiness.label}` },
          { label: "Public slug", value: client.publicSlug },
          { label: "Last report activity", value: metrics.lastReportAt ? ageLabel(metrics.lastReportAt) : "No report activity" },
        ]}
        actions={
          <>
            <SheetTrigger asChild>
              <Button className="bg-slate-950 text-white hover:bg-slate-800">
                <Pencil aria-hidden="true" />
                Edit profile
              </Button>
            </SheetTrigger>
            {client.isPublic ? (
              <Button asChild variant="outline">
                <Link href={`/client/${client.publicSlug}`} target="_blank">
                  <ExternalLink aria-hidden="true" />
                  Public preview
                </Link>
              </Button>
            ) : null}
          </>
        }
      >
        <div className="grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
          <ReadinessItem
            icon={publicationState.icon}
            label="Publication"
            text={publicationState.text}
            tone={publicationState.tone}
          />
          <ReadinessItem
            icon={LockKeyhole}
            label="Private match"
            text="Phone and email remain hashed"
            tone="emerald"
          />
          <ReadinessItem
            icon={FileCheck2}
            label="Evidence"
            text={metrics.evidence > 0 ? "Private evidence on file" : "Evidence not labeled yet"}
            tone={metrics.evidence > 0 ? "blue" : "slate"}
          />
          <ReadinessItem
            icon={Clock3}
            label="Review age"
            text={ageLabel(client.updatedAt)}
            tone={isOlderThanDays(client.updatedAt, 45) ? "amber" : "slate"}
          />
          <ReadinessItem
            icon={BadgeCheck}
            label="Readiness"
            text={readiness.gaps.length > 0 ? readiness.gaps.slice(0, 2).join(", ") : "Ready for public review"}
            tone={readiness.tone}
          />
        </div>
      </AdminProfileHealthCard>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-2xl">
        <SheetHeader className="border-b border-slate-200 p-5">
          <SheetTitle>Edit client profile</SheetTitle>
          <SheetDescription>
            Update public-safe identity, rating display, visibility, and audit context. Raw phone, email,
            street address, and evidence files stay private.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-5 p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <EditorSummaryTile label="Publication state" value={publicationState.text} tone={publicationState.tone} />
            <EditorSummaryTile label="Approved reports" value={String(metrics.approved)} tone={metrics.approved > 0 ? "emerald" : "slate"} />
            <EditorSummaryTile label="Open disputes" value={String(metrics.disputed)} tone={metrics.disputed > 0 ? "amber" : "slate"} />
          </div>
          <div className={`rounded-md border p-4 ${readinessPanelClass(readiness.tone)}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase opacity-70">Client Database readiness</p>
                <p className="mt-1 text-lg font-semibold">{readiness.label}</p>
              </div>
              <span className="rounded-md bg-white/80 px-3 py-1 text-sm font-semibold text-slate-950 shadow-sm">
                {readiness.score}/100
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 opacity-85">{readiness.summary}</p>
            {readiness.gaps.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {readiness.gaps.map((gap) => (
                  <span key={gap} className="rounded-md border border-current/15 bg-white/60 px-2.5 py-1 text-xs font-semibold">
                    {gap}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Publication preview</p>
            <p className="mt-2 text-sm font-semibold text-slate-950">{name} in {client.city}, {client.state}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Public URL: /client/{client.publicSlug}. Private matching fields are stored as hashes and are not shown publicly.
            </p>
          </div>
          <form action={action} className="grid gap-5">
            <AdminActionTokenInput />
            <input type="hidden" name="clientId" value={client.id} />
            <FloridaPlaceDatalist id={`${client.id}-florida-place-options`} />
            <EditorFormSection
              title="Identity and directory fields"
              description="These fields power admin matching, public profile headings, profile URLs, and city/state directory pages."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <LabeledInput label="First name" name="firstName" defaultValue={client.firstName} errors={state.ok ? undefined : state.fieldErrors} />
                <LabeledInput label="Last name" name="lastName" defaultValue={client.lastName} errors={state.ok ? undefined : state.fieldErrors} />
                <LabeledInput label="Business optional" name="businessName" defaultValue={client.businessName ?? ""} />
                <LabeledInput label="City" name="city" defaultValue={client.city} list={`${client.id}-florida-place-options`} errors={state.ok ? undefined : state.fieldErrors} />
                <LabeledState label="State" id={`${client.id}-state`} name="state" defaultValue={client.state} errors={state.ok ? undefined : state.fieldErrors} />
                <LabeledInput label="ZIP optional" name="zip" defaultValue={client.zip ?? ""} errors={state.ok ? undefined : state.fieldErrors} />
              </div>
            </EditorFormSection>
            <EditorFormSection
              title="Rating, risk, and public visibility"
              description="Only public-safe identity, score context, approved summaries, response context, and evidence indicators should appear publicly."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-slate-500" htmlFor={`${client.id}-risk`}>
                    Risk level
                  </label>
                  <select
                    id={`${client.id}-risk`}
                    name="riskLevel"
                    defaultValue={client.riskLevel}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {riskLevels.map((risk) => (
                      <option key={risk}>{risk}</option>
                    ))}
                  </select>
                </div>
                <LabeledInput label="Client Bureau Rating" name="clientBureauScore" defaultValue={String(client.clientBureauScore)} type="number" />
                <LabeledInput label="Report count" name="reportCount" defaultValue={String(client.reportCount)} type="number" />
              </div>
              <label className="mt-4 flex items-start gap-2 rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700">
                <Checkbox name="isPublic" defaultChecked={client.isPublic} />
                <span>
                  <span className="block font-semibold text-slate-950">Make profile public</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-600">
                    Only public-safe identity, rating context, approved reports, and response context can appear on public pages.
                  </span>
                </span>
              </label>
            </EditorFormSection>
            <EditorFormSection
              title="Moderator note"
              description="Explain why identity, visibility, risk, or rating changed so the next admin can understand the decision."
            >
              <Textarea name="moderatorNote" required placeholder="Required moderator note for audit log" className="min-h-24 bg-white" />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Keep notes factual and internal. Do not paste private evidence paths or raw contact details.
              </p>
            </EditorFormSection>
            <PendingSubmitButton pendingText="Saving..." className="bg-slate-950 text-white hover:bg-slate-800">
              <CheckCircle2 aria-hidden="true" />
              Save profile changes
            </PendingSubmitButton>
          </form>
          <form action={deleteAction} className="rounded-md border border-rose-200 bg-rose-50 p-4">
            <AdminActionTokenInput />
            <input type="hidden" name="entityType" value="client" />
            <input type="hidden" name="entityId" value={client.id} />
            <p className="text-sm font-semibold text-rose-950">Delete client profile</p>
            <p className="mt-1 text-xs leading-5 text-rose-800">
              Use only for duplicate or unsafe records. This action creates an audit event.
            </p>
            <label className="mt-3 block text-xs font-semibold uppercase text-rose-900" htmlFor={`${client.id}-delete-confirm`}>
              Type DELETE to confirm
            </label>
            <Input
              id={`${client.id}-delete-confirm`}
              name="deleteConfirmation"
              pattern="DELETE"
              required
              placeholder="DELETE"
              className="mt-2 border-rose-200 bg-white"
            />
            <Button type="submit" variant="destructive" size="sm" className="mt-3">
              <Trash2 aria-hidden="true" />
              Delete client
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function AdminContractorEditor({ contractor }: { contractor: ContractorProfile }) {
  const [state, action] = useActionState(adminUpdateContractorAction, contractorState)
  const [classificationResult, classificationAction] = useActionState(
    adminUpdateAccountClassificationAction,
    classificationState,
  )
  const [deleteResult, deleteAction] = useActionState(adminDeleteRecordAction, deleteState)
  const verificationTone = contractor.verificationStatus === "verified" ? "emerald" : contractor.verificationStatus === "pending" ? "amber" : "slate"
  const primaryAccountType = contractor.accountType ?? (contractor.accountCapabilities?.includes("subcontractor") ? "subcontractor" : "contractor")
  const accountCapabilities = normalizedCapabilities(contractor.accountCapabilities, primaryAccountType)
  const profileSlug = contractor.publicSlug ?? buildBusinessSlug(contractor)
  const enabledProfileUrls = accountCapabilities.map((profileType) => `/profiles/${profileType}/${profileSlug}`)
  const primaryPreviewHref = enabledProfileUrls[0] ?? `/profiles/contractor/${profileSlug}`
  const profileGaps = [
    !contractor.licenseNumber ? "license" : null,
    !contractor.serviceArea ? "service area" : null,
    !contractor.businessType ? "business type" : null,
    !contractor.companySize ? "company size" : null,
    !contractor.yearsInBusiness ? "years in business" : null,
  ].filter(Boolean)
  const classificationGaps = [
    !contractor.tradeCategory && !contractor.trade ? "trade category" : null,
    !contractor.city ? "city" : null,
    !contractor.state ? "state" : null,
    !contractor.publicSummary ? "public summary" : null,
    contractor.verificationStatus !== "verified" ? "verified status" : null,
    !contractor.isPublic ? "public visibility" : null,
  ].filter(Boolean)

  useEffect(() => {
    if (state.message) toast[state.ok ? "success" : "error"](state.message)
  }, [state])

  useEffect(() => {
    if (classificationResult.message) toast[classificationResult.ok ? "success" : "error"](classificationResult.message)
  }, [classificationResult])

  useEffect(() => {
    if (deleteResult.message) toast[deleteResult.ok ? "success" : "error"](deleteResult.message)
  }, [deleteResult])

  return (
    <Sheet>
      <AdminProfileHealthCard
        title={contractor.businessName}
        subtitle={`${contractor.trade} / ${contractor.city}, ${contractor.state}`}
        badge={contractor.verificationStatus}
        tone={verificationTone}
        facts={[
          { label: "Business owner workspace", value: "Active" },
          { label: "Primary account type", value: accountTypeLabel(primaryAccountType) },
          { label: "Public capabilities", value: accountCapabilities.map(profileTypeLabel).join(", ") },
          { label: "Public visibility", value: contractor.isPublic === false ? "Private" : "Public-ready" },
          { label: "Trade or service", value: contractor.trade },
          { label: "Business type", value: contractor.businessType ?? "Not provided" },
          { label: "Location", value: `${contractor.city}, ${contractor.state}` },
          { label: "Service area", value: contractor.serviceArea ?? "Not provided" },
          { label: "Company size", value: contractor.companySize ?? "Not provided" },
          { label: "Years in business", value: contractor.yearsInBusiness ?? "Not provided" },
          { label: "Verification", value: contractor.verificationStatus },
          { label: "License", value: contractor.licenseNumber ?? "Not provided" },
          { label: "Website", value: contractor.websiteUrl ? "Website on file" : "Not provided" },
          { label: "Workspace age", value: ageLabel(contractor.createdAt) },
        ]}
        actions={
          <>
            <SheetTrigger asChild>
              <Button className="bg-slate-950 text-white hover:bg-slate-800">
                <Pencil aria-hidden="true" />
                Edit business
              </Button>
            </SheetTrigger>
            <Button asChild variant="outline">
              <Link href={primaryPreviewHref} target="_blank">
                <ExternalLink aria-hidden="true" />
                Public preview
              </Link>
            </Button>
          </>
        }
      >
        <div className="grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
          <ReadinessItem
            icon={BadgeCheck}
            label="Verification"
            text={contractor.verificationStatus === "verified" ? "Verification context reviewed" : contractor.verificationStatus === "pending" ? "Review pending" : "Not verified yet"}
            tone={verificationTone}
          />
          <ReadinessItem
            icon={ShieldCheck}
            label="Profile health"
            text={profileGaps.length ? `Missing ${profileGaps.join(", ")}` : "Core fields complete"}
            tone={profileGaps.length ? "amber" : "emerald"}
          />
          <ReadinessItem
            icon={LockKeyhole}
            label="Classification"
            text={`${accountTypeLabel(primaryAccountType)} dashboard, ${accountCapabilities.length} public view${accountCapabilities.length === 1 ? "" : "s"}`}
            tone="emerald"
          />
          <ReadinessItem
            icon={FileCheck2}
            label="Public profile"
            text={classificationGaps.length ? `Missing ${classificationGaps.join(", ")}` : "Ready for public discovery"}
            tone={classificationGaps.length ? "amber" : "blue"}
          />
        </div>
      </AdminProfileHealthCard>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-2xl">
        <SheetHeader className="border-b border-slate-200 p-5">
          <SheetTitle>Edit business / user workspace</SheetTitle>
          <SheetDescription>
            Update business profile fields, account classification, public capabilities, verification status, location, and audit notes. Admin access and billing stay separate.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-5 p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <EditorSummaryTile label="Verification" value={contractor.verificationStatus} tone={verificationTone} />
            <EditorSummaryTile label="Classification" value={accountTypeLabel(primaryAccountType)} tone="blue" />
            <EditorSummaryTile label="Workspace age" value={ageLabel(contractor.createdAt)} tone="slate" />
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Account context</p>
            <p className="mt-2 text-sm font-semibold text-slate-950">{contractor.businessName}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Classification controls dashboard defaults and public profile views. Admin authorization remains separate from this business classification.
            </p>
          </div>
          <form action={classificationAction} className="grid gap-4 rounded-md border border-blue-200 bg-blue-50/60 p-4">
            <AdminActionTokenInput />
            <input type="hidden" name="contractorId" value={contractor.id} />
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Account classification</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-950">Set how this account appears across Client Bureau</h3>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                  Choose the primary workspace and every public profile view this business can support. This does not grant admin access, duplicate the identity, or expose private contact data.
                </p>
              </div>
              <span className="rounded-md border border-blue-200 bg-white px-3 py-2 text-xs font-semibold uppercase text-blue-800">
                {contractor.isPublic === false ? "Private profile" : "Public eligible"}
              </span>
            </div>
            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="grid gap-4">
                <LabeledSelect
                  label="Primary account type"
                  name="primaryAccountType"
                  defaultValue={primaryAccountType}
                  options={accountTypes}
                  optionLabel={accountTypeLabel}
                  errors={classificationResult.ok ? undefined : classificationResult.fieldErrors}
                />
                <div>
                  <p className="text-sm font-semibold text-slate-950">Public capabilities</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Select every public database view this account should support. The primary account type must be included and the same identity can appear in more than one view.
                  </p>
                  <div className="mt-3 grid gap-2">
                    <CapabilityCheckbox
                      name="capabilityContractor"
                      defaultChecked={accountCapabilities.includes("contractor")}
                      title="Contractor / service business"
                      detail="Shows contractor profile views, service-business search results, and business readiness context."
                    />
                    <CapabilityCheckbox
                      name="capabilitySubcontractor"
                      defaultChecked={accountCapabilities.includes("subcontractor")}
                      title="Subcontractor / trade pro"
                      detail="Shows trade-partner profile views, payment-chain context, and subcontractor directory results."
                    />
                    <CapabilityCheckbox
                      name="capabilityClient"
                      defaultChecked={accountCapabilities.includes("client")}
                      title="Client / customer"
                      detail="Allows the account to be treated as a client/customer profile when staff intentionally enables that view."
                    />
                  </div>
                  <FieldError name="accountCapabilities" errors={classificationResult.ok ? undefined : classificationResult.fieldErrors} />
                </div>
              </div>
              <div className="grid gap-4">
                <div>
                  <TradeCategorySelect
                    id={`${contractor.id}-classification-trade`}
                    name="tradeCategory"
                    otherName="classificationOtherTradeDetail"
                    defaultValue={contractor.tradeCategory ?? contractor.trade}
                    label="Canonical trade category"
                    profileType={accountCapabilities.includes("subcontractor") ? "subcontractor" : "contractor"}
                    required
                  />
                  <FieldError name="tradeCategory" errors={classificationResult.ok ? undefined : classificationResult.fieldErrors} />
                </div>
                <LabeledInput
                  label="Profile subtype"
                  name="profileSubtype"
                  defaultValue={String(contractor.profileSubtype ?? contractor.businessType ?? defaultSubtypeForAccount(primaryAccountType))}
                  errors={classificationResult.ok ? undefined : classificationResult.fieldErrors}
                />
                <LabeledSelect
                  label="Verification"
                  name="verificationStatus"
                  defaultValue={contractor.verificationStatus}
                  options={["unverified", "pending", "verified"]}
                  errors={classificationResult.ok ? undefined : classificationResult.fieldErrors}
                />
                <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3 text-sm">
                  <Checkbox name="isPublic" defaultChecked={contractor.isPublic !== false} />
                  <span>
                    <span className="block font-semibold text-slate-950">Public visibility enabled</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-600">
                      Public profile pages may show approved, moderated profile context only. Private contact details, verification phone, account email, internal notes, and private job data stay hidden.
                    </span>
                  </span>
                </label>
              </div>
            </div>
            <div className="grid gap-3 rounded-md border border-slate-200 bg-white p-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Enabled public URLs</p>
                <div className="mt-2 grid gap-1 text-sm font-medium text-slate-700">
                  {enabledProfileUrls.map((href) => (
                    <Link key={href} href={href} target="_blank" className="truncate text-blue-700 hover:text-blue-900">
                      {href}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Readiness warnings</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {classificationGaps.length
                    ? `Resolve before promotion: ${classificationGaps.join(", ")}.`
                    : "Classification, trade, verification, location, and visibility are ready for public discovery."}
                </p>
              </div>
            </div>
            <EditorFormSection
              title="Classification audit note"
              description="Explain why this account is being changed, including source of verification and any public profile impact."
            >
              <Textarea name="moderatorNote" required placeholder="Required moderator note for classification change" className="min-h-20 bg-white" />
              <FieldError name="moderatorNote" errors={classificationResult.ok ? undefined : classificationResult.fieldErrors} />
            </EditorFormSection>
            <PendingSubmitButton pendingText="Updating classification..." className="bg-blue-950 text-white hover:bg-blue-900">
              <ShieldCheck aria-hidden="true" />
              Save account classification
            </PendingSubmitButton>
          </form>
          <form action={action} className="grid gap-4">
            <AdminActionTokenInput />
            <input type="hidden" name="contractorId" value={contractor.id} />
            <EditorFormSection
              title="Business identity"
              description="These fields power the business/trade profile, profile claiming, public proof cards, and admin search."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <LabeledInput label="Business" name="businessName" defaultValue={contractor.businessName} errors={state.ok ? undefined : state.fieldErrors} />
                <div>
                  <TradeCategorySelect
                    id={`${contractor.id}-trade`}
                    name="trade"
                    otherName="otherTradeDetail"
                    defaultValue={contractor.trade}
                    label="Trade or service"
                    profileType={contractor.trade.toLowerCase().includes("subcontract") ? "subcontractor" : "contractor"}
                    required
                  />
                  <FieldError name="trade" errors={state.ok ? undefined : state.fieldErrors} />
                </div>
                <LabeledSelect label="Business type" name="businessType" defaultValue={contractor.businessType ?? ""} options={businessTypes} errors={state.ok ? undefined : state.fieldErrors} />
                <LabeledInput label="Website optional" name="websiteUrl" defaultValue={contractor.websiteUrl ?? ""} errors={state.ok ? undefined : state.fieldErrors} />
                <div className="sm:col-span-2">
                  <LabeledTextarea label="Service area" name="serviceArea" defaultValue={contractor.serviceArea ?? ""} errors={state.ok ? undefined : state.fieldErrors} placeholder="Orlando, Winter Park, Orange County, Central Florida" />
                </div>
              </div>
            </EditorFormSection>
            <EditorFormSection
              title="Verification and operating details"
              description="Use dropdowns for structured fields so search, ratings, and admin queues stay consistent."
            >
              <FloridaPlaceDatalist id={`${contractor.id}-florida-place-options`} />
              <div className="grid gap-4 sm:grid-cols-2">
                <LabeledInput label="City" name="city" defaultValue={contractor.city} list={`${contractor.id}-florida-place-options`} errors={state.ok ? undefined : state.fieldErrors} />
                <LabeledState label="State" id={`${contractor.id}-state`} name="state" defaultValue={contractor.state} errors={state.ok ? undefined : state.fieldErrors} />
                <LabeledInput label="License number optional" name="licenseNumber" defaultValue={contractor.licenseNumber ?? ""} errors={state.ok ? undefined : state.fieldErrors} />
                <LabeledSelect
                  label="Verification"
                  name="verificationStatus"
                  defaultValue={contractor.verificationStatus}
                  options={["unverified", "pending", "verified"]}
                  errors={state.ok ? undefined : state.fieldErrors}
                />
                <LabeledSelect label="Company size" name="companySize" defaultValue={contractor.companySize ?? ""} options={companySizes} errors={state.ok ? undefined : state.fieldErrors} />
                <LabeledSelect label="Years in business" name="yearsInBusiness" defaultValue={contractor.yearsInBusiness ?? ""} options={yearsInBusinessOptions} errors={state.ok ? undefined : state.fieldErrors} />
                <LabeledSelect label="Main goal" name="primaryGoal" defaultValue={contractor.primaryGoal ?? ""} options={onboardingGoals} errors={state.ok ? undefined : state.fieldErrors} />
                <LabeledInput label="Verification phone private" name="businessPhone" defaultValue={contractor.businessPhone ?? ""} errors={state.ok ? undefined : state.fieldErrors} />
              </div>
            </EditorFormSection>
            <EditorFormSection
              title="Moderator note"
              description="Explain why the business profile, verification, location, or operational details changed."
            >
              <Textarea name="moderatorNote" required placeholder="Required moderator note for audit log" className="min-h-24" />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Private verification phone, license details, and account context stay internal unless a public-safe label is intentionally shown.
              </p>
            </EditorFormSection>
            <PendingSubmitButton pendingText="Saving..." className="bg-slate-950 text-white hover:bg-slate-800">
              <ShieldCheck aria-hidden="true" />
              Save business changes
            </PendingSubmitButton>
          </form>
          <form action={deleteAction} className="rounded-md border border-rose-200 bg-rose-50 p-4">
            <AdminActionTokenInput />
            <input type="hidden" name="entityType" value="contractor" />
            <input type="hidden" name="entityId" value={contractor.id} />
            <p className="text-sm font-semibold text-rose-950">Delete business profile</p>
            <p className="mt-1 text-xs leading-5 text-rose-800">
              Use only for duplicate, abandoned, or unsafe records. This action creates an audit event.
            </p>
            <label className="mt-3 block text-xs font-semibold uppercase text-rose-900" htmlFor={`${contractor.id}-delete-confirm`}>
              Type DELETE to confirm
            </label>
            <Input
              id={`${contractor.id}-delete-confirm`}
              name="deleteConfirmation"
              pattern="DELETE"
              required
              placeholder="DELETE"
              className="mt-2 border-rose-200 bg-white"
            />
            <Button type="submit" variant="destructive" size="sm" className="mt-3">
              <Trash2 aria-hidden="true" />
              Delete business
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}

const emptyClientMetrics: ClientProfileReportMetrics = {
  approved: 0,
  disputed: 0,
  evidence: 0,
  pending: 0,
  positive: 0,
  rejected: 0,
  resolved: 0,
  total: 0,
}

type ReadinessTone = "slate" | "amber" | "emerald" | "blue"

const readinessToneClasses: Record<ReadinessTone, string> = {
  slate: "border-slate-200 bg-white text-slate-700",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
  blue: "border-sky-200 bg-sky-50 text-sky-800",
}

function getPublicationState(client: ClientProfile, metrics: ClientProfileReportMetrics): {
  icon: LucideIcon
  text: string
  tone: ReadinessTone
} {
  if (client.isPublic) {
    return {
      icon: BadgeCheck,
      text: "Public and searchable",
      tone: "emerald",
    }
  }

  if (metrics.approved > 0) {
    return {
      icon: FileCheck2,
      text: "Approved report ready",
      tone: "blue",
    }
  }

  if (metrics.pending > 0 || metrics.disputed > 0) {
    return {
      icon: Clock3,
      text: "Review before publishing",
      tone: "amber",
    }
  }

  return {
    icon: LockKeyhole,
    text: "Private record only",
    tone: "slate",
  }
}

function getClientProfileReadiness(client: ClientProfile, metrics: ClientProfileReportMetrics): {
  gaps: string[]
  label: string
  score: number
  summary: string
  tone: ReadinessTone
} {
  const gaps = [
    !client.firstName ? "missing first name" : null,
    !client.lastName ? "missing last name" : null,
    !client.city ? "missing city" : null,
    !client.state ? "missing state" : null,
    !client.publicSlug ? "missing public slug" : null,
    client.reportCount !== metrics.approved && metrics.approved > 0 ? "report count mismatch" : null,
    metrics.approved === 0 && !client.isPublic ? "no approved public report" : null,
    metrics.disputed > 0 ? "dispute review needed" : null,
    client.isPublic && isOlderThanDays(client.updatedAt, 45) ? "stale public review" : null,
  ].filter((gap): gap is string => Boolean(gap))

  let score = 100
  score -= gaps.includes("no approved public report") ? 20 : 0
  score -= gaps.includes("dispute review needed") ? 10 : 0
  score -= gaps.includes("stale public review") ? 8 : 0
  score -= gaps.filter((gap) => gap.startsWith("missing")).length * 14
  score -= gaps.includes("report count mismatch") ? 10 : 0
  score = Math.max(20, Math.min(100, score))

  if (score >= 86) {
    return {
      gaps,
      label: "Ready for public database review",
      score,
      summary: "Identity, location, slug, report context, and visibility are aligned for a public-safe Client Database record.",
      tone: "emerald",
    }
  }

  if (score >= 65) {
    return {
      gaps,
      label: "Review before publishing",
      score,
      summary: "The profile can be worked, but moderators should resolve the listed items before changing visibility or rating context.",
      tone: "amber",
    }
  }

  return {
    gaps,
    label: "Keep private until cleaned up",
    score,
    summary: "This profile needs identity, report, or review cleanup before it should be treated as a public Client Database record.",
    tone: "slate",
  }
}

function readinessPanelClass(tone: ReadinessTone) {
  if (tone === "emerald") return "border-emerald-200 bg-emerald-50 text-emerald-950"
  if (tone === "amber") return "border-amber-200 bg-amber-50 text-amber-950"
  if (tone === "blue") return "border-sky-200 bg-sky-50 text-sky-950"

  return "border-slate-200 bg-slate-50 text-slate-700"
}

function ReadinessItem({
  icon: Icon,
  label,
  text,
  tone = "slate",
}: {
  icon: LucideIcon
  label: string
  text: string
  tone?: ReadinessTone
}) {
  return (
    <div className={cn("flex items-start gap-2 rounded-md border p-3", readinessToneClasses[tone])}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase opacity-70">{label}</p>
        <p className="mt-1 text-sm font-semibold leading-5">{text}</p>
      </div>
    </div>
  )
}

function EditorSummaryTile({
  label,
  value,
  tone = "slate",
}: {
  label: string
  value: string
  tone?: ReadinessTone
}) {
  return (
    <div className={cn("rounded-md border p-3", readinessToneClasses[tone])}>
      <p className="text-xs font-semibold uppercase opacity-70">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-5">{value}</p>
    </div>
  )
}

function EditorFormSection({
  children,
  description,
  title,
}: {
  children: ReactNode
  description: string
  title: string
}) {
  return (
    <section className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-semibold text-slate-950">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function ageLabel(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Date unavailable"

  const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86_400_000))
  if (days === 0) return "Updated today"
  if (days === 1) return "Updated 1 day ago"
  return `Updated ${days} days ago`
}

function isOlderThanDays(value: string, days: number) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  return Date.now() - date.getTime() > days * 86_400_000
}

function accountTypeLabel(value: string) {
  if (value === "client") return "Client / customer"
  if (value === "subcontractor") return "Subcontractor / trade pro"
  return "Contractor / service business"
}

function profileTypeLabel(value: ProfileType) {
  if (value === "client") return "Client / customer"
  if (value === "subcontractor") return "Subcontractor / trade pro"
  return "Contractor / service business"
}

function defaultSubtypeForAccount(value: AccountType) {
  if (value === "client") return "Business client"
  if (value === "subcontractor") return "Individual trade professional"
  return "Service business"
}

function normalizedCapabilities(capabilities: ProfileType[] | undefined, primary: AccountType): ProfileType[] {
  const next = new Set<ProfileType>([primary, ...(capabilities ?? [])])
  return profileTypes.filter((type) => next.has(type))
}

function CapabilityCheckbox({
  defaultChecked,
  detail,
  name,
  title,
}: {
  defaultChecked: boolean
  detail: string
  name: string
  title: string
}) {
  return (
    <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-1 size-4 rounded border-slate-300 text-blue-950"
      />
      <span>
        <span className="block text-sm font-semibold text-slate-950">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-600">{detail}</span>
      </span>
    </label>
  )
}

function LabeledInput({
  label,
  name,
  defaultValue,
  errors,
  list,
  type = "text",
}: {
  label: string
  name: string
  defaultValue: string
  errors?: Record<string, string[]>
  list?: string
  type?: string
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase text-slate-500" htmlFor={`${name}-${defaultValue}`}>
        {label}
      </label>
      <Input id={`${name}-${defaultValue}`} name={name} defaultValue={defaultValue} list={list} type={type} />
      <FieldError name={name} errors={errors} />
    </div>
  )
}

function LabeledSelect({
  label,
  name,
  defaultValue,
  errors,
  options,
  optionLabel,
}: {
  label: string
  name: string
  defaultValue?: string
  errors?: Record<string, string[]>
  options: readonly string[]
  optionLabel?: (value: string) => string
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase text-slate-500" htmlFor={`${name}-${defaultValue ?? "empty"}`}>
        {label}
      </label>
      <select
        id={`${name}-${defaultValue ?? "empty"}`}
        name={name}
        defaultValue={defaultValue ?? ""}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabel ? optionLabel(option) : option}
          </option>
        ))}
      </select>
      <FieldError name={name} errors={errors} />
    </div>
  )
}

function LabeledTextarea({
  label,
  name,
  defaultValue,
  errors,
  placeholder,
}: {
  label: string
  name: string
  defaultValue?: string
  errors?: Record<string, string[]>
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase text-slate-500" htmlFor={`${name}-${defaultValue ?? "empty"}`}>
        {label}
      </label>
      <Textarea
        id={`${name}-${defaultValue ?? "empty"}`}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="min-h-24 bg-white"
      />
      <FieldError name={name} errors={errors} />
    </div>
  )
}

function LabeledState({
  label,
  id,
  name,
  defaultValue,
  errors,
}: {
  label: string
  id: string
  name: string
  defaultValue?: string
  errors?: Record<string, string[]>
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase text-slate-500" htmlFor={id}>
        {label}
      </label>
      <StateSelect id={id} name={name} defaultValue={defaultValue} />
      <FieldError name={name} errors={errors} />
    </div>
  )
}
