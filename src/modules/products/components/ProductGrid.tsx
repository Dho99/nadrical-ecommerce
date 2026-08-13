import { PackageSearch } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button, EmptyState, Skeleton } from '../../../shared/components/ui'
import type { AsyncStatus } from '../../../shared/types/common.type'
import type { Product } from '../types/product.type'
import { ProductCard } from './ProductCard'

interface ProductGridProps {
  products: Product[]
  status: AsyncStatus
  error: string | null
  onRetry?: () => void
  className?: string
  footer?: ReactNode
}

export function ProductGrid({
  products,
  status,
  error,
  onRetry,
  className,
  footer,
}: ProductGridProps) {
  const gridClass = className ?? 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3'

  if ((status === 'loading' || status === 'idle') && products.length === 0) {
    return (
      <div className={gridClass} aria-busy="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    )
  }

  if (status === 'error') {
    return (
      <EmptyState
        icon={<PackageSearch className="size-10" />}
        title="Service error"
        description={error ?? 'Something went wrong. Please try again.'}
        action={
          onRetry ? (
            <Button variant="outline" onClick={onRetry}>
              Retry
            </Button>
          ) : undefined
        }
      />
    )
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<PackageSearch className="size-10" />}
        title="No products match"
        description="No products match the current filters. Try clearing a filter or searching differently."
      />
    )
  }

  return (
    <div>
      <div className={gridClass}>
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
      {footer}
    </div>
  )
}
