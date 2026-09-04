import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PackageOpen, RefreshCw, Repeat2, Truck, X } from 'lucide-react'
import { ProductImage } from '../../../shared/components/ProductImage'
import { PRODUCT_CATALOG } from '../../products/services/mock-data'
import { useCart } from '../../cart/hooks/useCart'
import { toast } from '@/shared/lib/alert'
import type { AsyncStatus } from '../../../shared/types/common.type'
import type { OrderWithItems } from '../../../shared/types/order.type'
import type { DbOrderStatus } from '../../../shared/types/database.type'
import { cn } from '../../../shared/utils/cn'
import { formatPrice } from '../../../shared/utils/format'
import {
  STATUS_STEPS,
  STATUS_STEP_LABEL,
  statusStepIndex,
  isTerminalBad,
  isCancellable,
} from '../../../shared/utils/order-status'
import { OrderStatusBadge } from '../../../shared/components/OrderStatusBadge'
import {
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Separator,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
} from '../../../shared/components/ui'
import { formatOrderDate } from '../utils/profile.utils'

interface OrderHistoryListProps {
  orders: OrderWithItems[]
  status: AsyncStatus
  error: string | null
  onRetry: () => void
  onCancel: (orderId: string) => Promise<void> | void
  cancellingId: string | null
}

type TabKey = 'all' | 'processing' | 'shipped' | 'completed' | 'cancelled'

const TAB_GROUPS: Record<TabKey, (s: DbOrderStatus) => boolean> = {
  all: () => true,
  processing: (s) => s === 'pending_payment' || s === 'paid' || s === 'processing',
  shipped: (s) => s === 'shipped',
  completed: (s) => s === 'completed',
  cancelled: (s) => s === 'cancelled' || s === 'refunded',
}

const TAB_EMPTY: Record<TabKey, { title: string; description: string }> = {
  all: { title: 'No orders yet', description: 'Every order you place will show up here, with its status and totals.' },
  processing: { title: 'No processing orders', description: 'You have no orders waiting for payment, confirmation, or packing.' },
  shipped: { title: 'No orders in transit', description: 'When an order ships, it will appear here with tracking info.' },
  completed: { title: 'No completed orders', description: 'Delivered orders will show up here once they arrive.' },
  cancelled: { title: 'No cancelled orders', description: 'No orders have been cancelled or refunded.' },
}

function Stepper({ status }: { status: DbOrderStatus }) {
  const active = statusStepIndex(status)
  return (
    <ol className="flex w-full items-center" aria-label="Order progress">
      {STATUS_STEPS.map((step, i) => {
        const done = i < active
        const current = i === active
        const label = STATUS_STEP_LABEL[step]
        return (
          <li key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  'size-2.5 rounded-full transition-all',
                  done && 'bg-primary',
                  current && 'bg-primary ring-4 ring-primary/20',
                  !done && !current && 'bg-border',
                )}
              />
              <span
                className={cn(
                  'font-mono text-[9px] uppercase tracking-wider whitespace-nowrap',
                  done || current ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <span className={cn('mx-1 h-px flex-1', done ? 'bg-primary' : 'bg-border')} />
            )}
          </li>
        )
      })}
    </ol>
  )
}

function TerminalBanner({ status }: { status: DbOrderStatus }) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
      <X className="size-3.5 shrink-0" />
      <span className="font-medium">
        {status === 'cancelled' ? 'This order was cancelled' : 'This order has been refunded'}
      </span>
    </div>
  )
}

function productImage(productId: string): string | undefined {
  return PRODUCT_CATALOG.find((p) => p.id === productId)?.cover_image_url
}

