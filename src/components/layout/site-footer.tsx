import Link from "next/link"

import { BrandMark } from "@/components/brand/brand-mark"

const footerLinks = [
  { href: "/search", label: "Search Clients" },
  { href: "/submit-report", label: "Submit Report" },
  { href: "/client-response", label: "Client Response" },
  { href: "/admin", label: "Admin" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/report-policy", label: "Report Policy" },
  { href: "/dispute-policy", label: "Disputes" },
  { href: "/moderation-policy", label: "Moderation" },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="bureau-container grid gap-8 py-10 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <BrandMark />
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            Know who you&apos;re working with before the job starts. Client Bureau publishes
            moderated, contractor-submitted reports with client right-of-response built in.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-slate-600 hover:text-slate-950">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="border-t border-slate-200 py-4">
        <div className="bureau-container flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Copyright 2026 Client Bureau. MVP demonstration.</span>
          <span>Public reports are moderated and presented as reported experiences.</span>
        </div>
      </div>
    </footer>
  )
}
