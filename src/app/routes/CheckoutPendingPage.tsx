import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button, Card } from '../../shared/components/ui'
import { TransferPendingCard } from '../../modules/checkout/components/TransferPendingCard'
import { readOrderConfirmation } from '../../modules/checkout/utils/confirmation.utils'

export function CheckoutPendingPage() {
  const location = useLocation()

  const confirmation = useMemo(() => readOrderConfirmation(location.state), [location.state])

  if (!confirmation) {
    return (
      <div className="mx-auto w-full max-w-lg px-5 py-16 sm:px-8">
        <Card className="p-6 text-center sm:p-8">
          <p className="font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase">No order</p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">Tidak ada pesanan pending</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Selesaikan checkout dan upload bukti transfer untuk melihat status pesanan.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/checkout">Kembali ke checkout</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/profile/orders">Lihat pesanan</Link>
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
      <TransferPendingCard confirmation={confirmation} />
    </div>
  )
}
