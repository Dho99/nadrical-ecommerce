import { Link } from 'react-router-dom'
import { formatPrice } from '../../../shared/utils/format'
import { Card, Separator } from '../../../shared/components/ui'
import { ProductImage } from '../../../shared/components/ProductImage'
import type { CartItem, CartTotals } from '../../cart/types/cart.type'
import { SHIPPING_METHODS, type ShippingMethod } from '../types/checkout.type'

interface OrderSummaryProps {
  items: CartItem[]
  totals: CartTotals
  shippingMethod: ShippingMethod
}

export function OrderSummary({ items, totals, shippingMethod }: OrderSummaryProps) {
  const method = SHIPPING_METHODS.find((m) => m.id === shippingMethod)
  const shippingCost =
    shippingMethod === 'standard' && totals.subtotal >= 75 ? 0 : method?.price ?? 0
  const grandTotal = totals.subtotal + shippingCost

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
        <div className="flex items-center justify-between border-t pt-2">
          <dt className="font-semibold">Total</dt>
          <dd className="font-display text-lg font-bold tracking-tight">
            {formatPrice(grandTotal)}
          </dd>
        </div>
      </dl>

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
