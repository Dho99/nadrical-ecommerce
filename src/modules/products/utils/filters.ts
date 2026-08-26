import { productFiltersSchema, type ProductFiltersRaw } from '../schemas/product.schema'
import type { ProductFilters } from '../types/product.type'

export function parseProductFilters(params: URLSearchParams): ProductFilters {
  const raw: ProductFiltersRaw = {
    category_id: (params.get('category') ?? undefined) as ProductFilters['category_id'],
    query: params.get('q') ?? undefined,
    sort: (params.get('sort') ?? undefined) as ProductFilters['sort'],
    in_stock_only: (params.get('inStock') ?? undefined) as 'true' | 'false' | undefined,
  }
  const parsed = productFiltersSchema.safeParse(raw)
  if (!parsed.success) return {}
  const { in_stock_only, ...rest } = parsed.data
  return { ...rest, in_stock_only }
}

export function toProductParams(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.category_id && filters.category_id !== 'all')
    params.set('category', filters.category_id)
  if (filters.query) params.set('q', filters.query)
  if (filters.sort) params.set('sort', filters.sort)
  if (filters.in_stock_only) params.set('inStock', 'true')
  return params
}
