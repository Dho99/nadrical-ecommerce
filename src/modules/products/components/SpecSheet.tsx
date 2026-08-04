import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  QtyStepper,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '../../../shared/components/ui'
import { cn } from '../../../shared/utils/cn'
import type { Product, ProductVariant } from '../types/product.type'

interface SpecSheetProps {
  product: Product
  onAdd: (product: Product, qty: number, variant?: ProductVariant) => void
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <Badge variant="destructive">Out of stock</Badge>
  if (stock < 20) return <Badge variant="secondary">Low stock · {stock} left</Badge>
  return <Badge variant="outline">In stock</Badge>
}

export function SpecSheet({ product, onAdd }: SpecSheetProps) {
  const variants = product.variants ?? []
  const [selected, setSelected] = useState<ProductVariant | null>(
    () => variants.find((v) => v.stock > 0) ?? null,
  )
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const price = product.price + (selected?.priceDelta ?? 0)
  const stock = selected?.stock ?? product.stock
  const soldOut = stock === 0

  const handleSelect = (variant: ProductVariant) => {
    setSelected(variant)
    setQty(1)
  }

  const handleAdd = () => {
    onAdd(product, qty, selected ?? undefined)
    toast.success(`${product.name}${selected ? ` — ${selected.name}` : ''} added to cart`)
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  return (
    <div className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
      <Table>
        <TableBody>
          {product.specs.map((spec) => (
            <TableRow key={spec.label}>
              <TableCell className="w-1/3 font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase">
                {spec.label}
              </TableCell>
              <TableCell className="font-medium">{spec.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Separator className="my-5" />

      {variants.length > 0 && (
        <div className="mb-5">
          <p className="font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Variants
          </p>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Product variants">
            {variants.map((variant) => {
              const isSelected = selected?.id === variant.id
              const variantSoldOut = variant.stock === 0
              return (
                <button
                  key={variant.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={variantSoldOut}
                  onClick={() => handleSelect(variant)}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background hover:border-foreground/50',
                    variantSoldOut && 'cursor-not-allowed opacity-50 line-through',
                  )}
                >
                  {variant.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <StockBadge stock={stock} />
        <p className="font-display text-3xl font-bold tracking-tight">
          ${price.toFixed(2)}
          {selected && selected.priceDelta > 0 && (
            <span className="ml-2 align-middle font-mono text-xs font-medium text-muted-foreground">
              +${selected.priceDelta.toFixed(2)}
            </span>
          )}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <QtyStepper
          value={qty}
          max={Math.max(stock, 1)}
          onChange={setQty}
          label={`quantity of ${product.name}`}
        />
        <Button size="lg" className="grow" disabled={soldOut} onClick={handleAdd} aria-live="polite">
          {added ? (
            <>
              <Check /> Added to cart
            </>
          ) : (
            <>
              <ShoppingCart /> Add to cart
            </>
          )}
        </Button>
      </div>

      {soldOut && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Out of stock</AlertTitle>
          <AlertDescription>
            This product is currently sold out. Sign in to get restock alerts.
          </AlertDescription>
        </Alert>
      )}

      <p className="mt-4 text-sm text-muted-foreground">
        Ships within 48h · 14-day returns · 2-year guarantee included.
      </p>

      <Link
        to="/products"
        className="mt-3 inline-block font-mono text-xs tracking-[0.12em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        ← BACK TO CATALOG
      </Link>
    </div>
  )
}