export function OrderHistoryList({
  orders,
  status,
  error,
  onRetry,
  onCancel,
  cancellingId,
}: OrderHistoryListProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [cancelTarget, setCancelTarget] = useState<OrderWithItems | null>(null)
  const { add } = useCart()
  const navigate = useNavigate()

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = { all: orders.length, processing: 0, shipped: 0, completed: 0, cancelled: 0 }
    for (const o of orders) {
      const s = (o.status ?? 'pending_payment') as DbOrderStatus
      if (s === 'pending_payment' || s === 'paid' || s === 'processing') c.processing++
      if (s === 'shipped') c.shipped++
      if (s === 'completed') c.completed++
      if (s === 'cancelled' || s === 'refunded') c.cancelled++
    }
    return c
  }, [orders])

  const filtered = useMemo(
    () => (activeTab === 'all' ? orders : orders.filter((o) => TAB_GROUPS[activeTab]((o.status ?? 'pending_payment') as DbOrderStatus))),
    [orders, activeTab],
  )

  if (status === 'loading') {
    return (
      <div className="flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-52 w-full" />
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

  const empty = TAB_EMPTY[activeTab]

  return (
    <>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
        <TabsList variant="line" className="flex w-full justify-start">
          {(['all', 'processing', 'shipped', 'completed', 'cancelled'] as const).map((key) => (
            <TabsTrigger key={key} value={key} className="gap-1.5">
              {key === 'all' ? 'All' : key.charAt(0).toUpperCase() + key.slice(1)}
              <span className="font-mono text-[10px] text-muted-foreground">({counts[key]})</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<PackageOpen className="size-8" />}
          title={empty.title}
          description={empty.description}
        />
      ) : (
        <ul className="flex flex-col gap-4" aria-label="Order history">
          {filtered.map((order) => {
            const oStatus = (order.status ?? 'pending_payment') as DbOrderStatus
            const terminal = isTerminalBad(oStatus)
            const cancellable = isCancellable(oStatus)
            const etaDays = order.shipping_method === 'express' ? 1 : 4

            return (
              <li key={order.order_number}>
                <Card className={cn('p-5 sm:p-6', terminal && 'opacity-75')}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">
                        {formatOrderDate(order.placed_at ?? '')}
                      </p>
                      <h3 className="mt-0.5 font-display text-lg font-semibold tracking-tight">
                        {order.order_number}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {order.recipient_name}
                        {order.recipient_phone ? ` · ${order.recipient_phone}` : ''}
                      </p>
                      {(order.shipping_city || order.shipping_province) && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {[order.shipping_city, order.shipping_province].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                    <OrderStatusBadge status={oStatus} />
                  </div>

                  <div className="mt-4">
                    {terminal ? (
                      <TerminalBanner status={oStatus} />
                    ) : (
                      <Stepper status={oStatus} />
                    )}
                  </div>

                  {order.tracking_number && (oStatus === 'shipped' || oStatus === 'completed') && (
                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <Truck className="size-3.5 text-muted-foreground" />
                      <span className="font-mono text-muted-foreground">{order.tracking_number}</span>
                      {oStatus === 'shipped' && (
                        <span className="text-muted-foreground">
                          · ETA {etaDays} {etaDays === 1 ? 'day' : 'days'}
                        </span>
                      )}
                      {oStatus === 'completed' && order.delivered_at && (
                        <span className="text-muted-foreground">
                          · Delivered {formatOrderDate(order.delivered_at)}
                        </span>
                      )}
                    </div>
                  )}

                  {oStatus === 'cancelled' && order.cancelled_at && (
                    <p className="mt-3 text-xs text-destructive">
                      Cancelled {formatOrderDate(order.cancelled_at)}
                    </p>
                  )}

                  <Separator className="my-4" />

                  <ul className="space-y-2">
                    {order.order_items.map((line, i) => {
                      const img = productImage(line.product_id)
                      return (
                        <li
                          key={`${line.sku_snapshot ?? line.product_id}-${i}`}
                          className="flex items-center gap-3 text-sm"
                        >
                          <div className="size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                            {img ? (
                              <ProductImage src={img} alt={line.product_name_snapshot} className="h-full w-full" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                <PackageOpen className="size-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{line.product_name_snapshot}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {line.variant_name_snapshot ? `${line.variant_name_snapshot} · ` : ''}×{line.quantity} · {line.sku_snapshot ?? line.product_id}
                            </p>
                          </div>
                          <span className="font-medium">{formatPrice(line.unit_price * line.quantity)}</span>
                        </li>
                      )
                    })}
                  </ul>

                  {(order.shipping_address_line_1 || order.tracking_number) && (
                    <div className="mt-3 rounded-md bg-muted/50 p-3 text-xs leading-relaxed">
                      <p className="font-medium">Shipping information</p>
                      {order.shipping_address_line_1 && (
                        <p className="text-muted-foreground">
                          {order.shipping_address_line_1} {order.shipping_city ? `, ${order.shipping_city}` : ''}{' '}
                          {order.shipping_province ?? ''} {order.shipping_postal_code ?? ''}
                        </p>
                      )}
                      {order.tracking_number && (
                        <p className="mt-1 font-mono text-muted-foreground">Tracking: {order.tracking_number}</p>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {order.shipping_method === 'express' ? 'Express' : 'Standard'}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          for (const line of order.order_items) {
                            const prod = PRODUCT_CATALOG.find((p) => p.id === line.product_id)
                            if (prod) add({ ...prod, variant_name: line.variant_name_snapshot ?? undefined }, line.quantity)
                          }
                          toast.success('Items added to cart', { position: 'top-center', style: { marginTop: '72px' }, closeButton: true })
                          navigate('/cart')
                        }}
                      >
                        <Repeat2 className="size-3" /> Reorder
                      </Button>
                      {cancellable && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-destructive hover:text-destructive"
                          disabled={cancellingId === order.id}
                          onClick={() => setCancelTarget(order)}
                        >
                          <X className="size-3" />
                          {cancellingId === order.id ? 'Cancelling…' : 'Cancel'}
                        </Button>
                      )}
                    </div>
                    <span className="font-display text-lg font-bold tracking-tight">
                      {formatPrice(order.grand_total)}
                    </span>
                  </div>
                </Card>
              </li>
            )
          })}
        </ul>
      )}

      <Dialog
        open={cancelTarget !== null}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this order?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Your order will be cancelled immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)}>
              Keep order
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!cancelTarget) return
                const id = cancelTarget.id
                setCancelTarget(null)
                await onCancel(id)
              }}
            >
              Yes, cancel order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
