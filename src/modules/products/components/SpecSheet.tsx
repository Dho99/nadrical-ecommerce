import { useState, useMemo } from 'react'
import { Check, MessageCircle, ShoppingCart } from 'lucide-react'
import { toast } from '@/shared/lib/alert'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
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
import { CHAT_OPEN_EVENT, type ProductChatContext } from '../../../shared/constants/chat.constants'
import { ResponsiveFormDialog } from '../../../shared/components/ResponsiveFormDialog'
import { useCurrency } from '../../currency'
import type { Product, ProductVariant } from '../types/product.type'

interface SpecSheetProps {
  product: Product
  onAdd: (product: Product, qty: number, variant?: ProductVariant) => void
  onBuyNow?: (product: Product, qty: number, variant?: ProductVariant) => void
}

export function SpecSheet({ product, onAdd, onBuyNow }: SpecSheetProps) {
  const variants = useMemo(() => product.variants ?? [], [product.variants])
  const { format, code } = useCurrency()

  // 1. Structured Dimensions Resolution (from product.variant_options or auto-derived)
  const optionDimensions = useMemo(() => {
    if (product.variant_options && product.variant_options.length > 0) {
      return product.variant_options.map((group) => ({
        name: group.name,
        values: group.values
          .map((v) =>
            typeof v === 'string'
              ? v.trim()
              : ((v as any)?.value || (v as any)?.label || (v as any)?.name || '').trim(),
          )
          .filter(Boolean),
      }))
    }

    // Fallback: check if variants have options JSON
    const map = new Map<string, Set<string>>()
    for (const v of variants) {
      if (v.options && Object.keys(v.options).length > 0) {
        for (const [k, val] of Object.entries(v.options)) {
          if (!map.has(k)) map.set(k, new Set())
          map.get(k)?.add(val)
        }
      }
    }
    if (map.size > 0) {
      return Array.from(map.entries()).map(([name, set]) => ({
        name,
        values: Array.from(set),
      }))
    }

    // Fallback: legacy slash-delimited names e.g. "Hitam / M"
    if (variants.length > 0 && variants[0].variant_name.includes(' / ')) {
      const parts = variants[0].variant_name.split(' / ')
      if (parts.length === 2) {
        return [
          { name: 'Varian 1', values: Array.from(new Set(variants.map((v) => v.variant_name.split(' / ')[0]))) },
          { name: 'Varian 2', values: Array.from(new Set(variants.map((v) => v.variant_name.split(' / ')[1]))) },
        ]
      }
    }

    return []
  }, [product.variant_options, variants])

  const isMultiDimension = optionDimensions.length > 0

  // 2. Initial state setup
  const [selectedSingle, setSelectedSingle] = useState<ProductVariant | null>(() => {
    if (isMultiDimension) return null
    return variants.find((v) => v.stock > 0) ?? variants[0] ?? null
  })

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    if (!isMultiDimension) return {}

    // Find first variant in stock, or fallback to first variant
    const defaultVar = variants.find((v) => v.stock > 0) ?? variants[0] ?? null
    if (defaultVar?.options && Object.keys(defaultVar.options).length > 0) {
      return defaultVar.options
    }

    // Build default from first values
    const initial: Record<string, string> = {}
    for (const dim of optionDimensions) {
      if (dim.values[0]) {
        initial[dim.name] = dim.values[0]
      }
    }
    return initial
  })

  // 3. Resolve active selected variant
  const selected = useMemo(() => {
    if (!isMultiDimension) return selectedSingle

    return (
      variants.find((v) => {
        if (v.options && Object.keys(v.options).length > 0) {
          return Object.entries(selectedOptions).every(([k, val]) => v.options?.[k] === val)
        }
        // Fallback matching by compound name
        const expectedName = Object.values(selectedOptions).join(' / ')
        return v.variant_name === expectedName
      }) ?? null
    )
  }, [isMultiDimension, variants, selectedOptions, selectedSingle])

  // 4. Check if an option in a dimension is disabled (out of stock)
  const isOptionDisabled = (dimName: string, val: string) => {
    const candidateOptions = { ...selectedOptions, [dimName]: val }
    const match = variants.find((v) => {
      if (v.options && Object.keys(v.options).length > 0) {
        return Object.entries(candidateOptions).every(([k, vVal]) => v.options?.[k] === vVal)
      }
      const expectedName = Object.values(candidateOptions).join(' / ')
      return v.variant_name === expectedName
    })
    return !match || match.stock === 0
  }

  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [messageOpen, setMessageOpen] = useState(false)
  const [messageText, setMessageText] = useState(`Hi, I'm interested in ${product.name}. Is it available?`)

  const effectiveVariantPrice = selected?.effective_price ?? (product.base_price + (selected?.price_delta ?? 0))
  const price = effectiveVariantPrice
  const stock = selected ? selected.stock : variants.length > 0 ? 0 : product.stock
  const isPreorder = Boolean(product.is_preorder)
  const soldOut = stock === 0 && !isPreorder

  const handleSelectSingle = (variant: ProductVariant) => {
    setSelectedSingle(variant)
    setQty(1)
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
    const context: ProductChatContext = {
      id: product.id,
      name: product.name,
      price,
      currency: code,
      category: product.category_id,
      availability: isPreorder ? 'Pre-order' : stock > 0 ? 'In stock' : 'Out of stock',
      description: product.summary || product.name,
      image: product.cover_image_url,
    }
    window.dispatchEvent(
      new CustomEvent(CHAT_OPEN_EVENT, {
        detail: { message: messageText, productId: product.id, product: context },
      }),
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
      {product.specs && product.specs.length > 0 && (
        <>
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
        </>
      )}

      {variants.length > 0 && (
        <div className="mb-5">
          {isMultiDimension ? (
            <div className="flex flex-col gap-4">
              {optionDimensions.map((dim) => (
                <div key={dim.name}>
                  <p className="font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    Pilih {dim.name}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={`Pilih ${dim.name}`}>
                    {dim.values.map((val) => {
                      const isSelected = selectedOptions[dim.name] === val
                      const disabled = isOptionDisabled(dim.name, val)
                      return (
                        <button
                          key={val}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          disabled={disabled}
                          onClick={() => {
                            setSelectedOptions((prev) => ({ ...prev, [dim.name]: val }))
                            setQty(1)
                          }}
                          className={cn(
                            'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer',
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
              ))}
            </div>
          ) : (
            <div>
              <p className="font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase">
                Pilih Varian
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
                        'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer',
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

      <div className="flex items-center gap-5">
        <QtyStepper
          value={qty}
          max={isPreorder ? 99 : Math.max(stock, 1)}
          onChange={setQty}
          label={`quantity of ${product.name}`}
        />
        <div className="flex flex-1 flex-col items-end gap-0.5">
          <div className="flex items-baseline gap-2">
            {product.discount_percent ? (
              <>
                <p className="font-display text-2xl font-bold tracking-tight">
                  {format(price * (1 - product.discount_percent / 100))}
                </p>
                <p className="text-sm text-muted-foreground line-through">{format(price)}</p>
                <span className="rounded bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground">
                  -{product.discount_percent}%
                </span>
              </>
            ) : (
              <p className="font-display text-2xl font-bold tracking-tight">
                {format(price)}
                {selected && selected.price_delta > 0 && (
                  <span className="ml-2 align-middle font-mono text-xs font-medium text-muted-foreground">
                    +{format(selected.price_delta)}
                  </span>
                )}
              </p>
            )}
          </div>
          {product.discount_percent ? (
            <p className="font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              You save {format(price * (product.discount_percent / 100))} ({product.discount_percent}% off)
            </p>
          ) : null}
        </div>
      </div>

      {isPreorder && (
        <div className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs dark:bg-amber-950/20">
          <p className="font-medium text-amber-800 dark:text-amber-400">
            Pre-order
            {product.preorder_eta
              ? ` · ETA ${new Date(product.preorder_eta).toLocaleDateString('en-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
              : ''}
          </p>
          {product.preorder_deposit !== undefined && (
            <p className="text-muted-foreground">Deposit {format(product.preorder_deposit)} required</p>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
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
          <AlertDescription>This product is currently sold out. Sign in to get restock alerts.</AlertDescription>
        </Alert>
      )}

      <ResponsiveFormDialog
        open={messageOpen}
        onOpenChange={setMessageOpen}
        title={`Ask about ${product.name}`}
        description="Send a message and our team will reply via live chat."
      >
        <div className="grid gap-3">
          <Label htmlFor="msg">Message</Label>
          <Textarea id="msg" value={messageText} onChange={(e) => setMessageText(e.target.value)} rows={4} />
          <Input placeholder="Your name (optional)" aria-label="Name" className="hidden" />
        </div>
        <div className="mt-2 flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => setMessageOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
            Send to chat
          </Button>
        </div>
      </ResponsiveFormDialog>
    </div>
  )
}
