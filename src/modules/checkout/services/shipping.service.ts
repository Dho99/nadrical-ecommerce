import type { ShippingMethod } from '../types/checkout.type'
import { SHIPPING_METHODS } from '../types/checkout.type'
import type { GatewayShippingMethod } from './order.repository'
import { etaDaysFromEtd, gatewayShippingCost } from '../utils/gateway'

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

  quote(id: ShippingMethod, _subtotal: number): ShippingQuote {
    void _subtotal
    const method = this.getMethod(id)
    return { method: id, cost: method.price, free: method.price === 0 }
  },

  quoteGateway(method: GatewayShippingMethod | null | undefined): ShippingQuote {
    const cost = gatewayShippingCost(method)
    return { method: method?.uuid ?? 'standard', cost, free: cost === 0 }
  },

  etaDays(id: ShippingMethod): number {
    return this.getMethod(id).etaDays
  },

  gatewayEtaDays(method: GatewayShippingMethod | null | undefined): number {
    return etaDaysFromEtd(method?.etd)
  },
}
