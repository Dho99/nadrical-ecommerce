import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../../../shared/utils/format'
import { Card, Separator } from '../../../shared/components/ui'
import { ProductImage } from '../../../shared/components/ProductImage'
import type { CartItem, CartTotals } from '../../cart/types/cart.type'
import { SHIPPING_METHODS, type ShippingMethod } from '../types/checkout.type'
import { useVoucher } from '../../voucher/hooks/useVoucher'
import { VoucherField } from '../../voucher/components/VoucherField'

interface OrderSummaryProps {
  items: CartItem[]
  totals: CartTotals
  shippingMethod: ShippingMethod
}

export function OrderSummary({ items, totals, shippingMethod }: OrderSummaryProps) {
  const method = SHIPPING_METHODS.find((m) => m.id === shippingMethod)
  const shippingCost =
    shippingMethod === 'standard' && totals.subtotal >= 75 ? 0 : method?.price ?? 0
  const { applied, discount } = useVoucher()
  const voucherDiscount = applied ? discount(totals.subtotal, shippingCost) : 0
  const grandTotal = Math.max(0, totals.subtotal - voucherDiscount + shippingCost)
  const { estimatedDate, loyaltyPoints } = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity -- Date.now is impure but needed for delivery estimate display
    const d = new Date(Date.now() + (shippingMethod === 'express' ? 1 : 4) * 86400000)
    return { estimatedDate: d, loyaltyPoints: Math.floor(grandTotal / 10) }
  }, [shippingMethod, grandTotal])

  return (
    <Card className="h-fit p-5">
      <h2 className="font-display text-lg font-bold tracking-tight">Your order</h2>

      <ul className="mt-4">
        {items.map((item) => (
          <li key={`${item.product_id}-${item.variant_id ?? 'base'}`} className="flex items-center gap-3 py-2.5">
            <Link
              to={`/products/${item.product_id}`}
              className="size-14 shrink-0 overflow-hidden rounded-md border bg-muted"
            >
              <ProductImage
                src={item.cover_image_url}
                alt={item.product_name}
                className="h-full w-full"
              />
            </Link>
            <div className="min-w-0 grow">
              <p className="truncate text-sm font-medium">{item.product_name}</p>
              {item.variant_name && (
                <p className="truncate text-xs text-muted-foreground">{item.variant_name}</p>
              )}
              <p className="font-mono text-xs text-muted-foreground">
                {item.sku} · ×{item.quantity}
              </p>
            </div>
            <span className="font-mono text-sm font-semibold">
              {formatPrice(item.unit_price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <VoucherField subtotal={totals.subtotal} shipping={shippingCost} />
      </div>

      <Separator className="my-3" />

      <dl className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>{formatPrice(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Shipping · {method?.label.toLowerCase()}</dt>
          <dd>{shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}</dd>
        </div>
        {voucherDiscount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <dt>Discount{applied ? ` · ${applied.code}` : ''}</dt>
            <dd>-{formatPrice(voucherDiscount)}</dd>
          </div>
        )}
        <div className="flex items-center justify-between border-t pt-2">
          <dt className="font-semibold">Total</dt>
          <dd className="font-display text-lg font-bold tracking-tight">
            {formatPrice(grandTotal)}
          </dd>
        </div>
      </dl>

      <div className="rounded-lg bg-muted/60 p-3 text-xs leading-relaxed">
        <p className="font-medium">Delivery detail preview</p>
        <p className="mt-1 text-muted-foreground">
          Deliver to: <span className="text-foreground">your saved address</span> · Estimated delivery{' '}
          {estimatedDate.toLocaleDateString('en-ID', { day: 'numeric', month: 'short' })} · Loyalty points
          you&apos;ll get: <span className="font-semibold text-foreground">{loyaltyPoints} pts</span>
        </p>
        <p className="mt-1 text-muted-foreground">Shipping within 24 hours upon confirmation of payment</p>
      </div>

      <Separator className="my-3" />

      <Link
        to="/cart"
        className="font-mono text-xs tracking-[0.12em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        ← EDIT CART
      </Link>
    </Card>
  )
}
