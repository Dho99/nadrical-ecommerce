import type { ProductCategoryId } from '../../../shared/types/product.type'
import type { ShippingMethod } from '../../../shared/types/order.type'

export type { ShippingMethod } from '../../../shared/types/order.type'

export interface CheckoutLine {
  partNumber: string
  name: string
  price: number
  qty: number
  category: ProductCategoryId
  variantName?: string
}

export interface OrderPayload {
  customer: {
    fullName: string
    email: string
    phone: string
    address: string
    city: string
    postalCode: string
  }
  shippingMethod: ShippingMethod
  payment: {
    cardName: string
    cardNumber: string
    expiry: string
    cvc: string
  }
  items: CheckoutLine[]
  totals: {
    subtotal: number
    shipping: number
    total: number
  }
}

export interface OrderConfirmation {
  orderNumber: string
  placedAt: Date
  email: string
  etaDays: number
  total: number
}

export const SHIPPING_METHODS: Array<{
  id: ShippingMethod
  label: string
  price: number
  eta: string
}> = [
  { id: 'standard', label: 'Standard', price: 8, eta: '3–5 working days' },
  { id: 'express', label: 'Express', price: 16, eta: 'Next working day' },
]
