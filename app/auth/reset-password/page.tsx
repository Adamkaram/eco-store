"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const router = useRouter()
  const { resetPassword } = useAuth()
  const { toast } = useToast()

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (newPassword !== confirmPassword) {
    toast({
      title: "Error",
      description: "Passwords do not match.",
      variant: "destructive",
    })
    return
  }
  try {
    await resetPassword(newPassword)
    toast({
      title: "Success",
      description: "Your password has been reset successfully.",
    })
    router.push('/auth/signin')
  } catch (err: any) {
    toast({
      title: "Error",
      description: err.message || "Failed to reset password. Please try again.",
      variant: "destructive",
    })
  }
}

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Reset Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

