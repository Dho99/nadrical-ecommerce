import { useDeferredValue, useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger,
} from '../../../shared/components/ui'
import { CATEGORIES, SORT_OPTIONS } from '../constants/product.constants'
import type { ProductFilters } from '../types/product.type'

interface ProductFilterProps {
  filters: ProductFilters
  onChange: (patch: Partial<ProductFilters>) => void
  total: number
}

export function ProductFilter({ filters, onChange, total }: ProductFilterProps) {
  const [query, setQuery] = useState(filters.query ?? '')
  const deferredQuery = useDeferredValue(query)
  const currentQuery = filters.query ?? ''

  const [prevQuery, setPrevQuery] = useState(currentQuery)
  if (prevQuery !== currentQuery) {
    setPrevQuery(currentQuery)
    setQuery(currentQuery)
  }

  useEffect(() => {
    if (deferredQuery !== currentQuery) {
      onChange({ query: deferredQuery || undefined })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredQuery])

  const activeCategory = filters.category ?? 'all'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or SKU…"
            aria-label="Search products"
            className="pl-9"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery('')}
              className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={filters.sort ?? 'featured'}
            onValueChange={(v) => onChange({ sort: v as ProductFilters['sort'] })}
          >
            <SelectTrigger className="w-auto min-w-44" aria-label="Sort products">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium select-none">
            <input
              type="checkbox"
              checked={filters.inStockOnly ?? false}
              onChange={(e) => onChange({ inStockOnly: e.target.checked || undefined })}
              className="size-4 accent-primary"
            />
            In stock only
          </label>
        </div>

        <p className="ml-auto text-sm text-muted-foreground sm:text-right">
          {total} {total === 1 ? 'product' : 'products'} found
        </p>
      </div>

      <Tabs
        value={activeCategory}
        onValueChange={(v) => onChange({ category: v === 'all' ? undefined : (v as ProductFilters['category']) })}
      >
        <TabsList className="flex w-fit max-w-full flex-wrap justify-start">
          <TabsTrigger value="all">All</TabsTrigger>
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
