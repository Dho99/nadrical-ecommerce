import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Badge, Button, Card, CardContent } from '../../../shared/components/ui'
import { ProductImage } from '../../../shared/components/ProductImage'
import { cn } from '../../../shared/utils/cn'
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
  onAdd?: (product: Product) => void
  inCartQty?: number
}

export function ProductCard({ product, index = 0, onAdd, inCartQty = 0 }: ProductCardProps) {
  const soldOut = product.stock === 0

  return (
    <Card
      className="group flex flex-col overflow-hidden transition-shadow hover:shadow-lg"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <Link
        to={`/products/${product.id}`}
        className="relative block aspect-square overflow-hidden bg-muted"
      >
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full transition-transform duration-300 group-hover:scale-105"
        />
        {product.badge && (
          <Badge variant={BADGE_VARIANT[product.badge]} className="absolute left-3 top-3">
            {product.badge}
          </Badge>
        )}
      </Link>

      <CardContent className="flex grow flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-xs text-muted-foreground">{CATEGORY_LABEL[product.category]}</p>
          <p className="font-mono text-xs text-muted-foreground">{product.partNumber}</p>
        </div>

        <h3 className="font-display text-lg font-semibold tracking-tight leading-snug">
          <Link to={`/products/${product.id}`} className="transition-colors hover:text-primary">
            {product.name}
          </Link>
        </h3>

        <p className="line-clamp-1 text-sm text-muted-foreground">{product.summary}</p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <p className="font-display text-xl font-bold tracking-tight">
            ${product.price.toFixed(2)}
          </p>
          <p className={cn('text-xs font-medium', soldOut ? 'text-destructive' : 'text-muted-foreground')}>
            {soldOut ? 'Sold out' : `${product.stock} in stock`}
          </p>
        </div>

        <Button
          type="button"
          variant={soldOut ? 'outline' : 'default'}
          className="mt-3 w-full"
          disabled={soldOut}
          onClick={() => {
            onAdd?.(product)
            if (!soldOut) toast.success(`${product.name} added to cart`)
          }}
        >
          <Plus />
          {soldOut ? 'Sold out' : inCartQty > 0 ? `In cart · ${inCartQty}` : 'Add to cart'}
        </Button>
      </CardContent>
    </Card>
  )
}
