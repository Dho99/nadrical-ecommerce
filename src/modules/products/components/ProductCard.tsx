import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { Badge, Card, CardContent } from '../../../shared/components/ui'
import { ProductImage } from '../../../shared/components/ProductImage'
import { WishlistButton } from '../../wishlist/components/WishlistButton'
import { CATEGORY_LABEL } from '../constants/product.constants'
import type { Product, ProductBadge } from '../types/product.type'

const BADGE_VARIANT: Record<ProductBadge, 'default' | 'secondary' | 'destructive'> = {
  NEW: 'default',
  SALE: 'destructive',
  'BEST SELLER': 'secondary',
}

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const isPreorder = Boolean(product.is_preorder)
  const soldOut = product.stock === 0 && !isPreorder

  return (
    <Card
      className="group relative flex flex-col overflow-hidden rounded-xl border transition-shadow hover:shadow-lg"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <WishlistButton
        productId={product.id}
        productName={product.name}
        size="icon-sm"
        className="absolute top-2.5 right-2.5 z-10 bg-background/90 shadow-sm backdrop-blur"
      />
      <Link
        to={`/products/${product.id}`}
        className="relative block aspect-[4/3] overflow-hidden bg-muted"
      >
        <ProductImage
          src={product.cover_image_url}
          alt={product.name}
          className="h-full w-full transition-transform duration-300 group-hover:scale-105"
        />
        {product.badge && (
          <Badge variant={BADGE_VARIANT[product.badge]} className="absolute left-2.5 top-2.5 text-[10px]">
            {product.badge}
          </Badge>
        )}
        {isPreorder && (
          <Badge className="absolute left-2.5 top-2.5 bg-amber-500 text-white text-[10px]">PRE-ORDER</Badge>
        )}
        {soldOut && (
          <span className="absolute inset-0 flex items-center justify-center bg-background/70 text-xs font-semibold tracking-wide text-foreground backdrop-blur-[1px]">
            SOLD OUT
          </span>
        )}
      </Link>

      <CardContent className="flex grow flex-col gap-1 px-3.5 py-3">
        <p className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
          {CATEGORY_LABEL[product.category_id]}
        </p>

        <h3 className="line-clamp-2 font-display text-[15px] font-semibold leading-snug tracking-tight">
          <Link to={`/products/${product.id}`} className="transition-colors hover:text-primary">
            {product.name}
          </Link>
        </h3>

        <div className="flex items-center gap-1 text-xs">
          <span className="inline-flex items-center gap-0.5 font-medium">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            {product.rating.toFixed(1)}
          </span>
          <span className="text-muted-foreground">({product.review_count})</span>
          {product.discount_percent && (
            <span className="ml-auto rounded bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground">
              -{product.discount_percent}%
            </span>
          )}
        </div>

        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <p className="font-display text-base font-bold tracking-tight">
            ${product.base_price.toFixed(2)}
          </p>
          {product.discount_percent && (
            <p className="text-xs text-muted-foreground line-through">
              ${(product.base_price / (1 - product.discount_percent / 100)).toFixed(2)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}