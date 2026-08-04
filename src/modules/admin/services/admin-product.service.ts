import { productService } from '../../products/services/product.service'
import type { ProductDraft } from '../../products/services/product.service'
import type { CursorPage } from '../../../shared/types/common.type'
import type { Product, ProductFilters } from '../../../shared/types/product.type'
import type { AdminProductFilters, ProductFormValues } from '../types/admin.type'

export function formToDraft(values: ProductFormValues): ProductDraft {
  const specs = values.specs
    .filter((s) => s.label.trim() && s.value.trim())
    .map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
  const variants = values.variants
    .filter((v) => v.name.trim())
    .map((v) => ({
      id: v.id?.trim() || `var-${Math.random().toString(36).slice(2, 10)}`,
      name: v.name.trim(),
      priceDelta: Number(v.priceDelta) || 0,
      stock: Number(v.stock) || 0,
    }))
  return {
    name: values.name,
    category: values.category,
    price: Number(values.price),
    stock: Number(values.stock),
    imageUrl: values.imageUrl,
    badge: values.badge || undefined,
    featured: values.featured,
    summary: values.summary,
    specs,
    ...(variants.length > 0 ? { variants } : {}),
  }
}

export const adminProductService = {
  async listProducts(
    filters: AdminProductFilters = {},
    cursor: number | null = null,
    limit = 10,
  ): Promise<CursorPage<Product>> {
    const productFilters: ProductFilters = {
      category: filters.category ?? 'all',
      query: filters.query ?? '',
      inStockOnly: filters.inStockOnly,
      sort: 'featured',
    }
    return productService.getProductPage(productFilters, cursor, limit)
  },

  async getProduct(id: string): Promise<Product | null> {
    return productService.getProductById(id)
  },

  async createProduct(values: ProductFormValues): Promise<Product> {
    return productService.createProduct(formToDraft(values))
  },

  async updateProduct(id: string, values: ProductFormValues): Promise<Product | null> {
    return productService.updateProduct(id, formToDraft(values))
  },

  async deleteProduct(id: string): Promise<void> {
    return productService.deleteProduct(id)
  },

  async resetCatalog(): Promise<void> {
    return productService.resetCatalog()
  },
}