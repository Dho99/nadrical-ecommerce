import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { ChevronDown, Search, X, SlidersHorizontal } from 'lucide-react'
import {
  Button,
  Input,
  Label,
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
import type { Product, ProductFilters } from '../types/product.type'

interface ProductFilterProps {
  filters: ProductFilters
  onChange: (patch: Partial<ProductFilters>) => void
  total: number
  products: Product[]
}

function getFilteredSpecOptions(products: Product[]) {
  const map = new Map<string, Set<string>>()
  for (const p of products) {
    for (const s of p.specs) {
      const key = s.spec_name
      if (['Sizes', 'Size', 'Material', 'Color', 'Capacity'].includes(key)) {
        const vals = s.spec_value.split(/[,–—]/).map((v) => v.trim()).slice(0, 4)
        if (!map.has(key)) map.set(key, new Set())
        for (const v of vals) {
          if (v.length > 1 && v.length < 20) map.get(key)?.add(v)
        }
      }
    }
    if (p.variants) {
      const key = 'Color'
      if (!map.has(key)) map.set(key, new Set())
      for (const v of p.variants) {
        const c = v.variant_name.split('/').pop()?.trim()
        if (c) map.get(key)?.add(c)
      }
    }
  }
  return Array.from(map.entries()).map(([key, set]) => ({ key, values: Array.from(set).slice(0, 6) }))
}

export function ProductFilter({ filters, onChange, total, products }: ProductFilterProps) {
  const [query, setQuery] = useState(filters.query ?? '')
  const deferredQuery = useDeferredValue(query)
  const currentQuery = filters.query ?? ''
  const [specsOpen, setSpecsOpen] = useState(false)
  const specOptions = useMemo(() => getFilteredSpecOptions(products), [products])

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

  const activeCategory = filters.category_id ?? 'all'
  const hasActiveFilters =
    !!filters.query ||
    !!filters.category_id ||
    filters.in_stock_only ||
    filters.discount_only ||
    filters.min_price !== undefined ||
    filters.max_price !== undefined ||
    (filters.specs && Object.keys(filters.specs).length > 0)

  const toggleSpec = (key: string, value: string) => {
    const current = filters.specs?.[key] ?? []
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    const nextSpecs = { ...(filters.specs ?? {}) }
    if (next.length === 0) delete nextSpecs[key]
    else nextSpecs[key] = next
    onChange({ specs: Object.keys(nextSpecs).length > 0 ? nextSpecs : undefined })
  }

  return (
    <div className="sticky top-[65px] z-30 -mx-5 border-y bg-background/95 px-5 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:-mx-8 sm:px-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative w-full lg:max-w-xs">
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

            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min $"
                value={filters.min_price ?? ''}
                onChange={(e) => onChange({ min_price: e.target.value ? Number(e.target.value) : undefined })}
                className="w-24"
                aria-label="Min price"
              />
              <span className="text-muted-foreground">–</span>
              <Input
                type="number"
                placeholder="Max $"
                value={filters.max_price ?? ''}
                onChange={(e) => onChange({ max_price: e.target.value ? Number(e.target.value) : undefined })}
                className="w-24"
                aria-label="Max price"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium select-none">
              <input
                type="checkbox"
                checked={filters.discount_only ?? false}
                onChange={(e) => onChange({ discount_only: e.target.checked || undefined })}
                className="size-4 accent-primary"
              />
              Discount only
            </label>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <p className="text-sm text-muted-foreground">{total} found</p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onChange({
                    query: undefined,
                    category_id: undefined,
                    sort: undefined,
                    in_stock_only: undefined,
                    min_price: undefined,
                    max_price: undefined,
                    specs: undefined,
                    discount_only: undefined,
                  })
                }
              >
                <X className="size-3.5" />
                Clear filter
              </Button>
            )}
          </div>
        </div>

        <Tabs
          value={activeCategory}
          onValueChange={(v) => onChange({ category_id: v === 'all' ? undefined : (v as ProductFilters['category_id']) })}
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

        <div className="border-t pt-4">
          <button
            type="button"
            onClick={() => setSpecsOpen((v) => !v)}
            aria-expanded={specsOpen}
            aria-controls="specs-filter-content"
            className="flex w-full items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase"
          >
            <SlidersHorizontal className="size-3.5" />
            Specs
            <ChevronDown
              className={`ml-1 size-3.5 transition-transform ${specsOpen ? 'rotate-180' : ''}`}
            />
            <span className="ml-auto text-[11px] font-normal normal-case tracking-normal text-muted-foreground">
              {specOptions.length === 0
                ? 'no specs for filtered results'
                : specsOpen
                  ? 'hide'
                  : `${specOptions.reduce((a, g) => a + g.values.length, 0)} options`}
            </span>
          </button>
          {specsOpen && (
            <div id="specs-filter-content" className="mt-3 flex flex-wrap gap-4" role="region" aria-label="Specs filter">
              {specOptions.length === 0 ? (
                <p className="text-xs text-muted-foreground">No spec filters for current results.</p>
              ) : (
                specOptions.map((group) => (
                  <div key={group.key} className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">{group.key}:</span>
                    {group.values.map((val) => {
                      const checked = filters.specs?.[group.key]?.includes(val) ?? false
                      return (
                        <Label
                          key={val}
                          className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${checked ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-foreground/30'}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSpec(group.key, val)}
                            className="sr-only"
                          />
                          {val}
                        </Label>
                      )
                    })}
                  </div>
                ))
              )}
              <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm font-medium select-none">
                <input
                  type="checkbox"
                  checked={filters.in_stock_only ?? false}
                  onChange={(e) => onChange({ in_stock_only: e.target.checked || undefined })}
                  className="size-4 accent-primary"
                />
                In stock only
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
