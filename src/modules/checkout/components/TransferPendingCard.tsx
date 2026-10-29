import { Link } from 'react-router-dom'
import { Clock4, MessageCircleQuestion } from 'lucide-react'
import { Button, Card, Separator } from '../../../shared/components/ui'
import { formatPrice } from '../../../shared/utils/format'
import type { OrderConfirmation } from '../types/checkout.type'

interface TransferPendingCardProps {
  confirmation: OrderConfirmation
}

export function TransferPendingCard({ confirmation }: TransferPendingCardProps) {
  return (
    <Card className="mx-auto max-w-lg p-6 text-center sm:p-8">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
        <Clock4 className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">
        Transaksi pending konfirmasi dari admin
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Bukti transfer kamu sudah kami terima. Pesanan akan diproses setelah admin memverifikasi pembayaran.
      </p>

      <Separator className="my-5" />

      <dl className="space-y-2 text-left text-sm">
        <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
          <dt className="text-muted-foreground">Order number</dt>
          <dd className="min-w-0 break-all font-mono text-xs font-semibold sm:text-sm">
            {confirmation.order_number}
          </dd>
        </div>
        <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
          <dt className="text-muted-foreground">Total dibayar</dt>
          <dd className="break-words font-semibold">{formatPrice(confirmation.grand_total)}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
          <dt className="text-muted-foreground">Estimasi pengiriman</dt>
          <dd className="font-medium">{confirmation.shipping_etd || `${confirmation.eta_days} hari`}</dd>
        </div>
      </dl>

      <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-left text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 font-semibold text-amber-600">
          <Clock4 className="size-3.5" /> Status: Menunggu konfirmasi admin
        </div>
        <p className="mt-1">
          Verifikasi bukti transfer diperiksa secara manual oleh admin. Kamu akan menerima notifikasi setelah
          pembayaran dikonfirmasi.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button size="lg" variant="outline" asChild>
          <Link to="/profile/orders">Lihat pesanan saya</Link>
        </Button>
        <Button size="lg" asChild>
          <Link to="/">Kembali ke beranda</Link>
        </Button>
        <Button size="lg" variant="ghost" asChild>
          <Link to="/faq">
            <MessageCircleQuestion className="size-4" /> Bantuan
          </Link>
        </Button>
      </div>
    </Card>
  )
}
