import { mockDelay, mockFail } from '../../../shared/lib/mock'
import type { CursorPage } from '../../../shared/types/common.type'
import type { Product, ProductCategory, ProductFilters } from '../types/product.type'
import { CATEGORIES } from '../constants/product.constants'
import { productRepository } from './product.repository'

function matchesQuery(product: Product, query?: string): boolean {
  if (!query) return true
  const q = query.toLowerCase()
  return (
    product.name.toLowerCase().includes(q) ||
    product.sku.toLowerCase().includes(q) ||
    product.summary.toLowerCase().includes(q)
  )
}

function filterAndSort(products: Product[], filters: ProductFilters): Product[] {
  const query = filters.query?.trim()
  let result = products.filter(
    (p) =>
      matchesQuery(p, query) &&
      (filters.category_id === undefined ||
        filters.category_id === 'all' ||
        p.category_id === filters.category_id) &&
      (!filters.in_stock_only || p.stock > 0),
  )

  switch (filters.sort) {
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
          Number(b.is_featured ?? false) - Number(a.is_featured ?? false) ||
          a.sku.localeCompare(b.sku),
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

export const productService = {
  async getProducts(filters: ProductFilters = {}): Promise<Product[]> {
    await mockDelay(280)
    mockFail(0.03)
    return filterAndSort(productRepository.list(), filters)
  },

  async getProductPage(
    filters: ProductFilters = {},
    cursor: number | null = null,
    limit = 12,
  ): Promise<CursorPage<Product>> {
    await mockDelay(260)
    mockFail(0.03)
    return paginate(filterAndSort(productRepository.list(), filters), cursor, limit)
  },

  async getProductById(id: string): Promise<Product | null> {
    await mockDelay(200)
    return productRepository.list().find((p) => p.id === id) ?? null
  },

  async getFeatured(limit = 4): Promise<Product[]> {
    await mockDelay(240)
    const products = productRepository.list()
    const featured = products.filter((p) => p.is_featured)
    const rest = products.filter((p) => !p.is_featured)
    return [...featured, ...rest].slice(0, limit)
  },

  async getRelated(product: Product, limit = 3): Promise<Product[]> {
    await mockDelay(180)
    const products = productRepository.list()
    const same = products.filter((p) => p.id !== product.id && p.category_id === product.category_id)
    const rest = products.filter((p) => p.id !== product.id && p.category_id !== product.category_id)
    return [...same, ...rest].slice(0, limit)
  },

  async getCategories(): Promise<ProductCategory[]> {
    await mockDelay(120)
    return CATEGORIES
  },

  async createProduct(draft: ProductDraft): Promise<Product> {
    await mockDelay(300)
    mockFail(0.02)
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

  async updateProduct(id: string, patch: Partial<ProductDraft>): Promise<Product | null> {
    await mockDelay(300)
    mockFail(0.02)
    const products = productRepository.update(id, patch)
    return products.find((p) => p.id === id) ?? null
  },

  async deleteProduct(id: string): Promise<void> {
    await mockDelay(260)
    mockFail(0.02)
    productRepository.remove(id)
  },

  async resetCatalog(): Promise<void> {
    await mockDelay(260)
    productRepository.reset()
  },
}
