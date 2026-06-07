import type { Metadata } from "next"

import { AcquisitionPageView } from "@/components/landing/acquisition-page-view"
import { getAcquisitionPage } from "@/lib/acquisition-pages"

const page = getAcquisitionPage("homeowner-wont-pay-contractor")

export const metadata: Metadata = {
  title: page?.title,
  description: page?.description,
  alternates: {
    canonical: "/homeowner-wont-pay-contractor",
  },
}

export default function HomeownerWontPayContractorPage() {
  if (!page) return null

  return <AcquisitionPageView page={page} />
}
