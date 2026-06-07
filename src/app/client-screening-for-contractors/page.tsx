import type { Metadata } from "next"

import { AcquisitionPageView } from "@/components/landing/acquisition-page-view"
import { getAcquisitionPage } from "@/lib/acquisition-pages"

const page = getAcquisitionPage("client-screening-for-contractors")

export const metadata: Metadata = {
  title: page?.title,
  description: page?.description,
  alternates: {
    canonical: "/client-screening-for-contractors",
  },
}

export default function ClientScreeningForContractorsPage() {
  if (!page) return null

  return <AcquisitionPageView page={page} />
}
