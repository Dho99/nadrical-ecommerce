import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, PackageOpen, Repeat2, Star, X } from 'lucide-react'
import { toast } from '@/shared/lib/alert'
import { profileService } from '../../modules/profile'
import { orderRepository } from '../../modules/checkout/services/order.repository'
import { useCart } from '../../modules/cart/hooks/useCart'
import { useAuth } from '../../modules/auth'
import { PRODUCT_CATALOG } from '../../modules/products/services/mock-data'
import { ReviewFormDialog, userReviewStorage } from '../../modules/products'
import {
  InvoiceButton,
  ShipmentAccordion,
  useRefund,
} from '../../modules/orders'
import { shipmentService } from '../../modules/orders/services/shipment.service'
import type { OrderWithItems } from '../../modules/orders/types/order.type'
import { ProductImage } from '../../shared/components/ProductImage'
import { OrderStatusBadge } from '../../shared/components/OrderStatusBadge'
import { Badge, Button, Card, EmptyState, Skeleton } from '../../shared/components/ui'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../shared/components/ui/alert-dialog'
import { formatPrice } from '../../shared/utils/format'

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { add } = useCart()
  const navigate = useNavigate()
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [reviewingItem, setReviewingItem] = useState<{
    product: { id: string; name: string; cover_image_url?: string }
    orderNumber: string
    variantName?: string
  } | null>(null)
  const [reviewsVersion, setReviewsVersion] = useState(0)
  const { record } = useRefund(order)
  const email = user?.email ?? null

  const load = useCallback(async () => {
    if (!id) {
      setStatus('error')
      return
    }
    setStatus('loading')
    try {
      let found: OrderWithItems | null = null
      try {
        found = await orderRepository.get(id)
      } catch {
        // fallback
      }
      if (!found && email) {
        const all = await profileService.getOrderHistory(email)
        found =
          all.find((o) => o.order_number === id || o.id === id) ?? null
      }
      setOrder(found)
      setStatus(found ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }, [email, id])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial order load
    void load()
  }, [load])

  const normStatus = (order?.status ?? '').toLowerCase()
  const canCancel =
    normStatus === 'pending_payment' ||
    normStatus === 'paid' ||
    normStatus === 'processing' ||
    normStatus === 'waiting_confirmation' ||
    normStatus === 'waiting_ongkir'
  const canReorder = normStatus === 'completed' || normStatus === 'delivering'
  const canInvoice = ['paid', 'processing', 'shipped', 'completed', 'delivering', 'waiting_confirmation'].includes(normStatus)
  const canRefund = normStatus === 'completed' || normStatus === 'delivering'

  const cancelOrder = async () => {
    if (!order) return
    setCancelling(true)
    try {
      await profileService.cancelOrder(email ?? '', order.id)
      setOrder({ ...order, status: 'cancelled', cancelled_at: new Date().toISOString() })
      toast.success('Order cancelled')
      setCancelOpen(false)
    } finally {
      setCancelling(false)
    }
  }

  const reorder = () => {
    if (!order) return
    for (const line of order.order_items) {
      const prod = PRODUCT_CATALOG.find((p) => p.id === line.product_id)
      if (prod) add({ ...prod, variant_name: line.variant_name_snapshot ?? undefined }, line.quantity)
    }
    toast.success('Items added to cart', { position: 'top-center', style: { marginTop: '72px' }, closeButton: true })
    navigate('/cart')
  }

  const productImage = (productId: string) => PRODUCT_CATALOG.find((p) => p.id === productId)?.cover_image_url

  if (status === 'loading') {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  if (status === 'error' || !order) {
    return (
      <EmptyState
        icon={<PackageOpen className="size-10" />}
        title="Order not found"
        description="We couldn't find this order on your account."
        action={
          <Button variant="outline" asChild>
            <Link to="/profile/orders">Back to orders</Link>
          </Button>
        }
      />
    )
  }

  const paidAmount = order.grand_total ?? order.subtotal

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/profile/orders"
          className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" /> Order history
        </Link>
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">{order.order_number}</h2>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              Order date: {order.placed_at ? new Date(order.placed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {order.recipient_name} {order.recipient_phone ? `| ${order.recipient_phone}` : ''}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {record && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
            <span className="font-medium text-primary">Refund: {record.status}</span>
            <span className="text-muted-foreground">
              {record.timeline[record.timeline.length - 1]?.label} ·{' '}
              {new Date(record.requestedAt).toLocaleDateString('en-ID', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        )}
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* <Card className="p-5 sm:p-6">
            <h3 className="font-display text-lg font-bold tracking-tight">Order journey</h3>
            <div className="mt-4">
              <OrderTimeline order={order} />
            </div>
          </Card> */}

          <Card className="p-5 sm:p-6">
            <h3 className="font-display text-lg font-bold tracking-tight">Shipment tracking</h3>
            <div className="mt-4">
              <ShipmentAccordion order={order} />
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <h3 className="font-display text-lg font-bold tracking-tight">Items</h3>
            <ul className="mt-3 divide-y">
              {order.order_items.map((line, i) => {
                const existingReview = reviewsVersion >= 0 ? userReviewStorage.findReview(order.order_number, line.product_id, line.variant_name_snapshot) : undefined
                const isCompleted = normStatus === 'completed'
                return (
                  <li key={`${line.id}-${i}`} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="flex flex-1 items-center gap-3 min-w-[200px]">
                      <div className="size-14 shrink-0 overflow-hidden rounded-md border bg-muted">
                        {line.image_url || productImage(line.product_id) ? (
                          <ProductImage src={(line.image_url || productImage(line.product_id))!} alt={line.product_name_snapshot} className="h-full w-full" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <PackageOpen className="size-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link to={`/products/${line.product_id}`} className="block truncate text-sm font-medium hover:underline">
                          {line.product_name_snapshot}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          Qty: {line.quantity}
                          {line.variant_name_snapshot ? ` · Variant: ${line.variant_name_snapshot}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold">
                        {formatPrice(line.line_total ?? line.unit_price * line.quantity)}
                      </span>
                      {isCompleted && (
                        existingReview ? (
                          <Badge variant="secondary" className="gap-1 border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
                            <Star className="size-3 fill-amber-400 text-amber-400" />
                            {existingReview.rating}/5 Ulasan Terkirim
                          </Badge>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 text-xs"
                            onClick={() =>
                              setReviewingItem({
                                product: {
                                  id: line.product_id,
                                  name: line.product_name_snapshot,
                                  cover_image_url: productImage(line.product_id),
                                },
                                orderNumber: order.order_number,
                                variantName: line.variant_name_snapshot,
                              })
                            }
                          >
                            <Star className="size-3.5 fill-amber-400 text-amber-400" /> Beri Ulasan
                          </Button>
                        )
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-display text-lg font-bold tracking-tight">Shipping Detail</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipment Method</dt>
                <dd className="font-medium">{shipmentService.courierLabel(order.shipping_method)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tracking</dt>
                <dd className="font-mono font-medium">
                  {shipmentService.isTrackable(order) ? shipmentService.trackingNumber(order) : '—'}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground">Recipient Address</dt>
                <dd className="text-right">
                  <p className="font-medium">{order.recipient_name}</p>
                  <p className="text-muted-foreground">
                    {order.shipping_address_line_1}
                    {order.shipping_city ? `, ${order.shipping_city}` : ''} {order.shipping_province ?? ''} {order.shipping_postal_code ?? ''}
                  </p>
                  <p className="font-mono text-muted-foreground">{order.recipient_phone}</p>
                </dd>
              </div>
            </dl>
          </Card>

          <Card className="p-5">
            <h3 className="font-display text-lg font-bold tracking-tight">Order actions</h3>
            <div className="mt-3 grid gap-2">
              {canInvoice && <InvoiceButton order={order} email={email ?? undefined} variant="outline" />}
              {canReorder && (
                <Button type="button" variant="outline" size="sm" onClick={reorder}>
                  <Repeat2 className="size-3.5" /> Reorder
                </Button>
              )}
              {canRefund && (
                <Button asChild variant="outline" size="sm">
                  <Link to={`/profile/orders/${order.order_number}/refund`}>
                    {record ? 'View refund' : 'Request refund'}
                  </Link>
                </Button>
              )}
              {canCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setCancelOpen(true)}
                >
                  <X className="size-3.5" /> Cancel order
                </Button>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatPrice(order.subtotal ?? 0)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd>{order.shipping_total ? formatPrice(order.shipping_total) : 'FREE'}</dd>
              </div>
              {order.tax_total !== undefined && order.tax_total > 0 ? (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Pajak (PPN 11%)</dt>
                  <dd>{formatPrice(order.tax_total)}</dd>
                </div>
              ) : null}
              {order.service_fee_total !== undefined && order.service_fee_total > 0 ? (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Payment fee</dt>
                  <dd>{formatPrice(order.service_fee_total)}</dd>
                </div>
              ) : null}
              {order.discount_total !== undefined && order.discount_total > 0 ? (
                <div className="flex justify-between text-emerald-600">
                  <dt>Discount</dt>
                  <dd>-{formatPrice(order.discount_total)}</dd>
                </div>
              ) : null}
              <div className="flex items-center justify-between border-t pt-2">
                <dt className="font-semibold">Total</dt>
                <dd className="font-display text-lg font-bold tracking-tight">{formatPrice(paidAmount)}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
            <AlertDialogDescription>
              Order {order.order_number} will be cancelled immediately. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Keep order</AlertDialogCancel>
            <AlertDialogAction
              disabled={cancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault()
                void cancelOrder()
              }}
            >
              {cancelling ? 'Cancelling…' : 'Yes, cancel order'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {reviewingItem && (
        <ReviewFormDialog
          open={Boolean(reviewingItem)}
          onOpenChange={(open) => !open && setReviewingItem(null)}
          product={reviewingItem.product}
          orderNumber={reviewingItem.orderNumber}
          variantName={reviewingItem.variantName}
          reviewerName={user?.user_metadata?.full_name || user?.email || 'Demo User'}
          onSubmitted={() => setReviewsVersion((v) => v + 1)}
        />
      )}
    </div>
  )
}
