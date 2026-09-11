import { Link } from 'react-router-dom'
import { formatPrice } from '../../../shared/utils/format'
import { Card, Separator } from '../../../shared/components/ui'
import { useVoucher } from '../../voucher/hooks/useVoucher'
import { VoucherField } from '../../voucher/components/VoucherField'
import { shippingService } from '../services/shipping.service'
import { paymentService } from '../services/payment.service'
import { useCheckoutRuntime } from '../hooks/useCheckoutRuntime'
import type { CartItem } from '../../cart/types/cart.type'
import { CheckoutProductItem } from './CheckoutProductItem'

interface OrderSummaryProps {
  items: CartItem[]
}

export function OrderSummary({ items }: OrderSummaryProps) {
  const subtotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)
  const { applied, discount } = useVoucher()
  const shippingMethod = useCheckoutRuntime((s) => s.shippingMethod)
  const paymentKind = useCheckoutRuntime((s) => s.paymentKind)
  const quote = shippingService.quote(shippingMethod, subtotal)
  const voucherDiscount = applied ? discount(subtotal, quote.cost) : 0
  const paymentFee = paymentService.fee(paymentKind, subtotal)
  const grandTotal = Math.max(0, subtotal - voucherDiscount + quote.cost + paymentFee)
  const etaDays = shippingService.etaDays(shippingMethod)
  const method = shippingService.getMethod(shippingMethod)

  const estimatedDate = new Date(
    // eslint-disable-next-line react-hooks/purity -- delivery estimate uses current time
    Date.now() + etaDays * 86400000,
  )
  const loyaltyPoints = Math.floor(grandTotal / 10)

  return (
    <Card className="h-fit p-5">
      <h2 className="font-display text-lg font-bold tracking-tight">Your order</h2>

      <ul className="mt-4 divide-y">
        {items.map((item) => (
          <li key={`${item.product_id}-${item.variant_id ?? 'base'}`}>
            <CheckoutProductItem line={item} />
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <VoucherField subtotal={subtotal} shipping={quote.cost} />
      </div>

      <Separator className="my-3" />

      <dl className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Shipping · {method.label}</dt>
          <dd>{quote.cost === 0 ? 'FREE' : formatPrice(quote.cost)}</dd>
        </div>
        {paymentFee > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Payment fee</dt>
            <dd>{formatPrice(paymentFee)}</dd>
          </div>
        )}
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
        <p className="mt-1 text-muted-foreground">Deliver to: <span className="text-foreground">your saved address</span></p>
        <p className="text-muted-foreground">Estimated delivery {estimatedDate.toLocaleDateString('en-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        <p className="text-muted-foreground">Loyalty points you&apos;ll get: <span className="font-semibold text-foreground">{loyaltyPoints} pts</span></p>
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
