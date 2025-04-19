"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Order = {
  id: string
  created_at: string
  total_amount: number
  status: string
  user_id: string
  user: {
    full_name: string
    email: string
  }
}

export default function OrderDetailPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const { id } = useParams()
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
        *,
        user:profiles(full_name, email)
      `)
        .eq("id", id)
        .single()

      if (error) throw error

      setOrder(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const updateOrderStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", id)

      if (error) throw error

      setOrder((prevOrder) => (prevOrder ? { ...prevOrder, status: newStatus } : null))

      // Send notification to user
      await supabase.from("notifications").insert({
        user_id: order?.user_id,
        message: `Your order (ID: ${id}) status has been updated to ${newStatus}.`,
        type: "order_update",
      })

      toast({
        title: "Order Updated",
        description: `Order status has been updated to ${newStatus}.`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (!order) return <div>Loading...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Order Details</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Order ID: {order.id}</p>
        <p>Date: {new Date(order.created_at).toLocaleString()}</p>
        <p>Customer: {order.user.full_name}</p>
        <p>Email: {order.user.email}</p>
        <p>Total Amount: ${order.total_amount.toFixed(2)}</p>
        <p>Current Status: {order.status}</p>
        <div className="mt-4">
          <Select onValueChange={updateOrderStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Update Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

