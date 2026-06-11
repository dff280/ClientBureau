"use client"

import Link from "next/link"
import { Check, Copy, ExternalLink, Share2 } from "lucide-react"
import { useState, useTransition } from "react"

import { RiskBadge } from "@/components/client/risk-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { recordProfileShareAction } from "@/lib/actions/client-bureau"
import type { ActionResult, ProfileShareEvent, RiskLevel } from "@/lib/types"

interface PublicProfileShareCardProps {
  name: string
  location: string
  profileUrl: string
  profileSlug: string
  imageUrl: string
  score: number
  riskLevel: RiskLevel
  reportCount: number
}

export function PublicProfileShareCard({
  name,
  location,
  profileUrl,
  profileSlug,
  imageUrl,
  score,
  riskLevel,
  reportCount,
}: PublicProfileShareCardProps) {
  const [copied, setCopied] = useState(false)
  const [badgeCopied, setBadgeCopied] = useState(false)
  const [shareMessage, setShareMessage] = useState("")
  const [, startShareTransition] = useTransition()

  function recordShare(channel: ProfileShareEvent["channel"]) {
    const formData = new FormData()
    formData.set("profileSlug", profileSlug)
    formData.set("channel", channel)
    formData.set("source", "profile_page")

    startShareTransition(() => {
      void recordProfileShareAction(profileShareInitialState, formData).catch(() => undefined)
    })
  }

  async function copyProfileUrl() {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      setShareMessage("Profile link copied.")
      recordShare("copy_link")
      window.setTimeout(() => setCopied(false), 2200)
      window.setTimeout(() => setShareMessage(""), 2600)
    } catch {
      setCopied(false)
      setShareMessage("Copy failed. You can still copy the URL from your browser.")
    }
  }

  async function copyBadgeSnippet() {
    const snippet = `<a href="${profileUrl}" rel="noopener" target="_blank">View this Client Bureau public profile</a>`

    try {
      await navigator.clipboard.writeText(snippet)
      setBadgeCopied(true)
      setShareMessage("Branded badge link copied.")
      recordShare("referral_badge")
      window.setTimeout(() => setBadgeCopied(false), 2200)
      window.setTimeout(() => setShareMessage(""), 2600)
    } catch {
      setBadgeCopied(false)
      setShareMessage("Badge copy failed. Please try again.")
    }
  }

  async function shareProfile() {
    const shareText = `${name} in ${location}: Client Bureau public profile with moderated summaries and private-evidence safeguards.`

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${name} Client Bureau public profile`,
          text: shareText,
          url: profileUrl,
        })
        recordShare("social")
        setShareMessage("Share sheet opened.")
        window.setTimeout(() => setShareMessage(""), 2600)
        return
      }

      await navigator.clipboard.writeText(`${shareText}\n${profileUrl}`)
      recordShare("copy_link")
      setCopied(true)
      setShareMessage("Share text copied.")
      window.setTimeout(() => setCopied(false), 2200)
      window.setTimeout(() => setShareMessage(""), 2600)
    } catch {
      setShareMessage("Share was not completed. The public profile link is still available below.")
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
              <p className="mt-1 text-[11px] font-semibold uppercase text-slate-300">rating</p>
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
        <Button type="button" onClick={shareProfile} className="bg-amber-500 text-slate-950 hover:bg-amber-400">
          <Share2 aria-hidden="true" />
          Share profile
        </Button>
        <Button type="button" onClick={copyProfileUrl} className="bg-slate-950 text-white hover:bg-slate-800">
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {copied ? "Copied profile link" : "Copy profile link"}
        </Button>
        <Button asChild variant="outline">
          <Link href={imageUrl} target="_blank" rel="noreferrer" onClick={() => recordShare("profile_card")}>
            <ExternalLink aria-hidden="true" />
            Open share image
          </Link>
        </Button>
        <Button type="button" variant="outline" onClick={copyBadgeSnippet}>
          {badgeCopied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {badgeCopied ? "Badge link copied" : "Copy branded badge link"}
        </Button>
      </div>
      {shareMessage ? (
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950" aria-live="polite">
          {shareMessage}
        </p>
      ) : null}
      <p className="mt-3 text-xs leading-5 text-slate-500">
        Share only the public Client Bureau profile link or branded badge link. Private identifiers,
        raw evidence, pending content, rejected content, and internal moderation notes are never included.
      </p>
    </section>
  )
}

const profileShareInitialState: ActionResult<ProfileShareEvent> = { ok: false, message: "" }
