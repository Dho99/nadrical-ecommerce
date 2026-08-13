import { Link } from 'react-router-dom'
import { PackageOpen, RefreshCw } from 'lucide-react'
import type { AsyncStatus } from '../../../shared/types/common.type'
import type { OrderRecord } from '../../../shared/types/order.type'
import { orderStatus } from '../../../shared/utils/order-status'
import { formatPrice } from '../../../shared/utils/format'
import { Badge, Button, Card, EmptyState, Separator, Skeleton } from '../../../shared/components/ui'
import { formatOrderDate } from '../utils/profile.utils'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  Processing: 'default',
  Shipped: 'secondary',
  Delivered: 'outline',
}

interface OrderHistoryListProps {
  orders: OrderRecord[]
  status: AsyncStatus
  error: string | null
  onRetry: () => void
}

export function OrderHistoryList({ orders, status, error, onRetry }: OrderHistoryListProps) {
  if (status === 'loading') {
    return (
      <div className="flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-44 w-full" />
        ))}
      </div>
    )
  }

  if (status === 'error') {
    return (
      <EmptyState
        icon={<RefreshCw className="size-10" />}
        title="Couldn't load your orders"
        description={error ?? 'Something went wrong while fetching your order history.'}
        action={
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw /> Try again
          </Button>
        }
      />
    )
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<PackageOpen className="size-10" />}
        title="No orders yet"
        description="Every order you place will show up here, with its status and totals."
        action={
          <Button asChild>
            <Link to="/products">Browse the catalog</Link>
          </Button>
        }
      />
    )
  }

  return (
    <ul className="flex flex-col gap-4" aria-label="Order history">
      {orders.map((order) => {
        const statusLabel = orderStatus(order.placedAt)
        return (
          <li key={order.orderNumber}>
            <Card className="p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">
                    {formatOrderDate(order.placedAt)}
                  </p>
                  <h3 className="mt-0.5 font-display text-lg font-semibold tracking-tight">
                    {order.orderNumber}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {order.shippingMethod === 'express' ? 'Express' : 'Standard'} shipping · ETA{' '}
                    {order.etaDays} {order.etaDays === 1 ? 'day' : 'days'}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[statusLabel]}>{statusLabel}</Badge>
              </div>

              <Separator className="my-4" />

              <ul className="space-y-2">
                {order.lines.map((line, i) => (
                  <li
                    key={`${line.partNumber}-${i}`}
                    className="flex items-baseline justify-between gap-3 text-sm"
                  >
                    <span className="text-muted-foreground">
                      {line.name}
                      {line.variantName ? ` · ${line.variantName}` : ''} × {line.qty}
                    </span>
                    <span className="font-medium">{formatPrice(line.price * line.qty)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-display text-lg font-bold tracking-tight">
                  {formatPrice(order.total)}
                </span>
              </div>
            </Card>
          </li>
        )
      })}
    </ul>
  )
}
