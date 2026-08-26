import { Link } from 'react-router-dom'
import type { OrderWithItems } from '../../../shared/types/order.type'
import { formatPrice } from '../../../shared/utils/format'
import { Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shared/components/ui'
import { OrderStatusBadge } from '../../../shared/components/OrderStatusBadge'

interface RecentOrdersTableProps {
  orders: OrderWithItems[]
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Recent orders</CardTitle>
        <Link to="/admin/orders" className="text-sm font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground">
          View all
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.order_number}>
                <TableCell className="font-mono text-xs">{order.order_number}</TableCell>
                <TableCell className="max-w-40 truncate">{order.recipient_name}</TableCell>
                <TableCell className="text-right font-mono text-xs font-semibold">
                  {formatPrice(order.grand_total)}
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
