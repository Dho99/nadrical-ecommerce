import { Link, useParams } from 'react-router-dom'
import { PackageX } from 'lucide-react'
import { ProductGallery, SpecSheet, ProductGrid, useProduct, useProducts } from '../../modules/products'
import { CATEGORY_LABEL } from '../../modules/products/constants/product.constants'
import { useGuardedAdd, useBuyNow } from '../../modules/cart'
import {
  Badge,
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
import type { Product, ProductVariant } from '../../modules/products/types/product.type'

const BADGE_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  NEW: 'default',
  SALE: 'destructive',
  'BEST SELLER': 'secondary',
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { product, status, error } = useProduct(id)
  const { add } = useGuardedAdd()
  const { buyNow } = useBuyNow()

  const relatedQuery = useProducts(product ? { category: product.category } : {})
  const related = relatedQuery.products.filter((p) => p.id !== product?.id).slice(0, 3)

  const handleAdd = (p: Product, qty: number, variant?: ProductVariant) =>
    add(
      {
        ...p,
        variantId: variant?.id,
        variantName: variant?.name,
        variantStock: variant?.stock,
      },
      qty,
    )

  const handleBuyNow = (p: Product, qty: number, variant?: ProductVariant) =>
    buyNow(
      {
        ...p,
        variantId: variant?.id,
        variantName: variant?.name,
        variantStock: variant?.stock,
      },
      qty,
    )

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="container mx-auto grid gap-8 px-5 py-10 sm:px-8 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
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
          description={error ?? 'This product is not in the catalog. It may have been discontinued.'}
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
              <Link to={`/products?category=${product.category}`}>
                {CATEGORY_LABEL[product.category]}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.partNumber}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery product={product} />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.badge && <Badge variant={BADGE_VARIANT[product.badge]}>{product.badge}</Badge>}
            <p className="font-mono text-xs tracking-[0.12em] text-muted-foreground">
              {product.partNumber}
            </p>
          </div>
          <h1 className="mt-2 font-display text-4xl leading-[0.95] font-bold tracking-tight sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            {product.summary}
          </p>

          <div className="mt-6">
            <SpecSheet product={product} onAdd={handleAdd} onBuyNow={handleBuyNow} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <header className="mb-5">
            <p className="font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
              You might also like
            </p>
            <h2 className="mt-1 font-display text-3xl font-bold tracking-tight">
              More in {CATEGORY_LABEL[product.category]}
            </h2>
          </header>
          <ProductGrid
            products={related}
            status={relatedQuery.status}
            error={relatedQuery.error}
          />
        </section>
      )}
    </div>
  )
}
