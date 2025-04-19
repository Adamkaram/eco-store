"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

const supabase = getSupabaseClient()

export default function AuthCallbackPage() {
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession()
      if (error) {
        toast({
          title: "Error",
          description: "There was an error confirming your email. Please try again.",
          variant: "destructive",
        })
        router.push("/auth/signin")
      } else {
        toast({
          title: "Success",
          description: "Your email has been confirmed. You can now sign in.",
        })
        router.push("/auth/signin")
      }
    }

    handleAuthCallback()
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <p>Processing your request...</p>
    </div>
  )
}

