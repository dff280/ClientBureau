import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Report Queue",
  description:
    "Internal redirect to the Client Bureau report moderation queue for reviewing documented client experiences and publication decisions.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminReviewsRedirectPage() {
  redirect("/admin/reports")
}
