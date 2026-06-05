import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Contracts | Client Bureau Dashboard",
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardContractsRedirectPage() {
  redirect("/dashboard?workspace=contracts")
}
