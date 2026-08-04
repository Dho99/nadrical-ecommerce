import type { ProductCategoryId } from '../../../shared/types/product.type'

export interface CartItem {
  productId: string
  partNumber: string
  name: string
  price: number
  qty: number
  stock: number
  imageUrl: string
  category: ProductCategoryId
  variantId?: string
  variantName?: string
}

export interface CartTotals {
  subtotal: number
  shipping: number
  total: number
}
