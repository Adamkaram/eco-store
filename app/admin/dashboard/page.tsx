"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/AuthContext"
import { AdminDashboard } from "@/components/AdminDashboard"
import { Loader2 } from "lucide-react"

export default function AdminDashboardPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const supabase = getSupabaseClient()

  useEffect(() => {
    checkAdmin()
  }, [user])

  const checkAdmin = async () => {
    try {
      if (!user) {
        router.push("/auth/signin")
        return
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, is_admin")
        .eq("id", user.id)
        .single()

      if (error) throw error

      // Check all possible admin flags
      const isAdminUser =
        profile?.role === "admin" ||
        user.app_metadata?.role === "admin" ||
        user.user_metadata?.is_admin === true ||
        user.app_metadata?.is_super_admin === true

      console.log("Admin status check:", {
        profileRole: profile?.role,
        appMetadataRole: user.app_metadata?.role,
        userMetadataIsAdmin: user.user_metadata?.is_admin,
        isSuperAdmin: user.app_metadata?.is_super_admin,
      })

      if (!isAdminUser) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        })
        router.push("/")
        return
      }

      setIsAdmin(true)
    } catch (error: any) {
      console.error("Error checking admin status:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while checking your permissions.",
        variant: "destructive",
      })
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return <AdminDashboard />
}

