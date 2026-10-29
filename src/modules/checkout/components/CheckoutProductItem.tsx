import { Link } from 'react-router-dom'
import { Button } from '../../../shared/components/ui'
import { ProductImage } from '../../../shared/components/ProductImage'
import { useCart } from '../../cart/hooks/useCart'
import { formatPrice } from '../../../shared/utils/format'

interface CheckoutProductLine {
  product_id: string
  sku: string
  product_name: string
  unit_price: number
  quantity: number
  variant_id?: string
  variant_name?: string
  cover_image_url?: string
}

interface CheckoutProductItemProps {
  line: CheckoutProductLine
}

export function CheckoutProductItem({ line }: CheckoutProductItemProps) {
  const { setQty } = useCart()
  const increment = () => setQty(line.product_id, line.variant_id, line.quantity + 1)
  const decrement = () => setQty(line.product_id, line.variant_id, Math.max(line.quantity - 1, 1))

  return (
    <div className="flex flex-wrap items-center gap-3 py-2">
      <Link
        to={`/products/${line.product_id}`}
        className="size-14 shrink-0 overflow-hidden rounded-md border bg-muted"
      >
        <ProductImage src={line.cover_image_url ?? ''} alt={line.product_name} className="h-full w-full" />
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          to={`/products/${line.product_id}`}
          className="block truncate break-words text-sm font-medium hover:underline"
        >
          {line.product_name}
        </Link>
        {line.variant_name && (
          <p className="truncate break-words text-xs text-muted-foreground">{line.variant_name}</p>
        )}
        <p className="mt-0.5 break-words font-mono text-xs text-muted-foreground uppercase">
          {line.sku} · ×{line.quantity}
        </p>
      </div>

      {/* Mobile: qty stepper + subtotal ambil baris sendiri di bawah info produk.
          sm ke atas: wrapper transparan (display:contents) agar layout 1 baris. */}
      <div className="flex w-full items-center justify-between gap-3 sm:contents">
        <div className="flex items-center gap-1" aria-label={`Quantity for ${line.product_name}`}>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-7 sm:size-9"
            onClick={decrement}
            disabled={line.quantity <= 1}
            aria-label={`Decrease quantity of ${line.product_name}`}
          >
            −
          </Button>
          <span className="w-6 text-center text-sm font-medium">{line.quantity}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-7 sm:size-9"
            onClick={increment}
            aria-label={`Increase quantity of ${line.product_name}`}
          >
            +
          </Button>
        </div>

        <div className="text-right sm:w-24 sm:shrink-0">
          <p className="break-words font-mono text-sm font-semibold">
            {formatPrice(line.unit_price * line.quantity)}
          </p>
          <p className="font-mono text-xs text-muted-foreground">subtotal</p>
        </div>
      </div>
    </div>
  )
}
