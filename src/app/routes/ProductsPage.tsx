import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowRight, LoaderCircle, Sparkles } from 'lucide-react'
import { ProductCard, ProductFilter, ProductGrid, useInfiniteProducts } from '../../modules/products'
import { productService } from '../../modules/products/services/product.service'
import type { Product } from '../../modules/products/types/product.type'
import { parseProductFilters, toProductParams } from '../../modules/products/utils/filters'
import { useInfiniteScroll } from '../../shared/hooks/useInfiniteScroll'

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(() => parseProductFilters(searchParams), [searchParams])
  const { items, total, status, error, loadingMore, hasMore, loadMore, refetch } =
    useInfiniteProducts(filters)

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])

  useEffect(() => {
    const q = filters.query?.trim()
    if (!q) {
      setTimeout(() => setRelatedProducts([]), 0)
      return
    }
    let cancelled = false
    void productService
      .getRelatedProducts({
        query: q,
        categoryId: filters.category_id,
        excludeIds: items.map((p) => p.id),
        limit: 3,
      })
      .then((rel) => {
        if (!cancelled) setRelatedProducts(rel)
      })
      .catch(() => {
        if (!cancelled) setRelatedProducts([])
      })
    return () => {
      cancelled = true
    }
  }, [filters.query, filters.category_id, items])

  const sentinelRef = useInfiniteScroll({ onLoadMore: loadMore, hasMore, loading: loadingMore })

  const handleChange = (patch: Partial<ReturnType<typeof parseProductFilters>>) => {
    const next = { ...filters, ...patch }
    setSearchParams(toProductParams(next), { replace: true })
  }

  return (
    <div className="mx-auto max-w-7xl px-5 pb-10 sm:px-8">
      <header className="py-6">
        <p className="font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Nadrical catalog · {total} products live
        </p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          The catalog
        </h1>
      </header>

      <ProductFilter filters={filters} onChange={handleChange} total={total} products={items} />

      <div className="mt-6">
        <ProductGrid
          products={items}
          status={status}
          error={error}
          onRetry={refetch}
          className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 md:gap-5"
        footer={
          <div ref={sentinelRef} aria-hidden="true">
            {loadingMore && (
              <p className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" /> Loading more products…
              </p>
            )}
            {!hasMore && items.length > 0 && (
              <p className="py-8 text-center font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase">
                End of catalog · {total} products
              </p>
            )}
          </div>
        }
        />
      </div>

      {filters.query && relatedProducts.length > 0 && (
        <section className="mt-14 border-t pt-8">
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-amber-500" />
                <h2 className="font-display text-lg font-bold tracking-tight sm:text-xl">
                  Related Products You Might Like
                </h2>
              </div>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                Recommendations based on search “{filters.query}”
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleChange({ query: undefined })}
              className="inline-flex items-center gap-1 font-mono text-xs font-medium text-primary hover:underline"
            >
              Clear search <ArrowRight className="size-3.5" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
            {relatedProducts.map((p, i) => (
              <ProductCard key={`related-${p.id}`} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
