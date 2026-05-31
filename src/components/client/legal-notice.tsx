import { Scale } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function LegalNotice() {
  return (
    <Alert className="rounded-md border-amber-200 bg-amber-50 text-amber-950">
      <Scale className="size-4" aria-hidden="true" />
      <AlertTitle>Fairness and moderation standard</AlertTitle>
      <AlertDescription className="leading-6">
        Client Bureau publishes moderated, contractor-submitted reports as reported experiences.
        Public pages exclude full phone numbers and emails, show only approved summaries, and
        include a client response and dispute path.
      </AlertDescription>
    </Alert>
  )
}
