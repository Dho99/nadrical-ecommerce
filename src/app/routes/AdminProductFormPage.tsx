import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ProductForm } from '../../modules/admin'
import { useProduct } from '../../modules/products'
import { Button, EmptyState, Skeleton } from '../../shared/components/ui'

export function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const editing = Boolean(id)
  const { product, status, error } = useProduct(id)

  return (
    <div>
      <header className="mb-6">
        <p className="font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Store admin · {editing ? 'Edit' : 'Create'}
        </p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          {editing ? 'Edit product' : 'New product'}
        </h1>
        {editing && product && (
          <p className="mt-1 font-mono text-sm text-muted-foreground">{product.partNumber}</p>
        )}
      </header>

      {editing && status === 'loading' && (
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      )}

      {editing && status === 'error' && (
        <EmptyState
          title="Could not load product"
          description={error ?? 'Something went wrong while loading this product.'}
          action={
            <Button asChild variant="outline">
              <Link to="/admin/products">
                <ArrowLeft /> Back to products
              </Link>
            </Button>
          }
        />
      )}

      {editing && status === 'success' && !product && (
        <EmptyState
          title="Product not found"
          description="It may have been deleted. Head back to the product list."
          action={
            <Button asChild variant="outline">
              <Link to="/admin/products">
                <ArrowLeft /> Back to products
              </Link>
            </Button>
          }
        />
      )}

      {(!editing || (status === 'success' && product)) && (
        <ProductForm key={editing ? id : 'new'} product={product ?? undefined} />
      )}
    </div>
  )
}