"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { FilePlus2, LayoutDashboard, LogIn, LogOut, Menu, Search, UserCircle } from "lucide-react"

import { BrandMark } from "@/components/brand/brand-mark"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

const navItems = [
  { href: "/search", label: "Search" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

type SessionState = {
  authenticated: boolean
  role: "contractor" | "admin" | null
  email: string | null
}

export function SiteHeader() {
  const [session, setSession] = useState<SessionState>({
    authenticated: false,
    role: null,
    email: null,
  })

  useEffect(() => {
    let active = true

    fetch("/api/session", { credentials: "include" })
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
  }, [])

  const authNav = session.authenticated
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/search", label: "Search" },
        { href: "/submit-report", label: "Submit report" },
      ]
    : navItems

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="bureau-container flex min-h-16 items-center justify-between gap-4">
        <BrandMark />
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
          {authNav.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-slate-950">
              {item.label}
            </Link>
          ))}
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
                    className="rounded-md border border-slate-200 px-3 py-3 text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    {item.label}
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
                    className="rounded-md border border-slate-200 px-3 py-3 text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    Logout
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="rounded-md border border-slate-200 px-3 py-3 text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="rounded-md border border-slate-950 bg-slate-950 px-3 py-3 text-white transition hover:bg-slate-800"
                    >
                      Create account
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
              <Button variant="outline" size="sm" asChild className="hidden md:inline-flex">
                <Link href="/dashboard">
                  <LayoutDashboard aria-hidden="true" />
                  Dashboard
                </Link>
              </Button>
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
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/search">Search clients</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/submit-report">Submit report</Link>
                  </DropdownMenuItem>
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
              <Button variant="outline" size="sm" asChild className="hidden md:inline-flex">
                <Link href="/search">
                  <Search aria-hidden="true" />
                  Search clients
                </Link>
              </Button>
              <Button size="sm" asChild className="bg-slate-950 text-white hover:bg-slate-800">
                <Link href="/signup">
                  <FilePlus2 aria-hidden="true" />
                  Create account
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
