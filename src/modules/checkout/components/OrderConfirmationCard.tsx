import { Link } from 'react-router-dom'
import { PackageCheck } from 'lucide-react'
import { Button, Card, Separator } from '../../../shared/components/ui'
import { formatPrice } from '../../../shared/utils/format'
import type { OrderConfirmation } from '../types/checkout.type'

interface OrderConfirmationCardProps {
  confirmation: OrderConfirmation
}

export function OrderConfirmationCard({ confirmation }: OrderConfirmationCardProps) {
  return (
    <Card className="mx-auto max-w-lg p-6 text-center sm:p-8">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <PackageCheck className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">Order placed</h1>

      <Separator className="my-5" />

      <p className="font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase">Order number</p>
      <p className="mt-1 font-display text-4xl font-bold tracking-tight">{confirmation.orderNumber}</p>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        A confirmation is on its way to <span className="font-semibold text-foreground">{confirmation.email}</span>.
        Your order will ship in{' '}
        <span className="font-semibold text-foreground">
          {confirmation.etaDays} day{confirmation.etaDays === 1 ? '' : 's'}
        </span>
        .
      </p>
      <p className="mt-2 font-mono text-sm">
        Total charged (demo): <span className="font-semibold">{formatPrice(confirmation.total)}</span>
      </p>

      <div className="mt-6">
        <Link to="/products">
          <Button size="lg">Continue shopping</Button>
        </Link>
      </div>
    </Card>
  )
}
