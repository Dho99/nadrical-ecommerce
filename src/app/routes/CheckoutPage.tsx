import { Link } from 'react-router-dom'
import { PackageX } from 'lucide-react'
import { CheckoutForm, OrderSummary } from '../../modules/checkout'
import { useCart } from '../../modules/cart/hooks/useCart'
import { Button, EmptyState } from '../../shared/components/ui'

export function CheckoutPage() {
  const { items, totals, clear } = useCart()

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-5 py-16 sm:px-8">
        <EmptyState
          icon={<PackageX className="size-10" />}
          title="Nothing to check out"
          description="Your cart is empty — add some products before placing an order."
          action={
            <Button asChild>
              <Link to="/products">Browse the catalog</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-5 py-10 sm:px-8">
      <header className="mb-6">
        <p className="font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Three steps, zero surprises
        </p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight sm:text-5xl">Checkout</h1>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <CheckoutForm payloadBase={{ items, totals }} onOrderPlaced={clear} />
        </div>
        <div className="lg:col-span-5">
          <OrderSummary items={items} totals={totals} shippingMethod="standard" />
        </div>
      </div>
    </div>
  )
}
