import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Reports",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminReviewsRedirectPage() {
  redirect("/admin/reports")
}
