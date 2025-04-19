"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SettingsPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (user) {
      fetchUserProfile()
    }
  }, [user])

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("full_name, email").eq("id", user?.id).single()

      if (error) throw error

      setFullName(data.full_name || "")
      setEmail(data.email || "")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from("profiles").update({ full_name: fullName, email }).eq("id", user?.id)

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <Button type="submit">Update Profile</Button>
        </form>
      </CardContent>
    </Card>
  )
}

