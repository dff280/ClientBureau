import type { Metadata } from "next"

import { AcquisitionPageView } from "@/components/landing/acquisition-page-view"
import { getAcquisitionPage } from "@/lib/acquisition-pages"

const page = getAcquisitionPage("change-order-template")

export const metadata: Metadata = {
  title: page?.title,
  description: page?.description,
  alternates: {
    canonical: "/change-order-template",
  },
}

export default function ChangeOrderTemplatePage() {
  if (!page) return null

  return <AcquisitionPageView page={page} />
}
