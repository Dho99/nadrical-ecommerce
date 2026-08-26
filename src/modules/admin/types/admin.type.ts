import type { ProductBadge, ProductCategoryId } from '../../../shared/types/product.type'

export interface SpecRowValues {
  spec_name: string
  spec_value: string
}

export interface VariantRowValues {
  id?: string
  variant_name: string
  price_delta: string
  stock: string
}

export interface ProductFormValues {
  name: string
  category_id: ProductCategoryId
  base_price: string
  stock: string
  cover_image_url: string
  badge: ProductBadge | ''
  is_featured: boolean
  summary: string
  specs: SpecRowValues[]
  variants: VariantRowValues[]
}

export interface AdminProductFilters {
  query?: string
  category_id?: ProductCategoryId | 'all'
  in_stock_only?: boolean
}
