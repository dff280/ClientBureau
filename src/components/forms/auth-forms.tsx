"use client"

import Link from "next/link"
import { useActionState, useEffect } from "react"
import { toast } from "sonner"

import { FieldError } from "@/components/forms/field-error"
import { PendingSubmitButton } from "@/components/forms/pending-submit-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { mockSignupAction } from "@/lib/actions/client-bureau"
import type { ActionResult, User } from "@/lib/types"

const initialUserState: ActionResult<User> = {
  ok: false,
  message: "",
}

export function LoginForm({
  redirectTo,
  message,
  variant = "destructive",
}: {
  redirectTo?: string
  message?: string
  variant?: "default" | "destructive"
}) {
  return (
    <form action="/api/auth/login" method="post" className="grid gap-4">
      {redirectTo ? <input type="hidden" name="next" value={redirectTo} /> : null}
      {message ? (
        <Alert variant={variant} className="rounded-md">
          <AlertTitle>{variant === "default" ? "Session update" : "Login needs attention"}</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="contractor@example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" placeholder="Password" />
      </div>
      <PendingSubmitButton pendingText="Starting session..." className="bg-slate-950 text-white hover:bg-slate-800">
        Login
      </PendingSubmitButton>
      <p className="text-center text-sm text-slate-600">
        New contractor?{" "}
        <Link href="/signup" className="font-semibold text-amber-700">
          Create an account
        </Link>
      </p>
    </form>
  )
}

export function SignupForm() {
  const [state, action] = useActionState(mockSignupAction, initialUserState)

  useEffect(() => {
    if (state.message) toast[state.ok ? "success" : "error"](state.message)
  }, [state])

  return (
    <form action={action} className="grid gap-5">
      {state.message ? (
        <Alert variant={state.ok ? "default" : "destructive"} className="rounded-md">
          <AlertTitle>{state.ok ? "Profile created" : "Signup needs attention"}</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" placeholder="Morgan Ellis" />
          <FieldError name="fullName" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@company.com" />
          <FieldError name="email" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" placeholder="Minimum 8 characters" />
          <FieldError name="password" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessName">Business name</Label>
          <Input id="businessName" name="businessName" placeholder="RidgeBuild Contracting" />
          <FieldError name="businessName" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="trade">Trade</Label>
          <Input id="trade" name="trade" placeholder="Residential remodeling" />
          <FieldError name="trade" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" placeholder="Orlando" />
          <FieldError name="city" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input id="state" name="state" placeholder="FL" />
          <FieldError name="state" errors={state.ok ? undefined : state.fieldErrors} />
        </div>
      </div>
      <PendingSubmitButton pendingText="Creating account..." className="bg-slate-950 text-white hover:bg-slate-800">
        Create account
      </PendingSubmitButton>
      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-amber-700">
          Login
        </Link>
      </p>
    </form>
  )
}
