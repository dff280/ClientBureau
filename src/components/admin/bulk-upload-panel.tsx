"use client"

import { useActionState, useEffect, useMemo, useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  FileSpreadsheet,
  LockKeyhole,
  RotateCcw,
  SearchCheck,
  ShieldAlert,
  UploadCloud,
} from "lucide-react"
import { toast } from "sonner"

import { AdminActionTokenInput } from "@/components/admin/admin-action-token-context"
import { StatusBadge } from "@/components/dashboard/dashboard-ui"
import { PendingSubmitButton } from "@/components/forms/pending-submit-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { bulkUploadImportAction } from "@/lib/actions/client-bureau"
import { isValidStateCode, normalizeStateCode } from "@/lib/locations"
import type { ActionResult, BulkUploadPreviewRow } from "@/lib/types"

const initialState: ActionResult<{ imported: number }> = { ok: false, message: "" }

const sampleCsv = `client name,city,state,report type,amount,date,summary,status,notes
John Smith,Orlando,FL,Non-payment,4200,2026-05-30,"Final invoice remains partially unpaid",pending,"invoice on file"
Maria Gomez,Tampa,FL,Positive experience,0,2026-05-18,"Client paid on time and approved change order promptly",pending,"positive report"
John Smith,Orlando,FL,Non-payment,4200,2026-05-30,"Duplicate example row for staff review",pending,"duplicate warning"`

const requiredFields = ["client name", "city", "state", "report type", "amount", "date", "summary", "status", "notes"]

