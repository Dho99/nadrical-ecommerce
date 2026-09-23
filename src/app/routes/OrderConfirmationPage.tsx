import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CreditCard, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from '@/shared/lib/alert'
import { Button, Card, Separator } from '../../shared/components/ui'
import { formatPrice } from '../../shared/utils/format'
import type { OrderConfirmation } from '../../modules/checkout/types/checkout.type'

const STORAGE_KEY = 'last-order-confirmation'

type StoredConfirmation = {
  order_number: string
  placed_at: string
  email: string
  eta_days: number
  grand_total: number
}

function isStoredConfirmation(v: unknown): v is StoredConfirmation {
  if (v === null || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  return (
    typeof o.order_number === 'string' &&
    typeof o.placed_at === 'string' &&
    typeof o.email === 'string' &&
    typeof o.eta_days === 'number' &&
    typeof o.grand_total === 'number'
  )
}

function isOrderConfirmationState(v: unknown): v is OrderConfirmation {
  if (v === null || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  const placed = o.placed_at
  const validDate = placed instanceof Date || typeof placed === 'string'
  return (
    typeof o.order_number === 'string' &&
    validDate &&
    typeof o.email === 'string' &&
    typeof o.eta_days === 'number' &&
    typeof o.grand_total === 'number'
  )
}

function reviveConfirmation(v: OrderConfirmation | StoredConfirmation): OrderConfirmation {
  const placed = (v as { placed_at: unknown }).placed_at
  const date = placed instanceof Date ? placed : new Date(typeof placed === 'string' ? placed : new Date().toISOString())
  return {
    order_number: v.order_number,
    email: v.email,
    eta_days: v.eta_days,
    grand_total: v.grand_total,
    placed_at: date,
  }
}

export function OrderConfirmationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [confirming, setConfirming] = useState(false)

  const confirmation = useMemo<OrderConfirmation | null>(() => {
    const state = location.state as unknown
    if (isOrderConfirmationState(state)) return reviveConfirmation(state as OrderConfirmation | StoredConfirmation)
    if (state !== null && typeof state === 'object') {
      const maybeWrapped = (state as Record<string, unknown>).confirmation as unknown
      if (isOrderConfirmationState(maybeWrapped)) return reviveConfirmation(maybeWrapped as OrderConfirmation | StoredConfirmation)
      if (isStoredConfirmation(maybeWrapped)) return reviveConfirmation(maybeWrapped)
    }
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed: unknown = JSON.parse(raw)
        if (isStoredConfirmation(parsed)) return reviveConfirmation(parsed)
        if (isOrderConfirmationState(parsed)) return reviveConfirmation(parsed as OrderConfirmation | StoredConfirmation)
      }
    } catch {
      // ignore
    }
    return null
  }, [location.state])

  const handleConfirm = async () => {
    if (!confirmation) return
    setConfirming(true)
    // Mock payment delay — simulate gateway processing
    await new Promise((r) => setTimeout(r, 1200))
    toast.success('Pembayaran berhasil dikonfirmasi')
    navigate('/checkout/success', { state: confirmation, replace: true })
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
          Periksa detail pesanan di bawah ini sebelum menyelesaikan pembayaran. Ini adalah simulasi mock payment.
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
              <dt className="text-muted-foreground">Estimasi pengiriman</dt>
              <dd className="font-medium">
                {confirmation.eta_days} hari{confirmation.eta_days === 1 ? '' : ''}
              </dd>
            </div>
            <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
              <dt className="text-muted-foreground">Ditempatkan</dt>
              <dd className="min-w-0 break-words text-xs">{confirmation.placed_at.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
          Dengan menekan <span className="font-semibold text-foreground">Konfirmasi Pesanan</span>, pembayaran mock akan diproses dan pesanan akan diteruskan ke halaman sukses.
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button size="lg" className="w-full" disabled={confirming} onClick={handleConfirm}>
            {confirming ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Memproses pembayaran…
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
