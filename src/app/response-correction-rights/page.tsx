import type { Metadata } from "next"

import { AcquisitionPageView } from "@/components/landing/acquisition-page-view"
import { getAcquisitionPage } from "@/lib/acquisition-pages"

const page = getAcquisitionPage("response-correction-rights")

export const metadata: Metadata = {
  title: page?.title,
  description: page?.description,
  alternates: {
    canonical: "/response-correction-rights",
  },
}

export default function ResponseCorrectionRightsPage() {
  if (!page) return null

  return <AcquisitionPageView page={page} />
}
