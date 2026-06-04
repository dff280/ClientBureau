"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import {
  ClipboardCheck,
  History,
  LogOut,
  MessageSquareText,
  PhoneCall,
  Settings,
  ShieldCheck,
  Signature,
  UploadCloud,
  UserRound,
  UsersRound,
} from "lucide-react"

import { AdminActionTokenProvider } from "@/components/admin/admin-action-token-context"
import { BrandMark } from "@/components/brand/brand-mark"
import { Button } from "@/components/ui/button"
import { adminNavigationGroups } from "@/lib/navigation"
import { cn } from "@/lib/utils"

const adminIcons = {
  "/admin": ShieldCheck,
  "/admin/reports": ClipboardCheck,
  "/admin/clients": UserRound,
  "/admin/contractors": UsersRound,
  "/admin/discussions": MessageSquareText,
  "/admin/uploads": UploadCloud,
  "/admin?workspace=recovery": PhoneCall,
  "/admin?workspace=contracts": Signature,
  "/admin/audit-log": History,
  "/admin/settings": Settings,
}

const adminNav = adminNavigationGroups.flatMap((group) => group.links)

export function AdminAppShell({
  adminName,
  adminActionToken,
  children,
}: {
  adminName: string
  adminActionToken: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isActiveAdminLink = (href: string) => {
    const [hrefPath, hrefQuery] = href.split("?")

    if (hrefPath !== pathname) return false
    if (!hrefQuery) return pathname !== "/admin" || !searchParams.get("workspace")

    const params = new URLSearchParams(hrefQuery)
    const workspace = params.get("workspace")

    return workspace ? searchParams.get("workspace") === workspace : true
  }

  return (
    <AdminActionTokenProvider token={adminActionToken}>
      <div className="min-h-screen bg-slate-950 text-white">
        <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-white/10 bg-slate-950 lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 p-5">
            <div className="rounded-md bg-white p-3 text-slate-950">
              <BrandMark />
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs font-semibold uppercase text-amber-300">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Admin operations
            </div>
          </div>

          <nav className="flex-1 space-y-5 p-4">
            {adminNavigationGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <p className="px-3 text-xs font-semibold uppercase text-slate-500">{group.title}</p>
                {group.links.map((item) => {
                  const Icon = adminIcons[item.href as keyof typeof adminIcons] ?? ShieldCheck
                  const isActive = isActiveAdminLink(item.href)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={false}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white",
                        isActive && "bg-white text-slate-950 hover:bg-white hover:text-slate-950",
                      )}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      <span className="grid gap-0.5">
                        <span>{item.label}</span>
                        {item.description ? (
                          <span className={cn("text-xs font-normal leading-4", isActive ? "text-slate-600" : "text-slate-500")}>
                            {item.description}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  )
                })}
              </div>
            ))}
          </nav>

          <div className="space-y-3 border-t border-white/10 p-4">
            <div className="rounded-md border border-white/10 bg-white/5 p-3">
              <p className="text-xs font-semibold uppercase text-slate-400">Signed in</p>
              <p className="mt-1 text-sm font-semibold text-white">{adminName}</p>
            </div>
            <div className="grid gap-2">
              <Button asChild variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                <Link href="/admin/reports" prefetch={false}>
                  <ClipboardCheck aria-hidden="true" />
                  Review reports
                </Link>
              </Button>
              <Button asChild variant="ghost" className="justify-start text-slate-300 hover:bg-white/10 hover:text-white">
                <Link href="/api/auth/logout">
                  <LogOut aria-hidden="true" />
                  Logout
                </Link>
              </Button>
            </div>
          </div>
        </div>
        </aside>

        <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="rounded-md bg-white px-3 py-2 text-slate-950">
              <BrandMark />
            </div>
            <Button asChild size="sm" variant="outline" className="border-white/20 bg-transparent text-white">
              <Link href="/api/auth/logout">
                <LogOut aria-hidden="true" />
                Logout
              </Link>
            </Button>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={cn(
                  "rounded-md border border-white/10 px-3 py-2 text-sm font-medium text-slate-300",
                  isActiveAdminLink(item.href) && "bg-white text-slate-950",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

          <div className="min-h-screen bg-slate-100 text-slate-950">{children}</div>
        </div>
      </div>
    </AdminActionTokenProvider>
  )
}
