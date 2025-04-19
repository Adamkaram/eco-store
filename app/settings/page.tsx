"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function SettingsPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [onlineTime, setOnlineTime] = useState('')
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchUserProfile()
      fetchOnlineTime()
    }
  }, [user])

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, avatar_url')
        .eq('id', user?.id)
        .single()

      if (error) throw error

      setFullName(data.full_name || '')
      setEmail(data.email || '')
      setAvatarUrl(data.avatar_url || '')
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const fetchOnlineTime = async () => {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('duration')
        .eq('user_id', user?.id)
        .order('login_time', { ascending: false })
        .limit(1)
        .single()

      if (error) throw error

      setOnlineTime(data.duration || '0 seconds')
    } catch (error: any) {
      console.error('Error fetching online time:', error)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0])
    }
  }

  const uploadAvatar = async () => {
    if (!avatarFile) return null

    const fileName = `${user?.id}-${Date.now()}-${avatarFile.name}`
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile)

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let newAvatarUrl = avatarUrl
      if (avatarFile) {
        newAvatarUrl = await uploadAvatar() || avatarUrl
      }

      const updates = {
        full_name: fullName,
        email,
        avatar_url: newAvatarUrl,
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id)

      if (error) throw error

      if (password) {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match")
        }
        const { error: passwordError } = await supabase.auth.updateUser({ password })
        if (passwordError) throw passwordError
      }

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
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Your Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center mb-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={avatarUrl} alt={fullName} />
              <AvatarFallback>{fullName.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <div>
            <Label htmlFor="avatar">Profile Picture</Label>
            <Input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} />
          </div>
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
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
          <div>
            <Label>Time Online</Label>
            <p>{onlineTime}</p>
          </div>
          <Button type="submit" className="w-full">
            Update Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

