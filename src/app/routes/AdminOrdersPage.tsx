import { ListPagination, useOrders } from '../../modules/admin'
import { orderStatus } from '../../shared/utils/order-status'
import { formatPrice } from '../../shared/utils/format'
import {
  Badge,
  EmptyState,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../shared/components/ui'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  Processing: 'default',
  Shipped: 'secondary',
  Delivered: 'outline',
}

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
                const statusLabel = orderStatus(order.placedAt)
                const itemCount = order.lines.reduce((sum, line) => sum + line.qty, 0)
                return (
                  <TableRow key={order.orderNumber}>
                    <TableCell className="font-mono text-xs">{order.orderNumber}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(order.placedAt)}
                    </TableCell>
                    <TableCell className="max-w-52">
                      <p className="truncate font-medium">{order.customerName}</p>
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        {order.email}
                      </p>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      ×{itemCount}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[statusLabel]}>{statusLabel}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold">
                      {formatPrice(order.total)}
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
