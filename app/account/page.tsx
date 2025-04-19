"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { toast, useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Camera } from "lucide-react"
import { useAuth } from "@/lib/auth/AuthContext"

type UserProfile = {
  id: string
  full_name: string
  avatar_url?: string
}

export default function AccountPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (!user) {
      router.push("/auth/signin")
    } else {
      getProfile()
    }
  }, [user, router])

  async function getProfile() {
    try {
      setLoading(true)

      const { data, error } = await supabase.from("profiles").select("*").eq("id", user?.id).single()

      if (error) {
        throw error
      }

      if (data) {
        setProfile(data)
        setFullName(data.full_name || "")
        setEmail(user?.email || "")
        setAvatarUrl(data.avatar_url || "")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch user data. Please try again.",
        variant: "destructive",
      })
      console.error("Error fetching user data:", error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0])
      setAvatarUrl(URL.createObjectURL(e.target.files[0]))
    }
  }

  const uploadAvatar = async () => {
    if (!avatarFile) return null

    const fileName = `${user?.id}-${Date.now()}-${avatarFile.name}`
    try {
      // Log the attempt to upload
      console.log(`Attempting to upload file: ${fileName}`)

      const { data, error } = await supabase.storage.from("avatars").upload(fileName, avatarFile)

      if (error) {
        console.error("Supabase storage error:", error)
        throw error
      }

      console.log("File uploaded successfully:", data)

      const {
        data: { publicUrl },
        error: urlError,
      } = supabase.storage.from("avatars").getPublicUrl(fileName)

      if (urlError) {
        console.error("Error getting public URL:", urlError)
        throw urlError
      }

      console.log("Public URL retrieved:", publicUrl)
      return publicUrl
    } catch (error: any) {
      console.error("Error in uploadAvatar:", error)
      if (error.message.includes("bucket not found")) {
        toast({
          title: "Storage Error",
          description: "Avatar upload failed due to a storage configuration issue. Please contact support.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Upload Error",
          description: `Failed to upload avatar: ${error.message}`,
          variant: "destructive",
        })
      }
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)

      let newAvatarUrl = avatarUrl
      if (avatarFile) {
        console.log("Uploading new avatar...")
        newAvatarUrl = (await uploadAvatar()) || avatarUrl
      }

      console.log("Updating profile...")
      const updates = {
        id: user?.id,
        full_name: fullName,
        avatar_url: newAvatarUrl,
      }

      const { error } = await supabase.from("profiles").upsert(updates)

      if (error) {
        console.error("Error updating profile:", error)
        throw error
      }

      if (email !== user?.email) {
        console.log("Updating email...")
        const { error: updateEmailError } = await supabase.auth.updateUser({ email })
        if (updateEmailError) {
          console.error("Error updating email:", updateEmailError)
          throw updateEmailError
        }
      }

      if (password) {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match")
        }
        console.log("Updating password...")
        const { error: passwordError } = await supabase.auth.updateUser({ password })
        if (passwordError) {
          console.error("Error updating password:", passwordError)
          throw passwordError
        }
      }

      console.log("Profile updated successfully")
      toast({
        title: "Success",
        description: "Your profile has been updated.",
      })
    } catch (error: any) {
      console.error("Error in handleSubmit:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center mb-4">
              <div className="relative cursor-pointer" onClick={handleAvatarClick}>
                <Avatar className="w-24 h-24">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback>{fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 bg-primary rounded-full p-2">
                  <Camera className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

