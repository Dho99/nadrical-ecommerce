export type ProductCategoryId = string

export type ProductBadge = 'NEW' | 'SALE' | 'BEST SELLER'

export type ProductSort = 'featured' | 'featured-only' | 'price-asc' | 'price-desc' | 'stock'

export interface ProductSpec {
  spec_name: string
  spec_value: string
}

export interface ProductVariant {
  id: string
  variant_name: string
  price_delta: number
  stock: number
}

export interface Product {
  id: string
  sku: string
  name: string
  slug?: string
  description?: string
  category_id: ProductCategoryId
  category_name?: string
  base_price: number
  original_price?: number
  stock: number
  cover_image_url: string
  images?: string[]
  badge?: ProductBadge
  is_featured?: boolean
  is_preorder?: boolean
  preorder_eta?: string
  preorder_deposit?: number
  summary: string
  specs: ProductSpec[]
  variants?: ProductVariant[]
  rating: number
  review_count: number
  discount_percent?: number
  rating_count?: number
}

export interface ProductFilters {
  category_id?: ProductCategoryId | 'all'
  query?: string
  sort?: ProductSort
  in_stock_only?: boolean
  min_price?: number
  max_price?: number
  specs?: Record<string, string[]>
  discount_only?: boolean
  limit?: number
  page?: number
}

export interface ProductCategory {
  id: ProductCategoryId
  label: string
  tagline: string
}

export interface ProductBrief extends Product {
  variant_id?: string
  variant_name?: string
  variant_stock?: number
}
