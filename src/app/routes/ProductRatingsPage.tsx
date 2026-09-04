import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PackageX, Star } from 'lucide-react'
import { useProduct } from '../../modules/products'
import { useReviews } from '../../modules/products'
import { ReviewCard } from '../../modules/products'
import { RatingSummary } from '../../modules/products'
import { StarRating } from '../../modules/products'
import { CATEGORY_LABEL } from '../../modules/products/constants/product.constants'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  EmptyState,
  Skeleton,
} from '../../shared/components/ui'
import { cn } from '../../shared/utils/cn'
import type { ReviewRating } from '../../modules/products/types/review.type'

const RATING_FILTERS: Array<{ id: ReviewRating | 'all'; label: string }> = [
  { id: 'all', label: 'Semua' },
  { id: 5, label: '5★' },
  { id: 4, label: '4★' },
  { id: 3, label: '3★' },
  { id: 2, label: '2★' },
  { id: 1, label: '1★' },
]

export function ProductRatingsPage() {
  const { id } = useParams<{ id: string }>()
  const { product, status } = useProduct(id)
  const [rating, setRating] = useState<ReviewRating | 'all'>('all')

  const reviews = useReviews(id, {
    limit: 200,
    rating,
    sort: 'rating-desc',
    hintRating: product?.rating,
    hintCount: product?.review_count,
  })

  const stats = reviews.stats
  const countsFor = (value: ReviewRating | 'all') =>
    value === 'all'
      ? stats?.count ?? 0
      : stats?.distribution[value] ?? 0

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="container mx-auto px-5 py-10 sm:px-8">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-4 h-8 w-2/3" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <Skeleton className="h-64 rounded-xl" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (status === 'error' || !product) {
    return (
      <div className="container mx-auto px-5 py-16 sm:px-8">
        <EmptyState
          icon={<PackageX className="size-10" />}
          title="Product not found"
          action={
            <Button variant="outline" asChild>
              <Link to="/products">Back to catalog</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-5 py-10 sm:px-8">
      <Breadcrumb className="mb-5">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/products">Catalog</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/products/${product.id}`}>{product.sku}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Ratings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header>
        <p className="font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          {CATEGORY_LABEL[product.category_id]}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">{product.name}</h1>
        <p className="mt-2 inline-flex items-center gap-2 text-sm">
          <StarRating rating={stats?.avg ?? product.rating} size="md" />
          <span className="font-mono text-sm font-medium">
            {(stats?.avg ?? product.rating).toFixed(1)}
          </span>
          <span className="font-mono text-sm text-muted-foreground">
            · {stats?.count ?? product.review_count} ratings
          </span>
        </p>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div>
          {stats && <RatingSummary stats={stats} className="lg:sticky lg:top-24" />}
        </div>

        <div>
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter by rating">
            {RATING_FILTERS.map((f) => (
              <button
                key={String(f.id)}
                type="button"
                role="tab"
                aria-selected={rating === f.id}
                onClick={() => setRating(f.id)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                  rating === f.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background hover:border-foreground/50',
                )}
              >
                {f.label}
                <span className="ml-1 font-mono text-[11px] opacity-70">
                  {countsFor(f.id)}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {reviews.status === 'loading' ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3 rounded-lg border p-4">
                  <Skeleton className="size-9 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))
            ) : reviews.items.length === 0 ? (
              <EmptyState
                icon={<Star className="size-8" />}
                title="Tidak ada ulasan"
                description="Belum ada ulasan dengan rating ini."
                className="py-8"
              />
            ) : (
              reviews.items.map((review) => <ReviewCard key={review.id} review={review} />)
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
