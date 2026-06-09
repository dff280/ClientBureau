import { Share } from "react-native"

import { siteUrl } from "./config"
import type { MobileSearchResult } from "./types"

async function shareClientBureauMessage(title: string, message: string, url: string) {
  await Share.share({
    title,
    message: `${message}\n\n${url}`,
    url,
  })
}

export async function shareClientBureauApp() {
  await shareClientBureauMessage(
    "Client Bureau",
    "Check the client before you take the job. Client Bureau helps contractors search moderated client reports, private matching, contracts, recovery, lien service, and evidence workflows.",
    `${siteUrl}/mobile-app`,
  )
}

export async function inviteContractorToClientBureau() {
  await shareClientBureauMessage(
    "Invite a contractor to Client Bureau",
    "One search could save thousands. Client Bureau helps contractors check clients before committing labor, materials, scheduling, or payment follow-up.",
    `${siteUrl}/signup`,
  )
}

export async function shareClientProfile(item: MobileSearchResult) {
  await shareClientBureauMessage(
    `${item.displayName} Client Bureau profile`,
    `Client Bureau public profile for ${item.displayName} in ${item.city}, ${item.state}. Public profiles show moderated, contractor-submitted context only.`,
    `${siteUrl}/client/${item.publicSlug}`,
  )
}
