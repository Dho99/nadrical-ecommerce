import { productFiltersSchema, type ProductFiltersRaw } from '../schemas/product.schema'
import type { ProductFilters } from '../types/product.type'

export function parseProductFilters(params: URLSearchParams): ProductFilters {
  const raw: ProductFiltersRaw = {
    category: (params.get('category') ?? undefined) as ProductFilters['category'],
    query: params.get('q') ?? undefined,
    sort: (params.get('sort') ?? undefined) as ProductFilters['sort'],
    inStockOnly: (params.get('inStock') ?? undefined) as 'true' | 'false' | undefined,
  }
  const parsed = productFiltersSchema.safeParse(raw)
  if (!parsed.success) return {}
  const { inStockOnly, ...rest } = parsed.data
  return { ...rest, inStockOnly }
}

export function toProductParams(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.category && filters.category !== 'all') params.set('category', filters.category)
  if (filters.query) params.set('q', filters.query)
  if (filters.sort) params.set('sort', filters.sort)
  if (filters.inStockOnly) params.set('inStock', 'true')
  return params
}
