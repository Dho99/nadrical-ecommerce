import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Search, X } from 'lucide-react'
import {
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

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const debounced = useDebounce(query, 300)

  const [results, setResults] = useState<Awaited<ReturnType<typeof productService.getProducts>>>([])

  useEffect(() => {
    if (!open) return
    const q = debounced.trim()
    if (!q) return
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reflect fetching state before async lookup
    setLoading(true)
    void productService.getProducts({ query: q }).then((products) => {
      if (cancelled) return
      setResults(products.slice(0, 8))
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [debounced, open])

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
    onOpenChange(false)
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
              placeholder="Try “Nike Air Max” or “SKU-1001”…"
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
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Type to search across the catalog. Use ↑ ↓ arrows and Enter to pick a suggestion.
            </p>
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
            <div className="px-3 py-6 text-center">
              <p className="text-sm font-medium">No results for “{query.trim()}”</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try a different keyword, or search the full catalog.
              </p>
              <Button variant="outline" size="sm" className="mt-3" onClick={submit}>
                Search full catalog <ArrowRight />
              </Button>
            </div>
          ) : (
            <ul className="space-y-0.5">
              {results.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => {
                      navigate(`/products/${product.id}`)
                      reset()
                    }}
                    className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-accent"
                  >
                    <ProductImage
                      src={product.cover_image_url}
                      alt={product.name}
                      className="size-10 shrink-0 rounded-md border bg-muted object-cover"
                    />
                    <span className="min-w-0 grow">
                      <span className="block truncate text-sm font-medium">{product.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">{product.sku}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground sm:px-5">
          <span>
            {results.length > 0
              ? `${results.length} of ${results.length} suggestions`
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
