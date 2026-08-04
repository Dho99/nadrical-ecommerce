import type { ProductBadge, ProductCategoryId, ProductSpec } from '../../../shared/types/product.type'

export interface SpecRowValues {
  label: string
  value: string
}

export interface VariantRowValues {
  id?: string
  name: string
  priceDelta: string
  stock: string
}

export interface ProductFormValues {
  name: string
  category: ProductCategoryId
  price: string
  stock: string
  imageUrl: string
  badge: ProductBadge | ''
  featured: boolean
  summary: string
  specs: SpecRowValues[]
  variants: VariantRowValues[]
}

export interface AdminProductFilters {
  query?: string
  category?: ProductCategoryId | 'all'
  inStockOnly?: boolean
}

export type { ProductSpec }