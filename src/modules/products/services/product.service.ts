import api from '../../../shared/lib/api'
import type { CursorPage } from '../../../shared/types/common.type'
import type {
  Product,
  ProductCategory,
  ProductFilters,
  ProductSpec,
  ProductVariant,
} from '../types/product.type'
import { CATEGORIES } from '../constants/product.constants'
import { productRepository } from './product.repository'
import { useCurrencyStore, type CurrencyCode } from '../../currency'

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

const CATEGORY_ALIASES: Record<string, string[]> = {
  apparel: ['apparel', 'physical-merchandise'],
  accessories: ['accessories', 'physical-merchandise'],
  home: ['home', 'home-living'],
  outdoors: ['outdoors'],
  electronics: [
    'electronics',
    'electronics-gear',
    'teknologi-informasi',
    'teknologi-mesin',
    'services-hospitality',
    'digital-products',
    'keuangan',
    'asuransi',
  ],
}

function toProductCategoryId(slug: string): string {
  const s = (slug || '').toLowerCase().replace(/\s+/g, '-')
  if (s === 'home' || s === 'home-living') return 'home-living'
  if (['electronics', 'apparel', 'accessories', 'outdoors'].includes(s)) {
    return s
  }
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
      const val =
        s.values && s.values.length > 0
          ? s.values[0].value
          : s.spec_value || ''
      specs.push({
        spec_name: s.name || s.spec_name || '',
        spec_value: val,
      })
    })
  } else if (Array.isArray(bp.specs)) {
    bp.specs.forEach((s) => {
      specs.push({
        spec_name: s.spec_name || s.name || '',
        spec_value: s.spec_value || s.value || '',
      })
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

  const categorySlug =
    bp.category?.slug ||
    bp.category_id ||
    bp.category_uuid ||
    'electronics'

  const categoryName = bp.category?.name || bp.category?.slug || undefined

  // deterministic mock rating/review when backend doesn't provide
  const hash = (bp.uuid || bp.id || bp.name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const rating = 4.2 + ((hash % 7) * 0.1) // 4.2-4.8
  const review_count = 12 + (hash % 229) // 12-240

  const backendDiscount = bp.discount_percent !== undefined ? Number(bp.discount_percent) : undefined
  const origPrice = Number(bp.original_price ?? bp.compare_price ?? 0)
  const curPrice = Number(bp.price ?? bp.base_price ?? 0)

  const resolvedDiscountPercent = (() => {
    // 1. If backend explicitly provides discount_percent, respect it (0 means no discount)
    if (backendDiscount !== undefined) {
      return backendDiscount > 0 ? backendDiscount : undefined
    }
    // 2. If original price is higher than current price
    if (origPrice > curPrice && curPrice > 0) {
      const calculated = Math.round(((origPrice - curPrice) / origPrice) * 100)
      return calculated > 0 ? calculated : undefined
    }
    // 3. Fallback only if SKU explicitly designates SALE
    if (bp.sku?.includes('SALE')) {
      return 10 + (hash % 20)
    }
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
    base_price: (() => {
      const raw = Number(bp.price ?? bp.base_price ?? 0)
      return raw >= 1000 ? raw / 15800 : raw
    })(),
    original_price: (() => {
      // Only return original_price if there is an active discount > 0 and original price is higher
      if (resolvedDiscountPercent && origPrice > curPrice && origPrice > 0) {
        return origPrice >= 1000 ? origPrice / 15800 : origPrice
      }
      return undefined
    })(),
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
    rating: bp.average_rating !== undefined ? Number(bp.average_rating) : Number(rating.toFixed(1)),
    review_count: bp.rating_count !== undefined ? Number(bp.rating_count) : review_count,
    discount_percent: resolvedDiscountPercent,
    badge: (() => {
      if (bp.badge) return bp.badge as Product['badge']
      if (resolvedDiscountPercent) return 'SALE'
      return undefined
    })(),
  }
}

function matchesQuery(product: Product, query?: string): boolean {
  if (!query) return true
  const q = query.toLowerCase()
  return (
    product.name.toLowerCase().includes(q) ||
    product.sku.toLowerCase().includes(q) ||
    product.summary.toLowerCase().includes(q)
  )
}

function matchesSpecs(product: Product, specs?: Record<string, string[]>): boolean {
  if (!specs || Object.keys(specs).length === 0) return true
  return Object.entries(specs).every(([key, values]) => {
    if (values.length === 0) return true
    const productValues = product.specs
      .filter((s) => s.spec_name.toLowerCase() === key.toLowerCase() || key.toLowerCase() === 'variants' || key.toLowerCase() === 'color')
      .map((s) => s.spec_value.toLowerCase())
    const variantNames = (product.variants ?? []).map((v) => v.variant_name.toLowerCase())
    const combined = [...productValues, ...variantNames].join(' ').toLowerCase()
    return values.some((v) => combined.includes(v.toLowerCase()))
  })
}

function getProductDisplayPrice(p: Product, code: CurrencyCode): number {
  if (code === 'IDR') {
    return p.base_price >= 5000 ? p.base_price : Math.round(p.base_price * 15800)
  }
  return p.base_price >= 5000 ? p.base_price / 15800 : p.base_price
}

function hasDiscount(p: Product): boolean {
  if (p.discount_percent !== undefined && p.discount_percent > 0) return true
  if (p.original_price !== undefined && p.original_price > p.base_price) return true
  return false
}

function filterAndSort(
  products: Product[],
  filters: ProductFilters,
): Product[] {
  const query = filters.query?.trim()
  const filterCat = filters.category_id?.toLowerCase()
  const allowedCats =
    filterCat && filterCat !== 'all'
      ? CATEGORY_ALIASES[filterCat] ?? [filterCat]
      : null

  const activeCurrency = useCurrencyStore.getState().code

  let result = products.filter((p) => {
    if (!matchesQuery(p, query)) return false
    if (allowedCats && !allowedCats.includes(p.category_id.toLowerCase())) return false
    if (filters.in_stock_only && p.stock <= 0) return false
    if (filters.discount_only && !hasDiscount(p)) return false
    if (filters.sort === 'featured-only' && !p.is_featured) return false
    if (!matchesSpecs(p, filters.specs)) return false

    // Price filtering in active currency
    if (filters.min_price !== undefined || filters.max_price !== undefined) {
      const price = getProductDisplayPrice(p, activeCurrency)

      if (filters.min_price !== undefined) {
        let min = filters.min_price
        if (activeCurrency === 'IDR' && min < 1000) min = min * 15800
        if (activeCurrency === 'USD' && min >= 1000) min = min / 15800
        if (price < min) return false
      }

      if (filters.max_price !== undefined) {
        let max = filters.max_price
        if (activeCurrency === 'IDR' && max < 1000) max = max * 15800
        if (activeCurrency === 'USD' && max >= 1000) max = max / 15800
        if (price > max) return false
      }
    }

    return true
  })

  switch (filters.sort) {
    case 'featured-only':
      result = [...result].sort((a, b) => (a.sku || '').localeCompare(b.sku || ''))
      break
    case 'price-asc':
      result = [...result].sort((a, b) => a.base_price - b.base_price)
      break
    case 'price-desc':
      result = [...result].sort((a, b) => b.base_price - a.base_price)
      break
    case 'stock':
      result = [...result].sort((a, b) => b.stock - a.stock)
      break
    default:
      result = [...result].sort(
        (a, b) =>
          Number(b.is_featured ?? false) -
            Number(a.is_featured ?? false) ||
          (a.sku || '').localeCompare(b.sku || ''),
      )
  }
  return result
}

export type ProductDraft = Omit<Product, 'id' | 'sku'>

function paginate<T>(
  items: T[],
  cursor: number | null,
  limit: number,
): CursorPage<T> {
  const offset = Math.max(0, cursor ?? 0)
  const total = items.length
  const nextOffset = offset + limit
  return {
    items: items.slice(offset, nextOffset),
    total,
    nextCursor: nextOffset < total ? nextOffset : null,
    prevCursor: offset > 0 ? Math.max(0, offset - limit) : null,
  }
}

let cachedProducts: Product[] | null = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 2_000

export const productService = {
  clearCache(): void {
    cachedProducts = null
    cacheTimestamp = 0
  },

  async getProducts(filters: ProductFilters = {}): Promise<Product[]> {
    const now = Date.now()
    const hasFilter = Boolean(
      filters.query ||
      filters.sort ||
      filters.discount_only ||
      filters.in_stock_only ||
      filters.category_id ||
      filters.min_price !== undefined ||
      filters.max_price !== undefined,
    )

    if (!hasFilter && cachedProducts && now - cacheTimestamp < CACHE_TTL_MS) {
      return filterAndSort(cachedProducts, filters)
    }

    let allProducts: Product[] = []
    try {
      const params: Record<string, string | number | boolean> = {
        limit: filters.limit ?? 100,
        page: filters.page ?? 1,
      }
      if (filters.query?.trim()) params.search = filters.query.trim()
      if (filters.sort) params.sort = filters.sort
      if (filters.discount_only) params.discount_only = true
      if (filters.in_stock_only) params.in_stock_only = true
      if (typeof filters.min_price === 'number' && filters.min_price > 0) {
        params.min_price = filters.min_price
      }
      if (typeof filters.max_price === 'number' && filters.max_price > 0) {
        params.max_price = filters.max_price
      }
      if (filters.category_id && filters.category_id !== 'all') {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          filters.category_id,
        )
        if (isUuid) {
          params.category_uuid = filters.category_id
        } else {
          params.category = filters.category_id
        }
      }
      const res = await api.get<StandardApiResponse<BackendProduct[]>>(
        '/ecommerce/products',
        { params },
      )
      if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
        const backendMapped = res.data.data.map(mapBackendProduct)
        const repoProducts = productRepository.list()
        const backendSkus = new Set(backendMapped.map((p) => p.sku))
        const backendIds = new Set(backendMapped.map((p) => p.id))
        const complementary = repoProducts.filter(
          (p) => !backendSkus.has(p.sku) && !backendIds.has(p.id),
        )
        allProducts = [...backendMapped, ...complementary]
      }
    } catch {
      // Graceful fallback to repository if offline
    }

    if (allProducts.length === 0) {
      allProducts = productRepository.list()
    }

    if (!hasFilter) {
      cachedProducts = allProducts
      cacheTimestamp = Date.now()
    }

    return filterAndSort(allProducts, filters)
  },

  async getProductPage(
    filters: ProductFilters = {},
    cursor: number | null = null,
    limit = 12,
    signal?: AbortSignal,
  ): Promise<CursorPage<Product>> {
    const offset = Math.max(0, cursor ?? 0)
    const page = Math.floor(offset / limit) + 1

    try {
      const params: Record<string, string | number | boolean> = {
        page,
        limit,
      }
      if (filters.query?.trim()) params.search = filters.query.trim()
      if (typeof filters.min_price === 'number' && filters.min_price > 0) {
        params.min_price = filters.min_price
      }
      if (typeof filters.max_price === 'number' && filters.max_price > 0) {
        params.max_price = filters.max_price
      }
      if (filters.category_id && filters.category_id !== 'all') {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          filters.category_id,
        )
        if (isUuid) {
          params.category_uuid = filters.category_id
        } else {
          params.category = filters.category_id
        }
      }
      if (filters.sort) {
        params.sort = filters.sort
      }
      if (filters.discount_only) {
        params.discount_only = true
      }
      if (filters.in_stock_only) {
        params.in_stock_only = true
      }

      type PaginatedResponse = {
        data: BackendProduct[]
        meta?: {
          total?: number
          total_pages?: number
          current_page?: number
          per_page?: number
        }
      }

      const res = await api.get<StandardApiResponse<BackendProduct[]> & PaginatedResponse>(
        '/ecommerce/products',
        { params, signal },
      )

      const rawItems = res.data?.data
      if (Array.isArray(rawItems)) {
        let backendMapped = rawItems.map(mapBackendProduct)
        if (filters.discount_only) {
          backendMapped = backendMapped.filter(hasDiscount)
        }
        if (filters.in_stock_only) {
          backendMapped = backendMapped.filter((p) => p.stock > 0)
        }
        if (filters.sort === 'featured-only') {
          backendMapped = backendMapped.filter((p) => p.is_featured)
        }
        const total = Number(res.data?.meta?.total ?? backendMapped.length)
        const nextOffset = offset + backendMapped.length
        return {
          items: backendMapped,
          total,
          nextCursor: nextOffset < total ? nextOffset : null,
          prevCursor: offset > 0 ? Math.max(0, offset - limit) : null,
        }
      }
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === 'CanceledError') {
        throw err
      }
      // Fallback to local repository if offline
    }

    const all = await this.getProducts(filters)
    return paginate(all, cursor, limit)
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const res = await api.get<StandardApiResponse<BackendProduct>>(
        `/ecommerce/products/${id}`,
      )
      if (res.data?.data) {
        return mapBackendProduct(res.data.data)
      }
    } catch {
      // Graceful fallback to local repository if offline or not found on server
    }

    const local = productRepository.list().find((p) => p.id === id || p.sku === id)
    return local ?? null
  },

  async getFeatured(limit = 4): Promise<Product[]> {
    const all = await this.getProducts()
    const featured = all.filter((p) => p.is_featured)
    const rest = all.filter((p) => !p.is_featured)
    return [...featured, ...rest].slice(0, limit)
  },

  async getRelated(product: Product, limit = 3): Promise<Product[]> {
    const all = await this.getProducts()
    const same = all.filter(
      (p) => p.id !== product.id && p.category_id === product.category_id,
    )
    const rest = all.filter(
      (p) => p.id !== product.id && p.category_id !== product.category_id,
    )
    return [...same, ...rest].slice(0, limit)
  },

  async getCategories(): Promise<ProductCategory[]> {
    try {
      const res = await api.get<StandardApiResponse<Array<{ uuid: string; name: string; slug?: string; description?: string; is_active?: boolean }>>>('/ecommerce/categories')
      const items = res.data?.data
      if (Array.isArray(items) && items.length > 0) {
        return items
          .filter((cat) => cat.is_active !== false)
          .map((cat) => ({
            id: cat.slug || cat.uuid,
            label: cat.name,
            tagline: cat.description || '',
          }))
      }
    } catch {
      // Fallback to static CATEGORIES
    }
    return CATEGORIES
  },

  async createProduct(draft: ProductDraft): Promise<Product> {
    try {
      const res = await api.post<StandardApiResponse<BackendProduct>>(
        '/ecommerce/products',
        {
          name: draft.name,
          price: draft.base_price,
          original_price: draft.base_price,
          discount_percent: 0,
          stock: draft.stock,
          image: draft.cover_image_url,
          description: draft.summary || draft.name,
          category_uuid: draft.category_id,
        },
      )
      if (res.data.data) {
        return mapBackendProduct(res.data.data)
      }
    } catch {
      // Fallback
    }

    const products = productRepository.list()
    const maxSeq = products.reduce((max, p) => {
      const match = /^SKU-(\d+)$/.exec(p.sku)
      return match ? Math.max(max, Number(match[1])) : max
    }, 1000)
    const sku = `SKU-${maxSeq + 1}`
    const product: Product = { ...draft, id: sku, sku }
    productRepository.insert(product)
    return product
  },

  async updateProduct(
    id: string,
    patch: Partial<ProductDraft>,
  ): Promise<Product | null> {
    try {
      const res = await api.put<StandardApiResponse<BackendProduct>>(
        `/ecommerce/products/${id}`,
        {
          ...(patch.name ? { name: patch.name } : {}),
          ...(patch.base_price !== undefined
            ? { price: patch.base_price }
            : {}),
          ...(patch.stock !== undefined
            ? { stock: patch.stock }
            : {}),
          ...(patch.cover_image_url
            ? { cover_image_url: patch.cover_image_url }
            : {}),
          ...(patch.summary ? { summary: patch.summary } : {}),
          ...(patch.is_featured !== undefined
            ? { is_featured: patch.is_featured }
            : {}),
        },
      )
      if (res.data.data) {
        return mapBackendProduct(res.data.data)
      }
    } catch {
      // Fallback
    }

    const products = productRepository.update(id, patch)
    return products.find((p) => p.id === id) ?? null
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      await api.delete(`/ecommerce/products/${id}`)
    } catch {
      // Fallback
    }
    productRepository.remove(id)
  },

  async resetCatalog(): Promise<void> {
    productRepository.reset()
  },
}
