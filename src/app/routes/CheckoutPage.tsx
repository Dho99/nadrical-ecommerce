import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PackageX } from 'lucide-react'
import { CheckoutForm, OrderSummary } from '../../modules/checkout'
import { useCheckoutRuntime } from '../../modules/checkout/hooks/useCheckoutRuntime'
import { useCart } from '../../modules/cart/hooks/useCart'
import { useAuth } from '../../modules/auth'
import { Button, EmptyState } from '../../shared/components/ui'
import type { OrderConfirmation } from '../../modules/checkout/types/checkout.type'

export function CheckoutPage() {
  const { items, totals, clear } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const resetRuntime = useCheckoutRuntime((s) => s.reset)
  const [isPlaced, setIsPlaced] = useState(false)

  useEffect(() => {
    resetRuntime()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleOrderPlaced = useCallback(
    (confirmation: OrderConfirmation) => {
      setIsPlaced(true)
      clear()
      navigate('/checkout/confirmation', { state: confirmation, replace: true })
    },
    [clear, navigate],
  )

  if (items.length === 0 && !isPlaced) {
    return (
      <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
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
    <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
      <header className="mb-6">
        <p className="font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Three steps, zero surprises
        </p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight sm:text-5xl">Checkout</h1>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <CheckoutForm
            payloadBase={{ items, totals }}
            initialValues={{ recipient_name: user?.full_name, email: user?.email }}
            onOrderPlaced={handleOrderPlaced}
          />
        </div>
        <div className="lg:col-span-5">
          <OrderSummary items={items} />
        </div>
      </div>
    </div>
  )
}
