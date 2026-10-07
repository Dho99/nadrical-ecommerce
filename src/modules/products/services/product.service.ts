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

export interface GetRelatedProductsOptions {
  query?: string
  categoryId?: string
  excludeIds?: string[]
  limit?: number
  sourceProduct?: Product
  diversify?: boolean
}

export interface GetTopRecommendedOptions {
  limit?: number
  diversify?: boolean
  excludeIds?: string[]
  randomize?: boolean
}

const STOP_WORDS = new Set([
  'the', 'and', 'a', 'an', 'with', 'in', 'of', 'for', 'set', 'pc',
  '42mm', '28l', '750ml', '5pc', 'queen', 'to', 'from', 'is', 'on',
])

function extractTokens(str: string): string[] {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t))
}

const COMPLEMENTARY_CATEGORIES: Record<string, string[]> = {
  electronics: ['accessories'],
  outdoors: ['accessories', 'home-living'],
  apparel: ['accessories'],
  'home-living': ['accessories'],
  accessories: ['apparel', 'electronics', 'outdoors'],
}

function hashPair(id1: string, id2: string): number {
  const s = `${id1}:${id2}`
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h % 1000) / 1000 // 0.0 to 1.0
}

export function calculateProductRecommendationScore(p: Product): number {
  const rev = p.review_count ?? 0
  const rate = p.rating ?? 0
  const disc = p.discount_percent ?? 0
  const popScore = Math.min(100, Math.log10(rev + 1) * 32)
  const dampedRate =
    rev > 0
      ? (rate * rev + 4.0 * 3) / (rev + 3)
      : rate > 0
        ? rate * 0.7
        : 3.0
  const qualScore = Math.min(100, (dampedRate / 5) * 100)
  const discScore = Math.min(100, (disc / 50) * 100)
  const featBonus = p.is_featured ? 10 : 0
  return Math.round((popScore * 0.4 + qualScore * 0.35 + discScore * 0.25 + featBonus) * 100) / 100
}

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

  async getTopRecommended(optionsOrLimit: number | GetTopRecommendedOptions = 6): Promise<Product[]> {
    const opts: GetTopRecommendedOptions =
      typeof optionsOrLimit === 'number' ? { limit: optionsOrLimit } : optionsOrLimit
    const limit = opts.limit ?? 6
    const excludeSet = new Set(opts.excludeIds ?? [])

    const all = await this.getProducts()
    const available = all.filter((p) => !excludeSet.has(p.id) && p.stock > 0)

    const pool = available.sort(
      (a, b) => calculateProductRecommendationScore(b) - calculateProductRecommendationScore(a),
    )

    if (opts.randomize) {
      const topTier = pool.slice(0, Math.max(limit * 2, 8))
      return [...topTier].sort(() => Math.random() - 0.5).slice(0, limit)
    }

    if (opts.diversify) {
      const picked: Product[] = []
      const catCounts: Record<string, number> = {}
      for (const p of pool) {
        if (picked.length >= limit) break
        const cat = p.category_id || 'other'
        if ((catCounts[cat] || 0) < 2) {
          picked.push(p)
          catCounts[cat] = (catCounts[cat] || 0) + 1
        }
      }
      if (picked.length < limit) {
        const pickedIds = new Set(picked.map((p) => p.id))
        for (const p of pool) {
          if (picked.length >= limit) break
          if (!pickedIds.has(p.id)) picked.push(p)
        }
      }
      return picked
    }

    return pool.slice(0, limit)
  },

  async getFeatured(limit = 4): Promise<Product[]> {
    return this.getTopRecommended({ limit, diversify: true })
  },

  async getRelatedProducts(options: GetRelatedProductsOptions = {}): Promise<Product[]> {
    const {
      query = '',
      categoryId = '',
      excludeIds = [],
      limit = 4,
      sourceProduct,
    } = options

    const all = await this.getProducts()
    const excludeSet = new Set(excludeIds)
    if (sourceProduct) excludeSet.add(sourceProduct.id)

    const candidates = all.filter((p) => !excludeSet.has(p.id) && p.stock > 0)

    const targetCategory = (sourceProduct?.category_id || categoryId || '').toLowerCase().trim()
    const compCats = new Set(COMPLEMENTARY_CATEGORIES[targetCategory] || [])

    const sourceTokens = new Set([
      ...extractTokens(sourceProduct?.name || ''),
      ...extractTokens(sourceProduct?.summary || sourceProduct?.description || ''),
      ...extractTokens(query),
    ])

    const scored = candidates.map((p) => {
      let score = 0
      const pCat = (p.category_id || '').toLowerCase().trim()
      const pTokens = extractTokens(p.name + ' ' + (p.summary || p.description || ''))

      // 1. Kesesuaian Kategori
      if (targetCategory && pCat === targetCategory) {
        score += 15
      } else if (compCats.has(pCat)) {
        score += 7
      }

      // 2. Kecocokan Kata Kunci (Token Matching)
      if (sourceTokens.size > 0) {
        let tokenMatches = 0
        for (const token of pTokens) {
          if (sourceTokens.has(token)) tokenMatches++
        }
        score += tokenMatches * 8
      }

      // 3. Price Proximity (jika ada sourceProduct dan harga valid)
      if (sourceProduct && sourceProduct.base_price > 0 && p.base_price > 0) {
        const ratio =
          Math.min(p.base_price, sourceProduct.base_price) /
          Math.max(p.base_price, sourceProduct.base_price)
        score += ratio * 4
      }

      // 4. Skor Kualitas Produk (Rating & Ulasan)
      const recScore = calculateProductRecommendationScore(p)
      score += recScore * 0.12

      // 5. Contextual Pair Hash Diversity (mencegah static tie-breaker pada katalog kecil)
      if (sourceProduct) {
        score += hashPair(sourceProduct.id, p.id) * 4
      }

      return { product: p, score, recScore }
    })

    scored.sort((a, b) => b.score - a.score)

    const results: Product[] = []
    const usedCategories = new Set<string>()

    for (const item of scored) {
      if (item.score > 0 && results.length < limit) {
        results.push(item.product)
        if (item.product.category_id) usedCategories.add(item.product.category_id)
      }
    }

    // Fallback cerdas dengan keragaman kategori (Category Diversity)
    if (results.length < limit) {
      const pickedIds = new Set([...excludeSet, ...results.map((r) => r.id)])
      const remainingCandidates = candidates
        .filter((p) => !pickedIds.has(p.id))
        .sort((a, b) => {
          // Prioritaskan kategori yang belum ada agar tampilan bervariasi
          const catA = a.category_id && usedCategories.has(a.category_id) ? 0 : 1
          const catB = b.category_id && usedCategories.has(b.category_id) ? 0 : 1
          if (catB !== catA) return catB - catA
          return calculateProductRecommendationScore(b) - calculateProductRecommendationScore(a)
        })

      for (const item of remainingCandidates) {
        if (results.length >= limit) break
        results.push(item)
        if (item.category_id) usedCategories.add(item.category_id)
      }
    }

    return results.slice(0, limit)
  },

  async getRelated(product: Product, limit = 3): Promise<Product[]> {
    return this.getRelatedProducts({
      sourceProduct: product,
      categoryId: product.category_id,
      excludeIds: [product.id],
      limit,
    })
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
