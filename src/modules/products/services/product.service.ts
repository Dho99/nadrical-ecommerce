import api, { unwrapData } from '../../../shared/lib/api'
import type { CursorPage } from '../../../shared/types/common.type'
import type {
  Product,
  ProductCategory,
  ProductFilters,
  ProductSpec,
  ProductVariant,
} from '../types/product.type'
import { CATEGORIES } from '../constants/product.constants'

interface BackendProduct {
  uuid?: string
  id?: string
  sku?: string
  name: string
  slug?: string
  summary?: string
  description?: string
  image?: string
  cover_image_url?: string
  images?: string[]
  price?: number
  base_price?: number
  original_price?: number
  compare_price?: number
  stock?: number
  is_featured?: boolean
  is_preorder?: boolean
  preorder_eta?: string
  preorder_deposit?: number
  discount_percent?: number
  average_rating?: number
  rating_count?: number
  badge?: string
  category_uuid?: string
  category_id?: string
  status?: string
  category?: {
    uuid?: string
    name?: string
    slug?: string
  }
  specifications?: Array<{
    name?: string
    spec_name?: string
    values?: Array<{ value: string }>
    spec_value?: string
  }>
  specs?: Array<{
    spec_name?: string
    name?: string
    spec_value?: string
    value?: string
  }>
  variants?: Array<{
    uuid?: string
    id?: string
    variant_name?: string
    name?: string
    price_delta?: number
    stock?: number
  }>
}

interface StandardApiResponse<T> {
  success: boolean
  message: string
  data?: T
  meta?: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}

function toProductCategoryId(slug: string): string {
  const s = (slug || '').toLowerCase().replace(/\s+/g, '-')
  if (s === 'home' || s === 'home-living') return 'home-living'
  if (['electronics', 'apparel', 'accessories', 'outdoors'].includes(s)) return s
  if (s.includes('appar') || s.includes('cloth') || s.includes('wear') || s.includes('fashion')) return 'apparel'
  if (s.includes('home') || s.includes('furn') || s.includes('liv') || s.includes('kitchen')) return 'home-living'
  if (s.includes('access') || s.includes('merchandise') || s.includes('leather') || s.includes('bag') || s.includes('mat')) return 'accessories'
  if (s.includes('outdoor') || s.includes('camp') || s.includes('trail') || s.includes('sport')) return 'outdoors'
  return 'electronics'
}

function mapBackendProduct(bp: BackendProduct): Product {
  const specs: ProductSpec[] = []
  if (Array.isArray(bp.specifications)) {
    bp.specifications.forEach((s) => {
      const val = s.values && s.values.length > 0 ? s.values[0].value : s.spec_value || ''
      specs.push({ spec_name: s.name || s.spec_name || '', spec_value: val })
    })
  } else if (Array.isArray(bp.specs)) {
    bp.specs.forEach((s) => {
      specs.push({ spec_name: s.spec_name || s.name || '', spec_value: s.spec_value || s.value || '' })
    })
  }

  const variants: ProductVariant[] = []
  if (Array.isArray(bp.variants)) {
    bp.variants.forEach((v) => {
      variants.push({
        id: v.uuid || v.id || '',
        variant_name: v.variant_name || v.name || '',
        price_delta: Number(v.price_delta || 0),
        stock: Number(v.stock || 0),
      })
    })
  }

  const categorySlug = bp.category?.slug || bp.category_id || bp.category_uuid || 'electronics'
  const categoryName = bp.category?.name || bp.category?.slug || undefined

  const backendDiscount = bp.discount_percent !== undefined ? Number(bp.discount_percent) : undefined
  const origPrice = Number(bp.original_price ?? bp.compare_price ?? 0)
  const curPrice = Number(bp.price ?? bp.base_price ?? 0)

  const resolvedDiscountPercent = (() => {
    if (backendDiscount !== undefined) return backendDiscount > 0 ? backendDiscount : undefined
    if (origPrice > curPrice && curPrice > 0) {
      const calculated = Math.round(((origPrice - curPrice) / origPrice) * 100)
      return calculated > 0 ? calculated : undefined
    }
    if (bp.sku?.includes('SALE')) return 10
    return undefined
  })()

  return {
    id: bp.uuid || bp.id || '',
    sku: bp.sku || `SKU-${bp.uuid || bp.id || ''}`,
    name: bp.name,
    slug: bp.slug || (bp.uuid || bp.id || ''),
    description: bp.description || bp.summary || '',
    category_id: toProductCategoryId(categorySlug),
    category_name: categoryName,
    base_price: curPrice,
    original_price: resolvedDiscountPercent && origPrice > curPrice && origPrice > 0 ? origPrice : undefined,
    stock: Number(bp.stock ?? 0),
    cover_image_url: bp.image || bp.cover_image_url || '',
    images: Array.isArray(bp.images) && bp.images.length > 0 ? bp.images : undefined,
    is_featured: Boolean(bp.is_featured),
    is_preorder: Boolean(bp.is_preorder),
    preorder_eta: bp.preorder_eta,
    preorder_deposit: bp.preorder_deposit !== undefined ? Number(bp.preorder_deposit) : undefined,
    summary: bp.summary || bp.description?.slice(0, 120) || '',
    specs,
    variants: variants.length > 0 ? variants : undefined,
    rating: bp.average_rating !== undefined ? Number(bp.average_rating) : 0,
    review_count: bp.rating_count !== undefined ? Number(bp.rating_count) : 0,
    discount_percent: resolvedDiscountPercent,
    badge: (() => {
      if (bp.badge) return bp.badge as Product['badge']
      if (resolvedDiscountPercent) return 'SALE'
      return undefined
    })(),
  }
}

