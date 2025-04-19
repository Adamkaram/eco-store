import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"

export type CartItem = {
  productId: string
  productName: string
  quantity: number
  price?: number
  image_url?: string
}

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    loadCart()
  }, [])

  useEffect(() => {
    updateCartCount()
  }, [cartItems])

  const loadCart = async () => {
    setLoading(true)
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]")
    const updatedCart = await Promise.all(
      storedCart.map(async (item: CartItem) => {
        const productDetails = await fetchProductDetails(item.productId)
        return {
          ...item,
          price: productDetails?.price,
          image_url: productDetails?.image_url,
        }
      }),
    )
    setCartItems(updatedCart)
    setLoading(false)
  }

  const updateCartCount = () => {
    const count = cartItems.reduce((total, item) => total + item.quantity, 0)
    setCartCount(count)
    // Dispatch a custom event to notify other components of the cart update
    window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { count } }))
  }

  const fetchProductDetails = async (productId: string) => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("products").select("price, image_url").eq("id", productId).single()

    if (error) {
      console.error("Error fetching product details:", error)
      return null
    }

    return data
  }

  const addToCart = async (productId: string, productName: string) => {
    const productDetails = await fetchProductDetails(productId)
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === productId)
      let newItems

      if (existingItem) {
        newItems = prevItems.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
        )
      } else {
        newItems = [
          ...prevItems,
          {
            productId,
            productName,
            quantity: 1,
            price: productDetails?.price,
            image_url: productDetails?.image_url,
          },
        ]
      }

      localStorage.setItem("cart", JSON.stringify(newItems))
      return newItems
    })
  }

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.productId !== productId)
      localStorage.setItem("cart", JSON.stringify(newItems))
      return newItems
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems((prevItems) => {
      const newItems = prevItems
        .map((item) => (item.productId === productId ? { ...item, quantity: Math.max(0, quantity) } : item))
        .filter((item) => item.quantity > 0) // Remove items with quantity 0
      localStorage.setItem("cart", JSON.stringify(newItems))
      return newItems
    })
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem("cart")
  }

  return {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
  }
}

