"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { FormEvent } from "react"
import { Bug, CheckCircle2, Loader2, X } from "lucide-react"
import { usePathname, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type IssueReporterState = "idle" | "sending" | "sent" | "error"

function currentRoute(pathname: string | null, search: string) {
  const path = pathname || "/"
  return search ? `${path}?${search}` : path
}

function browserContext() {
  if (typeof window === "undefined") return {}

  return {
    browserLanguage: navigator.language,
    pageTitle: document.title,
    userAgent: navigator.userAgent,
    viewportHeight: window.innerHeight,
    viewportWidth: window.innerWidth,
  }
}

async function postIssue(payload: Record<string, unknown>) {
  const response = await fetch("/api/error-reports", {
    body: JSON.stringify(payload),
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    method: "POST",
  })

  if (!response.ok) {
    const result = await response.json().catch(() => null)
    throw new Error(result?.message || "Issue report could not be sent.")
  }
}

export function SiteIssueReporter({
  className,
  context = "workspace",
}: {
  className?: string
  context?: "admin" | "workspace"
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const search = searchParams.toString()
  const route = useMemo(() => currentRoute(pathname, search), [pathname, search])
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [notes, setNotes] = useState("")
  const [severity, setSeverity] = useState<"low" | "medium" | "high" | "critical">("medium")
  const [state, setState] = useState<IssueReporterState>("idle")
  const autoReported = useRef(new Set<string>())

  useEffect(() => {
    function sendBrowserIssue(kind: "error" | "unhandledrejection", text: string) {
      const key = `${kind}:${route}:${text.slice(0, 120)}`
      if (autoReported.current.has(key)) return
      autoReported.current.add(key)

      void postIssue({
        ...browserContext(),
        message: text || "Browser runtime issue detected.",
        metadata: { kind, surface: context },
        route,
        severity: kind === "error" ? "high" : "medium",
        source: "browser",
      }).catch(() => {
        // Keep runtime capture silent. The manual reporter remains available.
      })
    }

    const onError = (event: ErrorEvent) => {
      sendBrowserIssue("error", event.message || "Browser runtime error.")
    }
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason instanceof Error ? event.reason.message : String(event.reason || "")
      sendBrowserIssue("unhandledrejection", reason || "Unhandled browser promise rejection.")
    }

    window.addEventListener("error", onError)
    window.addEventListener("unhandledrejection", onRejection)

    return () => {
      window.removeEventListener("error", onError)
      window.removeEventListener("unhandledrejection", onRejection)
    }
  }, [context, route])

  async function submitIssue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (message.trim().length < 8) {
      setState("error")
      return
    }

    setState("sending")

    try {
      await postIssue({
        ...browserContext(),
        message,
        metadata: { surface: context },
        notes,
        route,
        severity,
        source: "browser",
      })
      setState("sent")
      setMessage("")
      setNotes("")
      setSeverity("medium")
    } catch {
      setState("error")
    }
  }

  return (
    <div className={cn("fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-2", className)}>
      {open ? (
        <form
          onSubmit={submitIssue}
          className="w-[min(24rem,calc(100vw-2rem))] rounded-md border border-slate-200 bg-white p-4 text-slate-950 shadow-2xl shadow-slate-950/20"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">Report a site issue</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">This sends route and browser context to the admin Error Log.</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
              aria-label="Close issue reporter"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-3 grid gap-3">
            <label className="grid gap-1 text-xs font-semibold uppercase text-slate-500">
              Severity
              <select
                value={severity}
                onChange={(event) => setSeverity(event.target.value as typeof severity)}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium normal-case text-slate-800 outline-none focus-visible:ring-3 focus-visible:ring-amber-200"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </label>
            <label className="grid gap-1 text-xs font-semibold uppercase text-slate-500">
              What happened?
              <input
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value)
                  if (state === "error") setState("idle")
                }}
                placeholder="Example: Search froze after I clicked Run Client Check"
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium normal-case text-slate-800 outline-none focus-visible:ring-3 focus-visible:ring-amber-200"
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold uppercase text-slate-500">
              Notes
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional steps. Do not paste passwords, evidence files, raw client contacts, or private access codes."
                className="min-h-20 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium normal-case leading-6 text-slate-800 outline-none focus-visible:ring-3 focus-visible:ring-amber-200"
              />
            </label>
          </div>

          <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-2 text-xs leading-5 text-slate-600">
            Route: <span className="font-medium text-slate-800">{route}</span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className={cn("text-xs", state === "error" ? "text-rose-700" : state === "sent" ? "text-emerald-700" : "text-slate-500")}>
              {state === "sent" ? "Sent to admin Error Log." : state === "error" ? "Add a short issue summary and try again." : "Sensitive text is redacted server-side."}
            </p>
            <Button type="submit" disabled={state === "sending"} className="bg-slate-950 text-white hover:bg-slate-800">
              {state === "sending" ? <Loader2 className="animate-spin" aria-hidden="true" /> : state === "sent" ? <CheckCircle2 aria-hidden="true" /> : <Bug aria-hidden="true" />}
              {state === "sending" ? "Sending" : "Send"}
            </Button>
          </div>
        </form>
      ) : null}

      <Button
        type="button"
        onClick={() => {
          setOpen((value) => !value)
          if (state === "sent") setState("idle")
        }}
        className={cn(
          "rounded-full bg-slate-950 px-4 text-white shadow-xl shadow-slate-950/20 hover:bg-slate-800",
          context === "admin" && "bg-amber-500 text-slate-950 hover:bg-amber-400",
        )}
      >
        <Bug aria-hidden="true" />
        Report issue
      </Button>
    </div>
  )
}