function hasDiscount(p: Product): boolean {
  if (p.discount_percent !== undefined && p.discount_percent > 0) return true
  if (p.original_price !== undefined && p.original_price > p.base_price) return true
  return false
}

function buildParams(filters: ProductFilters, page?: number, limit?: number): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {}
  if (limit !== undefined) params.limit = limit
  else if (filters.limit !== undefined) params.limit = filters.limit
  if (page !== undefined) params.page = page
  else if (filters.page !== undefined) params.page = filters.page
  if (filters.query?.trim()) params.search = filters.query.trim()
  if (filters.sort) params.sort = filters.sort
  if (filters.discount_only) params.discount_only = true
  if (filters.in_stock_only) params.in_stock_only = true
  if (typeof filters.min_price === 'number' && filters.min_price > 0) params.min_price = filters.min_price
  if (typeof filters.max_price === 'number' && filters.max_price > 0) params.max_price = filters.max_price
  if (filters.category_id && filters.category_id !== 'all') {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filters.category_id)
    if (isUuid) params.category_uuid = filters.category_id
    else params.category = filters.category_id
  }
  return params
}

export type ProductDraft = Omit<Product, 'id' | 'sku'>

let cachedProducts: Product[] | null = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 5_000

export const productService = {
  clearCache(): void {
    cachedProducts = null
    cacheTimestamp = 0
  },

  async getProducts(filters: ProductFilters = {}): Promise<Product[]> {
    const now = Date.now()
    const hasServerFilter = Boolean(
      filters.query || filters.category_id || filters.min_price !== undefined || filters.max_price !== undefined,
    )
    if (!hasServerFilter && cachedProducts && now - cacheTimestamp < CACHE_TTL_MS) {
      return cachedProducts
    }

    const params = buildParams(filters, filters.page ?? 1, filters.limit ?? 100)
    const res = await api.get<StandardApiResponse<BackendProduct[]>>('/ecommerce/products', { params })
    const data = unwrapData<BackendProduct[]>(res.data) ?? res.data.data
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(res.data.message || 'No products found')
    }
    const mapped = data.map(mapBackendProduct)
    let result = mapped
    if (filters.discount_only) result = result.filter(hasDiscount)
    if (filters.in_stock_only) result = result.filter((p) => p.stock > 0)
    if (filters.sort === 'featured-only') result = result.filter((p) => p.is_featured)
    if (!hasServerFilter) {
      cachedProducts = result
      cacheTimestamp = Date.now()
    }
    return result
  },

  async getProductPage(
    filters: ProductFilters = {},
    cursor: number | null = null,
    limit = 12,
    signal?: AbortSignal,
  ): Promise<CursorPage<Product>> {
    const offset = Math.max(0, cursor ?? 0)
    const page = Math.floor(offset / limit) + 1
    const params = buildParams(filters, page, limit)

    type PaginatedResponse = { data: BackendProduct[]; meta?: { total?: number; total_pages?: number; current_page?: number; per_page?: number } }
    const res = await api.get<StandardApiResponse<BackendProduct[]> & PaginatedResponse>('/ecommerce/products', { params, signal })
    const rawItems = unwrapData<BackendProduct[]>(res.data) ?? (res.data as PaginatedResponse).data ?? res.data.data
    if (!Array.isArray(rawItems)) throw new Error('Invalid products response')

    let backendMapped = rawItems.map(mapBackendProduct)
    if (filters.discount_only) backendMapped = backendMapped.filter(hasDiscount)
    if (filters.in_stock_only) backendMapped = backendMapped.filter((p) => p.stock > 0)
    if (filters.sort === 'featured-only') backendMapped = backendMapped.filter((p) => p.is_featured)

    const meta = (res.data as StandardApiResponse<BackendProduct[]>).meta
    const total = Number(meta?.total ?? (res.data as PaginatedResponse).meta?.total ?? backendMapped.length)
    const nextOffset = offset + backendMapped.length
    return {
      items: backendMapped,
      total,
      nextCursor: nextOffset < total ? nextOffset : null,
      prevCursor: offset > 0 ? Math.max(0, offset - limit) : null,
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    const res = await api.get<StandardApiResponse<BackendProduct>>(`/ecommerce/products/${id}`)
    const data = unwrapData<BackendProduct>(res.data) ?? res.data.data
    if (data) return mapBackendProduct(data)
    return null
  },

  async getFeatured(limit = 4): Promise<Product[]> {
    const all = await this.getProducts()
    const featured = all.filter((p) => p.is_featured)
    const rest = all.filter((p) => !p.is_featured)
    return [...featured, ...rest].slice(0, limit)
  },

  async getRelated(product: Product, limit = 3): Promise<Product[]> {
    const all = await this.getProducts()
    const same = all.filter((p) => p.id !== product.id && p.category_id === product.category_id)
    const rest = all.filter((p) => p.id !== product.id && p.category_id !== product.category_id)
    return [...same, ...rest].slice(0, limit)
  },

  async getCategories(): Promise<ProductCategory[]> {
    const res = await api.get<StandardApiResponse<Array<{ uuid: string; name: string; slug?: string; description?: string; is_active?: boolean }>>>('/ecommerce/categories')
    const items = unwrapData<Array<{ uuid: string; name: string; slug?: string; description?: string; is_active?: boolean }>>(res.data) ?? res.data.data
    if (Array.isArray(items) && items.length > 0) {
      return items
        .filter((cat) => cat.is_active !== false)
        .map((cat) => ({ id: cat.slug || cat.uuid, label: cat.name, tagline: cat.description || '' }))
    }
    return CATEGORIES
  },

  async createProduct(draft: ProductDraft): Promise<Product> {
    const res = await api.post<StandardApiResponse<BackendProduct>>('/ecommerce/products', {
      name: draft.name,
      description: draft.description || draft.summary || draft.name,
      summary: draft.summary || draft.name,
      image: draft.cover_image_url,
      original_price: draft.original_price ?? draft.base_price,
      discount_percent: draft.discount_percent ?? 0,
      stock: draft.stock,
      is_featured: draft.is_featured ?? false,
      category_uuid: draft.category_id,
    })
    const data = unwrapData<BackendProduct>(res.data) ?? res.data.data
    if (data) return mapBackendProduct(data)
    throw new Error(res.data.message || 'Failed to create product')
  },

  async updateProduct(id: string, patch: Partial<ProductDraft>): Promise<Product | null> {
    const body: Record<string, unknown> = {}
    if (patch.name !== undefined) body.name = patch.name
    if (patch.base_price !== undefined) body.original_price = patch.base_price
    if (patch.stock !== undefined) body.stock = patch.stock
    if (patch.cover_image_url !== undefined) body.image = patch.cover_image_url
    if (patch.summary !== undefined) body.summary = patch.summary
    if (patch.is_featured !== undefined) body.is_featured = patch.is_featured
    if (patch.category_id !== undefined) body.category_uuid = patch.category_id

    const existing = await this.getProductById(id).catch(() => null)
    if (!body.name && existing) body.name = existing.name
    if (body.original_price === undefined && existing) body.original_price = existing.original_price ?? existing.base_price

    const res = await api.put<StandardApiResponse<BackendProduct>>(`/ecommerce/products/${id}`, body)
    const data = unwrapData<BackendProduct>(res.data) ?? res.data.data
    if (data) return mapBackendProduct(data)
    return null
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/ecommerce/products/${id}`)
  },

  async resetCatalog(): Promise<void> {
    throw new Error('resetCatalog tidak tersedia untuk backend mode')
  },
}
