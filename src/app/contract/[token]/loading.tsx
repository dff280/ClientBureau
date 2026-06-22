import { PremiumRouteLoading } from "@/components/layout/page-loading"

export default function Loading() {
  return (
    <PremiumRouteLoading
      eyebrow="Secure agreement"
      title="Checking agreement link"
      description="Confirming whether this private agreement packet is available for review. If the link is unavailable, Client Bureau will show a clear next step."
      tone="services"
    />
  )
}
