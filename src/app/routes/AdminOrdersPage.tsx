import { ListPagination, useOrders } from '../../modules/admin'
import { formatPrice } from '../../shared/utils/format'
import { OrderStatusBadge } from '../../shared/components/OrderStatusBadge'
import {
  EmptyState,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../shared/components/ui'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AdminOrdersPage() {
  const { orders, total, pageStart, status, error, goNext, goPrev } = useOrders()

  return (
    <div>
      <header className="mb-6">
        <p className="font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Store admin · {total} orders recorded
        </p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight sm:text-5xl">Orders</h1>
      </header>

      {status === 'loading' && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      )}

      {status === 'error' && (
        <EmptyState
          title="Could not load orders"
          description={error ?? 'Something went wrong.'}
        />
      )}

      {status === 'success' && total === 0 && (
        <EmptyState
          title="No orders yet"
          description="Orders placed on the storefront will appear here."
        />
      )}

      {status === 'success' && total > 0 && (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const itemCount = order.order_items.reduce((sum, line) => sum + line.quantity, 0)
                return (
                  <TableRow key={order.order_number}>
                    <TableCell className="font-mono text-xs">{order.order_number}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(order.placed_at ?? '')}
                    </TableCell>
                    <TableCell className="max-w-52">
                      <p className="truncate font-medium">{order.recipient_name}</p>
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        {order.user_id}
                      </p>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      ×{itemCount}
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold">
                      {formatPrice(order.grand_total)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          <ListPagination
            pageStart={pageStart}
            pageEnd={pageStart + orders.length - 1}
            total={total}
            onPrev={goPrev}
            onNext={goNext}
          />
        </div>
      )}
    </div>
  )
}
