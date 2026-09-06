import { Package, X } from 'lucide-react'
import { ProductImage } from '../../../shared/components/ProductImage'
import type { ProductChatContext } from '../../../shared/constants/chat.constants'

interface ProductContextPreviewProps {
  product: ProductChatContext
  onClear?: () => void
}

export function ProductContextPreview({ product, onClear }: ProductContextPreviewProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-2.5">
      <ProductImage
        src={product.image}
        alt={product.name}
        className="size-11 shrink-0 rounded-md border bg-muted object-cover"
      />
      <div className="min-w-0 grow">
        <p className="text-xs font-semibold text-muted-foreground uppercase">
          User sedang melihat
        </p>
        <p className="truncate text-sm font-semibold">{product.name}</p>
        <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
          <span>{product.currency} {product.price}</span>
          <span>·</span>
          <span className="capitalize">{product.category}</span>
          <span>·</span>
          <span>{product.availability}</span>
        </p>
      </div>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear product context"
          className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}
      <Package className="size-4 shrink-0 text-muted-foreground/60" aria-hidden="true" />
    </div>
  )
}
