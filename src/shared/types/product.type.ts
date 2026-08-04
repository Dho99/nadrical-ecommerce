export type ProductCategoryId =
  | 'electronics'
  | 'apparel'
  | 'home'
  | 'accessories'
  | 'outdoors'

export type ProductBadge = 'NEW' | 'SALE' | 'BEST SELLER'

export type ProductSort = 'featured' | 'price-asc' | 'price-desc' | 'stock'

export interface ProductSpec {
  label: string
  value: string
}

export interface ProductVariant {
  id: string
  name: string
  priceDelta: number
  stock: number
}

export interface Product {
  id: string
  partNumber: string
  name: string
  category: ProductCategoryId
  price: number
  stock: number
  imageUrl: string
  badge?: ProductBadge
  featured?: boolean
  summary: string
  specs: ProductSpec[]
  variants?: ProductVariant[]
}

export interface ProductFilters {
  category?: ProductCategoryId | 'all'
  query?: string
  sort?: ProductSort
  inStockOnly?: boolean
}

export interface ProductCategory {
  id: ProductCategoryId
  label: string
  tagline: string
}

export interface ProductBrief {
  id: string
  partNumber: string
  name: string
  price: number
  stock: number
  imageUrl: string
  category: ProductCategoryId
  variantId?: string
  variantName?: string
  variantStock?: number
}
