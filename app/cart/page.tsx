"use client"

import { useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Trash2, Plus, Minus } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/AuthContext"
import { useCart } from "@/hooks/use-cart"
import { motion, AnimatePresence } from "framer-motion"

export default function CartPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()
  const { cartItems, loading, removeFromCart, updateQuantity, cartCount } = useCart()

  useEffect(() => {
    // Dispatch a custom event to update the cart count in the header
    window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { count: cartCount } }))
  }, [cartCount])

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity)
    }
  }

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId)

    toast({
      title: "Item removed",
      description: "The item has been removed from your cart.",
    })
  }

  const checkout = () => {
    if (!user) {
      router.push("/auth/signin?redirect=/checkout")
    } else {
      router.push("/checkout")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <p className="text-lg mb-4">Your cart is empty</p>
          <Button onClick={() => router.push("/products")}>Continue Shopping</Button>
        </Card>
      </div>
    )
  }

  const total = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {cartItems.map((item) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-4">
                  <div className="flex gap-4">
                    <div className="relative w-24 h-24">
                      <Image
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.productName}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.productName}</h3>
                      <p className="text-muted-foreground">${item.price?.toFixed(2)}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span>{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.productId)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${((item.price || 0) * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div>
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <Button className="w-full mt-4" onClick={checkout}>
              {user ? "Proceed to Checkout" : "Sign In to Checkout"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

