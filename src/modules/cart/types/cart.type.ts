import type { ProductCategoryId } from '../../../shared/types/product.type'

export interface CartItem {
  cart_item_id?: string
  product_id: string
  sku: string
  product_name: string
  unit_price: number
  quantity: number
  stock: number
  cover_image_url: string
  category_id: ProductCategoryId
  variant_id?: string
  variant_name?: string
  is_preorder?: boolean
}

export interface CartTotals {
  subtotal: number
  shipping_total: number
  discount: number
  grand_total: number
  voucher_code?: string
}
