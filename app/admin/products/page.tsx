"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Eye, Pencil, Trash2 } from "lucide-react"

type Product = {
  id: string
  name: string
  price: number
  stock: number
  category: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("products").select("*")
      if (error) throw error
      setProducts(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch products. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id)
      if (error) throw error
      toast({
        title: "Success",
        description: "Product deleted successfully.",
      })
      fetchProducts()
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Manage Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Link href="/admin/products/new">
            <Button>Add New Product</Button>
          </Link>
        </div>
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => router.push(`/admin/products/${product.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteProduct(product.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

