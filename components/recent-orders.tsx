import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Order = {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
};

export function RecentOrders({ orders }: { orders: Order[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>{order.id.slice(0, 8)}</TableCell>
            <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
            <TableCell>${order.total_amount.toFixed(2)}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-sm ${
                order.status === "completed" 
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}>
                {order.status}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

