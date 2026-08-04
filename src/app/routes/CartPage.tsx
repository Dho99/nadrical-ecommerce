import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { CartLineItem, CartSummary, useCart } from '../../modules/cart'
import { Button, EmptyState, Separator } from '../../shared/components/ui'

export function CartPage() {
  const { items, totals, totalQty, setQty, remove } = useCart()

  return (
    <div className="container mx-auto px-5 py-10 sm:px-8">
      <header className="mb-6">
        <p className="font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Your basket
        </p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight sm:text-5xl">Cart</h1>
      </header>

      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart className="size-10" />}
          title="Your cart is empty"
          description="Nothing here yet — browse the catalog and add a few products."
          action={
            <Button asChild>
              <Link to="/products">Browse the catalog</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid items-start gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ul aria-label="Cart items">
              {items.map((item, i) => (
                <li key={item.productId}>
                  <CartLineItem
                    item={item}
                    onSetQty={(qty) => setQty(item.productId, qty)}
                    onRemove={() => remove(item.productId)}
                  />
                  {i < items.length - 1 && <Separator />}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-5">
            <CartSummary totals={totals} totalQty={totalQty} />
          </div>
        </div>
      )}
    </div>
  )
}
