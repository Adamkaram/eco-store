"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Eye, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type Order = {
  id: string
  created_at: string
  status: string
  customer_name: string | null
  total_amount: number
  user_id: string
  profile_full_name: string | null
  profile_email: string | null
  contact_email: string | null
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<Order | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          profiles (
            full_name,
            phone
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      setOrders(data || [])
    } catch (error: any) {
      console.error("Error fetching orders:", error)
      setError(error.message || "An error occurred while fetching orders.")
      toast({
        title: "Error",
        description: error.message || "An error occurred while fetching orders.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBlockUser = async (userId: string) => {
    try {
      const { error } = await supabase.from("profiles").update({ is_blocked: true }).eq("id", userId)

      if (error) throw error

      toast({
        title: "User Blocked",
        description: "The user has been blocked due to abusive behavior.",
      })

      // Refresh the orders list
      fetchOrders()
    } catch (error: any) {
      console.error("Error blocking user:", error)
      toast({
        title: "Error",
        description: "Failed to block user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getCustomerName = (order: Order) => {
    return order.customer_name || order.profiles?.full_name || "Anonymous"
  }

  const getCustomerEmail = (order: Order) => {
    return order.contact_email || "N/A"
  }

  const filteredOrders = orders.filter(
    (order) =>
      getCustomerName(order).toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCustomerEmail(order).toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <Input
            type="search"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center p-4">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="link" onClick={() => setSelectedUser(order)}>
                          {getCustomerName(order)}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>User Information</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-bold">Name:</span>
                            <span className="col-span-3">{selectedUser ? getCustomerName(selectedUser) : ""}</span>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-bold">Email:</span>
                            <span className="col-span-3">{selectedUser ? getCustomerEmail(selectedUser) : ""}</span>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-bold">User ID:</span>
                            <span className="col-span-3">{selectedUser?.user_id || ""}</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            if (selectedUser) {
                              handleBlockUser(selectedUser.user_id)
                              setIsDialogOpen(false)
                            }
                          }}
                          variant="destructive"
                        >
                          Block User
                        </Button>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                  <TableCell>{getCustomerEmail(order)}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => router.push(`/admin/orders/${order.id}`)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
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

