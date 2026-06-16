import type { Metadata } from "next"

import { AcquisitionPageView } from "@/components/landing/acquisition-page-view"
import { getAcquisitionPage } from "@/lib/acquisition-pages"

const page = getAcquisitionPage("subcontractor-payment-chain-documentation")

export const metadata: Metadata = {
  title: page?.title,
  description: page?.description,
  alternates: {
    canonical: "/subcontractor-payment-chain-documentation",
  },
}

export default function SubcontractorPaymentChainDocumentationPage() {
  if (!page) return null

  return <AcquisitionPageView page={page} />
}
