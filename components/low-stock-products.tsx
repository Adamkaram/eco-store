import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Product = {
  id: string;
  name: string;
  stock: number;
  price: number;
};

export function LowStockProducts({ products }: { products: Product[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product Name</TableHead>
          <TableHead>Current Stock</TableHead>
          <TableHead>Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>{product.name}</TableCell>
            <TableCell className="text-red-600">{product.stock}</TableCell>
            <TableCell>${product.price.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

