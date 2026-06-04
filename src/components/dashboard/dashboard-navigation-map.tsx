import Link from "next/link"
import {
  AlertTriangle,
  BellRing,
  ClipboardCheck,
  CreditCard,
  FilePlus2,
  Landmark,
  LayoutDashboard,
  PhoneCall,
  Search,
  Signature,
  Vault,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { contractorDashboardGroups } from "@/lib/navigation"

const sectionIcons = {
  Overview: LayoutDashboard,
  "Search Clients": Search,
  Reports: ClipboardCheck,
  Watchlist: AlertTriangle,
  "Contracts / Templates": Signature,
  "Payment Recovery": PhoneCall,
  "Lien Readiness": Landmark,
  "Evidence Vault": Vault,
  Alerts: BellRing,
  Billing: CreditCard,
}

export function DashboardNavigationMap() {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase text-amber-700">Dashboard navigation</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950">
            Pick the client stage you are in.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Client Bureau is organized by the contractor workflow: check the client, set the
            agreement, document the job, track payment, and preserve the right records if a
            report or response is needed.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
            <Link href="/search">
              <Search aria-hidden="true" />
              Search Clients
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/submit-report">
              <FilePlus2 aria-hidden="true" />
              Submit Report
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-4">
        {contractorDashboardGroups.map((group) => (
          <div key={group.title} className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <Badge variant="outline" className="rounded-md border-amber-200 bg-amber-50 text-amber-900">
              {group.title}
            </Badge>
            <div className="mt-4 grid gap-2">
              {group.links.map((item) => {
                const Icon = sectionIcons[item.label as keyof typeof sectionIcons] ?? LayoutDashboard

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group rounded-md border border-slate-200 bg-white p-3 transition hover:border-amber-300 hover:bg-white"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                      <Icon className="size-4 text-amber-700" aria-hidden="true" />
                      {item.label}
                    </span>
                    {item.description ? (
                      <span className="mt-1 block text-xs leading-5 text-slate-500 group-hover:text-slate-600">
                        {item.description}
                      </span>
                    ) : null}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
