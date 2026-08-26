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
  onBuyNow?: (product: Product, qty: number, variant?: ProductVariant) => void
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <Badge variant="destructive">Out of stock</Badge>
  if (stock < 20) return <Badge variant="secondary">Low stock · {stock} left</Badge>
  return <Badge variant="outline">In stock</Badge>
}

export function SpecSheet({ product, onAdd, onBuyNow }: SpecSheetProps) {
  const variants = product.variants ?? []
  const isMultiVariant = variants.length > 0 && variants[0].variant_name.includes(' / ')

  // Single variant states
  const [selectedSingle, setSelectedSingle] = useState<ProductVariant | null>(
    () => (isMultiVariant ? null : variants.find((v) => v.stock > 0) ?? variants[0] ?? null),
  )

  // Multi variant helper parsing
  const dim1Values = isMultiVariant
    ? Array.from(new Set(variants.map((v) => v.variant_name.split(' / ')[0])))
    : []
  const dim2Values = isMultiVariant
    ? Array.from(new Set(variants.map((v) => v.variant_name.split(' / ')[1])))
    : []

  function getLabel(value: string, index: number): string {
    const lower = value.toLowerCase()
    if (
      ['xs', 's', 'm', 'l', 'xl', 'xxl', 'eu', 'size', '36', '38', '40', '42', '44', '46'].some((k) =>
        lower.includes(k),
      )
    ) {
      return 'Size'
    }
    if (
      [
        'merah',
        'hijau',
        'hitam',
        'putih',
        'blue',
        'black',
        'red',
        'green',
        'white',
        'grey',
        'yellow',
        'color',
      ].some((k) => lower.includes(k))
    ) {
      return 'Color'
    }
    return index === 0 ? 'Size' : 'Color'
  }

  const dim1Label = dim1Values[0] ? getLabel(dim1Values[0], 0) : 'Size'
  const dim2Label = dim2Values[0] ? getLabel(dim2Values[0], 1) : 'Color'

  const defaultVariant = isMultiVariant
    ? variants.find((v) => v.stock > 0) ?? variants[0] ?? null
    : null
  const defaultDim1 = defaultVariant ? defaultVariant.variant_name.split(' / ')[0] : dim1Values[0] || ''
  const defaultDim2 = defaultVariant ? defaultVariant.variant_name.split(' / ')[1] : dim2Values[0] || ''

  const [selectedDim1, setSelectedDim1] = useState(defaultDim1)
  const [selectedDim2, setSelectedDim2] = useState(defaultDim2)

  // Active selected variant
  const selected = isMultiVariant
    ? variants.find((v) => v.variant_name === `${selectedDim1} / ${selectedDim2}`) ?? null
    : selectedSingle

  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const price = product.base_price + (selected?.price_delta ?? 0)
  const stock = selected ? selected.stock : (variants.length > 0 ? 0 : product.stock)
  const soldOut = stock === 0

  const handleSelectSingle = (variant: ProductVariant) => {
    setSelectedSingle(variant)
    setQty(1)
  }

  const isDim1Disabled = (val: string) => {
    const match = variants.find((v) => v.variant_name === `${val} / ${selectedDim2}`)
    return !match || match.stock === 0
  }

  const isDim2Disabled = (val: string) => {
    const match = variants.find((v) => v.variant_name === `${selectedDim1} / ${val}`)
    return !match || match.stock === 0
  }

  const handleAdd = () => {
    onAdd(product, qty, selected ?? undefined)
    toast.success(`${product.name}${selected ? ` — ${selected.variant_name}` : ''} added to cart`)
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  return (
    <div className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
      <Table>
        <TableBody>
          {product.specs.map((spec) => (
            <TableRow key={spec.spec_name}>
              <TableCell className="w-1/3 font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase">
                {spec.spec_name}
              </TableCell>
              <TableCell className="font-medium">{spec.spec_value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Separator className="my-5" />

      {variants.length > 0 && (
        <div className="mb-5">
          {isMultiVariant ? (
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  {dim1Label}
                </p>
                <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={`Product ${dim1Label}`}>
                  {dim1Values.map((val) => {
                    const isSelected = selectedDim1 === val
                    const disabled = isDim1Disabled(val)
                    return (
                      <button
                        key={val}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        disabled={disabled}
                        onClick={() => {
                          setSelectedDim1(val)
                          setQty(1)
                        }}
                        className={cn(
                          'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background hover:border-foreground/50',
                          disabled && 'cursor-not-allowed opacity-50 line-through',
                        )}
                      >
                        {val}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <p className="font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  {dim2Label}
                </p>
                <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={`Product ${dim2Label}`}>
                  {dim2Values.map((val) => {
                    const isSelected = selectedDim2 === val
                    const disabled = isDim2Disabled(val)
                    return (
                      <button
                        key={val}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        disabled={disabled}
                        onClick={() => {
                          setSelectedDim2(val)
                          setQty(1)
                        }}
                        className={cn(
                          'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background hover:border-foreground/50',
                          disabled && 'cursor-not-allowed opacity-50 line-through',
                        )}
                      >
                        {val}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div>
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
                      onClick={() => handleSelectSingle(variant)}
                      className={cn(
                        'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background hover:border-foreground/50',
                        variantSoldOut && 'cursor-not-allowed opacity-50 line-through',
                      )}
                    >
                      {variant.variant_name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <StockBadge stock={stock} />
        <p className="font-display text-3xl font-bold tracking-tight">
          ${price.toFixed(2)}
          {selected && selected.price_delta > 0 && (
            <span className="ml-2 align-middle font-mono text-xs font-medium text-muted-foreground">
              +${selected.price_delta.toFixed(2)}
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
        {onBuyNow && (
          <Button
            size="lg"
            variant="outline"
            disabled={soldOut}
            onClick={() => onBuyNow(product, qty, selected ?? undefined)}
          >
            Buy now
          </Button>
        )}
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
