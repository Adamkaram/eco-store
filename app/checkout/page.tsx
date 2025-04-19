"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth/AuthContext"
import { useCart } from "@/hooks/use-cart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const supabase = getSupabaseClient()

export default function CheckoutPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [paymentType, setPaymentType] = useState<"cash_on_delivery" | "credit_card">("cash_on_delivery")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const { cartItems, clearCart } = useCart()

  useEffect(() => {
    if (user) {
      fetchUserProfile()
    }
  }, [user])

  const fetchUserProfile = async () => {
    if (!user) return

    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .single()

      if (profileError) throw profileError

      if (profileData) {
        setFullName(profileData.full_name || "")
        setPhone(profileData.phone || "")
      }

      // Set email from auth user data
      setEmail(user.email || "")
    } catch (error: any) {
      console.error("Error fetching user profile:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!user) {
        throw new Error("User not authenticated")
      }

      const total = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: total,
          status: "pending",
          shipping_address: address,
          contact_phone: phone,
          contact_email: email,
          customer_name: fullName,
          payment_type: paymentType,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price || 0,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) throw itemsError

      // Clear cart
      clearCart()

      toast({
        title: "Order placed successfully",
        description: "We'll contact you for delivery details.",
      })

      router.push("/orders")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during checkout.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-lg mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              placeholder="Delivery Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div>
            <Select
              value={paymentType}
              onValueChange={(value: "cash_on_delivery" | "credit_card") => setPaymentType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
                <SelectItem value="credit_card" disabled>
                  Credit Card (Coming Soon)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Placing Order..." : "Confirm Order"}
          </Button>
        </form>
      </Card>
    </div>
  )
}

