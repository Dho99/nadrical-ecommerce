import { Link } from 'react-router-dom'
import { Award, Clock, Flame, ShieldAlert, Sparkles, Star, Tag } from 'lucide-react'
import { Badge, Card, CardContent } from '../../../shared/components/ui'
import { ProductImage } from '../../../shared/components/ProductImage'
import { WishlistButton } from '../../wishlist/components/WishlistButton'
import { useCurrency } from '../../currency'
import { CATEGORY_LABEL } from '../constants/product.constants'
import type { Product } from '../types/product.type'

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const isPreorder = Boolean(product.is_preorder)
  const soldOut = product.stock === 0 && !isPreorder
  const isLowStock = product.stock > 0 && product.stock < 20 && !isPreorder
  const { format } = useCurrency()

  const renderBadge = () => {
    if (isLowStock) {
      return (
        <Badge className="bg-gradient-to-r from-amber-600 to-red-600 text-white font-extrabold text-[10px] tracking-wider uppercase shadow-md border-none px-2 py-0.5 rounded-md flex items-center gap-1">
          <ShieldAlert className="size-3 text-amber-200" />
          <span>Only {product.stock} Left</span>
        </Badge>
      )
    }
    if (product.badge === 'SALE') {
      return (
        <Badge className="bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-[10px] tracking-wider uppercase shadow-md border-none px-2 py-0.5 rounded-md flex items-center gap-1">
          <Flame className="size-3 text-yellow-300 fill-yellow-300 animate-pulse" />
          <span>Save {product.discount_percent ?? 20}% Today</span>
        </Badge>
      )
    }
    if (product.badge === 'NEW') {
      return (
        <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-[10px] tracking-wider uppercase shadow-sm border-none px-2 py-0.5 rounded-md flex items-center gap-1">
          <Sparkles className="size-3 text-emerald-100" />
          <span>Risk-Free · New</span>
        </Badge>
      )
    }
    if (product.badge === 'BEST SELLER') {
      return (
        <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-[10px] tracking-wider uppercase shadow-sm border-none px-2 py-0.5 rounded-md flex items-center gap-1">
          <Award className="size-3 text-amber-100" />
          <span>VIP Choice</span>
        </Badge>
      )
    }
    return null
  }

  return (
    <Card
      className="group relative flex flex-col overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-xl hover:border-primary/30"
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

        <div className="absolute left-2.5 top-2.5 z-10 flex flex-col gap-1 items-start">
          {renderBadge()}
          {isPreorder && (
            <Badge className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold text-[10px] tracking-wider uppercase shadow-sm border-none px-2 py-0.5 rounded-md flex items-center gap-1">
              <Clock className="size-3" />
              <span>Early Access</span>
            </Badge>
          )}
        </div>

        {product.discount_percent && (
          <Badge className="absolute right-2.5 bottom-2.5 z-10 bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-[11px] tracking-tight shadow-md border border-white/20 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Tag className="size-3" />
            <span>-{product.discount_percent}%</span>
          </Badge>
        )}

        {soldOut && (
          <span className="absolute inset-0 flex items-center justify-center bg-background/80 text-xs font-bold tracking-wider text-foreground backdrop-blur-[2px]">
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
        </div>

        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <p className="font-display text-base font-bold tracking-tight">
            {format(product.base_price)}
          </p>
          {product.discount_percent && (
            <p className="text-xs text-muted-foreground line-through">
              {format(product.base_price / (1 - product.discount_percent / 100))}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
