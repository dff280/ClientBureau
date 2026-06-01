"use client"

import { Loader2 } from "lucide-react"
import { useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"

export function PendingSubmitButton({
  children,
  pendingText = "Submitting...",
  className,
  variant,
  disabled,
  ...props
}: {
  children: React.ReactNode
  pendingText?: string
  className?: string
  variant?: React.ComponentProps<typeof Button>["variant"]
} & Omit<React.ComponentProps<typeof Button>, "type" | "children">) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending || disabled}
      className={className}
      variant={variant}
      {...props}
    >
      {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
      {pending ? pendingText : children}
    </Button>
  )
}
