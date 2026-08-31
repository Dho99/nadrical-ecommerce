import { api, getAuthToken } from '../../../shared/lib/api'
import type { CartItem, CartTotals } from '../types/cart.type'

export const FREE_SHIPPING_THRESHOLD = 75
export const SHIPPING_FLAT = 8

function toCartItem(item: ApiCartItem): CartItem {
  return {
    id: item.uuid,
    product_id: item.product_uuid,
    quantity: item.quantity,
    unit_price: Number(item.total_price),
  }
}

interface ApiCartItem {
  uuid: string
  product_uuid: string
  quantity: number
  total_price: string
}

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

  async getCart(): Promise<CartItem[]> {
    const data = await api.get<{ items: ApiCartItem[] }>('/ecommerce/cart')
    return data.items.map(toCartItem)
  },

  async addToCart(productId: string, quantity: number, _specs?: string[]): Promise<CartItem> {
    const data = await api.post<{ item: ApiCartItem }>('/ecommerce/cart', {
      product_uuid: productId,
      quantity,
    })
    return toCartItem(data.item)
  },

  async updateCartItem(id: string, quantity: number): Promise<CartItem> {
    const data = await api.put<{ item: ApiCartItem }>(`/ecommerce/cart/items/${id}`, { quantity })
    return toCartItem(data.item)
  },

  async removeFromCart(id: string): Promise<void> {
    await api.delete(`/ecommerce/cart/items/${id}`)
  },

  async clearCart(): Promise<void> {
    await api.delete('/ecommerce/cart')
  },
}