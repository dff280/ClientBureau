import Link from "next/link"
import { FilePlus2, LogIn, Menu, Search } from "lucide-react"

import { BrandMark } from "@/components/brand/brand-mark"
import { Button } from "@/components/ui/button"
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
  { href: "/dashboard", label: "Dashboard" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="bureau-container flex min-h-16 items-center justify-between gap-4">
        <BrandMark />
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
          {navItems.map((item) => (
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
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md border border-slate-200 px-3 py-3 text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/login"
                  className="rounded-md border border-slate-200 px-3 py-3 text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                >
                  Login
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
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
            <Link href="/submit-report">
              <FilePlus2 aria-hidden="true" />
              Submit report
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
