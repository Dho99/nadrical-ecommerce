import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import { ProductFilter, ProductGrid, useInfiniteProducts } from '../../modules/products'
import { parseProductFilters, toProductParams } from '../../modules/products/utils/filters'
import { useCart } from '../../modules/cart/hooks/useCart'
import { useInfiniteScroll } from '../../shared/hooks/useInfiniteScroll'
import { Separator } from '../../shared/components/ui'

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { add, qtyOf } = useCart()

  const filters = useMemo(() => parseProductFilters(searchParams), [searchParams])
  const { items, total, status, error, loadingMore, hasMore, loadMore, refetch } =
    useInfiniteProducts(filters)

  const sentinelRef = useInfiniteScroll({ onLoadMore: loadMore, hasMore, loading: loadingMore })

  const handleChange = (patch: Parameters<typeof useInfiniteProducts>[0]) => {
    const next = { ...filters, ...patch }
    setSearchParams(toProductParams(next), { replace: true })
  }

  return (
    <div className="container mx-auto px-5 py-10 sm:px-8">
      <header className="mb-6">
        <p className="font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Store catalog · {total} products live
        </p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          The catalog
        </h1>
      </header>

      <ProductFilter filters={filters} onChange={handleChange} total={total} />

      <Separator className="my-6" />

      <ProductGrid
        products={items}
        status={status}
        error={error}
        onRetry={refetch}
        onAdd={add}
        inCartQtyOf={qtyOf}
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
  )
}
