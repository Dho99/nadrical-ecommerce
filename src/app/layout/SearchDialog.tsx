import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Flame, Search, Sparkles, X } from 'lucide-react'
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Skeleton,
} from '../../shared/components/ui'
import { ProductImage } from '../../shared/components/ProductImage'
import { useDebounce } from '../../shared/hooks/useDebounce'
import { productService } from '../../modules/products/services/product.service'
import { useCurrency } from '../../modules/currency'

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const navigate = useNavigate()
  const { format } = useCurrency()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const debounced = useDebounce(query, 300)

  const [results, setResults] = useState<Awaited<ReturnType<typeof productService.getProducts>>>([])
  const [related, setRelated] = useState<Awaited<ReturnType<typeof productService.getProducts>>>([])
  const [recommended, setRecommended] = useState<Awaited<ReturnType<typeof productService.getFeatured>>>([])
  const [recLoading, setRecLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    const q = debounced.trim()
    if (!q) {
      setTimeout(() => setResults([]), 0)
      setTimeout(() => setRelated([]), 0)
      setTimeout(() => setLoading(false), 0)
      return
    }
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reflect fetching state before async lookup
    setLoading(true)
    void Promise.all([
      productService.getProducts({ query: q }),
      productService.getRelatedProducts({ query: q, limit: 3 }),
    ])
      .then(([products, rel]) => {
        if (cancelled) return
        const topResults = products.slice(0, 8)
        setResults(topResults)
        const resultIds = new Set(topResults.map((p) => p.id))
        setRelated(rel.filter((p) => !resultIds.has(p.id)).slice(0, 3))
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [debounced, open])

   useEffect(() => {
     if (!open) return
     let cancelled = false
     setTimeout(() => setRecLoading(true), 0)
     void productService
       .getFeatured(6)
       .then((products) => {
         if (cancelled) return
         setTimeout(() => setRecommended(products), 0)
         setTimeout(() => setRecLoading(false), 0)
       })
       .catch(() => {
         if (!cancelled) return
         setTimeout(() => setRecLoading(false), 0)
       })
     return () => {
       cancelled = true
     }
   }, [open])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    navigate(`/products?q=${encodeURIComponent(q)}`)
    reset()
  }

  const reset = () => {
    setQuery('')
    setResults([])
    setRelated([])
    onOpenChange(false)
  }

  const handleProductClick = (id: string) => {
    navigate(`/products/${id}`)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] flex-col overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="border-b px-4 py-3 sm:px-5">
          <DialogTitle className="font-display text-lg font-bold tracking-tight">
            Search products
          </DialogTitle>
          <DialogDescription className="sr-only">
            Search the Nadrical catalog by name or SKU
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} role="search" className="flex items-center gap-2 px-4 pb-3 sm:px-5">
          <div className="relative grow">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try “Wireless Headphones”…"
              aria-label="Search products"
              className="pl-9"
            />
          </div>
          <Button type="submit" size="sm" disabled={!query.trim()}>
            Search <ArrowRight />
          </Button>
        </form>

        <div className="min-h-32 grow overflow-y-auto px-2 pb-3 sm:px-3">
          {query.trim() === '' ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-3 pt-1">
                <Sparkles className="size-3.5 text-amber-500" />
                <p className="font-mono text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Top Recommendations
                </p>
              </div>
              {recLoading ? (
                <div className="space-y-3 p-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="size-12 rounded-md" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-2/3" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recommended.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  Type to search across the catalog. Use ↑ ↓ arrows and Enter to pick a suggestion.
                </p>
              ) : (
                <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {recommended.map((product) => (
                    <li key={product.id}>
                      <button
                        type="button"
                        onClick={() => handleProductClick(product.id)}
                        className="flex w-full items-center gap-3 rounded-lg border bg-card px-2 py-2 text-left transition-colors hover:bg-accent hover:border-primary/20"
                      >
                        <ProductImage
                          src={product.cover_image_url}
                          alt={product.name}
                          className="size-12 shrink-0 rounded-md border bg-muted object-cover"
                        />
                        <span className="min-w-0 grow">
                          <span className="block truncate text-sm font-medium leading-tight">{product.name}</span>
                          <span className="block truncate font-mono text-xs font-semibold text-primary">
                            {format(product.base_price)}
                          </span>
                          <span className="flex items-center gap-1">
                            {product.badge && (
                              <Badge className="px-1 py-0 text-[10px] font-bold uppercase tracking-wider">
                                {product.badge}
                              </Badge>
                            )}
                            {product.discount_percent ? (
                              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-red-600">
                                <Flame className="size-3" /> -{product.discount_percent}%
                              </span>
                            ) : null}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="px-3 text-center text-xs text-muted-foreground">
                Type ≥1 character to search or pick a recommendation above.
              </p>
            </div>
          ) : loading && results.length === 0 ? (
            <div className="space-y-3 p-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-md" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="space-y-4">
              <div className="px-3 py-6 text-center">
                <p className="text-sm font-medium">No results for “{query.trim()}”</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try a different keyword, or check our top recommendations below.
                </p>
                <Button variant="outline" size="sm" className="mt-3" onClick={submit}>
                  Search full catalog <ArrowRight />
                </Button>
              </div>

              {recommended.length > 0 && (
                <div className="space-y-2 border-t pt-3">
                  <div className="flex items-center gap-1.5 px-2">
                    <Sparkles className="size-3.5 text-amber-500" />
                    <p className="font-mono text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Top Recommendations
                    </p>
                  </div>
                  <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {recommended.slice(0, 4).map((product) => (
                      <li key={`rec-${product.id}`}>
                        <button
                          type="button"
                          onClick={() => handleProductClick(product.id)}
                          className="flex w-full items-center gap-3 rounded-lg border bg-card px-2 py-2 text-left transition-colors hover:bg-accent hover:border-primary/20"
                        >
                          <ProductImage
                            src={product.cover_image_url}
                            alt={product.name}
                            className="size-12 shrink-0 rounded-md border bg-muted object-cover"
                          />
                          <span className="min-w-0 grow">
                            <span className="block truncate text-sm font-medium leading-tight">{product.name}</span>
                            <span className="block truncate font-mono text-xs font-semibold text-primary">
                              {format(product.base_price)}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <ul className="space-y-0.5">
                {results.map((product) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      onClick={() => handleProductClick(product.id)}
                      className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-accent"
                    >
                      <ProductImage
                        src={product.cover_image_url}
                        alt={product.name}
                        className="size-10 shrink-0 rounded-md border bg-muted object-cover"
                      />
                      <span className="min-w-0 grow">
                        <span className="block truncate text-sm font-medium">{product.name}</span>
                        <span className="block truncate font-mono text-xs font-semibold text-primary">
                          {format(product.base_price)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              {related.length > 0 && (
                <div className="border-t pt-3">
                  <div className="flex items-center gap-1.5 px-2 pb-2">
                    <Sparkles className="size-3.5 text-amber-500" />
                    <p className="font-mono text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Related Products You Might Like
                    </p>
                  </div>
                  <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {related.map((product) => (
                      <li key={`related-${product.id}`}>
                        <button
                          type="button"
                          onClick={() => handleProductClick(product.id)}
                          className="flex w-full items-center gap-3 rounded-lg border bg-card px-2 py-2 text-left transition-colors hover:bg-accent hover:border-primary/20"
                        >
                          <ProductImage
                            src={product.cover_image_url}
                            alt={product.name}
                            className="size-10 shrink-0 rounded-md border bg-muted object-cover"
                          />
                          <span className="min-w-0 grow">
                            <span className="block truncate text-xs font-medium leading-tight">{product.name}</span>
                            <span className="block truncate font-mono text-xs font-semibold text-primary">
                              {format(product.base_price)}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground sm:px-5">
          <span>
            {query.trim() !== '' && results.length > 0
              ? `${results.length} of ${results.length} suggestions`
              : query.trim() === '' && recommended.length > 0
                ? `${recommended.length} top picks`
                : 'Type ≥1 character to search'}
          </span>
          <button type="button" onClick={reset} className="inline-flex items-center gap-1 font-medium hover:text-foreground">
            <X className="size-3.5" /> Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
