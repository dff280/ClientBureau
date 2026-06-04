import Link from "next/link"

import { BrandMark } from "@/components/brand/brand-mark"
import { footerNavigationGroups } from "@/lib/navigation"
import { getPublicContactInfo, getPublicSocialLinks } from "@/lib/env"
import { corePositioning } from "@/lib/product-positioning"

export function SiteFooter() {
  const socialLinks = getPublicSocialLinks()
  const contact = getPublicContactInfo()
  const hasAddress = contact.street && contact.city && contact.state

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="bureau-container grid gap-8 py-10 lg:grid-cols-[1.1fr_1.8fr_0.8fr]">
        <div className="space-y-4">
          <BrandMark />
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            {corePositioning} Client Bureau combines client risk intelligence, moderated public
            reports, contract workflows, evidence records, payment tracking, and response paths.
          </p>
          {socialLinks.length > 0 ? (
            <div className="flex flex-wrap gap-2 text-sm">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-slate-200 px-3 py-1.5 font-medium text-slate-600 hover:border-amber-300 hover:text-slate-950"
                >
                  {link.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
        <div className="grid gap-6 text-sm sm:grid-cols-2 xl:grid-cols-5">
          {footerNavigationGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              <p className="text-xs font-semibold uppercase text-slate-500">{group.title}</p>
              <div className="grid gap-2">
                {group.links.map((link) => (
                  <Link key={link.href} href={link.href} className="text-slate-600 hover:text-slate-950">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-3 text-sm leading-6 text-slate-600">
          <p className="font-semibold text-slate-950">Client Bureau</p>
          {contact.phone ? <p>{contact.phone}</p> : null}
          {hasAddress ? (
            <address className="not-italic">
              {contact.street}
              <br />
              {contact.city}, {contact.state} {contact.zip}
            </address>
          ) : (
            <p>Public contact details are published when verified business information is configured.</p>
          )}
        </div>
      </div>
      <div className="border-t border-slate-200 py-4">
        <div className="bureau-container flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Copyright 2026 Client Bureau. All rights reserved.</span>
          <span>Public reports are moderated and presented as reported experiences.</span>
        </div>
      </div>
    </footer>
  )
}
