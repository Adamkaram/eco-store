"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
const supabase = getSupabaseClient()
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddToCartButton } from "@/components/add-to-cart-button"
import Link from "next/link"

type Product = {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category_id: string
  main_image_url: string
}

type Category = {
  id: string
  name: string
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      let query = supabase.from("products").select("*")

      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`)
      }

      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory)
      }

      if (minPrice) {
        query = query.gte("price", Number.parseFloat(minPrice))
      }

      if (maxPrice) {
        query = query.lte("price", Number.parseFloat(maxPrice))
      }

      const { data, error } = await query

      if (error) throw error

      setProducts(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("*")

      if (error) throw error

      setCategories(data || [])
    } catch (error: any) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleSearch = () => {
    fetchProducts()
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Shop</h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="max-w-xs"
        />
        <Input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="max-w-xs"
        />
        <button onClick={handleSearch} className="bg-primary text-white px-4 py-2 rounded">
          Search
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id}>
            <Link href={`/products/${product.id}`}>
              <CardHeader>
                <img
                  src={product.main_image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded"
                />
                <CardTitle>{product.name}</CardTitle>
              </CardHeader>
            </Link>
            <CardContent>
              <p className="text-lg font-bold mb-2">${product.price.toFixed(2)}</p>
              <p className="mb-4">{product.description.slice(0, 100)}...</p>
              <AddToCartButton productId={product.id} productName={product.name} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

