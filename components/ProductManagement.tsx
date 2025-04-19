"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, ChevronLeft, ChevronRight, Eye, Loader2 } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

type Product = {
  id: string
  name: string
  price: number
  stock: number
  category: string
  description: string | null
  image_url: string | null
  is_featured: boolean
  is_new_arrival: boolean
  is_best_seller: boolean
}

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortField, setSortField] = useState<keyof Product>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const itemsPerPage = 10
  const supabaseClient = getSupabaseClient()

  useEffect(() => {
    fetchProducts()
  }, [currentPage, sortField, sortOrder, searchQuery])

  const fetchProducts = async () => {
    try {
      setLoading(true)

      let query = supabaseClient
        .from("products")
        .select("*", { count: "exact" })
        .order(sortField, { ascending: sortOrder === "asc" })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`)
      }

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      setProducts(data || [])
      setTotalPages(Math.ceil((count || 0) / itemsPerPage))
    } catch (error: any) {
      console.error("Error fetching products:", error)
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
      const { error } = await supabaseClient.from("products").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted.",
      })

      fetchProducts()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleSort = (field: keyof Product) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

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
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="max-w-sm"
          />
          <Link href="/admin/products/new">
            <Button>Add New Product</Button>
          </Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
                Name {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead onClick={() => handleSort("category")} className="cursor-pointer">
                Category {sortField === "category" && (sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead onClick={() => handleSort("price")} className="cursor-pointer">
                Price {sortField === "price" && (sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead onClick={() => handleSort("stock")} className="cursor-pointer">
                Stock {sortField === "stock" && (sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Link href={`/admin/products/${product.id}`}>
                      <Button size="sm" variant="outline">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setSelectedProduct(product)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{selectedProduct?.name}</DialogTitle>
                        </DialogHeader>
                        {selectedProduct && (
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <img
                                src={selectedProduct.image_url || "/placeholder.svg"}
                                alt={selectedProduct.name}
                                className="col-span-4 w-full h-64 object-cover rounded-md"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <p className="text-sm font-medium col-span-4">{selectedProduct?.description}</p>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <p className="text-sm font-medium">Category:</p>
                              <p className="text-sm col-span-3">{selectedProduct?.category}</p>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <p className="text-sm font-medium">Price:</p>
                              <p className="text-sm col-span-3">${selectedProduct?.price.toFixed(2)}</p>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <p className="text-sm font-medium">Stock:</p>
                              <p className="text-sm col-span-3">{selectedProduct?.stock}</p>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <p className="text-sm font-medium">Featured:</p>
                              <Checkbox checked={selectedProduct?.is_featured} disabled />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <p className="text-sm font-medium">New Arrival:</p>
                              <Checkbox checked={selectedProduct?.is_new_arrival} disabled />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <p className="text-sm font-medium">Best Seller:</p>
                              <Checkbox checked={selectedProduct?.is_best_seller} disabled />
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="destructive" onClick={() => setDeleteConfirmation(product.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Are you sure you want to delete this product?</DialogTitle>
                          <DialogDescription>This action cannot be undone.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDeleteConfirmation(null)}>
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              if (deleteConfirmation) {
                                deleteProduct(deleteConfirmation)
                                setDeleteConfirmation(null)
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-between items-center mt-4">
          <div>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Items per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

