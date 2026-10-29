import { useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, Card } from '../../shared/components/ui'
import { UploadProofForm } from '../../modules/checkout/components/UploadProofForm'
import { readOrderConfirmation } from '../../modules/checkout/utils/confirmation.utils'

export function UploadProofPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const confirmation = useMemo(() => readOrderConfirmation(location.state), [location.state])

  if (!confirmation) {
    return (
      <div className="mx-auto w-full max-w-lg px-5 py-16 sm:px-8">
        <Card className="p-6 text-center sm:p-8">
          <p className="font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase">No order</p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">Tidak ada pesanan untuk diupload</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Selesaikan checkout terlebih dahulu untuk mengupload bukti transfer.
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
      <UploadProofForm
        confirmation={confirmation}
        onUploaded={() => navigate('/checkout/pending', { state: confirmation, replace: true })}
      />
    </div>
  )
}
