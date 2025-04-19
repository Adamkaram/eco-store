"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/hooks/use-cart"

type AddToCartButtonProps = {
  productId: string
  productName: string
}

export function AddToCartButton({ productId, productName }: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const { toast } = useToast()
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    setIsAdding(true)
    try {
      addToCart(productId, productName)

      toast({
        title: "Success",
        description: `${productName} added to cart.`,
      })
    } catch (error: any) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Button onClick={handleAddToCart} disabled={isAdding}>
      {isAdding ? "Adding..." : "Add to Cart"}
    </Button>
  )
}

