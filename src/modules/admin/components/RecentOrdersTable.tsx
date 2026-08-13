import { Link } from 'react-router-dom'
import type { OrderRecord } from '../../../shared/types/order.type'
import { formatPrice } from '../../../shared/utils/format'
import { Badge, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shared/components/ui'
import { orderStatus } from '../../../shared/utils/order-status'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  Processing: 'default',
  Shipped: 'secondary',
  Delivered: 'outline',
}

interface RecentOrdersTableProps {
  orders: OrderRecord[]
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
            {orders.map((order) => {
              const status = orderStatus(order.placedAt)
              return (
                <TableRow key={order.orderNumber}>
                  <TableCell className="font-mono text-xs">{order.orderNumber}</TableCell>
                  <TableCell className="max-w-40 truncate">{order.customerName}</TableCell>
                  <TableCell className="text-right font-mono text-xs font-semibold">
                    {formatPrice(order.total)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
