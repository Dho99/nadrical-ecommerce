import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { Badge, Button, QtyStepper } from '../../../shared/components/ui'
import { ProductImage } from '../../../shared/components/ProductImage'
import { formatPrice } from '../../../shared/utils/format'
import type { CartItem } from '../types/cart.type'

interface CartLineItemProps {
  item: CartItem
  onSetQty: (qty: number) => void
  onRemove: () => void
}

export function CartLineItem({ item, onSetQty, onRemove }: CartLineItemProps) {
  return (
    <li className="grid grid-cols-12 items-center gap-4 py-5">
      <Link
        to={`/products/${item.productId}`}
        className="col-span-3 overflow-hidden rounded-md border bg-muted sm:col-span-2"
      >
        <ProductImage
          src={item.imageUrl}
          alt={item.name}
          className="aspect-square h-full w-full"
        />
      </Link>

      <div className="col-span-9 sm:col-span-5">
        <p className="font-mono text-xs text-muted-foreground">{item.partNumber}</p>
        <Link
          to={`/products/${item.productId}`}
          className="font-display text-lg font-semibold leading-tight tracking-tight transition-colors hover:text-primary"
        >
          {item.name}
        </Link>
        {item.variantName && (
          <p className="mt-0.5 text-sm text-muted-foreground">Variant: {item.variantName}</p>
        )}
        <div className="mt-1.5">
          {item.stock === 0 ? (
            <Badge variant="destructive">Out of stock</Badge>
          ) : (
            <Badge variant="outline">In stock</Badge>
          )}
        </div>
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          {formatPrice(item.price)} / unit
        </p>
      </div>

      <div className="col-span-6 col-start-4 sm:col-span-2 sm:col-start-auto">
        <QtyStepper value={item.qty} max={Math.max(item.stock, 1)} onChange={onSetQty} label={`quantity of ${item.name}`} />
      </div>

      <div className="col-span-6 flex items-center justify-end gap-3 sm:col-span-3">
        <span className="font-mono text-base font-semibold">
          {formatPrice(item.price * item.qty)}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label={`Remove ${item.name} from cart`}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </li>
  )
}
