import { PremiumRouteLoading } from "@/components/layout/page-loading"

export default function Loading() {
  return (
    <PremiumRouteLoading
      eyebrow="Admin operations"
      title="Loading operations command center"
      description="Preparing moderation queues, profile health, audit activity, and platform readiness."
      tone="admin"
    />
  )
}
