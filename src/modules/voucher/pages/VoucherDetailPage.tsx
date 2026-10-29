import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BadgePercent, CalendarClock, Copy, Ticket } from 'lucide-react'
import { toast } from '../../../shared/lib/alert'
import { Button, Card, EmptyState, Skeleton } from '../../../shared/components/ui'
import { formatPrice } from '../../../shared/utils/format'
import { useVoucherDetail } from '../hooks/useVoucherCatalog'
import { isVoucherUsable, voucherValueLabel } from '../utils/display'

export function VoucherDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { item, loading, error } = useVoucherDetail(id)

  if (loading) {
    return (
      <div className="mx-auto max-w-xl space-y-3 px-5 py-10 sm:px-8">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="mx-auto max-w-xl px-5 py-16 sm:px-8">
        <EmptyState
          icon={<Ticket className="size-10" />}
          title="Voucher tidak ditemukan"
          description={error || 'Voucher ini tidak tersedia.'}
          action={<Button asChild variant="outline"><Link to="/vouchers">Kembali ke katalog</Link></Button>}
        />
      </div>
    )
  }

  const usable = isVoucherUsable(item)

  return (
    <div className="mx-auto w-full max-w-xl px-5 py-10 sm:px-8">
      <Link to="/vouchers" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Semua voucher
      </Link>

      <Card className="mt-5 border-dashed p-6 sm:p-8">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <BadgePercent className="size-6" />
        </span>
        <p className="mt-4 font-mono text-2xl font-bold tracking-wider text-primary">{item.code}</p>
        <p className="mt-2 text-sm text-muted-foreground">{item.description || 'Voucher spesial dari toko.'}</p>

        <div className="mt-5 rounded-lg border bg-muted/40 p-4">
          <p className="text-xs text-muted-foreground">Nilai voucher</p>
          <p className="mt-1 font-display text-xl font-bold">{voucherValueLabel(item)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Status: {usable ? 'Aktif' : 'Tidak aktif / kedaluwarsa'}
          </p>
        </div>

        <dl className="mt-4 space-y-2 text-sm">
          {item.min_subtotal !== undefined && item.min_subtotal !== null && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Minimal belanja</dt>
              <dd>{formatPrice(item.min_subtotal)}</dd>
            </div>
          )}
          {item.max_discount !== undefined && item.max_discount !== null && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Maksimal diskon</dt>
              <dd>{formatPrice(item.max_discount)}</dd>
            </div>
          )}
          {(item.expires_at || item.valid_to_date) && (
            <div className="flex justify-between gap-4">
              <dt className="flex items-center gap-1 text-muted-foreground"><CalendarClock className="size-3.5" /> Berlaku sampai</dt>
              <dd>{new Date(item.expires_at || item.valid_to_date || '').toLocaleDateString('id-ID')}</dd>
            </div>
          )}
        </dl>

        <Button
          type="button"
          className="mt-6 w-full"
          variant="outline"
          onClick={() => {
            void navigator.clipboard?.writeText(item.code).then(() => toast.success('Kode voucher disalin'))
          }}
        >
          <Copy className="size-4" /> Salin kode voucher
        </Button>
        <Button asChild className="mt-2 w-full">
          <Link to="/cart">Gunakan di keranjang</Link>
        </Button>
      </Card>
    </div>
  )
}
