import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Check, Download, Loader2, PackageCheck } from 'lucide-react'
import { toast } from '@/shared/lib/alert'
import { Button, Card, Separator } from '../../shared/components/ui'
import { formatPrice } from '../../shared/utils/format'
import { orderRepository } from '../../modules/checkout/services/order.repository'
import { invoiceService } from '../../modules/orders/services/invoice.service'
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

export function CheckoutSuccessPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [downloading, setDownloading] = useState(false)

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

  const handleDownloadInvoice = async () => {
    if (!confirmation) return
    setDownloading(true)
    try {
      const orders = await orderRepository.list()
      const found = orders.find((o) => o.order_number === confirmation.order_number || o.id === confirmation.order_number)
      if (found) {
        const invoiceData = invoiceService.build(found, confirmation.email)
        await invoiceService.download(invoiceData)
        toast.success('Invoice downloaded successfully')
      } else {
        toast.error('Order data not found for invoice generation')
      }
    } catch {
      toast.error('Failed to generate invoice')
    } finally {
      setDownloading(false)
    }
  }

  if (!confirmation) {
    return (
      <div className="mx-auto w-full max-w-lg px-5 py-16 sm:px-8">
        <Card className="p-6 text-center sm:p-8">
          <p className="font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase">No confirmation</p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">Tidak ada konfirmasi pembayaran</h1>
          <p className="mt-3 text-sm text-muted-foreground">Selesaikan checkout terlebih dahulu untuk melihat halaman sukses.</p>
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
      <Card className="mx-auto max-w-lg p-6 text-center sm:p-8">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500 text-white">
          <Check className="size-7" aria-hidden="true" />
        </span>
        <span className="mx-auto mt-3 flex size-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
          <PackageCheck className="size-4" aria-hidden="true" />
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">Pembayaran berhasil</h1>
        <p className="mt-2 text-sm text-muted-foreground">Pesanan kamu sudah kami terima. Pembayaran mock berhasil dikonfirmasi.</p>

        <Separator className="my-5" />

        <p className="font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase">Order number</p>
        <p className="mt-1 font-display text-4xl font-bold tracking-tight">{confirmation.order_number}</p>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Konfirmasi akan dikirim ke <span className="font-semibold text-foreground">{confirmation.email}</span>. Estimasi pengiriman{' '}
          <span className="font-semibold text-foreground">
            {confirmation.eta_days} hari{confirmation.eta_days === 1 ? '' : ''}
          </span>
          .
        </p>
        <p className="mt-2 font-mono text-sm">
          Total dibayar: <span className="font-semibold">{formatPrice(confirmation.grand_total)}</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Ditempatkan: {confirmation.placed_at.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
        </p>

        <div className="mt-3 flex items-center justify-center gap-2 text-xs font-medium text-emerald-600">
          <Check className="size-3.5" /> Pembayaran terverifikasi · Pesanan akan diproses
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="default" size="lg" disabled={downloading} onClick={handleDownloadInvoice}>
            {downloading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Generating PDF…
              </>
            ) : (
              <>
                <Download className="size-4" /> Download invoice
              </>
            )}
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/profile/orders', { replace: true })}>
            See orders
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to={`/profile/orders/${encodeURIComponent(confirmation.order_number)}`}>See order detail</Link>
          </Button>
          <Button variant="ghost" size="lg" asChild>
            <Link to="/products">Back to store</Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