export function BulkUploadPanel() {
  const [csv, setCsv] = useState(sampleCsv)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [state, action] = useActionState(bulkUploadImportAction, initialState)
  const rows = useMemo(() => parseCsv(csv), [csv])
  const validRows = rows.filter((row) => row.errors.length === 0 && !row.duplicate)
  const duplicateRows = rows.filter((row) => row.duplicate)
  const blockedRows = rows.filter((row) => row.errors.length > 0)
  const selected = rows.filter((row) => selectedRows.includes(row.rowNumber))
  const hasRows = rows.length > 0

  useEffect(() => {
    if (state.message) toast[state.ok ? "success" : "error"](state.message)
  }, [state])

  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
      <section className="min-w-0 rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex size-11 items-center justify-center rounded-md bg-slate-950 text-amber-300 shadow-sm">
              <UploadCloud className="size-5" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-slate-950">Paste or stage CSV rows</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Validate rows before import. Every imported row becomes a private pending report that still needs admin review.
            </p>
          </div>
          <StatusBadge tone="blue">Private intake</StatusBadge>
        </div>

        <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4">
          <div className="flex gap-3">
            <SearchCheck className="mt-0.5 size-5 shrink-0 text-amber-700" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-amber-950">Required CSV fields</p>
              <p className="mt-1 text-sm leading-6 text-amber-900">
                {requiredFields.join(", ")}. State should be a valid two-letter code such as FL, GA, or TX.
              </p>
            </div>
          </div>
        </div>

        <Textarea
          aria-label="CSV rows"
          value={csv}
          onChange={(event) => {
            setCsv(event.target.value)
            setSelectedRows([])
          }}
          className="mt-4 min-h-80 font-mono text-xs leading-5"
          spellCheck={false}
        />

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCsv(sampleCsv)}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-amber-300 hover:text-slate-950"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Load sample
          </button>
          <button
            type="button"
            onClick={() => {
              setCsv("")
              setSelectedRows([])
            }}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-rose-200 hover:text-rose-700"
          >
            Clear rows
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4 xl:grid-cols-2">
          <Stat label="Rows" value={rows.length} />
          <Stat label="Ready" value={validRows.length} tone="emerald" />
          <Stat label="Duplicates" value={duplicateRows.length} tone={duplicateRows.length > 0 ? "amber" : "slate"} />
          <Stat label="Selected" value={selected.length} tone={selected.length > 0 ? "blue" : "slate"} />
        </div>
      </section>

      <section className="min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4 sm:p-5">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase text-amber-700">Review before import</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950">Preview rows</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Select only rows that are ready. Duplicate and invalid rows stay visible so staff can correct them.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={validRows.length === 0}
                onClick={() => setSelectedRows(validRows.map((row) => row.rowNumber))}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-amber-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Select ready rows
              </button>
              <button
                type="button"
                disabled={selectedRows.length === 0}
                onClick={() => setSelectedRows([])}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear selection
              </button>
              <form action={action}>
                <AdminActionTokenInput />
                <input type="hidden" name="rows" value={JSON.stringify(selected)} />
                <PendingSubmitButton
                  pendingText="Importing..."
                  disabled={selected.length === 0}
                  className="bg-slate-950 text-white hover:bg-slate-800"
                >
                  <FileSpreadsheet aria-hidden="true" />
                  Import selected
                </PendingSubmitButton>
              </form>
            </div>
          </div>
          {state.message ? (
            <Alert
              className={
                state.ok
                  ? "mt-4 rounded-md border-emerald-200 bg-emerald-50 text-emerald-950"
                  : "mt-4 rounded-md border-rose-200 bg-rose-50 text-rose-950"
              }
            >
              {state.ok ? <CheckCircle2 className="size-4" aria-hidden="true" /> : <AlertCircle className="size-4" aria-hidden="true" />}
              <AlertTitle>{state.ok ? "Import accepted" : "Import needs attention"}</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <ReadinessCard
              icon={ClipboardCheck}
              title="Ready to import"
              value={validRows.length}
              detail="Rows that can become pending report records."
              tone="emerald"
            />
            <ReadinessCard
              icon={ShieldAlert}
              title="Needs staff review"
              value={duplicateRows.length + blockedRows.length}
              detail="Duplicate warnings or validation blockers."
              tone={duplicateRows.length + blockedRows.length > 0 ? "amber" : "slate"}
            />
            <ReadinessCard
              icon={LockKeyhole}
              title="Public exposure"
              value="None"
              detail="Imported rows stay private until approved."
              tone="blue"
            />
          </div>
        </div>
        {!hasRows ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-md bg-slate-950 text-amber-300">
              <UploadCloud className="size-6" aria-hidden="true" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-950">No rows staged</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Paste CSV content to preview validation, duplicate warnings, and import readiness before creating pending records.
            </p>
          </div>
        ) : (
        <div className="max-w-full overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-3">Select</th>
                <th className="p-3">Row</th>
                <th className="p-3">Client context</th>
                <th className="p-3">Report</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Moderation status</th>
                <th className="p-3">Import decision</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const disabled = row.errors.length > 0 || row.duplicate
                const decision = getRowDecision(row)
                return (
                  <tr key={row.rowNumber} className="border-b border-slate-100 align-top">
                    <td className="p-3">
                      <input
                        aria-label={`Select row ${row.rowNumber}`}
                        type="checkbox"
                        checked={selectedRows.includes(row.rowNumber)}
                        disabled={disabled}
                        onChange={(event) =>
                          setSelectedRows((current) =>
                            event.target.checked
                              ? [...new Set([...current, row.rowNumber])]
                              : current.filter((item) => item !== row.rowNumber),
                          )
                        }
                      />
                    </td>
                    <td className="p-3 font-semibold text-slate-700">#{row.rowNumber}</td>
                    <td className="p-3">
                      <p className="font-semibold text-slate-950">{row.clientName || "Missing client name"}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {[row.city, row.state].filter(Boolean).join(", ") || "Missing location"}
                      </p>
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-slate-700">{row.reportType || "Missing report type"}</p>
                      <p className="mt-1 line-clamp-2 max-w-xs text-xs leading-5 text-slate-500">{row.summary || "Missing summary"}</p>
                    </td>
                    <td className="p-3 text-slate-600">{Number.isFinite(row.amount) ? `$${row.amount.toLocaleString()}` : "Needs amount"}</td>
                    <td className="p-3 text-slate-600">{row.status || "pending"}</td>
                    <td className="p-3 text-xs">
                      <StatusBadge tone={decision.tone}>{decision.label}</StatusBadge>
                      <p className="mt-2 max-w-xs leading-5 text-slate-500">{decision.detail}</p>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        )}
      </section>
    </div>
  )
}

