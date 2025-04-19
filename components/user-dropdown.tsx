"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, ShoppingCart, Package, LogOut } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

export function UserDropdown() {
  const { user, signOut, isAdmin } = useAuth()
  const router = useRouter()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  //const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      setAvatarUrl(user.user_metadata?.avatar_url || null)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      console.log("Current user:", user)
    }
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth/signin")
  }

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.email}</p>
            <p className="text-xs leading-none text-muted-foreground">{isAdmin ? "Administrator" : "User"}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account">
            <User className="mr-2 h-4 w-4" />
            <span>Account</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/orders">
            <Package className="mr-2 h-4 w-4" />
            <span>Orders</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/cart">
            <ShoppingCart className="mr-2 h-4 w-4" />
            <span>Cart</span>
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin/dashboard">
              <Settings className="mr-2 h-4 w-4" />
              <span>Admin Dashboard</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

