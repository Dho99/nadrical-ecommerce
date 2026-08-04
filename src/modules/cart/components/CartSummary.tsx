import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button, Card } from '../../../shared/components/ui'
import { formatPrice } from '../../../shared/utils/format'
import { FREE_SHIPPING_THRESHOLD } from '../services/cart.service'
import type { CartTotals } from '../types/cart.type'

interface CartSummaryProps {
  totals: CartTotals
  totalQty: number
}

export function CartSummary({ totals, totalQty }: CartSummaryProps) {
  const toFreeShip = Math.max(0, FREE_SHIPPING_THRESHOLD - totals.subtotal)

  return (
    <Card className="h-fit p-5">
      <h2 className="font-display text-xl font-bold tracking-tight">Order summary</h2>

      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Items</dt>
          <dd>{totalQty}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="font-medium">{formatPrice(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd className="font-medium">{totals.shipping === 0 ? 'FREE' : formatPrice(totals.shipping)}</dd>
        </div>
        {toFreeShip > 0 && (
          <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            Add <span className="font-semibold text-foreground">{formatPrice(toFreeShip)}</span> more
            to unlock free shipping
          </p>
        )}
        <div className="flex items-center justify-between border-t pt-3">
          <dt className="font-semibold">Total</dt>
          <dd className="font-display text-xl font-bold tracking-tight">
            {formatPrice(totals.total)}
          </dd>
        </div>
      </dl>

      <Link to="/checkout" className="mt-5 block">
        <Button size="lg" className="w-full">
          Checkout <ArrowRight />
        </Button>
      </Link>
      <Link
        to="/products"
        className="mt-3 block text-center font-mono text-xs tracking-[0.12em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        CONTINUE BROWSING
      </Link>
    </Card>
  )
}
