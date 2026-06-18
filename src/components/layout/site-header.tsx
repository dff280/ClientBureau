"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { BookOpen, BriefcaseBusiness, ChevronDown, Database, FilePlus2, LogIn, LogOut, Menu, Search, UserCircle, Wrench } from "lucide-react"

import { BrandMark } from "@/components/brand/brand-mark"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { contractorDashboardGroups, contractorPrimaryNav, publicPrimaryNav } from "@/lib/navigation"
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
  SheetDescription,
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
  { href: "/dashboard/jobs", label: "Jobs", description: "Private project files, site details, scope, and participants." },
  { href: "/submit-report", label: "Report Experience", description: "Document a client experience for moderation." },
  { href: "/dashboard/contracts", label: "Contracts", description: "Agreement packets and signing links." },
]

const publicHeaderNav = [
  { href: "/search", label: "Run Client Check" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/resources", label: "Resources" },
]

const publicDatabaseHeaderNav = [
  {
    href: "/clients",
    label: "Client Database",
    description: "Check clients, homeowners, property owners, and customers before work begins.",
    icon: Search,
  },
  {
    href: "/profiles/contractor",
    label: "Contractor Database",
    description: "Review contractor and service-business verification, service area, and public context.",
    icon: BriefcaseBusiness,
  },
  {
    href: "/profiles/subcontractor",
    label: "Subcontractor Database",
    description: "Inspect trade partner, crew, scope, and payment-chain context.",
    icon: Wrench,
  },
]

const publicHeaderMenus = [
  {
    label: "More",
    icon: BookOpen,
    items: [
      { href: "/submit-report", label: "Report a Client Experience", description: "Document a real client experience for moderation." },
      { href: "/platform", label: "Platform Overview", description: "Client checks, jobs, contracts, evidence, and services in one workflow." },
      { href: "/reports/recent", label: "Recent Reports", description: "Newly approved public report summaries." },
      { href: "/contractor-contract-template", label: "Contracts", description: "Agreement packets and e-signature workflow." },
      { href: "/florida-contractor-agreement-template", label: "Florida Agreement Starter", description: "Florida-aware starter packet for scope, payment terms, and review prompts." },
      { href: "/change-order-template", label: "Change Orders", description: "Document changed scope, cost, schedule, and approval." },
      { href: "/client-screening-for-contractors", label: "Client Screening", description: "Check client context before accepting work." },
      { href: "/payment-recovery-service", label: "Payment Recovery", description: "Managed Resolution Desk service overview." },
      { href: "/florida-lien-notice-service", label: "Florida Notices", description: "Notice packet workflow for Florida cases." },
      { href: "/florida-lien-filing-service", label: "Florida Lien Filing", description: "Filing review, vendor routing, and recording proof." },
      { href: "/homeowner-wont-pay-contractor", label: "Unpaid Invoice Guide", description: "Private documentation steps when payment stalls." },
      { href: "/mobile-app", label: "Android App", description: "Native mobile workspace for contractors." },
      { href: "/score-methodology", label: "Client Rating Methodology", description: "How ratings and risk context are shown." },
      { href: "/business-rating-methodology", label: "Business & Trade Ratings", description: "Contractor and subcontractor profile scoring." },
      { href: "/about", label: "About", description: "Why Client Bureau exists." },
      { href: "/contact", label: "Contact", description: "Support, policy, and service questions." },
    ],
  },
]

function isActiveHref(pathname: string | null, href: string) {
  if (!pathname) return false
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

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

  const promotedContractorHrefs = new Set(contractorHeaderNav.map((item) => item.href))
  const desktopNav = session.authenticated ? contractorHeaderNav : publicHeaderNav
  const moreNav = session.authenticated
    ? contractorPrimaryNav.filter((item) => !promotedContractorHrefs.has(item.href))
    : []

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/92 shadow-sm shadow-slate-950/[0.03] backdrop-blur">
      <div className="bureau-container flex min-h-16 items-center justify-between gap-2 sm:gap-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <BrandMark />
          <span className="hidden max-w-52 text-xs font-semibold leading-5 text-slate-500 xl:inline">
            {corePositioning}
          </span>
        </div>
        <nav className="hidden items-center gap-4 text-sm font-medium text-slate-600 lg:flex">
          {desktopNav.map((item) => {
            const active = isActiveHref(pathname, item.href)

            return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "rounded-md bg-slate-950 px-2 py-1 text-white shadow-sm transition hover:bg-slate-800"
                  : "rounded-md px-2 py-1 transition hover:bg-slate-100 hover:text-slate-950"
              }
            >
              {item.label}
            </Link>
            )
          })}
          {!session.authenticated ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={
                    publicDatabaseHeaderNav.some((item) => isActiveHref(pathname, item.href)) || isActiveHref(pathname, "/profiles")
                      ? "inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-amber-900 ring-1 ring-amber-200 transition hover:bg-amber-100"
                      : "inline-flex items-center gap-1 rounded-md px-2 py-1 transition hover:bg-slate-100 hover:text-slate-950"
                  }
                >
                  Databases
                  <ChevronDown className="size-4" aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <Database className="size-4 text-amber-700" aria-hidden="true" />
                    Three public databases
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {publicDatabaseHeaderNav.map((item) => {
                    const Icon = item.icon

                    return (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href}>
                          <span className="flex gap-3">
                            <Icon className="mt-0.5 size-4 shrink-0 text-amber-700" aria-hidden="true" />
                            <span className="grid gap-0.5">
                              <span>{item.label}</span>
                              <span className="text-xs font-normal text-slate-500">{item.description}</span>
                            </span>
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    )
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profiles">
                      <span className="grid gap-0.5">
                        <span>All Public Databases</span>
                        <span className="text-xs font-normal text-slate-500">See the full profile graph across all record types.</span>
                      </span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {publicHeaderMenus.map((menu) => {
                const Icon = menu.icon
                const menuActive = menu.items.some((item) => isActiveHref(pathname, item.href))

                return (
                  <DropdownMenu key={menu.label}>
                    <DropdownMenuTrigger
                      className={
                        menuActive
                          ? "inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-amber-900 ring-1 ring-amber-200 transition hover:bg-amber-100"
                          : "inline-flex items-center gap-1 rounded-md px-2 py-1 transition hover:bg-slate-100 hover:text-slate-950"
                      }
                    >
                      {menu.label}
                      <ChevronDown className="size-4" aria-hidden="true" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <DropdownMenuLabel className="flex items-center gap-2">
                        <Icon className="size-4 text-amber-700" aria-hidden="true" />
                        {menu.label}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {menu.items.map((item) => (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link href={item.href}>
                            <span className="grid gap-0.5">
                              <span>{item.label}</span>
                              <span className="text-xs font-normal text-slate-500">{item.description}</span>
                            </span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              })}
            </>
          ) : null}
          {moreNav.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={
                  moreNav.some((item) => isActiveHref(pathname, item.href))
                    ? "inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-amber-900 ring-1 ring-amber-200 transition hover:bg-amber-100"
                    : "inline-flex items-center gap-1 transition hover:text-slate-950"
                }
              >
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
            <SheetContent side="left" className="mobile-safe-bottom w-[min(22rem,calc(100vw-1.5rem))] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>
                  <BrandMark />
                </SheetTitle>
                <SheetDescription>
                  Navigate Client Bureau tools, public records, services, and account actions.
                </SheetDescription>
              </SheetHeader>
              {!session.authenticated ? (
                <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-slate-950 text-amber-300">
                      <Search className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-semibold text-slate-950">Start with a client check.</p>
                      <p className="mt-1 text-xs leading-5 text-slate-700">
                        Check the client, then decide whether to contract, watch, report, or open a private service workflow.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
              <nav className="mt-5 grid gap-4 text-sm font-medium">
                {session.authenticated ? (
                  <>
                    {contractorDashboardGroups.map((group) => (
                      <div key={group.title} className="grid gap-2">
                        <p className="px-1 text-xs font-semibold uppercase text-amber-700">{group.title}</p>
                        {group.links.map((item) => (
                          <MobileNavLink key={`${group.title}-${item.href}-${item.label}`} item={item} active={isActiveHref(pathname, item.href)} />
                        ))}
                      </div>
                    ))}
                    {session.role === "admin" ? (
                      <div className="grid gap-2">
                        <p className="px-1 text-xs font-semibold uppercase text-amber-700">Admin</p>
                        <MobileNavLink
                          item={{
                            href: "/admin",
                            label: "Admin Command Center",
                            description: "Review reports, profiles, discussions, recovery, contracts, and audit activity.",
                          }}
                          active={isActiveHref(pathname, "/admin")}
                        />
                      </div>
                    ) : null}
                  </>
                ) : (
                  <>
                    <div className="grid gap-2">
                      <p className="px-1 text-xs font-semibold uppercase text-amber-700">Start</p>
                      {publicPrimaryNav.map((item) => (
                        <MobileNavLink key={item.href} item={item} active={isActiveHref(pathname, item.href)} />
                      ))}
                    </div>
                    <div className="grid gap-2">
                      <p className="px-1 text-xs font-semibold uppercase text-amber-700">Databases</p>
                      {publicDatabaseHeaderNav.map((item) => (
                        <MobileNavLink key={item.href} item={item} active={isActiveHref(pathname, item.href)} />
                      ))}
                    </div>
                    {publicHeaderMenus.map((group) => (
                      <div key={group.label} className="grid gap-2">
                        <p className="px-1 text-xs font-semibold uppercase text-amber-700">{group.label}</p>
                        {group.items.map((item) => (
                          <MobileNavLink key={`${group.label}-${item.href}`} item={item} active={isActiveHref(pathname, item.href)} />
                        ))}
                      </div>
                    ))}
                  </>
                )}
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
                    className="touch-target rounded-md border border-slate-200 bg-white px-3 py-3 text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    Logout
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="touch-target rounded-md border border-slate-200 bg-white px-3 py-3 text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-950"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="touch-target rounded-md border border-slate-950 bg-slate-950 px-3 py-3 text-white shadow-sm transition hover:bg-slate-800"
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
                Account active
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="bg-slate-950 text-white hover:bg-slate-800">
                    <UserCircle aria-hidden="true" />
                    <span className="hidden sm:inline">Account</span>
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
              <Button size="sm" asChild className="hidden bg-slate-950 text-white hover:bg-slate-800 sm:inline-flex">
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

function MobileNavLink({
  active = false,
  item,
}: {
  active?: boolean
  item: {
    description?: string
    href: string
    label: string
  }
}) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "touch-target rounded-md border border-amber-300 bg-amber-50 px-3 py-3 text-amber-950 shadow-sm ring-1 ring-amber-200 transition hover:bg-amber-100"
          : "touch-target rounded-md border border-slate-200 bg-white px-3 py-3 text-slate-700 shadow-sm transition hover:border-amber-300 hover:bg-slate-50 hover:text-slate-950"
      }
    >
      <span className="font-semibold">{item.label}</span>
      {item.description ? (
        <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">
          {item.description}
        </span>
      ) : null}
    </Link>
  )
}
