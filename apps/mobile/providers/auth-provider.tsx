import type { Session } from "@supabase/supabase-js"
import { router } from "expo-router"
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react"

import { mobileFetch } from "@/lib/api"
import { hasNativeSupabaseConfig } from "@/lib/config"
import { supabase } from "@/lib/supabase"
import type { ApiResult, MobileUser } from "@/lib/types"

type SignupInput = {
  fullName: string
  email: string
  password: string
  businessName: string
  trade: string
  city: string
  state: string
}

type AuthContextValue = {
  configured: boolean
  loading: boolean
  session?: Session | null
  user?: MobileUser
  accessToken?: string
  signIn: (email: string, password: string) => Promise<ApiResult<MobileUser>>
  signUp: (input: SignupInput) => Promise<ApiResult<MobileUser>>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>()
  const [user, setUser] = useState<MobileUser>()
  const [loading, setLoading] = useState(true)
  const configured = hasNativeSupabaseConfig()

  async function refreshUser(nextSession = session) {
    const token = nextSession?.access_token

    if (!token) {
      setUser(undefined)
      return
    }

    const result = await mobileFetch<MobileUser>("/api/mobile/me", token)

    if (result.ok) {
      setUser(result.data)
    }
  }

  useEffect(() => {
    let mounted = true

    async function bootstrap() {
      if (!supabase) {
        setLoading(false)
        return
      }

      const { data } = await supabase.auth.getSession()

      if (!mounted) return

      setSession(data.session)
      await refreshUser(data.session)
      setLoading(false)
    }

    bootstrap()

    const subscription = supabase?.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      refreshUser(nextSession)
    })

    return () => {
      mounted = false
      subscription?.data.subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      configured,
      loading,
      session,
      user,
      accessToken: session?.access_token,
      async signIn(email: string, password: string) {
        if (!supabase) {
          return { ok: false, message: "Mobile Supabase settings are missing." }
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) return { ok: false, message: error.message }

        setSession(data.session)
        await refreshUser(data.session)

        return {
          ok: true,
          data: user ?? {
            id: data.user.id,
            email: data.user.email ?? email,
            fullName: data.user.user_metadata?.full_name ?? "Client Bureau user",
            role: "contractor",
            createdAt: data.user.created_at,
          },
          message: "Signed in.",
        }
      },
      async signUp(input: SignupInput) {
        return mobileFetch<MobileUser>("/api/mobile/signup", undefined, {
          method: "POST",
          body: JSON.stringify({
            ...input,
            accountType: "contractor",
          }),
        })
      },
      async signOut() {
        await supabase?.auth.signOut()
        setSession(null)
        setUser(undefined)
        router.replace("/login")
      },
      refreshUser,
    }),
    [configured, loading, session, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider.")
  }

  return value
}
