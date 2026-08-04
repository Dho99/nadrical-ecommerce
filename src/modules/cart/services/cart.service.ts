import type { CartItem, CartTotals } from '../types/cart.type'

export const FREE_SHIPPING_THRESHOLD = 75
export const SHIPPING_FLAT = 8

export const cartService = {
  subtotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.price * item.qty, 0)
  },

  shipping(subtotal: number): number {
    if (subtotal === 0) return 0
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT
  },

  totals(items: CartItem[]): CartTotals {
    const subtotal = this.subtotal(items)
    const shipping = this.shipping(subtotal)
    return { subtotal, shipping, total: subtotal + shipping }
  },

  totalQty(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.qty, 0)
  },
}
