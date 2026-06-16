import type { Metadata } from "next"

import { AcquisitionPageView } from "@/components/landing/acquisition-page-view"
import { getAcquisitionPage } from "@/lib/acquisition-pages"

const page = getAcquisitionPage("contractor-verification")

export const metadata: Metadata = {
  title: page?.title,
  description: page?.description,
  alternates: {
    canonical: "/contractor-verification",
  },
}

export default function ContractorVerificationPage() {
  if (!page) return null

  return <AcquisitionPageView page={page} />
}
