import type { ShippingMethod } from '../types/checkout.type'
import { SHIPPING_METHODS } from '../types/checkout.type'

export const FREE_SHIPPING_THRESHOLD = 75

export interface ShippingQuote {
  method: ShippingMethod
  cost: number
  free: boolean
}

export const shippingService = {
  getMethods() {
    return SHIPPING_METHODS
  },

  getMethod(id: ShippingMethod) {
    return SHIPPING_METHODS.find((m) => m.id === id) ?? SHIPPING_METHODS[0]
  },

  quote(id: ShippingMethod, subtotal: number): ShippingQuote {
    const method = this.getMethod(id)
    const free = id === 'standard' && subtotal >= FREE_SHIPPING_THRESHOLD
    return { method: id, cost: free ? 0 : method.price, free }
  },

  etaDays(id: ShippingMethod): number {
    return this.getMethod(id).etaDays
  },
}
