"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

type Order = {
  order_id: string
  created_at: string
  status: string
  total_amount: number
  payment_type: "cash_on_delivery" | "credit_card"
  user_id: string
  customer_name: string
  customer_email: string
}

const statusColors = {
  pending: "text-yellow-500",
  in_progress: "text-blue-500",
  completed: "text-green-500",
  cancelled: "text-red-500",
}

export function ManageOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("order_details").select("*").order("created_at", { ascending: false })

      if (error) throw error

      setOrders(data || [])
    } catch (error: any) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)

      if (error) throw error

      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}`,
      })

      setOrders(orders.map((order) => (order.order_id === orderId ? { ...order, status: newStatus } : order)))
    } catch (error: any) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const deleteOrder = async (orderId: string) => {
    try {
      const { error } = await supabase.from("orders").update({ status: "deleted" }).eq("id", orderId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Order marked as deleted",
      })

      setOrders(orders.filter((order) => order.order_id !== orderId))
    } catch (error: any) {
      console.error("Error deleting order:", error)
      toast({
        title: "Error",
        description: "Failed to delete order. Please try again.",
        variant: "destructive",
      })
    }
  }

  const renderOrderTable = (orders: Order[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>State</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.order_id}>
            <TableCell>{order.order_id}</TableCell>
            <TableCell>{order.customer_name}</TableCell>
            <TableCell>{order.customer_email}</TableCell>
            <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
            <TableCell>${order.total_amount.toFixed(2)}</TableCell>
            <TableCell>
              {order.payment_type === "cash_on_delivery" && order.status !== "deleted" ? (
                <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.order_id, value)}>
                  <SelectTrigger className={`w-[180px] ${statusColors[order.status as keyof typeof statusColors]}`}>
                    <SelectValue>{order.status}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending" className={statusColors.pending}>
                      Pending
                    </SelectItem>
                    <SelectItem value="in_progress" className={statusColors.in_progress}>
                      In Progress
                    </SelectItem>
                    <SelectItem value="completed" className={statusColors.completed}>
                      Completed
                    </SelectItem>
                    <SelectItem value="cancelled" className={statusColors.cancelled}>
                      Cancelled
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <span className={statusColors[order.status as keyof typeof statusColors]}>{order.status}</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const cashOnDeliveryOrders = orders.filter(
    (order) => order.payment_type === "cash_on_delivery" && order.status !== "deleted",
  )
  const creditCardOrders = orders.filter((order) => order.payment_type === "credit_card" && order.status !== "deleted")

  return (
    <div className="bg-background p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Manage Orders</h2>
      <Tabs defaultValue="cash_on_delivery">
        <TabsList>
          <TabsTrigger value="cash_on_delivery">Cash on Delivery Orders</TabsTrigger>
          <TabsTrigger value="credit_card">Credit Card Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="cash_on_delivery">{renderOrderTable(cashOnDeliveryOrders)}</TabsContent>
        <TabsContent value="credit_card">{renderOrderTable(creditCardOrders)}</TabsContent>
      </Tabs>
    </div>
  )
}

