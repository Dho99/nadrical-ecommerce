import { Link } from 'react-router-dom'
import { HeartOff } from 'lucide-react'
import { ProductCard } from '../../modules/products/components/ProductCard'
import { useWishlist, useWishlistCatalog } from '../../modules/wishlist'
import { Button, EmptyState, Skeleton } from '../../shared/components/ui'

export function WishlistPage() {
  const { count, clear } = useWishlist()
  const { products, ready } = useWishlistCatalog()

  const loading = count > 0 && !ready

  return (
    <div className="container mx-auto px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <header>
          <p className="font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Tersimpan
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
            Wishlist
            {count > 0 && (
              <span className="ml-3 font-mono text-sm font-medium text-muted-foreground">
                {count} {count === 1 ? 'item' : 'items'}
              </span>
            )}
          </h1>
        </header>
        {count > 0 && (
          <Button variant="outline" size="sm" onClick={() => clear()}>
            Kosongkan wishlist
          </Button>
        )}
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={<HeartOff className="size-10" />}
            title="Wishlist kosong"
            description="Klik ikon bookmark pada kartu produk untuk menyimpannya di sini."
            action={
              <Button asChild>
                <Link to="/products">Jelajahi produk</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
