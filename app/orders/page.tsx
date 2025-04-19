"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth/AuthContext"
import Image from "next/image"

type OrderItem = {
  product_id: string
  product_name: string
  product_image: string
  product_category: string
  quantity: number
  price: number
}

type Order = {
  order_id: string
  created_at: string
  status: string
  total_amount: number
  payment_type: string
  customer_name: string
  customer_email: string
  items: OrderItem[]
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (!user) {
      router.push("/auth/signin")
    } else {
      fetchOrders()
    }
  }, [user, router])

  async function fetchOrders() {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          items:order_items(
            quantity,
            price,
            product:products(
              id,
              name,
              image_url,
              category
            )
          )
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      const formattedOrders: Order[] = data.map((order) => ({
        order_id: order.id,
        created_at: order.created_at,
        status: order.status,
        total_amount: order.total_amount,
        payment_type: order.payment_type,
        customer_name: order.customer_name,
        customer_email: order.contact_email,
        items: order.items.map((item: any) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          product_image: item.product.image_url,
          product_category: item.product.category,
          quantity: item.quantity,
          price: item.price,
        })),
      }))

      setOrders(formattedOrders)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      })
      console.error("Error fetching orders:", error.message)
    } finally {
      setLoading(false)
    }
  }

  const renderOrderTable = (orders: Order[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Total Amount</TableHead>
          <TableHead>Payment Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Products</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.order_id}>
            <TableCell>{order.order_id.slice(0, 8)}</TableCell>
            <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
            <TableCell>${order.total_amount.toFixed(2)}</TableCell>
            <TableCell>{order.payment_type === "cash_on_delivery" ? "Cash on Delivery" : "Credit Card"}</TableCell>
            <TableCell>{order.status}</TableCell>
            <TableCell>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.product_id} className="flex items-center space-x-2">
                    <Image
                      src={item.product_image || "/placeholder.svg"}
                      alt={item.product_name}
                      width={40}
                      height={40}
                      className="rounded-md"
                    />
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">{item.product_category}</p>
                      <p className="text-sm">
                        Qty: {item.quantity} x ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const pendingOrders = orders.filter((order) => order.status === "pending")
  const inProgressOrders = orders.filter((order) => order.status === "in_progress")
  const completedOrders = orders.filter((order) => order.status === "completed")
  const cancelledOrders = orders.filter((order) => order.status === "cancelled")

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Your Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
              {pendingOrders.length > 0 ? renderOrderTable(pendingOrders) : <p>No pending orders.</p>}
            </TabsContent>
            <TabsContent value="in_progress">
              {inProgressOrders.length > 0 ? renderOrderTable(inProgressOrders) : <p>No orders in progress.</p>}
            </TabsContent>
            <TabsContent value="completed">
              {completedOrders.length > 0 ? renderOrderTable(completedOrders) : <p>No completed orders.</p>}
            </TabsContent>
            <TabsContent value="cancelled">
              {cancelledOrders.length > 0 ? renderOrderTable(cancelledOrders) : <p>No cancelled orders.</p>}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

