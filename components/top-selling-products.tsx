"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"

type TopProduct = {
  id: string
  name: string
  total_sold: number
  total_revenue: number
}

export function TopSellingProducts() {
  const [products, setProducts] = useState<TopProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = getSupabaseClient()

  useEffect(() => {
    fetchTopSellingProducts()
  }, [])

  const fetchTopSellingProducts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const { data, error } = await supabase.rpc("get_top_selling_products")

      if (error) throw error

      setProducts(data || [])
    } catch (err: any) {
      console.error("Error fetching top selling products:", err)
      setError(err.message || "An error occurred while fetching top selling products")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span>Loading top selling products...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product Name</TableHead>
          <TableHead>Total Sold</TableHead>
          <TableHead>Total Revenue</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>{product.name}</TableCell>
            <TableCell>{product.total_sold}</TableCell>
            <TableCell>${product.total_revenue.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

