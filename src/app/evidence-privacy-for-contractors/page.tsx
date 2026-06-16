import type { Metadata } from "next"

import { AcquisitionPageView } from "@/components/landing/acquisition-page-view"
import { getAcquisitionPage } from "@/lib/acquisition-pages"

const page = getAcquisitionPage("evidence-privacy-for-contractors")

export const metadata: Metadata = {
  title: page?.title,
  description: page?.description,
  alternates: {
    canonical: "/evidence-privacy-for-contractors",
  },
}

export default function EvidencePrivacyForContractorsPage() {
  if (!page) return null

  return <AcquisitionPageView page={page} />
}
