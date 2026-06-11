"use client"

import Link from "next/link"
import { Building2, Home, MapPin, Target, UserRound } from "lucide-react"
import type React from "react"
import { useActionState, useEffect } from "react"
import { toast } from "sonner"

import { FieldError } from "@/components/forms/field-error"
import { PendingSubmitButton } from "@/components/forms/pending-submit-button"
import { StateSelect } from "@/components/forms/state-select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { signupAction } from "@/lib/actions/client-bureau"
import {
  accountTypeOptions,
  businessTypes,
  companySizes,
  onboardingGoals,
  yearsInBusinessOptions,
} from "@/lib/locations"
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
      <PendingSubmitButton pendingText="Signing in..." className="bg-slate-950 text-white hover:bg-slate-800">
        Sign in
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
  const [state, action] = useActionState(signupAction, initialUserState)

  useEffect(() => {
    if (state.message) toast[state.ok ? "success" : "error"](state.message)

    if (state.ok) {
      const nextPath = state.data.accountType === "client" ? "/client-response" : "/dashboard"
      const timer = window.setTimeout(() => window.location.assign(nextPath), 700)

      return () => window.clearTimeout(timer)
    }
  }, [state])

  return (
    <form action={action} className="grid gap-5">
      {state.message ? (
        <Alert variant={state.ok ? "default" : "destructive"} className="rounded-md">
          <AlertTitle>{state.ok ? "Profile created" : "Signup needs attention"}</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      <OnboardingBlock
        icon={<Target className="size-4" aria-hidden="true" />}
        title="Choose account type"
        text="This keeps contractor tools and client response tools separate from the start."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {accountTypeOptions.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer gap-3 rounded-md border border-slate-200 bg-white p-4 transition hover:border-amber-300 has-[:checked]:border-amber-400 has-[:checked]:bg-amber-50"
            >
              <input
                type="radio"
                name="accountType"
                value={option.value}
                defaultChecked={option.value === "contractor"}
                className="mt-1 size-4"
              />
              <span>
                <span className="flex items-center gap-2 font-semibold">
                  {option.value === "client" ? <Home className="size-4" aria-hidden="true" /> : <Building2 className="size-4" aria-hidden="true" />}
                  {option.label}
                </span>
                <span className="mt-2 block text-sm leading-6 text-slate-600">
                  {option.description}
                </span>
              </span>
            </label>
          ))}
        </div>
        <FieldError name="accountType" errors={state.ok ? undefined : state.fieldErrors} />
      </OnboardingBlock>
      <OnboardingBlock
        icon={<UserRound className="size-4" aria-hidden="true" />}
        title="Account owner"
        text="This person manages the Client Bureau account and receives moderation updates."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" placeholder="Morgan Ellis" autoComplete="name" />
            <FieldError name="fullName" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
            <Input id="email" name="email" type="email" placeholder="you@company.com" autoComplete="email" />
            <FieldError name="email" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="Minimum 8 characters" autoComplete="new-password" />
            <FieldError name="password" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
        </div>
      </OnboardingBlock>

      <OnboardingBlock
        icon={<Building2 className="size-4" aria-hidden="true" />}
        title="Business or response profile"
        text="Contractors can enter company details. Clients can enter the name or organization connected to a response, correction, or profile claim."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business or display name</Label>
            <Input id="businessName" name="businessName" placeholder="RidgeBuild Contracting or Morgan Ellis" autoComplete="organization" />
            <FieldError name="businessName" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessType">Business type</Label>
            <select id="businessType" name="businessType" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-slate-700 outline-none focus-visible:ring-3 focus-visible:ring-ring/50" defaultValue="">
              <option value="" disabled>Select business type</option>
              {businessTypes.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <FieldError name="businessType" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trade">Trade, service, or relationship context</Label>
            <Input id="trade" name="trade" placeholder="Residential remodeling or homeowner response" />
            <FieldError name="trade" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="licenseNumber">License number optional</Label>
            <Input id="licenseNumber" name="licenseNumber" placeholder="State or local license" />
            <FieldError name="licenseNumber" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessPhone">Business phone optional</Label>
            <Input id="businessPhone" name="businessPhone" type="tel" placeholder="For verification only" autoComplete="tel" />
            <FieldError name="businessPhone" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website optional</Label>
            <Input id="websiteUrl" name="websiteUrl" type="url" placeholder="https://yourcompany.com" />
            <FieldError name="websiteUrl" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
        </div>
      </OnboardingBlock>

      <OnboardingBlock
        icon={<MapPin className="size-4" aria-hidden="true" />}
        title="Service area"
        text="Use dropdowns for state fields so searches, public directories, and reports stay clean."
      >
        <div className="grid gap-4 md:grid-cols-[1fr_180px]">
          <div className="space-y-2">
            <Label htmlFor="city">Primary city</Label>
            <Input id="city" name="city" placeholder="Orlando" autoComplete="address-level2" />
            <FieldError name="city" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <StateSelect id="state" name="state" />
            <FieldError name="state" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="serviceArea">Cities or counties served optional</Label>
            <Textarea id="serviceArea" name="serviceArea" placeholder="Orlando, Winter Park, Kissimmee, Orange County" className="min-h-20" />
            <FieldError name="serviceArea" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
        </div>
      </OnboardingBlock>

      <OnboardingBlock
        icon={<Target className="size-4" aria-hidden="true" />}
        title="Account setup"
        text="These answers help Client Bureau surface the right dashboard tools first."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="yearsInBusiness">Years in business</Label>
            <select id="yearsInBusiness" name="yearsInBusiness" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-slate-700 outline-none focus-visible:ring-3 focus-visible:ring-ring/50" defaultValue="">
              <option value="" disabled>Select range</option>
              {yearsInBusinessOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <FieldError name="yearsInBusiness" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companySize">Company size</Label>
            <select id="companySize" name="companySize" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-slate-700 outline-none focus-visible:ring-3 focus-visible:ring-ring/50" defaultValue="">
              <option value="" disabled>Select size</option>
              {companySizes.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <FieldError name="companySize" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="primaryGoal">Main goal</Label>
            <select id="primaryGoal" name="primaryGoal" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-slate-700 outline-none focus-visible:ring-3 focus-visible:ring-ring/50" defaultValue="">
              <option value="" disabled>Select goal</option>
              {onboardingGoals.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <FieldError name="primaryGoal" errors={state.ok ? undefined : state.fieldErrors} />
          </div>
        </div>
      </OnboardingBlock>
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

function OnboardingBlock({
  icon,
  title,
  text,
  children,
}: {
  icon: React.ReactNode
  title: string
  text: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4 flex gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white text-amber-700 shadow-sm">
          {icon}
        </span>
        <div>
          <h2 className="font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
        </div>
      </div>
      {children}
    </section>
  )
}
