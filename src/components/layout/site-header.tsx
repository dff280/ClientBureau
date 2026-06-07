"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { ChevronDown, FilePlus2, LogIn, LogOut, Menu, UserCircle } from "lucide-react"

import { BrandMark } from "@/components/brand/brand-mark"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { contractorPrimaryNav, publicPrimaryNav } from "@/lib/navigation"
import { corePositioning } from "@/lib/product-positioning"
import { publicSocialLinks } from "@/lib/public-site"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type SessionState = {
  authenticated: boolean
  role: "contractor" | "admin" | null
  email: string | null
}

const contractorHeaderNav = [
  { href: "/dashboard", label: "Dashboard", description: "Daily work queue and business tools." },
  { href: "/search", label: "Check a Client", description: "Check a client before accepting work." },
  { href: "/submit-report", label: "Report Experience", description: "Document a client experience for moderation." },
  { href: "/dashboard/contracts", label: "Contracts", description: "Agreement packets and signing links." },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [session, setSession] = useState<SessionState>({
    authenticated: false,
    role: null,
    email: null,
  })

  useEffect(() => {
    let active = true

    fetch("/api/session", { cache: "no-store", credentials: "include" })
      .then((response) => (response.ok ? response.json() : undefined))
      .then((data: Partial<SessionState> | undefined) => {
        if (!active || !data) return
        setSession({
          authenticated: Boolean(data.authenticated),
          role: data.role ?? null,
          email: data.email ?? null,
        })
      })
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [pathname])

  const authNav = session.authenticated
    ? [...contractorHeaderNav, ...contractorPrimaryNav.slice(2).filter((item) => item.label !== "Contracts")]
    : publicPrimaryNav
  const desktopNav = session.authenticated ? contractorHeaderNav : publicPrimaryNav
  const moreNav = session.authenticated ? contractorPrimaryNav.slice(3).filter((item) => item.label !== "Contracts") : []

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/92 shadow-sm shadow-slate-950/[0.03] backdrop-blur">
      <div className="bureau-container flex min-h-16 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <BrandMark />
          <span className="hidden max-w-52 text-xs font-semibold leading-5 text-slate-500 xl:inline">
            {corePositioning}
          </span>
        </div>
        <nav className="hidden items-center gap-4 text-sm font-medium text-slate-600 lg:flex">
          {desktopNav.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-md px-2 py-1 transition hover:bg-slate-100 hover:text-slate-950">
              {item.label}
            </Link>
          ))}
          {moreNav.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1 transition hover:text-slate-950">
                Tools
                <ChevronDown className="size-4" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Contractor tools</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {moreNav.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href}>
                      <span className="grid gap-0.5">
                        <span>{item.label}</span>
                        {item.description ? (
                          <span className="text-xs font-normal text-slate-500">{item.description}</span>
                        ) : null}
                      </span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </nav>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open navigation">
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>
                  <BrandMark />
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-8 grid gap-2 text-sm font-medium">
                {authNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md border border-slate-200 bg-white px-3 py-3 text-slate-700 shadow-sm transition hover:border-amber-300 hover:bg-slate-50 hover:text-slate-950"
                  >
                    <span className="font-semibold">{item.label}</span>
                    {item.description ? (
                      <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">
                        {item.description}
                      </span>
                    ) : null}
                  </Link>
                ))}
                {publicSocialLinks.length > 0 ? (
                  <div className="mt-3 border-t border-slate-200 pt-3">
                    <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Social</p>
                    <div className="grid gap-2">
                      {publicSocialLinks.map((link) => (
                        <a
                          key={link.label}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-md border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
                {session.authenticated ? (
                  <Link
                    href="/api/auth/logout"
                    className="rounded-md border border-slate-200 bg-white px-3 py-3 text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    Logout
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="rounded-md border border-slate-200 bg-white px-3 py-3 text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-950"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="rounded-md border border-slate-950 bg-slate-950 px-3 py-3 text-white shadow-sm transition hover:bg-slate-800"
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          {session.authenticated ? (
            <>
              <Badge variant="outline" className="hidden rounded-md border-amber-200 bg-amber-50 text-amber-900 md:inline-flex">
                Free plan
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="bg-slate-950 text-white hover:bg-slate-800">
                    <UserCircle aria-hidden="true" />
                    Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{session.email ?? "Contractor account"}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Overview</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/submit-report">Report a Client Experience</Link>
                  </DropdownMenuItem>
                  {contractorPrimaryNav.slice(1).filter((item) => item.label !== "Reports").map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </DropdownMenuItem>
                  ))}
                  {session.role === "admin" ? (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin</Link>
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/api/auth/logout">
                      <LogOut aria-hidden="true" />
                      Logout
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/login">
                  <LogIn aria-hidden="true" />
                  Login
                </Link>
              </Button>
              <Button size="sm" asChild className="bg-slate-950 text-white hover:bg-slate-800">
                <Link href="/signup">
                  <FilePlus2 aria-hidden="true" />
                  Create Account
                </Link>
              </Button>
              {publicSocialLinks.length > 0 ? (
                <div className="hidden items-center gap-1 xl:flex">
                  {publicSocialLinks.slice(0, 3).map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md px-2 py-1 text-xs font-semibold text-slate-500 hover:text-slate-950"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
