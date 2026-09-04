import { Link } from 'react-router-dom'
import { ArrowRight, MessageSquareQuote } from 'lucide-react'
import type { Product } from '../types/product.type'
import { useReviews } from '../hooks/useReviews'
import { EmptyState, Skeleton } from '../../../shared/components/ui'
import { StarRating } from './StarRating'
import { ReviewCard } from './ReviewCard'
import { RatingSummary } from './RatingSummary'

interface ReviewSectionProps {
  product: Product
}

export function ReviewSection({ product }: ReviewSectionProps) {
  const { items, stats, status } = useReviews(product.id, {
    limit: 5,
    rating: 'all',
    sort: 'rating-desc',
    hintRating: product.rating,
    hintCount: product.review_count,
  })

  return (
    <section className="mt-14" aria-labelledby="reviews-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <header>
          <p className="font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Reviews
          </p>
          <h2 id="reviews-heading" className="mt-1 flex items-center gap-3 font-display text-3xl font-bold tracking-tight">
            {stats ? (
              <>
                <span>{stats.count > 0 ? stats.avg.toFixed(1) : '—'}</span>
                <StarRating rating={stats.avg ?? 0} size="md" />
                <span className="font-mono text-sm font-normal text-muted-foreground">
                  ({stats.count} ratings)
                </span>
              </>
            ) : (
              <Skeleton className="h-8 w-48" />
            )}
          </h2>
        </header>
        <Link
          to={`/products/${product.id}/ratings`}
          className="inline-flex items-center gap-1.5 font-mono text-xs tracking-[0.12em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          LIHAT SEMUA RATINGS <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {stats && <RatingSummary stats={stats} />}

        <div className="space-y-3">
          {status === 'loading' ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 rounded-lg border p-4">
                <Skeleton className="size-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))
          ) : items.length === 0 ? (
            <EmptyState
              icon={<MessageSquareQuote className="size-8" />}
              title="Belum ada ulasan"
              description="Jadilah yang pertama memberi rating untuk produk ini."
              className="py-8"
            />
          ) : (
            items.map((review) => <ReviewCard key={review.id} review={review} />)
          )}
        </div>
      </div>
    </section>
  )
}
