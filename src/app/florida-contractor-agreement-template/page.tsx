import type { Metadata } from "next"

import { AcquisitionPageView } from "@/components/landing/acquisition-page-view"
import { getAcquisitionPage } from "@/lib/acquisition-pages"

const page = getAcquisitionPage("florida-contractor-agreement-template")

export const metadata: Metadata = {
  title: page?.title,
  description: page?.description,
  alternates: {
    canonical: "/florida-contractor-agreement-template",
  },
}

export default function FloridaContractorAgreementTemplatePage() {
  if (!page) return null

  return <AcquisitionPageView page={page} />
}

