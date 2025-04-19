"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RecentOrders } from "@/components/recent-orders"
import { LowStockProducts } from "@/components/low-stock-products"
import { RevenueChart } from "@/components/revenue-chart"
import { StatCard } from "@/components/stat-card"
import { TopSellingProducts } from "@/components/top-selling-products"
import { CustomerGrowth } from "@/components/customer-growth"
import { Package, ShoppingCart, Users, DollarSign } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { ProductManagement } from "@/components/ProductManagement"
import { ManageOrders } from "@/components/ManageOrders"

type Order = {
  id: string
  created_at: string
  total_amount: number
  status: string
}

type Product = {
  id: string
  name: string
  price: number
  stock: number
}

export function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [ordersData, productsData] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(10),
        supabase.from("products").select("*"),
      ])

      if (ordersData.error) throw ordersData.error
      if (productsData.error) throw productsData.error

      setOrders(ordersData.data || [])
      setProducts(productsData.data || [])
    } catch (error: any) {
      console.error("Error fetching data:", error)
      setError(error.message)
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Error</h2>
          <p>{error}</p>
          <Button onClick={fetchData} className="mt-4">
            Retry
          </Button>
        </Card>
      </div>
    )
  }

  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)
  const lowStockProducts = products.filter((product) => product.stock < 10)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Products" value={products.length.toString()} icon={<Package />} />
        <StatCard title="Total Orders" value={orders.length.toString()} icon={<ShoppingCart />} />
        <StatCard title="Total Customers" value="8,901" icon={<Users />} />
        <StatCard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} icon={<DollarSign />} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Revenue Over Time</h2>
          <RevenueChart />
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Customer Growth</h2>
          <CustomerGrowth />
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-6 mb-8">
        <ManageOrders />
      </div>
      <div className="grid grid-cols-1 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Low Stock Products</h2>
          <LowStockProducts products={lowStockProducts} />
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-6 mb-8">
        <ProductManagement />
      </div>
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Top Selling Products</h2>
        <TopSellingProducts />
      </Card>
    </div>
  )
}

