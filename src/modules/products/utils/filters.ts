import { productFiltersSchema, type ProductFiltersRaw } from '../schemas/product.schema'
import type { ProductFilters } from '../types/product.type'

export function parseProductFilters(params: URLSearchParams): ProductFilters {
  const raw: ProductFiltersRaw = {
    category_id: (params.get('category') ?? undefined) as ProductFilters['category_id'],
    query: params.get('q') ?? undefined,
    sort: (params.get('sort') ?? undefined) as ProductFilters['sort'],
    in_stock_only: (params.get('inStock') ?? undefined) as 'true' | 'false' | undefined,
    min_price: (params.get('minPrice') ?? undefined) as unknown as number | undefined,
    max_price: (params.get('maxPrice') ?? undefined) as unknown as number | undefined,
    specs: (params.get('specs') ?? undefined) as unknown as string | undefined,
    discount_only: (params.get('discount') ?? undefined) as 'true' | 'false' | undefined,
  }
  const parsed = productFiltersSchema.safeParse(raw)
  if (!parsed.success) return {}
  const { in_stock_only, discount_only, ...rest } = parsed.data
  return { ...rest, in_stock_only, discount_only }
}

export function toProductParams(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.category_id && filters.category_id !== 'all')
    params.set('category', filters.category_id)
  if (filters.query) params.set('q', filters.query)
  if (filters.sort) params.set('sort', filters.sort)
  if (filters.in_stock_only) params.set('inStock', 'true')
  if (filters.min_price !== undefined) params.set('minPrice', String(filters.min_price))
  if (filters.max_price !== undefined) params.set('maxPrice', String(filters.max_price))
  if (filters.specs && Object.keys(filters.specs).length > 0)
    params.set('specs', JSON.stringify(filters.specs))
  if (filters.discount_only) params.set('discount', 'true')
  return params
}
