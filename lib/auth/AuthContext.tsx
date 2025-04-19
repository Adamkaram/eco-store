"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

type AuthContextType = {
  user: User | null
  session: Session | null
  signIn: (email: string, password: string) => Promise<{ user: User | null; session: Session | null }>
  signUp: (email: string, password: string) => Promise<{ user: User | null; session: Session | null }>
  signOut: () => Promise<void>
  loading: boolean
  isAdmin: boolean // Add this line
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const supabase = getSupabaseClient() // Initialize supabase client here

    const setData = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()
      if (error) {
        console.error("Error getting session:", error)
      } else {
        setSession(session)
        setUser(session?.user ?? null)
      }
      setLoading(false)
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Supabase auth event: ${event}`, session)
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      if (event === "SIGNED_IN") {
        // Fetch the user's profile including the role
        supabase
          .from("profiles")
          .select("full_name, avatar_url, role, is_admin")
          .eq("id", session?.user?.id)
          .single()
          .then(async ({ data: profile, error: profileError }) => {
            if (profileError) {
              console.error("Error fetching user profile:", profileError)
            } else if (profile) {
              // Update the session with the user's role
              await supabase.auth.updateUser({
                data: {
                  role: profile.role || "user",
                  is_admin: profile.is_admin || false,
                },
              })
            }
            // Check if profile exists and create it if not
            if (!profile) {
              createProfile(session?.user)
                .then(() => {
                  toast({
                    title: "Profile Created!",
                    description: "Your profile has been successfully created.",
                  })
                })
                .catch((createError) => {
                  console.error("Error creating profile:", createError)
                  toast({
                    title: "Error",
                    description: "There was an error creating your profile. Please try again.",
                    variant: "destructive",
                  })
                })
            } else if (profileError) {
              console.error("Error checking for profile:", profileError)
              toast({
                title: "Error",
                description: "There was an error checking for your profile. Please try again.",
                variant: "destructive",
              })
            }
          })
      }

      if (event === "SIGNED_OUT") {
        router.push("/auth/signin")
      }
    })

    setData()

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router, toast])

  const createProfile = async (user: User | null) => {
    if (!user) return

    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
      role: "user",
      is_admin: false,
    })

    if (error) {
      console.error("Error creating profile:", error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error("Sign in error:", error)
      throw error
    }
    if (data.user) {
      // Check if the user is blocked
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("is_blocked")
        .eq("id", data.user.id)
        .single()

      if (profileError) {
        console.error("Error fetching profile:", profileError)
        throw profileError
      }

      if (profileData?.is_blocked) {
        await supabase.auth.signOut() // Sign out the blocked user
        throw new Error("This account has been blocked due to abusive behavior.")
      }
    }
    console.log("Sign in successful:", data)
    return data
  }

  const signUp = async (email: string, password: string) => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      console.error("Sign up error:", error)
      throw error
    }

    if (data.user) {
      // Check if the user is blocked
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("is_blocked")
        .eq("id", data.user.id)
        .single()

      if (profileError) {
        console.error("Error fetching profile:", profileError)
        throw profileError
      }

      if (profileData?.is_blocked) {
        throw new Error("This account has been blocked due to abusive behavior.")
      }
    }

    console.log("Sign up successful:", data)
    return data
  }

  const signOut = async () => {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Sign out error:", error)
      throw error
    }
    console.log("Sign out successful")
  }

  const value = {
    user,
    session,
    signIn,
    signUp,
    signOut,
    loading,
    isAdmin: user?.user_metadata?.is_admin || false, // Add this line
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

