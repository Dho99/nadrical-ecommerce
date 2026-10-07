import api, { getErrorMessage, unwrapData } from '../../../shared/lib/api'
import type { CartItem, CartTotals } from '../types/cart.type'

export const FREE_SHIPPING_THRESHOLD = 75
export const SHIPPING_FLAT = 8

interface BackendCartItem {
  uuid: string
  product_uuid: string
  variant_uuid?: string | null
  quantity: number
  unit_price_snapshot: number
  compare_price_snapshot?: number | null
  is_selected?: boolean
  product?: {
    uuid?: string
    sku?: string | null
    name?: string
    image?: string
    cover_image_url?: string
    stock?: number
    category_uuid?: string
    category?: { slug?: string; name?: string }
  } | null
  variant?: { uuid?: string; variant_name?: string; stock?: number; price_delta?: number } | null
}

interface BackendCartResponse {
  cart?: {
    uuid: string
    account_uuid: string
    items?: BackendCartItem[]
  }
  total_items?: number
  subtotal?: number
}

function mapCartItem(raw: BackendCartItem): CartItem {
  const p = raw.product
  const v = raw.variant
  return {
    cart_item_id: raw.uuid,
    product_id: raw.product_uuid,
    sku: p?.sku || raw.product_uuid,
    product_name: p?.name || raw.product_uuid,
    unit_price: Number(raw.unit_price_snapshot ?? 0),
    quantity: Number(raw.quantity ?? 1),
    stock: Number(p?.stock ?? v?.stock ?? 99),
    cover_image_url: p?.image || (p as unknown as { cover_image_url?: string })?.cover_image_url || '',
    category_id: (p?.category?.slug as CartItem['category_id']) || 'electronics',
    variant_id: raw.variant_uuid || v?.uuid || undefined,
    variant_name: v?.variant_name || undefined,
  }
}

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

  async fetchCart(): Promise<CartItem[]> {
    const res = await api.get<{ success: boolean; data?: BackendCartResponse; message?: string }>('/ecommerce/cart')
    const data = unwrapData<BackendCartResponse>(res.data as unknown as { data?: BackendCartResponse; success: boolean; message: string }) ?? (res.data as unknown as { data?: BackendCartResponse })?.data
    const items = data?.cart?.items ?? []
    return Array.isArray(items) ? items.map(mapCartItem) : []
  },

  async apiAddToCart(productUUID: string, quantity: number, variantUUID?: string): Promise<void> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productUUID)
    if (!isUuid) throw new Error('Product UUID invalid')
    const validVariantUuid =
      variantUUID && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(variantUUID)
        ? variantUUID
        : undefined
    try {
      await api.post('/ecommerce/cart', {
        product_uuid: productUUID,
        quantity,
        ...(validVariantUuid ? { variant_uuid: validVariantUuid } : {}),
      })
    } catch (e) {
      throw new Error(getErrorMessage(e, 'Gagal menambah keranjang'), { cause: e })
    }
  },

  async apiUpdateItem(itemUUID: string, quantity: number): Promise<void> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(itemUUID)
    if (!isUuid) throw new Error('Cart item UUID invalid')
    try {
      await api.put(`/ecommerce/cart/items/${itemUUID}`, { quantity })
    } catch (e) {
      throw new Error(getErrorMessage(e, 'Gagal update keranjang'), { cause: e })
    }
  },

  async apiRemoveItem(itemUUID: string): Promise<void> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(itemUUID)
    if (!isUuid) throw new Error('Cart item UUID invalid')
    try {
      await api.delete(`/ecommerce/cart/items/${itemUUID}`)
    } catch (e) {
      throw new Error(getErrorMessage(e, 'Gagal hapus item'), { cause: e })
    }
  },

  async apiClearCart(): Promise<void> {
    try {
      await api.delete('/ecommerce/cart')
    } catch (e) {
      throw new Error(getErrorMessage(e, 'Gagal kosongkan keranjang'), { cause: e })
    }
  },
}
