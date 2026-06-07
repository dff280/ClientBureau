"use client"

import { useActionState, useEffect, useMemo, useState } from "react"
import { CheckCircle2, FileSpreadsheet, UploadCloud } from "lucide-react"
import { toast } from "sonner"

import { AdminActionTokenInput } from "@/components/admin/admin-action-token-context"
import { PendingSubmitButton } from "@/components/forms/pending-submit-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { bulkUploadImportAction } from "@/lib/actions/client-bureau"
import { isValidStateCode, normalizeStateCode } from "@/lib/locations"
import type { ActionResult, BulkUploadPreviewRow } from "@/lib/types"

const initialState: ActionResult<{ imported: number }> = { ok: false, message: "" }

const sampleCsv = `client name,city,state,report type,amount,date,summary,status,notes
John Smith,Orlando,FL,Non-payment,4200,2026-05-30,Final invoice remains partially unpaid,pending,invoice on file`

export function BulkUploadPanel() {
  const [csv, setCsv] = useState(sampleCsv)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [state, action] = useActionState(bulkUploadImportAction, initialState)
  const rows = useMemo(() => parseCsv(csv), [csv])
  const validRows = rows.filter((row) => row.errors.length === 0 && !row.duplicate)
  const selected = rows.filter((row) => selectedRows.includes(row.rowNumber))

  useEffect(() => {
    if (state.message) toast[state.ok ? "success" : "error"](state.message)
  }, [state])

  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <section className="min-w-0 rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <UploadCloud className="size-5 text-amber-700" aria-hidden="true" />
          <h2 className="font-semibold text-slate-950">CSV intake</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Paste CSV rows, preview validation, select safe rows, then import as pending records.
        </p>
        <Textarea value={csv} onChange={(event) => setCsv(event.target.value)} className="mt-4 min-h-72 font-mono text-xs" />
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <Stat label="Rows" value={rows.length} />
          <Stat label="Valid" value={validRows.length} />
          <Stat label="Selected" value={selected.length} />
        </div>
      </section>

      <section className="min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-semibold text-slate-950">Preview rows</h2>
              <p className="mt-1 text-xs text-slate-500">Duplicates and invalid rows are blocked from import.</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedRows(validRows.map((row) => row.rowNumber))}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              Select ready rows
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
          {state.message ? (
            <Alert className="mt-4 rounded-md border-emerald-200 bg-emerald-50 text-emerald-950">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              <AlertTitle>{state.ok ? "Import accepted" : "Import needs attention"}</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}
        </div>
        <div className="max-w-full overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-3">Import</th>
                <th className="p-3">Client</th>
                <th className="p-3">Location</th>
                <th className="p-3">Type</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Validation</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const disabled = row.errors.length > 0 || row.duplicate
                return (
                  <tr key={row.rowNumber} className="border-b border-slate-100">
                    <td className="p-3">
                      <input
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
                    <td className="p-3 font-semibold text-slate-950">{row.clientName}</td>
                    <td className="p-3 text-slate-600">{row.city}, {row.state}</td>
                    <td className="p-3 text-slate-600">{row.reportType}</td>
                    <td className="p-3 text-slate-600">${row.amount.toLocaleString()}</td>
                    <td className="p-3 text-slate-600">{row.status || "pending"}</td>
                    <td className="p-3 text-xs">
                      {row.duplicate ? <span className="font-semibold text-amber-700">Duplicate</span> : null}
                      {row.errors.length > 0 ? <span className="font-semibold text-rose-700">{row.errors.join(", ")}</span> : null}
                      {!row.duplicate && row.errors.length === 0 ? <span className="font-semibold text-emerald-700">Ready</span> : null}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
    </div>
  )
}

function parseCsv(input: string): BulkUploadPreviewRow[] {
  const lines = input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const rows = lines.slice(1)
  const seen = new Set<string>()

  return rows.map((line, index) => {
    const columns = line.split(",").map((item) => item.trim())
    const [clientName, city, state, reportType, amount, date, summary, status, notes] = columns
    const stateCode = normalizeStateCode(state ?? "")
    const errors = [
      !clientName ? "client name required" : "",
      !city ? "city required" : "",
      !stateCode ? "state required" : "",
      stateCode && !isValidStateCode(stateCode) ? "state must be a valid 2-letter code" : "",
      !reportType ? "report type required" : "",
      Number.isNaN(Number(amount)) ? "amount must be numeric" : "",
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
      amount: Number(amount || 0),
      date: date ?? "",
      summary: summary ?? "",
      status: status || "pending",
      notes,
      errors,
      duplicate,
    }
  })
}
