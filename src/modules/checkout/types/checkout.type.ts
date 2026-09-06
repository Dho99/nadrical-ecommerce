import type { ShippingMethod } from '../../../shared/types/order.type'

export type { ShippingMethod } from '../../../shared/types/order.type'

export type PaymentKind = 'bank' | 'e-money' | 'card'

export interface CheckoutLine {
  product_id: string
  sku: string
  product_name: string
  unit_price: number
  quantity: number
  category_id: string
  variant_id?: string
  variant_name?: string
}

export interface PaymentDetail {
  kind: PaymentKind
  provider?: string
  card_name?: string
  card_number?: string
  expiry?: string
  cvc?: string
}

export interface OrderPayload {
  customer: {
    recipient_name: string
    email: string
    recipient_phone: string
    shipping_address_line_1: string
    shipping_address_line_2?: string
    shipping_city: string
    shipping_province?: string
    shipping_postal_code: string
    shipping_country_code?: string
  }
  shipping_method: ShippingMethod
  payment: PaymentDetail
  items: CheckoutLine[]
  totals: {
    subtotal: number
    shipping_total: number
    discount: number
    payment_fee?: number
    grand_total: number
    voucher_code?: string
  }
  voucher_code?: string
}

export interface OrderConfirmation {
  order_number: string
  placed_at: Date
  email: string
  eta_days: number
  grand_total: number
}

export const SHIPPING_METHODS: Array<{
  id: ShippingMethod
  label: string
  price: number
  eta: string
  etaDays: number
}> = [
  { id: 'standard', label: 'Standard', price: 8, eta: '3–5 working days', etaDays: 4 },
  { id: 'express', label: 'Express', price: 16, eta: 'Next working day', etaDays: 1 },
  { id: 'jne', label: 'JNE REG', price: 1.2, eta: '2–3 days', etaDays: 3 },
  { id: 'jnt', label: 'J&T Express', price: 1.5, eta: '1–2 days', etaDays: 2 },
  { id: 'sicepat', label: 'SiCepat', price: 1.8, eta: '1 day', etaDays: 1 },
]
