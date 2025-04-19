import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"

const supabase = getSupabaseClient()

export function ProductList() {
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("*")
      if (error) {
        console.error("Error fetching products:", error)
      } else {
        setProducts(data || [])
      }
    }

    fetchProducts()
  }, [])

  return (
    <div>
      <h2>Products</h2>
      <ul>
        {products.map((product) => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  )
}

