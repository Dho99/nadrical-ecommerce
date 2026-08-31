import { api } from '../../../shared/lib/api'
import type { CursorPage } from '../../../shared/types/common.type'
import type { Product, ProductCategory, ProductFilters } from '../types/product.type'

function mapProduct(p: ApiProduct): Product {
  return {
    id: p.uuid,
    sku: p.sku,
    name: p.name,
    category_id: p.category_uuid,
    base_price: Number(p.price),
    stock: p.stock,
    cover_image_url: p.image,
    badge: p.badge as Product['badge'] | undefined,
    is_featured: p.is_featured,
    summary: p.description,
    specs: [],
    variants: [],
  }
}

interface ApiProduct {
  uuid: string
  name: string
  description: string
  price: string
  original_price?: string
  discount_percent?: number
  stock: number
  average_rating?: number
  category_uuid: string
  image: string
  sku: string
  is_featured?: boolean
  badge?: string
  created_at?: string
  updated_at?: string
}

interface ApiProductCategory {
  uuid: string
  name: string
}

export const productService = {
  async getProducts(filters: ProductFilters = {}): Promise<Product[]> {
    const params: Record<string, string> = {}
    if (filters.query) params.search = filters.query
    if (filters.category_id && filters.category_id !== 'all') params.category_uuid = filters.category_id
    if (filters.sort) params.sort = filters.sort
    const data = await api.get<{ items: ApiProduct[]; meta: { total: number } }>(
      '/ecommerce/products',
      params,
    )
    return data.items.map(mapProduct)
  },

  async getProductPage(
    filters: ProductFilters = {},
    cursor: number | null = null,
    limit = 12,
  ): Promise<CursorPage<Product>> {
    const params: Record<string, string> = { limit: String(limit) }
    if (cursor !== null) params.page = String(Math.floor(cursor / limit) + 1)
    if (filters.query) params.search = filters.query
    if (filters.category_id && filters.category_id !== 'all') params.category_uuid = filters.category_id
    if (filters.sort) params.sort = filters.sort
    const data = await api.get<{ items: ApiProduct[]; meta: { total: number; per_page: number; current_page: number } }>(
      '/ecommerce/products',
      params,
    )
    const total = data.meta.total
    const currentPage = data.meta.current_page
    const perPage = data.meta.per_page
    const nextCursor = currentPage * perPage < total ? currentPage * perPage : null
    const prevCursor = currentPage > 1 ? (currentPage - 2) * perPage : null
    return {
      items: data.items.map(mapProduct),
      total,
      nextCursor,
      prevCursor,
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    const data = await api.get<{ item: ApiProduct }>(`/ecommerce/products/${id}`)
    if (!data.item) return null
    return mapProduct(data.item)
  },

  async getFeatured(limit = 4): Promise<Product[]> {
    const data = await api.get<{ items: ApiProduct[] }>('/ecommerce/products', {
      limit: String(limit),
    })
    return data.items.map(mapProduct)
  },

  async getRelated(_product: Product, limit = 3): Promise<Product[]> {
    const data = await api.get<{ items: ApiProduct[] }>('/ecommerce/products', {
      limit: String(limit),
    })
    return data.items.map(mapProduct)
  },

  async getCategories(): Promise<ProductCategory[]> {
    const data = await api.get<{ items: ApiProductCategory[] }>('/ecommerce/categories')
    return data.items.map((c) => ({
      id: c.uuid as ProductCategory['id'],
      label: c.name,
      tagline: '',
    }))
  },

  async createProduct(draft: Omit<Product, 'id' | 'sku'>): Promise<Product> {
    const data = await api.post<{ item: ApiProduct }>('/ecommerce/products', draft)
    return mapProduct(data.item)
  },

  async updateProduct(id: string, patch: Partial<Omit<Product, 'id' | 'sku'>>): Promise<Product | null> {
    try {
      const data = await api.put<{ item: ApiProduct }>(`/ecommerce/products/${id}`, patch)
      return mapProduct(data.item)
    } catch {
      return null
    }
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/ecommerce/products/${id}`)
  },
}