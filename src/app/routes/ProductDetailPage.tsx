import { Link, useParams } from 'react-router-dom'
import { PackageX } from 'lucide-react'
import {
  ProductGallery,
  SpecSheet,
  ProductGrid,
  ReviewSection,
  StarRating,
  useProduct,
  useProducts,
} from '../../modules/products'
import { CATEGORY_LABEL } from '../../modules/products/constants/product.constants'
import { useGuardedAdd, useBuyNow } from '../../modules/cart'
import { WishlistButton } from '../../modules/wishlist'
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

  const relatedQuery = useProducts(product ? { category_id: product.category_id } : {})
  const related = relatedQuery.products.filter((p) => p.id !== product?.id).slice(0, 3)

  const handleAdd = (p: Product, qty: number, variant?: ProductVariant) =>
    add(
      {
        ...p,
        variant_id: variant?.id,
        variant_name: variant?.variant_name,
        variant_stock: variant?.stock,
      },
      qty,
    )

  const handleBuyNow = (p: Product, qty: number, variant?: ProductVariant) =>
    buyNow(
      {
        ...p,
        variant_id: variant?.id,
        variant_name: variant?.variant_name,
        variant_stock: variant?.stock,
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
              <Link to={`/products?category=${product.category_id}`}>
                {CATEGORY_LABEL[product.category_id]}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.sku}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <ProductGallery product={product} />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.badge && <Badge variant={BADGE_VARIANT[product.badge]}>{product.badge}</Badge>}
            <p className="font-mono text-xs tracking-[0.12em] text-muted-foreground">
              {CATEGORY_LABEL[product.category_id]}
            </p>
          </div>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-2">
            <h1 className="font-display text-2xl leading-tight font-bold tracking-tight sm:text-3xl">
              {product.name}
            </h1>
            <WishlistButton
              productId={product.id}
              productName={product.name}
              variant="outline"
              className="mt-1"
            />
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <Link
              to={`/products/${product.id}/ratings`}
              className="inline-flex items-center gap-1.5 text-sm transition-opacity hover:opacity-80"
              aria-label={`${product.rating} out of 5 rating, ${product.review_count} reviews`}
            >
              <StarRating rating={product.rating} />
              <span className="font-mono text-xs font-medium">{product.rating.toFixed(1)}</span>
              <span className="font-mono text-xs text-muted-foreground">
                ({product.review_count})
              </span>
            </Link>
            <Link
              to={`/products/${product.id}/ratings`}
              className="font-mono text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Lihat ulasan
            </Link>
          </div>

          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            {product.summary}
          </p>

          <div className="mt-5">
            <SpecSheet product={product} onAdd={handleAdd} onBuyNow={handleBuyNow} />
          </div>
        </div>
      </div>

      <ReviewSection product={product} />

      {related.length > 0 && (
        <section className="mt-16">
          <header className="mb-5">
            <p className="font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
              You might also like
            </p>
            <h2 className="mt-1 font-display text-3xl font-bold tracking-tight">
              More in {CATEGORY_LABEL[product.category_id]}
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
