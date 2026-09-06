import { Link } from 'react-router-dom'
import { HeartOff } from 'lucide-react'
import { ProductCard } from '../../modules/products/components/ProductCard'
import { useWishlist, useWishlistCatalog } from '../../modules/wishlist'
import { Button, EmptyState, Skeleton } from '../../shared/components/ui'

export function ProfileWishlistPage() {
  const { count } = useWishlist()
  const { products, ready } = useWishlistCatalog()

  const loading = count > 0 && !ready

  return (
    <div>
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
          title="No saved items"
          description="Tap the bookmark icon on any product to save it here."
          action={
            <Button asChild>
              <Link to="/products">Browse products</Link>
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
  )
}
