import { Link } from 'react-router-dom'
import { ArrowRight, BadgePercent, CalendarClock, Ticket } from 'lucide-react'
import { Badge, Button, Card, EmptyState, Skeleton } from '../../../shared/components/ui'
import { formatPrice } from '../../../shared/utils/format'
import { useVoucherCatalog } from '../hooks/useVoucherCatalog'
import { isVoucherUsable, voucherValueLabel } from '../utils/display'

export function VoucherCatalogPage() {
  const { items, loading, error } = useVoucherCatalog()
  const vouchers = items.filter(isVoucherUsable)

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
      <header className="mb-6">
        <p className="font-mono text-xs tracking-[0.16em] text-muted-foreground uppercase">Rewards</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Voucher Tersedia</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Gunakan kode voucher saat checkout. Voucher yang tampil berasal dari katalog backend.
        </p>
      </header>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <Card className="p-6 text-sm text-destructive">{error}</Card>
      ) : vouchers.length === 0 ? (
        <EmptyState
          icon={<Ticket className="size-10" />}
          title="Belum ada voucher aktif"
          description="Saat ini belum ada voucher yang bisa digunakan."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {vouchers.map((voucher) => {
            const detailId = voucher.uuid
            const body = (
              <Card className="flex h-full flex-col border-dashed p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <BadgePercent className="size-5" />
                  </span>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {voucherValueLabel(voucher)}
                  </Badge>
                </div>
                <p className="mt-3 font-mono text-lg font-bold tracking-wide text-primary">{voucher.code}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {voucher.description || 'Voucher spesial dari toko.'}
                </p>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {voucher.min_subtotal !== undefined && voucher.min_subtotal !== null && (
                    <p>Min. belanja {formatPrice(voucher.min_subtotal)}</p>
                  )}
                  {voucher.expires_at && (
                    <p className="flex items-center gap-1">
                      <CalendarClock className="size-3" />
                      Berlaku sampai {new Date(voucher.expires_at).toLocaleDateString('id-ID')}
                    </p>
                  )}
                </div>
                {detailId && (
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    Lihat detail <ArrowRight className="size-3" />
                  </span>
                )}
              </Card>
            )
            return detailId ? (
              <Link key={detailId} to={`/vouchers/${detailId}`} className="block">
                {body}
              </Link>
            ) : (
              <div key={voucher.code}>{body}</div>
            )
          })}
        </div>
      )}

      <Button asChild variant="outline" className="mt-6">
        <Link to="/profile">Kembali ke profil</Link>
      </Button>
    </div>
  )
}
