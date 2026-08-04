import type { ProductCategoryId } from './product.type'

export type ShippingMethod = 'standard' | 'express'

export interface OrderLine {
  partNumber: string
  name: string
  price: number
  qty: number
  category: ProductCategoryId
  variantName?: string
}

export interface OrderRecord {
  orderNumber: string
  placedAt: string
  email: string
  customerName: string
  shippingMethod: ShippingMethod
  etaDays: number
  lines: OrderLine[]
  subtotal: number
  shipping: number
  total: number
}