function Stat({
  label,
  value,
  tone = "slate",
}: {
  label: string
  value: number
  tone?: "slate" | "amber" | "emerald" | "blue"
}) {
  const toneClass = {
    slate: "border-slate-200 bg-slate-50 text-slate-950",
    amber: "border-amber-200 bg-amber-50 text-amber-950",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-950",
    blue: "border-sky-200 bg-sky-50 text-sky-950",
  }[tone]

  return (
    <div className={`rounded-md border p-3 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase opacity-70">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  )
}

function ReadinessCard({
  icon: Icon,
  title,
  value,
  detail,
  tone,
}: {
  icon: LucideIcon
  title: string
  value: number | string
  detail: string
  tone: "slate" | "amber" | "emerald" | "blue"
}) {
  const toneClass = {
    slate: "border-slate-200 bg-slate-50 text-slate-950",
    amber: "border-amber-200 bg-amber-50 text-amber-950",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-950",
    blue: "border-sky-200 bg-sky-50 text-sky-950",
  }[tone]

  return (
    <div className={`rounded-md border p-3 ${toneClass}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase opacity-70">{title}</p>
        <Icon className="size-4" aria-hidden="true" />
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs leading-5 opacity-75">{detail}</p>
    </div>
  )
}

function getRowDecision(row: BulkUploadPreviewRow): {
  label: string
  detail: string
  tone: "slate" | "amber" | "emerald" | "rose" | "blue"
} {
  if (row.errors.length > 0) {
    return {
      label: "Blocked",
      detail: row.errors.join(", "),
      tone: "rose",
    }
  }

  if (row.duplicate) {
    return {
      label: "Duplicate review",
      detail: "Same client, location, type, amount, and date already appears in this CSV preview.",
      tone: "amber",
    }
  }

  return {
    label: "Ready",
    detail: "This row can be imported as a pending report for admin review.",
    tone: "emerald",
  }
}

function parseCsv(input: string): BulkUploadPreviewRow[] {
  const lines = input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const rows = lines.slice(1)
  const seen = new Set<string>()

  return rows.map((line, index) => {
    const columns = parseCsvLine(line)
    const [clientName, city, state, reportType, amount, date, summary, status, notes] = columns
    const stateCode = normalizeStateCode(state ?? "")
    const numericAmount = Number(amount)
    const errors = [
      !clientName ? "client name required" : "",
      !city ? "city required" : "",
      !stateCode ? "state required" : "",
      stateCode && !isValidStateCode(stateCode) ? "state must be a valid 2-letter code" : "",
      !reportType ? "report type required" : "",
      Number.isNaN(numericAmount) ? "amount must be numeric" : "",
      !summary ? "summary required" : "",
    ].filter(Boolean)
    const key = [clientName, city, state, reportType, amount, date].join("|").toLowerCase()
    const duplicate = seen.has(key)
    seen.add(key)

    return {
      rowNumber: index + 2,
      clientName: clientName ?? "",
      city: city ?? "",
      state: stateCode,
      reportType: reportType ?? "",
      amount: Number.isNaN(numericAmount) ? Number.NaN : numericAmount,
      date: date ?? "",
      summary: summary ?? "",
      status: status || "pending",
      notes,
      errors,
      duplicate,
    }
  })
}

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ""
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const next = line[index + 1]

    if (char === "\"" && inQuotes && next === "\"") {
      current += "\""
      index += 1
      continue
    }

    if (char === "\"") {
      inQuotes = !inQuotes
      continue
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim())
      current = ""
      continue
    }

    current += char
  }

  values.push(current.trim())
  return values
}
