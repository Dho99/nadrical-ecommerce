import api from '../../../shared/lib/api'
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

  totals(items: CartItem[], discount = 0): CartTotals {
    const subtotal = this.subtotal(items)
    const shipping_total = this.shipping(subtotal)
    const safeDiscount = Math.min(discount, subtotal)
    return {
      subtotal,
      shipping_total,
      discount: safeDiscount,
      grand_total: Math.max(0, subtotal - safeDiscount + shipping_total),
    }
  },

  totalQty(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.quantity, 0)
  },

  async apiAddToCart(productUUID: string, quantity: number, variantUUID?: string): Promise<void> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productUUID)
    if (!isUuid) return

    try {
      const validVariantUuid =
        variantUUID &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(variantUUID)
          ? variantUUID
          : undefined
      await api.post('/ecommerce/cart', {
        product_uuid: productUUID,
        quantity,
        ...(validVariantUuid ? { variant_uuid: validVariantUuid } : {}),
      })
    } catch {
      // Gracefully ignore if offline or guest
    }
  },

  async apiUpdateItem(itemUUID: string, quantity: number): Promise<void> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(itemUUID)
    if (!isUuid) return

    try {
      await api.put(`/ecommerce/cart/items/${itemUUID}`, { quantity })
    } catch {
      // ignore
    }
  },

  async apiRemoveItem(itemUUID: string): Promise<void> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(itemUUID)
    if (!isUuid) return

    try {
      await api.delete(`/ecommerce/cart/items/${itemUUID}`)
    } catch {
      // ignore
    }
  },

  async apiClearCart(): Promise<void> {
    try {
      await api.delete('/ecommerce/cart')
    } catch {
      // ignore
    }
  },
}
