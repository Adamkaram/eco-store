import { useCart } from "@/hooks/use-cart"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

type MiniCartProps = {
  onClose: () => void
}

export function MiniCart({ onClose }: MiniCartProps) {
  const { cartItems, removeFromCart, cartCount } = useCart()

  const total = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)

  return (
    <Card className="p-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Your Cart ({cartCount} items)</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-4 max-h-80 overflow-auto">
        {cartItems.map((item) => (
          <div key={item.productId} className="flex gap-4">
            <div className="relative w-16 h-16">
              <Image
                src={item.image_url || "/placeholder.svg"}
                alt={item.productName}
                fill
                className="object-cover rounded"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{item.productName}</h4>
              <p className="text-sm text-muted-foreground">
                {item.quantity} x ${item.price?.toFixed(2)}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.productId)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Separator className="my-4" />
      <div className="flex justify-between items-center mb-4">
        <span className="font-semibold">Total:</span>
        <span className="font-semibold">${total.toFixed(2)}</span>
      </div>
      <div className="space-y-2">
        <Link href="/cart" passHref>
          <Button className="w-full" onClick={onClose}>
            View Cart
          </Button>
        </Link>
        <Link href="/checkout" passHref>
          <Button className="w-full" variant="outline" onClick={onClose}>
            Checkout
          </Button>
        </Link>
      </div>
    </Card>
  )
}

