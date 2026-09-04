import { useState } from 'react'
import { Check, MessageCircle, ShoppingCart } from 'lucide-react'
import { toast } from '@/shared/lib/alert'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  QtyStepper,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Textarea,
} from '../../../shared/components/ui'
import { cn } from '../../../shared/utils/cn'
import type { Product, ProductVariant } from '../types/product.type'

interface SpecSheetProps {
  product: Product
  onAdd: (product: Product, qty: number, variant?: ProductVariant) => void
  onBuyNow?: (product: Product, qty: number, variant?: ProductVariant) => void
}

function StockBadge({ stock, isPreorder }: { stock: number; isPreorder?: boolean }) {
  if (isPreorder) return <Badge className="bg-amber-500 text-white">Pre-order</Badge>
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
  const [messageOpen, setMessageOpen] = useState(false)
  const [messageText, setMessageText] = useState(`Hi, I'm interested in ${product.name}. Is it available?`)

  const price = product.base_price + (selected?.price_delta ?? 0)
  const stock = selected ? selected.stock : (variants.length > 0 ? 0 : product.stock)
  const isPreorder = Boolean(product.is_preorder)
  const soldOut = stock === 0 && !isPreorder

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
    toast.success(`${product.name}${selected ? ` — ${selected.variant_name}` : ''} added to cart`, {
      position: 'top-center',
      style: { marginTop: '72px' },
      duration: 2500,
      closeButton: true,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  const handleSendMessage = () => {
    // fire custom event to open floating chat
    window.dispatchEvent(
      new CustomEvent('nadrical:open-chat', { detail: { message: messageText, productId: product.id } }),
    )
    toast.info('Message sent — check live chat', {
      position: 'top-center',
      style: { marginTop: '72px' },
      closeButton: true,
    })
    setMessageOpen(false)
  }

  return (
    <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm sm:p-5">
      <Table>
        <TableBody>
          {product.specs.map((spec) => (
            <TableRow key={spec.spec_name}>
              <TableCell className="w-1/3 py-2 font-mono text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                {spec.spec_name}
              </TableCell>
              <TableCell className="py-2 text-sm font-medium">{spec.spec_value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Separator className="my-4" />

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
        <StockBadge stock={stock} isPreorder={isPreorder} />
        <p className="font-display text-2xl font-bold tracking-tight">
          ${price.toFixed(2)}
          {selected && selected.price_delta > 0 && (
            <span className="ml-2 align-middle font-mono text-xs font-medium text-muted-foreground">
              +${selected.price_delta.toFixed(2)}
            </span>
          )}
        </p>
      </div>
      {isPreorder && (
        <div className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs dark:bg-amber-950/20">
          <p className="font-medium text-amber-800 dark:text-amber-400">Pre-order{product.preorder_eta ? ` · ETA ${new Date(product.preorder_eta).toLocaleDateString('en-ID', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}</p>
          {product.preorder_deposit !== undefined && <p className="text-muted-foreground">Deposit ${product.preorder_deposit.toFixed(2)} required</p>}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <QtyStepper
          value={qty}
          max={isPreorder ? 99 : Math.max(stock, 1)}
          onChange={setQty}
          label={`quantity of ${product.name}`}
        />
        <Button
          variant="outline"
          size="default"
          className="grow sm:grow-0"
          disabled={soldOut}
          onClick={handleAdd}
          aria-live="polite"
        >
          {added ? (
            <>
              <Check className="size-4" /> Added
            </>
          ) : (
            <>
              <ShoppingCart className="size-4" /> Add to cart
            </>
          )}
        </Button>
        {onBuyNow && (
          <Button
            size="default"
            className="grow font-bold"
            disabled={soldOut}
            onClick={() => onBuyNow(product, qty, selected ?? undefined)}
          >
            Buy now
          </Button>
        )}
        <Button variant="ghost" size="default" onClick={() => setMessageOpen(true)} className="sm:ml-auto">
          <MessageCircle className="size-4" /> Message
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

      <p className="mt-3 text-xs text-muted-foreground">
        Ships within 48h · 14-day returns · 2-year guarantee included.
      </p>

      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ask about {product.name}</DialogTitle>
            <DialogDescription>Send a message and our team will reply via live chat.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Label htmlFor="msg">Message</Label>
            <Textarea
              id="msg"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={4}
            />
            <Input
              placeholder="Your name (optional)"
              aria-label="Name"
              className="hidden"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
              Send to chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
