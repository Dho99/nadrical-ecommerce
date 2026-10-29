import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquareQuote, Star } from 'lucide-react'
import { Button, Card, EmptyState, Skeleton } from '../../shared/components/ui'
import { ReviewCard, RatingSummary, StarRating } from '../../modules/products'
import { useAllReviews } from '../../modules/products/hooks/useAllReviews'

export function ReviewsPage() {
  const [page, setPage] = useState(1)
  const limit = 12
  const { items, stats, total, loading, error } = useAllReviews(page, limit)
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
      <header className="mb-6">
        <p className="font-mono text-xs tracking-[0.16em] text-muted-foreground uppercase">Community</p>
        <h1 className="mt-2 flex items-center gap-3 font-display text-4xl font-bold tracking-tight">
          Ulasan Pelanggan
        </h1>
        {stats && (
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <StarRating rating={stats.avg} size="sm" />
            <span className="font-mono font-semibold text-foreground">{stats.avg.toFixed(1)}</span>
            <span>dari {stats.count.toLocaleString('id-ID')} ulasan</span>
          </p>
        )}
      </header>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <Skeleton className="h-56 rounded-xl" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-lg" />
            ))}
          </div>
        </div>
      ) : error ? (
        <Card className="p-6 text-sm text-destructive">{error}</Card>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<MessageSquareQuote className="size-10" />}
          title="Belum ada ulasan"
          description="Ulasan pelanggan akan muncul di sini."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="space-y-4">
            {stats && <RatingSummary stats={stats} />}
            <Card className="p-4 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Punya produk favorit?</p>
              <p className="mt-1">Beri ulasan dari halaman detail pesanan setelah transaksi selesai.</p>
              <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                <Link to="/profile/orders">Lihat pesanan</Link>
              </Button>
            </Card>
          </div>

          <div className="space-y-3">
            {items.map((review) => (
              <div key={review.id}>
                <ReviewCard review={review} />
                {review.product_id && (
                  <Link
                    to={`/products/${review.product_id}`}
                    className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Star className="size-3" /> Lihat produk
                  </Link>
                )}
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                  Sebelumnya
                </Button>
                <span className="font-mono text-xs text-muted-foreground">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>
                  Berikutnya
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      <p className="mt-4 text-xs text-muted-foreground">Total {total.toLocaleString('id-ID')} ulasan</p>
    </div>
  )
}
