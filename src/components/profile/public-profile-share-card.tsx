"use client"

import Link from "next/link"
import { Check, Copy, ExternalLink, Share2 } from "lucide-react"
import { useState } from "react"

import { RiskBadge } from "@/components/client/risk-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { RiskLevel } from "@/lib/types"

interface PublicProfileShareCardProps {
  name: string
  location: string
  profileUrl: string
  imageUrl: string
  score: number
  riskLevel: RiskLevel
  reportCount: number
}

export function PublicProfileShareCard({
  name,
  location,
  profileUrl,
  imageUrl,
  score,
  riskLevel,
  reportCount,
}: PublicProfileShareCardProps) {
  const [copied, setCopied] = useState(false)

  async function copyProfileUrl() {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Shareable profile card</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">Send this public profile</h2>
        </div>
        <Share2 className="size-5 text-amber-700" aria-hidden="true" />
      </div>

      <div className="mt-4 overflow-hidden rounded-md border border-slate-200 bg-slate-950 text-white">
        <div className="border-b border-white/10 bg-white/5 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold">Client Bureau</span>
            <Badge className="rounded-md bg-amber-500 text-slate-950">Public profile</Badge>
          </div>
        </div>
        <div className="space-y-4 p-4">
          <div>
            <p className="text-2xl font-semibold">{name}</p>
            <p className="mt-1 text-sm text-slate-300">{location}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-md bg-white/10 p-3">
              <p className="text-2xl font-semibold">{score}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase text-slate-300">score</p>
            </div>
            <div className="rounded-md bg-white/10 p-3">
              <p className="text-2xl font-semibold">{reportCount}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase text-slate-300">reports</p>
            </div>
            <div className="rounded-md bg-white/10 p-3">
              <p className="text-2xl font-semibold">{riskLevel}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase text-slate-300">risk</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-md bg-white p-3">
            <RiskBadge riskLevel={riskLevel} />
            <span className="text-xs font-semibold text-slate-500">Moderated summaries only</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <Button type="button" onClick={copyProfileUrl} className="bg-slate-950 text-white hover:bg-slate-800">
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {copied ? "Copied profile link" : "Copy profile link"}
        </Button>
        <Button asChild variant="outline">
          <Link href={imageUrl} target="_blank" rel="noreferrer">
            <ExternalLink aria-hidden="true" />
            Open share image
          </Link>
        </Button>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        Share only the public Client Bureau profile link. Private identifiers, raw evidence, and internal
        moderation notes are never included on this card.
      </p>
    </section>
  )
}
