import type { CartItem, CartTotals } from '../types/cart.type'

export const FREE_SHIPPING_THRESHOLD = 75
export const SHIPPING_FLAT = 8

export const cartService = {
  subtotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  },

  shipping(subtotal: number): number {
    if (subtotal === 0) return 0
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT
  },

  totals(items: CartItem[]): CartTotals {
    const subtotal = this.subtotal(items)
    const shipping_total = this.shipping(subtotal)
    return { subtotal, shipping_total, grand_total: subtotal + shipping_total }
  },

  totalQty(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.quantity, 0)
  },
}
