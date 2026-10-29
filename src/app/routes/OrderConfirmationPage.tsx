import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CreditCard, Loader2, ShieldCheck } from 'lucide-react'
import { Button, Card, Separator } from '../../shared/components/ui'
import { formatPrice } from '../../shared/utils/format'
import { readOrderConfirmation } from '../../modules/checkout/utils/confirmation.utils'

export function OrderConfirmationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [confirming, setConfirming] = useState(false)

  const confirmation = useMemo(() => readOrderConfirmation(location.state), [location.state])

  const handleConfirm = async () => {
    if (!confirmation) return
    setConfirming(true)
    navigate('/checkout/upload-proof', { state: confirmation, replace: true })
    setConfirming(false)
  }

  if (!confirmation) {
    return (
      <div className="mx-auto w-full max-w-lg px-5 py-16 sm:px-8">
        <Card className="p-6 text-center sm:p-8">
          <p className="font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase">No confirmation</p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">Tidak ada konfirmasi pembayaran</h1>
          <p className="mt-3 text-sm text-muted-foreground">Selesaikan checkout terlebih dahulu untuk melihat konfirmasi pembayaran.</p>
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
      <Card className="mx-auto max-w-lg p-6 sm:p-8">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
          <CreditCard className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">Konfirmasi Pembayaran</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Periksa detail pesanan di bawah ini, lalu lanjutkan ke upload bukti transfer.
        </p>

        <Separator className="my-5" />

        <div className="rounded-lg border bg-muted/40 p-4 text-left">
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-muted-foreground uppercase">
            <ShieldCheck className="size-3.5" /> Ringkasan Pesanan
          </div>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
              <dt className="text-muted-foreground">Order number</dt>
              <dd className="min-w-0 break-all font-mono text-xs font-semibold sm:text-sm">{confirmation.order_number}</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="min-w-0 break-all text-xs font-medium sm:text-sm">{confirmation.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Total dibayar</dt>
              <dd className="break-words font-semibold">{formatPrice(confirmation.grand_total)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Pengiriman</dt>
              <dd className="text-right font-medium">
                {confirmation.shipping_method_name || 'Kurir'}
                {confirmation.shipping_etd ? ` · ${confirmation.shipping_etd}` : ` · ${confirmation.eta_days} hari`}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Pembayaran</dt>
              <dd className="text-right font-medium">
                {confirmation.payment_bank_name || confirmation.payment_method_name || 'Transfer Bank'}
                {confirmation.payment_account_number ? ` · ${confirmation.payment_account_number}` : ''}
              </dd>
            </div>
            <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
              <dt className="text-muted-foreground">Ditempatkan</dt>
              <dd className="min-w-0 break-words text-xs">{confirmation.placed_at.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
          Dengan menekan <span className="font-semibold text-foreground">Konfirmasi Pesanan</span>, kamu akan diarahkan
          ke halaman upload bukti transfer, lalu transaksi masuk ke status <span className="font-semibold text-foreground">pending konfirmasi dari admin</span>.
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button size="lg" className="w-full" disabled={confirming} onClick={handleConfirm}>
            {confirming ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Melanjutkan…
              </>
            ) : (
              <>Konfirmasi Pesanan</>
            )}
          </Button>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/checkout')}>
              Kembali ke checkout
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/cart">Lihat keranjang</Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
