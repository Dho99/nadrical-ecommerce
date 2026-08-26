export type ProductCategoryId =
  | 'electronics'
  | 'apparel'
  | 'home'
  | 'accessories'
  | 'outdoors'

export type ProductBadge = 'NEW' | 'SALE' | 'BEST SELLER'

export type ProductSort = 'featured' | 'price-asc' | 'price-desc' | 'stock'

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
  category_id: ProductCategoryId
  base_price: number
  stock: number
  cover_image_url: string
  badge?: ProductBadge
  is_featured?: boolean
  summary: string
  specs: ProductSpec[]
  variants?: ProductVariant[]
}

export interface ProductFilters {
  category_id?: ProductCategoryId | 'all'
  query?: string
  sort?: ProductSort
  in_stock_only?: boolean
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
