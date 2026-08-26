import { productService } from '../../products/services/product.service'
import type { ProductDraft } from '../../products/services/product.service'
import type { CursorPage } from '../../../shared/types/common.type'
import type { Product, ProductFilters } from '../../../shared/types/product.type'
import type { AdminProductFilters, ProductFormValues } from '../types/admin.type'

export function formToDraft(values: ProductFormValues): ProductDraft {
  const specs = values.specs
    .filter((s) => s.spec_name.trim() && s.spec_value.trim())
    .map((s) => ({ spec_name: s.spec_name.trim(), spec_value: s.spec_value.trim() }))
  const variants = values.variants
    .filter((v) => v.variant_name.trim())
    .map((v) => ({
      id: v.id?.trim() || `var-${Math.random().toString(36).slice(2, 10)}`,
      variant_name: v.variant_name.trim(),
      price_delta: Number(v.price_delta) || 0,
      stock: Number(v.stock) || 0,
    }))
  return {
    name: values.name,
    category_id: values.category_id,
    base_price: Number(values.base_price),
    stock: Number(values.stock),
    cover_image_url: values.cover_image_url,
    badge: values.badge || undefined,
    is_featured: values.is_featured,
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
      category_id: filters.category_id ?? 'all',
      query: filters.query ?? '',
      in_stock_only: filters.in_stock_only,
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